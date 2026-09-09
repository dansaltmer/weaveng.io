---
inclusion: fileMatch
fileMatchPattern: '*.cs'
---

# C# Standards

## Platform

- Target **.NET 10**.
- Enable nullable reference types (`<Nullable>enable</Nullable>`) in every project.
- Use file-scoped namespaces.

## Repository Structure

- One solution per system: `apps/<system>/<System>.sln` (e.g. `apps/control/Control.sln`).
- Each component of a system is its own project under `apps/<system>/<component>/`.
- Non-.NET components (e.g. a Next.js interface) live alongside their system's folder but are **not** referenced in the `.sln`.
- Shared code within a system is just another library project under `apps/<system>/`, referenced by the components that need it via project reference. There is no cross-system shared code.
- Namespace root matches the system name: `WeaveEngine.<System>` (e.g. `WeaveEngine.Control`).

## Coding Standards

- One public type per file; file name matches the type name.
- Prefer immutability: records for DTOs/value objects, `init`-only properties, readonly fields.
- Use `async`/`await` end-to-end for I/O; never block on async code (`.Result`, `.Wait()`).
- Guard clauses over nested conditionals; fail fast on invalid input.
- Avoid primitive obsession — model domain concepts as types rather than raw strings/ints where it adds clarity.
- Exceptions are for exceptional cases, not control flow; don't use them to signal expected business outcomes.

## SOLID Principles

- **Single Responsibility** — a class has one reason to change. Split services when they accumulate unrelated concerns.
- **Open/Closed** — extend behaviour via new implementations of an abstraction, not by editing existing tested logic.
- **Liskov Substitution** — derived types/implementations must be usable anywhere the base/interface is expected, without surprising behaviour.
- **Interface Segregation** — keep interfaces small and client-specific rather than one large interface.
- **Dependency Inversion** — depend on abstractions (interfaces), not concrete implementations. High-level logic should not depend on low-level detail.

## Dependency Injection

- Use `Microsoft.Extensions.DependencyInjection` exclusively — no third-party DI containers.
- Constructor injection only; no service locator or property injection.
- Register services via `IServiceCollection` extension methods per component/library (e.g. `AddControlServices(this IServiceCollection services)`), composed in the entry point's `Program.cs`.
- Default lifetime is scoped for request-bound services, singleton for stateless/shared services, transient for lightweight stateless helpers. Be explicit about lifetime choice at registration.

## Testing

- Test framework: **NUnit**.
- Mocking: **Moq**.
- Integration tests requiring real dependencies (databases, message brokers, etc.): **Testcontainers**.
- Test project naming: `<Project>.Tests` for unit tests, `<Project>.IntegrationTests` for integration tests, both referenced from the same system's `.sln`.
