// src/components/swap/SwapPanel.tsx
// Real on-chain swap via Circle App Kit SDK + viem browser-wallet adapter.
// https://docs.arc.io/app-kit/swap

"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useBalance, useChainId, useReadContract, useBlockNumber } from "wagmi";
import { formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isArcTestnet, switchToArcTestnet } from "@/lib/arcNetwork";
import { useCircleKit, type SwapResult } from "@/lib/circleKit";
import TokenSelectorModal, { Token, ARC_TOKENS, TokenLogo } from "./TokenSelectorModal";

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

type TxStatus = "idle" | "awaiting-wallet" | "pending" | "success" | "failed";

// ─── Transaction Modal ────────────────────────────────────────────────────────

function TxModal({
  status,
  result,
  error,
  onClose,
}: {
  status: TxStatus;
  result?: SwapResult;
  error?: string;
  onClose: () => void;
}) {
  if (status === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={status !== "awaiting-wallet" && status !== "pending" ? onClose : undefined}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-arc-400/20 bg-dark-900 p-7 shadow-2xl text-center animate-slide-up">

        {/* Awaiting wallet signature */}
        {status === "awaiting-wallet" && (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 rounded-full border-2 border-arc-400/20 border-t-arc-400 animate-spin" />
            </div>
            <h3 className="font-display text-lg text-arc-50 mb-2">Confirm in Wallet</h3>
            <p className="font-mono text-sm text-dark-400">
              Check your wallet and approve the swap transaction.
            </p>
          </>
        )}

        {/* Processing on-chain */}
        {status === "pending" && (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin" />
            </div>
            <h3 className="font-display text-lg text-arc-50 mb-2">Swap Processing</h3>
            <p className="font-mono text-sm text-dark-400">
              Transaction submitted. Waiting for on-chain confirmation…
            </p>
          </>
        )}

        {/* Success */}
        {status === "success" && result && (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h3 className="font-display text-lg text-arc-50 mb-1">Swap Successful</h3>
            <p className="font-mono text-sm text-dark-400 mb-3">
              Swapped {result.amountIn} {result.tokenIn} → {result.amountOut} {result.tokenOut}
            </p>

            {/* Fees */}
            {result.fees.length > 0 && (
              <div className="mb-4 rounded-lg border border-arc-400/10 bg-dark-950/60 px-3 py-2 text-left space-y-1">
                {result.fees.map((fee, i) => (
                  <div key={i} className="flex justify-between font-mono text-xs">
                    <span className="text-dark-500 capitalize">{fee.type} fee</span>
                    <span className="text-dark-300">{fee.amount} {fee.token}</span>
                  </div>
                ))}
              </div>
            )}

            {result.txHash && (
              <a
                href={result.explorerUrl || `https://testnet.arcscan.app/tx/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-arc-400 hover:text-arc-300 border border-arc-400/20 px-3 py-2 rounded-lg transition-colors mb-4 max-w-full overflow-hidden"
              >
                <span className="truncate">
                  {result.txHash.slice(0, 10)}…{result.txHash.slice(-8)}
                </span>
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            )}
            <button onClick={onClose} className="arc-button-primary w-full text-sm py-2.5">Done</button>
          </>
        )}

        {/* Failed */}
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
            <h3 className="font-display text-lg text-arc-50 mb-2">Swap Failed</h3>
            <p className="font-mono text-sm text-dark-400 mb-5 break-words">
              {error || "The swap was rejected or failed. No funds were moved."}
            </p>
            <button onClick={onClose} className="arc-button-secondary w-full text-sm py-2.5">Dismiss</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SwapPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = isArcTestnet(chainId);
  const { swap } = useCircleKit();

  const [fromToken, setFromToken] = useState<Token>(ARC_TOKENS[0]); // USDC
  const [toToken, setToToken]     = useState<Token>(ARC_TOKENS[1]); // EURC
  const [amount, setAmount]       = useState("");
  const [fromSelectorOpen, setFromSelectorOpen] = useState(false);
  const [toSelectorOpen,   setToSelectorOpen]   = useState(false);
  const [txStatus, setTxStatus]   = useState<TxStatus>("idle");
  const [txResult, setTxResult]   = useState<SwapResult | undefined>();
  const [txError,  setTxError]    = useState<string | undefined>();
  const [switching, setSwitching] = useState(false);

  const isNative = fromToken.address === null;

  // Native balance (USDC = native on Arc Testnet)
  const { data: nativeBalance, refetch: refetchNative } = useBalance({
    address,
    query: { enabled: !!address && isCorrectNetwork && isNative },
  });

  // ERC20 balance
  const { data: erc20BalanceRaw, refetch: refetchErc20 } = useReadContract({
    address: fromToken.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address && isCorrectNetwork && !isNative },
  });

  const { data: erc20Decimals } = useReadContract({
    address: fromToken.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled: !!address && isCorrectNetwork && !isNative },
  });

  // Auto-refresh on new block
  const { data: blockNumber } = useBlockNumber({ watch: isConnected && isCorrectNetwork });
  useEffect(() => {
    if (!blockNumber) return;
    if (isNative) refetchNative();
    else refetchErc20();
  }, [blockNumber, isNative, refetchNative, refetchErc20]);

  const balanceFormatted = (() => {
    if (!isConnected || !isCorrectNetwork) return "0.0000";
    if (isNative) return nativeBalance ? parseFloat(nativeBalance.formatted).toFixed(4) : "0.0000";
    if (erc20BalanceRaw !== undefined && erc20Decimals !== undefined)
      return parseFloat(formatUnits(erc20BalanceRaw as bigint, erc20Decimals as number)).toFixed(4);
    return "0.0000";
  })();

  const balanceRaw = (() => {
    if (isNative) return nativeBalance ? parseFloat(nativeBalance.formatted) : 0;
    if (erc20BalanceRaw !== undefined && erc20Decimals !== undefined)
      return parseFloat(formatUnits(erc20BalanceRaw as bigint, erc20Decimals as number));
    return 0;
  })();

  const amountNum = parseFloat(amount) || 0;

  const handleSwapTokens = () => {
    const tmp = fromToken;
    setFromToken(toToken);
    setToToken(tmp);
    setAmount("");
  };

  const handleMax = () => {
    if (balanceRaw > 0) {
      setAmount(balanceRaw > 0.001 ? (balanceRaw - 0.001).toFixed(6) : "0");
    }
  };

  const handleSwitchNetwork = async () => {
    setSwitching(true);
    await switchToArcTestnet();
    setSwitching(false);
  };

  /** Execute a real on-chain swap via Circle App Kit. */
  const handleSwap = useCallback(async () => {
    if (!isConnected || !isCorrectNetwork || !amount || amountNum <= 0) return;

    setTxResult(undefined);
    setTxError(undefined);
    setTxStatus("awaiting-wallet");

    try {
      const result = await swap({
        tokenIn:  fromToken.symbol,
        tokenOut: toToken.symbol,
        amountIn: amount,
      });

      setTxResult(result);
      setTxStatus("success");
      setAmount("");

      // Refresh balance after successful swap
      if (isNative) refetchNative();
      else refetchErc20();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // User rejected in wallet → show friendly message
      if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("denied")) {
        setTxError("You rejected the transaction in your wallet.");
      } else {
        setTxError(msg);
      }
      setTxStatus("failed");
    }
  }, [isConnected, isCorrectNetwork, amount, amountNum, swap, fromToken, toToken, isNative, refetchNative, refetchErc20]);

  const canSwap = isConnected && isCorrectNetwork && amountNum > 0 && amountNum <= balanceRaw;

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
            <div className="flex-1 text-right text-2xl font-mono text-dark-500">
              {/* Quote shown after execution only — Circle App Kit returns amountOut with the result */}
              {txResult && txResult.tokenOut === toToken.symbol && txResult.tokenIn === fromToken.symbol
                ? txResult.amountOut
                : "—"}
            </div>
          </div>
        </div>

        {/* Info row */}
        <div className="rounded-xl border border-arc-400/10 bg-dark-950/40 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Protocol</span>
            <span className="text-dark-300">Circle App Kit · Arc Testnet</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Pair</span>
            <span className="text-dark-300">{fromToken.symbol} → {toToken.symbol}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Quote</span>
            <span className="text-dark-400 italic">Fetched at execution time</span>
          </div>
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
            {!amount
              ? "Enter an Amount"
              : amountNum > balanceRaw
              ? `Insufficient ${fromToken.symbol}`
              : `Swap ${fromToken.symbol} → ${toToken.symbol}`}
          </button>
        )}
      </div>

      {/* Token Selectors */}
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

      {/* Transaction Status Modal */}
      <TxModal
        status={txStatus}
        result={txResult}
        error={txError}
        onClose={() => { setTxStatus("idle"); setTxResult(undefined); setTxError(undefined); }}
      />
    </>
  );
}
