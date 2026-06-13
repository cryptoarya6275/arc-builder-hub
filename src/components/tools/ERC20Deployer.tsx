// src/components/tools/ERC20Deployer.tsx
"use client";

import { useState, useMemo } from "react";
import { ethers } from "ethers";
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { getExplorerAddressUrl, getExplorerTxUrl, isArcTestnet } from "@/lib/arcNetwork";
import { arcTestnetChain } from "@/lib/wagmiConfig";
import { SIMPLE_ERC20_ABI } from "@/lib/erc20";

// Pre-compiled minimal ERC20 bytecode (safe, standard, deploys on any EVM)
// Source: Standard OpenZeppelin ERC20 compiled with solc 0.8.20
const DEPLOY_BYTECODE =
  "0x608060405234801561001057600080fd5b506040516109e43803806109e483398181016040528101906100329190610232565b828282600390816100439190610498565b5081600490816100539190610498565b50505061007033826100686[...[...]

interface DeployState {
  status: "idle" | "deploying" | "success" | "error";
  txHash?: string;
  contractAddress?: string;
  error?: string;
}

function useEthersSigner() {
  const { data: walletClient } = useWalletClient();
  return useMemo(() => {
    if (!walletClient) return undefined;
    const { account, chain, transport } = walletClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: (chain.contracts as { ensRegistry?: { address: string } } | undefined)
        ?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    return new JsonRpcSigner(provider, account.address);
  }, [walletClient]);
}

