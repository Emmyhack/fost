'use client';

export default function NFTSDKPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Build an NFT SDK</h1>
      <p className="text-lg text-gray-600 mb-8">
        Create a complete SDK for NFT operations: minting, transferring, and querying
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            NFT SDKs provide interfaces for interacting with ERC-721 and ERC-1155 smart contracts. This guide covers building an SDK that supports minting, burning, transfers, and metadata queries.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Understanding NFT Standards</h2>
          <div className="space-y-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">ERC-721 (NFT Standard)</p>
              <p className="text-sm text-gray-600 mb-2">Unique, non-fungible tokens. Each token has a unique ID and ownership. Used for: art, collectibles, domain names.</p>
              <p className="text-xs text-gray-500 font-mono">ERC-721 token standard</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">ERC-1155 (Multi-Token Standard)</p>
              <p className="text-sm text-gray-600 mb-2">Multiple tokens in one contract. Can be fungible or non-fungible. Used for: game items, collections.</p>
              <p className="text-xs text-gray-500 font-mono">ERC-1155 multi-token standard</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 1: Get the NFT Contract ABI</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Visit <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Etherscan</a> and search for an NFT contract</li>
            <li>Example: Bored Ape Yacht Club <code className="bg-gray-100 px-2 py-1 rounded text-xs">0xBC4CA0EdA7647A8aB7C8067547B231758520db8a</code></li>
            <li>Click "Contract" → "Code"</li>
            <li>Copy the ABI JSON (or find it on OpenZeppelin)</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 2: Generate NFT SDK</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Open <a href="/platform/dashboard" className="text-accent-green hover:underline">FOST Dashboard</a></li>
            <li>Toggle "Web3 Smart Contract"</li>
            <li>Select "Ethereum" chain</li>
            <li>Paste your ERC-721 or ERC-1155 ABI</li>
            <li>Select "TypeScript"</li>
            <li>Generate</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 3: Common NFT Operations</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { NFTSDK } from './sdk';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const nft = new NFTSDK(signer);

// Query: Get NFT owner
const owner = await nft.ownerOf(1);
console.log('Owner of token #1:', owner);

// Query: Get balance
const balance = await nft.balanceOf(await signer.getAddress());
console.log('You own', balance, 'NFTs');

// Query: Get token metadata
const metadata = await nft.tokenURI(1);
console.log('Token metadata URI:', metadata);

// Transfer: Send NFT to another address
const recipient = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE0';
const tx = await nft.safeTransferFrom(
  await signer.getAddress(),
  recipient,
  1 // token ID
);
console.log('Transfer hash:', tx.hash);
await tx.wait();
console.log('Transfer completed!');

// Mint: Create new NFT (if you own the contract)
const mintTx = await nft.mint(
  await signer.getAddress(),
  'https://ipfs.io/ipfs/QmExample/metadata.json'
);
console.log('Mint hash:', mintTx.hash);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 4: Advanced Features</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Listen for Transfer events
const filter = nft.filters.Transfer();
nft.on(filter, (from, to, tokenId, event) => {
  console.log(\`NFT #\${tokenId} transferred from \${from} to \${to}\`);
});

// Query historical transfers
const transfers = await nft.queryFilter(
  nft.filters.Transfer(null, await signer.getAddress()),
  blockStart,
  blockEnd
);
console.log('You received', transfers.length, 'NFTs');

// Check if address has approval
const isApproved = await nft.isApprovedForAll(
  userAddress,
  operatorAddress
);

// Set approval for all (enable marketplace trading)
if (!isApproved) {
  const approveTx = await nft.setApprovalForAll(
    marketplaceAddress,
    true
  );
  await approveTx.wait();
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 5: Build a Gallery Component</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { useEffect, useState } from 'react';
import { NFTSDK } from './sdk';

export function NFTGallery({ contractAddress }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNFTs() {
      const nft = new NFTSDK(contractAddress);
      const userAddress = await signer.getAddress();
      const balance = await nft.balanceOf(userAddress);
      
      const myNFTs = [];
      for (let i = 0; i < balance; i++) {
        const tokenId = await nft.tokenOfOwnerByIndex(userAddress, i);
        const metadataURI = await nft.tokenURI(tokenId);
        
        // Fetch metadata from IPFS or URL
        const response = await fetch(
          metadataURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
        );
        const metadata = await response.json();
        
        myNFTs.push({
          id: tokenId.toString(),
          name: metadata.name,
          image: metadata.image,
          description: metadata.description
        });
      }
      
      setNfts(myNFTs);
      setLoading(false);
    }

    fetchNFTs();
  }, []);

  if (loading) return <p>Loading NFTs...</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <div key={nft.id} className="border rounded-lg p-4">
          <img src={nft.image} alt={nft.name} />
          <h3>{nft.name}</h3>
          <p>{nft.description}</p>
        </div>
      ))}
    </div>
  );
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Cache metadata:</strong> Don't fetch metadata repeatedly from IPFS</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Handle IPFS gateways:</strong> Have fallback gateways for reliability</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Verify ownership:</strong> Always check ownership before showing transfer UI</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use safe transfers:</strong> Prefer safeTransferFrom to prevent stuck NFTs</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Batch operations:</strong> Use multicall for multiple reads in one transaction</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Related Guides</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="/docs/guides/defi-sdk" className="text-accent-green hover:underline">Build a DeFi SDK</a></li>
            <li><a href="/docs/web3/event-subscriptions" className="text-accent-green hover:underline">Event Subscriptions</a></li>
            <li><a href="/docs/web3/wallet-integration" className="text-accent-green hover:underline">Wallet Integration</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
