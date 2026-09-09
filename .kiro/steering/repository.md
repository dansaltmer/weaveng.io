# Repository

Weave Engine is a personal project to build a highly configurable IPaaS (Integration Platform as a Service). New integrations are added purely through an integration manifest, rather than bespoke code per integration.

## Repository structure

```text
/
├── .kiro/                         # Kiro skills and steering for this repository
├── apps/                          # Top-level directory for individual components
│   └── control/                   # e.g. Control system components
│       └── interface/
│   └── engine/                    # e.g. Engine system components
│       └── execute-api/
├── documentation/                 # Platform documentation
├── infrastructure/                # Infrastructure as code
│   └── terraform/                 # Cloud infrastructure provisioning
│   └── helm/                      # Kubernetes manifests / Helm charts
└── tools/                         # Build, test, and deployment scripts
```

- `apps/` holds each individual component of the platform, grouped by system (`control`, `engine`, etc.) and then by component (`interface`, `execute-api`, etc.).
- `documentation/` holds platform documentation, including the control API and database docs (`documentation/control/`), integration manifest format, and language reference.
- `infrastructure/` holds infrastructure as code: Terraform for cloud provisioning, Helm charts for Kubernetes manifests.
- `tools/` holds build, test, and deployment scripts shared across the repository.

## Rules
- Do not use pointless .gitkeep files to reserve folders that aren't currently needed.
