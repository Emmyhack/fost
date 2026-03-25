/**
 * Unit Test Generator for SDK
 *
 * Analyzes TypeScript files and generates vitest-compatible unit test templates.
 * Supports functions, classes, methods, and async scenarios.
 */

/**
 * Function signature extracted from source
 */
export interface FunctionSignature {
  name: string;
  params: Array<{ name: string; type: string }>;
  returnType: string;
  isAsync: boolean;
  isMethod?: boolean;
}

/**
 * Class metadata extracted from source
 */
export interface ClassMetadata {
  name: string;
  methods: FunctionSignature[];
  constructor?: FunctionSignature;
  properties: Array<{ name: string; type: string }>;
}

/**
 * Unit test specification
 */
export interface UnitTestSpec {
  fileName: string;
  module: string;
  imports: string[];
  testSuites: Array<{
    describe: string;
    tests: Array<{
      name: string;
      code: string;
      shouldMock?: string[];
    }>;
  }>;
}

/**
 * Unit test generator
 */
export class UnitTestGenerator {
  private sourceFile: string;
  private functionPatterns: FunctionSignature[] = [];
  private classes: ClassMetadata[] = [];

  /**
   * Create generator with source file path
   */
  constructor(sourceFile: string, sourceContent?: string) {
    this.sourceFile = sourceFile;
    if (sourceContent) {
      this.analyzSource(sourceContent);
    }
  }

  /**
   * Analyze TypeScript source to extract function/class signatures
   */
  private analyzSource(content: string): void {
    // Extract function declarations
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^{;]+)/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      this.functionPatterns.push({
        name: match[1],
        params: this.parseParams(match[2]),
        returnType: match[3].trim(),
        isAsync: content.substring(match.index).startsWith("async"),
      });
    }

    // Extract classes
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const methods = this.extractClassMethods(content, className);
      this.classes.push({
        name: className,
        methods,
        properties: [],
        constructor: undefined,
      });
    }
  }

  /**
   * Parse function parameters
   */
  private parseParams(paramStr: string): Array<{ name: string; type: string }> {
    const params: Array<{ name: string; type: string }> = [];
    const paramList = paramStr.split(",").filter((p) => p.trim());

    for (const param of paramList) {
      const [name, type] = param.split(":").map((s) => s.trim());
      if (name) {
        params.push({ name, type: type || "any" });
      }
    }

    return params;
  }

  /**
   * Extract methods from class definition
   */
  private extractClassMethods(_content: string, _className: string): FunctionSignature[] {
    // Simplified extraction - would be expanded in real implementation
    return [];
  }

  /**
   * Generate unit tests for a function
   */
  generateFunctionTests(func: FunctionSignature): string[] {
    const tests: string[] = [];

    // Basic success test
    tests.push(
      `  it("should ${this.camelCaseToSpaces(func.name)}", async () => {
    const result = await ${func.name}(${this.generateParamCall(func.params)});
    expect(result).toBeDefined();
  });`
    );

    // Input validation test
    if (func.params.length > 0) {
      tests.push(
        `  it("should validate ${func.name} inputs", () => {
    expect(() => ${func.name}()).toThrow();
  });`
      );
    }

    // Error handling test
    tests.push(
      `  it("should handle errors in ${func.name}", async () => {
    expect(async () => {
      await ${func.name}(${this.generateParamCall(func.params)});
    }).rejects.toThrow();
  });`
    );

    return tests;
  }

  /**
   * Generate unit tests for a class
   */
  generateClassTests(cls: ClassMetadata): string[] {
    const tests: string[] = [];

    // Constructor test
    tests.push(
      `  it("should instantiate ${cls.name}", () => {
    const instance = new ${cls.name}();
    expect(instance).toBeDefined();
  });`
    );

    // Method tests
    for (const method of cls.methods) {
      tests.push(
        `  it("should call ${method.name} method", async () => {
    const instance = new ${cls.name}();
    const result = await instance.${method.name}(${this.generateParamCall(method.params)});
    expect(result).toBeDefined();
  });`
      );
    }

    return tests;
  }

  /**
   * Generate test file content
   */
  generateTestFile(): UnitTestSpec {
    const module = this.sourceFile.replace(/\.ts$/, "");
    const fileName = this.sourceFile.split("/").pop() || "test.ts";
    const testFileName = fileName.replace(".ts", ".test.ts");

    const testSuites = [];

    // Create test suite for functions
    if (this.functionPatterns.length > 0) {
      testSuites.push({
        describe: `${module} - Functions`,
        tests: this.functionPatterns.flatMap((func) =>
          this.generateFunctionTests(func).map((code) => ({
            name: code.match(/it\("([^"]+)"/)?.[1] || "unknown",
            code,
            shouldMock: func.params.map((p) => p.name),
          }))
        ),
      });
    }

    // Create test suite for classes
    if (this.classes.length > 0) {
      for (const cls of this.classes) {
        testSuites.push({
          describe: `${cls.name}`,
          tests: this.generateClassTests(cls).map((code) => ({
            name: code.match(/it\("([^"]+)"/)?.[1] || "unknown",
            code,
          })),
        });
      }
    }

    return {
      fileName: testFileName,
      module,
      imports: [
        `import { describe, it, expect, beforeEach } from 'vitest';`,
        `import * as module from '${module}';`,
      ],
      testSuites,
    };
  }

  /**
   * Render test file as string
   */
  renderTestFile(): string {
    const spec = this.generateTestFile();
    const lines: string[] = [];

    // Add imports
    lines.push(...spec.imports);
    lines.push("");

    // Add test suites
    for (const suite of spec.testSuites) {
      lines.push(`describe("${suite.describe}", () => {`);
      for (const test of suite.tests) {
        lines.push(test.code);
      }
      lines.push("});");
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Helper: convert camelCase to spaces
   */
  private camelCaseToSpaces(str: string): string {
    return str.replace(/([A-Z])/g, " $1").toLowerCase().trim();
  }

  /**
   * Helper: generate parameter call
   */
  private generateParamCall(params: Array<{ name: string; type: string }>): string {
    if (params.length === 0) return "";
    return params
      .map((p) => {
        if (p.type.includes("string")) return `"test-${p.name}"`;
        if (p.type.includes("number")) return "42";
        if (p.type.includes("boolean")) return "true";
        if (p.type.includes("[]")) return "[]";
        return "{}";
      })
      .join(", ");
  }

  /**
   * Add custom function signature
   */
  addFunctionSignature(sig: FunctionSignature): this {
    this.functionPatterns.push(sig);
    return this;
  }

  /**
   * Add custom class metadata
   */
  addClass(cls: ClassMetadata): this {
    this.classes.push(cls);
    return this;
  }

  /**
   * Get all test specifications
   */
  getTestSpecs(): UnitTestSpec {
    return this.generateTestFile();
  }
}

/**
 * Helper function to create unit test generator
 */
export function createUnitTestGenerator(sourceFile: string): UnitTestGenerator {
  return new UnitTestGenerator(sourceFile);
}
