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
  const useAnvil = process.env.NEXT_PUBLIC_USE_ANVIL !== "false";
  const useTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === "true";

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
  console.log("[sponsored-mint] POST request received");

  try {
    const body = await request.json();
    const { to, tokenType, chainId } = body;

    console.log("[sponsored-mint] Request params:", {
      to,
      tokenType,
      chainId,
    });

    if (!to || tokenType === undefined) {
      console.log("[sponsored-mint] Error: Missing required parameters");
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const resolvedChainId = parseChainId(chainId) ?? getDefaultChainIdFromEnv();

    const teamId = Number(tokenType);
    console.log("[sponsored-mint] Resolved chainId:", resolvedChainId, "teamId:", teamId);

    if (teamId < 0 || teamId > 3) {
      console.log("[sponsored-mint] Error: Invalid team ID:", teamId);
      return NextResponse.json(
        { success: false, error: "Invalid team ID (must be 0-3)" },
        { status: 400 },
      );
    }

    // Get chain config based on client's chainId
    const chainConfig = getChainConfig(resolvedChainId);
    if (!chainConfig) {
      console.log("[sponsored-mint] Error: Unsupported network for chainId:", resolvedChainId);
      return NextResponse.json(
        { success: false, error: "Unsupported network" },
        { status: 400 },
      );
    }

    console.log("[sponsored-mint] Chain config:", {
      chain: chainConfig.chain.name,
      contractAddress: chainConfig.contractAddress,
    });

    // Get sponsor wallet private key from env or SSM Parameter Store
    console.log("[sponsored-mint] Fetching sponsor wallet private key...");
    let privateKey: string;
    try {
      privateKey = await getSponsorWalletPrivateKey();
      console.log("[sponsored-mint] Successfully retrieved sponsor wallet private key");
    } catch (error) {
      console.error("[sponsored-mint] Failed to get sponsor wallet private key:", error);
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
    console.log("[sponsored-mint] Sponsor wallet address:", account.address);

    const walletClient = createWalletClient({
      account,
      chain: chainConfig.chain,
      transport: http(chainConfig.rpcUrl),
    });

    // Mint using base URI (metadata hosted on GitHub Pages)
    console.log("[sponsored-mint] Calling mintLocked with args:", {
      to,
      teamId,
      amount: 1,
    });

    const hash = await walletClient.writeContract({
      address: chainConfig.contractAddress,
      abi: NFT_ABI,
      functionName: "mintLocked",
      args: [to as Address, BigInt(teamId), BigInt(1), "0x"],
      gas: BigInt(200000),
    });

    console.log("[sponsored-mint] Transaction successful! Hash:", hash);

    return NextResponse.json({
      success: true,
      txHash: hash,
      message: "Minted successfully with sponsored gas",
    });
  } catch (error) {
    console.error("[sponsored-mint] Transaction failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
