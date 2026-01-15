#!/usr/bin/env node

/**
 * FOST Batch SDK Generator
 * 
 * Generates SDKs for multiple API specs in parallel
 * 
 * Usage:
 *   npm run batch:generate -- --specs-dir ./api-specs --output ./generated-sdks --languages typescript,python,go
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface BatchGenerateOptions {
  specsDir: string;
  outputDir: string;
  languages: string[];
  parallel?: number;
  includeTests?: boolean;
  includeDocs?: boolean;
  validate?: boolean;
}

class BatchSDKGenerator {
  private options: BatchGenerateOptions;
  private logger: any;
  private stats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
  };

  constructor(options: BatchGenerateOptions) {
    this.options = options;
    this.logger = this.createLogger();
  }

  private createLogger() {
    return {
      info: (msg: string) => console.log(`ℹ️  ${msg}`),
      success: (msg: string) => console.log(`✅ ${msg}`),
      error: (msg: string) => console.error(`❌ ${msg}`),
      warn: (msg: string) => console.log(`⚠️  ${msg}`),
    };
  }

  async generate(): Promise<void> {
    try {
      const startTime = Date.now();

      this.logger.info(`🚀 Starting batch SDK generation`);
      this.logger.info(`Specs directory: ${this.options.specsDir}`);
      this.logger.info(`Output directory: ${this.options.outputDir}`);
      this.logger.info(`Languages: ${this.options.languages.join(', ')}`);

      // Validate directories
      if (!fs.existsSync(this.options.specsDir)) {
        throw new Error(`Specs directory not found: ${this.options.specsDir}`);
      }

      // Create output directory
      if (!fs.existsSync(this.options.outputDir)) {
        fs.mkdirSync(this.options.outputDir, { recursive: true });
      }

      // Find all API specs
      const specs = this.findSpecFiles(this.options.specsDir);
      
      if (specs.length === 0) {
        this.logger.warn('No API specs found');
        return;
      }

      this.logger.info(`Found ${specs.length} API spec(s)`);

      // Generate SDKs
      const parallel = this.options.parallel || 3;
      await this.generateInBatches(specs, parallel);

      // Print summary
      const duration = (Date.now() - startTime) / 1000;
      this.printSummary(duration);
    } catch (error: any) {
      this.logger.error(error.message);
      process.exit(1);
    }
  }

  private findSpecFiles(dir: string): string[] {
    const specs: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        specs.push(...this.findSpecFiles(fullPath));
      } else if (entry.isFile() && /\.(json|yaml|yml)$/.test(entry.name)) {
        specs.push(fullPath);
      }
    }

    return specs;
  }

  private async generateInBatches(specs: string[], batchSize: number): Promise<void> {
    for (let i = 0; i < specs.length; i += batchSize) {
      const batch = specs.slice(i, i + batchSize);
      const promises = batch.map(spec => this.generateSDKForSpec(spec));

      await Promise.all(promises);
    }
  }

  private async generateSDKForSpec(specPath: string): Promise<void> {
    this.stats.total++;

    try {
      const specName = path.basename(specPath, path.extname(specPath));
      const outputDir = path.join(this.options.outputDir, specName);

      // Detect API type
      const apiType = this.detectApiType(specPath);
      
      this.logger.info(`Generating SDK for ${specName} (${apiType})`);

      // Create output directory
      fs.mkdirSync(outputDir, { recursive: true });

      // Generate SDKs for each language
      for (const language of this.options.languages) {
        const langOutputDir = path.join(outputDir, language);
        fs.mkdirSync(langOutputDir, { recursive: true });

        await this.generateForLanguage(specPath, language, apiType, langOutputDir);
      }

      this.logger.success(`✓ ${specName}`);
      this.stats.success++;
    } catch (error: any) {
      this.logger.error(`✗ ${path.basename(specPath)}: ${error.message}`);
      this.stats.failed++;
    }
  }

  private async generateForLanguage(
    specPath: string,
    language: string,
    apiType: string,
    outputDir: string
  ): Promise<void> {
    let command = `npm run cli -- generate`;
    command += ` --input "${specPath}"`;
    command += ` --language ${language}`;
    command += ` --type ${apiType}`;
    command += ` --output "${outputDir}"`;

    if (this.options.includeDocs) command += ` --docs`;
    if (this.options.includeTests) command += ` --tests`;
    if (this.options.validate) command += ` --validate`;

    try {
      execSync(command, {
        stdio: 'pipe',
      });
    } catch (error: any) {
      throw new Error(`${language}: ${error.message}`);
    }
  }

  private detectApiType(specPath: string): string {
    try {
      const content = fs.readFileSync(specPath, 'utf-8');

      if (content.includes('"ethereum"') || content.includes('"solidity"')) {
        return 'web3';
      }
      if (content.includes('"query"') && content.includes('"mutation"')) {
        return 'graphql';
      }
      return 'web2';
    } catch {
      return 'web2';
    }
  }

  private printSummary(duration: number): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Batch Generation Summary');
    console.log('='.repeat(60));
    console.log(`Total Specs:      ${this.stats.total}`);
    console.log(`✅ Successful:    ${this.stats.success}`);
    console.log(`❌ Failed:        ${this.stats.failed}`);
    console.log(`⏭️  Skipped:       ${this.stats.skipped}`);
    console.log(`⏱️  Duration:      ${duration.toFixed(2)}s`);
    console.log('='.repeat(60) + '\n');

    if (this.stats.failed > 0) {
      process.exit(1);
    }
  }
}

// CLI Entry Point
const args = process.argv.slice(2);
const options: BatchGenerateOptions = {
  specsDir: './api-specs',
  outputDir: './generated-sdks',
  languages: ['typescript', 'python', 'go'],
  parallel: 3,
  includeDocs: true,
  includeTests: false,
  validate: true,
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--specs-dir') {
    options.specsDir = args[++i];
  } else if (args[i] === '--output') {
    options.outputDir = args[++i];
  } else if (args[i] === '--languages') {
    options.languages = args[++i].split(',');
  } else if (args[i] === '--parallel') {
    options.parallel = parseInt(args[++i], 10);
  } else if (args[i] === '--include-tests') {
    options.includeTests = true;
  } else if (args[i] === '--include-docs') {
    options.includeDocs = true;
  } else if (args[i] === '--no-validate') {
    options.validate = false;
  }
}

const generator = new BatchSDKGenerator(options);
generator.generate();
