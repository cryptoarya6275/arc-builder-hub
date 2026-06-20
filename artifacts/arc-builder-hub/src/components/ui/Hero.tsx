// src/components/ui/Hero.tsx
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ARC_TESTNET, switchToArcTestnet } from "@/lib/arcNetwork";

export default function Hero() {
  const { isConnected } = useAccount();
  const [addingNetwork, setAddingNetwork] = useState(false);
  const [networkAdded, setNetworkAdded] = useState(false);

  const handleAddNetwork = async () => {
    setAddingNetwork(true);
    const result = await switchToArcTestnet();
    setAddingNetwork(false);
    if (result.success) {
      setNetworkAdded(true);
      setTimeout(() => setNetworkAdded(false), 3000);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(167,139,250,0.4) 0%, transparent 70%)",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-arc-400/40 animate-ping" style={{ animationDuration: "3s" }} />
      <div className="absolute top-1/3 right-16 w-1.5 h-1.5 rounded-full bg-arc-300/30 animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 left-1/4 w-1 h-1 rounded-full bg-arc-500/40 animate-ping" style={{ animationDuration: "5s", animationDelay: "2s" }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        {/* Version tag */}
        <div className="inline-flex items-center gap-2 arc-badge bg-arc-400/8 text-arc-400/80 border border-arc-400/15 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-pulse" />
          <span className="font-mono text-xs">ARC TESTNET · CHAIN ID {ARC_TESTNET.chainIdDecimal}</span>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up leading-none">
          <span className="text-arc-50">ARC</span>
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #2563eb 50%, #a78bfa 100%)",
              backgroundSize: "200% auto",
              animation: "shimmer 3s linear infinite",
            }}
          >
            BUILDER HUB
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-dark-400 text-lg sm:text-xl max-w-2xl mx-auto mb-4 animate-slide-up font-body" style={{ animationDelay: "0.1s" }}>
          A simple, powerful toolkit for building on the{" "}
          <span className="text-arc-400">Arc Layer 1 testnet</span>.
          Deploy tokens, explore contracts, and ship faster.
        </p>

        {/* Network info strip */}
        <div
          className="inline-flex items-center gap-4 mt-2 mb-10 px-4 py-2 rounded-full border border-arc-400/10 bg-dark-950/50 text-xs font-mono text-dark-500 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            RPC: rpc.testnet.arc.network
          </span>
          <span className="text-dark-700">·</span>
          <span className="text-arc-400/70">Gas: USDC</span>
          <span className="text-dark-700">·</span>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-arc-400 transition-colors"
          >
            arcscan.app ↗
          </a>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal, connectModalOpen }) => (
                <button
                  onClick={openConnectModal}
                  disabled={connectModalOpen}
                  className="arc-button-primary text-base px-8 py-4 glow-border"
                >
                  {connectModalOpen ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                      </svg>
                      Connect Wallet
                    </span>
                  )}
                </button>
              )}
            </ConnectButton.Custom>
          ) : (
            <a
              href="#dashboard"
              className="arc-button-primary text-base px-8 py-4 glow-border"
            >
              Go to Dashboard ↓
            </a>
          )}

          {/* Add Arc Testnet button */}
          <button
            onClick={handleAddNetwork}
            disabled={addingNetwork || networkAdded}
            className="arc-button-secondary text-base px-8 py-4 flex items-center gap-2"
          >
            {networkAdded ? (
              <>
                <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-green-400">Network Added!</span>
              </>
            ) : addingNetwork ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Add Arc Testnet
              </>
            )}
          </button>

          <a
            href="https://docs.arc.io"
            target="_blank"
            rel="noopener noreferrer"
            className="arc-button-secondary text-base px-8 py-4"
          >
            Read the Docs ↗
          </a>
        </div>

        {/* Tool grid preview */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
          {[
            { icon: "⚡", label: "Token Deployer", live: true },
            { icon: "💧", label: "Faucet Checker", live: true },
            { icon: "📡", label: "Multi-Send", live: false },
          ].map((tool) => (
            <div
              key={tool.label}
              className={`arc-card p-4 text-center ${tool.live ? "border-arc-400/30" : "opacity-50"}`}
            >
              <div className="text-2xl mb-2">{tool.icon}</div>
              <div className="text-xs font-display text-dark-300">{tool.label}</div>
              {tool.live ? (
                <span className="text-xs font-mono text-arc-400 mt-1 block">LIVE</span>
              ) : (
                <span className="text-xs font-mono text-dark-600 mt-1 block">SOON</span>
              )}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
