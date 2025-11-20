"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          type="button"
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const connector = connectors[0];

  return (
    <button
      type="button"
      onClick={() => connect({ connector })}
      disabled={!connector}
      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
}
