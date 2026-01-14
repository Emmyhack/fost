/**
 * SDK CODE GENERATOR - Main orchestrator
 *
 * Takes an SDK Design Plan and generates production-ready code.
 * Coordinates all builders and emitters to produce complete SDK.
 */

import * as AST from "./types";
import { TypeScriptEmitter } from "./emitter";
import {
  ClientClassBuilder,
  ErrorTypeBuilder,
  ConfigurationBuilder,
  MethodBuilder,
  TypeDefinitionBuilder,
} from "./generators";

/**
 * Result of code generation
 */
export interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  errors?: string[];
  warnings?: string[];
}

/**
 * Generated code file
 */
export interface GeneratedFile {
  path: string; // e.g., "lib/client.ts"
  language: string; // "typescript"
  content: string;
  type: "source" | "types" | "errors" | "config" | "example";
}

/**
 * Main SDK code generator
 */
export class SDKCodeGenerator {
  private plan: any;

  constructor(plan: any) {
    this.plan = plan;
    this.validatePlan();
  }

  /**
   * Validate that the design plan is complete
   */
  private validatePlan(): void {
    if (!this.plan.product?.name) {
      throw new Error("Design plan missing product.name");
    }
    if (!this.plan.client?.className) {
      throw new Error("Design plan missing client.className");
    }
    if (!this.plan.methods || this.plan.methods.length === 0) {
      throw new Error("Design plan must define at least one method");
    }
  }

  /**
   * Generate complete SDK
   */
  generate(): GenerationResult {
    const files: GeneratedFile[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Generate core files
      files.push(this.generateClientFile());
      files.push(this.generateErrorsFile());
      files.push(this.generateConfigFile());
      files.push(this.generateTypesFile());

      // Generate example file
      if (this.plan.options?.generateExamples !== false) {
        files.push(this.generateExampleFile());
      }

      // Generate package.json
      files.push(this.generatePackageJson());

      // Generate README
      files.push(this.generateReadme());

      return {
        success: true,
        files,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (err) {
      errors.push(`Generation failed: ${err instanceof Error ? err.message : String(err)}`);
      return {
        success: false,
        files,
        errors,
      };
    }
  }

  /**
   * Generate main client file
   */
  private generateClientFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements: AST.ASTStatement[] = [];

    // Imports
    statements.push({
      type: "ImportStatement",
      source: "./errors",
      imports: [
        { name: "SDKError" },
        { name: "ConfigError" },
        { name: "NetworkError" },
        { name: "APIError" },
      ],
    } as AST.ASTImportStatement);

    statements.push({
      type: "ImportStatement",
      source: "./config",
      imports: [
        { name: "ClientConfig" },
        { name: "createDefaultConfig" },
        { name: "RetryPolicy" },
      ],
    } as AST.ASTImportStatement);

    statements.push({
      type: "ImportStatement",
      source: "./types",
      imports: [{ name: "Logger" }, { name: "AuthHandler" }],
    } as AST.ASTImportStatement);

    // Build client class
    const clientClass = ClientClassBuilder.build(this.plan);
    statements.push(clientClass);

    // Add method implementations
    if (this.plan.methods && Array.isArray(this.plan.methods)) {
      this.plan.methods.forEach((methodPlan: any) => {
        const method = MethodBuilder.buildMethod(
          methodPlan,
          this.plan.client.className
        );
        clientClass.methods.push(method);
      });
    }

    // Add additional methods
    statements.push(this.buildErrorHandlerMethod());
    statements.push(this.buildRetryLogicMethod());

    const program: AST.ASTProgram = {
      type: "Program",
      body: statements,
    };

    const code = emitter.emitProgram(program);

    return {
      path: "lib/client.ts",
      language: "typescript",
      content: code,
      type: "source",
    };
  }

  /**
   * Generate errors file
   */
  private generateErrorsFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements = ErrorTypeBuilder.buildErrors(this.plan);

    const program: AST.ASTProgram = {
      type: "Program",
      body: statements,
    };

    const code = emitter.emitProgram(program);

    return {
      path: "lib/errors.ts",
      language: "typescript",
      content: code,
      type: "errors",
    };
  }

  /**
   * Generate config file
   */
  private generateConfigFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements = ConfigurationBuilder.buildConfig(this.plan);

