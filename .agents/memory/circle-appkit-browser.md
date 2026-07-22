---
name: Circle App Kit browser integration
description: How to use @circle-fin/app-kit in a Vite browser app with wagmi/RainbowKit wallets
---

# Circle App Kit — Browser / Vite Integration

## Rule
`@circle-fin/app-kit` uses Node.js `Buffer` which is not available in browsers. Always add `vite-plugin-node-polyfills` with globals enabled **and** clear the Vite deps cache when first adding Circle SDK packages.

**Why:** The package bundles code that calls `Buffer` directly. Vite externalizes `buffer` by default, causing `ReferenceError: Buffer is not defined` at runtime. The plugin injects the polyfill into the pre-bundled deps.

## How to apply
In `vite.config.ts`:
```typescript
import { nodePolyfills } from "vite-plugin-node-polyfills";
// In plugins array, BEFORE react():
nodePolyfills({ globals: { Buffer: true, global: true, process: true }, protocolImports: true }),
```
Install: `pnpm add -D vite-plugin-node-polyfills`
Clear cache: `rm -rf node_modules/.vite` then restart workflow.

## Adapter pattern (wagmi + Circle Kit)
The viem adapter works in the browser via wagmi's `useConnectorClient()`. The `getWalletClient` callback returns the wagmi WalletClient (triggers MetaMask popup when the SDK calls `sendTransaction`).

```typescript
import { ViemAdapter } from "@circle-fin/adapter-viem-v2";
import { useConnectorClient } from "wagmi";

const { data: walletClient } = useConnectorClient();
const supportedChains = await appKit.getSupportedChains(); // cache this

const adapter = new ViemAdapter(
  {
    getPublicClient: ({ chain }) => createPublicClient({ chain, transport: http(ARC_RPC) }),
    getWalletClient: () => walletClient, // cast as any — wagmi WC is compatible
  },
  { addressContext: "user-controlled", supportedChains }
);
```

## Chain identifiers (Circle SDK format)
- `"Arc_Testnet"` — confirmed in docs
- `"Ethereum_Sepolia"`, `"Avalanche_Fuji"`, `"Base_Sepolia"`, `"OP_Sepolia"`, `"Arbitrum_Sepolia"`, `"Polygon_PoS_Amoy"` — follow the underscore pattern

## Arc Testnet Swap supported tokens
USDC, EURC, cirBTC only. WETH is NOT supported for swap on Arc Testnet.

## Kit key
Optional. Without it: rate-limited. With it: production-grade. Source: console.circle.com → API Keys → Kit Keys. Store as `VITE_CIRCLE_KIT_KEY`.

## TypeScript
Circle SDK chain types require `as any` casts throughout. This is expected per the migration guide's "use @ts-ignore to keep moving" guidance.
