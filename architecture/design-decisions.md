# Architecture Design Decisions (ADR-style)

These decisions keep the project practical, portable, and understandable as a DevOps/Platform Engineering reference implementation.

## ADR-001: Use Lightsail as the primary compute foundation

- **Status:** Accepted
- **Decision:** Prefer AWS Lightsail for baseline WordPress platform hosting.
- **Why:** Simpler operational surface and predictable entry-level cost for labs, learning, and small workloads.
- **Trade-off:** Fewer advanced networking and scaling features than a full EC2/RDS/ALB architecture.

## ADR-002: Use OpenTofu/Terraform for core infrastructure lifecycle

- **Status:** Accepted
- **Decision:** Manage core AWS resource lifecycle (instance, DNS, optional load balancer resources, certificates) with OpenTofu/Terraform.
- **Why:** Declarative state management, reproducible plans/applies, and broad IaC portability.
- **Trade-off:** Requires state discipline and environment variable/secret management.

## ADR-003: Use Ansible for runtime and host configuration

- **Status:** Accepted
- **Decision:** Use Ansible for OS hardening, Nginx, PHP, WordPress runtime setup, and server validation steps.
- **Why:** Repeatable host configuration and clear separation from infrastructure provisioning.
- **Trade-off:** Additional tooling and playbook lifecycle to maintain.

## ADR-004: Keep AWS CDK as an optional enhancement layer

- **Status:** Accepted
- **Decision:** Treat CDK as optional for observability/notification integrations where AWS-native constructs add value.
- **Why:** Keeps the baseline platform lightweight while allowing richer operations features when needed.
- **Trade-off:** Extra toolchain for teams that choose observability stacks.

## ADR-005: Make the load balancer optional, not mandatory

- **Status:** Accepted
- **Decision:** Support deployment without a Lightsail load balancer for lower-cost/simpler setups; enable LB when availability requirements justify it.
- **Why:** Many low-traffic or learning workloads prioritize cost and simplicity over additional availability features.
- **Trade-off:** Without LB, fewer traffic management and front-door options.

## ADR-006: Separate platform infrastructure from site/application artifacts

- **Status:** Accepted
- **Decision:** Keep this repository focused on platform concerns; keep themes/plugins/content in a separate application repository.
- **Why:** Clear ownership boundaries, better reuse across teams/sites, and reduced coupling to one site.
- **Trade-off:** Requires coordination between platform and application delivery flows.

## ADR-007: Prioritize repeatability before feature expansion

- **Status:** Accepted
- **Decision:** Define early milestone success as repeatable provision → configure → validate → destroy/rebuild lifecycle.
- **Why:** Reliability of the basic lifecycle provides higher long-term value than adding unproven feature breadth.
- **Trade-off:** Slower feature rollout in exchange for operational confidence.

## ADR-008: Include snapshots and backups in baseline recovery strategy

- **Status:** Accepted
- **Decision:** Keep snapshot/backup mechanisms as first-class platform concerns.
- **Why:** Recovery readiness is a core platform reliability requirement, not an afterthought.
- **Trade-off:** Additional storage/process cost and routine operational checks.

## ADR-009: Introduce a future platform contract (design direction)

- **Status:** Proposed
- **Decision:** Evolve toward a simple consumer contract (for example: `site_name`, `domain`, `environment`, `instance_size`, `monitoring_enabled`, `load_balancer_enabled`, `application_repository`).
- **Why:** Enables teams to consume platform capabilities without deep implementation knowledge.
- **Trade-off:** Requires careful versioning and validation design to avoid over-abstraction.