    const program: AST.ASTProgram = {
      type: "Program",
      body: statements,
    };

    const code = emitter.emitProgram(program);

    return {
      path: "lib/config.ts",
      language: "typescript",
      content: code,
      type: "config",
    };
  }

  /**
   * Generate types file
   */
  private generateTypesFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements: AST.ASTStatement[] = [];

    // Logger interface
    statements.push({
      type: "InterfaceDeclaration",
      name: "Logger",
      isExported: true,
      documentation: "Logger interface for SDK",
      properties: [
        {
          type: "PropertyDeclaration",
          name: "debug",
          valueType: "(message: string, context?: any) => void",
          readonly: false,
          isPrivate: false,
        },
        {
          type: "PropertyDeclaration",
          name: "info",
          valueType: "(message: string, context?: any) => void",
          readonly: false,
          isPrivate: false,
        },
        {
          type: "PropertyDeclaration",
          name: "warn",
          valueType: "(message: string, context?: any) => void",
          readonly: false,
          isPrivate: false,
        },
        {
          type: "PropertyDeclaration",
          name: "error",
          valueType: "(message: string, context?: any) => void",
          readonly: false,
          isPrivate: false,
        },
      ],
    } as AST.ASTInterfaceDeclaration);

    // AuthHandler interface
    statements.push({
      type: "InterfaceDeclaration",
      name: "AuthHandler",
      isExported: true,
      documentation: "Authentication handler interface",
      properties: [
        {
          type: "PropertyDeclaration",
          name: "authenticate",
          valueType: "(request: any) => Promise<any>",
          readonly: false,
          isPrivate: false,
        },
        {
          type: "PropertyDeclaration",
          name: "isAuthenticated",
          valueType: "() => boolean",
          readonly: false,
          isPrivate: false,
        },
      ],
    } as AST.ASTInterfaceDeclaration);

    // Response wrapper type
    statements.push({
      type: "InterfaceDeclaration",
      name: "APIResponse",
      isExported: true,
      documentation: "Standard API response wrapper",
      properties: [
        {
          type: "PropertyDeclaration",
          name: "data",
          valueType: "T",
          readonly: false,
          isPrivate: false,
        },
        {
          type: "PropertyDeclaration",
          name: "status",
          valueType: "number",
          readonly: false,
          isPrivate: false,
        },
        {
          type: "PropertyDeclaration",
          name: "headers",
          valueType: "Record<string, string>",
          readonly: false,
          isPrivate: false,
        },
      ],
    } as AST.ASTInterfaceDeclaration);

    // Build custom types from plan
    if (this.plan.types && Array.isArray(this.plan.types)) {
      this.plan.types.forEach((typePlan: any) => {
        const typeStmt = TypeDefinitionBuilder.buildType(typePlan);
        statements.push(typeStmt);
      });
    }

    const program: AST.ASTProgram = {
      type: "Program",
      body: statements,
    };

    const code = emitter.emitProgram(program);

    return {
      path: "lib/types.ts",
      language: "typescript",
      content: code,
      type: "types",
    };
  }

  /**
   * Generate example usage file
   */
  private generateExampleFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements: AST.ASTStatement[] = [];

    // Imports
    statements.push({
      type: "ImportStatement",
      source: "../lib/client",
      imports: [{ name: this.plan.client.className }],
    } as AST.ASTImportStatement);

    statements.push({
      type: "ImportStatement",
      source: "../lib/config",
      imports: [{ name: "createDefaultConfig" }],
    } as AST.ASTImportStatement);

    // Main async function
    const mainFunc: AST.ASTFunctionDeclaration = {
      type: "FunctionDeclaration",
      name: "main",
      isExported: false,
      isAsync: true,
      parameters: [],
      returnType: "Promise<void>",
      documentation: `Example usage of ${this.plan.client.className}`,
      body: [
        {
          type: "VariableDeclaration",
          kind: "const",
          name: "config",
          valueType: "ClientConfig",
          initializer: {
            type: "CallExpression",
            callee: "createDefaultConfig",
            arguments: ['"your-api-key"'],
          } as AST.ASTExpression,
        } as AST.ASTStatement,
        {
          type: "VariableDeclaration",
          kind: "const",
          name: "client",
          valueType: this.plan.client.className,
          initializer: {
            type: "CallExpression",
            callee: `new ${this.plan.client.className}`,
            arguments: ["config"],
          } as AST.ASTExpression,
        } as AST.ASTStatement,
        {
          type: "VariableDeclaration",
          kind: "const",
          name: "result",
          valueType: "any",
          initializer: {
            type: "CallExpression",
            callee: "await client." + (this.plan.methods[0]?.name || "call"),
            arguments: this.plan.methods[0]?.parameters
              ?.slice(0, 2)
              .map((p: any) => `/* ${p.name} */`)
              || ["/* params */"],
          } as AST.ASTExpression,
        } as AST.ASTStatement,
        {
          type: "VariableDeclaration",
          kind: "console.log",
          name: '("Result:", result)',
          valueType: "",
        } as AST.ASTStatement,
      ],
    };

    statements.push(mainFunc);

    // Main invocation
    statements.push({
      type: "VariableDeclaration",
      kind: "main",
      name: "()\n  .catch(console.error)",
      valueType: "",
    } as AST.ASTStatement);

    const program: AST.ASTProgram = {
      type: "Program",
      body: statements,
    };

    const code = emitter.emitProgram(program);

    return {
      path: "examples/basic.ts",
      language: "typescript",
      content: code,
      type: "example",
    };
  }

  /**
   * Generate package.json
   */
  private generatePackageJson(): GeneratedFile {
    const pkg = {
      name: `@sdk/${this.plan.product.name}`,
      version: this.plan.product.version || "1.0.0",
      description: this.plan.product.description,
      main: "dist/lib/client.js",
      types: "dist/lib/client.d.ts",
      scripts: {
        build: "tsc",
        test: "jest",
        "test:coverage": "jest --coverage",
        lint: "eslint src/**/*.ts",
        format: "prettier --write src/**/*.ts",
      },
      dependencies: {
        axios: "^1.6.0",
      },
      devDependencies: {
        "@types/node": "^20.0.0",
        typescript: "^5.0.0",
        jest: "^29.0.0",
        "@types/jest": "^29.0.0",
        eslint: "^8.0.0",
        prettier: "^3.0.0",
      },
    };

    return {
      path: "package.json",
      language: "json",
      content: JSON.stringify(pkg, null, 2),
      type: "config",
    };
  }

  /**
   * Generate README
   */
  private generateReadme(): GeneratedFile {
    const readme = `# ${this.plan.product.name} SDK

${this.plan.product.description}

## Installation

\`\`\`bash
npm install @sdk/${this.plan.product.name}
\`\`\`

## Quick Start

\`\`\`typescript
import { ${this.plan.client.className} } from '@sdk/${this.plan.product.name}';
import { createDefaultConfig } from '@sdk/${this.plan.product.name}/config';

const config = createDefaultConfig('your-api-key');
const client = new ${this.plan.client.className}(config);

// Use the client
const result = await client.${this.plan.methods[0]?.name || 'call'}();
\`\`\`

## Configuration

The SDK requires a configuration object:

\`\`\`typescript
interface ClientConfig {
  apiKey: string;              // Required: Your API key
  baseUrl?: string;            // Optional: API base URL
  timeout?: number;            // Optional: Request timeout in ms
  retryPolicy?: RetryPolicy;   // Optional: Retry configuration
  logger?: Logger;             // Optional: Logger instance
}
\`\`\`

## Error Handling

The SDK throws specific error types:

- \`ConfigError\` - Configuration issues
- \`NetworkError\` - Network/HTTP errors
- \`APIError\` - API-returned errors
- \`SDKError\` - Base error class

\`\`\`typescript
import { APIError } from '@sdk/${this.plan.product.name}/errors';

try {
  await client.${this.plan.methods[0]?.name || 'call'}();
} catch (error) {
  if (error instanceof APIError) {
    console.error('API error:', error.code, error.message);
  }
}
\`\`\`

## Available Methods

${this.plan.methods
  ?.map(
    (m: any) =>
      `### \`${m.name}(${m.parameters.map((p: any) => p.name).join(", ")})\`\n\n${m.description || "No description provided"}`
  )
  .join("\n\n")}

