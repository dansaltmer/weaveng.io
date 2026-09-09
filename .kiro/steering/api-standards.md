# API Standards

## Style

- APIs are RESTful: resources are nouns, HTTP methods express the action (`GET`, `POST`, `PATCH`, `DELETE`, `QUERY`).
- Use plural resource names. Resources sit flat off the version, e.g. `/v1/weaves/{weaveId}`. The organisation is always established by the access token, never by a path parameter.
- Use standard HTTP status codes; don't invent custom success/error codes in the body when a status code already conveys it.
- `QUERY` is for searches whose filter criteria are too complex for a query string. It's safe and idempotent like `GET`, but carries a body. Never use it to mutate state.

## Versioning

- Version in the URL, at the base of the path: `/v1/...`.
- A version covers the whole API; there is no per-resource versioning.
- Bump the major version only for breaking changes. Additive changes (new optional fields, new endpoints) don't require a version bump.
- Support at most two major versions at a time. Deprecate the older version with a published sunset date before removing it.
- Each major version is its own deployment. The ingress routes by the `/v{n}` path prefix to the matching deployment.

## Schema

- Every API ships an OpenAPI schema, kept up to date with the implementation.
- The schema is available at a well-known, unauthenticated path (e.g. `/v1/openapi.json`).
- Request/response DTOs are generated from or validated against the schema, not hand-duplicated.

## Request & Response

- `camelCase` for JSON field names.
- Timestamps are ISO 8601 UTC.
- IDs are opaque strings, never expose internal database keys or sequence numbers.
- All responses use one envelope: `{ "data": ..., "meta": {...} }`. `data` is an object for a single resource, an array for a list.
- `meta` carries pagination (`cursor`, `pageSize`) on lists and any other response metadata; never mix metadata into `data`.
- Errors use [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457) (`application/problem+json`): `type`, `title`, `status`, `detail`, and `instance`, plus any extension members an error needs.

## Security

- Every endpoint requires authentication unless explicitly documented as public.
- Enforce authorisation (e.g. organisation membership) at the API layer, not just in the data layer.
- Never expose credential values or secrets in a response; return references only.
