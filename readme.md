# Weave Engine

This repository contains a personal project to build a configurable IPaaS platform, allowing new integrations to be added purely through an integration manifest.

## Repository structure

```text
/
├── .kiro/                         # Kiro skills and steering for this repository
├── apps/                          # Top-level directory for individual components
│   └── control/                   # Control system components
│       └── interface/             
│   └── engine/                    # Engine system components
│       └── execute-api/           
├── documentation/                 # Platform documentation
├── infrastructure/                # Infrastructure as code
│   └── terraform/                 # Cloud infrastructure provisioning
│   └── helm/                      # Kubernetes manifests / Helm charts
└── tools/                         # Build, test, and deployment scripts
```
