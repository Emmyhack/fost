/**
 * SDK CODE GENERATION - Complete Example
 *
 * This example demonstrates the full code generation pipeline:
 * Design Plan → SDK Code Generator → Generated TypeScript SDK
 *
 * Use case: Generate Stripe SDK from design plan
 */

import { SDKCodeGenerator } from "../code-generation";

/**
 * Step 1: Define SDK Design Plan
 *
 * This plan describes exactly what code to generate.
 * It's the output from the SDK Design layer.
 */
export const STRIPE_SDK_DESIGN_PLAN = {
  product: {
    name: "stripe",
    version: "1.0.0",
    description: "Type-safe Stripe API client for TypeScript",
    apiVersion: "2024-01-01",
  },

  target: {
    language: "typescript" as const,
    platform: "both" as const,
    packageManager: "npm" as const,
  },

  client: {
    className: "StripeClient",
    baseUrl: "https://api.stripe.com",
    timeout: 30000,
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelayMs: 100,
    },
  },

  methods: [
    {
      name: "listAccounts",
      description: "List all connected accounts",
      category: "accounts",
      httpMethod: "GET" as const,
      endpoint: "/v1/accounts",
      parameters: [
        {
          name: "limit",
          type: "number",
          required: false,
          description: "Maximum number of accounts to return",
          validation: { min: 1, max: 100 },
        },
        {
          name: "startingAfter",
          type: "string",
          required: false,
          description: "Pagination cursor",
        },
      ],
      returns: {
        type: "AccountListResponse",
        isAsync: true,
        isStream: false,
      },
      throws: ["NetworkError", "APIError"],
      requiresAuth: true,
      authType: "bearer" as const,
      rateLimit: {
        requestsPerSecond: 100,
      },
    },

    {
      name: "getAccount",
      description: "Get a specific account by ID",
      category: "accounts",
      httpMethod: "GET" as const,
      endpoint: "/v1/accounts/{id}",
      parameters: [
        {
          name: "id",
          type: "string",
          required: true,
          description: "Account ID",
        },
      ],
      returns: {
        type: "Account",
        isAsync: true,
        isStream: false,
      },
      throws: ["NetworkError", "APIError"],
      requiresAuth: true,
      authType: "bearer" as const,
    },

    {
      name: "createPaymentIntent",
      description: "Create a new payment intent",
      category: "payments",
      httpMethod: "POST" as const,
      endpoint: "/v1/payment_intents",
      parameters: [
        {
          name: "amount",
          type: "number",
          required: true,
          description: "Amount in cents",
          validation: { min: 50 },
        },
        {
          name: "currency",
          type: "string",
          required: true,
          description: "ISO 4217 currency code",
          validation: { minLength: 3, maxLength: 3 },
        },
        {
          name: "customerId",
          type: "string",
          required: false,
          description: "Customer ID",
        },
        {
          name: "description",
          type: "string",
          required: false,
          description: "Payment description",
        },
      ],
      returns: {
        type: "PaymentIntent",
        isAsync: true,
        isStream: false,
      },
      throws: ["NetworkError", "APIError", "ValidationError"],
      requiresAuth: true,
      authType: "bearer" as const,
    },

    {
      name: "confirmPaymentIntent",
      description: "Confirm a payment intent",
      category: "payments",
      httpMethod: "POST" as const,
      endpoint: "/v1/payment_intents/{id}/confirm",
      parameters: [
        {
          name: "id",
          type: "string",
          required: true,
          description: "Payment intent ID",
        },
        {
          name: "paymentMethod",
          type: "string",
          required: true,
          description: "Payment method ID",
        },
      ],
      returns: {
        type: "PaymentIntent",
        isAsync: true,
        isStream: false,
      },
      throws: ["NetworkError", "APIError"],
      requiresAuth: true,
      authType: "bearer" as const,
    },
  ],

  types: [
    {
      name: "Account",
      kind: "interface" as const,
      description: "Stripe connected account",
      isExported: true,
      fields: [
        { name: "id", type: "string", required: true, readonly: true },
        { name: "email", type: "string", required: true, readonly: false },
        { name: "status", type: "AccountStatus", required: true, readonly: false },
        { name: "created", type: "Date", required: true, readonly: true },
        { name: "country", type: "string", required: false, readonly: false },
      ],
    },

    {
      name: "AccountListResponse",
      kind: "interface" as const,
      description: "Paginated list of accounts",
      isExported: true,
      fields: [
        { name: "object", type: '"list"', required: true, readonly: true },
        { name: "data", type: "Account[]", required: true, readonly: false },
        { name: "hasMore", type: "boolean", required: true, readonly: false },
        { name: "url", type: "string", required: true, readonly: true },
      ],
    },

    {
      name: "PaymentIntent",
      kind: "interface" as const,
      description: "Stripe payment intent",
      isExported: true,
      fields: [
        { name: "id", type: "string", required: true, readonly: true },
        { name: "amount", type: "number", required: true, readonly: false },
        { name: "currency", type: "string", required: true, readonly: false },
        { name: "status", type: "PaymentStatus", required: true, readonly: false },
        { name: "customerId", type: "string", required: false, readonly: false },
        { name: "clientSecret", type: "string", required: true, readonly: true },
        { name: "created", type: "Date", required: true, readonly: true },
      ],
    },

    {
      name: "AccountStatus",
      kind: "enum" as const,
      description: "Status of a connected account",
      isExported: true,
      enumValues: [
        { name: "ACTIVE", value: "active" },
        { name: "PENDING", value: "pending" },
        { name: "RESTRICTED", value: "restricted" },
        { name: "SUSPENDED", value: "suspended" },
        { name: "CLOSED", value: "closed" },
      ],
    },

    {
      name: "PaymentStatus",
      kind: "enum" as const,
      description: "Status of a payment intent",
      isExported: true,
      enumValues: [
        { name: "REQUIRES_PAYMENT_METHOD", value: "requires_payment_method" },
        { name: "REQUIRES_CONFIRMATION", value: "requires_confirmation" },
        { name: "REQUIRES_ACTION", value: "requires_action" },
        { name: "PROCESSING", value: "processing" },
        { name: "SUCCEEDED", value: "succeeded" },
        { name: "CANCELED", value: "canceled" },
      ],
    },
  ],

  errors: [
    {
      name: "ValidationError",
      statusCode: 400,
      message: "Invalid request parameters",
      description: "Validation failed for request parameters",
      extendsFrom: "SDKError",
      properties: [
        {
          name: "fieldName",
          type: "string",
          description: "Name of the invalid field",
        },
        {
          name: "reason",
          type: "string",
          description: "Validation failure reason",
        },
      ],
    },

    {
      name: "AuthenticationError",
      statusCode: 401,
      message: "Authentication failed",
      description: "API key or credentials are invalid",
      extendsFrom: "SDKError",
    },

    {
      name: "RateLimitError",
      statusCode: 429,
      message: "Too many requests",
      description: "Rate limit exceeded",
      extendsFrom: "SDKError",
      properties: [
        {
          name: "retryAfter",
          type: "number",
          description: "Seconds to wait before retrying",
        },
      ],
    },

    {
      name: "NotFoundError",
      statusCode: 404,
      message: "Resource not found",
      description: "The requested resource does not exist",
      extendsFrom: "SDKError",
      properties: [
        {
          name: "resourceId",
          type: "string",
          description: "ID of the resource that was not found",
        },
      ],
    },
  ],

  auth: {
    type: "bearer" as const,
    configurable: true,
    bearer: {
      prefix: "Bearer ",
    },
  },

  config: {
    apiKey: {
      required: true,
      description: "Stripe API secret key",
    },
    baseUrl: {
      required: false,
      default: "https://api.stripe.com",
      description: "Stripe API base URL",
    },
    timeout: {
      required: false,
      default: 30000,
    },
    environment: {
      required: false,
      options: ["production", "sandbox"],
      default: "production",
    },
  },

  outputStructure: {
    root: ".",
    src: "src",
    lib: {
      client: "src/client.ts",
      types: "src/types.ts",
      errors: "src/errors.ts",
      config: "src/config.ts",
      auth: "src/auth.ts",
      utils: "src/utils.ts",
    },
  },

  options: {
    generateTypes: true,
    generateErrors: true,
    generateTests: true,
    generateExamples: true,
    generateReadme: true,
    strictTypes: true,
    emitJSDoc: true,
    includeExamples: true,
    formatCode: true,
    formatter: "prettier" as const,
  },
};

