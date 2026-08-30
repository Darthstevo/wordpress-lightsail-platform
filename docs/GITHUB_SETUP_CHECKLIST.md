# GitHub Setup Checklist

Track your progress setting up GitHub Secrets and Variables for CI/CD workflows.

## 📋 Setup Checklist

### ✅ Prerequisites (Already Complete)

- [x] Repository created: `your-org/wordpress-lightsail-platform`
- [x] Repository visibility reviewed (public template or private fork)
- [x] Ansible vault file encrypted
- [x] SSH key pair generated (`~/.ssh/lightsail_blog_key`)

### 🔐 GitHub Secrets (Required)

Go to: `https://github.com/your-org/wordpress-lightsail-platform/settings/secrets/actions`

- [ ] **ANSIBLE_VAULT_PASSWORD**
  - Value: The password you used to encrypt `ansible/group_vars/wordpress.vault.yml`
  - Where to find: Your password manager (store it if you haven't!)
  - Test command: `ansible-vault view ansible/group_vars/wordpress.vault.yml --vault-password-file <(echo 'YOUR_PASSWORD')`

- [ ] **LIGHTSAIL_SSH_PRIVATE_KEY**
  - Value: Entire contents of `~/.ssh/lightsail_blog_key` (including `-----BEGIN/END-----` lines)
  - Get it: `cat ~/.ssh/lightsail_blog_key`
  - Must include: Headers, footers, all encoded content, newlines

### 📊 GitHub Variables (Required)

Go to: `https://github.com/your-org/wordpress-lightsail-platform/settings/secrets/actions` (Variables tab)

- [ ] **AWS_ROLE_ARN_TERRAFORM**
  - Value: ARN of your IAM role for Terraform/OpenTofu
  - Format: `arn:aws:iam::123456789012:role/GitHubActions-Terraform-Role`
  - See: `docs/iam/README.md` for setup instructions

- [ ] **AWS_ROLE_ARN_CDK**
  - Value: ARN of your IAM role for CDK
  - Format: `arn:aws:iam::123456789012:role/GitHubActions-CDK-Role`
  - See: `docs/iam/README.md` for setup instructions

### ☁️ AWS Setup (Required)

- [ ] **Verify SSH Public Key Exists Locally**
  - Location: `~/.ssh/lightsail_blog_key.pub`
  - Test: `cat ~/.ssh/lightsail_blog_key.pub`
  - Note: OpenTofu will create the Lightsail key pair automatically from this file
  - See: `docs/SSH_SETUP.md` for details

- [ ] **Create OIDC Identity Provider** (one-time)
  - Provider URL: `https://token.actions.githubusercontent.com`
  - Audience: `sts.amazonaws.com`
  - See: `docs/iam/README.md` for instructions

- [ ] **Create IAM Role for Terraform/OpenTofu**
  - Role name: `GitHubActions-Terraform-Role`
  - Policy: Use `docs/iam/terraform-role-policy.json`
  - Trust relationship: Limit to `your-org/wordpress-lightsail-platform`
  - Copy ARN → Add to GitHub Variables

- [ ] **Create IAM Role for CDK**
  - Role name: `GitHubActions-CDK-Role`
  - Policy: Use `docs/iam/cdk-role-policy.json`
  - Trust relationship: Limit to `your-org/wordpress-lightsail-platform`
  - Copy ARN → Add to GitHub Variables

### 🔧 Configuration (Before Running Workflows)

- [ ] **Update terraform/terraform.tfvars** or pass variables (optional, defaults are set):

  ```hcl
  # Only override if different from defaults
  public_key_path = "~/.ssh/wordpress_platform_key.pub"  # default
  key_pair_name = "wordpress-platform-key"                # default
  route53_zone_id = "Z0123456789ABCDEFGHIJ"           # REQUIRED - your hosted zone ID
  certificate_domain_name = "yourdomain.com"           # REQUIRED - your domain
  certificate_alternative_names = []                   # optional SANs
  ```

- [ ] **Verify Ansible inventory** (`ansible/inventory/dev.ini`):

  ```ini
  # Local testing: uncomment and set real IP
  # lightsail ansible_host=YOUR.IP.ADDRESS ansible_ssh_private_key_file=~/.ssh/lightsail_platform_key

  # CI/CD: workflow will inject this dynamically
  lightsail ansible_host=LIGHTSAIL_STATIC_IP ansible_ssh_private_key_file=~/.ssh/lightsail_key
  ```

## 🧪 Testing Before Workflows

### Test OpenTofu Locally

```bash
cd terraform

# Initialize
tofu init

# Plan (dry run)
tofu plan \
  -var="key_pair_name=wordpress-platform-key" \
  -var="route53_zone_id=YOUR_ZONE_ID"

# Apply (if plan looks good)
tofu apply \
  -var="key_pair_name=wordpress-platform-key" \
  -var="route53_zone_id=YOUR_ZONE_ID"
```

### Test Ansible Locally

```bash
cd ansible

# Get Lightsail IP from OpenTofu
cd ../terraform
STATIC_IP=$(tofu output -raw static_ip)
cd ../ansible

# Test vault decryption
ansible-vault view group_vars/wordpress.vault.yml

# Test connection
ansible lightsail \
  -i inventory/dev.ini \
  -m ping \
  --private-key ~/.ssh/lightsail_platform_key \
  -e "ansible_host=$STATIC_IP"

# Run playbook
ansible-playbook \
  -i inventory/dev.ini \
  --vault-password-file .vault-pass \
  --private-key ~/.ssh/lightsail_blog_key \
  -e "ansible_host=$STATIC_IP" \
  site.yml
```

## 🚀 Enable Workflows

Once all checkboxes above are complete:

```bash
# Rename workflows to enable them
mv .github/workflows/provision-and-configure.yml.disabled \
   .github/workflows/provision-and-configure.yml

mv .github/workflows/cdk-deploy.yml.disabled \
   .github/workflows/cdk-deploy.yml

mv .github/workflows/cdk-destroy.yml.disabled \
   .github/workflows/cdk-destroy.yml

# Commit and push
git add .github/workflows/
git commit -m "Enable deployment workflows"
git push
```

## 📚 Documentation Reference

- **IAM Setup**: `docs/iam/README.md`
- **SSH Keys**: `docs/SSH_SETUP.md`
- **Ansible**: `ansible/README.md`
- **Terraform/OpenTofu**: `terraform/README.md`
- **CDK**: `cdk/README.md`

## ⚠️ Important Notes

- **Don't enable workflows until all secrets/variables are set** - they will fail
- **Test locally first** - easier to debug than in CI/CD
- **Keep vault password safe** - store in password manager (Bitwarden recommended)
- **Never commit real secrets** - keep vault password and private key in secure secret stores
- **Review IAM trust relationships** - ensure limited to your repo only

## 🆘 Need Help?

If stuck, check:

1. Workflow logs in GitHub Actions tab
2. AWS CloudTrail for permission issues
3. Ansible verbose output: add `-vvv` flag
4. OpenTofu debug: `TF_LOG=DEBUG tofu plan`
