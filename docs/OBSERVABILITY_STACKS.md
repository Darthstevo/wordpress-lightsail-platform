# Observability Stack Documentation

## Overview

The Lightsail Blog Platform uses a **3-tier observability architecture** deployed via AWS CDK:

1. **MonitoringStack** - Real-time metrics dashboard
2. **AlertsStack** - Proactive alerting with SNS notifications
3. **SyntheticMonitoringStack** - Active uptime monitoring

These stacks provide production-grade observability, demonstrating best practices for monitoring, alerting, and incident detection.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY LAYERS                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: MONITORING (Passive Metrics Collection)            │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ CloudWatch Dashboard                                   │   │
│  │ - Instance CPU, Network, Status                        │   │
│  │ - Load Balancer Health, Requests, Response Time        │   │
│  │ - Real-time graphs and single-value widgets            │   │
│  └───────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  Layer 2: ALERTING (Threshold-based Notifications)           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ CloudWatch Alarms → SNS Topic → Email                  │   │
│  │ - High CPU (>80%)                                      │   │
│  │ - Unhealthy Targets                                    │   │
│  │ - No Healthy Targets (CRITICAL)                        │   │
│  │ - Status Check Failures                                │   │
│  │ - High Response Time (>2s)                             │   │
│  └───────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  Layer 3: SYNTHETIC MONITORING (Active Health Checks)        │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ CloudWatch Synthetics Canary (every 5 minutes)         │   │
│  │ - HTTP GET request to website                          │   │
│  │ - Screenshot on failure                                │   │
│  │ - HAR file capture                                     │   │
│  │ - Alarm on 2 consecutive failures                      │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Details

### 1. MonitoringStack (LightsailMonitoringStack)

**Purpose**: Visualize infrastructure and application metrics in real-time.

**Resources**:

- CloudWatch Dashboard with 4 rows:
  - **Row 1**: Key metrics summary (CPU, Healthy Hosts, Requests)
  - **Row 2**: Instance performance (CPU graph, Network traffic)
  - **Row 3**: Load balancer health (Host health, Response time)
  - **Row 4**: Reliability (Status check failures)

**Parameters**:

- `InstanceName` - Lightsail instance name (default: `blog-dev-1`)
- `LoadBalancerName` - Load balancer name (default: `blog-dev-lb`)
- `DashboardName` - Dashboard name (default: `wordpress-platform-dashboard`)

**Outputs**:

- Dashboard name
- Direct console link

**Cost**: ~$3/month (dashboard only, no data charges)

---

### 2. AlertsStack (LightsailAlertsStack)

**Purpose**: Detect and notify on critical issues before they impact users.

**Resources**:

- **SNS Topic** for email alerts
- **5 CloudWatch Alarms**:
  1. **HighCPU**: CPU >80% for 10 minutes (2 x 5min periods)
  2. **UnhealthyTargets**: Any unhealthy LB target (2 x 1min periods)
  3. **NoHealthyTargets**: Zero healthy targets - CRITICAL (2 x 1min periods)
  4. **StatusCheckFailure**: Instance failing status checks (2 x 1min periods)
  5. **HighResponseTime**: LB response >2 seconds (2 x 5min periods)

**Parameters**:

- `InstanceName` - Lightsail instance name
- `LoadBalancerName` - Load balancer name
- `AlertEmail` - Email for notifications (default: `alerts@example.com`)

**Outputs**:

- SNS Topic ARN (needed for SyntheticMonitoringStack)
- Number of alarms configured

**Cost**: ~$1/month (10 alarms free tier, $0.10 per alarm after)

**Note**: You must **confirm the SNS email subscription** after deployment!

---

### 3. SyntheticMonitoringStack (LightsailSyntheticMonitoringStack)

**Purpose**: Actively test website availability and performance from AWS perspective.

**Resources**:

- **CloudWatch Synthetics Canary**:
  - Runs Node.js Puppeteer script every 5 minutes
  - Performs HTTP GET to homepage
  - Takes screenshot on load
  - Captures HAR files for debugging
  - Validates HTTP status code (200-399)
- **S3 Bucket** for artifacts:
  - Screenshots (on success and failure)
  - HAR files (network traffic logs)
  - Canary logs
  - 7-day retention policy

