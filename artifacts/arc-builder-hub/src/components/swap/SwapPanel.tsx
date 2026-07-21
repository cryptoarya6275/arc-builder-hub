// src/components/swap/SwapPanel.tsx
"use client";

import { useState, useCallback } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isArcTestnet, switchToArcTestnet } from "@/lib/arcNetwork";
import TokenSelectorModal, { Token, ARC_TOKENS, TokenLogo } from "./TokenSelectorModal";

type TxStatus = "idle" | "pending" | "success" | "failed";

interface SlippageOption { label: string; value: number }
const SLIPPAGE_OPTIONS: SlippageOption[] = [
  { label: "0.1%", value: 0.1 },
  { label: "0.5%", value: 0.5 },
  { label: "1.0%", value: 1.0 },
];

function TxModal({
  status,
  txHash,
  onClose,
}: {
  status: TxStatus;
  txHash?: string;
  onClose: () => void;
}) {
  if (status === "idle") return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={status !== "pending" ? onClose : undefined} />
      <div className="relative w-full max-w-sm rounded-2xl border border-arc-400/20 bg-dark-900 p-7 shadow-2xl text-center animate-slide-up">
        {status === "pending" && (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 rounded-full border-2 border-arc-400/20 border-t-arc-400 animate-spin" />
            </div>
            <h3 className="font-display text-lg text-arc-50 mb-2">Awaiting Confirmation</h3>
            <p className="font-mono text-sm text-dark-400">Confirm this transaction in your wallet.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h3 className="font-display text-lg text-arc-50 mb-2">Swap Successful</h3>
            <p className="font-mono text-sm text-dark-400 mb-5">Your swap was executed on Arc Testnet.</p>
            {txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-arc-400 hover:text-arc-300 border border-arc-400/20 px-3 py-2 rounded-lg transition-colors mb-4"
              >
                View on Explorer
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            )}
            <button onClick={onClose} className="arc-button-primary w-full text-sm py-2.5">Done</button>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
            </div>
            <h3 className="font-display text-lg text-arc-50 mb-2">Transaction Failed</h3>
            <p className="font-mono text-sm text-dark-400 mb-5">The swap was rejected or failed. No funds were moved.</p>
            <button onClick={onClose} className="arc-button-secondary w-full text-sm py-2.5">Dismiss</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SwapPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = isArcTestnet(chainId);

  const [fromToken, setFromToken] = useState<Token>(ARC_TOKENS[0]); // USDC
  const [toToken, setToToken] = useState<Token>(ARC_TOKENS[3]);     // WETH
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [showSlippage, setShowSlippage] = useState(false);
  const [fromSelectorOpen, setFromSelectorOpen] = useState(false);
  const [toSelectorOpen, setToSelectorOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [switching, setSwitching] = useState(false);

  const { data: balanceData } = useBalance({
    address,
    token: fromToken.address as `0x${string}` | undefined ?? undefined,
    query: { enabled: !!address && isCorrectNetwork },
  });

  const balanceFormatted = balanceData ? parseFloat(balanceData.formatted).toFixed(4) : "0.0000";
  const amountNum = parseFloat(amount) || 0;
  const estimatedOut = amountNum > 0 ? (amountNum * 0.9982).toFixed(6) : "0.000000";
  const priceImpact = amountNum > 0 ? (amountNum * 0.001).toFixed(3) : "0.000";
  const networkFee = "~0.001 USDC";

  const effectiveSlippage = customSlippage ? parseFloat(customSlippage) : slippage;

  const handleSwapTokens = () => {
    const tmp = fromToken;
    setFromToken(toToken);
    setToToken(tmp);
    setAmount("");
  };

  const handleMax = () => {
    if (balanceData) {
      const maxVal = parseFloat(balanceData.formatted);
      setAmount(maxVal > 0.001 ? (maxVal - 0.001).toFixed(6) : "0");
    }
  };

  const handleSwitchNetwork = async () => {
    setSwitching(true);
    await switchToArcTestnet();
    setSwitching(false);
  };

  const handleSwap = useCallback(async () => {
    if (!isConnected || !isCorrectNetwork || !amount) return;
    setTxStatus("pending");
    // Simulate transaction (replace with real DEX integration)
    try {
      await new Promise((r) => setTimeout(r, 2200));
      // Randomly succeed for demo; in production wire actual swap tx here
      const mockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      setTxHash(mockHash);
      setTxStatus("success");
      setAmount("");
    } catch {
      setTxStatus("failed");
    }
  }, [isConnected, isCorrectNetwork, amount]);

  const canSwap = isConnected && isCorrectNetwork && amountNum > 0 && amountNum <= parseFloat(balanceData?.formatted ?? "0");

  return (
    <>
      <div className="space-y-3">
        {/* From */}
        <div className="rounded-xl border border-arc-400/15 bg-dark-950/60 p-4 transition-all hover:border-arc-400/25">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-dark-400 uppercase tracking-widest">From</span>
            {isConnected && isCorrectNetwork && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-dark-500">Balance: {balanceFormatted}</span>
                <button
                  onClick={handleMax}
                  className="font-mono text-xs text-arc-400 hover:text-arc-300 bg-arc-400/10 hover:bg-arc-400/20 px-2 py-0.5 rounded transition-all"
                >
                  MAX
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFromSelectorOpen(true)}
              className="flex items-center gap-2 bg-dark-900/80 border border-arc-400/15 hover:border-arc-400/35 rounded-xl px-3 py-2.5 transition-all group shrink-0"
            >
              <TokenLogo token={fromToken} size={24} />
              <span className="font-display text-sm text-arc-50 group-hover:text-arc-300 transition-colors">{fromToken.symbol}</span>
              <svg className="w-3.5 h-3.5 text-dark-500 group-hover:text-arc-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-right text-2xl font-mono text-arc-50 placeholder-dark-700 focus:outline-none"
            />
          </div>
          {amountNum > 0 && (
            <div className="mt-2 text-right font-mono text-xs text-dark-500">
              ≈ ${(amountNum * 1.0).toFixed(2)} USD
            </div>
          )}
        </div>

        {/* Swap direction button */}
        <div className="flex items-center justify-center relative">
          <div className="absolute inset-x-0 h-px bg-arc-400/10" />
          <button
            onClick={handleSwapTokens}
            className="relative w-9 h-9 rounded-xl bg-dark-900 border border-arc-400/20 hover:border-arc-400/50 flex items-center justify-center text-dark-400 hover:text-arc-400 hover:bg-arc-400/5 transition-all hover:rotate-180 duration-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div className="rounded-xl border border-arc-400/15 bg-dark-950/60 p-4 transition-all hover:border-arc-400/25">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-dark-400 uppercase tracking-widest">To (estimated)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setToSelectorOpen(true)}
              className="flex items-center gap-2 bg-dark-900/80 border border-arc-400/15 hover:border-arc-400/35 rounded-xl px-3 py-2.5 transition-all group shrink-0"
            >
              <TokenLogo token={toToken} size={24} />
              <span className="font-display text-sm text-arc-50 group-hover:text-arc-300 transition-colors">{toToken.symbol}</span>
              <svg className="w-3.5 h-3.5 text-dark-500 group-hover:text-arc-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="flex-1 text-right text-2xl font-mono text-dark-400">
              {amountNum > 0 ? estimatedOut : "0.000000"}
            </div>
          </div>
        </div>

        {/* Details */}
        {amountNum > 0 && (
          <div className="rounded-xl border border-arc-400/10 bg-dark-950/40 px-4 py-3 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-dark-500">Rate</span>
              <span className="text-dark-300">1 {fromToken.symbol} = {(0.9982).toFixed(4)} {toToken.symbol}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-dark-500">Price Impact</span>
              <span className={parseFloat(priceImpact) > 1 ? "text-amber-400" : "text-green-400"}>
                {priceImpact}%
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-dark-500">Network Fee</span>
              <span className="text-dark-300">{networkFee}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-dark-500">Min. Received</span>
              <span className="text-dark-300">
                {(parseFloat(estimatedOut) * (1 - effectiveSlippage / 100)).toFixed(6)} {toToken.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Slippage */}
        <div className="rounded-xl border border-arc-400/10 bg-dark-950/40 px-4 py-3">
          <button
            onClick={() => setShowSlippage(!showSlippage)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-dark-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M21 12h-1M4 12H3M12 21v-1M12 4V3" />
              </svg>
              <span className="font-mono text-xs text-dark-500 uppercase tracking-widest">Slippage Tolerance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-arc-400">{effectiveSlippage}%</span>
              <svg
                className={`w-3 h-3 text-dark-500 transition-transform ${showSlippage ? "rotate-180" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>
          {showSlippage && (
            <div className="mt-3 flex items-center gap-2">
              {SLIPPAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSlippage(opt.value); setCustomSlippage(""); }}
                  className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    !customSlippage && slippage === opt.value
                      ? "border-arc-400/60 bg-arc-400/15 text-arc-400"
                      : "border-arc-400/15 text-dark-400 hover:border-arc-400/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <input
                type="number"
                min="0.01"
                max="50"
                placeholder="Custom"
                value={customSlippage}
                onChange={(e) => setCustomSlippage(e.target.value)}
                className="flex-1 bg-dark-950/80 border border-arc-400/15 focus:border-arc-400/40 rounded-lg px-2.5 py-1.5 text-xs font-mono text-arc-50 placeholder-dark-600 focus:outline-none transition-all"
              />
              <span className="font-mono text-xs text-dark-500">%</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button onClick={openConnectModal} className="arc-button-primary w-full py-4 text-base flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                </svg>
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        ) : !isCorrectNetwork ? (
          <button
            onClick={handleSwitchNetwork}
            disabled={switching}
            className="arc-button-primary w-full py-4 text-base flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500"
          >
            {switching ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Switching…
              </>
            ) : "Switch to Arc Testnet"}
          </button>
        ) : (
          <button
            onClick={handleSwap}
            disabled={!canSwap}
            className="arc-button-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 014-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
            {!amount ? "Enter an Amount" : amountNum > parseFloat(balanceData?.formatted ?? "0") ? `Insufficient ${fromToken.symbol}` : `Swap ${fromToken.symbol} for ${toToken.symbol}`}
          </button>
        )}
      </div>

      <TokenSelectorModal
        open={fromSelectorOpen}
        onClose={() => setFromSelectorOpen(false)}
        onSelect={setFromToken}
        excluded={toToken.symbol}
        title="Select From Token"
      />
      <TokenSelectorModal
        open={toSelectorOpen}
        onClose={() => setToSelectorOpen(false)}
        onSelect={setToToken}
        excluded={fromToken.symbol}
        title="Select To Token"
      />
      <TxModal
        status={txStatus}
        txHash={txHash}
        onClose={() => { setTxStatus("idle"); setTxHash(undefined); }}
      />
    </>
  );
}
