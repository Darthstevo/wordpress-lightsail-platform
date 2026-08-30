# Runbook 06 — Validate Platform

## Goal

Run a full validation pass of the WordPress platform.

## Inputs

- Base URL
- Validation checklist

## Steps

1. Run service checks (nginx/php-fpm/mysql).
2. Run HTTP and health checks.
3. Confirm admin login and key pages.

## Validation

- All checks pass.
- No critical errors in logs.

## Artifacts

- Validation report
