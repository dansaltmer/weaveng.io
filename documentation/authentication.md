# Authentication

## AWS Cognito

Cognito is the identity provider. Organisations, permissions, and membership
live in the control database, not in Cognito attributes or groups — Cognito never
needs to be in sync with them.

Every org-scoped access token carries two custom claims, added by a Pre Token
Generation Lambda from the control database:

- `org_id` — the organisation the token is scoped to (snake_case to match other
  standard JWT claims, e.g. `token_use`, `client_id`).
- `roles` — the standard JWT `roles` claim (RFC 9068 §2.2.3.1), see
  [Roles](#roles).

## Login

Control interface uses Auth.js (Cognito provider) to run the authorization code +
PKCE flow.

## Selecting an organisation

Handled by the control interface's backend.

1. Client-side calls `POST /api/auth/organisation` on the BFF with the selected
   organisation.
2. BFF calls `AdminInitiateAuth` (`CUSTOM_AUTH`) then `AdminRespondToAuthChallenge`
   with `ClientMetadata: { org_id }`.
3. The Verify Auth Challenge Lambda checks the user's membership and permissions
   for `org_id` against the control database, and fails the challenge if invalid.
4. A Pre Token Generation Lambda reads `org_id` from the client metadata, looks up
   permissions in the control database, and mints an access token scoped to that
   organisation.

Each tab/session can hold its own org-scoped token independently — there is no
shared "current organisation" state.

## Refreshing a session

No separate refresh call. Auth.js's `jwt` callback runs on every session check: if
the stored access token is expired, it repeats steps 2–4 above using the `org_id`
already stored on the token, and replaces it with the newly minted one.

## Roles

Placeholder, to be defined.

- `read`
- `write`
- `owner`

A token can carry more than one. Stored in the control database against org
membership (and against app registrations for machine clients). Carried in tokens
as the `roles` claim.

## Control API

Only ever accepts access tokens (`token_use: access`), never ID tokens. Every
endpoint validates the token signature, then authorises the
request from the `org_id` and `roles` claims the token carries.

## Security notes

- Cognito admin operations (`AdminInitiateAuth`, `AdminRespondToAuthChallenge`,
  etc.) are only callable by the BFF, enforced via IAM.
- BFF's Cognito admin credentials are server-side only, never exposed to the
  frontend.
- The actual authorisation decision (org membership/permissions) happens in the
  Verify Auth Challenge Lambda, not the BFF — the BFF only identifies the caller
  and drives the Cognito flow.
- `POST /api/auth/organisation` is rate limited — it's a privileged, Cognito-calling
  endpoint gated only by a valid session.
