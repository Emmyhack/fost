'use client';

export default function PythonPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Python SDK Guide</h1>
      <p className="text-lg text-gray-600 mb-8">
        Using FOST-generated SDKs in Python with type hints
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Python for Web3?</h2>
          <ul className="space-y-3 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Data Science:</strong> Perfect for analytics and trading bots</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Scripting:</strong> Quick automation and testing</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>ML Integration:</strong> Use with TensorFlow, PyTorch, scikit-learn</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Async Support:</strong> asyncio for concurrent operations</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`# Install Python SDK
pip install @sdk-name-python

# or with specific version
pip install @sdk-name-python==1.0.0

# with extras
pip install @sdk-name-python[web3]

# Install web3.py for Ethereum interaction
pip install web3`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`from sdk import MyContractSDK
from web3 import Web3

# Connect to Ethereum
w3 = Web3(Web3.HTTPProvider('https://eth.llamarpc.com'))

# Initialize SDK
sdk = MyContractSDK(w3)

# Query contract state
balance = sdk.balance_of('0xUser')
print(f'Balance: {balance}')

# Send transaction
tx_hash = sdk.transfer(
    to='0xRecipient',
    amount=1000000000000000000  # 1 token
)
print(f'Transaction: {tx_hash.hex()}')

# Wait for confirmation
receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print(f'Confirmed: {receipt["status"]}')`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Type Hints</h2>
          <p className="text-gray-700 mb-4">
            Python SDKs include type hints for better IDE support:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`from typing import Dict, Optional
from sdk import MyContractSDK
from eth_account import Account

class WalletManager:
    """Manages token operations with type hints"""
    
    sdk: MyContractSDK
    account: Account

    def __init__(self, sdk: MyContractSDK, account: Account):
        self.sdk = sdk
        self.account = account

    def get_balance(self, address: str) -> int:
        """Get token balance for an address"""
        return self.sdk.balance_of(address)

    def transfer(
        self, 
        to_address: str, 
        amount: int
    ) -> str:
        """Transfer tokens and return transaction hash"""
        tx_hash = self.sdk.transfer(to_address, amount)
        return tx_hash.hex()

    def get_allowance(
        self, 
        owner: str, 
        spender: str
    ) -> Optional[int]:
        """Get token allowance"""
        try:
            return self.sdk.allowance(owner, spender)
        except Exception as e:
            print(f'Error: {e}')
            return None`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Async Operations</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import asyncio
from sdk.async_client import AsyncMyContractSDK

async def fetch_multiple_balances(
    sdk: AsyncMyContractSDK,
    addresses: list[str]
) -> dict[str, int]:
    """Fetch balances for multiple addresses concurrently"""
    
    tasks = [
        sdk.balance_of(address)
        for address in addresses
    ]
    
    balances = await asyncio.gather(*tasks)
    
    return dict(zip(addresses, balances))

async def main():
    sdk = AsyncMyContractSDK('https://eth.llamarpc.com')
    
    addresses = [
        '0x1234...',
        '0x5678...',
        '0xABCD...'
    ]
    
    # Fetch all balances concurrently
    results = await fetch_multiple_balances(sdk, addresses)
    
    for address, balance in results.items():
        print(f'{address}: {balance}')

# Run async code
asyncio.run(main())`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`from web3.exceptions import (
    BlockNotFound,
    InvalidAddress,
    TransactionNotFound
)
from sdk.exceptions import InsufficientBalance

def safe_transfer(
    sdk: MyContractSDK,
    to_address: str,
    amount: int
) -> bool:
    """Safely transfer tokens with error handling"""
    
    try:
        # Validate address
        if not Web3.is_address(to_address):
            raise InvalidAddress(f'{to_address} is not valid')
        
        # Check balance
        balance = sdk.balance_of(sdk.account.address)
        if balance < amount:
            raise InsufficientBalance(
                f'Balance {balance} < {amount}'
            )
        
        # Send transaction
        tx_hash = sdk.transfer(to_address, amount)
        print(f'Sent: {tx_hash.hex()}')
        return True
        
    except InvalidAddress as e:
        print(f'Invalid address: {e}')
        return False
    except InsufficientBalance as e:
        print(f'Insufficient balance: {e}')
        return False
    except Exception as e:
        print(f'Unexpected error: {e}')
        return False`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Working with Events</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`from sdk.events import TransferEvent

def listen_for_transfers(
    sdk: MyContractSDK,
    start_block: int
) -> None:
    """Listen for transfer events"""
    
    # Get all Transfer events
    events = sdk.get_transfer_events(start_block)
    
    for event in events:
        print(
            f'{event.from_address} → {event.to_address}: '
            f'{event.amount}'
        )

def watch_incoming_transfers(
    sdk: MyContractSDK,
    my_address: str
) -> None:
    """Watch for transfers to my address"""
    
    # Get all Transfer events
    all_events = sdk.get_transfer_events(0)
    
    # Filter incoming transfers
    incoming = [
        e for e in all_events 
        if e.to_address.lower() == my_address.lower()
    ]
    
    total_received = sum(e.amount for e in incoming)
    print(f'Total received: {total_received}')
    
    for event in incoming:
        print(f'From: {event.from_address}, Amount: {event.amount}')`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Trading Bot Example</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import asyncio
