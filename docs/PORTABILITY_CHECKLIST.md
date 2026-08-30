# Portability Checklist

Use this before the first deployment in a new AWS account.

## Before first deploy

- [ ] Fork/clone into your own org/repo (for example `your-org/wordpress-lightsail-platform`)
- [ ] Create Route53 hosted zone for your domain
- [ ] Create IAM OIDC provider for GitHub Actions (`token.actions.githubusercontent.com`)
- [ ] Create IAM roles from `docs/iam/terraform-role-policy.json` and `docs/iam/cdk-role-policy.json`
- [ ] Add required GitHub variables and secrets
- [ ] Copy and fill example files:
  - `terraform/terraform.tfvars.example` → `terraform/terraform.tfvars`
  - `ansible/group_vars/wordpress.vault.yml.example` → `ansible/group_vars/wordpress.vault.yml`
  - `.env.example` → `.env` (optional local helper)

## Required variables/secrets

### Variables

- `AWS_ROLE_ARN_TERRAFORM`
- `AWS_ROLE_ARN_CDK`
- `AWS_REGION`
- `AWS_AVAILABILITY_ZONE`
- `WP_DOMAIN`
- `WP_ALT_NAMES`
- `ROUTE53_ZONE_ID`
- `ROUTE53_A_RECORD_NAMES`
- `LIGHTSAIL_INSTANCE_NAME`
- `LIGHTSAIL_STATIC_IP_NAME`
- `LIGHTSAIL_LOAD_BALANCER_NAME`
- `LIGHTSAIL_KEY_PAIR_NAME`
- `LIGHTSAIL_CERTIFICATE_NAME`

### Secrets

- `LIGHTSAIL_SSH_PRIVATE_KEY`
- `ANSIBLE_VAULT_PASSWORD`
- `ALERT_EMAIL` (only if deploying observability alerts)

## Known assumptions

- This repository provisions **platform/infrastructure** only.
- This repository targets **fresh WordPress deployments**.
- Themes/plugins/site artifacts are delivered from a separate app repository.
- Observability is optional and deploys as separate CDK stacks.
- S3 references are examples for backups/media patterns and must be replaced for your account.
