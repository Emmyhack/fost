'use client';

export default function RustPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Rust SDK Guide</h1>
      <p className="text-lg text-gray-600 mb-8">
        High-performance, memory-safe blockchain development with Rust
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Rust for Web3?</h2>
          <ul className="space-y-3 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Memory Safety:</strong> No null pointers, no buffer overflows</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Performance:</strong> As fast as C/C++, no garbage collection</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Concurrency:</strong> Safe concurrent code without race conditions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>WASM:</strong> Compile to WebAssembly for browser execution</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Create new Rust project
cargo new my-web3-app
cd my-web3-app

# Add SDK to Cargo.toml
[dependencies]
sdk-name = "1.0"
ethers = "2.0"
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }

# Run
cargo run`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`use sdk_name::MyContractSDK;
use ethers::prelude::*;
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Connect to Ethereum
    let provider = Provider::<Http>::try_from(
        "https://eth.llamarpc.com"
    )?;
    let provider = Arc::new(provider);
    
    // Initialize SDK
    let sdk = MyContractSDK::new(provider.clone());
    
    // Query balance
    let balance = sdk.balance_of("0xUser").await?;
    println!("Balance: {:?}", balance);
    
    // Transfer tokens
    let tx_hash = sdk.transfer(
        "0xRecipient",
        U256::from(1_000_000_000_000_000_000u64)
    ).await?;
    println!("TX Hash: {:?}", tx_hash);
    
    Ok(())
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Error Handling with Result</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`use std::error::Error;
use std::fmt;

#[derive(Debug)]
pub enum ContractError {
    InsufficientBalance { required: U256, available: U256 },
    InvalidAddress(String),
    TransactionFailed(String),
    NetworkError(String),
}

impl fmt::Display for ContractError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ContractError::InsufficientBalance { required, available } => {
                write!(f, "Insufficient balance: {} required, {} available",
                    required, available)
            }
            ContractError::InvalidAddress(addr) => {
                write!(f, "Invalid address: {}", addr)
            }
            ContractError::TransactionFailed(reason) => {
                write!(f, "Transaction failed: {}", reason)
            }
            ContractError::NetworkError(msg) => {
                write!(f, "Network error: {}", msg)
            }
        }
    }
}

impl Error for ContractError {}

// Using Result type
pub async fn safe_transfer(
    sdk: &MyContractSDK,
    to: &str,
    amount: U256,
) -> Result<H256, ContractError> {
    // Validate address
    let address: Address = to.parse()
        .map_err(|_| ContractError::InvalidAddress(to.to_string()))?;
    
    // Check balance
    let balance = sdk.balance_of(to).await
        .map_err(|e| ContractError::NetworkError(e.to_string()))?;
    
    if balance < amount {
        return Err(ContractError::InsufficientBalance {
            required: amount,
            available: balance,
        });
    }
    
    // Transfer
    let tx = sdk.transfer(to, amount).await
        .map_err(|e| ContractError::TransactionFailed(e.to_string()))?;
    
    Ok(tx)
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Async/Await with Tokio</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`use tokio::task;
use futures::future::join_all;

