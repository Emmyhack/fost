/**
 * CI Workflow Generator for GitHub Actions
 *
 * Generates GitHub Actions workflows for:
 * - Running tests
 * - Building code
 * - Checking code coverage
 * - Publishing to npm/registry
 */

/**
 * GitHub Actions job configuration
 */
export interface GithubJob {
  id: string;
  name: string;
  runsOn: string;
  steps: Array<{
    name: string;
    uses?: string;
    run?: string;
    with?: Record<string, string>;
  }>;
}

/**
 * GitHub Actions workflow configuration
 */
export interface GithubWorkflow {
  name: string;
  trigger: "push" | "pull_request" | "schedule";
  jobs: GithubJob[];
}

/**
 * CI workflow generator
 */
export class CiWorkflowGenerator {
  private workflowName: string;
  private nodeVersions: string[] = ["18", "20"];

  /**
   * Create CI workflow generator
   */
  constructor(workflowName: string = "CI") {
    this.workflowName = workflowName;
  }

  /**
   * Generate test job
   */
  private generateTestJob(): GithubJob {
    return {
      id: "test",
      name: "Test",
      runsOn: "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: { "node-version": "20" },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Run tests",
          run: "npm test",
        },
        {
          name: "Upload coverage",
          uses: "codecov/codecov-action@v3",
          with: {
            files: "./coverage/coverage-final.json",
            flags: "unittests",
          },
        },
      ],
    };
  }

  /**
   * Generate build job
   */
  private generateBuildJob(): GithubJob {
    return {
      id: "build",
      name: "Build",
      runsOn: "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: { "node-version": "20" },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Build code",
          run: "npm run build",
        },
        {
          name: "Check types",
          run: "npx tsc --noEmit",
        },
      ],
    };
  }

  /**
   * Generate lint job
   */
  private generateLintJob(): GithubJob {
    return {
      id: "lint",
      name: "Lint",
      runsOn: "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: { "node-version": "20" },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Run ESLint",
          run: "npm run lint",
        },
      ],
    };
  }

  /**
   * Generate publish job (for releases)
   */
  private generatePublishJob(): GithubJob {
    return {
      id: "publish",
      name: "Publish to npm",
      runsOn: "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "20",
            "registry-url": "https://registry.npmjs.org",
          },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Build code",
          run: "npm run build",
        },
        {
          name: "Publish to npm",
          run: "npm publish",
          with: { NODE_AUTH_TOKEN: "${{ secrets.NPM_TOKEN }}" },
        },
      ],
    };
  }

  /**
   * Generate matrix test job (multiple Node versions)
   */
  private generateMatrixTestJob(): GithubJob {
    return {
      id: "test-matrix",
      name: "Test - Node ${{ matrix.node-version }}",
      runsOn: "ubuntu-latest",
      steps: [
        {
          name: "Checkout code",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js ${{ matrix.node-version }}",
          uses: "actions/setup-node@v4",
          with: { "node-version": "${{ matrix.node-version }}" },
        },
        {
          name: "Install dependencies",
          run: "npm ci",
        },
        {
          name: "Run tests",
          run: "npm test",
        },
      ],
    };
  }

  /**
   * Render workflow as YAML
   */
  renderWorkflow(includePublish: boolean = false, useMatrix: boolean = false): string {
    const lines: string[] = [];

    lines.push(`name: ${this.workflowName}`);
    lines.push("");
    lines.push("on:");
    lines.push("  push:");
    lines.push("    branches: [main, develop]");
    lines.push("  pull_request:");
    lines.push("    branches: [main, develop]");
    lines.push("");

    if (useMatrix) {
      lines.push("env:");
      lines.push("  NODE_VERSIONS: [18, 20]");
      lines.push("");
    }

    lines.push("jobs:");
    lines.push("");

    // Build job
    lines.push("  build:");
    lines.push('    name: "Build"');
    lines.push('    runs-on: "ubuntu-latest"');
    lines.push("    steps:");
    lines.push('      - uses: "actions/checkout@v4"');
    lines.push('      - uses: "actions/setup-node@v4"');
    lines.push("        with:");
    lines.push('          node-version: "20"');
    lines.push('      - run: "npm ci"');
    lines.push('      - run: "npm run build"');
    lines.push("");

    // Lint job
    lines.push("  lint:");
    lines.push('    name: "Lint"');
    lines.push('    runs-on: "ubuntu-latest"');
    lines.push("    steps:");
    lines.push('      - uses: "actions/checkout@v4"');
    lines.push('      - uses: "actions/setup-node@v4"');
    lines.push("        with:");
    lines.push('          node-version: "20"');
    lines.push('      - run: "npm ci"');
    lines.push('      - run: "npm run lint"');
    lines.push("");

    // Test job
    if (useMatrix) {
      lines.push("  test:");
      lines.push('    name: "Test - Node ${{ matrix.node-version }}"');
      lines.push('    runs-on: "ubuntu-latest"');
      lines.push("    strategy:");
      lines.push("      matrix:");
      lines.push("        node-version: [18, 20]");
      lines.push("    steps:");
      lines.push('      - uses: "actions/checkout@v4"');
      lines.push('      - uses: "actions/setup-node@v4"');
      lines.push("        with:");
      lines.push('          node-version: "${{ matrix.node-version }}"');
      lines.push('      - run: "npm ci"');
      lines.push('      - run: "npm test"');
      lines.push('      - uses: "codecov/codecov-action@v3"');
      lines.push("        if: 'matrix.node-version == 20'");
    } else {
      lines.push("  test:");
      lines.push('    name: "Test"');
      lines.push('    runs-on: "ubuntu-latest"');
      lines.push("    steps:");
      lines.push('      - uses: "actions/checkout@v4"');
      lines.push('      - uses: "actions/setup-node@v4"');
      lines.push("        with:");
      lines.push('          node-version: "20"');
      lines.push('      - run: "npm ci"');
      lines.push('      - run: "npm test"');
      lines.push('      - uses: "codecov/codecov-action@v3"');
    }
    lines.push("");

    // Publish job (optional)
    if (includePublish) {
      lines.push("  publish:");
      lines.push('    name: "Publish to npm"');
      lines.push('    runs-on: "ubuntu-latest"');
      lines.push("    needs: [build, lint, test]");
      lines.push("    if: startsWith(github.ref, 'refs/tags/v')");
      lines.push("    steps:");
      lines.push('      - uses: "actions/checkout@v4"');
      lines.push('      - uses: "actions/setup-node@v4"');
      lines.push("        with:");
      lines.push('          node-version: "20"');
      lines.push('          registry-url: "https://registry.npmjs.org"');
      lines.push('      - run: "npm ci"');
      lines.push('      - run: "npm run build"');
      lines.push('      - run: "npm publish"');
      lines.push("        env:");
      lines.push('          NODE_AUTH_TOKEN: "${{ secrets.NPM_TOKEN }}"');
    }

    return lines.join("\n");
  }

  /**
   * Set Node versions for matrix testing
   */
  setNodeVersions(versions: string[]): this {
    this.nodeVersions = versions;
    return this;
  }

  /**
   * Get all generated jobs
   */
  generateAllJobs(): GithubJob[] {
    return [
      this.generateBuildJob(),
      this.generateLintJob(),
      this.generateTestJob(),
      this.generatePublishJob(),
    ];
  }
}

/**
 * Create CI workflow generator
 */
export function createCiWorkflowGenerator(name?: string): CiWorkflowGenerator {
  return new CiWorkflowGenerator(name);
}
