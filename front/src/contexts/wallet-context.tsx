"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { type Address, type Chain, isAddress } from "viem";
import { useConnect, useConnection, useConnectors, useDisconnect } from "wagmi";
import { anvil, polygon, polygonAmoy } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

interface WalletContextValue {
  // Wagmiからの基本状態
  address: Address | undefined;
  isConnected: boolean;
  chain: Chain | undefined;

  // アクション
  connect: () => Promise<void>;
  disconnect: () => void;

  // 会場モード関連
  isVenueMode: boolean;
  manualAddress: string;
  setManualAddress: (address: string) => void;

  // 派生値
  displayAddress: Address | undefined;
  contractAddress: Address | undefined;
  isAddressValid: boolean;
  shortAddress: string | undefined;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
  isVenueMode?: boolean;
}

// コントラクトアドレスを取得するヘルパー関数
function getContractAddressForChain(
  currentChain: Chain | undefined,
): Address | undefined {
  if (!currentChain) return undefined;

  switch (currentChain.id) {
    case polygon.id:
      return CONTRACT_ADDRESSES.polygon as Address;
    case polygonAmoy.id:
      return CONTRACT_ADDRESSES.polygonAmoy as Address;
    case anvil.id:
      return CONTRACT_ADDRESSES.anvil as Address;
    default:
      return undefined;
  }
}

export function WalletProvider({
  children,
  isVenueMode = false,
}: WalletProviderProps) {
  // Wagmiフック
  const { address, isConnected, chain } = useConnection();
  const { connect: wagmiConnect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const connectors = useConnectors();

  // 会場モード用の手動アドレス状態
  const [manualAddress, setManualAddress] = useState("");

  // 派生値を計算
  const displayAddress = useMemo(() => {
    if (isVenueMode) {
      return manualAddress && isAddress(manualAddress)
        ? (manualAddress as Address)
        : undefined;
    }
    return address;
  }, [isVenueMode, manualAddress, address]);

  const contractAddress = useMemo(
    () => getContractAddressForChain(chain),
    [chain],
  );

  const isAddressValid = useMemo(
    () => (displayAddress ? isAddress(displayAddress) : false),
    [displayAddress],
  );

  const shortAddress = useMemo(() => {
    if (!displayAddress) return undefined;
    return `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`;
  }, [displayAddress]);

  // 接続アクション
  const connect = async () => {
    const connector = connectors[0];
    if (!connector) {
      console.error("No connector available");
      return;
    }

    try {
      await wagmiConnect({ connector, chainId: chain?.id });
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
    }
  };

  // 切断アクション
  const disconnect = () => {
    wagmiDisconnect();
  };

  const value: WalletContextValue = {
    address,
    isConnected,
    chain,
    connect,
    disconnect,
    isVenueMode,
    manualAddress,
    setManualAddress,
    displayAddress,
    contractAddress,
    isAddressValid,
    shortAddress,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// カスタムフックでコンテキストを使用
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
