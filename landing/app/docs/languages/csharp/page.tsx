'use client';

export default function CSharpPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">C# SDK Guide</h1>
      <p className="text-lg text-gray-600 mb-8">
        Building Web3 applications with C# and .NET
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why C# for Web3?</h2>
          <ul className="space-y-3 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>.NET Ecosystem:</strong> Rich framework and libraries</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Cross-Platform:</strong> .NET 6+ runs on Windows, Linux, macOS</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Modern Language:</strong> Async/await, LINQ, nullable types</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Game Development:</strong> Use with Unity for Web3 games</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Install via NuGet Package Manager
dotnet add package SdkName.CSharp

// Or using Package Manager Console
Install-Package SdkName.CSharp

// For Nethereum (popular Web3 library)
dotnet add package Nethereum.Web3

// Create new console project
dotnet new console -n MyWeb3App
cd MyWeb3App`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`using System;
using System.Numerics;
using SdkName;
using Nethereum.Web3;

class Program {
    static async Task Main(string[] args) {
        // Connect to Ethereum
        var web3 = new Web3("https://eth.llamarpc.com");
        
        // Initialize SDK
        var sdk = new MyContractSDK(web3);
        
        // Get balance
        var balance = await sdk.BalanceOfAsync("0xUser");
        Console.WriteLine($"Balance: {balance}");
        
        // Transfer tokens
        var txHash = await sdk.TransferAsync(
            "0xRecipient",
            BigInteger.Parse("1000000000000000000")
        );
        Console.WriteLine($"TX Hash: {txHash}");
    }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Async/Await Patterns</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`using System;
using System.Threading.Tasks;
using System.Numerics;

public class TokenManager {
    private readonly MyContractSDK _sdk;
    
    public TokenManager(MyContractSDK sdk) {
        _sdk = sdk;
    }
    
    // Async method with error handling
    public async Task<BigInteger> GetBalanceAsync(string address) {
        try {
            var balance = await _sdk.BalanceOfAsync(address);
            return balance;
        } catch (Exception ex) {
            Console.WriteLine($"Error fetching balance: {ex.Message}");
            throw;
        }
    }
    
    // Async transfer with confirmation
    public async Task<string> SafeTransferAsync(
        string to,
        BigInteger amount
    ) {
        // Validate
        if (string.IsNullOrEmpty(to)) {
            throw new ArgumentException("Recipient required");
        }
        
        if (amount <= 0) {
            throw new ArgumentException("Amount must be positive");
        }
        
        // Check balance
        var balance = await GetBalanceAsync(address);
        if (balance < amount) {
            throw new InvalidOperationException("Insufficient balance");
        }
        
        // Transfer
        var txHash = await _sdk.TransferAsync(to, amount);
        
        // Wait for confirmation
        await WaitForConfirmationAsync(txHash);
        
        return txHash;
    }
    
    private async Task WaitForConfirmationAsync(string txHash) {
        // Poll for receipt
        for (int i = 0; i < 30; i++) {
            var receipt = await _sdk.GetTransactionReceiptAsync(txHash);
            if (receipt != null) {
                return;
            }
            await Task.Delay(2000); // Wait 2 seconds
        }
        
        throw new TimeoutException(
            $"Transaction {txHash} not confirmed"
        );
    }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">LINQ and Functional Programming</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class Analytics {
    private readonly MyContractSDK _sdk;
    
    // LINQ with async
    public async Task<Dictionary<string, BigInteger>> GetBalancesAsync(
        IEnumerable<string> addresses
    ) {
        var tasks = addresses
            .Select(addr => _sdk.BalanceOfAsync(addr)
                .ContinueWith(t => (address: addr, balance: t.Result)))
            .ToList();
        
        await Task.WhenAll(tasks);
        
        return tasks
            .Select(t => t.Result)
            .ToDictionary(x => x.address, x => x.balance);
    }
    
    // Filter large transfers
    public async Task<List<Transfer>> GetLargeTransfersAsync(
        decimal minAmount
    ) {
        var transfers = await _sdk.GetTransferEventsAsync();
        
        return transfers
            .Where(t => t.Amount >= minAmount)
            .OrderByDescending(t => t.Amount)
            .Take(10)
            .ToList();
    }
    
    // Aggregate balances
    public async Task<BigInteger> GetTotalBalanceAsync(
        IEnumerable<string> addresses
    ) {
        var balances = await GetBalancesAsync(addresses);
        
        return balances
            .Values
            .Aggregate(BigInteger.Zero, (acc, b) => acc + b);
    }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">ASP.NET Core API</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Register services
builder.Services.AddScoped<MyContractSDK>();
builder.Services.AddScoped<TokenManager>();
builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();
app.MapControllers();
app.Run();

// Controller
[ApiController]
[Route("api/[controller]")]
public class TokenController : ControllerBase {
    private readonly TokenManager _tokenManager;
    
    public TokenController(TokenManager tokenManager) {
        _tokenManager = tokenManager;
    }
    
    [HttpGet("balance/{address}")]
    public async Task<ActionResult<BalanceDto>> GetBalance(
        string address
    ) {
        try {
            var balance = await _tokenManager
                .GetBalanceAsync(address);
            return Ok(new BalanceDto {
                Address = address,
                Balance = balance.ToString()
            });
        } catch (Exception ex) {
            return BadRequest(ex.Message);
        }
    }
    
    [HttpPost("transfer")]
    public async Task<ActionResult<TransferDto>> Transfer(
        [FromBody] TransferRequest request
    ) {
        try {
            var txHash = await _tokenManager.SafeTransferAsync(
                request.To,
                BigInteger.Parse(request.Amount)
            );
            return Ok(new TransferDto { TxHash = txHash });
        } catch (Exception ex) {
            return BadRequest(ex.Message);
        }
    }
}

public record BalanceDto(string Address, string Balance);
public record TransferDto(string TxHash);
public record TransferRequest(string To, string Amount);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Unit Testing with xUnit</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`using Xunit;
using Moq;
using System.Numerics;

public class TokenManagerTests {
    
