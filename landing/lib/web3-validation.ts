/**
 * Web3 and RPC validation utilities
 */

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrls: string[];
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const SUPPORTED_CHAINS: { [key: number]: ChainConfig } = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrls: ['https://eth.publicnode.com', 'https://rpc.ankr.com/eth'],
    blockExplorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    rpcUrls: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon'],
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR-PROJECT-ID', 'https://rpc.ankr.com/eth_sepolia'],
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  },
  80002: {
    chainId: 80002,
    name: 'Polygon Mumbai Testnet',
    rpcUrls: ['https://rpc-mumbai.maticvigil.com', 'https://rpc.ankr.com/polygon_mumbai'],
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
  },
};

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Validate RPC endpoint connectivity
 */
export async function validateRpcEndpoint(rpcUrl: string): Promise<boolean> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    return !data.error;
  } catch (error) {
    return false;
  }
}

/**
 * Get chain configuration
 */
export function getChainConfig(chainId: number): ChainConfig | null {
  return SUPPORTED_CHAINS[chainId] || null;
}

/**
 * Get recommended RPC URL for a chain
 */
export function getRecommendedRpcUrl(chainId: number): string | null {
  const config = SUPPORTED_CHAINS[chainId];
  return config ? config.rpcUrls[0] : null;
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Convert chain ID to hex format (for eth_chainId)
 */
export function chainIdToHex(chainId: number): string {
  return '0x' + chainId.toString(16);
}

/**
 * Convert hex chain ID to number
 */
export function hexToChainId(hex: string): number {
  return parseInt(hex, 16);
}

/**
 * Validate MetaMask provider
 */
export function isValidEthereumProvider(provider: any): boolean {
  return (
    provider &&
    typeof provider === 'object' &&
    typeof provider.request === 'function' &&
    (typeof provider.on === 'function' || typeof provider.addEventListener === 'function')
  );
}
