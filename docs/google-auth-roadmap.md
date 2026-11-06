# Gmail-only authentication: integration checklist

## Current verified state (2026-11-06)

- The supplied Windows portable build is a packaged Electron/Next.js application in Google Drive, not the editable desktop source code.
- Its legacy Google OAuth flow is not functional out of the box: Google client configuration must be supplied by the owner.
- The code in this repository is the **marketing website and a separate license server**, not the complete Windows application. Changing this website cannot remove the license gate in `NexaFlow.exe`.
- The existing `desktop/license-client.cjs` adds an email + key entitlement scheme, but is **not** wired into the distributed EXE.

## Target design

1. Desktop: use Google Authorization Code with PKCE, launched using the system browser. Register suitable redirect URIs for the Electron application and never ship a Google client secret in the binary.
2. Backend: validate the Google ID token on the server (signature against Google's public JWKs, exact audience, issuer, expiry, and `email_verified`). Establish a server-issued app session bound to the verified Google subject (`sub`), not to a user-entered email address.
3. Desktop: preserve existing local business-session access control. Main process exchanges the validated Google login result for a short-lived app session; never allow the renderer to mint sessions or override user roles.
4. Admin: keep admin authorization server-side and separate from ordinary Gmail login. Use an allowlist by Google `sub` (verified owner identity), not email string alone, and require admin session/CSRF protection. Existing password login remains active until the Google admin integration has been tested.
5. Purchases: after a provider-verified webhook, associate the verified customer's Google account with the paid entitlement. No activation key in the UI. Never use checkout success redirects or a raw email claim as proof of purchase.
6. Analytics: log privacy-conscious page views and Buy clicks with user consent as applicable. Record completed orders only from verified provider webhooks. Avoid storing raw browsing history or sensitive PII.
7. Downloads: deliver the rebuilt, verified release only after payment entitlement is established. Do not link the outdated current Drive EXE as the new Gmail-only release.

## Required before switching on

- Editable Electron/Next.js desktop source and rebuild pipeline.
- Google OAuth client ID, approved redirect configuration and deployment origin.
- Verified payment provider and webhook endpoint.
- Secure server runtime, database, cookie/session secrets and encrypted storage.
- End-to-end tests: unauthorized login, forged Google ID token, account switching, admin access, failed payment, replayed webhook, refund and Windows restart.
- Rotate any passwords previously pasted into chats; never put passwords in Git.

## Development status

This checklist describes the target and integration boundary. It is **not** a claim that Gmail-only authentication, a rebuilt EXE, payments, or analytics are already working.
