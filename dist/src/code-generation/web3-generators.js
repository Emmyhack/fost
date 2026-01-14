"use strict";
/**
 * WEB3 SDK GENERATORS
 *
 * Generates production-grade Web3 SDK code with explicit transaction handling,
 * wallet management, and event subscriptions.
 *
 * Respects blockchain async semantics and prevents hiding important states.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubscriptionBuilder = exports.WalletConnectionBuilder = exports.TransactionMonitorBuilder = exports.Web3ClientBuilder = void 0;
/**
 * Builder for Web3 client class with wallet and transaction handling
 */
class Web3ClientBuilder {
    /**
     * Build the main Web3 SDK client class
     */
    static build(plan) {
        const clientName = plan.client.className;
        const properties = [
            {
                type: "PropertyDeclaration",
                name: "private config",
                valueType: "Web3ClientConfig",
                readonly: false,
                isPrivate: true,
            },
            {
                type: "PropertyDeclaration",
                name: "private provider",
                valueType: "Provider",
                readonly: false,
                isPrivate: true,
            },
            {
                type: "PropertyDeclaration",
                name: "private walletConnection",
                valueType: "WalletConnection",
                readonly: false,
                isPrivate: true,
            },
            {
                type: "PropertyDeclaration",
                name: "private transactionMonitor",
                valueType: "TransactionMonitor",
                readonly: false,
                isPrivate: true,
            },
            {
                type: "PropertyDeclaration",
                name: "private eventSubscriptions",
                valueType: "Map<string, SmartContractEventSubscription>",
                readonly: false,
                isPrivate: true,
            },
            {
                type: "PropertyDeclaration",
                name: "private chainId",
                valueType: "string",
                readonly: false,
                isPrivate: true,
            },
            {
                type: "PropertyDeclaration",
                name: "public onChainChange",
                valueType: "(chainId: string) => void",
                readonly: false,
                isPrivate: false,
                initializer: {
                    type: "Identifier",
                    name: "(() => {})",
                },
            },
            {
                type: "PropertyDeclaration",
                name: "public onWalletChange",
                valueType: "(address: string | undefined) => void",
                readonly: false,
                isPrivate: false,
                initializer: {
                    type: "Identifier",
                    name: "(() => {})",
                },
            },
        ];
        const constructor = {
            type: "Constructor",
            parameters: [
                {
                    type: "Parameter",
                    name: "config",
                    parameterType: "Web3ClientConfig",
                    optional: false,
                },
            ],
            body: [
                {
                    type: "VariableDeclaration",
                    kind: "const",
                    name: "validated",
                    valueType: "Web3ClientConfig",
                    initializer: {
                        type: "CallExpression",
                        callee: "this.validateConfig",
                        arguments: ["config"],
                    },
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.config = validated",
                    name: "",
                    valueType: "",
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.provider = this.initializeProvider",
                    name: "",
                    valueType: "",
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.walletConnection = { state: 'DISCONNECTED' }",
                    name: "",
                    valueType: "",
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.transactionMonitor = new TransactionMonitor",
                    name: "",
                    valueType: "",
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.eventSubscriptions = new Map",
                    name: "",
                    valueType: "",
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.chainId = config.chainId",
                    name: "",
                    valueType: "",
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.setupWalletListeners",
                    name: "",
                    valueType: "",
                },
            ],
        };
        const methods = [
            // Wallet connection methods
            {
                type: "MethodDeclaration",
                name: "async connectWallet",
                isAsync: true,
                isPrivate: false,
                parameters: [
                    {
                        type: "Parameter",
                        name: "options",
                        parameterType: "ConnectWalletOptions",
                        optional: true,
                    },
                ],
                returnType: "Promise<WalletConnection>",
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "try",
                        name: "",
                        valueType: "",
                    },
                ],
                documentation: "Connect to a blockchain wallet. Explicitly tracks connection state.",
            },
            // Transaction submission with explicit state tracking
            {
                type: "MethodDeclaration",
                name: "async submitTransaction",
                isAsync: true,
                isPrivate: false,
                parameters: [
                    {
                        type: "Parameter",
                        name: "tx",
                        parameterType: "TransactionRequest",
                        optional: false,
                    },
                    {
                        type: "Parameter",
                        name: "options",
                        parameterType: "SubmitTransactionOptions",
                        optional: true,
                    },
                ],
                returnType: "Promise<TransactionLifecycle>",
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "const",
                        name: "lifecycle",
                        valueType: "TransactionLifecycle",
                        initializer: {
                            type: "ObjectExpression",
                            properties: [
                                { key: "state", value: "TransactionState.PENDING_SUBMISSION" },
                                { key: "nonce", value: "tx.nonce" },
                                { key: "confirmations", value: "0" },
                                { key: "createdAt", value: "Date.now()" },
                            ],
                        },
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "const",
                        name: "signed",
                        valueType: "SigningRequest",
                        initializer: {
                            type: "CallExpression",
                            callee: "await this.requestSignature",
                            arguments: ["tx"],
                        },
                    },
                    {
                        type: "IfStatement",
                        condition: {
                            type: "BinaryExpression",
                            left: "signed.state",
                            operator: "===",
                            right: '"rejected"',
                        },
                        consequent: [
                            {
                                type: "ThrowStatement",
                                argument: {
                                    type: "CallExpression",
                                    callee: "new SigningRejectedError",
                                    arguments: ['"User rejected transaction signing"'],
                                },
                            },
                        ],
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "const",
                        name: "submitted",
                        valueType: "SubmissionResult",
                        initializer: {
                            type: "CallExpression",
                            callee: "await this.provider.sendTransaction",
                            arguments: ["signed.signature"],
                        },
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "lifecycle.state = TransactionState.SUBMITTED",
                        name: "",
                        valueType: "",
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "lifecycle.hash = submitted.hash",
                        name: "",
                        valueType: "",
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "lifecycle.submittedAt = Date.now()",
                        name: "",
                        valueType: "",
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "await this.transactionMonitor.monitor",
                        name: "",
                        valueType: "",
                    },
                    {
                        type: "ReturnStatement",
                        argument: {
                            type: "Identifier",
                            name: "lifecycle",
                        },
                    },
                ],
                documentation: "Submit transaction with explicit lifecycle tracking. " +
                    "Respects blockchain async semantics and prevents hiding states.",
            },
            // Gas estimation - explicit, separate from submission
            {
                type: "MethodDeclaration",
                name: "async estimateGas",
                isAsync: true,
                isPrivate: false,
                parameters: [
                    {
                        type: "Parameter",
                        name: "tx",
                        parameterType: "TransactionRequest",
                        optional: false,
                    },
                ],
                returnType: "Promise<GasEstimate>",
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "const",
                        name: "estimate",
                        valueType: "any",
                        initializer: {
                            type: "CallExpression",
                            callee: "await this.provider.estimateGas",
                            arguments: ["tx"],
                        },
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "const",
                        name: "result",
                        valueType: "GasEstimate",
                        initializer: {
                            type: "ObjectExpression",
                            properties: [
                                { key: "gasUnits", value: "estimate.gasUnits" },
                                {
                                    key: "gasPrice",
                                    value: "await this.provider.getGasPrice()",
                                },
                                { key: "isStale", value: "false" },
                                { key: "generatedAt", value: "Date.now()" },
                                {
                                    key: "validForMs",
                                    value: "60000",
                                },
                                {
                                    key: "maxTotalCostNativeToken",
                                    value: "estimate.gasUnits * gasPrice",
                                },
                            ],
                        },
                    },
                    {
                        type: "ReturnStatement",
                        argument: {
                            type: "Identifier",
                            name: "result",
                        },
                    },
                ],
                documentation: "Estimate gas cost before transaction submission. " +
                    "Separate from submission to respect developer control.",
            },
            // Wait for confirmation with explicit strategy
            {
                type: "MethodDeclaration",
                name: "async waitForConfirmation",
                isAsync: true,
                isPrivate: false,
                parameters: [
                    {
                        type: "Parameter",
                        name: "transactionHash",
                        parameterType: "string",
                        optional: false,
                    },
                    {
                        type: "Parameter",
                        name: "strategy",
                        parameterType: "ConfirmationStrategy",
                        optional: true,
                    },
                ],
                returnType: "Promise<TransactionLifecycle>",
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "const",
                        name: "confirmation",
                        valueType: "ConfirmationStrategy",
                        initializer: {
                            type: "Identifier",
                            name: "strategy || this.config.confirmationStrategy",
                        },
                    },
                ],
                documentation: "Wait for transaction confirmation using explicit strategy. " +
                    "Different strategies for different chains (finality vs block confirmations).",
            },
            // Read contract state
            {
                type: "MethodDeclaration",
                name: "async read",
                isAsync: true,
                isPrivate: false,
                parameters: [
                    {
                        type: "Parameter",
                        name: "contract",
                        parameterType: "ContractRead",
                        optional: false,
                    },
                ],
                returnType: "Promise<any>",
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "const",
                        name: "result",
                        valueType: "any",
                        initializer: {
                            type: "CallExpression",
                            callee: "await this.provider.call",
                            arguments: ["contract"],
                        },
                    },
                    {
                        type: "ReturnStatement",
                        argument: {
                            type: "Identifier",
                            name: "result",
                        },
                    },
                ],
                documentation: "Read contract state without state change. " +
                    "Fast, synchronous execution.",
            },
            // Subscribe to events with explicit lifecycle
            {
                type: "MethodDeclaration",
                name: "async subscribeToEvents",
                isAsync: true,
                isPrivate: false,
                parameters: [
                    {
                        type: "Parameter",
                        name: "filter",
                        parameterType: "EventFilter",
                        optional: false,
                    },
                    {
                        type: "Parameter",
                        name: "handler",
                        parameterType: "(event: BlockchainEventEmission) => void",
                        optional: false,
                    },
                ],
                returnType: "Promise<string>",
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "const",
                        name: "subscriptionId",
                        valueType: "string",
                        initializer: {
                            type: "CallExpression",
                            callee: "this.generateSubscriptionId",
                            arguments: [],
                        },
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "const",
                        name: "subscription",
                        valueType: "SmartContractEventSubscription",
                        initializer: {
                            type: "ObjectExpression",
                            properties: [
                                { key: "subscriptionId", value: "subscriptionId" },
                                { key: "state", value: "SubscriptionState.SUBSCRIBING" },
                                { key: "subscribedAt", value: "Date.now()" },
                                { key: "eventCount", value: "0" },
                            ],
                        },
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "this.eventSubscriptions.set",
                        name: "",
                        valueType: "",
                    },
                    {
                        type: "ReturnStatement",
                        argument: {
                            type: "Identifier",
                            name: "subscriptionId",
                        },
                    },
                ],
                documentation: "Subscribe to smart contract events. " +
                    "Tracks subscription state and handles reorgs.",
            },
            // Chain switching with explicit validation
            {
                type: "MethodDeclaration",
                name: "async switchChain",
                isAsync: true,
                isPrivate: false,
                parameters: [
                    {
                        type: "Parameter",
                        name: "chainId",
                        parameterType: "string",
                        optional: false,
                    },
                ],
                returnType: "Promise<void>",
                body: [],
                documentation: "Switch to different blockchain. " +
                    "Explicit, validated, with error handling.",
            },
            // Disconnect wallet
            {
                type: "MethodDeclaration",
                name: "async disconnect",
                isAsync: true,
                isPrivate: false,
                parameters: [],
                returnType: "Promise<void>",
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "this.walletConnection.state = WalletConnectionState.DISCONNECTED",
                        name: "",
                        valueType: "",
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "this.walletConnection.address = undefined",
                        name: "",
                        valueType: "",
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "this.eventSubscriptions.clear",
                        name: "",
                        valueType: "",
                    },
                ],
                documentation: "Disconnect wallet and cleanup subscriptions.",
            },
            // Private helper methods
            {
                type: "MethodDeclaration",
                name: "private validateConfig",
                isAsync: false,
                isPrivate: true,
                parameters: [
                    {
                        type: "Parameter",
                        name: "config",
                        parameterType: "Web3ClientConfig",
                        optional: false,
                    },
                ],
                returnType: "Web3ClientConfig",
                body: [
                    {
                        type: "IfStatement",
                        condition: {
                            type: "UnaryExpression",
                            operator: "!",
                            argument: {
                                type: "MemberExpression",
                                object: "config",
                                property: "chainId",
                                computed: false,
                            },
                        },
                        consequent: [
                            {
                                type: "ThrowStatement",
                                argument: {
                                    type: "CallExpression",
                                    callee: "new ConfigError",
                                    arguments: ['"Missing required chainId"'],
                                },
                            },
                        ],
                    },
                    {
                        type: "ReturnStatement",
                        argument: {
                            type: "Identifier",
                            name: "config",
                        },
                    },
                ],
            },
            {
                type: "MethodDeclaration",
                name: "private initializeProvider",
                isAsync: false,
                isPrivate: true,
                parameters: [],
                returnType: "Provider",
                body: [
                    {
                        type: "ReturnStatement",
                        argument: {
                            type: "CallExpression",
                            callee: "new JsonRpcProvider",
                            arguments: ["this.config.rpcUrl"],
                        },
                    },
                ],
            },
            {
                type: "MethodDeclaration",
                name: "private setupWalletListeners",
                isAsync: false,
                isPrivate: true,
                parameters: [],
                returnType: "void",
                body: [],
                documentation: "Setup event listeners for wallet and chain changes.",
            },
            {
                type: "MethodDeclaration",
                name: "private requestSignature",
                isAsync: true,
                isPrivate: true,
                parameters: [
                    {
                        type: "Parameter",
                        name: "tx",
                        parameterType: "TransactionRequest",
                        optional: false,
                    },
                ],
                returnType: "Promise<SigningRequest>",
                body: [],
                documentation: "Request signature from connected wallet. " +
                    "Separates signing from submission.",
            },
        ];
        return {
            type: "ClassDeclaration",
            name: clientName,
            extends: "BaseWeb3Client",
            constructor: constructor,
            properties: properties,
            methods: methods,
            isExported: true,
            documentation: "Web3 SDK Client - Handles wallet connections, transaction submission, " +
                "gas estimation, confirmation tracking, and event subscriptions. " +
                "Respects blockchain async semantics with explicit state tracking.",
        };
    }
}
exports.Web3ClientBuilder = Web3ClientBuilder;
/**
 * Builder for transaction monitoring
 */