/**
 * Step 2: Generate SDK
 *
 * Pass the design plan to the generator and get back generated files.
 */
export function generateStripeSDK() {
  const generator = new SDKCodeGenerator(STRIPE_SDK_DESIGN_PLAN);
  const result = generator.generate();

  if (!result.success) {
    console.error("Generation failed:", result.errors);
    return null;
  }

  console.log(`✓ Generated ${result.files.length} files`);

  // Display file summary
  result.files.forEach((file) => {
    const lineCount = file.content.split("\n").length;
    console.log(`  - ${file.path} (${lineCount} lines, ${file.type})`);
  });

  return result.files;
}

/**
 * Step 3: Show Sample Generated Code
 *
 * Display portions of the generated code
 */
export function showGeneratedCodeSamples(files: any[]) {
  console.log("\n" + "=".repeat(80));
  console.log("SAMPLE GENERATED CODE");
  console.log("=".repeat(80) + "\n");

  // Find and display client file
  const clientFile = files.find((f) => f.path === "lib/client.ts");
  if (clientFile) {
    console.log("lib/client.ts (truncated):\n");
    const lines = clientFile.content.split("\n").slice(0, 100);
    console.log(lines.join("\n"));
    console.log("\n...\n");
  }

  // Find and display types file
  const typesFile = files.find((f) => f.path === "lib/types.ts");
  if (typesFile) {
    console.log("\nlib/types.ts (truncated):\n");
    const lines = typesFile.content.split("\n").slice(0, 50);
    console.log(lines.join("\n"));
    console.log("\n...\n");
  }

  // Find and display errors file
  const errorsFile = files.find((f) => f.path === "lib/errors.ts");
  if (errorsFile) {
    console.log("\nlib/errors.ts (first 50 lines):\n");
    const lines = errorsFile.content.split("\n").slice(0, 50);
    console.log(lines.join("\n"));
    console.log("\n...\n");
  }
}

