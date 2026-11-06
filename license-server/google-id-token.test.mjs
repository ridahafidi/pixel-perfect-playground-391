import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { verifyGoogleIdToken } from "./google-id-token.mjs";

const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "test-key", use: "sig", alg: "RS256" };
const now = 1800000000;
const audience = "desktop-client.apps.googleusercontent.com";
const fetchImpl = async () => ({ ok: true, json: async () => ({ keys: [jwk] }) });
const encode = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
function token(overrides = {}, header = {}) {
  const h = encode({ alg: "RS256", typ: "JWT", kid: "test-key", ...header });
  const p = encode({
    iss: "https://accounts.google.com", aud: audience, sub: "12345678901234567890",
    email: "USER@gmail.com", email_verified: true, iat: now - 60, exp: now + 3600, ...overrides,
  });
  return h + "." + p + "." + sign("RSA-SHA256", Buffer.from(h + "." + p), privateKey).toString("base64url");
}
const options = { audience, fetchImpl, now: () => now * 1000 };
test("accepts valid signed Google ID token and normalizes email", async () => {
  assert.deepEqual(await verifyGoogleIdToken(token(), options), {
    googleSub: "12345678901234567890", email: "user@gmail.com", emailVerified: true,
  });
});
for (const [name, overrides] of [
  ["wrong audience", { aud: "attacker-client" }],
  ["unverified email", { email_verified: false }],
  ["expired token", { exp: now - 1 }],
  ["future issue time", { iat: now + 1000 }],
  ["wrong issuer", { iss: "https://attacker.test" }],
  ["missing subject", { sub: "" }],
  ["multi-audience token", { aud: [audience] }],
]) test("rejects " + name, async () => {
  await assert.rejects(verifyGoogleIdToken(token(overrides), options), /invalid-google-id-token/);
});
test("rejects forged signature", async () => {
  const t = token();
  const p = t.split(".");
  p[1] = encode({ ...JSON.parse(Buffer.from(p[1], "base64url")), email: "attacker@gmail.com" });
  await assert.rejects(verifyGoogleIdToken(p.join("."), options), /invalid-google-id-token/);
});
test("rejects unsupported signing algorithm", async () => {
  await assert.rejects(verifyGoogleIdToken(token({}, { alg: "none" }), options), /invalid-google-id-token/);
});
test("fails closed if Google public keys are unavailable", async () => {
  await assert.rejects(verifyGoogleIdToken(token(), { ...options, fetchImpl: async () => { throw Error("offline"); } }), /google-keys-unavailable/);
});