    [Fact]
    public async Task GetBalance_ReturnsCorrectBalance() {
        // Arrange
        var mockSDK = new Mock<MyContractSDK>();
        var expected = BigInteger.Parse("1000000000000000000");
        
        mockSDK
            .Setup(x => x.BalanceOfAsync("0xUser"))
            .ReturnsAsync(expected);
        
        var manager = new TokenManager(mockSDK.Object);
        
        // Act
        var result = await manager.GetBalanceAsync("0xUser");
        
        // Assert
        Assert.Equal(expected, result);
        mockSDK.Verify(
            x => x.BalanceOfAsync("0xUser"),
            Times.Once
        );
    }
    
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public async Task Transfer_WithInvalidAddress_ThrowsException(
        string address
    ) {
        var mockSDK = new Mock<MyContractSDK>();
        var manager = new TokenManager(mockSDK.Object);
        
        await Assert.ThrowsAsync<ArgumentException>(
            () => manager.SafeTransferAsync(
                address,
                BigInteger.One
            )
        );
    }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use async/await:</strong> Never block, always use async methods</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Nullable references:</strong> Enable <code className="bg-gray-100 px-1">#nullable enable</code></span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Dependency injection:</strong> Use built-in DI in ASP.NET Core</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Unit test:</strong> xUnit with Moq for testing</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Configuration:</strong> Use appsettings.json for settings</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Learn More</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="https://docs.microsoft.com/en-us/dotnet/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">.NET Documentation</a></li>
            <li><a href="https://docs.nethereum.com/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Nethereum Docs</a></li>
            <li><a href="/docs/getting-started/first-sdk" className="text-accent-green hover:underline">First SDK Guide</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
