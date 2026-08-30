# Runbook 01 — Build Lightsail Instance

## Goal

Provision a Lightsail instance and capture its access details.

## Inputs

- AWS account and region
- Instance blueprint + bundle size
- SSH key pair name

## Steps

1. Create the Lightsail instance.
2. Attach or create the SSH key pair.
3. Assign a static IP and note the address.
4. Record hostname, IP, and login user.

## Validation

- Able to SSH into the instance.
- Instance shows “running” in Lightsail console.

## Artifacts

- Instance ID
- Static IP
- SSH key location
