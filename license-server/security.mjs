import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createPublicKey,
  verify,
} from "node:crypto";
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const random = () => randomBytes(32).toString("base64url");
export const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
export function fail(code, status = 400) {
  throw Object.assign(new Error(code), { status });
}
export function equal(a, b) {
  const x = Buffer.from(String(a)),
    y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
export function passwordHash(password, salt = randomBytes(16).toString("hex")) {
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function passwordMatches(password, stored) {
  const [kind, salt, digest] = String(stored).split(":");
  return (
    kind === "scrypt" &&
    /^[a-f0-9]{32}$/.test(salt || "") &&
    /^[a-f0-9]{128}$/.test(digest || "") &&
    equal(passwordHash(password, salt), stored)
  );
}
export function signJwt(payload, secret) {
  const head = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${head}.${body}.${createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url")}`;
}
export function verifyJwt(token, secret, now) {
  try {
    if (typeof token !== "string" || token.length > 8192) fail("invalid-session", 401);
    const [head, body, sig, extra] = token.split(".");
    if (
      !sig ||
      extra ||
      !equal(sig, createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url"))
    )
      fail("invalid-session", 401);
    const header = JSON.parse(Buffer.from(head, "base64url"));
    const claims = JSON.parse(Buffer.from(body, "base64url"));
    if (
      header.alg !== "HS256" ||
      header.typ !== "JWT" ||
      claims.iss !== "nexaflow-license" ||
      claims.aud !== "nexaflow-desktop" ||
      !Number.isInteger(claims.exp) ||
      claims.exp <= now ||
      !Number.isInteger(claims.iat) ||
      claims.iat > now + 30 ||
      claims.exp - claims.iat > 900 ||
      !Number.isInteger(claims.ver) ||
      typeof claims.sub !== "string" ||
      typeof claims.jti !== "string"
    )
      fail("invalid-session", 401);
    return claims;
  } catch {
    fail("invalid-session", 401);
  }
}
export function canonicalProof(challenge, action, email, machineHash, publicKey) {
  return JSON.stringify([
    "nexaflow-device-v1",
    action,
    challenge.id,
    challenge.nonce,
    normalizeEmail(email),
    machineHash,
    hash(publicKey),
  ]);
}
export function verifyProof(challenge, action, input) {
  try {
    if (
      !/^[a-f0-9]{64}$/.test(input.machineHash || "") ||
      typeof input.publicKey !== "string" ||
      input.publicKey.length > 1024 ||
      typeof input.signature !== "string" ||
      input.signature.length > 256
    )
      fail("invalid-device-proof", 401);
    const key = createPublicKey(input.publicKey);
    if (
      key.asymmetricKeyType !== "ed25519" ||
      !verify(
        null,
        Buffer.from(
          canonicalProof(challenge, action, input.email, input.machineHash, input.publicKey),
        ),
        key,
        Buffer.from(input.signature, "base64url"),
      )
    )
      fail("invalid-device-proof", 401);
  } catch {
    fail("invalid-device-proof", 401);
  }
}
