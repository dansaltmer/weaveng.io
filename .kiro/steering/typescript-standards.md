---
inclusion: fileMatch
fileMatchPattern: '*.ts?(x)'
---

# TypeScript Standards

## Platform

- Target **Node.js 26** (upcoming LTS; Active LTS from ~Oct 2026).
- Use ESM (`"type": "module"`) exclusively; no CommonJS.
- Enable `strict` mode in every `tsconfig.json` (implies `noImplicitAny`, `strictNullChecks`, etc.). Also enable `noUncheckedIndexedAccess` and `noImplicitOverride`.
- `noEmitOnError` on; a type error is a build failure, not a warning.

## Repository Structure

- Each component of a system is its own package under `apps/<system>/<component>/` (e.g. `apps/control/interface/`), with its own `package.json` and `tsconfig.json`.
- Shared code within a system lives in a library package under `apps/<system>/`. There is no cross-system shared code.
- Path aliases (`tsconfig.json` `paths`) are for imports within a package only, not for reaching into other packages.

## Coding Standards

- One exported type/class/component per file where practical; file name matches the primary export (`kebab-case` for files, e.g. `weave-list.ts`).
- Prefer `type` for shapes (objects, unions, function signatures); use `interface` only when declaration merging or class implementation is needed.
- Prefer immutability: `readonly` properties, `ReadonlyArray<T>`/`readonly T[]`, avoid mutating function parameters.
- Use `async`/`await` end-to-end for I/O; never leave a `Promise` unhandled (enforce via `no-floating-promises`).
- Guard clauses over nested conditionals; fail fast on invalid input.
- No `any`. Use `unknown` and narrow it, or generics, when the type genuinely isn't known.
- No non-null assertions (`!`) as a substitute for real narrowing; only use them where nullability has already been proven impossible by preceding logic.
- Avoid primitive obsession — model domain concepts as branded types or small wrapper types rather than raw `string`/`number` where it adds clarity (e.g. `OrganisationId` vs bare `string`).
- Exceptions are for exceptional cases, not control flow; don't throw to signal expected business outcomes — return a result/union type instead.
- Exhaustiveness: `switch` statements over unions must handle every member; enforce with a `default` that calls a `never`-typed assertion helper.

## Design Principles

- **Single Responsibility** — a module/function has one reason to change. Split files when they accumulate unrelated concerns.
- **Open/Closed** — extend behaviour via new functions/implementations, not by editing existing tested logic.
- **Liskov Substitution** — anything implementing an interface/type must be usable anywhere that interface is expected, without surprising behaviour.
- **Interface Segregation** — keep interfaces/types small and consumer-specific rather than one large shape.
- **Dependency Inversion** — depend on abstractions (interfaces/function types passed in), not concrete implementations. High-level logic should not import low-level detail directly; pass it in.

## Tooling

- Package manager: **npm**. No workspaces — each package manages its own `node_modules` and dependencies independently.
- Linting: **ESLint** with `@typescript-eslint`, type-aware rules enabled (`parserOptions.project`).
- Formatting: **Prettier**, run via ESLint integration, not a separate manual step.
- Both lint and format run in CI; a failing lint is a build failure, not advisory.

## Testing

- Test framework: **Vitest**.
- Mocking: Vitest's built-in `vi.mock`/`vi.fn`; avoid pulling in a separate mocking library.
- Component/UI testing (where applicable, e.g. `interface` packages): **Testing Library**.
- Test files live next to the code they test: `<name>.test.ts` beside `<name>.ts`.
