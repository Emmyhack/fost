'use client';

export default function GoPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Go SDK Guide</h1>
      <p className="text-lg text-gray-600 mb-8">
        Building performant blockchain applications with Go
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Go for Web3?</h2>
          <ul className="space-y-3 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Performance:</strong> Compiled language with minimal overhead</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Concurrency:</strong> Goroutines for thousands of concurrent operations</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Backends:</strong> Build scalable APIs and services</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Docker Ready:</strong> Single binary deployment</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`# Download SDK
go get github.com/sdk-name/go-sdk

# For Ethereum interaction
go get github.com/ethereum/go-ethereum

# Initialize Go module
go mod init myapp
go get github.com/sdk-name/go-sdk@latest`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`package main

import (
    "context"
    "fmt"
    "log"
    "math/big"
    
    "github.com/ethereum/go-ethereum/ethclient"
    "github.com/sdk-name/go-sdk"
)

func main() {
    // Connect to Ethereum
    client, err := ethclient.Dial("https://eth.llamarpc.com")
    if err != nil {
        log.Fatal(err)
    }
    
    // Initialize SDK
    sdk := sdk.New(client)
    
    // Query balance
    balance, err := sdk.BalanceOf(context.Background(), "0xUser")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Balance: %s\\n", balance.String())
    
    // Transfer tokens
    tx, err := sdk.Transfer(context.Background(), 
        "0xRecipient",
        big.NewInt(1000000000000000000),
    )
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("TX Hash: %s\\n", tx.Hash().String())
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Interfaces and Types</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`package main

import (
    "context"
    "math/big"
    "github.com/ethereum/go-ethereum/common"
)

// Define interfaces for your contract interactions
type TokenSDK interface {
    BalanceOf(ctx context.Context, account string) (*big.Int, error)
    Transfer(ctx context.Context, to string, amount *big.Int) (common.Hash, error)
    Approve(ctx context.Context, spender string, amount *big.Int) (common.Hash, error)
}

// Struct to hold SDK and state
type MySDK struct {
    address common.Address
    client  *ethclient.Client
}

// Implement BalanceOf method
func (s *MySDK) BalanceOf(ctx context.Context, account string) (*big.Int, error) {
    // Parse address
    addr := common.HexToAddress(account)
    
    // Call contract method
    // (implementation would go here)
    
    return big.NewInt(0), nil
}

// Implement Transfer method
func (s *MySDK) Transfer(
    ctx context.Context, 
    to string, 
    amount *big.Int,
) (common.Hash, error) {
    // Create transaction
    // Sign with private key
    // Send to network
    
    return common.Hash{}, nil
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Concurrency with Goroutines</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`package main

import (
    "context"
    "sync"
)

// Fetch balances for multiple addresses concurrently
func FetchBalances(
    sdk TokenSDK,
    addresses []string,
) map[string]*big.Int {
    results := make(map[string]*big.Int)
    var mu sync.Mutex
    var wg sync.WaitGroup
    
    // Create worker pool
    semaphore := make(chan struct{}, 10) // 10 concurrent requests
    
    for _, addr := range addresses {
        wg.Add(1)
        go func(address string) {
            defer wg.Done()
            
            // Acquire semaphore
            semaphore <- struct{}{}
            defer func() { <-semaphore }()
            
            balance, err := sdk.BalanceOf(
                context.Background(), 
                address,
            )
            if err == nil {
                mu.Lock()
                results[address] = balance
                mu.Unlock()
            }
        }(addr)
    }
    
    wg.Wait()
    return results
}

// Usage in main
func main() {
    addresses := []string{
        "0x1234...",
        "0x5678...",
        "0xABCD...",
    }
    
    balances := FetchBalances(sdk, addresses)
    for addr, balance := range balances {
        fmt.Printf("%s: %s\\n", addr, balance.String())
    }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`package main

import (
    "errors"
    "fmt"
    "log"
    
    "github.com/ethereum/go-ethereum"
    "github.com/ethereum/go-ethereum/core/types"
)

// Custom error types
type TransactionError struct {
    TxHash string
    Reason string
}

func (e *TransactionError) Error() string {
    return fmt.Sprintf("tx %s failed: %s", e.TxHash, e.Reason)
}

// Safe transfer with error handling
func SafeTransfer(
    sdk TokenSDK,
    to string,
    amount *big.Int,
) error {
    // Validate inputs
    if to == "" {
        return errors.New("recipient address required")
    }
    if amount.Cmp(big.NewInt(0)) <= 0 {
        return errors.New("amount must be positive")
    }
    
    // Execute transfer
    txHash, err := sdk.Transfer(context.Background(), to, amount)
    if err != nil {
        // Handle different error types
        if errors.Is(err, ethereum.NotFound) {
            return &TransactionError{
                TxHash: txHash.String(),
                Reason: "transaction not found",
            }
        }
        return fmt.Errorf("transfer failed: %w", err)
    }
    
    // Wait for confirmation
    receipt, err := WaitForReceipt(txHash)
    if err != nil {
        return err
    }
    
    // Check receipt status
    if receipt.Status == types.ReceiptStatusFailed {
        return &TransactionError{
            TxHash: txHash.String(),
            Reason: "transaction reverted",
        }
    }
    
    return nil
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Building an API Server</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`package main

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

type BalanceRequest struct {
    Address string \`json:"address"\`
}

type BalanceResponse struct {
    Address string \`json:"address"\`
    Balance string \`json:"balance"\`
}

func HandleBalance(sdk TokenSDK) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req BalanceRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        
        balance, err := sdk.BalanceOf(r.Context(), req.Address)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        resp := BalanceResponse{
            Address: req.Address,
            Balance: balance.String(),
        }
        
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(resp)
    }
}

func main() {
    router := mux.NewRouter()
    
    router.HandleFunc("/balance", HandleBalance(sdk)).Methods("POST")
    
    http.ListenAndServe(":8080", router)
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Always handle errors:</strong> Go doesn't have exceptions, check every error</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use context:</strong> For cancellation and timeouts</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Define interfaces:</strong> Make code testable and flexible</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use channels:</strong> For goroutine communication</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Write tests:</strong> Use <code className="bg-gray-100 px-1">*_test.go</code> files</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Learn More</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="https://go.dev/doc/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Go Documentation</a></li>
            <li><a href="https://geth.ethereum.org/docs/developers/dapps/connect" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">go-ethereum Guide</a></li>
            <li><a href="/docs/getting-started/first-sdk" className="text-accent-green hover:underline">First SDK Guide</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
