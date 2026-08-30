import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { applySharedTags } from "./shared-tags";

// Placeholder: future SSM documents/runbooks for maintenance tasks.
export class SsmAutomationStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);
		applySharedTags(this);

		// TODO: add SSM documents, associations, or automation runbooks.
	}
}
