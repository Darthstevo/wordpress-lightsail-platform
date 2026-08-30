# WordPress Platform Architecture

## Purpose

This document describes the **reference architecture** for a reusable WordPress runtime platform.
The platform provisions and configures infrastructure; a separate application repository delivers site-specific artifacts.

## Two-repository model

```
wordpress-lightsail-platform (this repo)
  └─ provisions and configures
     WordPress Runtime Platform (AWS + OS + runtime)
        └─ consumed by
           WordPress application repository (themes/plugins/content)
```

## Responsibility boundaries

### OpenTofu/Terraform (core infrastructure lifecycle)

- Lightsail and core AWS resources
- DNS integration (Route53)
- TLS-related infrastructure wiring
- Resource lifecycle (plan/apply/destroy)

### Ansible (runtime and host configuration)

- OS baseline and hardening
- Nginx and PHP configuration
- WordPress runtime setup
- Validation and repeatable host configuration

### AWS CDK (optional enhancement layer)

- Observability integrations (dashboards/alarms/notifications)
- Other optional AWS integrations where CDK improves maintainability

CDK is intentionally optional so baseline deployments remain low-complexity and cost-conscious.

## Cost and topology choices

### Load balancer: optional by design

- **Without load balancer:** lower cost, simpler architecture, good for many small or low-traffic workloads.
- **With load balancer:** higher cost, useful when availability and operational requirements justify it.

### Practical deployment profiles (conceptual)

- **Minimal:** single instance, managed database, no load balancer, basic backup/recovery.
- **Recommended:** right-sized instance, managed database, HTTPS, baseline monitoring, snapshots/backups.
- **Enhanced:** optional load balancer, expanded observability, stronger availability posture.

This document describes intent only; it does not introduce a runtime profile system in code yet.

## Platform/application delivery model

### Current practical workflow

- Deploy platform infrastructure/runtime from this repository.
- Deploy WordPress themes/plugins/content from a separate site repository.
- Manual SSH-based deployment can still be used for bootstrap and troubleshooting.

### Desired long-term workflow

- Platform provides stable deployment and configuration interfaces.
- Application repositories consume that interface to deliver site artifacts repeatably.

## Future platform contract (design direction)

Future versions should expose a simple consumer contract so developers can use the platform without deep implementation knowledge.

Potential input contract fields:

- `site_name`
- `domain`
- `environment`
- `instance_size`
- `monitoring_enabled`
- `load_balancer_enabled`
- `application_repository`

Expected platform capabilities:

- Compute and networking foundation
- WordPress runtime (Nginx/PHP/runtime configuration)
- DNS and TLS integration
- Database connectivity
- Security baseline
- Optional observability
- Backup/recovery mechanisms
- Integration points for application deployment

## Why this architecture

- Keeps platform concerns separate from site/application concerns.
- Supports repeatability and portability across AWS accounts.
- Balances low-cost operation with optional operational enhancements.
- Stays understandable for teams learning and applying DevOps/Platform Engineering practices.
