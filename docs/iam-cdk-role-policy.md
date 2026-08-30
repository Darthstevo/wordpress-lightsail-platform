# CDK IAM Role Policy (Route 53 + Optional Monitoring)

Use this policy for the CDK workflows that deploy DNS and optional monitoring stacks. It is intentionally separate from the Terraform provisioning role to reduce privilege.

## Suggested policy (inline JSON)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Route53Management",
      "Effect": "Allow",
      "Action": [
        "route53:ChangeResourceRecordSets",
        "route53:CreateHostedZone",
        "route53:DeleteHostedZone",
        "route53:GetChange",
        "route53:GetHostedZone",
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets",
        "route53:ListHostedZonesByName"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchOptional",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutDashboard",
        "cloudwatch:DeleteDashboards",
        "cloudwatch:PutMetricAlarm",
        "cloudwatch:DeleteAlarms",
        "cloudwatch:DescribeAlarms",
        "cloudwatch:GetDashboard",
        "cloudwatch:ListDashboards"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMReadOnlyForCDK",
      "Effect": "Allow",
      "Action": ["iam:GetRole", "iam:PassRole", "iam:ListRoles"],
      "Resource": "*"
    }
  ]
}
```

## Notes

- Trim the CloudWatch section if you are not deploying monitoring resources.
- If your CDK stacks only touch existing hosted zones, you can remove `CreateHostedZone`/`DeleteHostedZone`.
- Keep this role separate from Terraform provisioning to reduce blast radius.
