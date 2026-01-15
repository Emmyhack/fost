'use client';

export default function JavaPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Java SDK Guide</h1>
      <p className="text-lg text-gray-600 mb-8">
        Enterprise-grade blockchain development with Java
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Java for Web3?</h2>
          <ul className="space-y-3 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Enterprise Adoption:</strong> Used by major financial institutions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>JVM Ecosystem:</strong> Kotlin, Scala, Clojure compatibility</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Spring Framework:</strong> Powerful frameworks like Spring Boot</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Type Safety:</strong> Strong typing with generics</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`<!-- In pom.xml for Maven -->
<dependency>
    <groupId>com.sdk-name</groupId>
    <artifactId>java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>

<!-- For web3j -->
<dependency>
    <groupId>org.web3j</groupId>
    <artifactId>web3j-core</artifactId>
    <version>4.9.0</version>
</dependency>

// Or with Gradle
dependencies {
    implementation 'com.sdk-name:java-sdk:1.0.0'
    implementation 'org.web3j:web3j-core:4.9.0'
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import com.sdk_name.MyContractSDK;
import java.math.BigInteger;

public class TokenTransfer {
    public static void main(String[] args) throws Exception {
        // Connect to Ethereum
        Web3j web3j = Web3j.build(
            new HttpService("https://eth.llamarpc.com")
        );
        
        // Initialize SDK
        MyContractSDK sdk = new MyContractSDK(web3j);
        
        // Get balance
        BigInteger balance = sdk.balanceOf("0xUser");
        System.out.println("Balance: " + balance);
        
        // Transfer tokens
        String txHash = sdk.transfer(
            "0xRecipient",
            BigInteger.TEN.multiply(
                BigInteger.valueOf(10).pow(18)
            )
        );
        System.out.println("TX Hash: " + txHash);
    }
}
`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Object-Oriented Design</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import java.math.BigInteger;
import java.util.Optional;

public interface TokenService {
    BigInteger getBalance(String address) throws Exception;
    String transfer(String to, BigInteger amount) throws Exception;
    boolean approve(String spender, BigInteger amount) throws Exception;
}

public class TokenServiceImpl implements TokenService {
    private MyContractSDK sdk;
    
    public TokenServiceImpl(MyContractSDK sdk) {
        this.sdk = sdk;
    }
    
    @Override
    public BigInteger getBalance(String address) throws Exception {
        return sdk.balanceOf(address);
    }
    
    @Override
    public String transfer(String to, BigInteger amount) 
            throws Exception {
        if (to == null || to.isEmpty()) {
            throw new IllegalArgumentException(
                "Recipient required"
            );
        }
        if (amount.signum() <= 0) {
            throw new IllegalArgumentException(
                "Amount must be positive"
            );
        }
        
        BigInteger balance = getBalance(address);
        if (balance.compareTo(amount) < 0) {
            throw new IllegalStateException(
                "Insufficient balance"
            );
        }
        
        return sdk.transfer(to, amount);
    }
    
    @Override
    public boolean approve(String spender, BigInteger amount) 
            throws Exception {
        return sdk.approve(spender, amount);
    }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Spring Boot Integration</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;
import java.math.BigInteger;

@SpringBootApplication
public class TokenApplication {
    
    @Bean
    public TokenService tokenService() {
        Web3j web3j = Web3j.build(
            new HttpService("https://eth.llamarpc.com")
        );
        MyContractSDK sdk = new MyContractSDK(web3j);
        return new TokenServiceImpl(sdk);
    }
    
    public static void main(String[] args) {
        SpringApplication.run(TokenApplication.class, args);
    }
}

@RestController
@RequestMapping("/api/tokens")
public class TokenController {
    
    private final TokenService tokenService;
    
    public TokenController(TokenService tokenService) {
        this.tokenService = tokenService;
    }
    
    @GetMapping("/balance/{address}")
    public BalanceResponse getBalance(@PathVariable String address) 
            throws Exception {
        BigInteger balance = tokenService.getBalance(address);
        return new BalanceResponse(address, balance.toString());
    }
    
    @PostMapping("/transfer")
    public TransferResponse transfer(@RequestBody TransferRequest req) 
            throws Exception {
        String txHash = tokenService.transfer(
            req.getTo(),
            new BigInteger(req.getAmount())
        );
        return new TransferResponse(txHash);
    }
}

class BalanceResponse {
    public String address;
    public String balance;
    
    public BalanceResponse(String address, String balance) {
        this.address = address;
        this.balance = balance;
    }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Exception Handling</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`public class ContractException extends Exception {
    private final String transactionHash;
    
    public ContractException(String message, String txHash) {
        super(message);
        this.transactionHash = txHash;
    }
    
    public String getTransactionHash() {
        return transactionHash;
    }
}

public class SafeTokenService {
    private TokenService tokenService;
    
    public String safeTransfer(String to, BigInteger amount) {
        try {
            // Validate
            if (!isValidAddress(to)) {
                throw new IllegalArgumentException(
                    "Invalid address: " + to
                );
            }
            
            // Check balance
            BigInteger balance = tokenService.getBalance(address);
            if (balance.compareTo(amount) < 0) {
                throw new ContractException(
                    "Insufficient balance",
                    null
                );
            }
            
            // Transfer
            return tokenService.transfer(to, amount);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            return null;
        } catch (ContractException e) {
            System.err.println("Contract error: " + e.getMessage());
            System.err.println("TX: " + e.getTransactionHash());
            return null;
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Unit Testing</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TokenServiceTest {
    
    private MyContractSDK mockSDK;
    private TokenService tokenService;
    
    @BeforeEach
    void setup() {
        mockSDK = mock(MyContractSDK.class);
        tokenService = new TokenServiceImpl(mockSDK);
    }
    
    @Test
    void testBalanceRetreval() throws Exception {
        // Arrange
        BigInteger expectedBalance = BigInteger.valueOf(1000);
        when(mockSDK.balanceOf("0xUser"))
            .thenReturn(expectedBalance);
        
        // Act
        BigInteger actual = tokenService.getBalance("0xUser");
        
        // Assert
        assertEquals(expectedBalance, actual);
        verify(mockSDK).balanceOf("0xUser");
    }
    
    @Test
    void testTransferValidation() throws Exception {
        // Test null recipient
        assertThrows(
            IllegalArgumentException.class,
            () -> tokenService.transfer(null, BigInteger.TEN)
        );
        
        // Test negative amount
        assertThrows(
            IllegalArgumentException.class,
            () -> tokenService.transfer(
                "0xRecipient",
                BigInteger.valueOf(-1)
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
              <span><strong>Use dependency injection:</strong> Spring or Guice for better testability</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Define interfaces:</strong> Program to interfaces, not implementations</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Handle BigInteger:</strong> Ethereum uses uint256, use BigInteger</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Write unit tests:</strong> JUnit 5 with Mockito</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use logging:</strong> SLF4J for flexible logging</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Learn More</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="https://docs.web3j.io/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">web3j Documentation</a></li>
            <li><a href="https://spring.io/projects/spring-boot" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Spring Boot</a></li>
            <li><a href="/docs/getting-started/first-sdk" className="text-accent-green hover:underline">First SDK Guide</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
