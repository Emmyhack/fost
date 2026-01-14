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
export declare enum WalletConnectionState {
    DISCONNECTED = "DISCONNECTED",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    CONNECTION_LOST = "CONNECTION_LOST",
    CONNECTION_FAILED = "CONNECTION_FAILED",
    WRONG_CHAIN = "WRONG_CHAIN",
    ACCOUNT_CHANGED = "ACCOUNT_CHANGED"
}
export declare enum TransactionState {
    PENDING_SUBMISSION = "PENDING_SUBMISSION",
    SUBMITTED = "SUBMITTED",
    INCLUDED_IN_BLOCK = "INCLUDED_IN_BLOCK",
    FINALIZED = "FINALIZED",
    DROPPED = "DROPPED",
    REVERTED = "REVERTED",
    FAILED = "FAILED"
}
export declare enum SubscriptionState {
    INACTIVE = "INACTIVE",
    SUBSCRIBING = "SUBSCRIBING",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    ENDED = "ENDED",
    FAILED = "FAILED",
    RECONNECTING = "RECONNECTING"
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
    gasPricePresets?: Record<string, {
        speed: "slow" | "standard" | "fast";
        gasPrice: string;
        estimatedTimeSeconds: number;
        estimatedCostInNativeToken: string;
        estimatedCostUsd?: string;
    }>;
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
export interface UniswapV4SDKConfig {
    chainId: "ethereum-mainnet" | "ethereum-sepolia" | "arbitrum" | "optimism";
    rpcUrl: string;
    confirmationStrategy?: ConfirmationStrategy;
    autoGasEstimation?: boolean;
    userCustomizableGas?: boolean;
}
export declare enum Web3ErrorCode {
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
    NETWORK_ERROR = "NETWORK_ERROR"
}
export declare class Web3Error extends Error {
    code: Web3ErrorCode;
    recoverable: boolean;
    constructor(message: string, code: Web3ErrorCode, recoverable?: boolean);
}
export declare class UniswapV4SDK {
    private config;
    private provider;
    private walletConnection;
    private transactionMonitor;
    private eventSubscriptions;
    private networks;
    onChainChange: (chainId: string) => void;
    onWalletChange: (address: string | undefined) => void;
    onWalletStateChange: (state: WalletConnectionState) => void;
    constructor(config: UniswapV4SDKConfig);
    private validateConfig;
    private initializeProvider;
    private initializeNetworks;
    private setupWalletListeners;
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
    connectWallet(walletType: string): Promise<WalletConnection>;
    /**
     * Get current wallet connection state
     */
    getWalletState(): WalletConnection;
    /**
     * Disconnect wallet
     */
    disconnect(): Promise<void>;
    private ensureWalletConnected;
    private chainIdToNetworkKey;
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
    balanceOf(tokenAddress: string, account?: string, blockTag?: "latest" | "finalized" | number): Promise<string>;
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
    allowance(tokenAddress: string, spender: string, owner?: string): Promise<string>;
    /**
     * Quote swap price
     *
     * READ operation - Returns swap price without executing transaction
     *
     * @param params Swap parameters
     * @returns Quoted output amount
     */
    quoteSwap(params: SwapExactInputSingleParams): Promise<string>;
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
    swap(params: SwapExactInputSingleParams, gasPrice?: string): Promise<TransactionLifecycle>;
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
    estimateGasForSwap(params: SwapExactInputSingleParams): Promise<GasEstimate>;
    /**
     * Wait for transaction confirmation
     *
     * Respects blockchain confirmation requirements
     *
     * @param transactionHash Transaction hash to confirm
     * @param strategy Confirmation strategy (defaults to SDK config)
     * @returns Transaction lifecycle after confirmation
     */
    waitForConfirmation(transactionHash: string, strategy?: ConfirmationStrategy): Promise<TransactionLifecycle>;
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
    onSwap(handler: (event: SwapEvent & {
        hash: string;
        blockNumber: number;
    }) => void): Promise<string>;
    /**
     * Unsubscribe from events
     *
     * @param subscriptionId ID returned from subscription method
     */
    unsubscribeFromEvents(subscriptionId: string): void;
    /**
     * Get subscription state
     *
     * @param subscriptionId Subscription ID
     * @returns Current subscription state
     */
    getSubscriptionState(subscriptionId: string): SmartContractEventSubscription | undefined;
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
    switchChain(chainId: string): Promise<void>;
    /**
     * Get supported networks
     *
     * @returns All networks this SDK supports
     */
    getSupportedNetworks(): BlockchainNetwork[];
    /**
     * Get network details
     *
     * @param chainId Chain ID
     * @returns Network configuration
     */
    getNetwork(chainId: string): BlockchainNetwork | undefined;
    private userApprovesTransaction;
    private encodeSwapCall;
    private encodeQuoterCall;
    private generateSubscriptionId;
}
//# sourceMappingURL=EXAMPLE_UNISWAP_V4_SDK.d.ts.map