# Runbook 09 — Rebuild Platform From Scratch

## Goal

Rebuild the platform using the full Ansible workflow.

## Inputs

- Fresh Lightsail instance
- Ansible inventory
- Backup source

## Steps

1. Bootstrap the host.
2. Install WordPress stack.
3. Restore content and DB.
4. Validate and snapshot.

## Validation

- All runbooks complete successfully.

## Artifacts

- Build log
- Snapshot ID