pub async fn fetch_multiple_balances(
    sdk: &MyContractSDK,
    addresses: Vec<&str>,
) -> Vec<Result<U256, ContractError>> {
    let tasks: Vec<_> = addresses
        .iter()
        .map(|addr| {
            let sdk = sdk.clone();
            let address = addr.to_string();
            task::spawn(async move {
                sdk.balance_of(&address).await
            })
        })
        .collect();
    
    let results = join_all(tasks).await;
    results.into_iter()
        .map(|r| r.unwrap_or(Err(ContractError::NetworkError(
            "Task failed".into()
        ))))
        .collect()
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addresses = vec!["0x1234...", "0x5678...", "0xABCD..."];
    let balances = fetch_multiple_balances(&sdk, addresses).await;
    
    for (addr, balance) in addresses.iter().zip(balances) {
        match balance {
            Ok(b) => println!("{}: {}", addr, b),
            Err(e) => eprintln!("{}: error - {}", addr, e),
        }
    }
    
    Ok(())
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Type-Safe Patterns</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`use std::marker::PhantomData;

// Newtype pattern for type safety
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TokenAmount(pub U256);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct GasPrice(pub U256);

// State machine pattern
pub struct TransactionBuilder {
    to: Option<Address>,
    amount: Option<TokenAmount>,
    gas_price: Option<GasPrice>,
}

impl TransactionBuilder {
    pub fn new() -> Self {
        TransactionBuilder {
            to: None,
            amount: None,
            gas_price: None,
        }
    }
    
    pub fn to(mut self, address: Address) -> Self {
        self.to = Some(address);
        self
    }
    
    pub fn amount(mut self, amount: TokenAmount) -> Self {
        self.amount = Some(amount);
        self
    }
    
    pub fn gas_price(mut self, price: GasPrice) -> Self {
        self.gas_price = Some(price);
        self
    }
    
    // Builder pattern ensures all fields are set
    pub fn build(self) -> Result<Transaction, String> {
        let to = self.to.ok_or("Must specify recipient")?;
        let amount = self.amount.ok_or("Must specify amount")?;
        let gas_price = self.gas_price.ok_or("Must specify gas price")?;
        
        Ok(Transaction { to, amount, gas_price })
    }
}

// Usage
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let tx = TransactionBuilder::new()
        .to(address_to)
        .amount(TokenAmount(U256::from(1_000_000_000_000_000_000u64)))
        .gas_price(GasPrice(U256::from(20)))
        .build()?;
    
    println!("Transaction: {:?}", tx);
    
    Ok(())
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">WebAssembly Integration</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Cargo.toml
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
web-sys = "0.3"

// lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn get_balance(address: String) -> Result<String, JsValue> {
    let sdk = MyContractSDK::new();
    
    match sdk.balance_of(&address).await {
        Ok(balance) => Ok(balance.to_string()),
        Err(e) => Err(JsValue::from_str(&e.to_string())),
    }
}

#[wasm_bindgen]
pub async fn transfer(
    to: String,
    amount: String,
) -> Result<String, JsValue> {
    let sdk = MyContractSDK::new();
    let amount_u256 = U256::from_dec_str(&amount)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    match sdk.transfer(&to, amount_u256).await {
        Ok(tx_hash) => Ok(format!("{:?}", tx_hash)),
        Err(e) => Err(JsValue::from_str(&e.to_string())),
    }
}

// JavaScript usage
import init, { get_balance, transfer } from './wasm.js';

await init();

const balance = await get_balance('0xUser');
console.log('Balance:', balance);

const txHash = await transfer('0xRecipient', '1000000000000000000');
console.log('TX Hash:', txHash);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Testing</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`#[cfg(test)]
mod tests {
    use super::*;
    use mockall::*;
    
    mock! {
        ContractSDK {
            async fn balance_of(&self, address: &str) -> Result<U256, ContractError>;
            async fn transfer(&self, to: &str, amount: U256) -> Result<H256, ContractError>;
        }
    }
    
    #[tokio::test]
    async fn test_balance_query() {
        let mut mock = MockContractSDK::new();
        mock.expect_balance_of()
            .with(eq("0xUser"))
            .times(1)
            .returning(|_| Ok(U256::from(1_000_000_000_000_000_000u64)));
        
        let result = mock.balance_of("0xUser").await;
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_transfer_validation() {
        let sdk = MyContractSDK::new();
        
        // Test invalid address
        let result = safe_transfer(&sdk, "invalid", U256::one()).await;
        assert!(matches!(
            result,
            Err(ContractError::InvalidAddress(_))
        ));
    }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Own error types:</strong> Define custom error types for domain errors</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use Result:</strong> Avoid unwrap() in production code</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Async all the way:</strong> Use tokio for async runtime</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Type safety:</strong> Use newtypes for semantic meaning</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Clippy:</strong> Use <code className="bg-gray-100 px-1">cargo clippy</code> for linting</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Learn More</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="https://doc.rust-lang.org/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Rust Book</a></li>
            <li><a href="https://docs.rs/ethers/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">ethers-rs</a></li>
            <li><a href="https://rustwasm.org/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Rust and WebAssembly</a></li>
            <li><a href="/docs/getting-started/first-sdk" className="text-accent-green hover:underline">First SDK Guide</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
