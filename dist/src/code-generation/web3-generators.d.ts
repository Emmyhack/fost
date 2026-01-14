/**
 * WEB3 SDK GENERATORS
 *
 * Generates production-grade Web3 SDK code with explicit transaction handling,
 * wallet management, and event subscriptions.
 *
 * Respects blockchain async semantics and prevents hiding important states.
 */
import * as AST from "./types";
import { Web3SDKDesignPlan } from "./types";
/**
 * Builder for Web3 client class with wallet and transaction handling
 */
export declare class Web3ClientBuilder {
    /**
     * Build the main Web3 SDK client class
     */
    static build(plan: Web3SDKDesignPlan): AST.ASTClassDeclaration;
}
/**
 * Builder for transaction monitoring
 */
export declare class TransactionMonitorBuilder {
    static build(): AST.ASTClassDeclaration;
}
/**
 * Builder for wallet connection management
 */
export declare class WalletConnectionBuilder {
    static build(): AST.ASTClassDeclaration;
}
/**
 * Builder for event subscription management
 */
export declare class EventSubscriptionBuilder {
    static build(): AST.ASTClassDeclaration;
}
//# sourceMappingURL=web3-generators.d.ts.map