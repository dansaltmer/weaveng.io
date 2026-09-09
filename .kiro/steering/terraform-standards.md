---
inclusion: fileMatch
fileMatchPattern: '*.tf?(vars)'
---

# Terraform Standards

## Repository Structure

All Terraform lives under `infrastructure/terraform/`, as a single root configuration. No per-environment or per-system directories — environments are handled via workspaces.

```text
infrastructure/terraform/
├── modules/                       # Reusable modules, one folder per module
│   └── <module-name>/
├── backend.tf                     # Backend config (see Backend below)
├── providers.tf                   # Provider blocks and required_providers
├── variables.tf                   # Input variable declarations
├── outputs.tf                     # Output declarations
├── eks.tf                         # One file per concept/resource group
├── dynamodb.tf                    # e.g. all DynamoDB resources live here
├── dev.tfvars                     # One .tfvars per environment (see Workspaces below)
├── staging.tfvars
└── prod.tfvars
```

- One file per concept, named after it (`eks.tf`, `dynamodb.tf`, `kms.tf`). Don't dump unrelated resources into a shared `main.tf`.

## Environments — Terraform Workspaces

- One workspace per environment: `dev`, `staging`, `prod`.
- Use `terraform.workspace` to vary environment-specific values, rather than duplicating `.tf` files.
- One `.tfvars` file per environment alongside the root config, named after the workspace: `dev.tfvars`, `staging.tfvars`, `prod.tfvars`. Apply with `-var-file="$(terraform workspace show).tfvars"`.
- Confirm the active workspace (`terraform workspace show`) before every `apply`.

## Backend

- Backend: **S3** in `backend.tf`, with native S3 state locking (`use_lockfile = true`).
- State lives in the bucket, partitioned per workspace automatically — never in the repo.
- No credentials in `.tf`; AWS auth comes from the standard credential chain (env vars, shared config, CI OIDC role).

## Core Standards

- Pin the Terraform CLI version (`required_version`) and every provider version (`~>` constraints).
- Commit `.terraform.lock.hcl`.
- Run `terraform fmt -check` and `terraform validate` in CI.
- Review `terraform plan` before every `apply`; CI applies a reviewed plan artifact, not a fresh one.
- No hardcoded secrets in `.tf`/`.tfvars` — pull from a secrets manager via data sources.
- Tag every resource consistently (system, environment, managed-by).
- Don't hand-edit state — use `terraform state mv`/`import`/`rm` or `moved` blocks.
