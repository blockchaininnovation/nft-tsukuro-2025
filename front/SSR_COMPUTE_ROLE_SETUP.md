# SSR Compute Role Setup for SSM Access

## Overview
This document explains how to configure the Amplify SSR Compute Role to allow Next.js API routes to access SSM Parameter Store.

## What Was Changed

### File: `front/amplify/backend.ts`
Added an IAM role definition using AWS CDK that:
- Creates a role that can be assumed by `amplify.amazonaws.com`
- Grants `ssm:GetParameter` and `ssm:GetParameters` permissions
- Restricts access to parameters under `/amplify/shared/d1r7qi4yqru24r/*`

## Manual Setup Required (One-time only)

After deploying the backend changes, you need to attach the created IAM role to your Amplify app.

### Method 1: Amplify Console (Recommended)

1. Deploy the backend changes:
   ```bash
   git add front/amplify/backend.ts
   git commit -m "Add SSR compute role for SSM access"
   git push
   ```

2. Wait for the deployment to complete

3. Check the CloudFormation outputs to find the Role ARN:
   - Go to AWS CloudFormation Console
   - Find the stack named like `amplify-*-SSRComputeStack-*`
   - Go to "Outputs" tab
   - Copy the value of `ssrComputeRoleArn`

4. Attach the role to your Amplify app:
   - Go to AWS Amplify Console
   - Select your app: `nft-tsukuro-2025`
   - Go to Hosting → Compute settings
   - Under "SSR compute role", paste the Role ARN
   - Save changes

5. Redeploy your app to apply the new compute role

### Method 2: AWS CLI

```bash
# 1. Deploy backend changes
git add front/amplify/backend.ts
git commit -m "Add SSR compute role for SSM access"
git push

# 2. Get the Role ARN from CloudFormation outputs
ROLE_ARN=$(aws cloudformation describe-stacks \
  --stack-name amplify-<your-stack-name>-SSRComputeStack-<hash> \
  --query "Stacks[0].Outputs[?OutputKey=='ssrComputeRoleArn'].OutputValue" \
  --output text \
  --region ap-northeast-1)

# 3. Attach the role to Amplify app
aws amplify update-app \
  --app-id d1r7qi4yqru24r \
  --compute-role-arn "$ROLE_ARN" \
  --region ap-northeast-1

# 4. Trigger a redeploy
aws amplify start-job \
  --app-id d1r7qi4yqru24r \
  --branch-name main \
  --job-type RELEASE \
  --region ap-northeast-1
```

## How It Works

1. **SSM Parameter Store**: The secret `SPONSOR_WALLET_PRIVATE_KEY` is stored at:
   ```
   /amplify/shared/d1r7qi4yqru24r/SPONSOR_WALLET_PRIVATE_KEY
   ```

2. **IAM Role**: The CDK code creates a role with permissions to read from this parameter

3. **Lambda Execution**: When Next.js API routes run as Lambda functions, they automatically use the compute role's credentials

4. **Application Code**: The existing `src/lib/aws-ssm.ts` code works without modification:
   - Creates an SSM client that uses the Lambda execution role credentials
   - Fetches the parameter value at runtime
   - Caches the value for 5 minutes

## Verification

After setup, test the API endpoint:

```bash
# Test the sponsored mint endpoint
curl -X POST https://your-amplify-app.amplifyapp.com/api/sponsored-mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x...",
    "tokenType": 0,
    "chainId": 137
  }'
```

Check CloudWatch Logs for any errors:
- Go to CloudWatch → Log groups
- Find `/aws/lambda/amplify-*-server-*`
- Look for errors related to SSM parameter access

## Troubleshooting

### Error: "Could not load credentials from any providers"
- Verify the compute role is attached in Amplify Console
- Check that the role ARN matches the one from CloudFormation outputs
- Ensure you redeployed after attaching the role

### Error: "AccessDeniedException"
- Verify the SSM parameter exists at the expected path
- Check the IAM policy in `backend.ts` matches the parameter path
- Ensure the parameter is in the correct AWS region (ap-northeast-1)

### Error: "Parameter not found"
- Create the SSM parameter manually if it doesn't exist:
  ```bash
  aws ssm put-parameter \
    --name "/amplify/shared/d1r7qi4yqru24r/SPONSOR_WALLET_PRIVATE_KEY" \
    --value "0x..." \
    --type "SecureString" \
    --region ap-northeast-1
  ```

## Fallback: Environment Variables

If the SSR Compute Role setup doesn't work, you can fall back to environment variables by adding this line to `front/amplify.yml` (after line 17):

```yaml
- echo "SPONSOR_WALLET_PRIVATE_KEY=${secrets.SPONSOR_WALLET_PRIVATE_KEY}" >> .env.production
```

The existing code in `src/lib/aws-ssm.ts` checks environment variables first, so both approaches can coexist.

## Security Benefits

- Secrets stored in SSM Parameter Store (encrypted at rest)
- No secrets in build artifacts or environment variables
- Runtime secret rotation without rebuild
- Fine-grained IAM permissions (least privilege)
- Infrastructure-as-Code (CDK) for role management

## References

- [AWS Amplify SSR Compute Role Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/amplify-SSR-compute-role.html)
- [IAM Compute Roles for SSR with AWS Amplify](https://aws.amazon.com/blogs/mobile/iam-compute-roles-for-server-side-rendering-with-aws-amplify-hosting/)
