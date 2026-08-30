# Ansible Validation Guide

Use this guide to extend `ansible/roles/validation` with additional checks.

## Suggested checks

- Verify backup artifacts exist before restore (`stat` on archive paths)
- List tar contents and assert presence of `wp-content/plugins` and `wp-content/themes`
- Check MySQL/MariaDB service status
- Validate HTTP response from WordPress home page
- Confirm DB connectivity to local database

## Example modules

- `ansible.builtin.stat`
- `ansible.builtin.command` (tar -tzf)
- `ansible.builtin.assert`
- `ansible.builtin.uri`
- `ansible.builtin.wait_for`
