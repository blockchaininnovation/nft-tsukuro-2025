"use client";

import { useState } from "react";
import Image from "next/image";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { NFT_ABI } from "@/contracts/nft-abi";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { anvil, polygon, polygonAmoy } from "wagmi/chains";

interface NFTCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
}

export function NFTCard({ id, title, description, image }: NFTCardProps) {
  const { address, isConnected, chain } = useAccount();
  const [isSponsoredMinting, setIsSponsoredMinting] = useState(false);
  const [sponsoredError, setSponsoredError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Select contract address based on current network
  const getContractAddress = () => {
    if (!chain) return CONTRACT_ADDRESSES.anvil; // Default to Anvil

    switch (chain.id) {
      case polygon.id:
        return CONTRACT_ADDRESSES.polygon;
      case polygonAmoy.id:
        return CONTRACT_ADDRESSES.polygonAmoy;
      case anvil.id:
      default:
        return CONTRACT_ADDRESSES.anvil;
    }
  };

  const contractAddress = getContractAddress();

  const handleMint = async () => {
    if (!isConnected || !address) {
      alert("ウォレットを接続してください");
      return;
    }

    // Try sponsored mint first
    setIsSponsoredMinting(true);
    setSponsoredError(null);

    try {
      const response = await fetch("/api/sponsored-mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: address,
          tokenType: id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`ミント成功！トランザクションハッシュ: ${data.txHash}`);
        setIsSponsoredMinting(false);
        return;
      }

      // If sponsored mint fails, fall back to regular mint
      setSponsoredError(data.error || "スポンサードミントに失敗しました");
    } catch (err) {
      setSponsoredError("スポンサードミントの確認に失敗しました");
    }

    setIsSponsoredMinting(false);

    // Regular mint (user pays gas)
    writeContract({
      address: contractAddress,
      abi: NFT_ABI,
      functionName: "mint",
      args: [address, BigInt(id)],
    });
  };

  return (
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
        <button
          type="button"
          onClick={handleMint}
          disabled={!isConnected || isPending || isConfirming || isSponsoredMinting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          {!isConnected && "ウォレットを接続してください"}
          {isConnected && isSponsoredMinting && "スポンサードミント確認中..."}
          {isConnected && isPending && "署名待ち..."}
          {isConnected && isConfirming && "トランザクション確認中..."}
          {isConnected && !isPending && !isConfirming && !isSponsoredMinting && "Mint"}
        </button>
        {isSuccess && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            ミント成功！
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            エラー: {error.message}
          </p>
        )}
        {sponsoredError && (
          <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
            {sponsoredError} - 通常のミントにフォールバック
          </p>
        )}
      </div>
    </div>
  );
}
