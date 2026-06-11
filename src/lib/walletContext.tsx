// src/lib/walletContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { ARC_TESTNET, isArcTestnet, switchToArcTestnet } from "./arcNetwork";

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
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    isCorrectNetwork: false,
    provider: null,
    signer: null,
    error: null,
  });

  const updateState = (partial: Partial<WalletState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const refreshBalance = useCallback(async () => {
    if (!state.provider || !state.address) return;
    try {
      const bal = await state.provider.getBalance(state.address);
      updateState({ balance: ethers.formatEther(bal) });
    } catch {
      // ignore
    }
  }, [state.provider, state.address]);

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      updateState({ error: "MetaMask is not installed. Please install it to continue." });
      return;
    }

    updateState({ isConnecting: true, error: null });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const balance = await provider.getBalance(address);

      updateState({
        provider,
        signer,
        address,
        chainId,
        balance: ethers.formatEther(balance),
        isConnected: true,
        isConnecting: false,
        isCorrectNetwork: isArcTestnet(chainId),
        error: null,
      });
    } catch (err: unknown) {
      updateState({
        isConnecting: false,
        error: (err as Error).message || "Failed to connect wallet",
      });
    }
  };

  const disconnect = () => {
    setState({
      address: null,
      balance: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      isCorrectNetwork: false,
      provider: null,
      signer: null,
      error: null,
    });
  };

  const switchNetwork = async () => {
    const result = await switchToArcTestnet();
    if (!result.success) {
      updateState({ error: result.error || "Failed to switch network" });
    } else {
      // Wait for MetaMask to finish the switch before re-reading chain state
      await new Promise((r) => setTimeout(r, 800));
      try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const balance = await provider.getBalance(address);
        updateState({
          provider,
          signer,
          address,
          chainId,
          balance: ethers.formatEther(balance),
          isCorrectNetwork: isArcTestnet(chainId),
          error: null,
        });
      } catch {
        // chainChanged listener will handle state update as fallback
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (state.isConnected) {
        updateState({ address: accounts[0] });
        await refreshBalance();
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      updateState({
        chainId,
        isCorrectNetwork: isArcTestnet(chainId),
      });
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [state.isConnected, refreshBalance]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
        if (accounts.length > 0) {
          await connect();
        }
      } catch {
        // ignore
      }
    };
    autoConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletContext.Provider
      value={{ ...state, connect, disconnect, switchNetwork, refreshBalance }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

// Extend Window type for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
