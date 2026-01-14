/**
 * INPUT ANALYSIS LAYER - EXAMPLES
 *
 * Demonstrates normalization of real-world API specs and smart contracts.
 * Shows deterministic parsing with no hallucination.
 */
import { InputSpec } from "./types";
export declare const EXAMPLE_OPENAPI_SPEC: InputSpec;
/**
 * Expected normalized output for EXAMPLE_OPENAPI_SPEC:
 *
 * product: {
 *   name: "payment-api",
 *   version: "1.0.0",
 *   apiVersion: "3.0.0",
 *   description: "Simple payment processing API"
 * }
 *
 * types: {
 *   PaymentIntent: {
 *     name: "PaymentIntent",
 *     type: "object",
 *     fields: {
 *       id: { type: "string", required: true },
 *       amount: { type: "integer", required: true },
 *       currency: { type: "string", required: true },
 *       status: { type: "enum", enum: ["pending", "succeeded", "failed", "canceled"] },
 *       ...
 *     }
 *   },
 *   CreatePaymentRequest: {...},
 *   Error: {...}
 * }
 *
 * operations: [
 *   {
 *     id: "createPayment",
 *     name: "Create a payment intent",
 *     method: "POST",
 *     path: "/payments",
 *     parameters: [{ name: "amount", type: "integer", location: "body", required: true }],
 *     response: { type: "PaymentIntent", statusCode: 201 },
 *     errors: ["BAD_REQUEST", "UNAUTHORIZED", "RATE_LIMITED"],
 *     authentication: { required: true, type: "bearer" }
 *   },
 *   {
 *     id: "listPayments",
 *     name: "List payment intents",
 *     method: "GET",
 *     path: "/payments",
 *     parameters: [
 *       { name: "limit", type: "integer", location: "query", required: false },
 *       { name: "cursor", type: "string", location: "query", required: false }
 *     ],
 *     response: { type: "object" },
 *     errors: ["UNAUTHORIZED"]
 *   },
 *   {
 *     id: "getPayment",
 *     name: "Get a payment intent",
 *     method: "GET",
 *     path: "/payments/{payment_id}",
 *     parameters: [{ name: "payment_id", type: "string", location: "path", required: true }],
 *     response: { type: "PaymentIntent", statusCode: 200 },
 *     errors: ["NOT_FOUND"]
 *   }
 * ]
 *
 * authentication: {
 *   type: "bearer",
 *   required: true
 * }
 */
export declare const EXAMPLE_CONTRACT_ABI: InputSpec;
/**
 * Expected normalized output for EXAMPLE_CONTRACT_ABI:
 *
 * product: {
 *   name: "uniswapv3router",
 *   version: "1.0.0",
 *   description: "Uniswap V3 Swap Router"
 * }
 *
 * operations: [
 *   {
 *     id: "exactInputSingle",
 *     name: "exactInputSingle",
 *     method: "function",
 *     functionName: "exactInputSingle",
 *     parameters: [
 *       {
 *         name: "params",
 *         type: "tuple",
 *         location: "input",
 *         required: true
 *       }
 *     ],
 *     response: { type: "BigInt" },
 *     errors: ["REVERT", "GAS_ERROR"],
 *     authentication: { required: true, type: "wallet" },
 *     tags: ["payable"]
 *   },
 *   {
 *     id: "estimateGas",
 *     name: "estimateGas",
 *     method: "function",
 *     functionName: "estimateGas",
 *     parameters: [...],
 *     response: { type: "BigInt" },
 *     errors: ["REVERT"],
 *     authentication: { required: false, type: "none" },
 *     tags: ["view"]
 *   }
 * ]
 *
 * errors: [
 *   { code: "REVERT", message: "Transaction reverted" },
 *   { code: "InsufficientBalance", message: "Insufficient balance" },
 *   { code: "TooMuchSlippage", message: "Too much slippage" }
 * ]
 *
 * authentication: {
 *   type: "custom",
 *   required: true,
 *   description: "Requires signed transactions via wallet"
 * }
 */
/**
 * Run normalization examples
 */
export declare function runExamples(): void;
//# sourceMappingURL=examples.d.ts.map