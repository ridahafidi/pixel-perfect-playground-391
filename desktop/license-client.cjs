/** Electron MAIN PROCESS ONLY. Never expose tokens, device keys, or this object to a renderer. */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
function createLicenseClient({
  apiOrigin,
  storageFile,
  machineHash,
  safeStorage,
  fetchImpl = globalThis.fetch,
  allowLocalHttp = false,
}) {
  const origin = new URL(apiOrigin);
  if (
    origin.protocol !== "https:" &&
    !(
      allowLocalHttp &&
      origin.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(origin.hostname)
    )
  )
    throw new Error("License service must use HTTPS");
  let stored = null,
    flight = null;
  function secure() {
    if (
      !safeStorage.isEncryptionAvailable() ||
      safeStorage.getSelectedStorageBackend?.() === "basic_text"
    )
      throw new Error("Secure credential storage is unavailable");
  }
  function read() {
    secure();
    if (stored) return stored;
    try {
      const envelope = JSON.parse(fs.readFileSync(storageFile, "utf8"));
      stored = JSON.parse(safeStorage.decryptString(Buffer.from(envelope.data, "base64")));
      if (!stored.privateKey || !stored.publicKey || stored.machineHash !== machineHash)
        throw new Error("Device changed");
      return stored;
    } catch (error) {
      if (fs.existsSync(storageFile))
        throw new Error(
          "Saved activation cannot be read on this Windows installation. Contact support to reset the device.",
        );
    }
    const pair = crypto.generateKeyPairSync("ed25519");
    stored = {
      machineHash,
      publicKey: pair.publicKey.export({ format: "pem", type: "spki" }),
      privateKey: pair.privateKey.export({ format: "pem", type: "pkcs8" }),
    };
    save();
    return stored;
  }
  function save() {
    secure();
    fs.mkdirSync(path.dirname(storageFile), { recursive: true, mode: 0o700 });
    const temporary = storageFile + ".tmp";
    fs.writeFileSync(
      temporary,
      JSON.stringify({
        data: safeStorage.encryptString(JSON.stringify(stored)).toString("base64"),
      }),
      { mode: 0o600 },
    );
    fs.renameSync(temporary, storageFile);
  }
  async function post(endpoint, body, token) {
    const result = await fetchImpl(new URL("/api/licensing" + endpoint, origin), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: "Bearer " + token } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    });
    const data = await result.json();
    if (!result.ok)
      throw Object.assign(new Error(data.error || "license-service-unavailable"), {
        status: result.status,
      });
    return data;
  }
  async function proof(action, email) {
    const device = read(),
      c = await post("/challenge", {});
    const digest = crypto.createHash("sha256").update(device.publicKey).digest("hex");
    const text = JSON.stringify([
      "nexaflow-device-v1",
      action,
      c.id,
      c.nonce,
      email.trim().toLowerCase(),
      machineHash,
      digest,
    ]);
    return {
      challengeId: c.id,
      nonce: c.nonce,
      email: email.trim().toLowerCase(),
      machineHash,
      publicKey: device.publicKey,
      signature: crypto.sign(null, Buffer.from(text), device.privateKey).toString("base64url"),
    };
  }
  function accept(data, email, key) {
    if (!data.token || data.email !== email.trim().toLowerCase())
      throw new Error("invalid-license-response");
    Object.assign(stored, {
      email: data.email,
      token: data.token,
      expiresAt: data.expiresAt,
      ...(key ? { key } : {}),
    });
    save();
    return { email: data.email, licenseId: data.licenseId, expiresAt: data.expiresAt };
  }
  async function activate(email, key) {
    if (typeof email !== "string" || typeof key !== "string")
      throw new Error("email-and-key-required");
    read();
    return accept(
      await post("/activate", { ...(await proof("activate", email)), key: key.trim() }),
      email,
      key.trim(),
    );
  }
  async function validate() {
    const device = read();
    if (!device.email || !device.key) throw new Error("activation-required");
    // Refresh through the central service on every access check. An expired
    // session must prove possession of the device key and original license key.
    if (!device.token || device.expiresAt <= Math.floor(Date.now() / 1000))
      return activate(device.email, device.key);
    try {
      return accept(
        await post("/session", await proof("session", device.email), device.token),
        device.email,
      );
    } catch (error) {
      delete stored.token;
      delete stored.expiresAt;
      save();
      throw error;
    }
  }
  return {
    activate(email, key) {
      if (flight) return Promise.reject(new Error("activation-in-progress"));
      flight = activate(email, key).finally(() => {
        flight = null;
      });
      return flight;
    },
    ensureAccess() {
      if (!flight)
        flight = validate().finally(() => {
          flight = null;
        });
      return flight;
    },
    logout() {
      const device = read();
      delete device.email;
      delete device.key;
      delete device.token;
      delete device.expiresAt;
      save();
    },
  };
}
module.exports = { createLicenseClient };
