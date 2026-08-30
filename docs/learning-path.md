# Learning Path (Ansible + CDK)

This guide is meant to help you learn while building the Lightsail blog platform.

## Ansible milestones

### 1) Inventory + connection basics

**Goal:** connect to a host and run a simple task.

- Edit `ansible/inventory/dev.ini` with a real host
- Run a ping:
  - `ansible -i ansible/inventory/dev.ini lightsail -m ping`

**Concepts:** inventory, host groups, modules

### 2) Bootstrap playbook

**Goal:** understand play structure and roles.

- Open `ansible/playbooks/bootstrap.yml`
- Inspect role `ansible/roles/common/tasks/main.yml`

**Concepts:** playbooks, roles, tasks, variables

### 3) Web stack setup

**Goal:** install nginx + php and serve WordPress.

- Run `ansible/playbooks/wordpress.yml`
- Inspect `ansible/templates/nginx-wordpress.conf.j2`

**Concepts:** templates, handlers, service control

### 4) Restore workflow

**Goal:** move backup data into place.

- Check `ansible/roles/restore/tasks/main.yml`
- Update `wp_backup_archive` in `ansible/group_vars/wordpress.yml`

**Concepts:** file transfers, restore orchestration

### 5) Validation

**Goal:** verify that the stack works end-to-end.

- Run `ansible/playbooks/validate.yml`
- Review `ansible/roles/validation/tasks/main.yml`

**Concepts:** assertions, health checks, HTTP checks

## CDK milestones

### 1) Read the project layout

**Goal:** understand CDK app structure.

- `cdk/bin/lightsail-blog-platform.ts` (entrypoint filename; logical stack names are template-safe)
- `cdk/lib/route53-stack.ts`

**Concepts:** app, stack, constructs

### 2) Build Route 53 record

**Goal:** create a single A record pointing to the Lightsail IP.

- Add a hosted zone lookup
- Create an `ARecord`

**Concepts:** stack props, hosted zone, records

### 3) Add monitoring

**Goal:** add a simple alarm for HTTP checks.

- Build a CloudWatch alarm
- (Optional) SNS notification

**Concepts:** alarms, metrics, notifications

## Weekly learning loop

1. Pick 1–2 tasks per week.
2. Run the playbook or synth in CI.
3. Write down what broke and what you learned in `docs/lessons-learned.md`.
