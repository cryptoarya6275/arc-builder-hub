// src/components/wallet/WalletDashboard.tsx
"use client";

import { useState } from "react";
import { useAccount, useBalance, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { shortenAddress, getExplorerAddressUrl, ARC_TESTNET, isArcTestnet } from "@/lib/arcNetwork";
import { arcTestnetChain } from "@/lib/wagmiConfig";

export default function WalletDashboard() {
  const { address, isConnected } = useAccount();
  const { data: balanceData, refetch: refetchBalance } = useBalance({ address });
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const isCorrectNetwork = isArcTestnet(chainId);

  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchBalance();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleSwitchNetwork = () => {
    switchChain({ chainId: arcTestnetChain.id });
  };

  const formatBalance = (formatted: string | undefined) => {
    if (!formatted) return "—";
    const num = parseFloat(formatted);
    if (num === 0) return "0.0000";
    if (num < 0.0001) return "< 0.0001";
    return num.toFixed(4);
  };

  return (
    <section id="dashboard" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-px h-8 bg-arc-400/40" />
            <span className="font-display text-xs text-arc-400/70 uppercase tracking-widest">
              01 / Wallet
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-arc-50">
            Wallet Dashboard
          </h2>
          <p className="text-dark-400 mt-2">
            Connect your wallet and manage your Arc Testnet account.
          </p>
        </div>

        {!isConnected ? (
          <div className="arc-card p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-arc-400/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-arc-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-arc-100 mb-2">
              No Wallet Connected
            </h3>
            <p className="text-dark-400 text-sm mb-6">
              Connect your wallet to view your balance and use the tools.
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Address Card */}
            <div className="lg:col-span-2 arc-card p-6 gradient-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="arc-label">Wallet Address</span>
                  <div className="flex items-center gap-3">
                    <span className="status-dot connected" />
                    <span className="font-mono text-sm text-arc-100 break-all">
                      {address}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={copyAddress}
                  className="arc-button-secondary text-sm py-2 px-4 flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      Copy Address
                    </>
                  )}
                </button>

                <a
                  href={address ? getExplorerAddressUrl(address) : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="arc-button-secondary text-sm py-2 px-4 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                  View on Explorer
                </a>

                <button
                  onClick={() => disconnect()}
                  className="text-sm py-2 px-4 flex items-center gap-2 rounded-lg border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/40 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Disconnect
                </button>
              </div>
            </div>

            {/* Balance Card */}
            <div className="arc-card p-6">
              <span className="arc-label">Balance</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-3xl font-bold text-arc-50 glow-text">
                  {formatBalance(balanceData?.formatted)}
                </span>
                <span className="text-arc-400 font-mono text-sm">
                  {balanceData?.symbol ?? "USDC"}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-dark-700/50">
                <button
                  onClick={handleRefresh}
                  className="text-xs font-display text-dark-500 hover:text-arc-400 transition-colors flex items-center gap-2"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                  </svg>
                  Refresh Balance
                </button>
              </div>
            </div>

            {/* Network Status */}
            <div className="lg:col-span-3">
              {isCorrectNetwork ? (
                <div className="arc-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-arc-400/5 border-arc-400/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-green-400">
                        Connected to Arc Testnet
                      </div>
                      <div className="font-mono text-xs text-dark-500 mt-0.5">
                        Chain ID: {arcTestnetChain.id} · {ARC_TESTNET.rpcUrls[0]}
                      </div>
                    </div>
                  </div>
                  <div className="arc-badge bg-green-500/10 text-green-400 border border-green-500/20">
                    ✓ Ready to Build
                  </div>
                </div>
              ) : (
                <div className="arc-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-500/5 border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-amber-400">
                        Wrong Network
                      </div>
                      <div className="font-mono text-xs text-dark-500 mt-0.5">
                        Current Chain ID: {chainId} · Switch to Arc Testnet ({arcTestnetChain.id})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSwitchNetwork}
                    className="arc-button-primary text-sm py-2 px-5 whitespace-nowrap"
                  >
                    Switch to Arc Testnet
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
