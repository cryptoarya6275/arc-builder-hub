// src/components/swap/BridgePanel.tsx
// Real cross-chain USDC bridge via Circle CCTP V2 through Circle App Kit.
// https://docs.arc.io/app-kit/bridge

"use client";

import { useState, useCallback } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isArcTestnet, switchToArcTestnet } from "@/lib/arcNetwork";
import { useCircleKit, BRIDGE_CHAINS, type BridgeChain, type BridgeResult } from "@/lib/circleKit";

// ─── Chain Selector ───────────────────────────────────────────────────────────

function ChainIcon({ chain, size = 28 }: { chain: BridgeChain; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: chain.color + "33",
        border: `1px solid ${chain.color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ color: chain.color, fontSize: size * 0.38, fontWeight: 700, lineHeight: 1 }}>
        {chain.shortName[0]}
      </span>
    </div>
  );
}

function ChainSelector({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string;
  value: BridgeChain;
  onChange: (c: BridgeChain) => void;
  exclude?: string;
}) {
  const [open, setOpen] = useState(false);
  const options = BRIDGE_CHAINS.filter((c) => c.circleId !== exclude);

  return (
    <div className="relative">
      <span className="block font-mono text-xs text-dark-400 uppercase tracking-widest mb-2">{label}</span>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 bg-dark-950/60 border border-arc-400/15 hover:border-arc-400/35 rounded-xl px-4 py-3 transition-all group"
      >
        <ChainIcon chain={value} size={32} />
        <div className="flex-1 text-left">
          <div className="font-display text-sm text-arc-50 group-hover:text-arc-300 transition-colors">{value.name}</div>
        </div>
        <svg
          className={`w-4 h-4 text-dark-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-arc-400/20 bg-dark-900 shadow-2xl overflow-hidden">
          {options.map((chain) => (
            <button
              key={chain.circleId}
              onClick={() => { onChange(chain); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-arc-400/5 transition-all"
            >
              <ChainIcon chain={chain} size={28} />
              <div className="flex-1 text-left">
                <div className="font-display text-sm text-arc-50">{chain.name}</div>
              </div>
              {chain.circleId === value.circleId && (
                <svg className="w-4 h-4 text-arc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bridge Status Modal ──────────────────────────────────────────────────────

type BridgeStatus = "idle" | "awaiting-wallet" | "processing" | "success" | "failed";

function BridgeModal({
  status,
  result,
  error,
  amount,
  fromChain,
  toChain,
  onClose,
}: {
  status: BridgeStatus;
  result?: BridgeResult;
  error?: string;
  amount: string;
  fromChain: BridgeChain;
  toChain: BridgeChain;
  onClose: () => void;
}) {
  if (status === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={status === "success" || status === "failed" ? onClose : undefined}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-arc-400/20 bg-dark-900 p-7 shadow-2xl text-center animate-slide-up">

        {/* Awaiting wallet */}
        {status === "awaiting-wallet" && (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 rounded-full border-2 border-arc-400/20 border-t-arc-400 animate-spin" />
            </div>
            <h3 className="font-display text-lg text-arc-50 mb-2">Confirm in Wallet</h3>
            <p className="font-mono text-sm text-dark-400">
              Approve the USDC burn transaction on {fromChain.name}.
            </p>
          </>
        )}

        {/* Processing — CCTP attestation takes 5-20 min */}
        {status === "processing" && (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-arc-400/10 border-b-arc-400/50 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>
            </div>
            <h3 className="font-display text-lg text-arc-50 mb-2">Bridge In Progress</h3>
            <p className="font-mono text-sm text-dark-400 mb-3">
              Bridging {amount} USDC via Circle CCTP V2…
            </p>
            <div className="space-y-1.5 text-left rounded-lg border border-arc-400/10 bg-dark-950/40 px-3 py-2.5 mb-4">
              <BridgeStep label="Burn USDC on source" done={true} active={false} />
              <BridgeStep label="Circle attestation" done={false} active={true} />
              <BridgeStep label={`Mint USDC on ${toChain.name}`} done={false} active={false} />
            </div>
            <p className="font-mono text-xs text-dark-500">
              CCTP attestation typically takes 5–20 minutes. Do not close this window.
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
            <h3 className="font-display text-lg text-arc-50 mb-1">Bridge Complete</h3>
            <p className="font-mono text-sm text-dark-400 mb-3">
              {amount} USDC bridged from {fromChain.name} to {toChain.name}
            </p>

            {result.txHash && (
              <a
                href={result.explorerUrl || `https://testnet.arcscan.app/tx/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-arc-400 hover:text-arc-300 border border-arc-400/20 px-3 py-2 rounded-lg transition-colors mb-4 max-w-full overflow-hidden"
              >
                <span className="truncate">
                  Tx: {result.txHash.slice(0, 10)}…{result.txHash.slice(-8)}
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
            <h3 className="font-display text-lg text-arc-50 mb-2">Bridge Failed</h3>
            <p className="font-mono text-sm text-dark-400 mb-5 break-words">
              {error || "The bridge transaction failed or was rejected. No funds were moved."}
            </p>
            <button onClick={onClose} className="arc-button-secondary w-full text-sm py-2.5">Dismiss</button>
          </>
        )}
      </div>
    </div>
  );
}

function BridgeStep({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <svg className="w-3.5 h-3.5 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : active ? (
        <div className="w-3.5 h-3.5 rounded-full border border-blue-400/60 border-t-blue-400 animate-spin shrink-0" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border border-dark-600 shrink-0" />
      )}
      <span className={`font-mono text-xs ${done ? "text-green-400" : active ? "text-blue-300" : "text-dark-500"}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ARC_CHAIN   = BRIDGE_CHAINS[0]; // Arc Testnet
const SEPOLIA_CHAIN = BRIDGE_CHAINS[1]; // Ethereum Sepolia (default destination)

export default function BridgePanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = isArcTestnet(chainId);
  const { bridge } = useCircleKit();

  const [fromChain, setFromChain] = useState<BridgeChain>(ARC_CHAIN);
  const [toChain,   setToChain]   = useState<BridgeChain>(SEPOLIA_CHAIN);
  const [amount,    setAmount]    = useState("");
  const [status,    setStatus]    = useState<BridgeStatus>("idle");
  const [result,    setResult]    = useState<BridgeResult | undefined>();
  const [error,     setError]     = useState<string | undefined>();
  const [switching, setSwitching] = useState(false);

  // USDC balance on Arc Testnet (native)
  const { data: nativeBalance, refetch: refetchBalance } = useBalance({
    address,
    query: { enabled: !!address && isCorrectNetwork },
  });

  const balanceFormatted = nativeBalance ? parseFloat(nativeBalance.formatted).toFixed(4) : "0.0000";
  const balanceRaw       = nativeBalance ? parseFloat(nativeBalance.formatted) : 0;
  const amountNum        = parseFloat(amount) || 0;

  const handleSwapChains = () => {
    const tmp = fromChain;
    setFromChain(toChain);
    setToChain(tmp);
    setAmount("");
  };

  const handleMax = () => {
    if (balanceRaw > 0.001) setAmount((balanceRaw - 0.001).toFixed(6));
  };

  const handleSwitchNetwork = async () => {
    setSwitching(true);
    await switchToArcTestnet();
    setSwitching(false);
  };

  /** Execute a real cross-chain USDC bridge via Circle CCTP V2. */
  const handleBridge = useCallback(async () => {
    if (!isConnected || !isCorrectNetwork || !address || amountNum <= 0) return;

    setResult(undefined);
    setError(undefined);
    setStatus("awaiting-wallet");

    try {
      // Phase 1 — wallet signs the burn tx (triggers MetaMask popup)
      // Phase 2 — Circle attestation (SDK polls internally, updates status to processing)
      // We transition to "processing" right after the call starts
      // (the SDK blocks until full completion)

      const bridgePromise = bridge({
        fromChain:        fromChain.circleId,
        toChain:          toChain.circleId,
        amount,
        recipientAddress: address,
      });

      // Give the user a moment to see "awaiting-wallet", then switch to "processing"
      // once they've signed (we can't know exactly when the popup closes, so we use
      // a short delay as a reasonable UX heuristic).
      const processingTimer = setTimeout(() => setStatus("processing"), 3000);

      const bridgeResult = await bridgePromise;
      clearTimeout(processingTimer);

      setResult(bridgeResult);
      setStatus("success");
      setAmount("");
      refetchBalance();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("denied")) {
        setError("You rejected the transaction in your wallet.");
      } else {
        setError(msg);
      }
      setStatus("failed");
    }
  }, [isConnected, isCorrectNetwork, address, amountNum, amount, bridge, fromChain, toChain, refetchBalance]);

  const canBridge =
    isConnected &&
    isCorrectNetwork &&
    amountNum > 0 &&
    amountNum <= balanceRaw &&
    fromChain.circleId !== toChain.circleId;

  return (
    <>
      <div className="space-y-4">
        {/* From chain */}
        <ChainSelector
          label="From"
          value={fromChain}
          onChange={(c) => { setFromChain(c); if (c.circleId === toChain.circleId) setToChain(ARC_CHAIN); }}
          exclude={toChain.circleId}
        />

        {/* Swap direction */}
        <div className="flex items-center justify-center relative">
          <div className="absolute inset-x-0 h-px bg-arc-400/10" />
          <button
            onClick={handleSwapChains}
            className="relative w-9 h-9 rounded-xl bg-dark-900 border border-arc-400/20 hover:border-arc-400/50 flex items-center justify-center text-dark-400 hover:text-arc-400 hover:bg-arc-400/5 transition-all hover:rotate-180 duration-300"
            title="Swap direction"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </button>
        </div>

        {/* To chain */}
        <ChainSelector
          label="To"
          value={toChain}
          onChange={(c) => { setToChain(c); if (c.circleId === fromChain.circleId) setFromChain(ARC_CHAIN); }}
          exclude={fromChain.circleId}
        />

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-dark-400 uppercase tracking-widest">Amount (USDC)</span>
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
          <div className="rounded-xl border border-arc-400/15 bg-dark-950/60 p-4 flex items-center gap-3">
            {/* USDC icon */}
            <div className="shrink-0">
              <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#2775CA" />
                <path d="M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.232-2.196-.696-2.196-1.504s.6-1.312 1.8-1.312c1.08 0 1.68.36 1.972 1.248a.38.38 0 00.368.252h.844a.36.36 0 00.36-.372c-.228-1.536-1.24-2.412-2.748-2.604V9.5a.37.37 0 00-.372-.372h-.8a.37.37 0 00-.372.372v1.12c-1.756.228-2.88 1.368-2.88 2.796 0 2.028 1.228 2.808 3.788 3.112 1.704.228 2.248.624 2.248 1.556 0 .932-.812 1.572-1.92 1.572-1.508 0-2.004-.64-2.164-1.54a.378.378 0 00-.372-.3h-.888a.36.36 0 00-.36.372c.196 1.688 1.356 2.7 3.024 2.9v1.14a.37.37 0 00.372.372h.8a.37.37 0 00.372-.372v-1.132c1.764-.252 2.916-1.436 2.916-2.972z" fill="white" />
              </svg>
            </div>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-right text-2xl font-mono text-arc-50 placeholder-dark-700 focus:outline-none"
            />
          </div>
          {amountNum > balanceRaw && balanceRaw > 0 && (
            <p className="mt-1.5 font-mono text-xs text-red-400">Insufficient USDC balance</p>
          )}
        </div>

        {/* Bridge info */}
        <div className="rounded-xl border border-arc-400/10 bg-dark-950/40 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Protocol</span>
            <span className="text-dark-300">Circle CCTP V2</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Asset</span>
            <span className="text-dark-300">USDC (native on Arc)</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Est. time</span>
            <span className="text-amber-400/80">5–20 minutes (CCTP attestation)</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Recipient</span>
            <span className="text-dark-300 truncate ml-2">
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—"}
            </span>
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
            {switching ? "Switching…" : "Switch to Arc Testnet"}
          </button>
        ) : (
          <button
            onClick={handleBridge}
            disabled={!canBridge}
            className="arc-button-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8h1a4 4 0 010 8h-1" />
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            {!amount
              ? "Enter an Amount"
              : amountNum > balanceRaw
              ? "Insufficient USDC"
              : fromChain.circleId === toChain.circleId
              ? "Select different chains"
              : `Bridge ${amount} USDC → ${toChain.shortName}`}
          </button>
        )}
      </div>

      <BridgeModal
        status={status}
        result={result}
        error={error}
        amount={amount}
        fromChain={fromChain}
        toChain={toChain}
        onClose={() => { setStatus("idle"); setResult(undefined); setError(undefined); }}
      />
    </>
  );
}
