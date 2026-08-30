# Ansible

Primary configuration engine for the Lightsail WordPress build.

## Quick layout

- `inventory/` — dev/prod targets
- `group_vars/` — shared variables
- `roles/` — reusable tasks
- `playbooks/` — workflow orchestration

## Secrets best practices (Ansible Vault)

Use Ansible Vault to store secrets like database passwords.

- Copy `group_vars/wordpress.vault.yml.example` to `group_vars/wordpress.vault.yml`.
- Encrypt the real file with Ansible Vault.
- Keep the vault password in a secure local password manager (never in git).

When running playbooks, supply the vault password interactively or via a local vault password file.

### Vault usage sample

```bash
# Encrypt the vault file
ansible-vault encrypt ansible/group_vars/wordpress.vault.yml

# Run a playbook with the vault password file
ansible-playbook -i ansible/inventory/dev.ini \
	--vault-password-file ~/.vault-pass ansible/site.yml
```

### Local-only vault file (sample path)

For a private workflow, you can keep the real vault file outside the repo and point Ansible at it when running locally. Example:

- Place it anywhere (e.g., `~/secrets/wp/wordpress.vault.yml`).
- Run with `-e @/path/to/wordpress.vault.yml` or update `ANSIBLE_VAULT_PASSWORD_FILE` for your local shell.

The repo only needs the example file; the real vault file can remain private and ignored.

## CI/CD notes

If you use the GitHub Actions workflow `provision-and-configure.yml`, set these repository secrets:

- `ANSIBLE_VAULT_PASSWORD` — vault password for decrypting `group_vars/wordpress.vault.yml`
- `LIGHTSAIL_SSH_PRIVATE_KEY` — private key that matches the Lightsail key pair used by Terraform
