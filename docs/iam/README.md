# IAM Role Policies

This folder contains the IAM policies needed for GitHub Actions OIDC authentication.

## Files

- **`terraform-role-policy.json`** - For OpenTofu/Terraform workflows (Lightsail + Route53)
- **`cdk-role-policy.json`** - For CDK workflows (Route53 + CloudWatch + SNS)

## Setup Instructions

### 1. Create Identity Provider (One-time setup)

In AWS IAM Console → Identity providers → Add provider:

- **Provider type**: OpenID Connect
- **Provider URL**: `https://token.actions.githubusercontent.com`
- **Audience**: `sts.amazonaws.com`

### 2. Create Terraform/OpenTofu Role

1. Go to IAM → Roles → Create role
2. **Trusted entity type**: Web identity
3. **Identity provider**: `token.actions.githubusercontent.com`
4. **Audience**: `sts.amazonaws.com`
5. Click Next
6. **Permissions**: Create custom policy using `terraform-role-policy.json`
7. **Role name**: `GitHubActions-Terraform-Role`
8. **Edit Trust Relationship** to limit to your repo:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:Darthstevo/lightsail-blog-platform:*"
        }
      }
    }
  ]
}
```

9. Copy the Role ARN → Add to GitHub Variables as `AWS_ROLE_ARN_TERRAFORM`

### 3. Create CDK Role

Repeat the same steps but:

- Use `cdk-role-policy.json` for permissions
- **Role name**: `GitHubActions-CDK-Role`
- Same trust relationship (limit to your repo)
- Copy the Role ARN → Add to GitHub Variables as `AWS_ROLE_ARN_CDK`

## What Each Role Does

### Terraform/OpenTofu Role (`AWS_ROLE_ARN_TERRAFORM`)

Used by: `.github/workflows/provision-and-configure.yml`

**Permissions**:

- ✅ Full Lightsail access (create instances, static IPs, load balancers, certificates)
- ✅ Route53 access (create DNS validation records for TLS certificates)

**Why separate from CDK?**: Lightsail is the main infrastructure, keeps blast radius small.

### CDK Role (`AWS_ROLE_ARN_CDK`)

Used by: `.github/workflows/cdk-deploy.yml`, `.github/workflows/cdk-destroy.yml`

**Permissions**:

- ✅ Route53 access (manage A records pointing to Lightsail)
- ✅ CloudWatch access (create dashboards, metrics, alarms)
- ✅ SNS access (create topics for alarm notifications)

**Why separate from Terraform?**: CDK manages monitoring/alerting layer, different lifecycle.

## GitHub Secrets/Variables to Set

### Secrets (Settings → Secrets → Actions)

1. `ANSIBLE_VAULT_PASSWORD` - Password for decrypting vault file
2. `LIGHTSAIL_SSH_PRIVATE_KEY` - Private SSH key (entire content including headers)

### Variables (Settings → Secrets → Actions → Variables tab)

1. `AWS_ROLE_ARN_TERRAFORM` - ARN of GitHubActions-Terraform-Role
2. `AWS_ROLE_ARN_CDK` - ARN of GitHubActions-CDK-Role

## Notes

- Both roles use OIDC (no long-lived credentials)
- Trust relationship limits access to this specific repo
- Policies follow least-privilege principle
- Route53 appears in both because Terraform needs it for cert validation
