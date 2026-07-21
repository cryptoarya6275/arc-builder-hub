// src/components/swap/BridgePanel.tsx
"use client";

import { useState, useCallback } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isArcTestnet, switchToArcTestnet } from "@/lib/arcNetwork";

interface ChainOption {
  id: number;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  cctpDomain: number;
  color: string;
}

const CHAIN_ICON_BASE = "w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold";

function makeChainIcon(label: string, bg: string) {
  return <div className={`${CHAIN_ICON_BASE}`} style={{ background: bg, width: 20, height: 20, fontSize: 9 }}>{label}</div>;
}

const SUPPORTED_CHAINS: ChainOption[] = [
  {
    id: 5042002,
    name: "Arc Testnet",
    shortName: "Arc",
    icon: makeChainIcon("A", "#7c3aed"),
    cctpDomain: 9,
    color: "#7c3aed",
  },
  {
    id: 11155111,
    name: "Ethereum Sepolia",
    shortName: "Sepolia",
    icon: makeChainIcon("E", "#627EEA"),
    cctpDomain: 0,
    color: "#627EEA",
  },
  {
    id: 43113,
    name: "Avalanche Fuji",
    shortName: "Fuji",
    icon: makeChainIcon("Av", "#E84142"),
    cctpDomain: 1,
    color: "#E84142",
  },
  {
    id: 11155420,
    name: "OP Sepolia",
    shortName: "OP",
    icon: makeChainIcon("O", "#FF0420"),
    cctpDomain: 2,
    color: "#FF0420",
  },
  {
    id: 421614,
    name: "Arbitrum Sepolia",
    shortName: "Arb",
    icon: makeChainIcon("Ar", "#28A0F0"),
    cctpDomain: 3,
    color: "#28A0F0",
  },
  {
    id: 84532,
    name: "Base Sepolia",
    shortName: "Base",
    icon: makeChainIcon("B", "#0052FF"),
    cctpDomain: 6,
    color: "#0052FF",
  },
  {
    id: 80002,
    name: "Polygon Amoy",
    shortName: "Polygon",
    icon: makeChainIcon("P", "#7B3FE4"),
    cctpDomain: 7,
    color: "#7B3FE4",
  },
];

interface BridgeAsset {
  symbol: string;
  name: string;
  address: string;
  color: string;
}

