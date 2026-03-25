/**
 * Config Generator for Vitest
 *
 * Generates vitest.config.ts with coverage thresholds, reporters, and setup files.
 */

/**
 * Coverage configuration
 */
export interface CoverageConfig {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
}

/**
 * Reporter configuration
 */
export interface ReporterConfig {
  name: "default" | "verbose" | "dot" | "json" | "html";
  outputFile?: string;
}

/**
 * Vitest configuration specification
 */
export interface VitestConfigSpec {
  test: {
    globals?: boolean;
    environment?: string;
    setupFiles?: string[];
    coverage?: {
      provider?: string;
      reporter?: string[];
      lines: number;
      functions: number;
      branches: number;
      statements: number;
      exclude?: string[];
    };
    include?: string[];
    exclude?: string[];
  };
}

/**
 * Vitest config generator
 */
export class VitestConfigGenerator {
  private coverageThresholds: CoverageConfig = {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  };

  private reporters: ReporterConfig[] = [{ name: "default" }];
  private setupFiles: string[] = [];
  private environment: string = "node";
  private globals: boolean = false;

  /**
   * Set coverage thresholds
   */
  setCoverageThresholds(config: Partial<CoverageConfig>): this {
    this.coverageThresholds = { ...this.coverageThresholds, ...config };
    return this;
  }

  /**
   * Add reporter
   */
  addReporter(reporter: ReporterConfig): this {
    this.reporters.push(reporter);
    return this;
  }

  /**
   * Add setup file
   */
  addSetupFile(filePath: string): this {
    this.setupFiles.push(filePath);
    return this;
  }

  /**
   * Set test environment
   */
  setEnvironment(env: "node" | "jsdom" | "happy-dom"): this {
    this.environment = env;
    return this;
  }

  /**
   * Enable global test utilities
   */
  enableGlobals(enable: boolean = true): this {
    this.globals = enable;
    return this;
  }

  /**
   * Generate vitest config object
   */
  generateConfigObject(): VitestConfigSpec {
    const reporters = this.reporters.map((r) => r.name);

    return {
      test: {
        globals: this.globals,
        environment: this.environment,
        setupFiles: this.setupFiles.length > 0 ? this.setupFiles : undefined,
        coverage: {
          provider: "v8",
          reporter: reporters,
          lines: this.coverageThresholds.lines,
          functions: this.coverageThresholds.functions,
          branches: this.coverageThresholds.branches,
          statements: this.coverageThresholds.statements,
          exclude: ["node_modules/", "dist/", "coverage/"],
        },
        include: ["tests/**/*.test.ts", "**/*.test.ts"],
        exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
      },
    };
  }

  /**
   * Render as TypeScript file content
   */
  renderConfigFile(): string {
    const lines: string[] = [];

    lines.push(`import { defineConfig } from 'vitest/config';`);
    lines.push("");

    lines.push("export default defineConfig({");
    lines.push("  test: {");

    if (this.globals) {
      lines.push("    globals: true,");
    }

    lines.push(`    environment: '${this.environment}',`);

    if (this.setupFiles.length > 0) {
      lines.push("    setupFiles: [");
      for (const file of this.setupFiles) {
        lines.push(`      '${file}',`);
      }
      lines.push("    ],");
    }

    lines.push("    coverage: {");
    lines.push("      provider: 'v8',");
    lines.push("      reporter: [");
    for (const reporter of this.reporters) {
      lines.push(`        '${reporter.name}',`);
      if (reporter.outputFile) {
        lines.push(`        { 'file': '${reporter.outputFile}' },`);
      }
    }
    lines.push("      ],");
    lines.push(`      lines: ${this.coverageThresholds.lines},`);
    lines.push(`      functions: ${this.coverageThresholds.functions},`);
    lines.push(`      branches: ${this.coverageThresholds.branches},`);
    lines.push(`      statements: ${this.coverageThresholds.statements},`);
    lines.push("      exclude: [");
    lines.push("        'node_modules/',");
    lines.push("        'dist/',");
    lines.push("        'coverage/',");
    lines.push("        '**/*.d.ts',");
    lines.push("        '**/node_modules/**',");
    lines.push("      ],");
    lines.push("    },");

    lines.push("    include: ['tests/**/*.test.ts', '**/*.test.ts'],");
    lines.push("    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],");

    lines.push("  },");
    lines.push("});");

    return lines.join("\n");
  }

  /**
   * Render setup file template
   */
  renderSetupFile(): string {
    const lines: string[] = [];

    lines.push(`/**`);
    lines.push(` * Vitest Setup File`);
    lines.push(` * `);
    lines.push(` * Global test configuration and utilities`);
    lines.push(` */`);
    lines.push("");

    lines.push(`// Global test utilities`);
    lines.push(`beforeAll(() => {`);
    lines.push(`  console.log('Test suite started');`);
    lines.push(`});`);
    lines.push("");

    lines.push(`afterAll(() => {`);
    lines.push(`  console.log('Test suite completed');`);
    lines.push(`});`);
    lines.push("");

    lines.push(`// Mock global objects if needed`);
    lines.push(`Object.assign(global, {`);
    lines.push(`  // Add global mocks here`);
    lines.push(`});`);

    return lines.join("\n");
  }

  /**
   * Get coverage thresholds
   */
  getCoverageThresholds(): CoverageConfig {
    return { ...this.coverageThresholds };
  }

  /**
   * Get reporters
   */
  getReporters(): ReporterConfig[] {
    return [...this.reporters];
  }

  /**
   * Get environment
   */
  getEnvironment(): string {
    return this.environment;
  }
}

/**
 * Create Vitest config generator
 */
export function createVitestConfigGenerator(): VitestConfigGenerator {
  return new VitestConfigGenerator();
}
