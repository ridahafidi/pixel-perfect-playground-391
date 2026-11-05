# Central customer licensing

## Delivered components and deployment boundary

- `/admin`: customer email/key management, one-time key display, device reset, key rotation, revocation, and authenticated administrator sessions.
- `license-server/`: separate Node.js **24 LTS** service with a persistent SQLite database. Run one service instance on a host with a persistent disk; do not run it inside the frontend's Cloudflare Worker or on ephemeral storage.
- `/api/licensing/*`: the frontend's server-only proxy to that service. Browser and desktop requests use the website origin. Set `LICENSE_API_ORIGIN` in the website's **server** environment (never `VITE_*`).
- `desktop/license-client.cjs`: Electron main-process adapter. It is not yet wired into the supplied compiled Windows application. The existing EXE continues using its old authentication until its editable desktop/Next.js source is updated and rebuilt.
- `/download`: new activation instructions, with an explicit warning that existing downloads still use the old system.

This is an email + license-key activation flow. Google OAuth is not used in the new adapter. Knowing an email alone grants no access. Purchase confirmation authorizes the email; the separately delivered secret key proves entitlement. If Google verification is retained in the final desktop UI, verify it server-side and match its verified email before activation; do not trust an email supplied by a renderer as a Google identity.

## Run locally

Install frontend dependencies normally. The licensing service uses only Node built-ins and needs no dependency installation.

1. Generate a password hash with `npm run license:password`, piping a strong password (at least 16 characters) through stdin. Do not put the raw password in source or command arguments.
2. Set the following in your runtime environment or secret manager:

| Variable                      | Purpose                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `LICENSE_ADMIN_EMAIL`         | Your administrator login email                                                |
| `LICENSE_ADMIN_PASSWORD_HASH` | Output from the password command                                              |
| `LICENSE_JWT_SECRET`          | Random secret with at least 48 characters; never shared with the desktop      |
| `LICENSE_WEBSITE_ORIGIN`      | Exact frontend origin, e.g. `http://localhost:5173` locally                   |
| `LICENSE_DATABASE`            | Absolute persistent SQLite path, e.g. `/var/lib/nexaflow/licenses.sqlite`     |
| `LICENSE_PORT`                | Service port, default `3434`                                                  |
| `LICENSE_HOST`                | Listening interface, default `127.0.0.1`                                      |
| `LICENSE_LOCAL_HTTP`          | Set to `1` only for local HTTP testing; omit in production                    |
| `LICENSE_PURCHASE_SECRET`     | Separate random 48+ character secret for the server-to-server payment adapter |

3. Run `npm run license:start`.
4. Set `LICENSE_API_ORIGIN=http://127.0.0.1:3434` for local frontend development. Run `npm run dev`.
5. Visit `/admin`, sign in, and create a customer. Copy the generated key before dismissing it. Only a SHA-256 key hash is stored in the database.

For production, the website and upstream service must use HTTPS. Keep the service behind a trusted reverse proxy, restrict its host/network access as appropriate, back up the SQLite database, and run a single writer service. The in-service IP rate limiter uses the actual socket peer rather than trusting arbitrary forwarded headers; a reverse proxy must also enforce client-specific limits to avoid treating all visitors as one address. Password and runtime secrets must be configured before any deployment is considered functional.

## Admin workflow

1. Confirm payment and enter the customer's email and name.
2. Generate a key, or import a sufficiently random existing key of at least 24 characters. Length validation alone cannot establish the entropy of an imported key; generated keys are preferred.
3. Deliver the key securely yourself. Automatic delivery is not configured.
4. First activation binds the email/key to one machine hash and one Ed25519 public key. A second computer is rejected.
5. Reset device to allow a legitimate computer change. This clears the binding and invalidates current sessions.
6. Revoke to disable access. Rotate key to invalidate the old key and current sessions while retaining the assigned computer.

Revoked licenses stay revoked after reset/rotation. There is no automatic reactivation after a refund. The admin list returns at most 1,000 licenses; add pagination before exceeding this size.

## Payment integration contract (provider adapter still required)

There is no checkout provider in the original repository. The new endpoint is a signed internal provisioning interface, **not a drop-in Stripe/PayPal webhook**. Do not call it from a success-page redirect or expose its shared secret in the browser.

Your payment backend must first verify the provider's webhook signature, successful final payment status, correct product, amount and currency. It then sends:

