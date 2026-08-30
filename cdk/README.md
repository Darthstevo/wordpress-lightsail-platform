# CDK Observability Stacks

Production-oriented monitoring, alerting, and synthetic uptime checks for the WordPress Lightsail Platform.

This CDK package is an **optional enhancement layer**. Core platform provisioning and runtime configuration remain in OpenTofu/Terraform and Ansible.

## Architecture

This CDK app deploys **3 observability stacks** in order:

1. **LightsailMonitoringStack** - CloudWatch Dashboard with real-time metrics
2. **LightsailAlertsStack** - CloudWatch Alarms + SNS email notifications
3. **LightsailSyntheticMonitoringStack** - Active uptime monitoring with Puppeteer canary

## Quick Start

### Prerequisites

- Lightsail infrastructure deployed (wordpress-dev-1 instance, wordpress-dev-lb load balancer)
- Website accessible via HTTPS
- AWS CDK CLI installed (`npm install -g aws-cdk`)

### Deploy All Stacks

```bash
cd cdk
npm install

# Deploy monitoring + alerts (no dependency)
npx cdk deploy LightsailMonitoringStack LightsailAlertsStack \
  --parameters LightsailMonitoringStack:InstanceName=wordpress-dev-1 \
  --parameters LightsailMonitoringStack:LoadBalancerName=wordpress-dev-lb \
  --parameters LightsailAlertsStack:InstanceName=wordpress-dev-1 \
  --parameters LightsailAlertsStack:LoadBalancerName=wordpress-dev-lb \
  --parameters LightsailAlertsStack:AlertEmail=your-email@example.com

# Get SNS Topic ARN from AlertsStack output
TOPIC_ARN=$(aws cloudformation describe-stacks \
  --stack-name LightsailAlertsStack \
  --query 'Stacks[0].Outputs[?OutputKey==`AlertTopicArn`].OutputValue' \
  --output text)

# Deploy synthetic monitoring with Topic ARN
npx cdk deploy LightsailSyntheticMonitoringStack \
  --parameters WebsiteUrl=https://example.com \
  --parameters AlertTopicArn=$TOPIC_ARN
```

**Important**: Confirm the SNS email subscription after deploying AlertsStack!

## Stack Details

### 1. MonitoringStack

**Metrics Dashboard** - Visualize infrastructure health

- Instance: CPU, Network I/O, Status checks
- Load Balancer: Healthy/Unhealthy hosts, Request count, Response time
- Cost: ~$3/month

### 2. AlertsStack

**Proactive Alerting** - Get notified before users notice issues

- 5 CloudWatch Alarms: HighCPU, UnhealthyTargets, NoHealthyTargets, StatusCheckFailure, HighResponseTime
- SNS Topic with email notifications
- Cost: ~$1/month (first 10 alarms free)

### 3. SyntheticMonitoringStack

**Active Uptime Monitoring** - Simulate real user traffic

- Canary runs every 5 minutes via Puppeteer
- Screenshots + HAR files on failure
- S3 artifacts bucket (7-day retention)
- Alarm on 2 consecutive failures
- Cost: ~$5-10/month

**Total Cost**: roughly ~$9-14/month for this observability layer (varies by usage)

## Deployment Order

```
Infrastructure (OpenTofu/Terraform)
         ↓
    [Lightsail Resources Created]
         ↓
┌────────────────────────────────┐
│  CDK Observability Stacks      │
├────────────────────────────────┤
│ 1. MonitoringStack             │ ← Deploy first (no dependencies)
│ 2. AlertsStack                 │ ← Deploy second (creates SNS topic)
│ 3. SyntheticMonitoringStack    │ ← Deploy last (needs SNS ARN)
└────────────────────────────────┘
```

## Post-Deployment

### 1. Confirm SNS Subscription

Check your email and click "Confirm subscription" link.

### 2. View Dashboard

```bash
aws cloudformation describe-stacks \
  --stack-name LightsailMonitoringStack \
  --query 'Stacks[0].Outputs[?OutputKey==`DashboardURL`].OutputValue' \
  --output text
```

### 3. Check Canary Status

Wait 5 minutes, then check canary runs in CloudWatch Synthetics console.

## Development

```bash
# Synthesize CloudFormation templates
npm run build
npx cdk synth

# View diff before deploy
npx cdk diff LightsailMonitoringStack

# Deploy specific stack
npx cdk deploy LightsailAlertsStack

# Destroy all stacks
npx cdk destroy --all
```

## Documentation

Full documentation: **[docs/OBSERVABILITY_STACKS.md](../docs/OBSERVABILITY_STACKS.md)**

Includes:

- Architecture diagrams
- Detailed stack descriptions
- Cost breakdown
- Monitoring best practices
- Troubleshooting guide
- CI/CD integration examples

## Integration with Workflows

The main destroy workflow (`.github/workflows/destroy-all.yml`) already includes CDK destroy.

For deployment, you can:

1. Deploy manually after infrastructure provisioning
2. Add a CDK deploy job to `provision-and-configure.yml`
3. Create a separate observability deployment workflow

See [OBSERVABILITY_STACKS.md](../docs/OBSERVABILITY_STACKS.md#integration-with-cicd) for examples.

## Troubleshooting

### Canary Always Failing

- Verify website URL is correct and accessible
- Check TLS certificate is valid
- Review screenshots in S3 artifacts bucket

### No Metrics Showing

- Verify instance/LB names match exactly
- Wait 5-10 minutes for first data points
- Check IAM permissions

### Stack Deployment Fails

```bash
# Bootstrap CDK (one-time per account/region)
cdk bootstrap

# Check IAM permissions
aws sts get-caller-identity

# View detailed errors
npx cdk deploy --verbose
```

## Cost Optimization

To reduce costs:

- Change canary frequency from 5min → 15min (reduces runs by 66%)
- Reduce S3 retention from 7 days → 3 days
- Remove SyntheticMonitoringStack entirely (saves ~$5-10/month)

Monitoring + Alerts stacks are a lower-cost entry point for teams that want visibility without full synthetic monitoring.

## ACM note

Your ACM certificate is already in place. These stacks only manage Route 53 records and a CloudWatch dashboard; they do **not** create or modify ACM certificates. The cert is used by whatever front door terminates TLS (e.g., an ALB, CloudFront, or Lightsail load balancer) that you manage separately.
