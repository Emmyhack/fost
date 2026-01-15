/**
 * SDK Generation Service
 * Handles SDK generation requests and Web3 support
 */

export interface Web3Config {
  chainId: number;
  contractAddress: string;
  contractName: string;
  abiJson: string;
}

export interface SDKGenerationRequest {
  id: string;
  userId: string;
  projectName: string;
  apiSpec: string;
  targetLanguages: string[];
  web3Config?: Web3Config;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  outputUrl?: string;
  error?: string;
}

export async function generateSDK(request: SDKGenerationRequest): Promise<string> {
  const response = await fetch('/api/sdk/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectName: request.projectName,
      apiSpec: request.apiSpec,
      targetLanguages: request.targetLanguages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate SDK: ${response.statusText}`);
  }

  const data = await response.json();
  return data.downloadUrl || data.id;
}

export async function generateWeb3SDK(config: Web3Config, languages: string[]): Promise<string> {
  const response = await fetch('/api/sdk/generate-web3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chainId: config.chainId,
      contractAddress: config.contractAddress,
      contractName: config.contractName,
      abiJson: config.abiJson,
      targetLanguages: languages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate Web3 SDK: ${response.statusText}`);
  }

  const data = await response.json();
  return data.downloadUrl || data.id;
}

export async function getGenerationHistory(userId: string): Promise<SDKGenerationRequest[]> {
  try {
    const response = await fetch(`/api/user/generation-history?userId=${userId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function getGenerationStatus(generationId: string): Promise<SDKGenerationRequest> {
  try {
    const response = await fetch(`/api/sdk/status/${generationId}`);
    if (!response.ok) throw new Error('Failed to fetch status');
    return await response.json();
  } catch {
    return {
      id: generationId,
      userId: '',
      projectName: '',
      apiSpec: '',
      targetLanguages: [],
      status: 'failed',
      createdAt: new Date(),
      error: 'Failed to fetch status',
    };
  }
}
