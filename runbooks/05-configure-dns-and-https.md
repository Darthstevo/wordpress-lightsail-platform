# Runbook 05 — Configure DNS and HTTPS

## Goal

Point DNS to Lightsail and enable HTTPS.

## Inputs

- Domain name and hosted zone
- Certificate strategy (Lightsail, ACM, or Let’s Encrypt)

## Steps

1. Create or update Route 53 records.
2. Install or request TLS certificate.
3. Configure web server for HTTPS.

## Validation

- DNS resolves to the Lightsail IP.
- HTTPS endpoint responds with valid cert.

## Artifacts

- DNS change log
- Certificate details
