'use client';

import { useState, useRef } from 'react';
import { generateSDK, generateWeb3SDK } from '../api/sdk-service';
import { WalletConnect } from './wallet-connect';
import { useWeb3 } from '../auth/web3-context';
import { useToast } from '../auth/toast-context';
import { LoadingSpinner } from './loading-spinner';

export function SDKGeneratorForm() {
  const { address, chainId } = useWeb3();
  const { addToast } = useToast();
  const [projectName, setProjectName] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['typescript']);
  const [isWeb3, setIsWeb3] = useState(false);
  const [contractAddress, setContractAddress] = useState('');
  const [selectedChainId, setSelectedChainId] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    'typescript',
    'python',
    'go',
    'java',
    'csharp',
    'rust',
    'swift',
    'kotlin',
  ];

  const chains = [
    { id: '1', name: 'Ethereum', symbol: 'ETH' },
    { id: '137', name: 'Polygon', symbol: 'MATIC' },
    { id: '42161', name: 'Arbitrum', symbol: 'ARB' },
    { id: '10', name: 'Optimism', symbol: 'OP' },
    { id: '56', name: 'BSC', symbol: 'BNB' },
  ];

  const handleLanguageToggle = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const validateFile = (file: File): boolean => {
    const validMimeTypes = [
      'application/json',
      'text/plain',
      'application/x-yaml',
      'text/yaml',
    ];
    const validExtensions = ['.json', '.yaml', '.yml', '.txt'];

    const hasValidMime = validMimeTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.endsWith(ext));

    if (!hasValidMime && !hasValidExtension) {
      setFileError('Please upload a JSON or YAML file (ABI or OpenAPI spec)');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setFileError('File size must be less than 5MB');
      return false;
    }

    setFileError('');
    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (validateFile(file)) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleGenerate = async () => {
    if (!projectName || selectedLanguages.length === 0) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    if (!isWeb3 && !uploadedFile) {
      addToast('Please upload an OpenAPI specification file', 'warning');
      return;
    }

    if (isWeb3 && !contractAddress) {
      addToast('Please enter a contract address', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      if (isWeb3 && contractAddress) {
        // Web3 SDK generation
        await generateWeb3SDK(
          {
            chainId: parseInt(selectedChainId),
            contractAddress,
            contractName: projectName,
            abiJson: '{}', // Will be fetched from Etherscan in next task
          },
          selectedLanguages
        );
        addToast('Web3 SDK generation started!', 'success');
      } else if (uploadedFile) {
        // Regular API SDK generation
        const fileContent = await uploadedFile.text();
        await generateSDK({
          id: 'gen_' + Date.now(),
          userId: 'current_user',
          projectName,
          apiSpec: fileContent,
          targetLanguages: selectedLanguages,
          status: 'processing',
          createdAt: new Date(),
        });
        addToast('REST API SDK generation started!', 'success');
      }
    } catch (error) {
      addToast(`Error generating SDK: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-6 text-xl font-bold font-mono">Generate SDK</h2>

      {/* Project Name */}
      <div className="mb-6">
        <label className="block text-sm font-mono font-semibold text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g., my-api-sdk"
          className="mt-2 w-full rounded border border-gray-300 px-4 py-2 font-mono text-sm focus:border-accent-green focus:outline-none"
        />
      </div>

      {/* SDK Type Toggle */}
      <div className="mb-6 flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isWeb3}
            onChange={(e) => setIsWeb3(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          <span className="font-mono text-sm font-semibold">Web3 Smart Contract</span>
        </label>
      </div>

      {/* File Upload Section - Only show for REST API mode */}
      {!isWeb3 && (
        <div className="mb-6">
          <label className="block text-sm font-mono font-semibold text-gray-700 mb-3">
            API Specification (OpenAPI/Swagger)
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded border-2 border-dashed p-6 text-center transition ${
              isDragging
                ? 'border-accent-green bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.yaml,.yml,.txt"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            {uploadedFile ? (
              <>
                <div className="mb-2 text-accent-green">✓</div>
                <p className="font-mono text-sm font-semibold text-accent-green">
                  {uploadedFile.name}
                </p>
                <p className="mt-1 text-xs text-gray-600 font-mono">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="mt-3 text-xs text-gray-600 hover:text-gray-800 font-mono underline"
                >
                  Clear file
                </button>
              </>
            ) : (
              <>
                <p className="mb-1 text-sm font-mono font-semibold text-gray-700">
                  Drag & drop your OpenAPI spec or click to browse
                </p>
                <p className="text-xs text-gray-600 font-mono">
                  Supported formats: JSON, YAML (max 5MB)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-sm text-accent-green hover:underline font-mono font-semibold"
                >
                  Select File
                </button>
              </>
            )}
          </div>
          {fileError && (
            <p className="mt-2 text-xs text-red-600 font-mono">{fileError}</p>
          )}
        </div>
      )}

      {/* Web3 Config */}
      {isWeb3 && (
        <div className="mb-6 space-y-4 rounded bg-green-50 p-4">
          <div>
            <label className="block text-sm font-mono font-semibold text-gray-700">
              Chain
            </label>
            <select
              value={selectedChainId}
              onChange={(e) => setSelectedChainId(e.target.value)}
              className="mt-2 w-full rounded border border-gray-300 px-4 py-2 font-mono text-sm focus:border-accent-green focus:outline-none"
            >
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name} ({chain.symbol})
                </option>
              ))}
            </select>
            {chainId && chainId !== parseInt(selectedChainId) && (
              <p className="mt-2 text-xs text-orange-600 font-mono">
                ⚠️ Wallet connected to {chains.find(c => c.id === chainId.toString())?.name}, switch to generate
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-mono font-semibold text-gray-700">
              Contract Address
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="mt-2 w-full rounded border border-gray-300 px-4 py-2 font-mono text-sm focus:border-accent-green focus:outline-none"
            />
          </div>

          {address && (
            <div className="rounded bg-white p-3 text-xs font-mono text-gray-600">
              <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
              <p>Chain: {chains.find(c => c.id === chainId?.toString())?.name || 'Unknown'}</p>
            </div>
          )}

          <p className="text-xs text-gray-600 font-mono">
            Features: Wallet integration • Gas estimation • Event subscriptions • Multi-chain support
          </p>
        </div>
      )}

      {/* Target Languages */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-mono font-semibold text-gray-700">
          Target Languages
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageToggle(lang)}
              className={`rounded border-2 px-4 py-2 font-mono text-sm font-semibold transition ${
                selectedLanguages.includes(lang)
                  ? 'border-accent-green bg-green-50 text-accent-green'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full rounded bg-accent-green px-6 py-3 font-mono font-bold text-white hover:bg-accent-green-dark disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating && <LoadingSpinner size="sm" />}
        {isGenerating ? 'Generating...' : 'Generate SDK'}
      </button>
    </div>
  );
}
