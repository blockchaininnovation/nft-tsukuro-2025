"use client";

import { useConnection, useConnect, useDisconnect, useSwitchChain, useConnectors } from "wagmi";
import { useEffect } from "react";
import { config } from "@/lib/wagmi-config";

export function WalletConnectButton() {
  const { address, isConnected, chain } = useConnection();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { chains } = config;
  const defaultChain = chains[0];

  useEffect(() => {
    if (isConnected && address && chain?.id !== defaultChain.id) {
      switchChain({ chainId: defaultChain.id });
    }
  }, [isConnected, address, chain, defaultChain.id, switchChain]);

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
