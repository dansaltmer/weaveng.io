# Frontend Standards

Applies on top of `typescript-standards.md`, which still governs general TypeScript rules (strictness, immutability, testing framework, etc.). This file covers frontend-specific concerns only.

## Platform

- **Next.js**, App Router only — no Pages Router for new work.
- **React 19**, Server Components by default.
- **MUI (Material UI)**, latest major compatible with the repo's Next.js version, using **Emotion** (`@emotion/react`, `@emotion/styled`) as the styling engine — not Pigment CSS, not `styled-components`.
- Wrap the root layout in `AppRouterCacheProvider` from `@mui/material-nextjs/v{N}-appRouter` (matching the installed Next.js major) so Emotion's cache streams correctly with the App Router. Without it, styles can flash unstyled or render in `<body>` instead of `<head>`.
- **TanStack Query** for server/async state (fetching, caching, mutations) on the client. **Zustand** for client-only global state. These are separate concerns — don't duplicate server data into a Zustand store.

## Styling

- One shared theme created via `createTheme` and provided through MUI's `ThemeProvider`, wrapped inside `AppRouterCacheProvider` in `app/layout.tsx`. No ad hoc theme overrides scattered across components.
- Prefer the `sx` prop or `styled()` from `@mui/material/styles` for styling MUI components. Use `@emotion/styled` directly only for non-MUI custom components.
- `'use client'` is required wherever MUI's interactive components or hooks are used. Push it down to the smallest leaf component that needs it, not the whole page, so the rest of the tree stays server-rendered.

## Frontend Structure (App Router)

```text
/apps/<system>/<component>/
├── app/                           # Routing only: pages, layouts, route groups, api/ route handlers
├── api/                           # TanStack Query tier
│   ├── api-client.ts              # Shared fetch helper: envelope/problem+json handling for every hook below
│   └── resource-name/             # Query keys, useQuery/useMutation hooks, and DTOs for that resource
├── hooks/                         # Hooks/Providers/Contexts go here
│   └── useHookName/               # Single file containing the hook plus any providers/context
├── components/                    # Shareable UI, nested by feature
│   ├── weave-editor/              # A top-level, deep feature component; owns its own subcomponents
│   └── shared/                    # Small, generic, reusable pieces with no feature ownership
│       └── component-name/        # Every component gets its own folder, same rule as hooks/
└── utils/                         # Pure helper functions, no React, no rendering side effects
```

- `app/` contains routing and composition only — no business logic or shared UI. A page imports and composes components from `components/`; it doesn't define them inline.
- `api/<resource>/` (e.g. `api/weaves/`) is the API tier: query keys, `useQuery`/`useMutation` hooks, and request/response types for that resource. Components consume these hooks, they don't call `fetch` or build query keys themselves.
- `components/<feature>/` (e.g. `weave-editor/`) owns everything specific to that feature, nested as deep as needed. If a component only makes sense inside one feature, it lives there, not in `shared/`.
- `components/shared/` is for components with no single feature owner and used across multiple features: modals, code editors, generic buttons, form fields, etc.
- Every component gets its own folder named after it, same as `hooks/`, even single-file shared ones — no bare files directly in `shared/`.
- `utils/` is framework-agnostic logic (formatting, mapping, calculations). Anything using React state or lifecycle belongs in a component or a hook, not here.

## Component Conventions

- One component per file; `kebab-case` file name matching the component (`weave-editor.tsx`), component itself exported as `PascalCase`.
- Server Components by default. Add `'use client'` only when the component needs state, effects, browser APIs, or MUI interactivity.
- Co-locate a component's styles, types, and tests next to it rather than in separate parallel trees.

## Data Fetching & API

- Fetch data in Server Components or route handlers for a page's initial load where possible; use TanStack Query on the client only for data that needs refetching, caching, pagination, or mutation after the initial load.
- Seed TanStack Query's cache from server-fetched data (`HydrationBoundary`/`dehydrate`) rather than re-fetching on the client after hydration.
- One `QueryClientProvider` at the root (client component), configured with the shared fetch helper below as the default fetcher/mutator.
- The backend follows `api-standards.md`: expect the `{ data, meta }` envelope on success and RFC 9457 `application/problem+json` on error. Handle both in one shared fetch helper (`api/api-client.ts`) used by every `useQuery`/`useMutation`, rather than re-parsing responses in every component.
- All `useQuery`/`useMutation` hooks live in `api/<resource>/`, not inline in components — components call the hook, they don't assemble query keys or fetch calls themselves.
- Query keys are arrays scoped by resource and params (e.g. `['weaves', orgId, weaveId]`), defined once in `api/<resource>/` and exported for reuse (e.g. cache invalidation from a mutation in the same resource).
- `app/api/*` route handlers are for BFF-style concerns (aggregation, token exchange) only — not a substitute for calling the real backend API.

## State Management

- Local component state via `useState`/`useReducer` by default.
- **Server/async state** (anything that originates from the API) lives in TanStack Query's cache, never copied into Zustand or component state.
- **Client-only global state** (UI state shared across unrelated components: panel visibility, selected node in an editor, wizard step) goes in a Zustand store. Only reach for one when state is genuinely cross-cutting — not a substitute for prop drilling within a single feature.
- Scope Zustand stores per feature, colocated under `components/<feature>/` (e.g. `components/weave-editor/weave-editor.store.ts`), rather than one repo-wide store. Only lift a store out of a feature if it's genuinely shared.

## Testing & Tooling

- Test framework, mocking, and file colocation follow `typescript-standards.md` (Vitest + Testing Library, `<name>.test.tsx` beside `<name>.tsx`).
- Lint with `eslint-config-next` alongside the `@typescript-eslint` rules already required repo-wide; format via Prettier through ESLint, not a separate step.
