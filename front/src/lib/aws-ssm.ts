import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

// Custom error class for SSM parameter errors
export class SSMParameterError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly parameterName?: string,
  ) {
    super(message);
    this.name = "SSMParameterError";
  }
}

// Singleton SSM Client
const ssmClient = new SSMClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
});

// Cache interface
interface CachedParameter {
  value: string;
  expiresAt: number;
}

// In-memory cache with TTL
const cache = new Map<string, CachedParameter>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches a parameter from AWS SSM Parameter Store
 *
 * @param parameterName - SSM parameter name (e.g., '/amplify/shared/...')
 * @param withDecryption - Whether to decrypt SecureString parameters (default: true)
 * @returns Parameter value
 * @throws SSMParameterError if parameter retrieval fails
 */
export async function getSSMParameter(
  parameterName: string,
  withDecryption = true,
): Promise<string> {
  try {
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: withDecryption,
    });

    const response = await ssmClient.send(command);
    const value = response.Parameter?.Value;

    if (!value) {
      throw new SSMParameterError(
        `Parameter value is empty: ${parameterName}`,
        "VALUE_EMPTY",
        parameterName,
      );
    }

    return value;
  } catch (error) {
    if (error instanceof SSMParameterError) {
      throw error;
    }

    // AWS SDK errors
    const awsError = error as { name?: string; message?: string };
    throw new SSMParameterError(
      `Failed to get SSM parameter: ${awsError.message || "Unknown error"}`,
      awsError.name,
      parameterName,
    );
  }
}

/**
 * Fetches a parameter from AWS SSM Parameter Store with caching
 *
 * @param parameterName - SSM parameter name
 * @param ttlMs - Cache TTL in milliseconds (default: 5 minutes)
 * @returns Parameter value
 * @throws SSMParameterError if parameter retrieval fails
 */
export async function getCachedSSMParameter(
  parameterName: string,
  ttlMs = DEFAULT_TTL_MS,
): Promise<string> {
  const now = Date.now();
  const cached = cache.get(parameterName);

  // Return cached value if still valid
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  // Fetch from SSM and cache
  const value = await getSSMParameter(parameterName);
  cache.set(parameterName, {
    value,
    expiresAt: now + ttlMs,
  });

  return value;
}

/**
 * Gets the sponsor wallet private key from environment variable or SSM Parameter Store
 *
 * - Local environment: Reads from SPONSOR_WALLET_PRIVATE_KEY environment variable
 * - Amplify environment: Fetches from SSM Parameter Store
 *
 * @returns Sponsor wallet private key
 * @throws SSMParameterError if retrieval fails
 */
export async function getSponsorWalletPrivateKey(): Promise<string> {
  // Check environment variable first (local environment)
  const envKey = process.env.SPONSOR_WALLET_PRIVATE_KEY;
  if (envKey) {
    return envKey;
  }

  // Amplify environment: fetch from SSM Parameter Store
  const parameterName =
    process.env.SPONSOR_WALLET_SSM_PARAMETER_NAME ||
    "/amplify/shared/d1r7qi4yqru24r/SPONSOR_WALLET_PRIVATE_KEY";

  const privateKey = await getCachedSSMParameter(parameterName);

  if (!privateKey) {
    throw new SSMParameterError(
      "Sponsor wallet private key not found",
      "VALUE_EMPTY",
      parameterName,
    );
  }

  return privateKey;
}