- **CloudWatch Alarm**:
  - Triggers on 2 consecutive failures
  - Sends notification via SNS (from AlertsStack)

**Parameters**:

- `WebsiteUrl` - URL to monitor (default: `https://example.com`)
- `AlertTopicArn` - SNS Topic ARN from AlertsStack (required)

**Outputs**:

- Canary name
- Artifacts bucket name
- Direct console link to canary

**Cost**: ~$5/month (canary runs: 8,640 runs/month × $0.0012 = ~$10, first 100 free)

**Dependencies**: Requires AlertsStack to be deployed first (for SNS Topic ARN)

---

## Deployment Order

### Prerequisites

1. ✅ Lightsail infrastructure deployed (OpenTofu)
2. ✅ Instance running (`blog-dev-1`)
3. ✅ Load balancer configured (`blog-dev-lb`)
4. ✅ Website accessible via HTTPS

### Deploy All Stacks (Recommended)

```bash
cd cdk

# Install dependencies (including synthetics alpha package)
npm install

# Deploy all 3 stacks in order
npx cdk deploy --all \
  --parameters LightsailMonitoringStack:InstanceName=blog-dev-1 \
  --parameters LightsailMonitoringStack:LoadBalancerName=blog-dev-lb \
  --parameters LightsailAlertsStack:InstanceName=blog-dev-1 \
  --parameters LightsailAlertsStack:LoadBalancerName=blog-dev-lb \
  --parameters LightsailAlertsStack:AlertEmail=your-email@example.com \
  --parameters LightsailSyntheticMonitoringStack:WebsiteUrl=https://example.com \
  --parameters LightsailSyntheticMonitoringStack:AlertTopicArn=<arn-from-alerts-output>
```

**Note**: For `AlertTopicArn`, deploy AlertsStack first, copy the ARN from outputs, then deploy SyntheticMonitoringStack.

### Deploy Individual Stacks (Development)

```bash
# 1. Monitoring Stack (Dashboard only)
npx cdk deploy LightsailMonitoringStack \
  --parameters InstanceName=blog-dev-1 \
  --parameters LoadBalancerName=blog-dev-lb

# 2. Alerts Stack (Alarms + SNS)
npx cdk deploy LightsailAlertsStack \
  --parameters InstanceName=blog-dev-1 \
  --parameters LoadBalancerName=blog-dev-lb \
  --parameters AlertEmail=your-email@example.com

# Get SNS Topic ARN from output, then:

# 3. Synthetic Monitoring (Canary)
npx cdk deploy LightsailSyntheticMonitoringStack \
  --parameters WebsiteUrl=https://example.com \
  --parameters AlertTopicArn=arn:aws:sns:us-east-1:123456789012:lightsail-blog-alerts
```

---

## Post-Deployment

### 1. Confirm SNS Subscription

After deploying AlertsStack:

1. Check your email for "AWS Notification - Subscription Confirmation"
2. Click "Confirm subscription"
3. You'll receive a confirmation message

### 2. Verify Dashboard

```bash
# Get dashboard URL from outputs
aws cloudformation describe-stacks \
  --stack-name LightsailMonitoringStack \
  --query 'Stacks[0].Outputs[?OutputKey==`DashboardURL`].OutputValue' \
  --output text
```

Open the URL in your browser to see real-time metrics.

### 3. Test Alerts (Optional)

Manually trigger an alarm to test notifications:

```bash
# Trigger HighCPU alarm
aws cloudwatch set-alarm-state \
  --alarm-name Lightsail-HighCPU \
  --state-value ALARM \
  --state-reason "Testing alert system"
```

You should receive an email notification.

### 4. Check Canary Status

```bash
# Get canary dashboard URL
aws cloudformation describe-stacks \
  --stack-name LightsailSyntheticMonitoringStack \
  --query 'Stacks[0].Outputs[?OutputKey==`CanaryDashboardURL`].OutputValue' \
  --output text
```

The canary will start running within 5 minutes of deployment.

---

## Monitoring Best Practices

### What to Watch

1. **Daily**: Check dashboard for trends
2. **Weekly**: Review alarm history
3. **Monthly**: Analyze canary success rate

### Key Metrics

