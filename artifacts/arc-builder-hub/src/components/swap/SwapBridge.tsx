// src/components/swap/SwapBridge.tsx
"use client";

import { useState } from "react";
import SwapPanel from "./SwapPanel";
import BridgePanel from "./BridgePanel";

type Tab = "swap" | "bridge";

export default function SwapBridge() {
  const [activeTab, setActiveTab] = useState<Tab>("swap");

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Section background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900/50 to-dark-950 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(167,139,250,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-lg mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 arc-badge bg-arc-400/8 text-arc-400/80 border border-arc-400/15 mb-4">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 014-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
            <span className="font-mono text-xs tracking-widest">SWAP & BRIDGE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-arc-50 mb-3">
            Token{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #2563eb 100%)",
              }}
            >
              Exchange
            </span>
          </h2>
          <p className="font-body text-dark-300 text-sm leading-relaxed max-w-sm mx-auto">
            Swap Arc Testnet assets or bridge stablecoins cross-chain via Circle CCTP V2.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-arc-400/10 bg-dark-950/40">
            <button
              onClick={() => setActiveTab("swap")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-display text-sm tracking-wide transition-all relative ${
                activeTab === "swap"
                  ? "text-arc-50"
                  : "text-dark-500 hover:text-dark-300"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 014-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
              Swap
              {activeTab === "swap" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-arc-400 to-blue-500 rounded-full" />
              )}
            </button>
            <div className="w-px bg-arc-400/10 my-3" />
            <button
              onClick={() => setActiveTab("bridge")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-display text-sm tracking-wide transition-all relative ${
                activeTab === "bridge"
                  ? "text-arc-50"
                  : "text-dark-500 hover:text-dark-300"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8h1a4 4 0 010 8h-1" />
                <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              Bridge
              {activeTab === "bridge" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-arc-400 to-blue-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Panel content */}
          <div className="p-5">
            {activeTab === "swap" ? <SwapPanel /> : <BridgePanel />}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-center font-mono text-xs text-dark-600">
          Testnet only. No real assets. Infrastructure preview build.
        </p>
      </div>
    </section>
  );
}
