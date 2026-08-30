# OpenTofu (Terraform) Scaffold

Use OpenTofu (open-source Terraform fork) to provision Lightsail resources when you want IaC for the instance and HTTPS.

## Why OpenTofu?

OpenTofu is a drop-in replacement for Terraform with the same syntax and features, but fully open-source (MPL 2.0). HashiCorp moved Terraform to a restrictive BUSL license, so this project uses OpenTofu for long-term compatibility and community support.

## Suggested files

- `main.tf`: Lightsail instance + static IP + load balancer
- `variables.tf`: input variables (region, instance name, blueprint, bundle, keypair, LB, cert)
- `outputs.tf`: static IP, LB DNS, cert validation

## Example resources to include

- `aws_lightsail_instance`
- `aws_lightsail_static_ip`
- `aws_lightsail_static_ip_attachment`
- `aws_lightsail_load_balancer`
- `aws_lightsail_load_balancer_attachment`
- `aws_lightsail_load_balancer_tls_certificate`

## Notes

- Keep `terraform.tfstate` (or `.tfstate`) out of git.
- Start with a dev workspace first.
- Use `tofu` command instead of `terraform` (they're identical otherwise).

## HTTPS flow (Lightsail LB)

1. Apply OpenTofu to create the load balancer and certificate request:
   ```bash
   tofu init
   tofu apply
   ```
2. Read `load_balancer_certificate_validation_records` from outputs.
3. Create those DNS validation records in Route 53.
4. Wait for certificate status to become `ISSUED`.
5. Point Route 53 A/AAAA records to the LB DNS name from `load_balancer_dns_name`.
