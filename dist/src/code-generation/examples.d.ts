/**
 * SDK CODE GENERATION - Complete Example
 *
 * This example demonstrates the full code generation pipeline:
 * Design Plan → SDK Code Generator → Generated TypeScript SDK
 *
 * Use case: Generate Stripe SDK from design plan
 */
/**
 * Step 1: Define SDK Design Plan
 *
 * This plan describes exactly what code to generate.
 * It's the output from the SDK Design layer.
 */
export declare const STRIPE_SDK_DESIGN_PLAN: {
    product: {
        name: string;
        version: string;
        description: string;
        apiVersion: string;
    };
    target: {
        language: "typescript";
        platform: "both";
        packageManager: "npm";
    };
    client: {
        className: string;
        baseUrl: string;
        timeout: number;
        retryPolicy: {
            maxRetries: number;
            backoffMultiplier: number;
            initialDelayMs: number;
        };
    };
    methods: ({
        name: string;
        description: string;
        category: string;
        httpMethod: "GET";
        endpoint: string;
        parameters: ({
            name: string;
            type: string;
            required: boolean;
            description: string;
            validation: {
                min: number;
                max: number;
            };
        } | {
            name: string;
            type: string;
            required: boolean;
            description: string;
            validation?: undefined;
        })[];
        returns: {
            type: string;
            isAsync: boolean;
            isStream: boolean;
        };
        throws: string[];
        requiresAuth: boolean;
        authType: "bearer";
        rateLimit: {
            requestsPerSecond: number;
        };
    } | {
        name: string;
        description: string;
        category: string;
        httpMethod: "GET";
        endpoint: string;
        parameters: {
            name: string;
            type: string;
            required: boolean;
            description: string;
        }[];
        returns: {
            type: string;
            isAsync: boolean;
            isStream: boolean;
        };
        throws: string[];
        requiresAuth: boolean;
        authType: "bearer";
        rateLimit?: undefined;
    } | {
        name: string;
        description: string;
        category: string;
        httpMethod: "POST";
        endpoint: string;
        parameters: ({
            name: string;
            type: string;
            required: boolean;
            description: string;
            validation: {
                min: number;
                minLength?: undefined;
                maxLength?: undefined;
            };
        } | {
            name: string;
            type: string;
            required: boolean;
            description: string;
            validation: {
                minLength: number;
                maxLength: number;
                min?: undefined;
            };
        } | {
            name: string;
            type: string;
            required: boolean;
            description: string;
            validation?: undefined;
        })[];
        returns: {
            type: string;
            isAsync: boolean;
            isStream: boolean;
        };
        throws: string[];
        requiresAuth: boolean;
        authType: "bearer";
        rateLimit?: undefined;
    })[];
    types: ({
        name: string;
        kind: "interface";
        description: string;
        isExported: boolean;
        fields: {
            name: string;
            type: string;
            required: boolean;
            readonly: boolean;
        }[];
        enumValues?: undefined;
    } | {
        name: string;
        kind: "enum";
        description: string;
        isExported: boolean;
        enumValues: {
            name: string;
            value: string;
        }[];
        fields?: undefined;
    })[];
    errors: ({
        name: string;
        statusCode: number;
        message: string;
        description: string;
        extendsFrom: string;
        properties: {
            name: string;
            type: string;
            description: string;
        }[];
    } | {
        name: string;
        statusCode: number;
        message: string;
        description: string;
        extendsFrom: string;
        properties?: undefined;
    })[];
    auth: {
        type: "bearer";
        configurable: boolean;
        bearer: {
            prefix: string;
        };
    };
    config: {
        apiKey: {
            required: boolean;
            description: string;
        };
        baseUrl: {
            required: boolean;
            default: string;
            description: string;
        };
        timeout: {
            required: boolean;
            default: number;
        };
        environment: {
            required: boolean;
            options: string[];
            default: string;
        };
    };
    outputStructure: {
        root: string;
        src: string;
        lib: {
            client: string;
            types: string;
            errors: string;
            config: string;
            auth: string;
            utils: string;
        };
    };
    options: {
        generateTypes: boolean;
        generateErrors: boolean;
        generateTests: boolean;
        generateExamples: boolean;
        generateReadme: boolean;
        strictTypes: boolean;
        emitJSDoc: boolean;
        includeExamples: boolean;
        formatCode: boolean;
        formatter: "prettier";
    };
};
/**
 * Step 2: Generate SDK
 *
 * Pass the design plan to the generator and get back generated files.
 */
export declare function generateStripeSDK(): import("../code-generation").GeneratedFile[] | null;
/**
 * Step 3: Show Sample Generated Code
 *
 * Display portions of the generated code
 */
export declare function showGeneratedCodeSamples(files: any[]): void;
/**
 * Step 4: Example Usage of Generated SDK
 *
 * Shows how to use the generated client
 */
export declare const GENERATED_SDK_USAGE_EXAMPLE = "\n// examples/basic.ts\n\nimport { StripeClient } from '@sdk/stripe';\nimport { createDefaultConfig } from '@sdk/stripe/config';\nimport { APIError, NetworkError, ValidationError } from '@sdk/stripe/errors';\n\nasync function main() {\n  // 1. Configure the client\n  const config = createDefaultConfig('sk_live_xxx');\n  config.timeout = 45000;  // Increase timeout for slow networks\n  config.retryPolicy = {\n    maxRetries: 5,\n    backoffMultiplier: 2,\n    initialDelayMs: 100\n  };\n\n  // 2. Create client instance\n  const client = new StripeClient(config);\n\n  // 3. List accounts\n  try {\n    const accounts = await client.listAccounts(10);\n    console.log(`Found ${accounts.data.length} accounts`);\n\n    accounts.data.forEach(account => {\n      console.log(`  - ${account.id}: ${account.email} (${account.status})`);\n    });\n  } catch (error) {\n    if (error instanceof NetworkError) {\n      console.error('Network error:', error.message);\n    } else if (error instanceof APIError) {\n      console.error('API error:', error.code, error.message);\n    } else {\n      throw error;\n    }\n  }\n\n  // 4. Create payment intent\n  try {\n    const paymentIntent = await client.createPaymentIntent({\n      amount: 5000,  // $50.00\n      currency: 'usd',\n      description: 'Test payment'\n    });\n\n    console.log(`Created payment intent: ${paymentIntent.id}`);\n    console.log(`Client secret: ${paymentIntent.clientSecret}`);\n  } catch (error) {\n    if (error instanceof ValidationError) {\n      console.error('Validation failed:', error.message);\n    } else {\n      throw error;\n    }\n  }\n\n  // 5. Confirm payment intent\n  try {\n    const confirmed = await client.confirmPaymentIntent(\n      'pi_xxx',\n      'pm_xxx'\n    );\n\n    console.log(`Payment status: ${confirmed.status}`);\n  } catch (error) {\n    console.error('Confirmation failed:', error.message);\n  }\n}\n\nmain().catch(console.error);\n";
/**
 * Main execution
 */
export declare function runExample(): void;
//# sourceMappingURL=examples.d.ts.map