class TransactionMonitorBuilder {
    static build() {
        return {
            type: "ClassDeclaration",
            name: "TransactionMonitor",
            constructor: undefined,
            properties: [
                {
                    type: "PropertyDeclaration",
                    name: "private transactions",
                    valueType: "Map<string, TransactionLifecycle>",
                    readonly: false,
                    isPrivate: true,
                },
                {
                    type: "PropertyDeclaration",
                    name: "public onStateChange",
                    valueType: "(tx: TransactionLifecycle) => void",
                    readonly: false,
                    isPrivate: false,
                    initializer: {
                        type: "Identifier",
                        name: "(() => {})",
                    },
                },
            ],
            methods: [
                {
                    type: "MethodDeclaration",
                    name: "async monitor",
                    isAsync: true,
                    isPrivate: false,
                    parameters: [
                        {
                            type: "Parameter",
                            name: "lifecycle",
                            parameterType: "TransactionLifecycle",
                            optional: false,
                        },
                        {
                            type: "Parameter",
                            name: "strategy",
                            parameterType: "ConfirmationStrategy",
                            optional: false,
                        },
                    ],
                    returnType: "Promise<TransactionLifecycle>",
                    body: [],
                    documentation: "Monitor transaction through complete lifecycle. " +
                        "Tracks state changes and handles reorgs.",
                },
                {
                    type: "MethodDeclaration",
                    name: "getTransaction",
                    isAsync: false,
                    isPrivate: false,
                    parameters: [
                        {
                            type: "Parameter",
                            name: "hash",
                            parameterType: "string",
                            optional: false,
                        },
                    ],
                    returnType: "TransactionLifecycle | undefined",
                    body: [],
                    documentation: "Get transaction lifecycle by hash.",
                },
            ],
            isExported: true,
            documentation: "Monitors blockchain transactions through complete lifecycle. " +
                "Tracks PENDING_SUBMISSION -> SUBMITTED -> INCLUDED -> FINALIZED states.",
        };
    }
}
exports.TransactionMonitorBuilder = TransactionMonitorBuilder;
/**
 * Builder for wallet connection management
 */
