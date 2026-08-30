# Roadmap

This roadmap prioritizes **repeatability** over feature expansion.

## v0.1 — Repeatable platform lifecycle (current priority)

Goal: prove the platform can be recreated consistently in a fresh AWS account.

Success criteria:

1. Configure required GitHub variables/secrets
2. Provision infrastructure with OpenTofu/Terraform
3. Configure runtime with Ansible
4. WordPress becomes reachable
5. DNS resolution works as expected
6. HTTPS works with certificate validation flow
7. Validation checks pass
8. Destroy and rebuild successfully reproduces the environment

## v0.2 — Application repository integration

Goal: strengthen separation between platform and site artifacts.

- Define and document the first platform-to-application handoff model
- Provide practical guidance for deploying themes/plugins from a separate site repo
- Keep manual SSH deployment as a fallback/troubleshooting path

## v0.3 — Recovery and operations maturity

Goal: improve operational confidence.

- Improve backup/snapshot runbooks and validation cadence
- Clarify restore testing expectations
- Expand operational checklists for routine maintenance

## v0.4 — Observability and optional enhancements

Goal: mature optional operational tooling without making baseline deployments heavy.

- Improve observability defaults and alerts documentation
- Refine optional deployment patterns (with and without load balancer)
- Continue cost/performance guidance based on measured usage

## v0.5 — Platform contract (design milestone)

Goal: expose a simpler consumer interface for platform users.

Planned input contract (concept):

- `site_name`
- `domain`
- `environment`
- `instance_size`
- `monitoring_enabled`
- `load_balancer_enabled`
- `application_repository`

Expected platform capabilities:

- Compute
- WordPress runtime
- PHP and web server
- DNS integration
- TLS/HTTPS
- Database connectivity
- Security baseline
- Monitoring (optional)
- Backup/recovery mechanisms
- Deployment integration points
