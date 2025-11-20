"use client";

import { WalletConnectButton } from "./wallet-connect-button";

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">NFT Tsukuro 2025</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              参加証NFTをミントしよう
            </p>
          </div>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
