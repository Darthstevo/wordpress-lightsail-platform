# GitHub OIDC Setup (AWS)

This guide provides a sample OIDC trust policy and permissions policy for GitHub Actions.

## 1) Create the OIDC identity provider

Provider URL: `https://token.actions.githubusercontent.com`

Audience: `sts.amazonaws.com`

## 2) Trust policy (assume role)

Replace the org/repo/environment values with your own.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<ORG>/<REPO>:environment:<ENVIRONMENT>"
        }
      }
    }
  ]
}
```

## 3) Permissions policy (example)

This example is intentionally narrow. Expand as needed.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Route53ReadWrite",
      "Effect": "Allow",
      "Action": [
        "route53:ChangeResourceRecordSets",
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchRead",
      "Effect": "Allow",
      "Action": ["cloudwatch:DescribeAlarms", "cloudwatch:ListDashboards"],
      "Resource": "*"
    }
  ]
}
```

## 4) GitHub environment configuration

Create a GitHub Environment (e.g., `dev` or `prod`) and add these variables:

- `AWS_ROLE_ARN`
- `AWS_REGION`

## 5) Workflow usage (example)

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    environment: dev
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}
```

## Disabled-by-default workflows

The CDK deploy and destroy workflows are configured as `workflow_dispatch` only to avoid accidental runs and costs. They run only when manually triggered.

## Notes

- Restrict `sub` to an environment to prevent unintended access.
- For multiple environments, create multiple roles or use condition matching.
