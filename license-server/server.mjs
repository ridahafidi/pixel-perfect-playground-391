import { createServer } from "node:http";
import { createHmac, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openStore, transaction, issueLicense, publicLicense, audit } from "./store.mjs";
import {
  hash,
  random,
  equal,
  fail,
  passwordMatches,
  normalizeEmail,
  verifyProof,
  signJwt,
  verifyJwt,
} from "./security.mjs";
const cookieName = "nexaflow_admin";
export function createLicenseServer(config) {
  if (
    !config.jwtSecret ||
    config.jwtSecret.length < 48 ||
    !config.adminEmail ||
    !config.adminPasswordHash ||
    !config.origin
  )
    throw new Error(
      "Configure JWT secret (48+ chars), admin email/password hash, and website origin",
    );
  const origin = new URL(config.origin).origin;
  if (!config.allowHttp && !origin.startsWith("https://"))
    throw new Error("HTTPS is required outside local development");
  if (config.database !== ":memory:")
    mkdirSync(dirname(resolve(config.database)), { recursive: true, mode: 0o700 });
  const db = openStore(config.database);
  const clock = config.clock || (() => Math.floor(Date.now() / 1000));
  function rate(bucket, limit, seconds) {
    const now = clock();
    db.prepare(
      `INSERT INTO rate_limits VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=CASE WHEN reset_at<=? THEN 1 ELSE hits+1 END, reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END`,
    ).run(bucket, now + seconds, now, now);
    if (db.prepare("SELECT hits FROM rate_limits WHERE bucket=?").get(bucket).hits > limit)
      fail("too-many-attempts", 429);
  }
  function cleanup() {
    for (const table of ["sessions", "admin_sessions", "challenges"])
      db.prepare(`DELETE FROM ${table} WHERE expires_at<=?`).run(clock());
    db.prepare("DELETE FROM rate_limits WHERE reset_at<=?").run(clock());
  }
  function admin(req, write = false) {
    const value = (req.headers.cookie || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(cookieName + "="))
      ?.slice(cookieName.length + 1);
    const row =
      value &&
      db
        .prepare("SELECT * FROM admin_sessions WHERE id_hash=? AND expires_at>?")
        .get(hash(value), clock());
    if (!row) fail("admin-login-required", 401);
    if (
      write &&
      (!equal(req.headers["x-csrf-token"] || "", row.csrf) || req.headers.origin !== origin)
    )
      fail("csrf-rejected", 403);
    return row;
  }
  function activeLicense(row) {
    if (!row || row.status !== "ACTIVE" || (row.expires_at !== null && row.expires_at <= clock()))
      fail("license-inactive", 403);
    return row;
  }
  function proof(input, action) {
    const row = db
      .prepare("SELECT * FROM challenges WHERE id=?")
      .get(String(input.challengeId || ""));
    if (
      !row ||
      row.expires_at <= clock() ||
      typeof input.nonce !== "string" ||
      !equal(row.nonce_hash, hash(input.nonce))
    )
      fail("challenge-expired-or-used", 401);
    verifyProof({ id: row.id, nonce: input.nonce }, action, input);
    db.prepare("DELETE FROM challenges WHERE id=?").run(row.id);
  }
  function issueSession(row) {
    const now = clock(),
      jti = randomUUID(),
      exp = Math.min(now + 900, row.expires_at || now + 900);
    db.prepare("INSERT INTO sessions VALUES (?,?,?)").run(hash(jti), row.id, exp);
    return {
      token: signJwt(
        {
          iss: "nexaflow-license",
          aud: "nexaflow-desktop",
          sub: row.id,
          jti,
          email: row.email,
          machine: row.machine_hash,
          device: hash(row.public_key),
          ver: row.version,
          iat: now,
          exp,
        },
        config.jwtSecret,
      ),
      expiresAt: exp,
      email: row.email,
      licenseId: row.id,
    };
  }
  async function handle(req, res) {
    let status = 200,
      response,
      headers = {};
    try {
      cleanup();
      const url = new URL(req.url, "http://localhost"),
        route = url.pathname;
      const ip = req.socket.remoteAddress || "unknown";
      rate("requests:" + ip, 300, 60);
      if (!route.startsWith("/api/licensing/")) fail("not-found", 404);
      if (req.method === "OPTIONS") fail("cross-origin-not-supported", 403);
      const chunks = [];
      let byteLength = 0;
      for await (const chunk of req) {
        byteLength += chunk.length;
        if (byteLength > 16384) fail("request-too-large", 413);
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      let input = {};
      if (raw) {
        try {
          input = JSON.parse(raw);
        } catch {
          fail("invalid-json");
        }
        if (!input || Array.isArray(input) || typeof input !== "object") fail("invalid-json");
      }
      const endpoint = route.slice("/api/licensing".length);
      if (endpoint === "/health" && req.method === "GET") response = { ok: true };
      else if (endpoint === "/admin/login" && req.method === "POST") {
        if (req.headers.origin !== origin) fail("csrf-rejected", 403);
        rate("admin-login:" + ip, 10, 900);
        if (
          typeof input.password !== "string" ||
          input.password.length > 1024 ||
          normalizeEmail(input.email) !== normalizeEmail(config.adminEmail) ||
          !passwordMatches(input.password, config.adminPasswordHash)
        )
          fail("invalid-credentials", 401);
        const session = random(),
          csrf = random();
        db.prepare("INSERT INTO admin_sessions VALUES (?,?,?)").run(
          hash(session),
          csrf,
          clock() + 28800,
        );
        headers["set-cookie"] =
          `${cookieName}=${session}; HttpOnly; SameSite=Strict; Path=/api/licensing; Max-Age=28800${config.allowHttp ? "" : "; Secure"}`;
        response = { email: config.adminEmail, csrf };
      } else if (endpoint === "/admin/me" && req.method === "GET") {
        const session = admin(req);
        response = { email: config.adminEmail, csrf: session.csrf };
      } else if (endpoint === "/admin/logout" && req.method === "POST") {
        const session = admin(req, true);
        db.prepare("DELETE FROM admin_sessions WHERE id_hash=?").run(session.id_hash);
        headers["set-cookie"] =
          `${cookieName}=; HttpOnly; SameSite=Strict; Path=/api/licensing; Max-Age=0${config.allowHttp ? "" : "; Secure"}`;
        response = { ok: true };
      } else if (endpoint === "/admin/licenses" && req.method === "GET") {
        admin(req);
        response = {
          licenses: db
            .prepare("SELECT * FROM licenses ORDER BY created_at DESC LIMIT 1000")
            .all()
            .map(publicLicense),
        };
      } else if (endpoint === "/admin/licenses" && req.method === "POST") {
        admin(req, true);
        response = transaction(db, () => issueLicense(db, input, clock(), config.adminEmail));
        status = 201;
      } else if (
        /^\/admin\/licenses\/[^/]+\/(revoke|reset|rotate)$/.test(endpoint) &&
        req.method === "POST"
      ) {
        admin(req, true);
        const [, , , id, action] = endpoint.split("/");
        response = transaction(db, () => {
          const row = db.prepare("SELECT * FROM licenses WHERE id=?").get(id);
          if (!row) fail("not-found", 404);
          let key;
          if (action === "revoke")
            db.prepare("UPDATE licenses SET status='REVOKED',version=version+1 WHERE id=?").run(id);
          if (action === "reset")
            db.prepare(
              "UPDATE licenses SET machine_hash=NULL,public_key=NULL,activated_at=NULL,version=version+1 WHERE id=?",
            ).run(id);
          if (action === "rotate") {
            key = `NXF-${random()}`;
            db.prepare(
              "UPDATE licenses SET key_hash=?,key_hint=?,version=version+1 WHERE id=?",
            ).run(hash(key), key.slice(-6), id);
          }
          db.prepare("DELETE FROM sessions WHERE license_id=?").run(id);
          audit(db, "license-" + action, id, config.adminEmail, clock());
          return {
            license: publicLicense(db.prepare("SELECT * FROM licenses WHERE id=?").get(id)),
            ...(key ? { key } : {}),
          };
        });
      } else if (endpoint === "/challenge" && req.method === "POST") {
        rate("challenge:" + ip, 60, 60);
        const id = randomUUID(),
          nonce = random();
        db.prepare("INSERT INTO challenges VALUES (?,?,?)").run(id, hash(nonce), clock() + 120);
        response = { id, nonce, expiresAt: clock() + 120 };
      } else if (endpoint === "/activate" && req.method === "POST") {
        rate("activate:" + ip, 20, 900);
        response = transaction(db, () => {
          proof(input, "activate");
          const row = db
            .prepare("SELECT * FROM licenses WHERE email=? AND key_hash=?")
            .get(normalizeEmail(input.email), hash(String(input.key || "")));
          if (!row) fail("invalid-email-or-key", 401);
          activeLicense(row);
          if (
            row.machine_hash &&
            (row.machine_hash !== input.machineHash || row.public_key !== input.publicKey)
          )
            fail("license-bound-to-another-machine", 409);
          db.prepare(
            "UPDATE licenses SET machine_hash=?,public_key=?,activated_at=COALESCE(activated_at,?),last_seen_at=? WHERE id=?",
          ).run(input.machineHash, input.publicKey, clock(), clock(), row.id);
          audit(db, "license-activated", row.id, row.email, clock());
          return issueSession(db.prepare("SELECT * FROM licenses WHERE id=?").get(row.id));
        });
      } else if (endpoint === "/session" && req.method === "POST") {
        const token = (req.headers.authorization || "").replace(/^Bearer /, "");
        response = transaction(db, () => {
          const claims = verifyJwt(token, config.jwtSecret, clock());
          const row = activeLicense(
            db.prepare("SELECT * FROM licenses WHERE id=?").get(claims.sub),
          );
          if (
            !db
              .prepare("SELECT jti FROM sessions WHERE jti=? AND license_id=? AND expires_at>?")
              .get(hash(claims.jti), row.id, clock()) ||
            row.version !== claims.ver ||
            row.email !== claims.email ||
            row.machine_hash !== claims.machine ||
            hash(row.public_key || "") !== claims.device ||
            row.machine_hash !== input.machineHash ||
            row.public_key !== input.publicKey ||
            row.email !== normalizeEmail(input.email)
          )
            fail("invalid-session", 401);
          proof(input, "session");
          db.prepare("UPDATE licenses SET last_seen_at=? WHERE id=?").run(clock(), row.id);
          db.prepare("DELETE FROM sessions WHERE jti=?").run(hash(claims.jti));
          response = issueSession(row);
          return response;
        });
      } else if (endpoint === "/purchases" && req.method === "POST") {
        const timestamp = req.headers["x-nexaflow-timestamp"],
          signature = req.headers["x-nexaflow-signature"];
        if (!config.purchaseSecret || config.purchaseSecret.length < 48)
          fail("purchase-integration-not-configured", 503);
        if (
          typeof timestamp !== "string" ||
          !/^\d+$/.test(timestamp) ||
          Math.abs(clock() - Number(timestamp)) > 300 ||
          typeof signature !== "string" ||
          !equal(
            signature,
            createHmac("sha256", config.purchaseSecret)
              .update(timestamp + "." + raw)
              .digest("hex"),
          )
        )
          fail("invalid-purchase-signature", 401);
        if (
          typeof input.eventId !== "string" ||
          input.eventId.length > 200 ||
          !input.eventId ||
          typeof input.orderId !== "string" ||
          !input.orderId ||
          input.orderId.length > 200 ||
          !["paid", "refunded"].includes(input.type)
        )
          fail("invalid-purchase-event");
        response = transaction(db, () => {
          const event = db
            .prepare("SELECT * FROM purchase_events WHERE event_id=?")
            .get(input.eventId);
          if (event) {
            if (event.order_id !== input.orderId) fail("event-conflict", 409);
            return { duplicate: true, licenseId: event.license_id };
          }
          const existing = db.prepare("SELECT * FROM licenses WHERE order_id=?").get(input.orderId);
          if (input.type === "refunded") {
            if (!existing) fail("order-not-found", 404);
            db.prepare("UPDATE licenses SET status='REVOKED',version=version+1 WHERE id=?").run(
              existing.id,
            );
            db.prepare("DELETE FROM sessions WHERE license_id=?").run(existing.id);
            audit(db, "purchase-refunded", existing.id, "payment-adapter", clock());
            db.prepare("INSERT INTO purchase_events VALUES (?,?,?)").run(
              input.eventId,
              input.orderId,
              existing.id,
            );
            return { licenseId: existing.id, revoked: true };
          }
          const issued = existing
            ? { license: publicLicense(existing), duplicate: true }
            : issueLicense(
                db,
                { email: input.email, customer: input.customer, orderId: input.orderId },
                clock(),
                "payment-adapter",
              );
          db.prepare("INSERT INTO purchase_events VALUES (?,?,?)").run(
            input.eventId,
            input.orderId,
            issued.license.id,
          );
          return issued;
        });
      } else fail("not-found", 404);
    } catch (error) {
      status = error.status || 500;
      response = { error: status === 500 ? "server-error" : error.message };
      if (status === 500) console.error("License request failed", error.code || error.name);
    }
    res.writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    });
    res.end(JSON.stringify(response));
  }
  const server = createServer((req, res) => {
    handle(req, res).catch(() => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });
  server.on("close", () => db.close());
  return { server, db };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { server } = createLicenseServer({
    database: process.env.LICENSE_DATABASE || "./data/licenses.sqlite",
    origin: process.env.LICENSE_WEBSITE_ORIGIN,
    jwtSecret: process.env.LICENSE_JWT_SECRET,
    adminEmail: process.env.LICENSE_ADMIN_EMAIL,
    adminPasswordHash: process.env.LICENSE_ADMIN_PASSWORD_HASH,
    purchaseSecret: process.env.LICENSE_PURCHASE_SECRET,
    allowHttp: process.env.LICENSE_LOCAL_HTTP === "1",
  });
  server.listen(
    Number(process.env.LICENSE_PORT || 3434),
    process.env.LICENSE_HOST || "127.0.0.1",
    () => console.log("License service listening"),
  );
}
