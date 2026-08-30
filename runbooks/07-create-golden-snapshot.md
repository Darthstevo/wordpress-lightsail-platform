# Runbook 07 — Create Golden Snapshot

## Goal

Create a snapshot after a clean, validated build.

## Inputs

- Validation report
- Snapshot naming convention

## Steps

1. Run snapshot prep playbook.
2. Create Lightsail snapshot.
3. Record snapshot ID and metadata.

## Validation

- Snapshot shows “available”.
- Snapshot is tagged appropriately.

## Artifacts

- Snapshot ID
