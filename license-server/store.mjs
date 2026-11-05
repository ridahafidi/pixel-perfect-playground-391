import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { hash, random, normalizeEmail, fail } from "./security.mjs";
export function openStore(filename) {
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, customer TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE, key_hint TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'ACTIVE',
      machine_hash TEXT, public_key TEXT, version INTEGER NOT NULL DEFAULT 0,
      order_id TEXT UNIQUE, expires_at INTEGER, created_at INTEGER NOT NULL, activated_at INTEGER, last_seen_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS sessions (jti TEXT PRIMARY KEY, license_id TEXT NOT NULL REFERENCES licenses(id), expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS admin_sessions (id_hash TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS challenges (id TEXT PRIMARY KEY, nonce_hash TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS purchase_events (event_id TEXT PRIMARY KEY, order_id TEXT NOT NULL, license_id TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS rate_limits (bucket TEXT PRIMARY KEY, hits INTEGER NOT NULL, reset_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (id TEXT PRIMARY KEY, action TEXT NOT NULL, license_id TEXT, actor TEXT NOT NULL, created_at INTEGER NOT NULL);
  `);
  return db;
}
export function transaction(db, fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const value = fn();
    db.exec("COMMIT");
    return value;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export function audit(db, action, licenseId, actor, now) {
  db.prepare("INSERT INTO audit VALUES (?,?,?,?,?)").run(
    randomUUID(),
    action,
    licenseId,
    actor,
    now,
  );
}
export function publicLicense(row) {
  const { key_hash, public_key, ...safe } = row;
  return { ...safe, activated: !!row.machine_hash };
}
export function issueLicense(db, input, now, actor) {
  const email = normalizeEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fail("invalid-email");
  const customer = String(input.customer || "").trim();
  if (!customer || customer.length > 200) fail("invalid-customer");
  const expires = input.expiresAt == null ? null : Number(input.expiresAt);
  if (expires !== null && (!Number.isInteger(expires) || expires <= now)) fail("invalid-expiry");
  if (db.prepare("SELECT id FROM licenses WHERE email=?").get(email))
    fail("email-already-licensed", 409);
  const key =
    typeof input.key === "string" && input.key.trim() ? input.key.trim() : `NXF-${random()}`;
  if (key.length < 24 || key.length > 256) fail("key-must-be-at-least-24-characters");
  if (db.prepare("SELECT id FROM licenses WHERE key_hash=?").get(hash(key)))
    fail("key-already-used", 409);
  const id = randomUUID();
  db.prepare(
    "INSERT INTO licenses (id,email,customer,key_hash,key_hint,order_id,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?)",
  ).run(id, email, customer, hash(key), key.slice(-6), input.orderId || null, expires, now);
  audit(db, "license-created", id, actor, now);
  return { license: publicLicense(db.prepare("SELECT * FROM licenses WHERE id=?").get(id)), key };
}
