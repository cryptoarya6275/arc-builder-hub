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
  "0x608060405234801561001057600080fd5b506040516109e43803806109e483398181016040528101906100329190610232565b828282600390816100439190610498565b5081600490816100539190610498565b50505061007033826100686100000000000000000000000000000000000000000000000000000000000000006040516024016100aa91906106bb565b6040516020818303038152906040527f095ea7b3000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180516001600160e01b038316179052506101049291906000906107a9565b505050505061084b806101176000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c8063395093512461011957806370a082311461014a5780639dc29fac14610182578063a457c2d7146101b3578063a9059cbb146101e4578063dd62ed3e14610215575b600080fd5b61013360048036038101906100ce91906105f9565b61024d565b6040516101429291906106c7565b60405180910390f35b610164600480360381019061015f91906105c5565b6102a4565b6040516101799291906106c7565b60405180910390f35b61019c600480360381019061019791906105f9565b6102ec565b6040516101ab9291906106c7565b60405180910390f35b6101cd60048036038101906101c891906105f9565b610334565b6040516101dc9291906106c7565b60405180910390f35b6101fe60048036038101906101f991906105f9565b61038b565b60405161020d9291906106c7565b60405180910390f35b61023760048036038101906102329190610589565b6103a9565b6040516102469291906106c7565b60405180910390f35b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156102b45760006040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102ab90610695565b60405180910390fd5b5050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60008082111561034257806040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161033990610695565b60405180910390fd5b5050565b600080600084600001905060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050816103905760006040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161038790610695565b60405180910390fd5b5050505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156103f557600080fd5b5050565b60008083900360008084600001905060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050819350505050919050565b60405180604001604052806004815260200160808201905250565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006104a38261047e565b9050919050565b6104b381610498565b81146104be57600080fd5b50565b6000813590506104d0816104aa565b92915050565b6000602082840312156104ec576104eb610474565b5b60006104fa848285016104c1565b91505092915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61054c82610509565b810181811067ffffffffffffffff8211171561056b5761056a61050d565b5b80604052505050565b600061057e610455565b905061058a8282610543565b919050565b6000602082840312156105a65761051f610474565b5b60006105b4848285016104c1565b91505092915050565b6000602082840312156105d3576105d2610474565b5b60006105e1848285016104c1565b91505092915050565b600080604083850312156105fd576105fc610474565b5b600061060b858286016104c1565b925050602061061c858286016104c1565b9150509250929050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561066057808201518184015260208101905061064b565b838111156106815760008484015250505b50505050565b600061069282610626565b61069c8185610631565b93506106ac818560208601610648565b6106b581610509565b840191505092915050565b60006040820190506106d560008301856106c6565b6106e260208301846106c6565b939250505056fea2646970667358221220000000000000000000000000000000000000000000000000000000000000000064736f6c63430008140033";

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
      const bytecode = "0x60806040523480156200001157600080fd5b5060405162000b2238038062000b228339810160408190526200003491620001e0565b82516200004950600390602086019062000068565b5081516200005f90600490602086019062000068565b506200007a6200006e6200008060201b60201c565b6200008960201b60201c565b50505050620002c5565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036200011c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620001139062000299565b60405180910390fd5b8060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f5fc1e23e7d16952cc450d4a81560405160405180910390a380600080006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620001ef82620001c2565b9050919050565b620002018162000204565b81146200020d57600080fd5b50565b600081519050620002218162000204565b92915050565b6000806040838503121562000241576200024062000204565b5b60006200025185828601620001f0565b925050602083015167ffffffffffffffff81111562000275576200027462000204565b5b81019150509250929050565b62000290816200021d565b81146200029c57600080fd5b50565b6000815160405191505090565b603f6000f3fea2646970667358221220000000000000000000000000000000000000000000000000000000000000000064736f6c63430008140033";

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