const BRIDGE_ASSETS: BridgeAsset[] = [
  { symbol: "USDC", name: "USD Coin", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", color: "#2775CA" },
  { symbol: "EURC", name: "Euro Coin", address: "0x08210F9170F89Ab7658F0B5E3fF39b0E03C2Bef9", color: "#2B92D3" },
];

interface TxHistory {
  id: string;
  fromChain: string;
  toChain: string;
  asset: string;
  amount: string;
  status: "pending" | "attesting" | "minting" | "complete" | "failed";
  txHash: string;
  timestamp: number;
}

type BridgePhase = "idle" | "confirming" | "attesting" | "minting" | "complete" | "failed";

function ChainSelector({
  value,
  onChange,
  exclude,
  label,
}: {
  value: ChainOption;
  onChange: (c: ChainOption) => void;
  exclude?: number;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const options = SUPPORTED_CHAINS.filter((c) => c.id !== exclude);

  return (
    <div className="relative">
      <span className="block font-mono text-xs text-dark-400 uppercase tracking-widest mb-2">{label}</span>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 bg-dark-950/60 border border-arc-400/15 hover:border-arc-400/35 rounded-xl px-4 py-3 transition-all group"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: value.color + "22" }}>
          {value.icon}
        </div>
        <div className="flex-1 text-left">
          <div className="font-display text-sm text-arc-50 group-hover:text-arc-300 transition-colors">{value.name}</div>
          <div className="font-mono text-xs text-dark-500">CCTP Domain {value.cctpDomain}</div>
        </div>
        <svg className={`w-4 h-4 text-dark-500 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-arc-400/20 bg-dark-900 shadow-2xl overflow-hidden">
          {options.map((chain) => (
            <button
              key={chain.id}
              onClick={() => { onChange(chain); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-arc-400/5 transition-all"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: chain.color + "22" }}>
                {chain.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-display text-sm text-arc-50">{chain.name}</div>
                <div className="font-mono text-xs text-dark-500">Domain {chain.cctpDomain}</div>
              </div>
              {chain.id === value.id && (
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

function ProgressStep({
  step,
  label,
  sublabel,
  current,
  done,
}: {
  step: number;
  label: string;
  sublabel: string;
  current: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${
        done
          ? "bg-green-500/20 border-green-500/40 text-green-400"
          : current
          ? "bg-arc-400/20 border-arc-400/50 text-arc-400"
          : "bg-dark-900 border-arc-400/15 text-dark-600"
      }`}>
        {done ? (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : current ? (
          <div className="w-2.5 h-2.5 rounded-full bg-arc-400 animate-pulse" />
        ) : (
          step
        )}
      </div>
      <div>
        <div className={`font-display text-sm ${done ? "text-green-400" : current ? "text-arc-50" : "text-dark-600"}`}>{label}</div>
        <div className="font-mono text-xs text-dark-500">{sublabel}</div>
      </div>
    </div>
  );
}

export default function BridgePanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = isArcTestnet(chainId);

  const [sourceChain, setSourceChain] = useState<ChainOption>(SUPPORTED_CHAINS[0]); // Arc
  const [destChain, setDestChain] = useState<ChainOption>(SUPPORTED_CHAINS[1]);     // Sepolia
  const [selectedAsset, setSelectedAsset] = useState<BridgeAsset>(BRIDGE_ASSETS[0]);
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState<BridgePhase>("idle");
  const [history, setHistory] = useState<TxHistory[]>([]);
  const [switching, setSwitching] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);

  const { data: balanceData } = useBalance({
    address,
    token: selectedAsset.address as `0x${string}`,
    query: { enabled: !!address && isConnected },
  });

  const balanceFormatted = balanceData ? parseFloat(balanceData.formatted).toFixed(4) : "0.0000";
  const amountNum = parseFloat(amount) || 0;

  const estimatedTime = sourceChain.id === 5042002 || destChain.id === 5042002
    ? "~2 min"
    : "~1 min";

  const networkFee = "~0.002 USDC";

  const handleSwapChains = () => {
    const tmp = sourceChain;
    setSourceChain(destChain);
    setDestChain(tmp);
  };

  const handleSwitchNetwork = async () => {
    setSwitching(true);
    await switchToArcTestnet();
    setSwitching(false);
  };

  const handleBridge = useCallback(async () => {
    if (!isConnected || !amount) return;
    const mockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const entry: TxHistory = {
      id: Math.random().toString(36).slice(2),
      fromChain: sourceChain.shortName,
      toChain: destChain.shortName,
      asset: selectedAsset.symbol,
      amount,
      status: "pending",
      txHash: mockHash,
      timestamp: Date.now(),
    };

    setPhase("confirming");
    await new Promise((r) => setTimeout(r, 1800));
    setPhase("attesting");
    setHistory((h) => [{ ...entry, status: "attesting" }, ...h]);
    await new Promise((r) => setTimeout(r, 2400));
    setPhase("minting");
    setHistory((h) => h.map((x) => x.id === entry.id ? { ...x, status: "minting" } : x));
    await new Promise((r) => setTimeout(r, 1600));
    setPhase("complete");
    setHistory((h) => h.map((x) => x.id === entry.id ? { ...x, status: "complete" } : x));
    setAmount("");
  }, [isConnected, amount, sourceChain, destChain, selectedAsset]);

  const canBridge = isConnected && amountNum > 0 && amountNum <= parseFloat(balanceData?.formatted ?? "0");

  return (
    <>
      <div className="space-y-3">
        {/* Chain selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ChainSelector value={sourceChain} onChange={setSourceChain} exclude={destChain.id} label="Source Chain" />

          {/* Swap button */}
          <div className="hidden sm:flex items-end justify-center pb-3">
            <button
              onClick={handleSwapChains}
              className="w-8 h-8 rounded-lg bg-dark-900 border border-arc-400/20 hover:border-arc-400/50 flex items-center justify-center text-dark-400 hover:text-arc-400 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 014-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
            </button>
          </div>

          <ChainSelector value={destChain} onChange={setDestChain} exclude={sourceChain.id} label="Destination Chain" />
        </div>

        {/* Mobile swap chains */}
        <div className="flex sm:hidden items-center justify-center">
          <button onClick={handleSwapChains} className="arc-button-secondary text-xs px-4 py-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 014-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
            Swap Direction
          </button>
        </div>

        {/* Asset + Amount */}
        <div className="rounded-xl border border-arc-400/15 bg-dark-950/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-dark-400 uppercase tracking-widest">Asset & Amount</span>
            {isConnected && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-dark-500">Balance: {balanceFormatted}</span>
                <button
                  onClick={() => balanceData && setAmount((parseFloat(balanceData.formatted) * 0.999).toFixed(6))}
                  className="font-mono text-xs text-arc-400 hover:text-arc-300 bg-arc-400/10 hover:bg-arc-400/20 px-2 py-0.5 rounded transition-all"
                >
                  MAX
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Asset selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => setAssetOpen(!assetOpen)}
                className="flex items-center gap-2 bg-dark-900/80 border border-arc-400/15 hover:border-arc-400/35 rounded-xl px-3 py-2.5 transition-all group"
              >
                <div className="w-5 h-5 rounded-full" style={{ background: selectedAsset.color }} />
                <span className="font-display text-sm text-arc-50 group-hover:text-arc-300 transition-colors">{selectedAsset.symbol}</span>
                <svg className={`w-3.5 h-3.5 text-dark-500 transition-transform ${assetOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {assetOpen && (
                <div className="absolute z-30 mt-1 left-0 w-44 rounded-xl border border-arc-400/20 bg-dark-900 shadow-2xl overflow-hidden">
                  {BRIDGE_ASSETS.map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => { setSelectedAsset(asset); setAssetOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-arc-400/5 transition-all"
                    >
                      <div className="w-5 h-5 rounded-full shrink-0" style={{ background: asset.color }} />
                      <div className="text-left">
                        <div className="font-display text-sm text-arc-50">{asset.symbol}</div>
                        <div className="font-mono text-xs text-dark-500">{asset.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
        </div>

        {/* Bridge details */}
        <div className="rounded-xl border border-arc-400/10 bg-dark-950/40 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Route</span>
            <span className="text-dark-300">{sourceChain.shortName} → {destChain.shortName}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Protocol</span>
            <span className="text-arc-400">Circle CCTP V2</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Estimated Time</span>
            <span className="text-dark-300">{estimatedTime}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">Network Fee</span>
            <span className="text-dark-300">{networkFee}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-dark-500">You Receive</span>
            <span className="text-green-400 font-medium">{amountNum > 0 ? amountNum.toFixed(6) : "—"} {selectedAsset.symbol}</span>
          </div>
        </div>

        {/* Transaction Progress Modal */}
        {phase !== "idle" && (
          <div className="rounded-xl border border-arc-400/20 bg-dark-950/80 px-5 py-5 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-display text-sm text-arc-400/80 uppercase tracking-widest">Bridge Progress</h4>
              {phase === "complete" && (
                <button
                  onClick={() => setPhase("idle")}
                  className="font-mono text-xs text-dark-500 hover:text-arc-400 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
            <ProgressStep
              step={1}
              label="Transaction Submitted"
              sublabel={`Sent on ${sourceChain.name}`}
              current={phase === "confirming"}
              done={["attesting", "minting", "complete"].includes(phase)}
            />
            <ProgressStep
              step={2}
              label="Attestation"
              sublabel="Circle validators confirming burn"
              current={phase === "attesting"}
              done={["minting", "complete"].includes(phase)}
            />
            <ProgressStep
              step={3}
              label="Minting"
              sublabel={`Receiving on ${destChain.name}`}
              current={phase === "minting"}
              done={phase === "complete"}
            />
            {phase === "complete" && (
              <div className="pt-2 border-t border-arc-400/10">
                <div className="flex items-center gap-2 text-green-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="font-display text-sm">Bridge complete — {amount} {selectedAsset.symbol} received on {destChain.name}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bridge Button */}
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
        ) : !isCorrectNetwork && sourceChain.id === 5042002 ? (
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
            disabled={!canBridge || (phase !== "idle" && phase !== "complete")}
            className="arc-button-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            {phase === "confirming" || phase === "attesting" || phase === "minting" ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Bridging…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8h1a4 4 0 010 8h-1" />
                  <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
                {!amount ? "Enter an Amount" : amountNum > parseFloat(balanceData?.formatted ?? "0") ? `Insufficient ${selectedAsset.symbol}` : `Bridge ${selectedAsset.symbol} to ${destChain.shortName}`}
              </>
            )}
          </button>
        )}

        {/* CCTP Badge */}
        <div className="flex items-center justify-center pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-arc-400/10 bg-dark-950/50">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-arc-500" />
            <span className="font-mono text-xs text-dark-500">Powered by Circle CCTP V2</span>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-dark-500 uppercase tracking-widest">Recent Transactions</span>
              <button onClick={() => setHistory([])} className="font-mono text-xs text-dark-600 hover:text-dark-400 transition-colors">Clear</button>
            </div>
            {history.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-lg border border-arc-400/10 bg-dark-950/40 px-4 py-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  tx.status === "complete" ? "bg-green-400" :
                  tx.status === "failed" ? "bg-red-400" : "bg-arc-400 animate-pulse"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-arc-50">{tx.amount} {tx.asset}</div>
                  <div className="font-mono text-xs text-dark-500">{tx.fromChain} → {tx.toChain}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`font-mono text-xs ${
                    tx.status === "complete" ? "text-green-400" :
                    tx.status === "failed" ? "text-red-400" : "text-arc-400"
                  }`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </div>
                  <div className="font-mono text-xs text-dark-600">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
