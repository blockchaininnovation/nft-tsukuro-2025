import { type NextRequest, NextResponse } from "next/server";
import { type Address, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry, polygon, polygonAmoy } from "viem/chains";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { NFT_ABI } from "@/contracts/nft-abi";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, tokenType } = body;

    if (!to || tokenType === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const teamId = Number(tokenType);
    if (teamId < 0 || teamId > 3) {
      return NextResponse.json(
        { success: false, error: "Invalid team ID (must be 0-3)" },
        { status: 400 },
      );
    }

    // Get sponsor wallet private key
    const privateKey = process.env.SPONSOR_WALLET_PRIVATE_KEY;

    if (!privateKey) {
      console.error("SPONSOR_WALLET_PRIVATE_KEY not set");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Determine network
    const useTestnet = process.env.USE_TESTNET === "true";
    const useAnvil = process.env.USE_ANVIL !== "false";
    const chain = useAnvil ? foundry : useTestnet ? polygonAmoy : polygon;
    const contractAddress = useAnvil
      ? CONTRACT_ADDRESSES.anvil
      : useTestnet
        ? CONTRACT_ADDRESSES.polygonAmoy
        : CONTRACT_ADDRESSES.polygon;

    // Create wallet client
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const rpcUrl = useAnvil ? process.env.NEXT_PUBLIC_ANVIL_RPC_URL : undefined;

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl),
    });

    // Mint using base URI (metadata hosted on GitHub Pages)
    const hash = await walletClient.writeContract({
      address: contractAddress,
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