import time
from dataclasses import dataclass
from sdk.async_client import AsyncDEXSDK

@dataclass
class Trade:
    token_in: str
    token_out: str
    amount: int
    executed_at: float

class SimpleBot:
    def __init__(self, sdk: AsyncDEXSDK, wallet_key: str):
        self.sdk = sdk
        self.wallet_key = wallet_key
        self.trades: list[Trade] = []

    async def get_price(self, token_a: str, token_b: str) -> float:
        """Get current price of token_b in token_a"""
        quote = await self.sdk.quote(token_a, token_b, 1e18)
        return quote / 1e18

    async def execute_trade(
        self,
        token_in: str,
        token_out: str,
        amount: int
    ) -> bool:
        """Execute a trade"""
        try:
            tx = await self.sdk.swap(
                token_in=token_in,
                token_out=token_out,
                amount_in=amount
            )
            
            self.trades.append(Trade(
                token_in=token_in,
                token_out=token_out,
                amount=amount,
                executed_at=time.time()
            ))
            
            return True
        except Exception as e:
            print(f'Trade failed: {e}')
            return False

    async def run_forever(self) -> None:
        """Run the bot continuously"""
        while True:
            try:
                # Check prices every 60 seconds
                price = await self.get_price(
                    'USDC',
                    'ETH'
                )
                print(f'ETH/USDC: {price}')
                
                # Simple strategy: if price drops, buy
                if price < 1500:  # Arbitrary threshold
                    await self.execute_trade(
                        'USDC',
                        'ETH',
                        10e6  # 10 USDC
                    )
                
                await asyncio.sleep(60)
            except Exception as e:
                print(f'Bot error: {e}')
                await asyncio.sleep(10)`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use virtual environments:</strong> <code className="bg-gray-100 px-1">python -m venv venv</code></span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Keep keys safe:</strong> Use environment variables, never hardcode</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use type checking:</strong> <code className="bg-gray-100 px-1">pip install mypy</code></span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Test with testnet:</strong> Start on Sepolia before mainnet</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Log everything:</strong> Use logging module for debugging</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Related Resources</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="https://web3py.readthedocs.io/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">web3.py Documentation</a></li>
            <li><a href="https://docs.python.org/3/library/asyncio.html" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Python asyncio</a></li>
            <li><a href="/docs/getting-started/first-sdk" className="text-accent-green hover:underline">First SDK Guide</a></li>
            <li><a href="/docs/guides/defi-sdk" className="text-accent-green hover:underline">Build a DeFi SDK</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
