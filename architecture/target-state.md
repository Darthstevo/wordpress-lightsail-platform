# Target State

## Summary

- Lightsail instance + managed DB.
- Ansible-driven configuration and restoration.
- Documented recovery runbooks.
- Optional Lightsail load balancer for public entry point.

## Non-goals

- Full multi-region HA.
- Autoscaling.

## Optional components

### Lightsail Load Balancer

Use a Lightsail load balancer if you want a stable public endpoint in front of the instance.

- Pros: hides instance IP, allows easier certificate management.
- Cons: monthly cost continues even if the instance is stopped.
- TLS: use AWS Certificate Manager (ACM) for the load balancer certificate.
