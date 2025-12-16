"use client";

import { useWallet } from "@/contexts/wallet-context";

export function WalletConnectButton() {
  const { isConnected, shortAddress, connect, disconnect } = useWallet();

  if (isConnected && shortAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {shortAddress}
        </div>
        <button
          type="button"
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
}
