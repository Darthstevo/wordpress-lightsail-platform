import { Tags } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SharedTags {
	Project: string;
	ManagedBy: string;
}

export const defaultTags: SharedTags = {
	Project: "wordpress-lightsail-platform",
	ManagedBy: "cdk",
};

export const applySharedTags = (
	scope: Construct,
	tags: SharedTags = defaultTags
): void => {
	Object.entries(tags).forEach(([key, value]) => {
		Tags.of(scope).add(key, value);
	});
};
