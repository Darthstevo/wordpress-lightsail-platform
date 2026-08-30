# Terraform IAM Role Policy (Lightsail)

Use this policy for the Terraform workflow that provisions Lightsail resources. It is scoped to the Lightsail resources used in this repo and supports OIDC-based GitHub Actions access.

## Suggested policy (inline JSON)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LightsailProvisioning",
      "Effect": "Allow",
      "Action": [
        "lightsail:CreateInstances",
        "lightsail:DeleteInstance",
        "lightsail:GetInstance",
        "lightsail:GetInstances",
        "lightsail:GetInstanceState",
        "lightsail:GetOperation",
        "lightsail:GetOperations",
        "lightsail:GetRegions",
        "lightsail:GetBundles",
        "lightsail:GetBlueprints",
        "lightsail:GetKeyPairs",
        "lightsail:CreateKeyPair",
        "lightsail:DeleteKeyPair",
        "lightsail:CreateStaticIp",
        "lightsail:DeleteStaticIp",
        "lightsail:AttachStaticIp",
        "lightsail:DetachStaticIp",
        "lightsail:GetStaticIp",
        "lightsail:GetStaticIps",
        "lightsail:TagResource",
        "lightsail:UntagResource"
      ],
      "Resource": "*"
    }
  ]
}
```

## Notes

- If you do not manage Lightsail key pairs via Terraform, you can remove the `CreateKeyPair` and `DeleteKeyPair` actions.
- If you later add snapshots or disks, expand the policy accordingly.
- Keep this policy separate from the CDK role to avoid over-privilege.
