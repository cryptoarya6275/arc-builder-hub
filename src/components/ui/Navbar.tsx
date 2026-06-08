// src/components/ui/Navbar.tsx
"use client";

import { useWallet } from "@/lib/walletContext";
import { shortenAddress, ARC_TESTNET } from "@/lib/arcNetwork";

export default function Navbar() {
  const { address, isConnected, isCorrectNetwork, chainId, connect, disconnect, switchNetwork } =
    useWallet();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-arc-400/10 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-arc-400/20 animate-pulse-slow" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-arc-400 to-arc-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-dark-950"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-display text-sm font-bold text-arc-100 tracking-tight">
                ARC BUILDER HUB
              </span>
              <span className="ml-2 text-xs font-mono text-arc-400/50">v1.0</span>
            </div>
          </div>

          {/* Nav links - desktop */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#dashboard" className="text-xs font-display text-dark-400 hover:text-arc-400 transition-colors tracking-wider uppercase">
              Dashboard
            </a>
            <a href="#deployer" className="text-xs font-display text-dark-400 hover:text-arc-400 transition-colors tracking-wider uppercase">
              Deploy
            </a>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-display text-dark-400 hover:text-arc-400 transition-colors tracking-wider uppercase flex items-center gap-1"
            >
              Explorer
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          </div>

          {/* Wallet section */}
          <div className="flex items-center gap-3">
            {/* Network badge */}
            {isConnected && (
              <div className="hidden sm:flex items-center gap-2">
                {isCorrectNetwork ? (
                  <div className="arc-badge bg-arc-400/10 text-arc-400 border border-arc-400/20">
                    <span className="status-dot connected" />
                    Arc Testnet
                  </div>
                ) : (
                  <button
                    onClick={switchNetwork}
                    className="arc-badge bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                  >
                    <span className="status-dot wrong-network" />
                    Switch Network
                  </button>
                )}
              </div>
            )}

            {/* Connect / Address */}
            {!isConnected ? (
              <button onClick={connect} className="arc-button-primary text-sm py-2 px-4">
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="arc-card px-3 py-2 flex items-center gap-2">
                  <span className="status-dot connected" />
                  <span className="font-mono text-xs text-arc-300">
                    {address ? shortenAddress(address) : ""}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="p-2 rounded-lg border border-dark-700 text-dark-400 hover:text-red-400 hover:border-red-400/30 transition-colors"
                  title="Disconnect"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
