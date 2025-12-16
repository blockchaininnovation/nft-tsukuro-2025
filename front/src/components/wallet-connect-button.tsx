"use client";

import {
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { config } from "@/lib/wagmi-config";

export function WalletConnectButton() {
  const { address, isConnected } = useConnection();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const { chains } = config;

  const handleConnect = async () => {
    const connector = connectors[0];
    if (!connector) return;

    // Detect the current network from Metamask
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const chainIdHex = await window.ethereum.request({
          method: "eth_chainId",
        });
        const chainId = parseInt(chainIdHex as string, 16);

        // Check if the detected chain is supported
        const supportedChain = chains.find((c) => c.id === chainId);

        if (supportedChain) {
          // Connect with the user's selected chain
          connect({ connector, chainId });
        } else {
          // Connect without specifying chainId (will use chains[0])
          connect({ connector });
        }
      } catch (error) {
        console.error("Failed to get chainId:", error);
        connect({ connector });
      }
    } else {
      connect({ connector });
    }
  };

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
      onClick={handleConnect}
      disabled={!connector}
      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
}
