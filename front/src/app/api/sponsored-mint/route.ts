import { type NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy, foundry } from "viem/chains";
import { NFT_ABI } from "@/contracts/nft-abi";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

// Helper function to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, tokenType } = body;

    if (!to || tokenType === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check IP address
    const venueSession = request.cookies.get("venue_session");
    const isVenueMode = venueSession?.value === "true";

    if (!isVenueMode) {
      return NextResponse.json(
        {
          success: false,
          error: "Venue mode is not enabled",
        },
        { status: 403 }
      );
    }

    // Get sponsor wallet private key
    const privateKey = process.env.SPONSOR_WALLET_PRIVATE_KEY;

    if (!privateKey) {
      console.error("SPONSOR_WALLET_PRIVATE_KEY not set");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Determine network (default to Anvil for local development)
    const useTestnet = process.env.USE_TESTNET === "true";
    const useAnvil = process.env.USE_ANVIL !== "false"; // Default to Anvil
    const chain = useAnvil ? foundry : (useTestnet ? polygonAmoy : polygon);
    const contractAddress = useAnvil
      ? CONTRACT_ADDRESSES.anvil
      : (useTestnet ? CONTRACT_ADDRESSES.polygonAmoy : CONTRACT_ADDRESSES.polygon);

    // Create wallet client
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const rpcUrl = useAnvil ? process.env.NEXT_PUBLIC_ANVIL_RPC_URL : undefined;
    const client = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl),
    });

    // Execute mint transaction
    const hash = await client.writeContract({
      address: contractAddress,
      abi: NFT_ABI,
      functionName: "mint",
      args: [to as Address, BigInt(tokenType)],
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
      { status: 500 }
    );
  }
}