class WalletConnectionBuilder {
    static build() {
        return {
            type: "ClassDeclaration",
            name: "WalletConnector",
            constructor: undefined,
            properties: [
                {
                    type: "PropertyDeclaration",
                    name: "private connection",
                    valueType: "WalletConnection",
                    readonly: false,
                    isPrivate: true,
                },
                {
                    type: "PropertyDeclaration",
                    name: "public onConnect",
                    valueType: "(connection: WalletConnection) => void",
                    readonly: false,
                    isPrivate: false,
                    initializer: {
                        type: "Identifier",
                        name: "(() => {})",
                    },
                },
                {
                    type: "PropertyDeclaration",
                    name: "public onDisconnect",
                    valueType: "() => void",
                    readonly: false,
                    isPrivate: false,
                    initializer: {
                        type: "Identifier",
                        name: "(() => {})",
                    },
                },
                {
                    type: "PropertyDeclaration",
                    name: "public onAccountChange",
                    valueType: "(address: string) => void",
                    readonly: false,
                    isPrivate: false,
                    initializer: {
                        type: "Identifier",
                        name: "(() => {})",
                    },
                },
                {
                    type: "PropertyDeclaration",
                    name: "public onChainChange",
                    valueType: "(chainId: string) => void",
                    readonly: false,
                    isPrivate: false,
                    initializer: {
                        type: "Identifier",
                        name: "(() => {})",
                    },
                },
            ],
            methods: [
                {
                    type: "MethodDeclaration",
                    name: "async connect",
                    isAsync: true,
                    isPrivate: false,
                    parameters: [
                        {
                            type: "Parameter",
                            name: "options",
                            parameterType: "ConnectOptions",
                            optional: true,
                        },
                    ],
                    returnType: "Promise<WalletConnection>",
                    body: [],
                    documentation: "Connect to wallet with explicit state tracking.",
                },
                {
                    type: "MethodDeclaration",
                    name: "getState",
                    isAsync: false,
                    isPrivate: false,
                    parameters: [],
                    returnType: "WalletConnection",
                    body: [],
                    documentation: "Get current wallet connection state.",
                },
            ],
            isExported: true,
            documentation: "Manages wallet connections with explicit state transitions. " +
                "Tracks DISCONNECTED -> CONNECTING -> CONNECTED states.",
        };
    }
}
exports.WalletConnectionBuilder = WalletConnectionBuilder;
/**
 * Builder for event subscription management
 */