export default function ERC20Deployer() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = isArcTestnet(chainId);
  const { switchChain } = useSwitchChain();
  const signer = useEthersSigner();

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    supply: "",
  });

  const [deploy, setDeploy] = useState<DeployState>({ status: "idle" });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid =
    form.name.trim().length > 0 &&
    form.symbol.trim().length > 0 &&
    /^\d+(\.\d+)?$/.test(form.supply) &&
    parseFloat(form.supply) > 0;

  const handleDeploy = async () => {
    if (!signer || !isFormValid) return;
    setDeploy({ status: "deploying" });
    try {
      const supplyWei = ethers.parseUnits(form.supply, 18);
      const abi = [
        "constructor(string name_, string symbol_, uint256 initialSupply_)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
      ];
      const bytecode = "0x60806040523480156200001157600080fd5b5060405162000b2238038062000b228339810160408190526200003491620001e0565b82516200004990600390602086019062000068565b5081516200005f906004906020[...]

      const factory = new ethers.ContractFactory(abi, bytecode, signer);
      const contract = await factory.deploy(
        form.name.trim(),
        form.symbol.trim().toUpperCase(),
        supplyWei,
        {
          gasLimit: 3_000_000,
        }
      );
      const tx = contract.deploymentTransaction();
      setDeploy({ status: "deploying", txHash: tx?.hash });
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      setDeploy({ status: "success", txHash: tx?.hash, contractAddress: address });
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      let msg = error.message || "Deployment failed";
      if (error.code === "ACTION_REJECTED") msg = "Transaction rejected by user.";
      if (msg.length > 120) msg = msg.slice(0, 120) + "…";
      setDeploy({ status: "error", error: msg });
    }
  };

  const reset = () => {
    setDeploy({ status: "idle" });
    setForm({ name: "", symbol: "", supply: "" });
  };

  return (
    <section id="deployer" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
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
              {/* Token Name */}
              <div>
                <label className="arc-label" htmlFor="name">
                  Token Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleInput}
                  placeholder="e.g. My Arc Token"
                  className="arc-input"
                  disabled={deploy.status === "deploying"}
                  maxLength={64}
                />
              </div>

              {/* Token Symbol */}
              <div>
                <label className="arc-label" htmlFor="symbol">
                  Token Symbol
                </label>
                <input
                  id="symbol"
                  name="symbol"
                  type="text"
                  value={form.symbol}
                  onChange={handleInput}
                  placeholder="e.g. MAT"
                  className="arc-input uppercase"
                  disabled={deploy.status === "deploying"}
                  maxLength={10}
                />
                <p className="mt-1 text-xs font-mono text-dark-600">
                  Will be uppercased automatically. Max 10 characters.
                </p>
              </div>

              {/* Initial Supply */}
              <div>
                <label className="arc-label" htmlFor="supply">
                  Initial Supply
                </label>
                <div className="relative">
                  <input
                    id="supply"
                    name="supply"
                    type="text"
                    inputMode="decimal"
                    value={form.supply}
                    onChange={handleInput}
                    placeholder="e.g. 1000000"
                    className="arc-input pr-20"
                    disabled={deploy.status === "deploying"}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-dark-500">
                    {form.symbol ? form.symbol.toUpperCase() : "tokens"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-mono text-dark-600">
                  Decimals: 18. Minted to your wallet on deploy.
                </p>
              </div>

              {/* Deploy button */}
              {!isConnected ? (
                <div className="arc-card p-4 text-center bg-dark-900/80">
                  <p className="text-sm text-dark-400">Connect your wallet to deploy.</p>
                </div>
              ) : !isCorrectNetwork ? (
                <button
                  onClick={() => switchChain({ chainId: arcTestnetChain.id })}
                  className="w-full arc-button-primary py-4 bg-amber-500 hover:bg-amber-400 text-dark-950"
                >
                  Switch to Arc Testnet First
                </button>
              ) : deploy.status === "deploying" ? (
                <button disabled className="w-full arc-button-primary py-4 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Deploying Contract...
                </button>
              ) : deploy.status === "success" ? (
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

          {/* Status / Preview panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Preview */}
            <div className="arc-card p-5">
              <h4 className="font-display text-xs text-arc-400/70 uppercase tracking-widest mb-4">
                Token Preview
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-dark-800">
                  <span className="text-xs font-mono text-dark-500">Name</span>
                  <span className="text-sm font-mono text-arc-100">
                    {form.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dark-800">
                  <span className="text-xs font-mono text-dark-500">Symbol</span>
                  <span className="text-sm font-mono text-arc-400 font-bold">
                    {form.symbol ? form.symbol.toUpperCase() : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dark-800">
                  <span className="text-xs font-mono text-dark-500">Supply</span>
                  <span className="text-sm font-mono text-arc-100">
                    {form.supply
                      ? parseFloat(form.supply).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dark-800">
                  <span className="text-xs font-mono text-dark-500">Decimals</span>
                  <span className="text-sm font-mono text-arc-100">18</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-mono text-dark-500">Standard</span>
                  <span className="text-sm font-mono text-arc-100">ERC-20</span>
                </div>
              </div>
            </div>

            {/* Deployment Status */}
            {deploy.status !== "idle" && (
              <div
                className={`arc-card p-5 animate-slide-up ${
                  deploy.status === "success"
                    ? "border-green-500/30 bg-green-500/5"
                    : deploy.status === "error"
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-arc-400/20"
                }`}
              >
                <h4 className="font-display text-xs uppercase tracking-widest mb-3 text-dark-500">
                  Deployment Status
                </h4>

                {deploy.status === "deploying" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-arc-400">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm font-display">Broadcasting transaction…</span>
                    </div>
                    {deploy.txHash && (
                      <div>
                        <span className="text-xs font-mono text-dark-500">TX Hash:</span>
                        <a
                          href={getExplorerTxUrl(deploy.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs font-mono text-arc-400 hover:text-arc-300 break-all mt-1"
                        >
                          {deploy.txHash}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {deploy.status === "success" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="font-display font-bold">Token Deployed!</span>
                    </div>
                    {deploy.contractAddress && (
                      <div>
                        <span className="text-xs font-mono text-dark-500">Contract Address:</span>
                        <a
                          href={getExplorerAddressUrl(deploy.contractAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs font-mono text-green-400 hover:text-green-300 break-all mt-1"
                        >
                          {deploy.contractAddress} ↗
                        </a>
                      </div>
                    )}
                    {deploy.txHash && (
                      <div>
                        <span className="text-xs font-mono text-dark-500">Transaction:</span>
                        <a
                          href={getExplorerTxUrl(deploy.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs font-mono text-dark-400 hover:text-arc-400 break-all mt-1"
                        >
                          {deploy.txHash} ↗
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {deploy.status === "error" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      <span className="font-display font-bold">Deployment Failed</span>
                    </div>
                    <p className="text-xs font-mono text-red-400/70 break-all">
                      {deploy.error}
                    </p>
                    <button
                      onClick={() => setDeploy({ status: "idle" })}
                      className="text-xs font-display text-dark-500 hover:text-arc-400 transition-colors"
                    >
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
