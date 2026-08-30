import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { applySharedTags } from "./shared-tags";

// Placeholder: future AWS Budgets + SNS alerts for cost control.
export class BudgetStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);
		applySharedTags(this);

		// TODO: add budget definitions and alert subscriptions.
	}
}
