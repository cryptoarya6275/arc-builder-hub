// src/components/swap/TokenSelectorModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: string | null; // null = native gas token
  logo: string;
  color: string;
}

// Arc Testnet tokens supported by Circle App Kit Swap:
// https://docs.arc.io/app-kit/references/supported-blockchains#supported-tokens
// Only USDC, EURC, and cirBTC are supported for Swap on Arc Testnet.
export const ARC_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 18, // native gas token on Arc Testnet — 18 decimals
    address: null, // USDC is the native currency, not an ERC20
    logo: "usdc",
    color: "#2775CA",
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    decimals: 6,
    address: "0x08210F9170F89Ab7658F0B5E3fF39b0E03C2Bef9",
    logo: "eurc",
    color: "#2B92D3",
  },
  {
    symbol: "cirBTC",
    name: "Circle BTC",
    decimals: 8,
    address: "0x3B6fBba7d0F0E1E2aF8E8E5F3D9B2A1C4F7E8901",
    logo: "btc",
    color: "#F7931A",
  },
];

export function TokenLogo({ token, size = 36 }: { token: Token; size?: number }) {
  const s = size;
  if (token.logo === "usdc") {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#2775CA" />
        <path d="M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.232-2.196-.696-2.196-1.504s.6-1.312 1.8-1.312c1.08 0 1.68.36 1.972 1.248a.38.38 0 00.368.252h.844a.36.36 0 00.36-.372c-.228-1.536-1.24-2.412-2.748-2.604V9.5a.37.37 0 00-.372-.372h-.8a.37.37 0 00-.372.372v1.12c-1.756.228-2.88 1.368-2.88 2.796 0 2.028 1.228 2.808 3.788 3.112 1.704.228 2.248.624 2.248 1.556 0 .932-.812 1.572-1.92 1.572-1.508 0-2.004-.64-2.164-1.54a.378.378 0 00-.372-.3h-.888a.36.36 0 00-.36.372c.196 1.688 1.356 2.7 3.024 2.9v1.14a.37.37 0 00.372.372h.8a.37.37 0 00.372-.372v-1.132c1.764-.252 2.916-1.436 2.916-2.972z" fill="white" />
      </svg>
    );
  }
  if (token.logo === "eurc") {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#2B92D3" />
        <text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">€</text>
      </svg>
    );
  }
  if (token.logo === "btc") {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path d="M22.5 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6-1.3-.3.7-2.6-1.7-.4-.7 2.7-1-.2-2.3-.6-.4 1.8s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .1.1-.1 0-.2-.1-.3-.1l-1.1 4.5c-.1.3-.4.6-.9.5 0 0-1.2-.3-1.2-.3l-.9 1.9 2.2.6 1.2.3-.7 2.8 1.7.4.7-2.8 1.3.3-.7 2.7 1.7.4.7-2.7c2.9.5 5 .3 5.9-2.3.7-2-.1-3.2-1.5-3.9 1-.3 1.8-1 2-2.5zm-3.5 5c-.5 1.9-3.8.9-4.8.6l.9-3.4c1 .3 4.2.8 3.9 2.8zm.5-5c-.5 1.8-3.2.9-4.1.6l.8-3c.9.2 3.9.7 3.3 2.4z" fill="white" />
      </svg>
    );
  }
  // Generic circle fallback
  return (
    <div
      style={{ width: s, height: s, borderRadius: "50%", background: token.color, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <span style={{ color: "white", fontSize: s * 0.35, fontWeight: "bold" }}>{token.symbol[0]}</span>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excluded?: string;
  title: string;
}

export default function TokenSelectorModal({ open, onClose, onSelect, excluded, title }: Props) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = ARC_TOKENS.filter(
    (t) =>
      t.symbol !== excluded &&
      (t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-arc-400/20 bg-dark-900 shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-arc-400/10">
          <h3 className="font-display text-sm tracking-widest text-arc-400/80 uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-arc-300 hover:bg-arc-400/10 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-arc-400/10">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search token symbol or name..."
              className="w-full bg-dark-950/80 border border-arc-400/15 rounded-lg pl-9 pr-4 py-2.5 text-sm text-arc-50 placeholder-dark-500 font-mono focus:outline-none focus:border-arc-400/50 focus:ring-1 focus:ring-arc-400/20 transition-all"
            />
          </div>
        </div>

        {/* Token list */}
        <div className="py-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-dark-500 font-mono text-sm">No tokens found</div>
          ) : (
            filtered.map((token) => (
              <button
                key={token.symbol}
                onClick={() => { onSelect(token); onClose(); }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-arc-400/5 transition-all group"
              >
                <TokenLogo token={token} size={36} />
                <div className="flex-1 text-left">
                  <div className="font-display text-sm text-arc-50 group-hover:text-arc-300 transition-colors">{token.symbol}</div>
                  <div className="font-mono text-xs text-dark-400">{token.name}</div>
                </div>
                {token.address && (
                  <div className="font-mono text-xs text-dark-600 hidden sm:block">
                    {token.address.slice(0, 6)}…{token.address.slice(-4)}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-arc-400/10">
          <p className="font-mono text-xs text-dark-600 text-center">
            Swap-supported tokens on Arc Testnet via Circle App Kit
          </p>
        </div>
      </div>
    </div>
  );
}
