# Deployment Configuration Summary

## ✅ Completed Setup

### GitHub Configuration

- ✅ **Variables**:
  - `AWS_ROLE_ARN_TERRAFORM` = `arn:aws:iam::688209287155:role/GitHubActions-Terraform-Role`
  - `AWS_ROLE_ARN_CDK` = `arn:aws:iam::688209287155:role/GitHubActions-CDK-Role`
- ✅ **Secrets** (set via web UI):
  - `ANSIBLE_VAULT_PASSWORD` - Vault decryption password
  - `LIGHTSAIL_SSH_PRIVATE_KEY` - SSH private key for instance access

### AWS Configuration (Account: 688209287155)

- ✅ **IAM Roles**:
  - `GitHubActions-Terraform-Role` - Lightsail + Route53 access
  - `GitHubActions-CDK-Role` - Route53 + CloudWatch + SNS access
  - OIDC Trust configured for `Darthstevo/lightsail-blog-platform`

- ✅ **Route53**:
  - Domain: `thebasictek.com`
  - Hosted Zone ID: `Z0869026ZCPNGM8HB5I6`

### Local Configuration

- ✅ **SSH Keys**:
  - Private: `~/.ssh/lightsail_blog_key`
  - Public: `~/.ssh/lightsail_blog_key.pub`
- ✅ **Ansible Vault**:
  - File: `ansible/group_vars/wordpress.vault.yml`
  - Status: Encrypted with AES256

- ✅ **OpenTofu**:
  - Version: 1.11.5
  - Initialized: Yes
  - Backend: Local state

## 📋 What Will Be Created

When you run the workflow, OpenTofu will create:

### Lightsail Resources

1. **Key Pair**: `blog-wordpress-key`
   - Created from GitHub Actions secret (LIGHTSAIL_SSH_PRIVATE_KEY)
   - Used for AWS console access (emergency/manual access)
   - Has lifecycle protection (ignore_changes) to prevent instance recreation
   - The same key is also installed via user_data for CI/CD SSH access

2. **Instance**: `blog-dev-1`
   - Blueprint: WordPress
   - Bundle: micro_2_0 ($7/month)
   - Zone: us-east-1a
   - User data installs CI/CD public key for Ansible access

3. **Static IP**: `blog-dev-ip` (attached to instance)

4. **Load Balancer**: `blog-dev-lb`
   - Port: 80
   - Health check: `/`
   - Attached to instance

5. **TLS Certificate**: `blog-dev-cert`
   - Domain: `thebasictek.com`
   - SANs: `www.thebasictek.com`
   - Validation: DNS (automated)

### Route53 Resources

6. **DNS Validation Records**: Automatically created for TLS cert validation
7. **A Record**: Points domain to Lightsail LB

### Ansible Configuration (after infrastructure)

- Nginx installation and configuration
- PHP runtime configuration
- Fresh WordPress installation and setup
- Security hardening
- SSL/TLS configuration

## 🚀 Ready to Deploy

### Deployment Workflow Patterns

The `Provision + Configure (OpenTofu + Ansible)` workflow supports two main patterns:

#### Pattern 1: Initial Deployment (From Scratch)

When deploying to a **brand new AWS environment** with no existing resources:

```bash
# Trigger workflow with defaults
gh workflow run "Provision + Configure (OpenTofu + Ansible)"
```

**Workflow Inputs:**

- `manage_key_pair`: `false` (default) - Use existing key pair or auto-detect
- `adopt_existing`: `false` (default) - Create new resources

**What Happens:**

1. ✅ Creates SSH key pair in AWS from `LIGHTSAIL_SSH_PRIVATE_KEY` secret
2. ✅ Creates all Lightsail infrastructure (instance, LB, cert, etc.)
3. ✅ Creates Route53 DNS records
4. ✅ Runs Ansible to configure WordPress

#### Pattern 2: Adopting Existing Infrastructure

When you have **existing Lightsail resources** you want to manage with OpenTofu:

```bash
# First run: Import existing resources into OpenTofu state
gh workflow run "Provision + Configure (OpenTofu + Ansible)" \
  -f adopt_existing=true \
  -f manage_key_pair=false
```

**What Happens:**

1. ✅ Imports existing Lightsail resources (instance, LB, static IP, cert, etc.)
2. ✅ Imports existing Route53 A record (if exists)
3. ✅ Runs OpenTofu apply (should show "no changes")
4. ✅ Imports Route53 validation records (if exist)
5. ✅ SSH to instance and run Ansible configuration

**After first adoption run:**

```bash
# Subsequent runs: Normal deployment (adoption no longer needed)
gh workflow run "Provision + Configure (OpenTofu + Ansible)"
```

### ⚠️ Important: SSH Key Pair Management

