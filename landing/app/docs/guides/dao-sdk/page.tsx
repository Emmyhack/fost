'use client';

export default function DAOSDKPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Build a DAO SDK</h1>
      <p className="text-lg text-gray-600 mb-8">
        Create an SDK for decentralized autonomous organizations
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">What is a DAO?</h2>
          <p className="text-gray-700 mb-4">
            A Decentralized Autonomous Organization (DAO) is a smart contract-based organization where members vote on proposals and decisions are executed automatically on-chain. Common types include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>Governance DAOs:</strong> Protocol governance (Uniswap, MakerDAO)</li>
            <li><strong>Social DAOs:</strong> Community-driven organizations</li>
            <li><strong>Investment DAOs:</strong> Collective investment pools</li>
            <li><strong>Service DAOs:</strong> Task and service coordination</li>
            <li><strong>Protocol DAOs:</strong> Running blockchain services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Core DAO Contracts</h2>
          <div className="space-y-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Governor Contract</p>
              <p className="text-sm text-gray-600 mb-2">Manages proposals, voting, and execution</p>
              <p className="text-xs text-gray-500 font-mono">OpenZeppelin's Governor or Compound Bravo</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Token Contract (ERC-20)</p>
              <p className="text-sm text-gray-600 mb-2">Governance token representing voting power</p>
              <p className="text-xs text-gray-500 font-mono">Usually held by members for voting rights</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Timelock Contract</p>
              <p className="text-sm text-gray-600 mb-2">Delays execution for security</p>
              <p className="text-xs text-gray-500 font-mono">Gives community time to react to proposals</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Treasury Contract</p>
              <p className="text-sm text-gray-600 mb-2">Holds and manages DAO funds</p>
              <p className="text-xs text-gray-500 font-mono">Can only be accessed by approved proposals</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 1: Get Governor ABI</h2>
          <p className="text-gray-700 mb-4">
            Use OpenZeppelin's Governor contract or a DAO's existing Governor:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Find the Governor contract address on Etherscan or docs</li>
            <li>Copy the ABI (or use <code className="bg-gray-100 px-1">OpenZeppelin Governor</code> ABI)</li>
            <li>Generate SDK using FOST</li>
          </ol>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Example: Uniswap Governor contract
// https://etherscan.io/address/0x408ED6354d4973f66138C91495F2f2FCbd8CD159

import { UNI_GOVERNOR } from './contracts';

const governorAddress = '0x408ED6354d4973f66138C91495F2f2FCbd8CD159';
const tokenAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'; // UNI`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 2: Generate DAO SDK</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Go to <a href="/platform/dashboard" className="text-accent-green hover:underline">FOST Dashboard</a></li>
            <li>Toggle "Web3 Smart Contract"</li>
            <li>Select Chain: "Ethereum"</li>
            <li>Paste Governor ABI</li>
            <li>Select TypeScript</li>
            <li>Generate</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 3: Core SDK Methods</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { GovernorSDK } from './sdk';
import { BrowserProvider, parseEther } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const governor = new GovernorSDK(signer);

// Query voting power
const votingPower = await governor.getVotes(
  await signer.getAddress(),
  'latest'
);
console.log('Your voting power:', votingPower.toString());

// Get proposal state
const proposalState = await governor.state(proposalId);
// Returns: Pending, Active, Canceled, Defeated, Succeeded, Queued, Expired, Executed

// Cast a vote
const castVoteTx = await governor.castVote(
  proposalId,
  1 // 0 = Against, 1 = For, 2 = Abstain
);
await castVoteTx.wait();

// Cast vote with reason
const castVoteWithReasonTx = await governor.castVoteWithReason(
  proposalId,
  1,
  'I support this proposal because...'
);

// Queue proposal for execution
const queueTx = await governor.queue(
  [targetAddress],           // Targets to call
  [0],                       // ETH values
  [encodedFunctionCall],     // Calldata
  descriptionHash            // Description hash
);

// Execute proposal
const executeTx = await governor.execute(
  [targetAddress],
  [0],
  [encodedFunctionCall],
  descriptionHash
);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 4: Create a Proposal</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { ethers } from 'ethers';
import { GovernorSDK } from './sdk';

