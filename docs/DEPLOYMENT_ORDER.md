# Deployment Order - Quick Reference

## Complete Infrastructure Deployment

Follow this order to deploy the full WordPress Lightsail Platform template with observability.

---

## Phase 1: Infrastructure (OpenTofu/Terraform)

**Deploy via GitHub Actions workflow:**

```
Workflow: provision-and-configure.yml
```

**What it deploys:**

1. Lightsail instance (`wordpress-dev-1`)
2. Static IP (`wordpress-dev-ip`)
3. Load balancer (`wordpress-dev-lb`)
4. TLS certificate
5. Route53 DNS records
6. WordPress configuration (Ansible)

**Duration:** ~10-15 minutes

---

## Phase 2: Observability (CDK)

**Deploy in this order:**

### Step 1: Monitoring Stack

```bash
cd cdk
npm install

npx cdk deploy LightsailMonitoringStack \
  --parameters InstanceName=wordpress-dev-1 \
  --parameters LoadBalancerName=wordpress-dev-lb
```

**What it creates:**

- CloudWatch Dashboard with metrics
- Real-time graphs for CPU, Network, LB health

**Duration:** ~2-3 minutes

---

### Step 2: Alerts Stack

```bash
npx cdk deploy LightsailAlertsStack \
  --parameters InstanceName=wordpress-dev-1 \
  --parameters LoadBalancerName=wordpress-dev-lb \
  --parameters AlertEmail=your-email@example.com
```

**What it creates:**

- 5 CloudWatch Alarms
- SNS Topic for notifications
- Email subscription

**Duration:** ~2-3 minutes

**Action Required:** Check email and confirm SNS subscription!

---

### Step 3: Synthetic Monitoring Stack

```bash
# Get SNS Topic ARN from previous step
TOPIC_ARN=$(aws cloudformation describe-stacks \
  --stack-name LightsailAlertsStack \
  --query 'Stacks[0].Outputs[?OutputKey==`AlertTopicArn`].OutputValue' \
  --output text)

npx cdk deploy LightsailSyntheticMonitoringStack \
  --parameters WebsiteUrl=https://example.com \
  --parameters AlertTopicArn=$TOPIC_ARN
```

**What it creates:**

- Uptime canary (runs every 5 minutes)
- S3 bucket for screenshots/logs
- Alarm on website downtime

**Duration:** ~3-4 minutes

---

## Phase 3: Verification

### Check Dashboard

```bash
aws cloudformation describe-stacks \
  --stack-name LightsailMonitoringStack \
  --query 'Stacks[0].Outputs[?OutputKey==`DashboardURL`].OutputValue' \
  --output text
```

Open URL in browser → View real-time metrics

### Check Canary

```bash
aws cloudformation describe-stacks \
  --stack-name LightsailSyntheticMonitoringStack \
  --query 'Stacks[0].Outputs[?OutputKey==`CanaryDashboardURL`].OutputValue' \
  --output text
```

Wait 5 minutes → Canary will show successful runs

### Verify Alerts Working

```bash
# Manually trigger test alarm
aws cloudwatch set-alarm-state \
  --alarm-name Lightsail-HighCPU \
  --state-value ALARM \
  --state-reason "Testing alert system"
```

Check email → Should receive alert notification

---

## Teardown (Destroy All)

### Option 1: GitHub Actions (Recommended)

```
Workflow: destroy-all.yml
```

Destroys: OpenTofu resources + CDK stacks

### Option 2: Manual CDK Destroy

```bash
cd cdk
npx cdk destroy --all --force
```

Then destroy OpenTofu:

```bash
cd terraform
tofu destroy -auto-approve
```

---

## Stack Dependencies

```
Lightsail Infrastructure (OpenTofu)
         ↓
    [Required: Instance + LB running]
         ↓
┌─────────────────────────────────────┐
│  CDK Observability Stacks           │
├─────────────────────────────────────┤
│  1. MonitoringStack                 │  ← No dependencies
│     - CloudWatch Dashboard           │
│                                      │
│  2. AlertsStack                     │  ← No dependencies
│     - Alarms + SNS                   │
│     - Output: SNS Topic ARN          │
│           ↓                          │
│  3. SyntheticMonitoringStack        │  ← Needs AlertsStack SNS ARN
│     - Uptime Canary                  │
│     - S3 Artifacts                   │
└─────────────────────────────────────┘
```

---

## Workflow Summary

### Active Workflows

1. ✅ **provision-and-configure.yml** - Deploy Lightsail + WordPress
2. ✅ **destroy-all.yml** - Teardown everything (OpenTofu + CDK)
3. ✅ **quality-gates.yml** - CI checks (linting, validation)

### Removed Workflows (Redundant)

- ❌ `cdk-deploy.yml` - Use manual CDK commands instead
- ❌ `cdk-destroy.yml` - Included in `destroy-all.yml`

---

## Costs

| Component                   | Monthly Cost |
| --------------------------- | ------------ |
| Lightsail Instance (nano)   | $3.50        |
| Lightsail Load Balancer     | $18          |
| Static IP (attached)        | $0           |
| Route53 Hosted Zone         | $0.50        |
| **Infrastructure Subtotal** | **$22**      |
|                             |              |
| MonitoringStack             | $3           |
| AlertsStack                 | $1           |
| SyntheticMonitoringStack    | $5-10        |
| **Observability Subtotal**  | **$9-14**    |
|                             |              |
| **Total Monthly Cost**      | **$31-36**   |

Compare to managed alternatives:

- DataDog: ~$15/host/month + $8/canary = $23 (monitoring only)
- New Relic: ~$25/user/month (monitoring only)

---

## Key Files

| File                                            | Purpose                           |
| ----------------------------------------------- | --------------------------------- |
| `.github/workflows/provision-and-configure.yml` | Deploy infrastructure + WordPress |
| `.github/workflows/destroy-all.yml`             | Teardown everything               |
| `terraform/main.tf`                             | Lightsail resources               |
| `cdk/lib/monitoring-stack.ts`                   | CloudWatch dashboard              |
| `cdk/lib/alerts-stack.ts`                       | Alarms + SNS                      |
| `cdk/lib/synthetic-monitoring-stack.ts`         | Uptime canary                     |
| `docs/OBSERVABILITY_STACKS.md`                  | Complete observability docs       |

---

## Quick Links

- **Main README**: [README.md](../README.md)
- **Observability Docs**: [OBSERVABILITY_STACKS.md](OBSERVABILITY_STACKS.md)
- **CDK README**: [cdk/README.md](../cdk/README.md)
- **Pre-Deployment Checklist**: [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)

---

**Last Updated:** May 31, 2026
