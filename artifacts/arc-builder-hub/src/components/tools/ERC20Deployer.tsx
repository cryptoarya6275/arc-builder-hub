"use client";

import { useState } from "react";
import { parseUnits, formatUnits } from "viem";
import {
  useAccount,
  useChainId,
  useBalance,
  useDeployContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { getExplorerAddressUrl, getExplorerTxUrl, isArcTestnet, switchToArcTestnet } from "@/lib/arcNetwork";
import { SIMPLE_ERC20_ABI, SIMPLE_ERC20_BYTECODE } from "@/lib/erc20";

const DEPLOY_GAS_LIMIT = 3_500_000n;

export default function ERC20Deployer() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = isArcTestnet(chainId);

  const { data: balanceData } = useBalance({ address, query: { enabled: !!address && isCorrectNetwork } });
  const hasBalance = balanceData ? balanceData.value > 0n : null;

  const [form, setForm] = useState({ name: "", symbol: "", supply: "" });
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  const {
    deployContract,
    data: txHash,
    isPending,
    error: deployError,
    reset: resetDeploy,
  } = useDeployContract();

  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const isDeploying = isPending || isConfirming;
  const isSuccess = !!receipt;
  const contractAddress = receipt?.contractAddress;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid =
    form.name.trim().length > 0 &&
    form.symbol.trim().length > 0 &&
    /^\d+(\.\d+)?$/.test(form.supply) &&
    parseFloat(form.supply) > 0;

  const handleSwitchChain = async () => {
    setSwitchError(null);
    setSwitching(true);
    const result = await switchToArcTestnet();
    setSwitching(false);
    if (!result.success) setSwitchError(result.error ?? "Failed to switch network");
  };

  const handleDeploy = () => {
    if (!isFormValid) return;
    const supplyWei = parseUnits(form.supply, 18);
    deployContract({
      abi: SIMPLE_ERC20_ABI,
      bytecode: SIMPLE_ERC20_BYTECODE,
      args: [form.name.trim(), form.symbol.trim().toUpperCase(), supplyWei],
      gas: DEPLOY_GAS_LIMIT,
    });
  };

  const reset = () => {
    resetDeploy();
    setSwitchError(null);
    setForm({ name: "", symbol: "", supply: "" });
  };

  const errorMsg = deployError
    ? (() => {
        const e = deployError as { shortMessage?: string; message?: string; code?: string };
        if (e.code === "ACTION_REJECTED" || e.message?.includes("rejected")) return "Transaction rejected by user.";
        return e.shortMessage || e.message?.slice(0, 140) || "Deployment failed";
      })()
    : null;

  return (
    <section id="deployer" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-px h-8 bg-arc-400/40" />
            <span className="font-display text-xs text-arc-400/70 uppercase tracking-widest">
              02 / Tools
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-arc-50">
            ERC20 Token Deployer
          </h2>
          <p className="text-dark-400 mt-2">
            Deploy a standard ERC20 token to the Arc Testnet in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 arc-card p-6 gradient-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-arc-400/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-arc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-arc-100">Token Configuration</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="arc-label" htmlFor="name">Token Name</label>
                <input
                  id="name" name="name" type="text"
                  value={form.name} onChange={handleInput}
                  placeholder="e.g. My Arc Token"
                  className="arc-input" disabled={isDeploying} maxLength={64}
                />
              </div>

              <div>
                <label className="arc-label" htmlFor="symbol">Token Symbol</label>
                <input
                  id="symbol" name="symbol" type="text"
                  value={form.symbol} onChange={handleInput}
                  placeholder="e.g. MAT"
                  className="arc-input uppercase" disabled={isDeploying} maxLength={10}
                />
                <p className="mt-1 text-xs font-mono text-dark-600">Will be uppercased automatically. Max 10 characters.</p>
              </div>

              <div>
                <label className="arc-label" htmlFor="supply">Initial Supply</label>
                <div className="relative">
                  <input
                    id="supply" name="supply" type="text" inputMode="decimal"
                    value={form.supply} onChange={handleInput}
                    placeholder="e.g. 1000000"
                    className="arc-input pr-20" disabled={isDeploying}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-dark-500">
                    {form.symbol ? form.symbol.toUpperCase() : "tokens"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-mono text-dark-600">Decimals: 18. Minted to your wallet on deploy.</p>
              </div>

              {/* Action button */}
              {!isConnected ? (
                <div className="arc-card p-4 text-center bg-dark-900/80">
                  <p className="text-sm text-dark-400">Connect your wallet to deploy.</p>
                </div>
              ) : !isCorrectNetwork ? (
                <div className="space-y-2">
                  <button
                    onClick={handleSwitchChain}
                    disabled={switching}
                    className="w-full arc-button-primary py-4 bg-amber-500 hover:bg-amber-400 text-dark-950 flex items-center justify-center gap-2"
                  >
                    {switching && (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {switching ? "Switching…" : "Switch to Arc Testnet"}
                  </button>
                  {switchError && (
                    <p className="text-xs font-mono text-red-400/80 text-center">{switchError}</p>
                  )}
                </div>
              ) : hasBalance === false ? (
                <div className="arc-card p-4 text-center bg-dark-900/80 border border-amber-500/20">
                  <p className="text-sm text-amber-400/80">
                    Your wallet has 0 USDC. Get testnet funds from the Arc faucet before deploying.
                  </p>
                </div>
              ) : isDeploying ? (
                <button disabled className="w-full arc-button-primary py-4 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isPending ? "Confirm in wallet…" : "Waiting for confirmation…"}
                </button>
              ) : isSuccess ? (
                <button onClick={reset} className="w-full arc-button-secondary py-4">
                  ← Deploy Another Token
                </button>
              ) : (
                <button
                  onClick={handleDeploy}
                  disabled={!isFormValid}
                  className="w-full arc-button-primary py-4 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Deploy Token
                </button>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Token Preview */}
            <div className="arc-card p-5">
              <h4 className="font-display text-xs text-arc-400/70 uppercase tracking-widest mb-4">Token Preview</h4>
              <div className="space-y-3">
                {[
                  { label: "Name", value: form.name || "—" },
                  { label: "Symbol", value: form.symbol ? form.symbol.toUpperCase() : "—", accent: true },
                  { label: "Supply", value: form.supply ? parseFloat(form.supply).toLocaleString() : "—" },
                  { label: "Decimals", value: "18" },
                  { label: "Standard", value: "ERC-20" },
                ].map(({ label, value, accent }, i, arr) => (
                  <div key={label} className={`flex justify-between items-center py-2 ${i < arr.length - 1 ? "border-b border-dark-800" : ""}`}>
                    <span className="text-xs font-mono text-dark-500">{label}</span>
                    <span className={`text-sm font-mono ${accent ? "text-arc-400 font-bold" : "text-arc-100"}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance indicator */}
            {isConnected && isCorrectNetwork && balanceData && (
              <div className="arc-card p-4 flex items-center justify-between">
                <span className="text-xs font-mono text-dark-500">Wallet balance</span>
                <span className={`text-xs font-mono ${hasBalance ? "text-arc-400" : "text-amber-400"}`}>
                  {parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} {balanceData.symbol}
                </span>
              </div>
            )}

            {/* Deployment Status */}
            {(isDeploying || isSuccess || deployError) && (
              <div className={`arc-card p-5 animate-slide-up ${
                isSuccess ? "border-green-500/30 bg-green-500/5"
                : deployError ? "border-red-500/30 bg-red-500/5"
                : "border-arc-400/20"
              }`}>
                <h4 className="font-display text-xs uppercase tracking-widest mb-3 text-dark-500">Deployment Status</h4>

                {isDeploying && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-arc-400">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm font-display">
                        {isPending ? "Waiting for wallet approval…" : "Broadcasting transaction…"}
                      </span>
                    </div>
                    {txHash && (
                      <div>
                        <span className="text-xs font-mono text-dark-500">TX Hash:</span>
                        <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                          className="block text-xs font-mono text-arc-400 hover:text-arc-300 break-all mt-1">
                          {txHash}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {isSuccess && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="font-display font-bold">Token Deployed!</span>
                    </div>
                    {contractAddress && (
                      <div>
                        <span className="text-xs font-mono text-dark-500">Contract Address:</span>
                        <a href={getExplorerAddressUrl(contractAddress)} target="_blank" rel="noopener noreferrer"
                          className="block text-xs font-mono text-green-400 hover:text-green-300 break-all mt-1">
                          {contractAddress} ↗
                        </a>
                      </div>
                    )}
                    {txHash && (
                      <div>
                        <span className="text-xs font-mono text-dark-500">Transaction:</span>
                        <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                          className="block text-xs font-mono text-dark-400 hover:text-arc-400 break-all mt-1">
                          {txHash} ↗
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {deployError && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      <span className="font-display font-bold">Deployment Failed</span>
                    </div>
                    <p className="text-xs font-mono text-red-400/70 break-all">{errorMsg}</p>
                    <button onClick={() => resetDeploy()}
                      className="text-xs font-display text-dark-500 hover:text-arc-400 transition-colors">
                      Try again →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
