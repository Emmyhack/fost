#!/usr/bin/env node

/**
 * FOST CI/CD Publisher
 * 
 * Usage:
 *   npm run publish:sdk -- --sdk-dir ./generated-sdks/my-api/typescript --registry npm
 *   npm run publish:sdk -- --sdk-dir ./generated-sdks/my-api/python --registry pypi
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PublishOptions {
  sdkDir: string;
  registry: 'npm' | 'pypi' | 'maven' | 'nuget';
  dryRun?: boolean;
  token?: string;
  version?: string;
}

class SDKPublisher {
  private options: PublishOptions;
  private logger: any;

  constructor(options: PublishOptions) {
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

  async publish(): Promise<void> {
    try {
      this.logger.info(`Publishing SDK from ${this.options.sdkDir}`);
      this.logger.info(`Registry: ${this.options.registry}`);

      // Validate directory
      if (!fs.existsSync(this.options.sdkDir)) {
        throw new Error(`Directory not found: ${this.options.sdkDir}`);
      }

      switch (this.options.registry) {
        case 'npm':
          await this.publishToNpm();
          break;
        case 'pypi':
          await this.publishToPyPi();
          break;
        case 'maven':
          await this.publishToMaven();
          break;
        case 'nuget':
          await this.publishToNuGet();
          break;
        default:
          throw new Error(`Unknown registry: ${this.options.registry}`);
      }

      this.logger.success('SDK published successfully!');
    } catch (error: any) {
      this.logger.error(error.message);
      process.exit(1);
    }
  }

  private async publishToNpm(): Promise<void> {
    const packageJsonPath = path.join(this.options.sdkDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found in SDK directory');
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    this.logger.info(`Package: ${packageJson.name}@${packageJson.version}`);

    // Update version if provided
    if (this.options.version) {
      packageJson.version = this.options.version;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      this.logger.info(`Updated version to ${this.options.version}`);
    }

    // Build
    this.logger.info('Building TypeScript SDK...');
    this.exec('npm install', this.options.sdkDir);
    this.exec('npm run build', this.options.sdkDir);

    // Publish
    let publishCmd = 'npm publish --access public';
    
    if (this.options.dryRun) {
      publishCmd += ' --dry-run';
      this.logger.warn('DRY RUN - no actual publish');
    }

    if (process.env.NPM_TOKEN) {
      this.logger.info('Using NPM_TOKEN from environment');
    }

    this.exec(publishCmd, this.options.sdkDir);
  }

  private async publishToPyPi(): Promise<void> {
    const setupPyPath = path.join(this.options.sdkDir, 'setup.py');
    
    if (!fs.existsSync(setupPyPath)) {
      throw new Error('setup.py not found in SDK directory');
    }

    this.logger.info('Building Python SDK...');
    this.exec('python -m pip install build twine');
    this.exec('python -m build', this.options.sdkDir);

    let uploadCmd = 'python -m twine upload dist/* --skip-existing';
    
    if (this.options.dryRun) {
      uploadCmd += ' --repository-url https://test.pypi.org/legacy/';
      this.logger.warn('DRY RUN - publishing to Test PyPI');
    }

    if (process.env.PYPI_TOKEN) {
      uploadCmd += ` -u __token__ -p ${process.env.PYPI_TOKEN}`;
    }

    this.exec(uploadCmd, this.options.sdkDir);
  }

  private async publishToMaven(): Promise<void> {
    const pomXmlPath = path.join(this.options.sdkDir, 'pom.xml');
    
    if (!fs.existsSync(pomXmlPath)) {
      throw new Error('pom.xml not found in SDK directory');
    }

    this.logger.info('Building Maven SDK...');
    this.exec('mvn clean package', this.options.sdkDir);

    let deployCmd = 'mvn deploy';
    
    if (this.options.dryRun) {
      this.logger.warn('DRY RUN - skipping deploy');
      return;
    }

    this.exec(deployCmd, this.options.sdkDir);
  }

  private async publishToNuGet(): Promise<void> {
    const csprojPath = path.join(
      this.options.sdkDir,
      fs.readdirSync(this.options.sdkDir).find(f => f.endsWith('.csproj')) || ''
    );
    
    if (!csprojPath || !fs.existsSync(csprojPath)) {
      throw new Error('.csproj file not found in SDK directory');
    }

    this.logger.info('Building NuGet SDK...');
    this.exec('dotnet build -c Release', this.options.sdkDir);
    this.exec('dotnet pack -c Release', this.options.sdkDir);

    let pushCmd = 'dotnet nuget push bin/Release/*.nupkg';
    
    if (process.env.NUGET_API_KEY) {
      pushCmd += ` -k ${process.env.NUGET_API_KEY}`;
    }

    if (this.options.dryRun) {
      this.logger.warn('DRY RUN - skipping push');
      return;
    }

    this.exec(pushCmd, this.options.sdkDir);
  }

  private exec(command: string, cwd?: string): string {
    this.logger.info(`$ ${command}`);
    
    try {
      const result = execSync(command, {
        cwd: cwd || process.cwd(),
        stdio: 'inherit',
        encoding: 'utf-8',
      });
      return result;
    } catch (error: any) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
  }
}

// CLI Entry Point
const args = process.argv.slice(2);
const options: PublishOptions = {
  sdkDir: '',
  registry: 'npm',
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--sdk-dir') {
    options.sdkDir = args[++i];
  } else if (args[i] === '--registry') {
    options.registry = args[++i] as any;
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  } else if (args[i] === '--version') {
    options.version = args[++i];
  }
}

if (!options.sdkDir) {
  console.error('Error: --sdk-dir is required');
  process.exit(1);
}

const publisher = new SDKPublisher(options);
publisher.publish();
