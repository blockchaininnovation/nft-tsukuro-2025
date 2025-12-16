"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAddress } from "viem";
import { useReadContract } from "wagmi";
import { useWallet } from "@/contexts/wallet-context";
import { NFT_ABI } from "@/contracts/nft-abi";

interface NFTCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
}

import { ErrorDialog } from "./error-dialog";
import { type QrScanError, QrScannerModal } from "./qr-scanner-modal";
import { SuccessDialog } from "./success-dialog";

export function NFTCard({ id, title, description, image }: NFTCardProps) {
  const {
    isVenueMode,
    isConnected,
    displayAddress,
    contractAddress,
    isAddressValid,
    shortAddress,
    manualAddress,
    setManualAddress,
    chain,
  } = useWallet();

  const [isSponsoredMinting, setIsSponsoredMinting] = useState(false);
  const [sponsoredError, setSponsoredError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState("");
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState({
    title: "",
    message: "",
    details: "",
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: contractAddress,
    abi: NFT_ABI,
    functionName: "balanceOf",
    args:
      displayAddress && isAddress(displayAddress)
        ? [displayAddress, BigInt(id)]
        : undefined,
    query: {
      enabled: !!displayAddress && isAddress(displayAddress),
    },
  });

  useEffect(() => {
    if (showSuccessDialog) {
      refetchBalance();
    }
  }, [showSuccessDialog, refetchBalance]);

  const handleQrScanSuccess = (address: string) => {
    setManualAddress(address);
    setIsQrScannerOpen(false);
    toast.success("ウォレットアドレスを読み取りました");
  };

  const handleQrScanError = (error: QrScanError) => {
    setIsQrScannerOpen(false);

    if (error.type === "camera_permission") {
      setErrorDialogContent({
        title: "カメラアクセスが拒否されました",
        message:
          "QRコードをスキャンするにはカメラへのアクセスを許可してください。",
        details:
          "ブラウザの設定でこのサイトのカメラアクセスを許可してください。",
      });
      setShowErrorDialog(true);
    } else {
      toast.error(error.message);
    }
  };

  const handleMint = async () => {
    if (!isVenueMode && (!isConnected || !displayAddress)) {
      alert("ウォレットを接続してください");
      return;
    }

    if (isVenueMode && !isAddressValid) {
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
          to: displayAddress,
          tokenType: id,
          chainId: chain?.id,
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
      setSponsoredError(data.error || "ミントに失敗しました");
      setIsSponsoredMinting(false);
    } catch (_err) {
      setSponsoredError("ミントに失敗しました");
      setIsSponsoredMinting(false);
    }
  };

  return (
    <>
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        txHash={successTxHash}
      />
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        {...errorDialogContent}
      />
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleQrScanSuccess}
        onError={handleQrScanError}
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

          {displayAddress && isAddressValid && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              所持数: {balance != null ? balance.toString() : "確認中..."}
            </p>
          )}

          {isVenueMode ? (
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                  aria-label="QRコードをスキャン"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <title>QRコードスキャナー</title>
                    <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                    <path d="M14 14h7v7h-7z" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            isConnected &&
            shortAddress && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-mono">
                {shortAddress}
              </p>
            )
          )}

          <button
            type="button"
            onClick={handleMint}
            disabled={
              (!isVenueMode && !isConnected) ||
              isSponsoredMinting ||
              (isVenueMode && !manualAddress)
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {!isVenueMode && !isConnected
              ? "ウォレットを接続してください"
              : isSponsoredMinting
                ? "ミント中..."
                : "Mint"}
          </button>
          {sponsoredError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {sponsoredError}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
