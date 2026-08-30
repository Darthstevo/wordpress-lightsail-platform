# Deployment Readiness (Public Template)

Use this checklist before your first deployment in a new AWS account.

## Required GitHub Variables

Set in **Settings → Secrets and variables → Actions → Variables**:

- `AWS_ROLE_ARN_TERRAFORM` (example: `arn:aws:iam::123456789012:role/GitHubActions-Terraform-Role`)
- `AWS_ROLE_ARN_CDK` (example: `arn:aws:iam::123456789012:role/GitHubActions-CDK-Role`)
- `AWS_REGION` (example: `us-east-1`)
- `AWS_AVAILABILITY_ZONE` (example: `us-east-1a`)
- `WP_DOMAIN` (example: `example.com`)
- `WP_ALT_NAMES` (example: `["www.example.com"]`)
- `ROUTE53_ZONE_ID` (example: `Z123EXAMPLE`)
- `ROUTE53_A_RECORD_NAMES` (example: `["example.com"]`)
- `LIGHTSAIL_INSTANCE_NAME` (example: `wordpress-dev-1`)
- `LIGHTSAIL_STATIC_IP_NAME` (example: `wordpress-dev-ip`)
- `LIGHTSAIL_LOAD_BALANCER_NAME` (example: `wordpress-dev-lb`)
- `LIGHTSAIL_KEY_PAIR_NAME` (example: `wordpress-platform-key`)
- `LIGHTSAIL_CERTIFICATE_NAME` (example: `wordpress-dev-cert`)

## Required GitHub Secrets

Set in **Settings → Secrets and variables → Actions → Secrets**:

- `LIGHTSAIL_SSH_PRIVATE_KEY`
- `ANSIBLE_VAULT_PASSWORD`
- `ALERT_EMAIL` (optional; required if deploying observability alerts)

## Required Files to Populate

1. Copy `terraform/terraform.tfvars.example` to `terraform/terraform.tfvars`
2. Copy `ansible/group_vars/wordpress.vault.yml.example` to `ansible/group_vars/wordpress.vault.yml`
3. (Optional) Copy `.env.example` to `.env` for local runs

## Scope and Assumptions

- This repository provisions **platform infrastructure only**.
- It is designed for **fresh WordPress deployments**.
- Site-specific code/assets come from a **separate application repository**.
- Backup/media S3 patterns are generic and must be configured per account.

## First Deployment Outcome

The `Provision + Configure` workflow will:

1. Provision Lightsail instance, static IP, load balancer, and TLS certificate
2. Create Route53 records for certificate validation and A records
3. Configure WordPress using Ansible
4. Output endpoint information via workflow logs

After deployment, complete WordPress setup at:

- `https://example.com/wp-admin/install.php` (replace with your domain)