**Dual-Key Approach for Zero-Downtime CI/CD:**

The infrastructure uses a dual-key approach to enable true CI/CD without instance recreation:

1. **Lightsail Key Pair** (`blog-wordpress-key`):
   - Created as a Terraform resource (required by AWS Lightsail)
   - Used for AWS console access (emergency/manual SSH)
   - Has `lifecycle { ignore_changes = [public_key] }` protection
   - This prevents instance recreation when keys change

2. **CI/CD SSH Key** (via user_data):
   - Installed directly into `/home/ubuntu/.ssh/authorized_keys`
   - Used by Ansible for automated configuration
   - Both keys use the same public key from `LIGHTSAIL_SSH_PRIVATE_KEY` secret
   - User data runs on first boot and installs the key

**Why Both Keys?**

- AWS Lightsail requires a key pair name at instance creation (can't be null)
- Managing the key pair as a Terraform resource would normally cause instance recreation on updates
- The lifecycle protection keeps the Terraform resource but ignores changes
- User data provides the actual SSH access for automation without touching the managed resource
- This gives us both console access AND CI/CD automation without downtime

**If SSH fails with "Permission denied (publickey)":**

1. **Check the key exists in AWS:**

   ```bash
   aws lightsail get-key-pairs --query 'keyPairs[].name'
   ```

2. **Verify the secret matches:**
   - The `LIGHTSAIL_SSH_PRIVATE_KEY` GitHub secret must be the private key
   - The workflow generates the public key from this automatically

3. **If starting fresh:**
   - Run the provision workflow - it will create everything including the key pair
   - The key pair is now always managed by Terraform with lifecycle protection

**Check in CloudShell:**

```bash
# List existing key pairs
aws lightsail get-key-pairs --query 'keyPairs[].name'

# View instance user data (to see if CI/CD key was installed)
aws lightsail get-instance --instance-name blog-dev-1 --query 'instance.userData'
```

### Deployment Timing

- **First deployment (from scratch)**: ~10-15 minutes
  - OpenTofu infrastructure: ~5 min
  - Ansible configuration: ~5-10 min
- **Adoption deployment**: ~5-7 minutes
  - Import steps: ~1 min
  - OpenTofu apply: ~1 min
  - Ansible configuration: ~3-5 min
- **Iterative deployments**: ~3-5 minutes
  - No instance recreation (lifecycle protection)
  - Only Ansible configuration runs

- **Subsequent deployments**: ~3-5 minutes
  - OpenTofu apply (updates only): ~1-2 min
  - Ansible configuration: ~2-3 min

### Option 1: Test via GitHub Actions (Recommended)

Since the IAM role can't be assumed locally, test in GitHub Actions:

```bash
# Enable the workflow
git mv .github/workflows/provision-and-configure.yml.disabled \
       .github/workflows/provision-and-configure.yml

# Commit and push
git add .
git commit -m "Enable provision workflow with thebasictek.com domain"
git push

# Go to GitHub Actions and manually trigger the workflow
# https://github.com/Darthstevo/lightsail-blog-platform/actions
```

### Option 2: Wait and Review

Review the configuration in this summary first, then enable workflows when ready.

## 📊 Expected Costs

- Lightsail Instance (micro_2_0): ~$7/month
- Lightsail Static IP: Free (while attached)
- Lightsail Load Balancer: ~$18/month
- Lightsail TLS Certificate: Free
- Route53 Hosted Zone: $0.50/month
- Route53 Queries: ~$0.40/month (1M queries)

**Total: ~$26/month**

## ⚠️ Important Notes

1. **Domain DNS**: After deployment, you'll need to point `thebasictek.com` NS records to the Route53 hosted zone nameservers (if not already done)

2. **TLS Certificate**: Will be automatically validated via DNS once Route53 records are created

3. **WordPress Migration**: The Ansible playbook expects:
   - SQL dump at: `files/wordpress.sql`
   - wp-content at: `files/wp-content/`
4. **First Deployment**: Will take 10-15 minutes
   - Lightsail instance creation: ~3 min
   - Load balancer creation: ~2 min
   - TLS cert validation: ~5 min
   - Ansible playbook: ~5 min

## 🔍 Verification Steps

After deployment:

1. Check Lightsail console: https://lightsail.aws.amazon.com/ls/webapp/us-east-1/instances
2. Verify TLS cert status: Should show "Valid" after DNS validation
3. Test HTTPS: `https://thebasictek.com` (after DNS propagation)
4. Check WordPress admin: `https://thebasictek.com/wp-admin`

## 📚 Next Steps

Choose your deployment approach:

- **Test now**: Enable workflow and trigger via GitHub Actions
- **Review first**: Examine the configuration and proceed when ready
- **Modify**: Update any values in `terraform/terraform.tfvars` before deploying
