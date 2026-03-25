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

export interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  errors?: string[];
  warnings?: string[];
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
  type: "source" | "types" | "errors" | "config" | "example";
}

export class SDKCodeGenerator {
  private plan: any;

  constructor(plan: any) {
    this.plan = plan;
    this.validatePlan();
  }

  private validatePlan(): void {
    if (!this.plan.product?.name) throw new Error("Design plan missing product.name");
    if (!this.plan.client?.className) throw new Error("Design plan missing client.className");
    if (!this.plan.methods || this.plan.methods.length === 0) {
      throw new Error("Design plan must define at least one method");
    }
  }

  generate(): GenerationResult {
    const files: GeneratedFile[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      files.push(this.generateClientFile());
      files.push(this.generateErrorsFile());
      files.push(this.generateConfigFile());
      files.push(this.generateTypesFile());

      if (this.plan.options?.generateExamples !== false) {
        files.push(this.generateExampleFile());
      }

      files.push(this.generatePackageJson());
      files.push(this.generateReadme());

      return {
        success: true,
        files,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (err) {
      errors.push(`Generation failed: ${err instanceof Error ? err.message : String(err)}`);
      return { success: false, files, errors };
    }
  }

  private generateClientFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements: AST.ASTStatement[] = [];

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

    const clientClass = ClientClassBuilder.build(this.plan);

    // Add SDK method implementations to the class
    if (this.plan.methods && Array.isArray(this.plan.methods)) {
      this.plan.methods.forEach((methodPlan: any) => {
        const method = MethodBuilder.buildMethod(methodPlan, this.plan.client.className);
        clientClass.methods.push(method);
      });
    }

    // FIX: push helper methods into clientClass.methods, NOT into statements[].
    // Previously they were pushed to the top-level statements array which caused
    // them to be emitted as standalone top-level functions outside the class body,
    // meaning `this.handleError` and `this.retry` were undefined at runtime.
    clientClass.methods.push(this.buildErrorHandlerMethod());
    clientClass.methods.push(this.buildRetryLogicMethod());

    statements.push(clientClass);

    const program: AST.ASTProgram = { type: "Program", body: statements };

    return {
      path: "lib/client.ts",
      language: "typescript",
      content: emitter.emitProgram(program),
      type: "source",
    };
  }

  private generateErrorsFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements = ErrorTypeBuilder.buildErrors(this.plan);
    const program: AST.ASTProgram = { type: "Program", body: statements };
    return {
      path: "lib/errors.ts",
      language: "typescript",
      content: emitter.emitProgram(program),
      type: "errors",
    };
  }

