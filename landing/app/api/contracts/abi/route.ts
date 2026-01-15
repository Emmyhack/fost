import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

// Etherscan API keys for different chains
const ETHERSCAN_APIS: { [chainId: number]: { baseURL: string; apiKey: string } } = {
  1: {
    baseURL: 'https://api.etherscan.io/api',
    apiKey: process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken',
  },
  137: {
    baseURL: 'https://api.polygonscan.com/api',
    apiKey: process.env.POLYGONSCAN_API_KEY || 'YourApiKeyToken',
  },
  42161: {
    baseURL: 'https://api.arbiscan.io/api',
    apiKey: process.env.ARBISCAN_API_KEY || 'YourApiKeyToken',
  },
  10: {
    baseURL: 'https://api-optimistic.etherscan.io/api',
    apiKey: process.env.OPTIMISM_API_KEY || 'YourApiKeyToken',
  },
  56: {
    baseURL: 'https://api.bscscan.com/api',
    apiKey: process.env.BSCSCAN_API_KEY || 'YourApiKeyToken',
  },
};

interface FetchABIRequest {
  contractAddress: string;
  chainId: number;
}

/**
 * Validate Ethereum address format
 */
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Fetch ABI from Etherscan-like API
 */
async function fetchFromEtherscan(
  chainId: number,
  contractAddress: string
): Promise<string> {
  const config = ETHERSCAN_APIS[chainId];

  if (!config) {
    throw new Error(`Chain ID ${chainId} not supported`);
  }

  const url = new URL(config.baseURL);
  url.searchParams.append('module', 'contract');
  url.searchParams.append('action', 'getAbi');
  url.searchParams.append('address', contractAddress);
  url.searchParams.append('apikey', config.apiKey);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check for Etherscan API errors
    if (data.status === '0' || data.status === 0) {
      throw new Error(data.message || 'Contract ABI not found');
    }

    // Parse the ABI if it's a string
    const abi = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;

    return JSON.stringify(abi, null, 2);
  } catch (error) {
    throw new Error(`Failed to fetch ABI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fallback: Generate a generic ABI if Etherscan fails
 */
function generateGenericABI(contractName: string): string {
  const genericABI = [
    {
      inputs: [],
      name: 'constructor',
      type: 'constructor',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      name: 'transfer',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  return JSON.stringify(genericABI, null, 2);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { contractAddress, chainId } = (await request.json()) as FetchABIRequest;

    if (!contractAddress || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: contractAddress, chainId' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!isValidEthereumAddress(contractAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    try {
      const abi = await fetchFromEtherscan(chainId, contractAddress);
      return NextResponse.json({
        success: true,
        abi,
        source: 'etherscan',
      });
    } catch (etherscanError) {
      console.warn('Etherscan fetch failed:', etherscanError);

      // Fallback: Return generic ABI
      const genericABI = generateGenericABI('SmartContract');
      return NextResponse.json({
        success: true,
        abi: genericABI,
        source: 'generic',
        warning: 'Could not fetch from Etherscan, using generic ABI template',
      });
    }
  } catch (error) {
    console.error('ABI fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract ABI' },
      { status: 500 }
    );
  }
}
