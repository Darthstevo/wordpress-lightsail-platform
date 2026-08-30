# Design Decisions

| Decision                            | Rationale                              | Trade-offs                  |
| ----------------------------------- | -------------------------------------- | --------------------------- |
| Ansible as primary tool             | Repeatable, auditable host config      | Requires control node       |
| CDK for Route 53 + monitoring       | IaC for shared resources               | Separate toolchain          |
| Lightsail for compute               | Low cost + simplicity                  | Limited networking features |
| CI quality gates via GitHub Actions | Enforces checks per PR and main branch | Extra pipeline setup        |