  private generateConfigFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements = ConfigurationBuilder.buildConfig(this.plan);
    const program: AST.ASTProgram = { type: "Program", body: statements };
    return {
      path: "lib/config.ts",
      language: "typescript",
      content: emitter.emitProgram(program),
      type: "config",
    };
  }

  private generateTypesFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements: AST.ASTStatement[] = [];

    statements.push({
      type: "InterfaceDeclaration",
      name: "Logger",
      isExported: true,
      documentation: "Logger interface for SDK",
      properties: [
        { type: "PropertyDeclaration", name: "debug", valueType: "(message: string, context?: any) => void", readonly: false, isPrivate: false },
        { type: "PropertyDeclaration", name: "info",  valueType: "(message: string, context?: any) => void", readonly: false, isPrivate: false },
        { type: "PropertyDeclaration", name: "warn",  valueType: "(message: string, context?: any) => void", readonly: false, isPrivate: false },
        { type: "PropertyDeclaration", name: "error", valueType: "(message: string, context?: any) => void", readonly: false, isPrivate: false },
      ],
    } as AST.ASTInterfaceDeclaration);

    statements.push({
      type: "InterfaceDeclaration",
      name: "AuthHandler",
      isExported: true,
      documentation: "Authentication handler interface",
      properties: [
        { type: "PropertyDeclaration", name: "authenticate",    valueType: "(request: any) => Promise<any>", readonly: false, isPrivate: false },
        { type: "PropertyDeclaration", name: "isAuthenticated", valueType: "() => boolean",                  readonly: false, isPrivate: false },
      ],
    } as AST.ASTInterfaceDeclaration);

    statements.push({
      type: "InterfaceDeclaration",
      name: "APIResponse",
      isExported: true,
      documentation: "Standard API response wrapper",
      properties: [
        { type: "PropertyDeclaration", name: "data",    valueType: "T",                      readonly: false, isPrivate: false },
        { type: "PropertyDeclaration", name: "status",  valueType: "number",                 readonly: false, isPrivate: false },
        { type: "PropertyDeclaration", name: "headers", valueType: "Record<string, string>", readonly: false, isPrivate: false },
      ],
    } as AST.ASTInterfaceDeclaration);

    if (this.plan.types && Array.isArray(this.plan.types)) {
      this.plan.types.forEach((typePlan: any) => {
        statements.push(TypeDefinitionBuilder.buildType(typePlan));
      });
    }

    const program: AST.ASTProgram = { type: "Program", body: statements };
    return {
      path: "lib/types.ts",
      language: "typescript",
      content: emitter.emitProgram(program),
      type: "types",
    };
  }

  private generateExampleFile(): GeneratedFile {
    const emitter = new TypeScriptEmitter();
    const statements: AST.ASTStatement[] = [];

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
            arguments:
              this.plan.methods[0]?.parameters
                ?.slice(0, 2)
                .map((p: any) => `/* ${p.name} */`) || ["/* params */"],
          } as AST.ASTExpression,
        } as AST.ASTStatement,
        // FIX: use ASTRawStatement instead of abusing VariableDeclaration.kind
        {
          type: "RawStatement",
          code: 'console.log("Result:", result)',
        } as AST.ASTRawStatement,
      ],
    };

    statements.push(mainFunc);
    // FIX: main() invocation as a proper raw statement
    statements.push({
      type: "RawStatement",
      code: "main()\n  .catch(console.error)",
    } as AST.ASTRawStatement);

    const program: AST.ASTProgram = { type: "Program", body: statements };
    return {
      path: "examples/basic.ts",
      language: "typescript",
      content: emitter.emitProgram(program),
      type: "example",
    };
  }

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
      dependencies: { axios: "^1.6.0" },
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

const result = await client.${this.plan.methods[0]?.name || "call"}();
\`\`\`

## Error Handling

- \`ConfigError\` — Configuration issues
- \`NetworkError\` — Network/HTTP errors
- \`APIError\` — API-returned errors
- \`SDKError\` — Base error class

## Available Methods

${(this.plan.methods as any[])
  .map(
    (m) =>
      `### \`${m.name}(${(m.parameters as any[]).map((p: any) => p.name).join(", ")})\`\n\n${m.description || "No description provided"}`
  )
  .join("\n\n")}

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

  private buildErrorHandlerMethod(): AST.ASTMethodDeclaration {
    return {
      type: "MethodDeclaration",
      name: "private handleError",
      isAsync: false,
      isPrivate: true,
      parameters: [
        { type: "Parameter", name: "error", parameterType: "any", optional: false },
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

  private buildRetryLogicMethod(): AST.ASTMethodDeclaration {
    return {
      type: "MethodDeclaration",
      name: "private async retry",
      isAsync: true,
      isPrivate: true,
      parameters: [
        { type: "Parameter", name: "fn",     parameterType: "() => Promise<any>", optional: false },
        { type: "Parameter", name: "policy", parameterType: "RetryPolicy",        optional: false },
      ],
      returnType: "Promise<any>",
      documentation: "Execute function with automatic retry logic",
      body: [
        {
          type: "VariableDeclaration",
          kind: "let",
          name: "lastError",
          valueType: "Error | null",
          initializer: { type: "Literal", value: null, raw: "null" } as AST.ASTExpression,
        } as AST.ASTStatement,
        {
          type: "ForStatement",
          init: "let i = 0",
          condition: {
            type: "BinaryExpression",
            left: { type: "Identifier", name: "i" } as AST.ASTExpression,
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
                  // FIX: use ASTRawStatement for assignment statements
                  { type: "RawStatement", code: "lastError = error as Error" } as AST.ASTRawStatement,
                  {
                    type: "IfStatement",
                    condition: {
                      type: "BinaryExpression",
                      left: { type: "Identifier", name: "i" } as AST.ASTExpression,
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
                        argument: { type: "Identifier", name: "error" } as AST.ASTExpression,
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
          argument: { type: "Identifier", name: "lastError" } as AST.ASTExpression,
        } as AST.ASTStatement,
      ],
    };
  }
}