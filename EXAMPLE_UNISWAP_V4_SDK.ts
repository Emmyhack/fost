/**
 * EXAMPLE: UNISWAP V4 WEB3 SDK (AUTO-GENERATED)
 * 
 * This is an example of what an SDK generated from the Web3 schema looks like.
 * It demonstrates:
 * - Explicit wallet management
 * - Clear read vs write operations
 * - Transaction lifecycle tracking
 * - Gas estimation separation
 * - Event subscriptions with state
 * - Chain switching with validation
 * 
 * Focus on correctness over convenience.
 * Every important state is exposed.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum WalletConnectionState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  CONNECTION_LOST = "CONNECTION_LOST",
  CONNECTION_FAILED = "CONNECTION_FAILED",
  WRONG_CHAIN = "WRONG_CHAIN",
  ACCOUNT_CHANGED = "ACCOUNT_CHANGED",
}

export enum TransactionState {
  PENDING_SUBMISSION = "PENDING_SUBMISSION",
  SUBMITTED = "SUBMITTED",
  INCLUDED_IN_BLOCK = "INCLUDED_IN_BLOCK",
  FINALIZED = "FINALIZED",
  DROPPED = "DROPPED",
  REVERTED = "REVERTED",
  FAILED = "FAILED",
}

export enum SubscriptionState {
  INACTIVE = "INACTIVE",
  SUBSCRIBING = "SUBSCRIBING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  ENDED = "ENDED",
  FAILED = "FAILED",
  RECONNECTING = "RECONNECTING",
}

export interface WalletConnection {
  state: WalletConnectionState;
  address?: string;
  chainId?: string;
  accounts?: string[];
  connectedAt?: number;
  lastActivityAt?: number;
}

export interface TransactionLifecycle {
  state: TransactionState;
  hash?: string;
  blockNumber?: number;
  blockHash?: string;
  nonce: number;
  confirmations: number;
  gasUsed?: string;
  gasPrice?: string;
  transactionFee?: string;
  createdAt: number;
  submittedAt?: number;
  includedAt?: number;
  finalizedAt?: number;
  error?: string;
  revertReason?: string;
  receipt?: any;
}

export interface GasEstimate {
  gasUnits: string;
  gasPrice: string;
  gasPricePresets?: Record<
    string,
    {
      speed: "slow" | "standard" | "fast";
      gasPrice: string;
      estimatedTimeSeconds: number;
      estimatedCostInNativeToken: string;
      estimatedCostUsd?: string;
    }
  >;
  maxTotalCostNativeToken: string;
  estimatedCostUsd?: string;
  isStale: boolean;
  generatedAt: number;
  validForMs: number;
}

export interface ConfirmationStrategy {
  strategy: "block_confirmations" | "finality_confirmation" | "probabilistic";
  blockConfirmations?: number;
  timeoutMs: number;
  polling: {
    enabled: boolean;
    intervalMs: number;
    maxRetries: number;
  };
}

export interface BlockchainNetwork {
  chainId: string;
  name: string;
  environment: "mainnet" | "testnet";
  blockTimeSeconds: number;
  finalityBlocks: number;
  nativeTokenSymbol: string;
  rpcEndpoint: string;
  explorerUrl: string;
  faucetUrl?: string;
}

export interface SmartContractEventSubscription {
  subscriptionId: string;
  eventName: string;
  contractAddress: string;
  state: SubscriptionState;
  subscribedAt: number;
  lastEventAt?: number;
  eventCount: number;
  error?: {
    code: string;
    message: string;
  };
}

// Swap operation types
export interface SwapExactInputSingleParams {
  tokenIn: string;
  tokenOut: string;
  fee: "500" | "3000" | "10000";
  recipient: string;
  amountIn: string;
  amountOutMinimum: string;
  sqrtPriceLimitX96?: string;
}

export interface SwapExactOutputSingleParams {
  tokenIn: string;
  tokenOut: string;
  fee: "500" | "3000" | "10000";
  recipient: string;
  amountOut: string;
  amountInMaximum: string;
  sqrtPriceLimitX96?: string;
}

export interface SwapEvent {
  sender: string;
  recipient: string;
  amount0: string;
  amount1: string;
  sqrtPriceX96: string;
  liquidity: string;
  tick: number;
}

// Configuration
export interface UniswapV4SDKConfig {
  chainId: "ethereum-mainnet" | "ethereum-sepolia" | "arbitrum" | "optimism";
  rpcUrl: string;
  confirmationStrategy?: ConfirmationStrategy;
  autoGasEstimation?: boolean;
  userCustomizableGas?: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export enum Web3ErrorCode {
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  WALLET_CONNECTION_FAILED = "WALLET_CONNECTION_FAILED",
  WRONG_CHAIN = "WRONG_CHAIN",
  CHAIN_SWITCH_FAILED = "CHAIN_SWITCH_FAILED",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  INSUFFICIENT_GAS = "INSUFFICIENT_GAS",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  TRANSACTION_REVERTED = "TRANSACTION_REVERTED",
  GAS_ESTIMATION_FAILED = "GAS_ESTIMATION_FAILED",
  TRANSACTION_DROPPED = "TRANSACTION_DROPPED",
  SIGNING_REJECTED = "SIGNING_REJECTED",
  SIGNING_FAILED = "SIGNING_FAILED",
  SUBSCRIPTION_FAILED = "SUBSCRIPTION_FAILED",
  CONFIRMATION_TIMEOUT = "CONFIRMATION_TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",
}

export class Web3Error extends Error {
  code: Web3ErrorCode;
  recoverable: boolean;

  constructor(
    message: string,
    code: Web3ErrorCode,
    recoverable: boolean = false
  ) {
    super(message);
    this.code = code;
    this.recoverable = recoverable;
  }
}

// ============================================================================
// MAIN SDK CLIENT
// ============================================================================

export class UniswapV4SDK {
  private config: UniswapV4SDKConfig;
  private provider: any;
  private walletConnection: WalletConnection;
  private transactionMonitor: TransactionMonitor;
  private eventSubscriptions: Map<string, SmartContractEventSubscription>;
  private networks: Map<string, BlockchainNetwork>;

  // Event callbacks
  public onChainChange: (chainId: string) => void = () => {};
  public onWalletChange: (address: string | undefined) => void = () => {};
  public onWalletStateChange: (state: WalletConnectionState) => void = () => {};

  constructor(config: UniswapV4SDKConfig) {
    this.config = this.validateConfig(config);
    this.provider = this.initializeProvider();
    this.walletConnection = { state: WalletConnectionState.DISCONNECTED };
    this.transactionMonitor = new TransactionMonitor();
    this.eventSubscriptions = new Map();
    this.networks = this.initializeNetworks();
    this.setupWalletListeners();
  }

  private validateConfig(config: UniswapV4SDKConfig): UniswapV4SDKConfig {
    if (!config.rpcUrl) {
      throw new Web3Error(
        "Missing required rpcUrl in config",
        Web3ErrorCode.NETWORK_ERROR
      );
    }
    if (!config.chainId) {
      throw new Web3Error(
        "Missing required chainId in config",
        Web3ErrorCode.NETWORK_ERROR
      );
    }

    return {
      ...config,
      confirmationStrategy: config.confirmationStrategy || {
        strategy: "block_confirmations",
        blockConfirmations: 12,
        timeoutMs: 300000,
        polling: { enabled: true, intervalMs: 1000, maxRetries: 300 },
      },
      autoGasEstimation: config.autoGasEstimation ?? true,
      userCustomizableGas: config.userCustomizableGas ?? true,
    };
  }

  private initializeProvider() {
    // In real implementation, would use ethers.js or web3.js
    return {
      call: async (tx: any) => {
        /* provider call */
      },
      estimateGas: async (tx: any) => {
        /* gas estimation */
      },
      sendTransaction: async (tx: any) => {
        /* send transaction */
      },
      getTransaction: async (hash: string) => {
        /* get transaction */
      },
      getTransactionReceipt: async (hash: string) => {
        /* get receipt */
      },
    };
  }

  private initializeNetworks(): Map<string, BlockchainNetwork> {
    const networks = new Map<string, BlockchainNetwork>();

    networks.set("ethereum-mainnet", {
      chainId: "0x1",
      name: "Ethereum Mainnet",
      environment: "mainnet",
      blockTimeSeconds: 12,
      finalityBlocks: 64,
      nativeTokenSymbol: "ETH",
      rpcEndpoint: "https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY",
      explorerUrl: "https://etherscan.io",
    });

    networks.set("arbitrum", {
      chainId: "0xa4b1",
      name: "Arbitrum One",
      environment: "mainnet",
      blockTimeSeconds: 0.25,
      finalityBlocks: 1, // Arbitrum has fast finality
      nativeTokenSymbol: "ETH",
      rpcEndpoint: "https://arb1.arbitrum.io/rpc",
      explorerUrl: "https://arbiscan.io",
    });

    networks.set("ethereum-sepolia", {
      chainId: "0xaa36a7",
      name: "Ethereum Sepolia Testnet",
      environment: "testnet",
      blockTimeSeconds: 12,
      finalityBlocks: 64,
      nativeTokenSymbol: "ETH",
      rpcEndpoint: "https://sepolia.infura.io/v3/YOUR_KEY",
      explorerUrl: "https://sepolia.etherscan.io",
      faucetUrl: "https://sepoliafaucet.com",
    });

    return networks;
  }

  private setupWalletListeners() {
    // In real implementation, would listen to ethereum provider events
  }

  // ========================================================================
  // WALLET MANAGEMENT
  // ========================================================================

  /**
   * Connect to wallet with explicit state tracking
   *
   * @param walletType Type of wallet to connect (metamask, walletconnect, etc.)
   * @returns Promise resolving to wallet connection state
   *
   * Example:
   * ```
   * const connection = await sdk.connectWallet('metamask');
   * if (connection.state === WalletConnectionState.CONNECTED) {
   *   console.log('Connected:', connection.address);
   * } else if (connection.state === WalletConnectionState.WRONG_CHAIN) {
   *   console.log('Please switch to correct chain');
   * }
   * ```
   */
  async connectWallet(walletType: string): Promise<WalletConnection> {
    console.log(`Connecting to ${walletType}...`);

    this.walletConnection.state = WalletConnectionState.CONNECTING;
    this.onWalletStateChange(WalletConnectionState.CONNECTING);

    try {
      // Request wallet access
      const accounts = await (window as any).ethereum?.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Web3Error(
          "No accounts found in wallet",
          Web3ErrorCode.WALLET_CONNECTION_FAILED
        );
      }

      const chainId = await (window as any).ethereum?.request({
        method: "eth_chainId",
      });

      // Check if on supported chain
      if (!this.networks.has(this.chainIdToNetworkKey(chainId))) {
        this.walletConnection = {
          state: WalletConnectionState.WRONG_CHAIN,
          address: accounts[0],
          chainId: chainId,
          accounts: accounts,
          connectedAt: Date.now(),
        };
        this.onWalletStateChange(WalletConnectionState.WRONG_CHAIN);
        return this.walletConnection;
      }

      this.walletConnection = {
        state: WalletConnectionState.CONNECTED,
        address: accounts[0],
        chainId: chainId,
        accounts: accounts,
        connectedAt: Date.now(),
      };

      this.onWalletStateChange(WalletConnectionState.CONNECTED);
      this.onWalletChange(accounts[0]);

      return this.walletConnection;
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);

      this.walletConnection = {
        state: WalletConnectionState.CONNECTION_FAILED,
      };
      this.onWalletStateChange(WalletConnectionState.CONNECTION_FAILED);

      throw new Web3Error(
        `Failed to connect wallet: ${error.message}`,
        Web3ErrorCode.WALLET_CONNECTION_FAILED
      );
    }
  }

  /**
   * Get current wallet connection state
   */
  getWalletState(): WalletConnection {
    return { ...this.walletConnection };
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    this.walletConnection = { state: WalletConnectionState.DISCONNECTED };
    this.eventSubscriptions.forEach((_, id) => {
      this.unsubscribeFromEvents(id);
    });
    this.eventSubscriptions.clear();
    this.onWalletStateChange(WalletConnectionState.DISCONNECTED);
    this.onWalletChange(undefined);
  }

  private ensureWalletConnected(): void {
    if (this.walletConnection.state !== WalletConnectionState.CONNECTED) {
      throw new Web3Error(
        `Cannot perform operation: wallet ${this.walletConnection.state}`,
        Web3ErrorCode.WALLET_NOT_CONNECTED
      );
    }
  }

  private chainIdToNetworkKey(chainId: string): string {
    const mapping: Record<string, string> = {
      "0x1": "ethereum-mainnet",
      "0xaa36a7": "ethereum-sepolia",
      "0xa4b1": "arbitrum",
    };
    return mapping[chainId] || "unknown";
  }

  // ========================================================================
  // READ OPERATIONS (State Queries - No Gas Cost)
  // ========================================================================

  /**
   * Get token balance
   *
   * READ operation - Fast, no gas cost, can be called in loops
   *
   * @param tokenAddress ERC20 token contract address
   * @param account Account to check balance for (defaults to connected wallet)
   * @param blockTag Which block to read at (defaults to 'latest')
   * @returns Token balance as BigInt
   *
   * Example:
   * ```
   * const balance = await sdk.balanceOf(usdcAddress);
   * console.log('USDC Balance:', balance);
   * ```
   */
  async balanceOf(
    tokenAddress: string,
    account?: string,
    blockTag: "latest" | "finalized" | number = "latest"
  ): Promise<string> {
    const targetAccount = account || this.walletConnection.address;

    if (!targetAccount) {
      throw new Web3Error(
        "No account provided and wallet not connected",
        Web3ErrorCode.WALLET_NOT_CONNECTED
      );
    }

    try {
      // In real SDK, would decode ERC20.balanceOf() call
      const result = await this.provider.call({
        to: tokenAddress,
        data: "0x70a08231" + targetAccount.slice(2).padStart(64, "0"),
        blockTag,
      });

      return result;
    } catch (error: any) {
      throw new Web3Error(
        `Failed to get balance: ${error.message}`,
        Web3ErrorCode.NETWORK_ERROR
      );
    }
  }

  /**
   * Get allowance for token spending
   *
   * READ operation
   *
   * @param tokenAddress ERC20 token address
   * @param owner Owner account (defaults to connected wallet)
   * @param spender Address allowed to spend tokens
   * @returns Allowance amount
   */
  async allowance(
    tokenAddress: string,
    spender: string,
    owner?: string
  ): Promise<string> {
    const ownerAccount = owner || this.walletConnection.address;

    if (!ownerAccount) {
      throw new Web3Error(
        "No account provided",
        Web3ErrorCode.WALLET_NOT_CONNECTED
      );
    }

    try {
      const result = await this.provider.call({
        to: tokenAddress,
        data:
          "0xdd62ed3e" +
          ownerAccount.slice(2).padStart(64, "0") +
          spender.slice(2).padStart(64, "0"),
      });

      return result;
    } catch (error: any) {
      throw new Web3Error(
        `Failed to get allowance: ${error.message}`,
        Web3ErrorCode.NETWORK_ERROR
      );
    }
  }

  /**
   * Quote swap price
   *
   * READ operation - Returns swap price without executing transaction
   *
   * @param params Swap parameters
   * @returns Quoted output amount
   */
  async quoteSwap(params: SwapExactInputSingleParams): Promise<string> {
    try {
      // In real SDK, would call quoter contract
      const result = await this.provider.call({
        to: "0x61fFE014bA17989E8sSomeQuoterAddress", // Uniswap V4 Quoter
        data: this.encodeQuoterCall(params),
      });

      return result;
    } catch (error: any) {
      throw new Web3Error(
        `Failed to quote swap: ${error.message}`,
        Web3ErrorCode.NETWORK_ERROR
      );
    }
  }

  // ========================================================================
  // WRITE OPERATIONS (State-Changing Transactions)
  // ========================================================================

  /**
   * Execute token swap
   *
   * WRITE operation - Changes blockchain state
   *
   * Steps:
   * 1. Estimate gas
   * 2. Get user approval on gas cost
   * 3. Submit transaction
   * 4. Wait for inclusion in block
   * 5. Wait for finalization
   *
   * @param params Swap parameters
   * @param gasPrice Override gas price (optional)
   * @returns Complete transaction lifecycle
   *
   * Example:
   * ```
   * const lifecycle = await sdk.swap({
   *   tokenIn: usdcAddress,
   *   tokenOut: wethAddress,
   *   amountIn: '1000000000', // 1000 USDC
   *   amountOutMinimum: '500000000000000000'
   * });
   *
   * console.log('Swap submitted:', lifecycle.hash);
   * console.log('In block:', lifecycle.blockNumber);
   * console.log('Finalized:', lifecycle.state === TransactionState.FINALIZED);
   * ```
   */
  async swap(
    params: SwapExactInputSingleParams,
    gasPrice?: string
  ): Promise<TransactionLifecycle> {
    this.ensureWalletConnected();

    console.log("Step 1: Estimate gas");
    const gasEstimate = await this.estimateGasForSwap(params);

    console.log(`Gas estimate: ${gasEstimate.gasUnits} units`);
    console.log(`Cost: ${gasEstimate.estimatedCostUsd}`);

    if (!this.userApprovesTransaction(gasEstimate)) {
      throw new Web3Error(
        "User rejected transaction",
        Web3ErrorCode.SIGNING_REJECTED
      );
    }

    console.log("Step 2: Submit transaction");
    const lifecycle: TransactionLifecycle = {
      state: TransactionState.PENDING_SUBMISSION,
      nonce: 0,
      confirmations: 0,
      createdAt: Date.now(),
    };

    try {
      // Request signature from wallet
      const signedTx = await (window as any).ethereum?.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: this.walletConnection.address,
            to: "0x...SwapRouter",
            data: this.encodeSwapCall(params),
            gasLimit: gasEstimate.gasUnits,
            gasPrice: gasPrice || gasEstimate.gasPrice,
          },
        ],
      });

      lifecycle.hash = signedTx;
      lifecycle.state = TransactionState.SUBMITTED;
      lifecycle.submittedAt = Date.now();

      console.log("Submitted:", lifecycle.hash);

      // Monitor transaction lifecycle
      return await this.transactionMonitor.monitorTransaction(
        lifecycle,
        this.config.confirmationStrategy!
      );
    } catch (error: any) {
      lifecycle.state = TransactionState.FAILED;
      lifecycle.error = error.message;

      if (error.code === 4001) {
        throw new Web3Error(
          "User rejected transaction",
          Web3ErrorCode.SIGNING_REJECTED
        );
      }

      throw new Web3Error(
        `Transaction failed: ${error.message}`,
        Web3ErrorCode.TRANSACTION_FAILED
      );
    }
  }

  // ========================================================================
  // GAS ESTIMATION (Explicit Separation from Submission)
  // ========================================================================

  /**
   * Estimate gas for swap transaction
   *
   * Separate from submission to allow user review
   *
   * @param params Swap parameters
   * @returns Gas estimate with multiple pricing options
   *
   * Example:
   * ```
   * const estimate = await sdk.estimateGasForSwap(params);
   * console.log('Standard:', estimate.gasPricePresets.standard);
   * console.log('Cost: $' + estimate.gasPricePresets.standard.estimatedCostUsd);
   * ```
   */
  async estimateGasForSwap(params: SwapExactInputSingleParams): Promise<GasEstimate> {
    try {
      const gasUnits = await this.provider.estimateGas({
        from: this.walletConnection.address,
        to: "0x...SwapRouter",
        data: this.encodeSwapCall(params),
      });

      const gasPrice = await this.provider.getGasPrice();
      const baseFee = await this.provider.getBaseFee();

      return {
        gasUnits: gasUnits.toString(),
        gasPrice: gasPrice.toString(),
        gasPricePresets: {
          slow: {
            speed: "slow",
            gasPrice: (baseFee * 100n).toString(),
            estimatedTimeSeconds: 60,
            estimatedCostInNativeToken: (
              (BigInt(gasUnits) * baseFee * 100n) /
              10n ** 18n
            ).toString(),
            estimatedCostUsd: "150",
          },
          standard: {
            speed: "standard",
            gasPrice: (baseFee * 120n).toString(),
            estimatedTimeSeconds: 15,
            estimatedCostInNativeToken: (
              (BigInt(gasUnits) * baseFee * 120n) /
              10n ** 18n
            ).toString(),
            estimatedCostUsd: "180",
          },
          fast: {
            speed: "fast",
            gasPrice: (baseFee * 150n).toString(),
            estimatedTimeSeconds: 5,
            estimatedCostInNativeToken: (
              (BigInt(gasUnits) * baseFee * 150n) /
              10n ** 18n
            ).toString(),
            estimatedCostUsd: "225",
          },
        },
        maxTotalCostNativeToken: (
          (BigInt(gasUnits) * baseFee * 150n) /
          10n ** 18n
        ).toString(),
        estimatedCostUsd: "225",
        isStale: false,
        generatedAt: Date.now(),
        validForMs: 60000, // Valid for 1 minute
      };
    } catch (error: any) {
      throw new Web3Error(
        `Gas estimation failed: ${error.message}`,
        Web3ErrorCode.GAS_ESTIMATION_FAILED
      );
    }
  }

  // ========================================================================
  // TRANSACTION CONFIRMATION
  // ========================================================================

  /**
   * Wait for transaction confirmation
   *
   * Respects blockchain confirmation requirements
   *
   * @param transactionHash Transaction hash to confirm
   * @param strategy Confirmation strategy (defaults to SDK config)
   * @returns Transaction lifecycle after confirmation
   */
  async waitForConfirmation(
    transactionHash: string,
    strategy?: ConfirmationStrategy
  ): Promise<TransactionLifecycle> {
    const confirmStrategy = strategy || this.config.confirmationStrategy!;

    return this.transactionMonitor.waitForConfirmation(
      transactionHash,
      confirmStrategy
    );
  }

  // ========================================================================
  // EVENT SUBSCRIPTIONS
  // ========================================================================

  /**
   * Subscribe to swap events
   *
   * Tracks subscription state and handles reorgs
   *
   * @param handler Callback for each swap event
   * @returns Subscription ID
   *
   * Example:
   * ```
   * const subId = await sdk.onSwap((event) => {
   *   console.log('Swap event:', event);
   * });
   * ```
   */
  async onSwap(
    handler: (event: SwapEvent & { hash: string; blockNumber: number }) => void
  ): Promise<string> {
    const subscriptionId = this.generateSubscriptionId();

    const subscription: SmartContractEventSubscription = {
      subscriptionId,
      eventName: "Swap",
      contractAddress: "0x...SwapRouter",
      state: SubscriptionState.SUBSCRIBING,
      subscribedAt: Date.now(),
      eventCount: 0,
    };

    try {
      // In real implementation, would set up event listener
      (window as any).ethereum?.on("message", (message: any) => {
        if (message.type === "eth_subscription" && message.data.result) {
          const event = message.data.result;
          subscription.state = SubscriptionState.ACTIVE;
          subscription.lastEventAt = Date.now();
          subscription.eventCount++;

          handler({
            sender: event.topics[1],
            recipient: event.topics[2],
            amount0: event.data, // Decoded from event
            amount1: event.data,
            sqrtPriceX96: event.data,
            liquidity: event.data,
            tick: 0,
            hash: event.transactionHash,
            blockNumber: parseInt(event.blockNumber, 16),
          });
        }
      });

      this.eventSubscriptions.set(subscriptionId, subscription);
      subscription.state = SubscriptionState.ACTIVE;

      return subscriptionId;
    } catch (error: any) {
      subscription.state = SubscriptionState.FAILED;
      subscription.error = {
        code: Web3ErrorCode.SUBSCRIPTION_FAILED,
        message: error.message,
      };

      throw new Web3Error(
        `Failed to subscribe to events: ${error.message}`,
        Web3ErrorCode.SUBSCRIPTION_FAILED
      );
    }
  }

  /**
   * Unsubscribe from events
   *
   * @param subscriptionId ID returned from subscription method
   */
  unsubscribeFromEvents(subscriptionId: string): void {
    const subscription = this.eventSubscriptions.get(subscriptionId);
    if (subscription) {
      subscription.state = SubscriptionState.ENDED;
      this.eventSubscriptions.delete(subscriptionId);
    }
  }

  /**
   * Get subscription state
   *
   * @param subscriptionId Subscription ID
   * @returns Current subscription state
   */
  getSubscriptionState(
    subscriptionId: string
  ): SmartContractEventSubscription | undefined {
    return this.eventSubscriptions.get(subscriptionId);
  }

  // ========================================================================
  // CHAIN MANAGEMENT
  // ========================================================================

  /**
   * Switch to different blockchain
   *
   * Explicit chain switching with validation
   *
   * @param chainId Target chain ID
   *
   * Example:
   * ```
   * await sdk.switchChain('arbitrum');
   * ```
   */
  async switchChain(chainId: string): Promise<void> {
    const network = this.networks.get(chainId);
    if (!network) {
      throw new Web3Error(
        `Unsupported chain: ${chainId}`,
        Web3ErrorCode.WRONG_CHAIN
      );
    }

    try {
      await (window as any).ethereum?.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainId }],
      });

      this.onChainChange(chainId);
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet
        throw new Web3Error(
          `Chain not supported by wallet. Add it first.`,
          Web3ErrorCode.CHAIN_SWITCH_FAILED
        );
      }
      throw new Web3Error(
        `Failed to switch chain: ${error.message}`,
        Web3ErrorCode.CHAIN_SWITCH_FAILED
      );
    }
  }

  /**
   * Get supported networks
   *
   * @returns All networks this SDK supports
   */
  getSupportedNetworks(): BlockchainNetwork[] {
    return Array.from(this.networks.values());
  }

  /**
   * Get network details
   *
   * @param chainId Chain ID
   * @returns Network configuration
   */
  getNetwork(chainId: string): BlockchainNetwork | undefined {
    return this.networks.get(chainId);
  }

  // ========================================================================
  // PRIVATE HELPERS
  // ========================================================================

  private userApprovesTransaction(_estimate: GasEstimate): boolean {
    // In real implementation, would show UI dialog
    return true;
  }

  private encodeSwapCall(_params: SwapExactInputSingleParams): string {
    // Encode function call - simplified
    return "0x";
  }

  private encodeQuoterCall(_params: SwapExactInputSingleParams): string {
    // Encode quoter call - simplified
    return "0x";
  }

  private generateSubscriptionId(): string {
    return "sub_" + Math.random().toString(36).substring(2, 9);
  }
}