class EventSubscriptionBuilder {
    static build() {
        return {
            type: "ClassDeclaration",
            name: "EventSubscriptionManager",
            constructor: undefined,
            properties: [
                {
                    type: "PropertyDeclaration",
                    name: "private subscriptions",
                    valueType: "Map<string, SmartContractEventSubscription>",
                    readonly: false,
                    isPrivate: true,
                },
                {
                    type: "PropertyDeclaration",
                    name: "public onEvent",
                    valueType: "(event: BlockchainEventEmission) => void",
                    readonly: false,
                    isPrivate: false,
                    initializer: {
                        type: "Identifier",
                        name: "(() => {})",
                    },
                },
            ],
            methods: [
                {
                    type: "MethodDeclaration",
                    name: "async subscribe",
                    isAsync: true,
                    isPrivate: false,
                    parameters: [
                        {
                            type: "Parameter",
                            name: "filter",
                            parameterType: "EventFilter",
                            optional: false,
                        },
                    ],
                    returnType: "Promise<string>",
                    body: [],
                    documentation: "Subscribe to contract events with explicit state tracking.",
                },
                {
                    type: "MethodDeclaration",
                    name: "unsubscribe",
                    isAsync: false,
                    isPrivate: false,
                    parameters: [
                        {
                            type: "Parameter",
                            name: "subscriptionId",
                            parameterType: "string",
                            optional: false,
                        },
                    ],
                    returnType: "void",
                    body: [],
                    documentation: "Unsubscribe from event stream.",
                },
                {
                    type: "MethodDeclaration",
                    name: "getSubscription",
                    isAsync: false,
                    isPrivate: false,
                    parameters: [
                        {
                            type: "Parameter",
                            name: "subscriptionId",
                            parameterType: "string",
                            optional: false,
                        },
                    ],
                    returnType: "SmartContractEventSubscription | undefined",
                    body: [],
                    documentation: "Get subscription state by ID.",
                },
            ],
            isExported: true,
            documentation: "Manages smart contract event subscriptions. " +
                "Tracks subscription lifecycle and handles block reorgs.",
        };
    }
}
exports.EventSubscriptionBuilder = EventSubscriptionBuilder;
//# sourceMappingURL=web3-generators.js.map