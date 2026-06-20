"use client";

import { useState, useCallback, useRef } from "react";
import { isAddress, parseUnits } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isArcTestnet, switchToArcTestnet, getExplorerTxUrl } from "@/lib/arcNetwork";
import { arcTestnetChain } from "@/lib/wagmiConfig";

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface Recipient {
  id: string;
  address: string;
  amount: string;
  status: "pending" | "sending" | "success" | "failed";
  txHash?: string;
  error?: string;
}

type Phase = "input" | "confirm" | "sending" | "done";
type TokenType = "native" | "erc20";

function parseCSV(text: string): Array<{ address: string; amount: string }> {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const [addr = "", amt = ""] = l.split(",").map((p) => p.trim());
      return { address: addr, amount: amt };
    })
    .filter(
      ({ address, amount }) =>
        isAddress(address) &&
        /^\d+(\.\d+)?$/.test(amount) &&
        parseFloat(amount) > 0
    );
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function MultiSend() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = isArcTestnet(chainId);
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const [tokenType, setTokenType] = useState<TokenType>("native");
  const [erc20Address, setErc20Address] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [inputAddr, setInputAddr] = useState("");
  const [inputAmt, setInputAmt] = useState("");
  const [addrError, setAddrError] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [results, setResults] = useState({ success: 0, failed: 0 });
  const [switching, setSwitching] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isValidERC20 = isAddress(erc20Address);
  const tokenParam = tokenType === "erc20" && isValidERC20
    ? (erc20Address as `0x${string}`)
    : undefined;

  const { data: balanceData } = useBalance({
    address,
    token: tokenParam,
    query: { enabled: !!address && isCorrectNetwork },
  });

  const totalAmount = recipients.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0
  );
  const decimals = balanceData?.decimals ?? 18;
  const balanceNum = balanceData ? parseFloat(balanceData.formatted) : 0;
  const hasEnough = balanceNum >= totalAmount;

  const addRow = () => {
    if (!isAddress(inputAddr)) {
      setAddrError("Invalid address");
      return;
    }
    if (!inputAmt || parseFloat(inputAmt) <= 0) {
      setAddrError("Invalid amount");
      return;
    }
    setRecipients((p) => [
      ...p,
      { id: uid(), address: inputAddr.trim(), amount: inputAmt.trim(), status: "pending" },
    ]);
    setInputAddr("");
    setInputAmt("");
    setAddrError("");
  };

  const removeRow = (id: string) =>
    setRecipients((p) => p.filter((r) => r.id !== id));

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target?.result as string);
      setRecipients((p) => [
        ...p,
        ...parsed.map((r) => ({ ...r, id: uid(), status: "pending" as const })),
      ]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSwitchNetwork = async () => {
    setSwitching(true);
    await switchToArcTestnet().catch(() => switchChain({ chainId: arcTestnetChain.id }));
    setSwitching(false);
  };

  const executeAll = useCallback(async () => {
    setPhase("sending");
    let success = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i++) {
      setRecipients((p) =>
        p.map((r, idx) => (idx === i ? { ...r, status: "sending" } : r))
      );
      try {
        const amtWei = parseUnits(recipients[i].amount, decimals);
        let hash: `0x${string}`;

        if (tokenType === "native") {
          hash = await sendTransactionAsync({
            to: recipients[i].address as `0x${string}`,
            value: amtWei,
          });
        } else {
          hash = await writeContractAsync({
            address: erc20Address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [recipients[i].address as `0x${string}`, amtWei],
          });
        }

        if (publicClient) {
          await waitForTransactionReceipt(publicClient, { hash });
        }

        setRecipients((p) =>
          p.map((r, idx) =>
            idx === i ? { ...r, status: "success", txHash: hash } : r
          )
        );
        success++;
      } catch (err: unknown) {
        const msg =
          (err as { shortMessage?: string }).shortMessage ??
          (err instanceof Error ? err.message : "Transaction failed");
        setRecipients((p) =>
          p.map((r, idx) =>
            idx === i ? { ...r, status: "failed", error: msg.slice(0, 100) } : r
          )
        );
        failed++;
      }
    }

    setResults({ success, failed });
    setPhase("done");
  }, [recipients, tokenType, erc20Address, decimals, sendTransactionAsync, writeContractAsync, publicClient]);

  const reset = () => {
    setRecipients([]);
    setInputAddr("");
    setInputAmt("");
    setAddrError("");
    setPhase("input");
    setResults({ success: 0, failed: 0 });
  };

  const statusIcon = (s: Recipient["status"]) => {
    if (s === "sending")
      return (
        <svg className="w-4 h-4 animate-spin text-arc-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      );
    if (s === "success")
      return (
        <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    if (s === "failed")
      return (
        <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    return <span className="w-4 h-4 rounded-full border border-dark-600 block" />;
  };

  return (
    <section id="multisend" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-px h-8 bg-arc-400/40" />
            <span className="font-display text-xs text-arc-400/70 uppercase tracking-widest">
              03 / Multi-Send
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-arc-50">Multi-Send</h2>
          <p className="text-dark-400 mt-2">
            Batch send native USDC or any ERC20 token to multiple addresses. CSV import supported.
          </p>
        </div>

        {!isConnected ? (
          <div className="arc-card p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-arc-400/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-arc-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-arc-100 mb-2">Connect Your Wallet</h3>
            <p className="text-dark-400 text-sm mb-6">Connect to send tokens to multiple addresses.</p>
            <ConnectButton />
          </div>
        ) : !isCorrectNetwork ? (
          <div className="arc-card p-8 text-center border-amber-500/20 bg-amber-500/5">
            <p className="text-amber-400 font-display font-bold mb-4">Switch to Arc Testnet</p>
            <button onClick={handleSwitchNetwork} disabled={switching} className="arc-button-primary py-3 px-8">
              {switching ? "Switching…" : "Switch Network"}
            </button>
          </div>
        ) : phase === "input" ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: builder */}
            <div className="lg:col-span-3 space-y-5">
              {/* Token selector */}
              <div className="arc-card p-5">
                <span className="arc-label">Token</span>
                <div className="flex gap-2 mb-3">
                  {(["native", "erc20"] as TokenType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTokenType(t)}
                      className={`flex-1 py-2 rounded-lg border font-display text-sm transition-all ${
                        tokenType === t
                          ? "bg-arc-600 border-arc-600 text-white"
                          : "border-dark-700 text-dark-400 hover:border-arc-400/40"
                      }`}
                    >
                      {t === "native" ? "Native USDC" : "Custom ERC20"}
                    </button>
                  ))}
                </div>
                {tokenType === "erc20" && (
                  <input
                    type="text"
                    placeholder="Token contract address (0x…)"
                    value={erc20Address}
                    onChange={(e) => setErc20Address(e.target.value)}
                    className={`arc-input text-sm ${erc20Address && !isValidERC20 ? "border-red-500/50" : ""}`}
                  />
                )}
                {address && balanceData && (
                  <p className="mt-2 text-xs font-mono text-dark-500">
                    Balance: <span className={hasEnough ? "text-arc-400" : "text-amber-400"}>
                      {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
                    </span>
                    {!hasEnough && recipients.length > 0 && (
                      <span className="text-amber-400 ml-1">— insufficient for total</span>
                    )}
                  </p>
                )}
              </div>

              {/* Add recipient */}
              <div className="arc-card p-5">
                <span className="arc-label">Add Recipient</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="0x address"
                    value={inputAddr}
                    onChange={(e) => { setInputAddr(e.target.value); setAddrError(""); }}
                    className="arc-input text-sm flex-1"
                  />
                  <input
                    type="text"
                    placeholder="Amount"
                    value={inputAmt}
                    onChange={(e) => setInputAmt(e.target.value)}
                    className="arc-input text-sm w-28"
                  />
                  <button
                    onClick={addRow}
                    className="arc-button-primary px-4 py-2 text-sm whitespace-nowrap"
                  >
                    + Add
                  </button>
                </div>
                {addrError && <p className="mt-1 text-xs font-mono text-red-400">{addrError}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSV} className="hidden" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="text-xs font-mono text-dark-500 hover:text-arc-400 transition-colors flex items-center gap-1.5 border border-dark-700 rounded px-3 py-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    Import CSV
                  </button>
                  <span className="text-xs font-mono text-dark-700">format: address,amount</span>
                </div>
              </div>

              {/* Recipient list */}
              {recipients.length > 0 && (
                <div className="arc-card overflow-hidden">
                  <div className="px-5 py-3 border-b border-dark-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-dark-500">{recipients.length} recipient{recipients.length !== 1 ? "s" : ""}</span>
                    <button onClick={() => setRecipients([])} className="text-xs font-mono text-dark-700 hover:text-red-400 transition-colors">Clear all</button>
                  </div>
                  <div className="divide-y divide-dark-800 max-h-64 overflow-y-auto">
                    {recipients.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 px-5 py-2.5">
                        <span className="font-mono text-xs text-dark-400 truncate flex-1">{r.address}</span>
                        <span className="font-mono text-xs text-arc-400 w-20 text-right">{parseFloat(r.amount).toLocaleString()}</span>
                        <button onClick={() => removeRow(r.id)} className="text-dark-700 hover:text-red-400 transition-colors ml-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: summary + send */}
            <div className="lg:col-span-2 space-y-4">
              <div className="arc-card p-5">
                <h4 className="font-display text-xs text-arc-400/70 uppercase tracking-widest mb-4">Summary</h4>
                <div className="space-y-3">
                  {[
                    { label: "Recipients", value: String(recipients.length) },
                    { label: "Total Amount", value: `${totalAmount.toLocaleString()} ${balanceData?.symbol ?? (tokenType === "native" ? "USDC" : "tokens")}` },
                    { label: "Token", value: tokenType === "native" ? "Native USDC" : (isValidERC20 ? `${erc20Address.slice(0, 6)}…${erc20Address.slice(-4)}` : "—") },
                    { label: "Transactions", value: recipients.length > 0 ? `${recipients.length} sequential` : "—" },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} className={`flex justify-between py-2 ${i < arr.length - 1 ? "border-b border-dark-800" : ""}`}>
                      <span className="text-xs font-mono text-dark-500">{label}</span>
                      <span className="text-xs font-mono text-arc-100 text-right max-w-[140px] break-all">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {recipients.length > 0 && (
                <div className="arc-card p-4 border-arc-400/10 bg-arc-400/3 text-xs font-mono text-dark-500 leading-relaxed">
                  Each recipient gets a separate transaction. Approve each one in your wallet when prompted.
                </div>
              )}

              <button
                onClick={() => setPhase("confirm")}
                disabled={recipients.length === 0 || !hasEnough || (tokenType === "erc20" && !isValidERC20)}
                className="w-full arc-button-primary py-4 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Review & Send
              </button>
            </div>
          </div>
        ) : phase === "confirm" ? (
          /* Confirm phase */
          <div className="max-w-lg mx-auto">
            <div className="arc-card p-8 text-center space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-arc-400/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-arc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-arc-100 mb-2">
                  Confirm Multi-Send
                </h3>
                <p className="text-dark-400 text-sm">
                  You are about to send to{" "}
                  <span className="text-arc-400 font-mono">{recipients.length}</span>{" "}
                  recipient{recipients.length !== 1 ? "s" : ""}.
                </p>
              </div>
              <div className="arc-card p-4 bg-dark-900 text-left space-y-2">
                {[
                  { label: "Total Amount", value: `${totalAmount.toLocaleString()} ${balanceData?.symbol ?? "USDC"}` },
                  { label: "Recipients", value: String(recipients.length) },
                  { label: "Transactions", value: `${recipients.length} sequential` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs font-mono text-dark-500">{label}</span>
                    <span className="text-xs font-mono text-arc-100">{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-mono text-dark-600">
                Each transaction requires wallet approval. Do not close the page while sending.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setPhase("input")} className="arc-button-secondary py-3 px-6 text-sm">
                  ← Back
                </button>
                <button onClick={executeAll} className="arc-button-primary py-3 px-8 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Execute
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Sending / Done phase — full-width progress list */
          <div className="space-y-4">
            {/* Progress header */}
            <div className="arc-card p-5 flex items-center justify-between">
              {phase === "sending" ? (
                <div className="flex items-center gap-3 text-arc-400">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="font-display font-bold">Sending {recipients.length} transactions…</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="font-display font-bold">{results.success} sent</span>
                  </div>
                  {results.failed > 0 && (
                    <div className="flex items-center gap-2 text-red-400">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span className="font-display font-bold">{results.failed} failed</span>
                    </div>
                  )}
                </div>
              )}
              {phase === "done" && (
                <button onClick={reset} className="arc-button-secondary text-sm py-2 px-5">
                  New Multi-Send
                </button>
              )}
            </div>

            {/* Per-recipient progress */}
            <div className="arc-card overflow-hidden">
              <div className="divide-y divide-dark-800">
                {recipients.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-shrink-0">{statusIcon(r.status)}</div>
                    <span className="font-mono text-xs text-dark-400 truncate flex-1">{r.address}</span>
                    <span className="font-mono text-xs text-arc-400 w-20 text-right">{parseFloat(r.amount).toLocaleString()}</span>
                    {r.txHash && (
                      <a
                        href={getExplorerTxUrl(r.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-arc-400 hover:text-arc-300"
                      >
                        ↗
                      </a>
                    )}
                    {r.error && (
                      <span className="text-xs font-mono text-red-400/70 truncate max-w-[120px]" title={r.error}>
                        {r.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
