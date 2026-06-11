// src/lib/arcNetwork.ts

export const ARC_TESTNET = {
  chainId: "0x4CE012", // 5038098 decimal
  chainIdDecimal: 5038098,
  chainName: "Arc Testnet",
  rpcUrls: ["https://rpc.testnet.arc.network"],
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  blockExplorerUrls: ["https://testnet.arcscan.app"],
};

export async function switchToArcTestnet(): Promise<{ success: boolean; error?: string }> {
  if (!window.ethereum) {
    return { success: false, error: "MetaMask not detected" };
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_TESTNET.chainId }],
    });
    return { success: true };
  } catch (switchError: unknown) {
    // Error code 4902 = chain not added yet
    if ((switchError as { code?: number }).code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: ARC_TESTNET.chainId,
              chainName: ARC_TESTNET.chainName,
              rpcUrls: ARC_TESTNET.rpcUrls,
              nativeCurrency: ARC_TESTNET.nativeCurrency,
              blockExplorerUrls: ARC_TESTNET.blockExplorerUrls,
            },
          ],
        });
        return { success: true };
      } catch (addError: unknown) {
        return { success: false, error: (addError as Error).message };
      }
    }
    return { success: false, error: (switchError as Error).message };
  }
}

export function isArcTestnet(chainId: number | null): boolean {
  return chainId === ARC_TESTNET.chainIdDecimal;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getExplorerTxUrl(txHash: string): string {
  return `${ARC_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${ARC_TESTNET.blockExplorerUrls[0]}/address/${address}`;
}
