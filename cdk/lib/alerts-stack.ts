import { CfnOutput, CfnParameter, Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
	Alarm,
	ComparisonOperator,
	Metric,
	TreatMissingData,
} from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { applySharedTags } from "./shared-tags";

/**
 * AlertsStack: CloudWatch Alarms + SNS Notifications
 * 
 * Production-grade alerting for critical issues:
 * - High CPU utilization (>80%)
 * - Unhealthy load balancer targets
 * - Instance status check failures
 * - High load balancer response time
 * 
 * Sends email notifications via SNS topic.
 * Deploy after infrastructure and monitoring stacks.
 */
export class AlertsStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);
		applySharedTags(this);

		// Parameters
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

		const alertEmail = new CfnParameter(this, "AlertEmail", {
			type: "String",
			description: "Email address for alert notifications",
			default: "alerts@example.com",
		});

		// SNS Topic for Alerts
		const alertTopic = new Topic(this, "AlertTopic", {
			displayName: "Lightsail Blog Platform Alerts",
			topicName: "lightsail-blog-alerts",
		});

		// Subscribe email to alerts
		alertTopic.addSubscription(
			new EmailSubscription(alertEmail.valueAsString)
		);

		// SNS Action for alarms
		const snsAction = new SnsAction(alertTopic);

		// Alarm 1: High CPU Utilization (>80% for 2 consecutive periods)
		const highCpuAlarm = new Alarm(this, "HighCPUAlarm", {
			alarmName: "Lightsail-HighCPU",
			alarmDescription:
				"Alerts when instance CPU utilization exceeds 80% for 10 minutes",
			metric: new Metric({
				namespace: "AWS/Lightsail",
				metricName: "CPUUtilization",
				dimensionsMap: {
					InstanceName: instanceName.valueAsString,
				},
				statistic: "Average",
				period: Duration.minutes(5),
			}),
			threshold: 80,
			evaluationPeriods: 2,
			comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
			treatMissingData: TreatMissingData.NOT_BREACHING,
		});
		highCpuAlarm.addAlarmAction(snsAction);

		// Alarm 2: Unhealthy Load Balancer Targets
		const unhealthyTargetsAlarm = new Alarm(this, "UnhealthyTargetsAlarm", {
			alarmName: "Lightsail-UnhealthyTargets",
			alarmDescription:
				"Alerts when load balancer has unhealthy target instances",
			metric: new Metric({
				namespace: "AWS/Lightsail",
				metricName: "UnhealthyHostCount",
				dimensionsMap: {
					LoadBalancerName: loadBalancerName.valueAsString,
				},
				statistic: "Average",
				period: Duration.minutes(1),
			}),
			threshold: 1,
			evaluationPeriods: 2,
			comparisonOperator:
				ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
			treatMissingData: TreatMissingData.NOT_BREACHING,
		});
		unhealthyTargetsAlarm.addAlarmAction(snsAction);

		// Alarm 3: No Healthy Targets (Critical)
		const noHealthyTargetsAlarm = new Alarm(this, "NoHealthyTargetsAlarm", {
			alarmName: "Lightsail-NoHealthyTargets",
			alarmDescription:
				"CRITICAL: Load balancer has zero healthy targets - site is down!",
			metric: new Metric({
				namespace: "AWS/Lightsail",
				metricName: "HealthyHostCount",
				dimensionsMap: {
					LoadBalancerName: loadBalancerName.valueAsString,
				},
				statistic: "Average",
				period: Duration.minutes(1),
			}),
			threshold: 1,
			evaluationPeriods: 2,
			comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
			treatMissingData: TreatMissingData.BREACHING,
		});
		noHealthyTargetsAlarm.addAlarmAction(snsAction);

		// Alarm 4: Instance Status Check Failure
		const statusCheckFailureAlarm = new Alarm(
			this,
			"StatusCheckFailureAlarm",
			{
				alarmName: "Lightsail-StatusCheckFailure",
				alarmDescription:
					"Alerts when instance fails status checks (system or instance)",
				metric: new Metric({
					namespace: "AWS/Lightsail",
					metricName: "StatusCheckFailed",
					dimensionsMap: {
						InstanceName: instanceName.valueAsString,
					},
					statistic: "Sum",
					period: Duration.minutes(1),
				}),
				threshold: 1,
				evaluationPeriods: 2,
				comparisonOperator:
					ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
				treatMissingData: TreatMissingData.NOT_BREACHING,
			}
		);
		statusCheckFailureAlarm.addAlarmAction(snsAction);

		// Alarm 5: High Load Balancer Response Time (>2 seconds)
		const highResponseTimeAlarm = new Alarm(this, "HighResponseTimeAlarm", {
			alarmName: "Lightsail-HighResponseTime",
			alarmDescription:
				"Alerts when load balancer response time exceeds 2 seconds",
			metric: new Metric({
				namespace: "AWS/Lightsail",
				metricName: "TargetResponseTime",
				dimensionsMap: {
					LoadBalancerName: loadBalancerName.valueAsString,
				},
				statistic: "Average",
				period: Duration.minutes(5),
			}),
			threshold: 2.0,
			evaluationPeriods: 2,
			comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
			treatMissingData: TreatMissingData.NOT_BREACHING,
		});
		highResponseTimeAlarm.addAlarmAction(snsAction);

		// Outputs
		new CfnOutput(this, "AlertTopicArn", {
			value: alertTopic.topicArn,
			description: "SNS Topic ARN for alert notifications",
		});

		new CfnOutput(this, "AlertTopicName", {
			value: alertTopic.topicName,
			description: "SNS Topic name for alert notifications",
		});

		new CfnOutput(this, "AlertsConfigured", {
			value: "5",
			description:
				"Number of CloudWatch alarms configured: HighCPU, UnhealthyTargets, NoHealthyTargets, StatusCheckFailure, HighResponseTime",
		});
	}
}
