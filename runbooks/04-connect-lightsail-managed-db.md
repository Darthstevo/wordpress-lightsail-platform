# Runbook 04 — Connect Lightsail Managed DB

## Goal

Point WordPress to the managed database instance.

## Inputs

- DB endpoint, name, user, and password
- TLS/CA bundle if required

## Steps

1. Update `wp-config.php` with DB settings.
2. Validate network connectivity to the DB endpoint.
3. Confirm WordPress can read/write tables.

## Validation

- DB connectivity check passes.
- WordPress loads without DB errors.

## Artifacts

- Updated `wp-config.php`
