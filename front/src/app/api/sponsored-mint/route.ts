import { type NextRequest, NextResponse } from "next/server";
import { type Address, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry, polygon, polygonAmoy } from "viem/chains";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { NFT_ABI } from "@/contracts/nft-abi";
import { getSponsorWalletPrivateKey } from "@/lib/aws-ssm";

// Team metadata configuration
const _TEAM_METADATA = {
  0: {
    name: "Tsukuro SBT - Team A",
    description: "Tsukuro 2025 参加記念SBT - Team A",
    hasSerial: false,
  },
  1: {
    name: "Tsukuro SBT - Team B",
    description: "Tsukuro 2025 参加記念SBT - Team B",
    hasSerial: true,
  },
  2: {
    name: "Tsukuro SBT - Team C",
    description: "Tsukuro 2025 参加記念SBT - Team C",
    hasSerial: true,
  },
  3: {
    name: "Tsukuro SBT - Team D",
    description: "Tsukuro 2025 参加記念SBT - Team D",
    hasSerial: false,
  },
} as const;

// Get chain config based on chainId from client
const getChainConfig = (chainId: number) => {
  switch (chainId) {
    case polygon.id:
      return {
        chain: polygon,
        contractAddress: CONTRACT_ADDRESSES.polygon,
        rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
      };
    case polygonAmoy.id:
      return {
        chain: polygonAmoy,
        contractAddress: CONTRACT_ADDRESSES.polygonAmoy,
        rpcUrl: process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL,
      };
    case foundry.id:
      return {
        chain: foundry,
        contractAddress: CONTRACT_ADDRESSES.anvil,
        rpcUrl: process.env.NEXT_PUBLIC_ANVIL_RPC_URL,
      };
    default:
      return null;
  }
};

const getDefaultChainIdFromEnv = (): number => {
  const useAnvil = process.env.USE_ANVIL !== "false";
  const useTestnet = process.env.USE_TESTNET === "true";

  if (useAnvil) return foundry.id;
  return useTestnet ? polygonAmoy.id : polygon.id;
};

const parseChainId = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, tokenType, chainId } = body;

    if (!to || tokenType === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const resolvedChainId = parseChainId(chainId) ?? getDefaultChainIdFromEnv();

    const teamId = Number(tokenType);
    if (teamId < 0 || teamId > 3) {
      return NextResponse.json(
        { success: false, error: "Invalid team ID (must be 0-3)" },
        { status: 400 },
      );
    }

    // Get chain config based on client's chainId
    const chainConfig = getChainConfig(resolvedChainId);
    if (!chainConfig) {
      return NextResponse.json(
        { success: false, error: "Unsupported network" },
        { status: 400 },
      );
    }

    // Get sponsor wallet private key from env or SSM Parameter Store
    let privateKey: string;
    try {
      privateKey = await getSponsorWalletPrivateKey();
    } catch (error) {
      console.error("Failed to get sponsor wallet private key:", error);
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Ensure private key has 0x prefix
    const formattedPrivateKey = privateKey.startsWith("0x")
      ? privateKey
      : `0x${privateKey}`;

    // Create wallet client
    const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);

    const walletClient = createWalletClient({
      account,
      chain: chainConfig.chain,
      transport: http(chainConfig.rpcUrl),
    });

    // Mint using base URI (metadata hosted on GitHub Pages)
    const hash = await walletClient.writeContract({
      address: chainConfig.contractAddress,
      abi: NFT_ABI,
      functionName: "mintLocked",
      args: [to as Address, BigInt(teamId), BigInt(1), "0x"],
      gas: BigInt(200000),
    });

    return NextResponse.json({
      success: true,
      txHash: hash,
      message: "Minted successfully with sponsored gas",
    });
  } catch (error) {
    console.error("Sponsored mint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
