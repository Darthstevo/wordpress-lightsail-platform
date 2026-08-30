# Runbook 02 — Bootstrap Server With Ansible

## Goal

Apply baseline OS configuration and prepare the host for WordPress setup.

## Inputs

- Inventory entry for target host
- SSH key path
- Ansible control machine

## Secrets (Ansible Vault)

1. Copy `ansible/group_vars/wordpress.vault.yml.example` to `ansible/group_vars/wordpress.vault.yml`.
2. Encrypt the file:
   - `ansible-vault encrypt ansible/group_vars/wordpress.vault.yml`
3. Run playbooks with vault support:
   - `ansible-playbook ansible/playbooks/bootstrap.yml --ask-vault-pass`

## Steps

1. Add host to `ansible/inventory/dev.ini` or `prod.ini`.
2. Run the bootstrap playbook.
3. Confirm packages, timezone, and base utilities.

## Validation

- Ansible play completes without errors.
- Core packages and updates are installed.

## Artifacts

- Updated inventory
- Ansible run log