## API Reference

For full API documentation, see [API.md](./API.md).

## License

${this.plan.product.license || "MIT"}
`;

    return {
      path: "README.md",
      language: "markdown",
      content: readme,
      type: "source",
    };
  }

  /**
   * Build error handler method
   */
  private buildErrorHandlerMethod(): AST.ASTMethodDeclaration {
    return {
      type: "MethodDeclaration",
      name: "private handleError",
      isAsync: false,
      isPrivate: true,
      parameters: [
        {
          type: "Parameter",
          name: "error",
          parameterType: "any",
          optional: false,
        },
      ],
      returnType: "never",
      documentation: "Transform HTTP errors into SDK errors",
      body: [
        {
          type: "IfStatement",
          condition: {
            type: "BinaryExpression",
            left: {
              type: "MemberExpression",
              object: "error",
              property: "response",
              computed: false,
            } as AST.ASTExpression,
            operator: "&&",
            right: {
              type: "MemberExpression",
              object: "error.response",
              property: "status",
              computed: false,
            } as AST.ASTExpression,
          } as any,
          consequent: [
            {
              type: "ThrowStatement",
              argument: {
                type: "CallExpression",
                callee: "new NetworkError",
                arguments: [
                  "error.response.statusText || error.message",
                  "error.response.status",
                ],
              } as AST.ASTExpression,
            } as AST.ASTStatement,
          ],
        } as AST.ASTStatement,
        {
          type: "ThrowStatement",
          argument: {
            type: "CallExpression",
            callee: "new NetworkError",
            arguments: ["error.message || String(error)"],
          } as AST.ASTExpression,
        } as AST.ASTStatement,
      ],
    };
  }

  /**
   * Build retry logic method
   */
  private buildRetryLogicMethod(): AST.ASTMethodDeclaration {
    return {
      type: "MethodDeclaration",
      name: "private async retry",
      isAsync: true,
      isPrivate: true,
      parameters: [
        {
          type: "Parameter",
          name: "fn",
          parameterType: "() => Promise<any>",
          optional: false,
        },
        {
          type: "Parameter",
          name: "policy",
          parameterType: "RetryPolicy",
          optional: false,
        },
      ],
      returnType: "Promise<any>",
      documentation: "Execute function with automatic retry logic",
      body: [
        {
          type: "VariableDeclaration",
          kind: "let",
          name: "lastError",
          valueType: "Error | null",
          initializer: {
            type: "Literal",
            value: null,
            raw: "null",
          } as AST.ASTExpression,
        } as AST.ASTStatement,
        {
          type: "ForStatement",
          init: "let i = 0",
          condition: {
            type: "BinaryExpression",
            left: {
              type: "Identifier",
              name: "i",
            } as AST.ASTExpression,
            operator: "<=",
            right: {
              type: "MemberExpression",
              object: "policy",
              property: "maxRetries",
              computed: false,
            } as AST.ASTExpression,
          } as any,
          update: "i++",
          body: [
            {
              type: "TryCatchStatement",
              tryBlock: [
                {
                  type: "ReturnStatement",
                  argument: {
                    type: "CallExpression",
                    callee: "await fn",
                    arguments: [],
                  } as AST.ASTExpression,
                } as AST.ASTStatement,
              ],
              catchClause: {
                param: "error",
                body: [
                  {
                    type: "VariableDeclaration",
                    kind: "lastError = error as Error",
                    name: "",
                    valueType: "",
                  } as AST.ASTStatement,
                  {
                    type: "IfStatement",
                    condition: {
                      type: "BinaryExpression",
                      left: {
                        type: "Identifier",
                        name: "i",
                      } as AST.ASTExpression,
                      operator: "===",
                      right: {
                        type: "MemberExpression",
                        object: "policy",
                        property: "maxRetries",
                        computed: false,
                      } as AST.ASTExpression,
                    } as any,
                    consequent: [
                      {
                        type: "ThrowStatement",
                        argument: {
                          type: "Identifier",
                          name: "error",
                        } as AST.ASTExpression,
                      } as AST.ASTStatement,
                    ],
                  } as AST.ASTStatement,
                ],
              },
            } as AST.ASTStatement,
          ],
        } as AST.ASTStatement,
        {
          type: "ThrowStatement",
          argument: {
            type: "Identifier",
            name: "lastError",
          } as AST.ASTExpression,
        } as AST.ASTStatement,
      ],
    };
  }
}
