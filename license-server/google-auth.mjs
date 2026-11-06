import { verifyGoogleIdToken } from "./google-id-token.mjs";
import { hash, random, equal, fail } from "./security.mjs";

const cookieName = "nexaflow_google";
function sessionCookie(value, allowHttp, maxAge) {
  return cookieName + "=" + value +
    "; HttpOnly; SameSite=Strict; Path=/api/licensing/google; Max-Age=" + maxAge +
    (allowHttp ? "" : "; Secure");
}
function readSession(db, req, clock) {
  const sid = (req.headers.cookie || "").split(";").map((s) => s.trim())
    .find((s) => s.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
  const row = sid && db.prepare(
    "SELECT * FROM google_sessions WHERE id_hash=? AND expires_at>?",
  ).get(hash(sid), clock());
  if (!row) fail("google-login-required", 401);
  return { sid, row };
}
export function createGoogleAuth(db, config) {
  db.exec(`CREATE TABLE IF NOT EXISTS google_sessions (
    id_hash TEXT PRIMARY KEY, google_sub TEXT NOT NULL, email TEXT NOT NULL,
    csrf TEXT NOT NULL, expires_at INTEGER NOT NULL
  )`);
  const verifier = config.googleVerifier || verifyGoogleIdToken;
  return {
    async handle(endpoint, req, input, ip, origin, clock, rate) {
      let response, headers = {}, status = 200;
      if (endpoint === "/google/login" && req.method === "POST") {
        if (!config.googleClientId) fail("google-login-not-configured", 503);
        if (req.headers.origin !== origin) fail("csrf-rejected", 403);
        rate("google-login:" + ip, 10, 900);
        if (typeof input.idToken !== "string" || input.idToken.length > 16384)
          fail("invalid-google-id-token", 401);
        const identity = await verifier(input.idToken, {
          audience: config.googleClientId, now: () => clock() * 1000,
        });
        if (!identity?.emailVerified || typeof identity.googleSub !== "string" ||
            !identity.googleSub || typeof identity.email !== "string" || !identity.email)
          fail("invalid-google-id-token", 401);
        const sid = random(), csrf = random(), expiresAt = clock() + 3600;
        db.prepare("INSERT INTO google_sessions VALUES (?,?,?,?,?)").run(
          hash(sid), identity.googleSub, identity.email, csrf, expiresAt,
        );
        headers["set-cookie"] = sessionCookie(sid, config.allowHttp, 3600);
        response = { email: identity.email, csrf, expiresAt };
      } else if (endpoint === "/google/me" && req.method === "GET") {
        const { row } = readSession(db, req, clock);
        response = { email: row.email, csrf: row.csrf, expiresAt: row.expires_at };
      } else if (endpoint === "/google/logout" && req.method === "POST") {
        if (req.headers.origin !== origin) fail("csrf-rejected", 403);
        const { sid, row } = readSession(db, req, clock);
        if (!equal(req.headers["x-csrf-token"] || "", row.csrf))
          fail("csrf-rejected", 403);
        db.prepare("DELETE FROM google_sessions WHERE id_hash=?").run(hash(sid));
        headers["set-cookie"] = sessionCookie("", config.allowHttp, 0);
        response = { ok: true };
      } else fail("not-found", 404);
      return { status, response, headers };
    },
  };
}
