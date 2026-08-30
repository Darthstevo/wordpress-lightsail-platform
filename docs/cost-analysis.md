# Cost Analysis

Estimate Lightsail, managed DB, DNS, monitoring, and optional load balancer costs.

## Optional load balancer

Include a Lightsail load balancer only if you need a fixed public entry point in front of the instance. Note the monthly cost persists even if the instance is stopped.

## Low-cost recommendation (current plan)

- Use a single Lightsail instance with static IP.
- Keep the instance in a public subnet and disable inbound SSH.
- Use SSM Session Manager for access (no VPC endpoints required when outbound internet is available).
- Avoid managed DB and load balancer unless the site must stay online 24/7.

### Cost controls

- Stop the instance when not in use.
- Rebuild from snapshot or runbooks when needed.
