# Arc Builder Hub

A Web3 toolkit for builders on the Arc Layer 1 testnet. Connect your wallet, deploy ERC20 tokens, and explore the Arc ecosystem — all from one place.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `VITE_WALLETCONNECT_PROJECT_ID` — WalletConnect project ID (falls back to "placeholder")

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/arc-builder-hub/`)
- API: Express 5 (`artifacts/api-server/`)
- DB: PostgreSQL + Drizzle ORM
- Web3: wagmi v2, viem, ethers v6, RainbowKit v2
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/arc-builder-hub/src/` — React frontend
  - `src/components/ui/` — Navbar, Hero, Footer, ComingSoon
  - `src/components/wallet/` — WalletDashboard
  - `src/components/tools/` — ERC20Deployer
  - `src/lib/` — wagmiConfig, Providers, arcNetwork, walletContext, erc20
- `artifacts/api-server/` — Express backend (minimal, no DB routes needed)
- `lib/db/src/schema/` — Drizzle schema (empty, no DB used by this app)

## Architecture decisions

- Pure client-side app; no API routes needed (all Web3 calls go direct to RPC)
- wagmi v2 + RainbowKit v2 for wallet connection
- Arc Testnet chain ID 5042002, native currency USDC
- `ssr: false` in wagmiConfig (Vite CSR, not Next.js SSR)
- NEXT_PUBLIC_ env vars replaced with VITE_ prefix

## Product

Users can:
1. Connect their Web3 wallet (MetaMask, Rabby, Coinbase, OKX, Trust)
2. View their Arc Testnet wallet balance and address
3. Deploy ERC20 tokens to Arc Testnet in seconds
4. Add Arc Testnet to their wallet with one click
5. See the roadmap of coming tools (NFT Minter, Faucet Checker, Contract Interaction, Multi-Send)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- wagmi version must be ^2.x (not v3+) to match @rainbow-me/rainbowkit ^2.2.11
- The ERC20 deployer uses ethers v6 ContractFactory with inline bytecode
- `style jsx` is Next.js-only; shimmer animation is defined in index.css instead

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