- **CPU**: Should stay <60% under normal load
- **Healthy Hosts**: Should always be 1 (or # of instances)
- **Response Time**: Should be <500ms typically
- **Canary Success Rate**: Should be >99%

### Alert Response

| Alert              | Severity | Response Time | Action                                          |
| ------------------ | -------- | ------------- | ----------------------------------------------- |
| NoHealthyTargets   | CRITICAL | Immediate     | Check instance status, restart if needed        |
| StatusCheckFailure | HIGH     | 15 minutes    | Investigate system/instance logs                |
| UnhealthyTargets   | MEDIUM   | 30 minutes    | Check application logs, health endpoint         |
| HighCPU            | MEDIUM   | 1 hour        | Check for traffic spikes, optimize if sustained |
| HighResponseTime   | LOW      | 4 hours       | Investigate slow queries, optimize caching      |

---

## Integration with CI/CD

### Option 1: Separate Deploy Workflow

Create `.github/workflows/deploy-observability.yml`:

```yaml
name: Deploy Observability Stacks

on:
  workflow_dispatch:
    inputs:
      website_url:
        description: "Website URL to monitor"
        required: true
        default: "https://example.com"
      alert_email:
        description: "Email for alert notifications"
        required: true

jobs:
  deploy_observability:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN_CDK }}
          aws-region: us-east-1
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm install
        working-directory: cdk
      - run: npx cdk deploy --all --require-approval never
        working-directory: cdk
```

### Option 2: Add to Existing Provision Workflow

Add a job to `.github/workflows/provision-and-configure.yml`:

```yaml
deploy_observability:
  name: Deploy Observability (CDK)
  runs-on: ubuntu-latest
  needs: ansible
  steps:
    # ... (same as above)
```

---

## Costs

| Stack                    | Monthly Cost     | Notes                                  |
| ------------------------ | ---------------- | -------------------------------------- |
| MonitoringStack          | ~$3              | Dashboard only, no data charges        |
| AlertsStack              | ~$1              | First 10 alarms free, $0.10 each after |
| SyntheticMonitoringStack | ~$5-10           | Canary runs, S3 storage                |
| **Total**                | **~$9-14/month** | Production-grade observability         |

Compare to:

- **DataDog**: ~$15/host/month
- **New Relic**: ~$25/user/month
- **AWS native**: ~$10/month

---

## Troubleshooting

### Canary Always Failing

- Check website is accessible via HTTPS
- Verify TLS certificate is valid
- Check canary IAM role permissions
- Review screenshots in S3 artifacts bucket

### No Metrics in Dashboard

- Verify Lightsail resources exist with exact names
- Wait 5-10 minutes for first data points
- Check IAM permissions for CloudWatch

### Not Receiving Alert Emails

- Confirm SNS subscription (check spam folder)
- Verify email address is correct
- Check alarm state in CloudWatch console

### Stack Deployment Fails

```bash
# Check CDK bootstrap
cdk bootstrap

# Check IAM role permissions
aws sts get-caller-identity

# View detailed errors
npx cdk deploy --verbose
```

---

## Cleanup

### Remove All Observability Stacks

```bash
cd cdk
npx cdk destroy --all --force
```

Or use the destroy workflow:

```bash
# The destroy-all workflow includes CDK destroy
gh workflow run destroy-all.yml
```

**Note**: S3 artifacts bucket must be empty before deletion. CDK will handle this automatically with `autoDeleteObjects` (if enabled).

---

## Further Enhancements

### Future Improvements

1. **Custom Metrics**: Push application-level metrics (e.g., WordPress post counts)
2. **Log Aggregation**: Send application logs to CloudWatch Logs
3. **X-Ray Tracing**: Add distributed tracing for API calls
4. **Cost Anomaly Detection**: Alert on unexpected AWS bill increases
5. **Multi-Region Monitoring**: Deploy canaries in multiple regions

### Production Considerations

1. Use separate AWS account for monitoring (blast radius)
2. Set up cross-account CloudWatch sharing
3. Implement runbooks for each alarm type
4. Create on-call rotation via PagerDuty/Opsgenie integration
5. Add composite alarms for complex scenarios

---

## Resources

- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [AWS Synthetics Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html)
- [CDK CloudWatch Module](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudwatch-readme.html)
- [Monitoring Best Practices](https://docs.aws.amazon.com/prescriptive-guidance/latest/monitoring-best-practices/)

---

**Last Updated**: May 31, 2026
**Maintained By**: Lightsail Blog Platform Team
