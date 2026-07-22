// src/lib/circleKit.ts
// Circle App Kit integration — browser-wallet flow via viem adapter
// https://docs.arc.io/app-kit

import { AppKit } from "@circle-fin/app-kit";
import { ViemAdapter } from "@circle-fin/adapter-viem-v2";
import { createPublicClient, http } from "viem";
import { useConnectorClient } from "wagmi";
import { useCallback } from "react";

// ─── Types re-exported for consumers ─────────────────────────────────────────

export interface SwapResult {
  txHash: string;
  explorerUrl: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  fees: Array<{ token: string; amount: string; type: string }>;
}

export interface BridgeResult {
  txHash?: string;
  explorerUrl?: string;
  fromChain: string;
  toChain: string;
  amount: string;
  progress: {
    status: string;
    substatus?: string;
    substatusMessage?: string;
  };
}

// ─── Circle chain identifiers ─────────────────────────────────────────────────
// These string IDs are the values Circle's SDK uses for the `chain` parameter.

export type CircleChainId =
  | "Arc_Testnet"
  | "Ethereum_Sepolia"
  | "Avalanche_Fuji"
  | "Base_Sepolia"
  | "OP_Sepolia"
  | "Arbitrum_Sepolia"
  | "Polygon_PoS_Amoy";

export interface BridgeChain {
  circleId: CircleChainId;
  name: string;
  shortName: string;
  color: string;
  evmChainId: number;
}

export const BRIDGE_CHAINS: BridgeChain[] = [
  { circleId: "Arc_Testnet",       name: "Arc Testnet",       shortName: "Arc",     color: "#7c3aed", evmChainId: 5042002  },
  { circleId: "Ethereum_Sepolia",  name: "Ethereum Sepolia",  shortName: "Sepolia", color: "#627EEA", evmChainId: 11155111 },
  { circleId: "Avalanche_Fuji",    name: "Avalanche Fuji",    shortName: "Fuji",    color: "#E84142", evmChainId: 43113    },
  { circleId: "Base_Sepolia",      name: "Base Sepolia",      shortName: "Base",    color: "#0052FF", evmChainId: 84532    },
  { circleId: "OP_Sepolia",        name: "OP Sepolia",        shortName: "OP",      color: "#FF0420", evmChainId: 11155420 },
  { circleId: "Arbitrum_Sepolia",  name: "Arbitrum Sepolia",  shortName: "Arb",     color: "#28A0F0", evmChainId: 421614   },
  { circleId: "Polygon_PoS_Amoy",  name: "Polygon Amoy",      shortName: "Polygon", color: "#7B3FE4", evmChainId: 80002    },
];

// ─── Singleton AppKit + chains cache ─────────────────────────────────────────

let _appKit: AppKit | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _chainsCache: any[] | null = null;

function getAppKit(): AppKit {
  if (!_appKit) {
    const kitKey = import.meta.env.VITE_CIRCLE_KIT_KEY as string | undefined;
    // @ts-ignore — AppKit constructor options vary by version
    _appKit = kitKey ? new AppKit({ kitKey }) : new AppKit();
  }
  return _appKit;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCachedSupportedChains(): Promise<any[]> {
  if (_chainsCache) return _chainsCache;
  const kit = getAppKit();
  const chains = await kit.getSupportedChains();
  // @ts-ignore
  _chainsCache = Array.isArray(chains) ? chains : chains;
  return _chainsCache!;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCircleKit() {
  const { data: walletClient } = useConnectorClient();

  /** Build a ViemAdapter backed by the user's connected browser wallet. */
  const buildAdapter = useCallback(async () => {
    if (!walletClient) throw new Error("Connect your wallet first.");
    const supportedChains = await getCachedSupportedChains();

    return new ViemAdapter(
      {
        // Public client for on-chain reads — use Arc Testnet RPC
        getPublicClient: ({ chain }: { chain: object }) =>
          createPublicClient({
            // @ts-ignore
            chain,
            transport: http("https://rpc.testnet.arc.network"),
          }),
        // Wallet client for signing — use wagmi's connected wallet (triggers MetaMask popup)
        // @ts-ignore — wagmi WalletClient is compatible with viem WalletClient
        getWalletClient: () => walletClient,
      },
      {
        addressContext: "user-controlled",
        supportedChains,
      }
    );
  }, [walletClient]);

  /**
   * Swap two Arc Testnet tokens (USDC, EURC, cirBTC).
   * Triggers a wallet confirmation popup and executes a real on-chain swap.
   */
  const swap = useCallback(
    async (params: {
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
    }): Promise<SwapResult> => {
      const kit = getAppKit();
      const adapter = await buildAdapter();

      // @ts-ignore — chain identifier string type
      const raw = await kit.swap({
        from: { adapter, chain: "Arc_Testnet" },
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
      });

      // @ts-ignore — result shape from Circle SDK
      const r = raw?.result ?? raw;
      return {
        txHash:     r.txHash      ?? "",
        explorerUrl: r.explorerUrl ?? `https://testnet.arcscan.app/tx/${r.txHash ?? ""}`,
        tokenIn:    r.tokenIn     ?? params.tokenIn,
        tokenOut:   r.tokenOut    ?? params.tokenOut,
        amountIn:   r.amountIn    ?? params.amountIn,
        amountOut:  r.amountOut   ?? "0",
        fees:       r.fees        ?? [],
      };
    },
    [buildAdapter]
  );

  /**
   * Bridge USDC cross-chain via Circle CCTP V2.
   * Triggers a wallet confirmation popup and executes a real CCTP bridge.
   * Waits for full attestation + minting on destination (typically 5–20 min).
   */
  const bridge = useCallback(
    async (params: {
      fromChain: CircleChainId;
      toChain: CircleChainId;
      amount: string;
      recipientAddress: string;
    }): Promise<BridgeResult> => {
      const kit = getAppKit();
      const adapter = await buildAdapter();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await (kit as any).bridge({
        from: { adapter, chain: params.fromChain as any },
        to: {
          chain: params.toChain as any,
          recipientAddress: params.recipientAddress,
        },
        amount: params.amount,
        token: "USDC",
      });

      // @ts-ignore — result shape from Circle SDK
      const r = raw?.result ?? raw;
      return {
        txHash:     r.txHash,
        explorerUrl: r.explorerUrl,
        fromChain:  r.fromChain  ?? params.fromChain,
        toChain:    r.toChain    ?? params.toChain,
        amount:     r.amount     ?? params.amount,
        progress:   r.progress   ?? { status: "DONE" },
      };
    },
    [buildAdapter]
  );

  return {
    swap,
    bridge,
    isReady: !!walletClient,
  };
}
