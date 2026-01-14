"use strict";
/**
 * WEB3 SDK SCHEMA EXTENSIONS
 *
 * Extended canonical schema definitions for Web3 (blockchain) SDKs.
 * Respects blockchain async semantics and transaction lifecycle.
 *
 * Key principles:
 * - Transaction states are explicit, not hidden
 * - Confirmation requirements are deterministic per chain
 * - Gas estimation separates from transaction submission
 * - Read vs write operations have distinct contract
 * - Event subscriptions expose subscription lifecycle
 * - Chain switching is explicit and tracked
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3ErrorCode = exports.SubscriptionState = exports.WalletConnectionState = exports.TransactionState = void 0;
// ============================================================================
// SECTION 1: TRANSACTION TYPES & STATES
// ============================================================================
/**
 * Explicit transaction states throughout lifecycle.
 * Prevents hiding important states from developers.
 */
var TransactionState;
(function (TransactionState) {
    /** Transaction prepared but not yet submitted */
    TransactionState["PENDING_SUBMISSION"] = "PENDING_SUBMISSION";
    /** Transaction submitted to mempool */
    TransactionState["SUBMITTED"] = "SUBMITTED";
    /** Transaction included in block */
    TransactionState["INCLUDED_IN_BLOCK"] = "INCLUDED_IN_BLOCK";
    /** Transaction has reached finality confirmation threshold */
    TransactionState["FINALIZED"] = "FINALIZED";
    /** Transaction was dropped from mempool */
    TransactionState["DROPPED"] = "DROPPED";
    /** Transaction included in block but reverted */
    TransactionState["REVERTED"] = "REVERTED";
    /** Transaction failed for other reason */
    TransactionState["FAILED"] = "FAILED";
})(TransactionState || (exports.TransactionState = TransactionState = {}));
// ============================================================================
// SECTION 2: WALLET & SIGNER INTERFACES
// ============================================================================
/**
 * Explicit wallet connection states.
 * Prevents hidden connection issues.
 */
var WalletConnectionState;
(function (WalletConnectionState) {
    /** Not attempted or user disconnected */
    WalletConnectionState["DISCONNECTED"] = "DISCONNECTED";
    /** Connection in progress */
    WalletConnectionState["CONNECTING"] = "CONNECTING";
    /** Connected and ready to sign */
    WalletConnectionState["CONNECTED"] = "CONNECTED";
    /** Connection lost */
    WalletConnectionState["CONNECTION_LOST"] = "CONNECTION_LOST";
    /** Failed to connect */
    WalletConnectionState["CONNECTION_FAILED"] = "CONNECTION_FAILED";
    /** Connected but on wrong chain */
    WalletConnectionState["WRONG_CHAIN"] = "WRONG_CHAIN";
    /** Connected but account changed */
    WalletConnectionState["ACCOUNT_CHANGED"] = "ACCOUNT_CHANGED";
})(WalletConnectionState || (exports.WalletConnectionState = WalletConnectionState = {}));
// ============================================================================
// SECTION 5: EVENT SUBSCRIPTIONS WITH LIFECYCLE
// ============================================================================
/**
 * Event subscription lifecycle states.
 */
var SubscriptionState;
(function (SubscriptionState) {
    /** Not yet subscribed */
    SubscriptionState["INACTIVE"] = "INACTIVE";
    /** Subscription in progress */
    SubscriptionState["SUBSCRIBING"] = "SUBSCRIBING";
    /** Active and receiving events */
    SubscriptionState["ACTIVE"] = "ACTIVE";
    /** Subscription paused */
    SubscriptionState["PAUSED"] = "PAUSED";
    /** Subscription ended */
    SubscriptionState["ENDED"] = "ENDED";
    /** Subscription failed */
    SubscriptionState["FAILED"] = "FAILED";
    /** Subscription reconnecting after failure */
    SubscriptionState["RECONNECTING"] = "RECONNECTING";
})(SubscriptionState || (exports.SubscriptionState = SubscriptionState = {}));
// ============================================================================
// SECTION 8: ERROR DEFINITIONS
// ============================================================================
/**
 * Web3-specific error types.
 * Explicit about recovery paths.
 */
var Web3ErrorCode;
(function (Web3ErrorCode) {
    // Connection errors
    Web3ErrorCode["WALLET_NOT_CONNECTED"] = "WALLET_NOT_CONNECTED";
    Web3ErrorCode["WALLET_CONNECTION_FAILED"] = "WALLET_CONNECTION_FAILED";
    Web3ErrorCode["WRONG_CHAIN"] = "WRONG_CHAIN";
    Web3ErrorCode["CHAIN_SWITCH_FAILED"] = "CHAIN_SWITCH_FAILED";
    Web3ErrorCode["RPC_ENDPOINT_FAILED"] = "RPC_ENDPOINT_FAILED";
    // Signing errors
    Web3ErrorCode["SIGNING_REJECTED"] = "SIGNING_REJECTED";
    Web3ErrorCode["SIGNING_FAILED"] = "SIGNING_FAILED";
    Web3ErrorCode["SIGNING_TIMEOUT"] = "SIGNING_TIMEOUT";
    Web3ErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    // Transaction errors
    Web3ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    Web3ErrorCode["INSUFFICIENT_GAS"] = "INSUFFICIENT_GAS";
    Web3ErrorCode["TRANSACTION_FAILED"] = "TRANSACTION_FAILED";
    Web3ErrorCode["TRANSACTION_REVERTED"] = "TRANSACTION_REVERTED";
    Web3ErrorCode["NONCE_CONFLICT"] = "NONCE_CONFLICT";
    Web3ErrorCode["TRANSACTION_DROPPED"] = "TRANSACTION_DROPPED";
    // Gas errors
    Web3ErrorCode["GAS_ESTIMATION_FAILED"] = "GAS_ESTIMATION_FAILED";
    Web3ErrorCode["GAS_PRICE_TOO_LOW"] = "GAS_PRICE_TOO_LOW";
    // Contract errors
    Web3ErrorCode["CONTRACT_NOT_FOUND"] = "CONTRACT_NOT_FOUND";
    Web3ErrorCode["FUNCTION_NOT_FOUND"] = "FUNCTION_NOT_FOUND";
    Web3ErrorCode["INVALID_PARAMETERS"] = "INVALID_PARAMETERS";
    // Event subscription errors
    Web3ErrorCode["SUBSCRIPTION_FAILED"] = "SUBSCRIPTION_FAILED";
    Web3ErrorCode["SUBSCRIPTION_TIMEOUT"] = "SUBSCRIPTION_TIMEOUT";
    // Confirmation errors
    Web3ErrorCode["CONFIRMATION_TIMEOUT"] = "CONFIRMATION_TIMEOUT";
    Web3ErrorCode["BLOCK_REORG"] = "BLOCK_REORG";
    // General errors
    Web3ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    Web3ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(Web3ErrorCode || (exports.Web3ErrorCode = Web3ErrorCode = {}));
//# sourceMappingURL=WEB3_SCHEMA_EXTENSIONS.js.map