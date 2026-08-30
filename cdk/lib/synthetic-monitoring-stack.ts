import { CfnOutput, CfnParameter, Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Canary, Test, Runtime, Schedule, Code } from "aws-cdk-lib/aws-synthetics";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Alarm, ComparisonOperator } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { Topic } from "aws-cdk-lib/aws-sns";
import { applySharedTags } from "./shared-tags";

/**
 * SyntheticMonitoringStack: CloudWatch Synthetics Canary
 * 
 * Provides active uptime monitoring:
 * - HTTP health checks every 5 minutes
 * - Screenshots on failure
 * - HAR file capture for debugging
 * - Alarm on consecutive failures
 * 
 * This simulates real user traffic to detect issues proactively.
 * Deploy after infrastructure, monitoring, and alerts stacks.
 */
export class SyntheticMonitoringStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);
		applySharedTags(this);

		// Parameters
		const websiteUrl = new CfnParameter(this, "WebsiteUrl", {
			type: "String",
			description: "Website URL to monitor (e.g., https://example.com)",
			default: "https://example.com",
		});

		const alertTopicArn = new CfnParameter(this, "AlertTopicArn", {
			type: "String",
			description:
				"SNS Topic ARN from AlertsStack for canary failure notifications",
		});

		// S3 bucket for canary artifacts (screenshots, logs, HAR files)
		const canaryArtifactsBucket = new Bucket(this, "CanaryArtifactsBucket", {
			bucketName: `lightsail-canary-artifacts-${this.account}`,
			lifecycleRules: [
				{
					id: "DeleteOldArtifacts",
					expiration: Duration.days(7), // Keep artifacts for 7 days
					enabled: true,
				},
			],
		});

		// CloudWatch Synthetics Canary
		const uptimeCanary = new Canary(this, "UptimeCanary", {
			canaryName: "lightsail-blog-uptime",
			test: Test.custom({
				code: Code.fromInline(`
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const httpGetPage = async function () {
    const requestOptions = {
        hostname: '${websiteUrl.valueAsString}'.replace(/^https?:\\/\\//, ''),
        method: 'GET',
        path: '/',
        port: 443,
        protocol: 'https:',
    };
    
    log.info('Checking website: ' + requestOptions.hostname);
    
    let page = await synthetics.getPage();
    const response = await page.goto('${websiteUrl.valueAsString}', {
        waitUntil: ['load', 'networkidle0'],
        timeout: 30000
    });
    
    // Take screenshot
    await synthetics.takeScreenshot('homepage', 'loaded');
    
    // Verify response
    if (!response) {
        throw new Error('Failed to load page');
    }
    
    const statusCode = response.status();
    log.info('Response status: ' + statusCode);
    
    if (statusCode < 200 || statusCode >= 400) {
        throw new Error('Page returned status code: ' + statusCode);
    }
    
    // Check for WordPress indicators
    const content = await page.content();
    if (!content.includes('wp-content') && !content.includes('wordpress')) {
        log.warn('WordPress indicators not found - may not be a WordPress site');
    }
    
    log.info('Uptime check passed');
};

exports.handler = async () => {
    return await httpGetPage();
};
`),
				handler: "index.handler",
			}),
			runtime: Runtime.SYNTHETICS_NODEJS_PUPPETEER_5_1,
			schedule: Schedule.rate(Duration.minutes(5)),
			artifactsBucketLocation: {
				bucket: canaryArtifactsBucket,
			},
			environmentVariables: {
				WEBSITE_URL: websiteUrl.valueAsString,
			},
		});

		// Import existing SNS topic from AlertsStack
		const alertTopic = Topic.fromTopicArn(
			this,
			"AlertTopic",
			alertTopicArn.valueAsString
		);

		// Alarm on canary failures (2 consecutive failures = downtime)
		const canaryFailureAlarm = new Alarm(this, "CanaryFailureAlarm", {
			alarmName: "Lightsail-WebsiteDown",
			alarmDescription:
				"CRITICAL: Website failed uptime check - 2 consecutive failures detected",
			metric: uptimeCanary.metricFailed({
				period: Duration.minutes(5),
			}),
			threshold: 1,
			evaluationPeriods: 2,
			comparisonOperator:
				ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
		});
		canaryFailureAlarm.addAlarmAction(new SnsAction(alertTopic));

		// Outputs
		new CfnOutput(this, "CanaryName", {
			value: uptimeCanary.canaryName,
			description: "CloudWatch Synthetics Canary name",
		});

		new CfnOutput(this, "ArtifactsBucketName", {
			value: canaryArtifactsBucket.bucketName,
			description: "S3 bucket containing canary artifacts (screenshots, logs)",
		});

		new CfnOutput(this, "CanaryDashboardURL", {
			value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#synthetics:canary/detail/${uptimeCanary.canaryName}`,
			description: "Direct link to Canary in CloudWatch Console",
		});
	}
}
