const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync, readFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { createLicenseClient } = require("./license-client.cjs");
test("desktop adapter activates, persists encrypted credentials, restores, and loses access after revocation", async (t) => {
  const { createLicenseServer } = await import("../license-server/server.mjs");
  const { passwordHash } = await import("../license-server/security.mjs");
  const { issueLicense } = await import("../license-server/store.mjs");
  const temp = mkdtempSync(path.join(tmpdir(), "nexaflow-"));
  const { server, db } = createLicenseServer({
    database: ":memory:",
    origin: "http://localhost",
    allowHttp: true,
    jwtSecret: "s".repeat(64),
    adminEmail: "admin@example.test",
    adminPasswordHash: passwordHash("long-test-password"),
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => {
    await new Promise((r) => server.close(r));
    rmSync(temp, { recursive: true, force: true });
  });
  const issued = issueLicense(
    db,
    { email: "desktop@example.test", customer: "Desktop" },
    Math.floor(Date.now() / 1000),
    "test",
  );
  // AES-GCM fixture exercises the storage boundary. Windows DPAPI/safeStorage
  // must still be verified in an actual Electron Windows build.
  const aes = crypto.randomBytes(32);
  const safeStorage = {
    isEncryptionAvailable: () => true,
    encryptString: (s) => {
      const iv = crypto.randomBytes(12),
        c = crypto.createCipheriv("aes-256-gcm", aes, iv);
      const data = Buffer.concat([c.update(s, "utf8"), c.final()]);
      return Buffer.concat([iv, c.getAuthTag(), data]);
    },
    decryptString: (b) => {
      const d = crypto.createDecipheriv("aes-256-gcm", aes, b.subarray(0, 12));
      d.setAuthTag(b.subarray(12, 28));
      return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8");
    },
  };
  const options = {
    apiOrigin: `http://127.0.0.1:${server.address().port}`,
    storageFile: path.join(temp, "activation.json"),
    machineHash: "a".repeat(64),
    safeStorage,
    allowLocalHttp: true,
  };
  let client = createLicenseClient(options);
  await assert.rejects(client.ensureAccess(), /activation-required/);
  const access = await client.activate("desktop@example.test", issued.key);
  assert.equal(access.email, "desktop@example.test");
  assert.equal(access.token, undefined);
  assert.equal(readFileSync(options.storageFile, "utf8").includes(issued.key), false);
  client = createLicenseClient(options);
  assert.equal((await client.ensureAccess()).email, "desktop@example.test");
  // Concurrent checks coalesce instead of racing rotating session tokens.
  const results = await Promise.all([client.ensureAccess(), client.ensureAccess()]);
  assert.equal(results[0].email, results[1].email);
  const other = createLicenseClient({
    ...options,
    storageFile: path.join(temp, "other.json"),
    machineHash: "b".repeat(64),
  });
  await assert.rejects(
    other.activate("desktop@example.test", issued.key),
    /license-bound-to-another-machine/,
  );
  db.prepare("UPDATE licenses SET status='REVOKED',version=version+1 WHERE id=?").run(
    issued.license.id,
  );
  await assert.rejects(client.ensureAccess(), /license-inactive/);
  client.logout();
  await assert.rejects(client.ensureAccess(), /activation-required/);
});
