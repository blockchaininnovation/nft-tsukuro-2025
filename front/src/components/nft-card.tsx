"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import {
  useConnection,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { polygon, polygonAmoy } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { NFT_ABI } from "@/contracts/nft-abi";

interface NFTCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
  isVenueMode?: boolean;
}

import { SuccessDialog } from "./success-dialog";

export function NFTCard({
  id,
  title,
  description,
  image,
  isVenueMode,
}: NFTCardProps) {
  const { address, isConnected, chain } = useConnection();
  const [isSponsoredMinting, setIsSponsoredMinting] = useState(false);
  const [sponsoredError, setSponsoredError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState("");

  // Select contract address based on current network
  const getContractAddress = () => {
    if (!chain) return CONTRACT_ADDRESSES.anvil; // Default to Anvil

    switch (chain.id) {
      case polygon.id:
        return CONTRACT_ADDRESSES.polygon;
      case polygonAmoy.id:
        return CONTRACT_ADDRESSES.polygonAmoy;
      default:
        return CONTRACT_ADDRESSES.anvil;
    }
  };

  const contractAddress = getContractAddress();

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const targetAddressForBalance = isVenueMode ? manualAddress : address;

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: contractAddress,
    abi: NFT_ABI,
    functionName: "balanceOf",
    args:
      targetAddressForBalance && isAddress(targetAddressForBalance)
        ? [targetAddressForBalance, BigInt(id)]
        : undefined,
    query: {
      enabled: !!targetAddressForBalance && isAddress(targetAddressForBalance),
    },
  });

  useEffect(() => {
    if (isSuccess || showSuccessDialog) {
      refetchBalance();
    }
  }, [isSuccess, showSuccessDialog, refetchBalance]);

  const handleMint = async () => {
    const targetAddress = isVenueMode ? manualAddress : address;

    if (!isVenueMode && (!isConnected || !targetAddress)) {
      alert("ウォレットを接続してください");
      return;
    }

    if (isVenueMode && !isAddress(targetAddress || "")) {
      alert("有効なアドレスを入力してください");
      return;
    }

    // Try sponsored mint first (always true for Venue Mode)
    setIsSponsoredMinting(true);
    setSponsoredError(null);

    try {
      const response = await fetch("/api/sponsored-mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: targetAddress,
          tokenType: id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessTxHash(data.txHash);
        setShowSuccessDialog(true);
        setIsSponsoredMinting(false);
        if (isVenueMode) setManualAddress(""); // Clear input on success
        return;
      }

      // If sponsored mint fails
      setSponsoredError(data.error || "スポンサードミントに失敗しました");

      // In Venue Mode, we don't fall back to wallet minting
      if (isVenueMode) {
        alert(`エラー: ${data.error || "ミントに失敗しました"}`);
        setIsSponsoredMinting(false);
        return;
      }
    } catch (_err) {
      setSponsoredError("スポンサードミントの確認に失敗しました");
      if (isVenueMode) {
        alert("エラーが発生しました");
        setIsSponsoredMinting(false);
        return;
      }
    }

    setIsSponsoredMinting(false);

    // Regular mint (user pays gas) - Only for non-Venue Mode
    if (!isVenueMode && targetAddress) {
      writeContract({
        address: contractAddress,
        abi: NFT_ABI,
        functionName: "mintLocked",
        args: [targetAddress, BigInt(id), BigInt(1), "0x"],
      });
    }
  };

  return (
    <>
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        txHash={successTxHash}
      />
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-900">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>

          {targetAddressForBalance && isAddress(targetAddressForBalance) && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              所持数: {balance != null ? balance.toString() : "確認中..."}
            </p>
          )}

          {isVenueMode && (
            <div className="mb-4">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleMint}
            disabled={
              (!isVenueMode && !isConnected) ||
              isPending ||
              isConfirming ||
              isSponsoredMinting ||
              (isVenueMode && !manualAddress)
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {isVenueMode ? (
              isSponsoredMinting ? (
                "ミント中..."
              ) : (
                "Mint (Venue Mode)"
              )
            ) : (
              <>
                {!isConnected && "ウォレットを接続してください"}
                {isConnected &&
                  isSponsoredMinting &&
                  "スポンサードミント確認中..."}
                {isConnected && isPending && "署名待ち..."}
                {isConnected && isConfirming && "トランザクション確認中..."}
                {isConnected &&
                  !isPending &&
                  !isConfirming &&
                  !isSponsoredMinting &&
                  "Mint"}
              </>
            )}
          </button>
          {isSuccess && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              ミント成功！
            </p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              エラー:{" "}
              {error.message.includes("User denied")
                ? "キャンセルされました"
                : error.message}
            </p>
          )}
          {sponsoredError && (
            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              {isVenueMode
                ? sponsoredError
                : `${sponsoredError} - 通常のミントにフォールバック`}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
