# Runbook 11 — Monthly Patching & Backups

## Goal

Apply OS/DB updates and capture a recovery snapshot.

## Inputs

- Lightsail instance access
- Ansible control host
- Backup destination (snapshot + optional archive location)

## Steps

1. Start the Lightsail instance if it is stopped.
2. Run the Ansible patch playbook to apply OS/DB updates.
3. Verify MySQL/MariaDB service is healthy.
4. Run validation checks.
5. Create a Lightsail snapshot (golden snapshot).
6. Stop the instance if you don’t need it running.

## Validation

- Updates complete without errors.
- WordPress loads and DB is reachable.
- Snapshot shows “available”.

## Artifacts

- Snapshot ID
- Update log (Ansible output)
