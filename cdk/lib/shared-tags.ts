import { Tags } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SharedTags {
	[key: string]: string;
}

export const defaultTags: SharedTags = {
	Project: "lightsail-blog-platform",
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
