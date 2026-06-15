"use client";

import { useState } from "react";
import { type DeployedToken, timeAgo } from "@/lib/tokenHistory";
import { getExplorerAddressUrl, getExplorerTxUrl } from "@/lib/arcNetwork";

interface Props {
  tokens: DeployedToken[];
  clearHistory: () => void;
  removeToken: (id: string) => void;
}

export default function TokenHistory({ tokens, clearHistory, removeToken }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const copyAddress = async (address: string, id: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (tokens.length === 0) return null;

  return (
    <section id="token-history" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-px h-8 bg-arc-400/40" />
              <span className="font-display text-xs text-arc-400/70 uppercase tracking-widest">
                02b / History
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-arc-50">
              Deployed Tokens
            </h2>
            <p className="text-dark-400 mt-2">
              Your deployment history is saved locally in this browser.
            </p>
          </div>

          {/* Clear button */}
          <div className="flex-shrink-0">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-dark-500">Confirm?</span>
                <button
                  onClick={() => { clearHistory(); setConfirmClear(false); }}
                  className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors border border-red-500/20 rounded px-2 py-1"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-xs font-mono text-dark-500 hover:text-dark-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs font-mono text-dark-600 hover:text-dark-400 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
                Clear history
              </button>
            )}
          </div>
        </div>

        {/* Token list */}
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="arc-card p-5 group hover:border-arc-400/25 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Token identity */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-arc-600/20 border border-arc-600/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-bold text-arc-400 text-xs">
                      {token.symbol.slice(0, 3)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-arc-100 text-sm">{token.name}</span>
                      <span className="arc-badge bg-arc-400/8 text-arc-400 border border-arc-400/20 text-xs">
                        {token.symbol}
                      </span>
                      <span className="text-xs font-mono text-dark-600">{timeAgo(token.deployedAt)}</span>
                    </div>
                    <div className="text-xs font-mono text-dark-500 mt-0.5">
                      Supply: {parseFloat(token.supply).toLocaleString()} · ERC-20 · Chain {token.chainId}
                    </div>
                  </div>
                </div>

                {/* Contract address */}
                <div className="min-w-0 flex-1 sm:max-w-xs">
                  <div className="text-xs font-mono text-dark-600 mb-1">Contract</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-arc-300 truncate">
                      {token.contractAddress}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyAddress(token.contractAddress, token.id)}
                    title="Copy contract address"
                    className="w-7 h-7 rounded-lg border border-dark-700 flex items-center justify-center text-dark-500 hover:text-arc-400 hover:border-arc-400/40 transition-colors"
                  >
                    {copiedId === token.id ? (
                      <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </button>

                  <a
                    href={getExplorerAddressUrl(token.contractAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View contract on explorer"
                    className="w-7 h-7 rounded-lg border border-dark-700 flex items-center justify-center text-dark-500 hover:text-arc-400 hover:border-arc-400/40 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>

                  <a
                    href={getExplorerTxUrl(token.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View transaction on explorer"
                    className="w-7 h-7 rounded-lg border border-dark-700 flex items-center justify-center text-dark-500 hover:text-arc-400 hover:border-arc-400/40 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </a>

                  <button
                    onClick={() => removeToken(token.id)}
                    title="Remove from history"
                    className="w-7 h-7 rounded-lg border border-dark-700 flex items-center justify-center text-dark-700 hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Count */}
        {tokens.length > 1 && (
          <p className="mt-4 text-xs font-mono text-dark-700 text-right">
            {tokens.length} token{tokens.length !== 1 ? "s" : ""} deployed in this browser
          </p>
        )}
      </div>
    </section>
  );
}
