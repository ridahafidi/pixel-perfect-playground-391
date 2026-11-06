import { createPublicKey, verify } from "node:crypto";

const ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);
const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const MAX_TOKEN_LENGTH = 16384;

function invalid() {
  throw Object.assign(new Error("invalid-google-id-token"), { status: 401 });
}
function decode(segment) {
  if (!/^[A-Za-z0-9_-]+$/.test(segment) || segment.length > MAX_TOKEN_LENGTH) invalid();
  try {
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
  } catch {
    invalid();
  }
}

/**
 * Verify a Google OpenID Connect ID token on the server.
 * Supply the OAuth client's exact ID as audience; never trust a renderer-provided audience.
 * fetchImpl is injectable for deterministic offline tests.
 */
export async function verifyGoogleIdToken(token, { audience, fetchImpl = fetch, now = () => Date.now() } = {}) {
  if (typeof token !== "string" || token.length > MAX_TOKEN_LENGTH || !audience) invalid();
  const parts = token.split(".");
  if (parts.length !== 3) invalid();
  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decode(headerPart);
  const claims = decode(payloadPart);
  if (
    header?.alg !== "RS256" ||
    header?.typ && header.typ !== "JWT" ||
    typeof header.kid !== "string" ||
    !ISSUERS.has(claims?.iss) ||
    claims.aud !== audience ||
    typeof claims.sub !== "string" ||
    !/^\d{5,}$/.test(claims.sub) ||
    claims.email_verified !== true ||
    typeof claims.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claims.email) ||
    !Number.isSafeInteger(claims.exp) ||
    !Number.isSafeInteger(claims.iat)
  ) invalid();
  const seconds = Math.floor(now() / 1000);
  if (claims.exp <= seconds || claims.iat > seconds + 60 || claims.exp - claims.iat > 86400) invalid();
  // Reject multi-audience tokens and hosted-domain assumptions by requiring an exact string audience.
  if (typeof claims.aud !== "string") invalid();

  let keys;
  try {
    const response = await fetchImpl(JWKS_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("Google key fetch failed");
    keys = (await response.json()).keys;
  } catch {
    throw Object.assign(new Error("google-keys-unavailable"), { status: 503 });
  }
  if (!Array.isArray(keys)) invalid();
  const key = keys.find((item) => item.kid === header.kid && item.kty === "RSA" && item.use === "sig" && item.alg === "RS256");
  if (!key) invalid();
  try {
    const publicKey = createPublicKey({ key, format: "jwk" });
    if (!verify("RSA-SHA256", Buffer.from(headerPart + "." + payloadPart), publicKey, Buffer.from(signaturePart, "base64url"))) invalid();
  } catch {
    invalid();
  }
  return { googleSub: claims.sub, email: claims.email.toLowerCase(), emailVerified: true };
}