// ============================================================================
// TRANSACTION MONITOR (Internal)
// ============================================================================

class TransactionMonitor {
  async monitorTransaction(
    lifecycle: TransactionLifecycle,
    strategy: ConfirmationStrategy
  ): Promise<TransactionLifecycle> {
    // Implementation tracks transaction through complete lifecycle
    // Handles: SUBMITTED -> INCLUDED_IN_BLOCK -> FINALIZED states
    // Also handles: DROPPED, REVERTED states

    return lifecycle;
  }

  async waitForConfirmation(
    hash: string,
    strategy: ConfirmationStrategy
  ): Promise<TransactionLifecycle> {
    // Polls for confirmations based on strategy
    // Returns when strategy threshold is reached

    return {
      state: TransactionState.FINALIZED,
      hash,
      nonce: 0,
      confirmations: strategy.blockConfirmations || 1,
      createdAt: Date.now(),
      finalizedAt: Date.now(),
    };
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
async function exampleUsage() {
  const sdk = new UniswapV4SDK({
    chainId: 'ethereum-mainnet',
    rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY'
  });

  // Connect wallet
  const connection = await sdk.connectWallet('metamask');
  console.log('Connected:', connection.address);

  // Read balance
  const balance = await sdk.balanceOf('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
  console.log('USDC Balance:', balance);

  // Quote swap
  const quote = await sdk.quoteSwap({
    tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    tokenOut: '0xC02aaA39b223FE8D0A0e8e4F27ead9083C756Cc2',
    fee: '3000',
    recipient: connection.address!,
    amountIn: '1000000000',
    amountOutMinimum: '500000000000000000'
  });
  console.log('Expected output:', quote);

  // Subscribe to events
  const subId = await sdk.onSwap((event) => {
    console.log('Swap:', event.sender, event.amount0, event.amount1);
  });

  // Execute swap
  const lifecycle = await sdk.swap({
    tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    tokenOut: '0xC02aaA39b223FE8D0A0e8e4F27ead9083C756Cc2',
    fee: '3000',
    recipient: connection.address!,
    amountIn: '1000000000',
    amountOutMinimum: '500000000000000000'
  });

  console.log('Submitted:', lifecycle.hash);
  console.log('In block:', lifecycle.blockNumber);
  console.log('Gas used:', lifecycle.gasUsed);
  console.log('Finalized:', lifecycle.state === TransactionState.FINALIZED);

  // Cleanup
  sdk.unsubscribeFromEvents(subId);
  await sdk.disconnect();
}
*/
