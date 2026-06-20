// src/components/ui/Hero.tsx
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ARC_TESTNET, switchToArcTestnet } from "@/lib/arcNetwork";

const TOOLS = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    label: "Token Deployer",
    desc: "Deploy ERC20",
    live: true,
    color: "text-arc-400",
    bg: "bg-arc-400/10",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
    ),
    label: "Faucet Checker",
    desc: "Claim Testnet",
    live: true,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    label: "Multi-Send",
    desc: "Batch Transfer",
    live: true,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

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
      {/* Deep background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Faint dot grid */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(167,139,250,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Primary glow — purple */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.18) 0%, transparent 65%)",
        }}
      />

      {/* Secondary glow — blue */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-12 w-2 h-2 rounded-full bg-arc-400/40 animate-ping" style={{ animationDuration: "3s" }} />
      <div className="absolute top-1/3 right-20 w-1.5 h-1.5 rounded-full bg-blue-400/30 animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }} />
      <div className="absolute bottom-1/3 left-1/4 w-1 h-1 rounded-full bg-arc-500/50 animate-ping" style={{ animationDuration: "5s", animationDelay: "2s" }} />
      <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-purple-400/30 animate-ping" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-28">
        {/* Version badge */}
        <div className="inline-flex items-center gap-2 arc-badge bg-arc-400/8 text-arc-400/80 border border-arc-400/15 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-pulse" />
          <span className="font-mono text-xs tracking-widest">
            ARC TESTNET · CHAIN ID {ARC_TESTNET.chainIdDecimal}
          </span>
          <span className="w-px h-3 bg-arc-400/20" />
          <span className="font-mono text-xs text-green-400">LIVE</span>
        </div>

        {/* Main heading */}
        <div className="relative mb-6 animate-slide-up">
          {/* Glow behind title */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.15) 0%, transparent 60%)",
              filter: "blur(32px)",
            }}
          />
          <h1 className="relative font-display text-5xl sm:text-6xl lg:text-8xl font-bold leading-none">
            <span className="text-arc-50 block">ARC</span>
            <span
              className="block text-transparent bg-clip-text mt-1"
              style={{
                backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #2563eb 40%, #a78bfa 80%)",
                backgroundSize: "200% auto",
                animation: "shimmer 4s linear infinite",
              }}
            >
              BUILDER HUB
            </span>
          </h1>
        </div>

        {/* Subtitle — updated copy */}
        <p
          className="text-dark-300 text-lg sm:text-xl max-w-2xl mx-auto mb-3 animate-slide-up font-body leading-relaxed"
          style={{ animationDelay: "0.1s" }}
        >
          A modular{" "}
          <span className="text-arc-400 font-medium">Builder OS</span> for{" "}
          <span className="text-arc-400 font-medium">Arc Layer 1</span>. Token deployment,
          deployment tracking, faucet intelligence, and essential onchain infrastructure
          in one unified interface.
        </p>

        {/* Network info strip */}
        <div
          className="inline-flex flex-wrap justify-center items-center gap-3 sm:gap-5 mt-2 mb-10 px-5 py-2.5 rounded-full border border-arc-400/10 bg-dark-950/60 backdrop-blur-sm text-xs font-mono text-dark-500 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            rpc.testnet.arc.network
          </span>
          <span className="hidden sm:block text-dark-700">·</span>
          <span className="text-arc-400/70">Gas: USDC</span>
          <span className="hidden sm:block text-dark-700">·</span>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-arc-400 transition-colors flex items-center gap-1"
          >
            arcscan.app
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </div>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal, connectModalOpen }) => (
                <button
                  onClick={openConnectModal}
                  disabled={connectModalOpen}
                  className="arc-button-primary text-base px-8 py-4 glow-border flex items-center gap-2"
                >
                  {connectModalOpen ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                      </svg>
                      Connect Wallet
                    </>
                  )}
                </button>
              )}
            </ConnectButton.Custom>
          ) : (
            <a href="#tools" className="arc-button-primary text-base px-8 py-4 glow-border flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Open Dashboard ↓
            </a>
          )}

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

        {/* Tool cards */}
        <div
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto animate-fade-in"
          style={{ animationDelay: "0.45s" }}
        >
          {TOOLS.map((tool) => (
            <a
              key={tool.label}
              href="#tools"
              className="glass-card rounded-xl p-4 text-center hover-lift group cursor-pointer"
            >
              <div
                className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform duration-200`}
              >
                {tool.icon}
              </div>
              <div className="text-xs font-display text-dark-200 font-bold group-hover:text-arc-100 transition-colors">
                {tool.label}
              </div>
              <div className="text-xs font-mono text-dark-500 mt-0.5">{tool.desc}</div>
              <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-mono text-green-400">
                <span className="w-1 h-1 rounded-full bg-green-400" />
                LIVE
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
