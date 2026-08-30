# Runbook 08 — Recover From Snapshot

## Goal

Restore the platform from a golden snapshot.

## Inputs

- Snapshot ID
- Replacement instance plan

## Steps

1. Create instance from snapshot.
2. Re-attach static IP.
3. Re-run validation checks.

## Validation

- Instance is running and reachable.
- Validation checks pass.

## Artifacts

- Recovery log
