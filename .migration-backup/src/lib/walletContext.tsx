// src/lib/walletContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useAccount, useBalance, useSwitchChain, useDisconnect, useConnectorClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { isArcTestnet, ARC_TESTNET, switchToArcTestnet } from "./arcNetwork";

interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => void;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

function WalletBridge({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting, chainId } = useAccount();
  const { data: balanceData, refetch: refetchBalance } = useBalance({ address });
  const { switchChain } = useSwitchChain();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { data: connectorClient } = useConnectorClient();

  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert wagmi connector client into an ethers v6 signer
  useEffect(() => {
    if (!connectorClient?.account) {
      setSigner(null);
      setProvider(null);
      return;
    }
    const { account, chain, transport } = connectorClient;
    const ethProvider = new ethers.BrowserProvider(transport, {
      chainId: chain.id,
      name: chain.name,
    });
    setProvider(ethProvider);
    ethProvider
      .getSigner(account.address)
      .then(setSigner)
      .catch(() => setSigner(null));
  }, [connectorClient]);

  const isCorrectNetwork = chainId != null && isArcTestnet(chainId);

  const formattedBalance = balanceData
    ? ethers.formatUnits(balanceData.value, balanceData.decimals)
    : null;

  const connect = () => {
    openConnectModal?.();
  };

  const disconnect = () => {
    wagmiDisconnect();
    setSigner(null);
    setProvider(null);
  };

  const switchNetwork = async () => {
    try {
      switchChain({ chainId: ARC_TESTNET.chainIdDecimal });
    } catch {
      const result = await switchToArcTestnet();
      if (!result.success) {
        setError(result.error || "Failed to switch network");
      }
    }
  };

  const refreshBalance = async () => {
    await refetchBalance();
  };

  const value: WalletContextType = {
    address: address ?? null,
    balance: formattedBalance,
    chainId: chainId ?? null,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    provider,
    signer,
    error,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return <WalletBridge>{children}</WalletBridge>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
