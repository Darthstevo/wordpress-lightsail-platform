import { CfnOutput, CfnParameter, Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
	Dashboard,
	TextWidget,
	GraphWidget,
	Metric,
	SingleValueWidget,
	Row,
} from "aws-cdk-lib/aws-cloudwatch";
import { applySharedTags } from "./shared-tags";

/**
 * MonitoringStack: CloudWatch Dashboard for Lightsail Blog Platform
 * 
 * Provides real-time observability into:
 * - Lightsail instance health (CPU, Network, Status)
 * - Load balancer performance (requests, healthy hosts)
 * - Application availability metrics
 * 
 * Deploy after infrastructure is provisioned to enable monitoring.
 */
export class MonitoringStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		applySharedTags(this);

		// Parameters - pass from deployment workflow
		const instanceName = new CfnParameter(this, "InstanceName", {
			type: "String",
			description: "Lightsail instance name",
			default: "blog-dev-1",
		});

		const loadBalancerName = new CfnParameter(this, "LoadBalancerName", {
			type: "String",
			description: "Lightsail load balancer name",
			default: "blog-dev-lb",
		});

		const dashboardName = new CfnParameter(this, "DashboardName", {
			type: "String",
			description: "CloudWatch dashboard name",
			default: "wordpress-platform-dashboard",
		});

		// Create dashboard
		const dashboard = new Dashboard(this, "PlatformDashboard", {
			dashboardName: dashboardName.valueAsString,
		});

		// Header
		const headerWidget = new TextWidget({
			markdown: `# Lightsail Blog Platform - Observability Dashboard
**Instance**: ${instanceName.valueAsString} | **Load Balancer**: ${loadBalancerName.valueAsString}

Monitor application health, infrastructure performance, and availability metrics.`,
			width: 24,
			height: 3,
		});

		// Lightsail Instance Metrics
		const instanceCpuMetric = new Metric({
			namespace: "AWS/Lightsail",
			metricName: "CPUUtilization",
			dimensionsMap: {
				InstanceName: instanceName.valueAsString,
			},
			statistic: "Average",
			period: Duration.minutes(5),
		});

		const instanceNetworkInMetric = new Metric({
			namespace: "AWS/Lightsail",
			metricName: "NetworkIn",
			dimensionsMap: {
				InstanceName: instanceName.valueAsString,
			},
			statistic: "Sum",
			period: Duration.minutes(5),
		});

		const instanceNetworkOutMetric = new Metric({
			namespace: "AWS/Lightsail",
			metricName: "NetworkOut",
			dimensionsMap: {
				InstanceName: instanceName.valueAsString,
			},
			statistic: "Sum",
			period: Duration.minutes(5),
		});

		const instanceStatusCheckMetric = new Metric({
			namespace: "AWS/Lightsail",
			metricName: "StatusCheckFailed",
			dimensionsMap: {
				InstanceName: instanceName.valueAsString,
			},
			statistic: "Sum",
			period: Duration.minutes(1),
		});

		// Load Balancer Metrics
		const lbHealthyHostCountMetric = new Metric({
			namespace: "AWS/Lightsail",
			metricName: "HealthyHostCount",
			dimensionsMap: {
				LoadBalancerName: loadBalancerName.valueAsString,
			},
			statistic: "Average",
			period: Duration.minutes(1),
		});

		const lbUnhealthyHostCountMetric = new Metric({
			namespace: "AWS/Lightsail",
			metricName: "UnhealthyHostCount",
			dimensionsMap: {
				LoadBalancerName: loadBalancerName.valueAsString,
			},
			statistic: "Average",
			period: Duration.minutes(1),
		});

		const lbRequestCountMetric = new Metric({
			namespace: "AWS/Lightsail",
			metricName: "RequestCount",
			dimensionsMap: {
				LoadBalancerName: loadBalancerName.valueAsString,
			},
			statistic: "Sum",
			period: Duration.minutes(5),
		});

		const lbResponseTimeMetric = new Metric({
			namespace: "AWS/Lightsail",
			metricName: "TargetResponseTime",
			dimensionsMap: {
				LoadBalancerName: loadBalancerName.valueAsString,
			},
			statistic: "Average",
			period: Duration.minutes(5),
		});

		// Build Dashboard Layout
		dashboard.addWidgets(headerWidget);

		// Row 1: Key Metrics Summary
		dashboard.addWidgets(
			new Row(
				new SingleValueWidget({
					title: "Instance CPU (%)",
					metrics: [instanceCpuMetric],
					width: 6,
					height: 6,
				}),
				new SingleValueWidget({
					title: "Healthy Hosts",
					metrics: [lbHealthyHostCountMetric],
					width: 6,
					height: 6,
				}),
				new SingleValueWidget({
					title: "Unhealthy Hosts",
					metrics: [lbUnhealthyHostCountMetric],
					width: 6,
					height: 6,
				}),
				new SingleValueWidget({
					title: "LB Requests (5m)",
					metrics: [lbRequestCountMetric],
					width: 6,
					height: 6,
				})
			)
		);

		// Row 2: Instance Performance
		dashboard.addWidgets(
			new Row(
				new GraphWidget({
					title: "Instance CPU Utilization",
					left: [instanceCpuMetric],
					width: 12,
					height: 6,
					leftYAxis: {
						min: 0,
						max: 100,
					},
				}),
				new GraphWidget({
					title: "Instance Network Traffic",
					left: [instanceNetworkInMetric],
					right: [instanceNetworkOutMetric],
					width: 12,
					height: 6,
				})
			)
		);

		// Row 3: Load Balancer Health
		dashboard.addWidgets(
			new Row(
				new GraphWidget({
					title: "Load Balancer - Host Health",
					left: [lbHealthyHostCountMetric, lbUnhealthyHostCountMetric],
					width: 12,
					height: 6,
					leftYAxis: {
						min: 0,
					},
				}),
				new GraphWidget({
					title: "Load Balancer - Response Time",
					left: [lbResponseTimeMetric],
					width: 12,
					height: 6,
					leftYAxis: {
						label: "Seconds",
						min: 0,
					},
				})
			)
		);

		// Row 4: Status and Reliability
		dashboard.addWidgets(
			new GraphWidget({
				title: "Instance Status Check Failures",
				left: [instanceStatusCheckMetric],
				width: 24,
				height: 6,
				leftYAxis: {
					min: 0,
				},
			})
		);

		// Outputs
		new CfnOutput(this, "DashboardNameOutput", {
			value: dashboard.dashboardName,
			description: "CloudWatch Dashboard name for Lightsail monitoring",
		});

		new CfnOutput(this, "DashboardURL", {
			value: `https://console.aws.amazon.com/cloudwatch/home?region=${
				this.region
			}#dashboards:name=${dashboard.dashboardName}`,
			description: "Direct link to CloudWatch Dashboard",
		});
	}
}
