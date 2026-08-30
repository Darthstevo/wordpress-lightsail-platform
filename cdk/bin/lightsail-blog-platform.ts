import { App } from "aws-cdk-lib";
import { MonitoringStack } from "../lib/monitoring-stack";
import { AlertsStack } from "../lib/alerts-stack";
import { SyntheticMonitoringStack } from "../lib/synthetic-monitoring-stack";

/**
 * Lightsail Blog Platform - CDK Application
 * 
 * Deploys observability infrastructure in the following order:
 * 
 * 1. MonitoringStack - CloudWatch Dashboard with metrics
 * 2. AlertsStack - CloudWatch Alarms + SNS notifications
 * 3. SyntheticMonitoringStack - Uptime canary with screenshots
 * 
 * Deploy AFTER Lightsail infrastructure (OpenTofu) is provisioned.
 * 
 * Usage:
 *   npx cdk deploy --all \
 *     --parameters MonitoringStack:InstanceName=blog-dev-1 \
 *     --parameters MonitoringStack:LoadBalancerName=blog-dev-lb \
 *     --parameters AlertsStack:InstanceName=blog-dev-1 \
 *     --parameters AlertsStack:LoadBalancerName=blog-dev-lb \
 *     --parameters AlertsStack:AlertEmail=your-email@example.com \
 *     --parameters SyntheticMonitoringStack:WebsiteUrl=https://thebasictek.com \
 *     --parameters SyntheticMonitoringStack:AlertTopicArn=<arn-from-alerts-stack>
 */
const app = new App();

const env = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: process.env.CDK_DEFAULT_REGION,
};

// Stack 1: Monitoring Dashboard
const monitoringStack = new MonitoringStack(app, "LightsailMonitoringStack", {
	env,
	description:
		"CloudWatch Dashboard for Lightsail Blog Platform monitoring and metrics",
});

// Stack 2: Alerts and Notifications
const alertsStack = new AlertsStack(app, "LightsailAlertsStack", {
	env,
	description:
		"CloudWatch Alarms and SNS notifications for critical infrastructure issues",
});

// Stack 3: Synthetic Monitoring (depends on AlertsStack for SNS topic)
const syntheticStack = new SyntheticMonitoringStack(
	app,
	"LightsailSyntheticMonitoringStack",
	{
		env,
		description:
			"CloudWatch Synthetics canary for active uptime monitoring and health checks",
	}
);
syntheticStack.addDependency(alertsStack);


