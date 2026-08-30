# SSH Key Setup Guide

## Your SSH Keys

Located at:

- **Private key**: `~/.ssh/wordpress_platform_key` (keep secret!)
- **Public key**: `~/.ssh/wordpress_platform_key.pub` (upload to AWS)

## What Uses the SSH Key?

**Ansible** uses the SSH key to connect to your Lightsail instance and configure WordPress.

The workflow does this:

1. Terraform/OpenTofu provisions Lightsail instance with the key pair
2. Ansible connects via SSH using the private key
3. Ansible runs playbooks (install nginx, PHP, WordPress, etc.)

## Setup Steps

### ⚠️ Important: Lightsail Key Pair Workflow

Lightsail is different from EC2 - you **cannot** pre-upload keys. The key pair must be created **during or before** instance creation.

**OpenTofu handles this automatically!** When you run `tofu apply`, it will:

1. Create the key pair in Lightsail from your public key
2. Attach it to the instance during creation

### 1. Verify Your Public Key Location

Make sure your public key exists:

```bash
cat ~/.ssh/wordpress_platform_key.pub
```

The default path is already configured in `terraform/variables.tf`:

```hcl
variable "public_key_path" {
  default = "~/.ssh/wordpress_platform_key.pub"
}
```

**If your key is in a different location**, override it:

```bash
# In terraform.tfvars
public_key_path = "/path/to/your/key.pub"

# Or when running tofu apply
tofu apply -var="public_key_path=/path/to/your/key.pub"
```

### 2. Store Private Key in GitHub

1. Copy the **entire** private key including headers:

   ```bash
   cat ~/.ssh/wordpress_platform_key
   ```

2. Go to: `https://github.com/your-org/wordpress-lightsail-platform/settings/secrets/actions`

3. Click "New repository secret"

4. **Name**: `LIGHTSAIL_SSH_PRIVATE_KEY`

5. **Value**: Paste the entire private key content:

   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   [all the encoded content]
   -----END OPENSSH PRIVATE KEY-----
   ```

6. Click "Add secret"

**That's it!** No need to manually upload to Lightsail - OpenTofu does it automatically.

### 3. When You Run OpenTofu

## How It Works in CI/CD

The GitHub Actions workflow (`.github/workflows/provision-and-configure.yml`):

```yaml
- name: Write SSH key
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.LIGHTSAIL_SSH_PRIVATE_KEY }}" > ~/.ssh/lightsail_key
    chmod 600 ~/.ssh/lightsail_key

- name: Create inventory from OpenTofu output
  run: |
    cat <<EOF > /tmp/inventory.ini
    [lightsail]
    lightsail-host ansible_host=${{ needs.opentofu.outputs.static_ip }} ansible_ssh_private_key_file=~/.ssh/lightsail_key
    EOF

- name: Run Ansible site playbook
  run: |
    ansible-playbook -i /tmp/inventory.ini \
        --vault-password-file /tmp/.vault-pass \
        ansible/site.yml
```

## Security Notes

✅ **Private key is encrypted** in GitHub Secrets  
✅ **Only available during workflow runs** with proper permissions  
✅ **Temporary file deleted** when runner terminates  
✅ **chmod 600** ensures only the runner can read it  
✅ **Never committed to git** (.gitignore protects local keys)

## Testing Locally

To test SSH connection before running workflows:

```bash
# Get your Lightsail instance IP (after running tofu apply)
cd terraform
STATIC_IP=$(tofu output -raw static_ip)

# Test SSH connection
ssh -i ~/.ssh/wordpress_platform_key ubuntu@$STATIC_IP

# Test Ansible connection
cd ../ansible
ansible lightsail \
  -i inventory/dev.ini \
  -m ping \
  --private-key ~/.ssh/wordpress_platform_key
```

## Troubleshooting

**"Permission denied (publickey)"**

- Make sure public key is uploaded to Lightsail with correct name
- Verify `key_pair_name` variable matches the name in Lightsail
- Check private key permissions: `chmod 600 ~/.ssh/wordpress_platform_key`

**"Host key verification failed"**

- Add to ansible.cfg:
  ```ini
  [defaults]
  host_key_checking = False
  ```

**"Authentication failed"**

- Verify you copied the **entire** private key including headers/footers
- Check for extra spaces or newlines when pasting into GitHub
