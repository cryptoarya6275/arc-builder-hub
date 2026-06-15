"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isArcTestnet, switchToArcTestnet, ARC_TESTNET } from "@/lib/arcNetwork";
import { arcTestnetChain } from "@/lib/wagmiConfig";
import { useSwitchChain } from "wagmi";

const FAUCET_WEB_URL = "https://faucet.arc.network";
const FAUCET_API_URL = "https://faucet.testnet.arc.network/api/v1/request";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "arc_faucet_claims";
const DRIP_AMOUNT = "100 USDC";
const LOW_BALANCE_THRESHOLD = 1n * 10n ** 18n;

interface ClaimRecord {
  address: string;
  timestamp: number;
  txHash?: string;
}

function loadClaims(): ClaimRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveClaim(record: ClaimRecord) {
  const existing = loadClaims().filter((c) => c.address !== record.address);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing].slice(0, 20)));
}

function getLastClaim(address: string): ClaimRecord | null {
  return loadClaims().find((c) => c.address.toLowerCase() === address.toLowerCase()) ?? null;
}

function msToHMS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

type ClaimStatus = "idle" | "claiming" | "success" | "error" | "cooldown";

export default function FaucetChecker() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = isArcTestnet(chainId);
  const { switchChain } = useSwitchChain();

  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    query: { enabled: !!address && isCorrectNetwork },
  });

  const [status, setStatus] = useState<ClaimStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [lastClaim, setLastClaim] = useState<ClaimRecord | null>(null);
  const [switching, setSwitching] = useState(false);

  const balanceVal = balanceData?.value ?? 0n;
  const isLowBalance = balanceVal < LOW_BALANCE_THRESHOLD;
  const isEmpty = balanceVal === 0n;

  const refreshClaimState = useCallback(() => {
    if (!address) return;
    const record = getLastClaim(address);
    setLastClaim(record);
    if (record) {
      const elapsed = Date.now() - record.timestamp;
      if (elapsed < COOLDOWN_MS) {
        setStatus("cooldown");
        setCooldownRemaining(COOLDOWN_MS - elapsed);
      } else {
        setStatus("idle");
        setCooldownRemaining(0);
      }
    } else {
      setStatus("idle");
    }
  }, [address]);

  useEffect(() => {
    refreshClaimState();
  }, [refreshClaimState]);

  useEffect(() => {
    if (status !== "cooldown") return;
    const interval = setInterval(() => {
      if (!address) return;
      const record = getLastClaim(address);
      if (!record) return;
      const remaining = COOLDOWN_MS - (Date.now() - record.timestamp);
      if (remaining <= 0) {
        setStatus("idle");
        setCooldownRemaining(0);
        clearInterval(interval);
      } else {
        setCooldownRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status, address]);

  const handleClaim = async () => {
    if (!address) return;
    setStatus("claiming");
    setErrorMsg(null);
    setTxHash(null);

    try {
      const res = await fetch(FAUCET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chainId: ARC_TESTNET.chainIdDecimal }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg: string = (body as { message?: string; error?: string }).message
          ?? (body as { message?: string; error?: string }).error
          ?? `Faucet returned ${res.status}`;
        throw new Error(msg);
      }

      const body = await res.json().catch(() => ({}));
      const hash: string | undefined = (body as { txHash?: string; hash?: string }).txHash
        ?? (body as { txHash?: string; hash?: string }).hash;

      const record: ClaimRecord = { address, timestamp: Date.now(), txHash: hash };
      saveClaim(record);
      setLastClaim(record);
      setTxHash(hash ?? null);
      setStatus("success");
      setCooldownRemaining(COOLDOWN_MS);
      setTimeout(() => refetchBalance(), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Claim failed";
      setErrorMsg(message);
      setStatus("error");
    }
  };

  const handleSwitchNetwork = async () => {
    setSwitching(true);
    await switchToArcTestnet().catch(() => {
      switchChain({ chainId: arcTestnetChain.id });
    });
    setSwitching(false);
  };

  const balanceFormatted = balanceData
    ? parseFloat(balanceData.formatted).toFixed(4)
    : null;

  const balanceStatus = !balanceData
    ? "unknown"
    : isEmpty
    ? "empty"
    : isLowBalance
    ? "low"
    : "funded";

  const statusColor = {
    unknown: "text-dark-500",
    empty: "text-red-400",
    low: "text-amber-400",
    funded: "text-green-400",
  }[balanceStatus];

  const statusLabel = {
    unknown: "—",
    empty: "Empty — needs funds",
    low: "Low balance",
    funded: "Funded",
  }[balanceStatus];

  return (
    <section id="faucet" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-px h-8 bg-arc-400/40" />
            <span className="font-display text-xs text-arc-400/70 uppercase tracking-widest">
              01b / Faucet
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-arc-50">
            Faucet Checker
          </h2>
          <p className="text-dark-400 mt-2">
            Check your testnet balance and claim free USDC to build on Arc.
          </p>
        </div>

        {!isConnected ? (
          <div className="arc-card p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-arc-400/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-arc-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-arc-100 mb-2">Connect Your Wallet</h3>
            <p className="text-dark-400 text-sm mb-6">Connect to check your balance and request testnet USDC.</p>
            <ConnectButton />
          </div>
        ) : !isCorrectNetwork ? (
          <div className="arc-card p-8 text-center border-amber-500/20 bg-amber-500/5">
            <p className="text-amber-400 font-display font-bold mb-4">Switch to Arc Testnet</p>
            <button
              onClick={handleSwitchNetwork}
              disabled={switching}
              className="arc-button-primary py-3 px-8"
            >
              {switching ? "Switching…" : "Switch Network"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: claim panel */}
            <div className="lg:col-span-3 arc-card p-6 gradient-border space-y-6">
              {/* Balance row */}
              <div className="flex items-center justify-between pb-5 border-b border-dark-800">
                <div>
                  <span className="arc-label">Arc Testnet Balance</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-display text-3xl font-bold text-arc-50 glow-text">
                      {balanceFormatted ?? "—"}
                    </span>
                    <span className="text-arc-400 font-mono text-sm">
                      {balanceData?.symbol ?? "USDC"}
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 arc-badge border ${
                  balanceStatus === "funded"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : balanceStatus === "low"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : balanceStatus === "empty"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-dark-800 border-dark-700 text-dark-500"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    balanceStatus === "funded" ? "bg-green-400 animate-pulse"
                    : balanceStatus === "low" ? "bg-amber-400 animate-pulse"
                    : balanceStatus === "empty" ? "bg-red-400"
                    : "bg-dark-600"
                  }`} />
                  <span className={statusColor}>{statusLabel}</span>
                </div>
              </div>

              {/* Claim area */}
              {status === "success" ? (
                <div className="space-y-3 animate-slide-up">
                  <div className="flex items-center gap-2 text-green-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="font-display font-bold">USDC Claimed!</span>
                  </div>
                  <p className="text-sm text-dark-400">
                    {DRIP_AMOUNT} will arrive in your wallet within a few seconds.
                  </p>
                  {txHash && (
                    <a
                      href={`${ARC_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-arc-400 hover:text-arc-300 break-all"
                    >
                      {txHash} ↗
                    </a>
                  )}
                  <div className="pt-2 text-xs font-mono text-dark-600">
                    Cooldown: {msToHMS(cooldownRemaining)} remaining
                  </div>
                </div>
              ) : status === "cooldown" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-arc-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="font-display font-bold">Cooldown Active</span>
                  </div>
                  <p className="text-sm text-dark-400">
                    You already claimed recently. Come back in{" "}
                    <span className="text-arc-400 font-mono">{msToHMS(cooldownRemaining)}</span>.
                  </p>
                  {lastClaim?.txHash && (
                    <div>
                      <span className="text-xs font-mono text-dark-600">Last claim tx: </span>
                      <a
                        href={`${ARC_TESTNET.blockExplorerUrls[0]}/tx/${lastClaim.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-arc-400 hover:text-arc-300 break-all"
                      >
                        {lastClaim.txHash.slice(0, 20)}…↗
                      </a>
                    </div>
                  )}
                  {/* Progress bar */}
                  <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-arc-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(0, 100 - (cooldownRemaining / COOLDOWN_MS) * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              ) : status === "claiming" ? (
                <div className="flex items-center gap-3 text-arc-400">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="font-display">Requesting USDC from faucet…</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {status === "error" && errorMsg && (
                    <div className="arc-card p-4 border-red-500/20 bg-red-500/5">
                      <p className="text-xs font-mono text-red-400/80 mb-3">{errorMsg}</p>
                      <a
                        href={FAUCET_WEB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="arc-button-secondary text-sm py-2 px-5 inline-flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
                        Open Faucet Website ↗
                      </a>
                    </div>
                  )}

                  <button
                    onClick={handleClaim}
                    disabled={balanceStatus === "funded"}
                    className="w-full arc-button-primary py-4 flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    {balanceStatus === "funded"
                      ? "Balance looks good — no need to claim"
                      : `Request ${DRIP_AMOUNT} from Faucet`}
                  </button>

                  {balanceStatus !== "funded" && (
                    <p className="text-xs font-mono text-dark-600 text-center">
                      Or visit the{" "}
                      <a href={FAUCET_WEB_URL} target="_blank" rel="noopener noreferrer" className="text-arc-400/70 hover:text-arc-400 transition-colors">
                        faucet website ↗
                      </a>
                      {" "}to claim manually
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right: info panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Faucet info */}
              <div className="arc-card p-5">
                <h4 className="font-display text-xs text-arc-400/70 uppercase tracking-widest mb-4">Faucet Info</h4>
                <div className="space-y-3">
                  {[
                    { label: "Drip Amount", value: DRIP_AMOUNT },
                    { label: "Cooldown", value: "24 hours" },
                    { label: "Currency", value: "USDC (native)" },
                    { label: "Network", value: ARC_TESTNET.chainName },
                    { label: "Chain ID", value: String(ARC_TESTNET.chainIdDecimal) },
                  ].map(({ label, value }, i, arr) => (
                    <div
                      key={label}
                      className={`flex justify-between items-center py-2 ${i < arr.length - 1 ? "border-b border-dark-800" : ""}`}
                    >
                      <span className="text-xs font-mono text-dark-500">{label}</span>
                      <span className="text-sm font-mono text-arc-100">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="arc-card p-5">
                <h4 className="font-display text-xs text-arc-400/70 uppercase tracking-widest mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <a
                    href={FAUCET_WEB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-dark-700 hover:border-arc-400/30 hover:bg-arc-400/5 transition-all text-sm text-dark-400 hover:text-arc-400"
                  >
                    <span className="font-mono text-xs">Faucet Website</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                  <a
                    href={`${ARC_TESTNET.blockExplorerUrls[0]}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-dark-700 hover:border-arc-400/30 hover:bg-arc-400/5 transition-all text-sm text-dark-400 hover:text-arc-400"
                  >
                    <span className="font-mono text-xs">View on Explorer</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                  <a
                    href="https://docs.arc.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-dark-700 hover:border-arc-400/30 hover:bg-arc-400/5 transition-all text-sm text-dark-400 hover:text-arc-400"
                  >
                    <span className="font-mono text-xs">Arc Docs</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
