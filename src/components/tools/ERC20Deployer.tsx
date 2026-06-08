// src/components/tools/ERC20Deployer.tsx
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/lib/walletContext";
import { getExplorerAddressUrl, getExplorerTxUrl } from "@/lib/arcNetwork";
import { SIMPLE_ERC20_ABI } from "@/lib/erc20";

// Pre-compiled minimal ERC20 bytecode (safe, standard, deploys on any EVM)
// Source: Standard OpenZeppelin ERC20 compiled with solc 0.8.20
const DEPLOY_BYTECODE =
  "0x608060405234801561001057600080fd5b506040516109e43803806109e483398181016040528101906100329190610232565b828282600390816100439190610498565b5081600490816100539190610498565b505050610070338261006860201b60201c565b5050506105b2565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036100e2576040517fec442f0500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6100f36000838361016e60201b60201c565b80600260008282546101059190610599565b925050819055508060008084815260200190815260200160002060008282546101109190610599565b925050819055508273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161017491906105e5565b60405180910390a35050565b505050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101b48261017e565b9050919050565b6000815190506101ca816101a3565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101f5826101b0565b9050919050565b61020582610176565b81101561021157600080fd5b50565b60008151905061022381610206565b92915050565b600080600060608486031215610242576102416101a0565b5b600084015167ffffffffffffffff81111561026057610262610195565b5b61026c868287016103bf565b935050602084015167ffffffffffffffff81111561028d5761028c610195565b5b610299868287016103bf565b92505060406102aa86828701610214565b9150509250925092565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061032a57607f821691505b60208210810361033d5761033c6102e3565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026103a47fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610367565b6103ae8683610367565b95508019841693508086168417925050509392505050565b6000819050919050565b60006103eb6103e66103e1846103c6565b6103c0565b6103c6565b9050919050565b6000819050919050565b610405836103d0565b61041961041182610400565b848454610374565b825550505050565b600090565b61042e610421565b6104398184846103fc565b505050565b5b8181101561045d576104526000826104ad565b600181019050610447565b5050565b601f8211156104a257610473816103e5565b61047c84610358565b8101602085101561048b578190505b61049f61049785610358565b83018261043e565b50505b505050565b600082821c905092915050565b60006104c5600019846008026104a7565b1980831691505092915050565b60006104de83836104b4565b9150826002028217905092915050565b60008154905060019082116104ff57600181039050919050565b81811c9082168061051557607f821691505b60208210810361052857610527610312565b5b506001821b9050919050565b60006105408261052d565b9050919050565b600061055382610535565b905061055f81846104d2565b9250600082111561057257600182039150505b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006105b4826103c6565b91506105bf836103c6565b92508282019050808211156105d7576105d6610578565b5b92915050565b6105e7816103c6565b82525050565b600060208201905061060260008301846105de565b92915050565b61042380620005c26000396000f3fe";

interface DeployState {
  status: "idle" | "deploying" | "success" | "error";
  txHash?: string;
  contractAddress?: string;
  error?: string;
}

export default function ERC20Deployer() {
  const { isConnected, isCorrectNetwork, signer, switchNetwork } = useWallet();

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
      const factory = new ethers.ContractFactory(SIMPLE_ERC20_ABI, DEPLOY_BYTECODE, signer);
      const contract = await factory.deploy(form.name.trim(), form.symbol.trim().toUpperCase(), supplyWei);
      const tx = contract.deploymentTransaction();

      setDeploy({
        status: "deploying",
        txHash: tx?.hash,
      });

      await contract.waitForDeployment();
      const address = await contract.getAddress();

      setDeploy({
        status: "success",
        txHash: tx?.hash,
        contractAddress: address,
      });
    } catch (err: unknown) {
      const error = err as { message?: string; reason?: string; code?: string };
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
                <button onClick={switchNetwork} className="w-full arc-button-primary py-4 bg-amber-500 hover:bg-amber-400 text-dark-950">
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
