/**
 * WEB3 SDK USAGE PATTERNS
 *
 * Best practices and patterns for using generated Web3 SDKs.
 * Emphasizes correctness, explicit state handling, and clarity.
 */
/**
 * Best Practice: Always check connection state before operations
 *
 * This pattern ensures you know the wallet state at each step.
 * Prevents silent failures or unexpected behaviors.
 */
/**
 * Best Practice: Understand the difference between read and write operations
 *
 * READ operations:
 * - Query blockchain state without changing it
 * - Fast, no gas cost, can be batched
 * - Immediate result (or simple polling)
 *
 * WRITE operations:
 * - Change blockchain state (transactions)
 * - Require signer, cost gas, must be confirmed
 * - Multi-step: prepare -> sign -> submit -> confirm
 */
/**
 * Best Practice: Don't hide transaction states
 *
 * Transaction states:
 * - PENDING_SUBMISSION: Prepared but not sent to chain
 * - SUBMITTED: Sent to mempool, waiting for inclusion
 * - INCLUDED_IN_BLOCK: In a block but not yet confirmed
 * - FINALIZED: Confirmed and can't be reverted
 * - DROPPED: Removed from mempool before inclusion
 * - REVERTED: Included but execution failed
 */
/**
 * Best Practice: Separate gas estimation from submission
 *
 * Allows:
 * - User review before commitment
 * - Alternative gas price options
 * - Estimated costs in USD or other currencies
 */
/**
 * Best Practice: Track subscription state, not just events
 *
 * Subscription states:
 * - INACTIVE: Not yet subscribed
 * - SUBSCRIBING: Connection in progress
 * - ACTIVE: Receiving events
 * - PAUSED: Temporarily paused
 * - ENDED: Explicitly ended
 * - RECONNECTING: Lost connection, trying to restore
 */
/**
 * Best Practice: Validate chain compatibility before operations
 *
 * Different chains have different characteristics:
 * - Block time
 * - Finality requirements
 * - Gas token
 * - Supported features
 */
/**
 * Best Practice: Handle Web3-specific errors with context-aware recovery
 */
/**
 * Best Practice: Understand batch operation guarantees
 *
 * Not all chains support atomic batches.
 * Make explicit choice between sequential and parallel execution.
 */
declare const _default: {
    patterns: string[];
};
export default _default;
//# sourceMappingURL=WEB3_SDK_USAGE_PATTERNS.d.ts.map