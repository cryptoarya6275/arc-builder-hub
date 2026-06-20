---
name: ERC20 bytecode source
description: How the SimpleERC20 bytecode in erc20.ts was generated and how to regenerate it
---

# ERC20 Bytecode Source

## Rule
The bytecode in `artifacts/arc-builder-hub/src/lib/erc20.ts` was compiled from `/tmp/SimpleERC20.sol` using `solc@0.8.20` (installed as a dev dep in `@workspace/arc-builder-hub`). Never hand-write or truncate bytecode — the original files had both truncated/invalid bytecodes causing `missing revert data (action="estimateGas")`.

**Why:** Invalid/truncated EVM init code causes `estimateGas` to revert with no data before the constructor even runs, producing a confusing error with no actionable message.

**How to apply:** If the ERC20 contract needs to be changed, edit `/tmp/SimpleERC20.sol` (or recreate it), then compile:
```bash
cd artifacts/arc-builder-hub
node -e "
const solc = require('solc');
const fs = require('fs');
const src = fs.readFileSync('/tmp/SimpleERC20.sol', 'utf8');
const input = { language: 'Solidity', sources: { 'SimpleERC20.sol': { content: src } },
  settings: { optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } } };
const out = JSON.parse(solc.compile(JSON.stringify(input)));
const c = out.contracts['SimpleERC20.sol']['SimpleERC20'];
console.log('0x' + c.evm.bytecode.object);
"
```
Then paste the output into `SIMPLE_ERC20_BYTECODE` in `erc20.ts`.

## Deployer approach
`ERC20Deployer.tsx` uses wagmi v2 `useDeployContract` + `useWaitForTransactionReceipt` — no ethers `BrowserProvider`/`JsonRpcSigner` wrapper needed. ABI and bytecode are imported solely from `erc20.ts`.