```json
{
  "eventId": "provider-event-id",
  "orderId": "provider-order-id",
  "type": "paid",
  "email": "buyer@example.com",
  "customer": "Workshop name"
}
```

POST this exact JSON body to `/api/licensing/purchases` with:

- `x-nexaflow-timestamp`: current Unix seconds.
- `x-nexaflow-signature`: hexadecimal HMAC-SHA256 using `LICENSE_PURCHASE_SECRET` over `timestamp + "." + rawBody`.

The first accepted event returns the license and its plaintext key **once**. The adapter must deliver the key using your purchase/email infrastructure. Retried events are idempotent and never reveal the key again. If the initial response/delivery is lost, the admin can rotate the key and deliver the replacement. Use a durable fulfillment queue in the payment adapter before enabling automatic sales.

Refund event:

```json
{ "eventId": "provider-refund-id", "orderId": "provider-order-id", "type": "refunded" }
```

Refunds revoke associated sessions. A refund arriving before its paid event returns `404`; the adapter must retry after provisioning, or maintain payment-event ordering. Purchase creation for an already licensed email returns `409` unless it is the same order; multiple licenses per customer are intentionally not supported in this one-account/one-machine model.

## Windows application integration required

The supplied Drive folder is a packaged Electron/Next.js build, not the complete editable project. Do not overwrite its ASAR with frontend files.

In the original Electron main process, after `app.whenReady()`:

```js
const { createLicenseClient } = require("./license-client.cjs");
const licensing = createLicenseClient({
  apiOrigin: "https://YOUR-WEBSITE-ORIGIN",
  storageFile: path.join(app.getPath("userData"), "device-activation.json"),
  machineHash: getMachineHash(),
  safeStorage,
});
```

- Replace the old offline `ensureLicense()` gate and local Google email allowlist with this flow; leaving either gate in place can still deny a centrally licensed customer.
- Expose only `activate(email,key)`, `ensureAccess()`, and logout via narrow IPC handlers that verify the sender origin and main frame. The adapter returns safe identity metadata; tokens, license keys and device private keys stay in main-process memory/encrypted storage.
- On startup, call `ensureAccess()`. If activation is required, show the email/key form. Submit through the activation handler; show success only after the server grants access and the local authenticated session is established.
- Connect successful entitlement validation to the existing local Next.js server's session issuer. Its local business routes must still reject requests without an authorized local session. Do not simply load `/dashboard` or put the central JWT into the old `kfz_session` cookie: they use different issuers and signing secrets.
- Recheck `ensureAccess()` at least every five minutes, on resume/unlock, and before sensitive actions. If it fails, invalidate the local session and lock the application. A background heartbeat failure must not leave the already-open app usable.
- Local sessions must expire within the central access window. Never allow a renderer to mint a session or set its own email/role.
- Call logout on the adapter and invalidate the local session when signing out.
- Rebuild and test the EXE on Windows: activation, closing/reopening, network loss, secureStorage/DPAPI persistence, reset, second-machine rejection and revocation.

The adapter stores the device private key, license key and session encrypted through Electron `safeStorage` and rejects insecure/plaintext storage. The machine hash is also checked after reading saved state. Missing or unreadable activation state requires reactivation; if the previous device binding is still present, the admin must reset it. A machine reinstall may therefore require a reset.

An unmodified client enforces one machine; no purely local protection makes a desktop binary impossible to patch or clone. Periodic central checks limit sharing and revocation delay, but do not substitute for protecting the Windows installation.

## Session and API details

`POST /challenge` returns a single-use nonce lasting 120 seconds. Activation and session refresh sign the canonical array in `security.mjs` with the installation's Ed25519 private key. The server verifies the signature and atomically creates/validates the machine binding under a SQLite immediate transaction.

JWTs pin HS256, issuer and audience and require expiration, issue time, license version and server-side session existence. They last at most 15 minutes. `/session` additionally verifies the device proof, current email, active license, expiration, device binding and revocation version, then rotates the token. A copied JWT alone is insufficient.

The desktop adapter coalesces concurrent checks to avoid token-rotation races. Startup after JWT expiration reactivates using the securely saved license key and device proof. No offline grace period is enabled.

## Validation

```sh
npm run license:test
npm test
npm run build
```

The tests use actual HTTP endpoints, SQLite and signed device proofs. Desktop secure storage uses an AES-GCM fixture for tests; that does not verify Windows DPAPI or a rebuilt EXE. Real payment-provider fulfillment, production deployment, and the existing desktop's local-session bridge still require integration and live verification.
