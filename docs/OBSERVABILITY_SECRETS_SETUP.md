# GitHub Secrets Setup for Observability

Before running the `deploy-observability.yml` workflow, you need to configure the following GitHub secret.

## Required Secret

### `ALERT_EMAIL`

**Purpose**: Email address for receiving CloudWatch alarm notifications via SNS

**How to add:**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter:
   - **Name**: `ALERT_EMAIL`
   - **Secret**: `thebasictek@gmail.com` (or your preferred email)
5. Click **Add secret**

## Existing Secrets (Already Configured)

These secrets should already be configured from the infrastructure deployment:

- ✅ `LIGHTSAIL_SSH_PRIVATE_KEY` - SSH key for Ansible
- ✅ `ANSIBLE_VAULT_PASSWORD` - Vault password for encrypted vars

## Existing Variables (Already Configured)

These variables should already be configured:

- ✅ `AWS_ROLE_ARN_CDK` - IAM role for CDK deployments
- ✅ `AWS_ROLE_ARN_TERRAFORM` - IAM role for Terraform/OpenTofu

## Verification

After adding the secret, verify it's configured:

```bash
# Go to repository Settings → Secrets and variables → Actions
# You should see:
# - ALERT_EMAIL (Secret)
# - ANSIBLE_VAULT_PASSWORD (Secret)
# - LIGHTSAIL_SSH_PRIVATE_KEY (Secret)
```

## How It's Used

The `ALERT_EMAIL` secret is used by the observability workflow:

```yaml
# .github/workflows/deploy-observability.yml
- name: Deploy Alerts Stack
  run: |
    npx cdk deploy LightsailAlertsStack \
      --parameters AlertEmail=${{ secrets.ALERT_EMAIL }}
```

This creates an SNS topic subscription and sends a confirmation email to the provided address.

## Important Notes

1. **Email Confirmation Required**: After deploying AlertsStack, you MUST check your email and click the confirmation link to receive alerts.

2. **Spam Folder**: The AWS confirmation email might end up in spam. Search for "AWS Notification - Subscription Confirmation"

3. **Email Address Format**: Must be a valid email address (example: `user@domain.com`)

4. **Changing Email**: To change the alert email:
   - Update the `ALERT_EMAIL` secret in GitHub
   - Re-run the `deploy-observability.yml` workflow with "Deploy Alerts Stack" enabled
   - Confirm the new subscription via email

## Testing

After setup, test the workflow:

```bash
# Go to Actions → Deploy Observability Stacks (CDK) → Run workflow
# Select which stacks to deploy (all enabled by default)
# Click "Run workflow"
```

Expected result:

- All 3 stacks deploy successfully
- Email confirmation arrives
- Dashboard shows metrics
- Canary starts running within 5 minutes

---

**Last Updated**: June 13, 2026
