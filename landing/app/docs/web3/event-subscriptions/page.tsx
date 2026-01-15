'use client';

export default function EventSubscriptionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Event Subscriptions</h1>
      <p className="text-lg text-gray-600 mb-8">
        Listen to blockchain events in real-time
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">What Are Events?</h2>
          <p className="text-gray-700 mb-4">
            Smart contract events are logs emitted when important actions occur (transfers, approvals, swaps, etc.). Your generated SDK lets you listen to these events.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Subscribing to Events</h2>
          <p className="text-gray-700 mb-4">Listen to contract events in real-time:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { MyContractSDK } from './sdk';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const sdk = new MyContractSDK(provider);

// Listen for Transfer events
sdk.on('Transfer', (from, to, value) => {
  console.log(\`Transfer: \${from} -> \${to}: \${value}\`);
});

// Listen for Approval events
sdk.on('Approval', (owner, spender, value) => {
  console.log(\`Approval: \${owner} approved \${spender}: \${value}\`);
});

// Stop listening
sdk.off('Transfer');`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Filtering Events</h2>
          <p className="text-gray-700 mb-4">Filter events by parameters:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Listen for transfers FROM a specific address
sdk.on('Transfer', 
  { from: '0xSpecificAddress' },
  (from, to, value) => {
    console.log(\`Transfer from specific address: \${value}\`);
  }
);

// Listen for transfers TO a specific address
sdk.on('Transfer',
  { to: userAddress },
  (from, to, value) => {
    console.log(\`You received: \${value}\`);
  }
);

// Multiple filters
sdk.on('Transfer',
  { 
    from: '0xAddress1',
    to: '0xAddress2'
  },
  (from, to, value) => {
    console.log('Specific transfer detected');
  }
);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Historical Events</h2>
          <p className="text-gray-700 mb-4">Query past events:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Get all Transfer events in last 1000 blocks
const events = await sdk.getEvents('Transfer', {
  fromBlock: -1000,
  toBlock: 'latest'
});

events.forEach(event => {
  console.log(\`Transfer: \${event.from} -> \${event.to}: \${event.value}\`);
});

// Get filtered historical events
const userTransfers = await sdk.getEvents('Transfer', {
  fromBlock: -1000,
  toBlock: 'latest',
  filters: {
    to: userAddress
  }
});

console.log(\`Received \${userTransfers.length} transfers\`);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Real-Time Monitoring</h2>
          <p className="text-gray-700 mb-4">Build applications that react to blockchain events:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Portfolio tracker that updates on transfers
export function PortfolioMonitor() {
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const sdk = new ERC20SDK(provider);

    // Listen for any transfer event
    sdk.on('Transfer', async (from, to, value) => {
      // Update balance
      const newBalance = await sdk.balanceOf(userAddress);
      setBalance(newBalance);
      
      // Show notification
      if (to === userAddress) {
        showNotification(\`You received \${value}\`);
      }
    });

    return () => sdk.off('Transfer');
  }, []);

  return <div>Balance: {balance}</div>;
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Common Patterns</h2>
          <div className="space-y-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Price Monitoring</p>
              <p className="text-sm text-gray-600">Listen to swap events to track price changes</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Portfolio Tracking</p>
              <p className="text-sm text-gray-600">Listen to transfer events to update balances</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Voting Monitor</p>
              <p className="text-sm text-gray-600">Listen to vote events in DAO governance</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Order Book</p>
              <p className="text-sm text-gray-600">Listen to order creation and fills</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="font-bold mb-2">Events not firing</p>
              <p className="text-sm text-gray-700">Make sure you're listening to the correct event name (case-sensitive)</p>
            </div>
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="font-bold mb-2">Missed events</p>
              <p className="text-sm text-gray-700">Query historical events first, then subscribe to new ones</p>
            </div>
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="font-bold mb-2">Performance issues</p>
              <p className="text-sm text-gray-700">Filter events to reduce processing overhead</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
