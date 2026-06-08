# ⚡ Arc Builder Hub

A simple, powerful toolkit for builders on the **Arc Layer 1 Testnet**.

Deploy ERC20 tokens, manage your wallet, and explore the Arc ecosystem — all in one clean dark-mode interface.

---

## 🔗 Arc Testnet Configuration

| Parameter | Value |
|-----------|-------|
| Chain Name | Arc Testnet |
| Chain ID | 5042002 |
| RPC URL | https://rpc.testnet.arc.network |
| Currency Symbol | USDC |
| Block Explorer | https://testnet.arcscan.app |

---

## ✨ Features (v1.0)

### ✅ Live
- **Wallet Connect** — MetaMask integration with auto-reconnect
- **Wallet Dashboard** — Balance display, address copy, Explorer link
- **Network Auto-Detect** — Shows "Switch to Arc Testnet" if on wrong chain
- **ERC20 Token Deployer** — Deploy standard ERC20 tokens in seconds

### 🔜 Coming Soon
- NFT Minter (ERC721 / ERC1155)
- Faucet Checker
- Contract Interaction Tool
- Multi-Send Tool

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask browser extension

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/arc-builder-hub.git
cd arc-builder-hub

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
arc-builder-hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with WalletProvider
│   │   └── page.tsx            # Main page
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Navbar.tsx      # Top navigation bar
│   │   │   ├── Hero.tsx        # Hero section
│   │   │   ├── ComingSoon.tsx  # Coming soon tools grid
│   │   │   └── Footer.tsx      # Site footer
│   │   ├── wallet/
│   │   │   └── WalletDashboard.tsx  # Wallet dashboard card
│   │   └── tools/
│   │       └── ERC20Deployer.tsx    # ERC20 deployment tool
│   ├── lib/
│   │   ├── arcNetwork.ts       # Arc chain config & helpers
│   │   ├── erc20.ts            # ERC20 ABI & bytecode
│   │   └── walletContext.tsx   # Wallet state & provider
│   └── styles/
│       └── globals.css         # Global styles + Tailwind
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── vercel.json
└── .env.example
```

---

## 🛠 Tech Stack

- **Next.js 15** — React framework with App Router
- **React 18** — UI library
- **Tailwind CSS 3** — Utility-first styling
- **ethers.js v6** — Ethereum/EVM interactions
- **TypeScript** — Type safety throughout

---

## 🌐 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/arc-builder-hub)

### Manual deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

No environment variables are required for basic deployment. All Arc network config is hardcoded in `src/lib/arcNetwork.ts`.

---

## 🔧 ERC20 Token Deployment

The deployer uses a pre-compiled standard ERC20 bytecode. When you click **Deploy Token**:

1. MetaMask prompts for confirmation
2. Contract is deployed to Arc Testnet
3. The full initial supply is minted to your wallet
4. A link to the block explorer is shown

**Token Parameters:**
- Name: Custom
- Symbol: Custom (uppercase)
- Decimals: 18 (fixed)
- Supply: Custom amount

---

## 📝 Adding Arc Testnet to MetaMask

The app will prompt you automatically. Or add manually:

1. Open MetaMask → Settings → Networks → Add Network
2. Fill in:
   - **Network Name:** Arc Testnet
   - **RPC URL:** https://rpc.testnet.arc.network
   - **Chain ID:** 5042002
   - **Currency Symbol:** USDC
   - **Block Explorer:** https://testnet.arcscan.app

---

## 📄 License

MIT — free to use, fork, and build upon.

---

Built for the **Arc builder community**. Contributions welcome.