/**
 * Step 4: Example Usage of Generated SDK
 *
 * Shows how to use the generated client
 */
export const GENERATED_SDK_USAGE_EXAMPLE = `
// examples/basic.ts

import { StripeClient } from '@sdk/stripe';
import { createDefaultConfig } from '@sdk/stripe/config';
import { APIError, NetworkError, ValidationError } from '@sdk/stripe/errors';

async function main() {
  // 1. Configure the client
  const config = createDefaultConfig('sk_live_xxx');
  config.timeout = 45000;  // Increase timeout for slow networks
  config.retryPolicy = {
    maxRetries: 5,
    backoffMultiplier: 2,
    initialDelayMs: 100
  };

  // 2. Create client instance
  const client = new StripeClient(config);

  // 3. List accounts
  try {
    const accounts = await client.listAccounts(10);
    console.log(\`Found \${accounts.data.length} accounts\`);

    accounts.data.forEach(account => {
      console.log(\`  - \${account.id}: \${account.email} (\${account.status})\`);
    });
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error('Network error:', error.message);
    } else if (error instanceof APIError) {
      console.error('API error:', error.code, error.message);
    } else {
      throw error;
    }
  }

  // 4. Create payment intent
  try {
    const paymentIntent = await client.createPaymentIntent({
      amount: 5000,  // $50.00
      currency: 'usd',
      description: 'Test payment'
    });

    console.log(\`Created payment intent: \${paymentIntent.id}\`);
    console.log(\`Client secret: \${paymentIntent.clientSecret}\`);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation failed:', error.message);
    } else {
      throw error;
    }
  }

  // 5. Confirm payment intent
  try {
    const confirmed = await client.confirmPaymentIntent(
      'pi_xxx',
      'pm_xxx'
    );

    console.log(\`Payment status: \${confirmed.status}\`);
  } catch (error) {
    console.error('Confirmation failed:', error.message);
  }
}

main().catch(console.error);
`;

/**
 * Main execution
 */
export function runExample() {
  console.log("\n" + "=".repeat(80));
  console.log("SDK CODE GENERATION EXAMPLE - Stripe");
  console.log("=".repeat(80) + "\n");

  console.log("Step 1: Design plan defined ✓");
  console.log("Step 2: Generating SDK...\n");

  const files = generateStripeSDK();
  if (!files) {
    console.error("Generation failed");
    return;
  }

  // showGeneratedCodeSamples(files);

  console.log("\nStep 3: Example usage:\n");
  console.log(GENERATED_SDK_USAGE_EXAMPLE);

  console.log("\n" + "=".repeat(80));
  console.log("Generation complete!");
  console.log("=".repeat(80) + "\n");
}

// Run if executed directly
if (require.main === module) {
  runExample();
}
