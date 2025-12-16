import { defineBackend } from "@aws-amplify/backend";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({});

// Create IAM role for SSR compute with SSM permissions
const stack = backend.createStack("SSRComputeStack");

const ssrComputeRole = new Role(stack, "SSRComputeRole", {
  roleName: "AmplifySSRComputeRole-nft-tsukuro",
  assumedBy: new ServicePrincipal("amplify.amazonaws.com"),
  description: "IAM role for Amplify SSR compute to access SSM Parameter Store",
});

// Add SSM GetParameter permissions
ssrComputeRole.addToPolicy(
  new PolicyStatement({
    actions: ["ssm:GetParameter", "ssm:GetParameters"],
    resources: [
      "arn:aws:ssm:ap-northeast-1:*:parameter/amplify/shared/d1r7qi4yqru24r/*",
    ],
  }),
);

// Output the role ARN for reference
backend.addOutput({
  custom: {
    ssrComputeRoleArn: ssrComputeRole.roleArn,
  },
});