async function createProposal(
  governor: GovernorSDK,
  description: string
) {
  // Encode function calls (what the proposal does)
  const iface = new ethers.Interface([
    'function transfer(address to, uint256 amount)'
  ]);
  
  const calldata = iface.encodeFunctionData('transfer', [
    '0xRecipient',
    ethers.parseEther('100')
  ]);
  
  // Create proposal
  const proposeTx = await governor.propose(
    [treasuryAddress],     // Target contracts
    [0],                   // ETH values
    [calldata],            // Function calls
    description            // Proposal description
  );
  
  const receipt = await proposeTx.wait();
  const proposalId = receipt.logs[0].topics[1]; // Extract proposal ID
  
  console.log('Proposal created:', proposalId);
  
  return proposalId;
}

// Usage
const proposal = await createProposal(
  governor,
  'Proposal #123: Transfer 100 tokens to development fund'
);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 5: Complete Example: Voting Dashboard</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { useState, useEffect } from 'react';
import { GovernorSDK } from './sdk';

interface Proposal {
  id: string;
  title: string;
  state: string;
  votesFor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  startBlock: number;
  endBlock: number;
}

export function DAO() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votingPower, setVotingPower] = useState('0');

  useEffect(() => {
    async function load() {
      const governor = new GovernorSDK(signer);
      
      // Get voting power
      const vp = await governor.getVotes(userAddress, 'latest');
      setVotingPower(vp.toString());
      
      // Get proposals
      const proposalFilter = governor.filters.ProposalCreated();
      const events = await governor.queryFilter(proposalFilter);
      
      const props = await Promise.all(
        events.map(async (event) => {
          const id = event.args.proposalId;
          const state = await governor.state(id);
          const votes = await governor.proposalVotes(id);
          
          return {
            id: id.toString(),
            title: event.args.description,
            state: ['Pending', 'Active', 'Canceled', 'Defeated',
                    'Succeeded', 'Queued', 'Expired', 'Executed'][state],
            votesFor: votes.forVotes,
            votesAgainst: votes.againstVotes,
            votesAbstain: votes.abstainVotes,
            startBlock: event.args.startBlock,
            endBlock: event.args.endBlock
          };
        })
      );
      
      setProposals(props);
    }
    
    load();
  }, []);

  async function castVote(proposalId: string, support: number) {
    const governor = new GovernorSDK(signer);
    const tx = await governor.castVote(proposalId, support);
    await tx.wait();
    alert('Vote cast!');
  }

  return (
    <div>
      <h1>DAO Voting Dashboard</h1>
      <p>Your voting power: {votingPower}</p>
      
      {proposals.map((prop) => (
        <div key={prop.id} className="proposal">
          <h3>{prop.title}</h3>
          <p>State: {prop.state}</p>
          <div>
            <span>For: {prop.votesFor.toString()}</span>
            <span>Against: {prop.votesAgainst.toString()}</span>
            <span>Abstain: {prop.votesAbstain.toString()}</span>
          </div>
          
          {prop.state === 'Active' && (
            <div>
              <button onClick={() => castVote(prop.id, 1)}>
                Vote For
              </button>
              <button onClick={() => castVote(prop.id, 0)}>
                Vote Against
              </button>
              <button onClick={() => castVote(prop.id, 2)}>
                Abstain
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Advanced Features</h2>
          <div className="space-y-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Vote Delegation</p>
              <p className="text-sm text-gray-600">Allow members to delegate voting power to others</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Vote Escrow (veTokenomics)</p>
              <p className="text-sm text-gray-600">Lock tokens for increased voting power</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Multi-Sig Timelock</p>
              <p className="text-sm text-gray-600">Require multiple signatures before execution</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Weighted Voting</p>
              <p className="text-sm text-gray-600">Different voting weights for different members</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Test on testnet:</strong> Pilot proposals before mainnet</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use timelocks:</strong> Delay execution for security</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Clear descriptions:</strong> Write detailed proposal descriptions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Encourage voting:</strong> Use incentives if needed</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Monitor quorum:</strong> Ensure enough participation</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Related Guides</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="/docs/guides/defi-sdk" className="text-accent-green hover:underline">Build a DeFi SDK</a></li>
            <li><a href="/docs/web3/wallet-integration" className="text-accent-green hover:underline">Wallet Integration</a></li>
            <li><a href="/docs/web3/event-subscriptions" className="text-accent-green hover:underline">Event Subscriptions</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
