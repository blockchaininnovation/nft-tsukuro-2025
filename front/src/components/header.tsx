"use client";

import { useWallet } from "@/contexts/wallet-context";
import { WalletConnectButton } from "./wallet-connect-button";

export function Header() {
  const { isVenueMode } = useWallet();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">みんなでNFTつくろう</h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              UTokyo Blockchain Open Course 2025
            </p>
          </div>
          {!isVenueMode && <WalletConnectButton />}
        </div>
      </div>
    </header>
  );
}
