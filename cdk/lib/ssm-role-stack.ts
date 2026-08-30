import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ManagedPolicy, Role, ServicePrincipal, CfnInstanceProfile } from "aws-cdk-lib/aws-iam";

export class SsmRoleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const ssmRole = new Role(this, "SsmInstanceRole", {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
      ],
    });

    const instanceProfile = new CfnInstanceProfile(this, "SsmInstanceProfile", {
      roles: [ssmRole.roleName],
    });

    new CfnOutput(this, "SsmRoleName", {
      value: ssmRole.roleName,
    });

    new CfnOutput(this, "SsmInstanceProfileName", {
      value: instanceProfile.ref,
    });
  }
}