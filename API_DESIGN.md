# FOST Generator API - Programmatic Interface

## Overview

The FOST Generator provides a programmatic API for integrating SDK generation into Node.js applications, build scripts, and CI/CD pipelines. This interface is separate from (but compatible with) the CLI.

## Quick Start

```typescript
import { GeneratorService, GenerationConfig } from '@fost/sdk-generator';

const generator = new GeneratorService();

const result = await generator.generate({
  inputFile: './api.openapi.json',
  language: 'typescript',
  type: 'web2',
  outputPath: './generated-sdk',
  name: 'my-api-sdk',
  version: '1.0.0',
  config: {
    includeTests: true,
    includeDocumentation: true,
  },
});

console.log(`Generated ${result.filesGenerated} files in ${result.duration}`);
```

## API Methods

### generate()

Generate an SDK from specification.

```typescript
async generate(config: GenerationConfig): Promise<GenerationResult>
```

**Parameters:**

- `inputFile` (string, required): Path to input specification
- `language` (string, required): Target language
- `type` (string, required): SDK type (web2, web3, hybrid)
- `outputPath` (string, optional): Output directory (default: ./sdk)
- `name` (string, optional): SDK package name
- `version` (string, optional): SDK version (default: 1.0.0)
- `config` (object, optional): Additional configuration

**Returns:**

```typescript
interface GenerationResult {
  success: boolean;
  outputPath: string;
  filesGenerated: number;
  duration: string;
  warnings: string[];
}
```

**Example:**

```typescript
const result = await generator.generate({
  inputFile: './contract.abi.json',
  language: 'typescript',
  type: 'web3',
  outputPath: './uniswap-sdk',
  config: {
    includeTests: true,
    includeDocumentation: true,
  },
});

if (result.success) {
  console.log(`Success! Generated ${result.filesGenerated} files`);
  result.warnings.forEach(w => console.warn(w));
}
```

### validate()

Validate input specification without generation.

```typescript
async validate(config: ValidationConfig): Promise<ValidationResult>
```

**Parameters:**

- `inputFile` (string, required): Path to input specification
- `type` (string, required): SDK type
- `strict` (boolean, optional): Enable strict validation
- `customRules` (string, optional): Path to custom validation rules

**Returns:**

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: {
    inputFile: string;
    type: string;
    schemas: number;
    endpoints?: number;
  };
}
```

**Example:**

```typescript
const validation = await generator.validate({
  inputFile: './api.yaml',
  type: 'web2',
  strict: true,
});

if (!validation.valid) {
  validation.errors.forEach(err => {
    console.error(`[${err.code}] ${err.message}`);
    if (err.suggestion) {
      console.log(`  Try: ${err.suggestion}`);
    }
  });
} else {
  console.log(`Valid! Found ${validation.metadata?.endpoints} endpoints`);
}
```

### analyzeInput()

Analyze input specification and extract metrics.

```typescript
async analyzeInput(config: AnalysisConfig): Promise<InputAnalysis>
```

**Parameters:**

- `inputFile` (string, required): Path to input specification
- `type` (string, required): SDK type

**Returns:**

```typescript
interface InputAnalysis {
  methods: number;
  types: number;
  endpoints?: number;
  schemas?: number;
  errors?: number;
  parameters?: number;
  coverage?: number;
  complexity?: 'low' | 'medium' | 'high';
}
```

**Example:**

```typescript
const analysis = await generator.analyzeInput({
  inputFile: './api.json',
  type: 'web2',
});

console.log(`API Analysis:`);
console.log(`  Methods: ${analysis.methods}`);
console.log(`  Types: ${analysis.types}`);
console.log(`  Endpoints: ${analysis.endpoints}`);
console.log(`  Complexity: ${analysis.complexity}`);
```

### generateTests()

Generate test files for SDK.

```typescript
async generateTests(config: TestGenerationConfig): Promise<void>
```

**Parameters:**

- `outputPath` (string, required): SDK output directory
- `language` (string, required): Target language
- `type` (string, required): SDK type

### generateDocumentation()

Generate documentation for SDK.

```typescript
async generateDocumentation(config: DocumentationConfig): Promise<void>
```

**Parameters:**

- `outputPath` (string, required): SDK output directory
- `analysis` (InputAnalysis, required): Input analysis results

### runTests()

Run generated SDK tests.

```typescript
async runTests(config: TestConfig): Promise<TestResult>
```

**Parameters:**

- `sdkPath` (string, required): Generated SDK directory
- `testType` (string, optional): Test type (unit, integration, all)
- `coverage` (boolean, optional): Generate coverage report
- `watch` (boolean, optional): Watch mode

**Returns:**

```typescript
interface TestResult {
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: string;
  coverage: number;
  failures: TestFailure[];
}
```

**Example:**

```typescript
const testResult = await generator.runTests({
  sdkPath: './generated-sdk',
  coverage: true,
});

console.log(`Tests: ${testResult.passedTests}/${testResult.totalTests} passed`);
console.log(`Coverage: ${testResult.coverage}%`);

if (!testResult.allPassed) {
  testResult.failures.forEach(f => {
    console.error(`FAILED: ${f.test}`);
    console.error(`  ${f.error}`);
  });
}
```

### lintCode()

Lint generated SDK code.

```typescript
async lintCode(config: LintConfig): Promise<LintResult>
```

**Parameters:**

- `sdkPath` (string, required): Generated SDK directory
- `fix` (boolean, optional): Auto-fix issues
- `strict` (boolean, optional): Strict mode

**Returns:**

```typescript
interface LintResult {
  issues: LintIssue[];
  fixedCount: number;
  totalIssues: number;
}

interface LintIssue {
  file: string;
  line: number;
  column: number;
  message: string;
  rule: string;
  severity: 'error' | 'warning' | 'info';
}
```

**Example:**

```typescript
const lintResult = await generator.lintCode({
  sdkPath: './generated-sdk',
  fix: true,
});

console.log(`Fixed ${lintResult.fixedCount} issues`);
console.log(`Remaining: ${lintResult.totalIssues}`);

lintResult.issues.forEach(issue => {
  console.log(`  ${issue.severity}: ${issue.file}:${issue.line}`);
  console.log(`    ${issue.message}`);
});
```

### validateGeneration()

Validate generated SDK structure and content.

```typescript
async validateGeneration(config: GenerationValidationConfig): Promise<GenerationValidationResult>
```

## Advanced Usage Patterns

### Pattern 1: Complete Generation Pipeline

```typescript
import { GeneratorService } from '@fost/sdk-generator';

async function generateFullSDK() {
  const generator = new GeneratorService();

  try {
    // Step 1: Validate input
    console.log('Validating specification...');
    const validation = await generator.validate({
      inputFile: './api.json',
      type: 'web2',
      strict: true,
    });

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors[0].message}`);
    }

    // Step 2: Analyze input
    console.log('Analyzing input...');
    const analysis = await generator.analyzeInput({
      inputFile: './api.json',
      type: 'web2',
    });

    console.log(`Found ${analysis.methods} methods, ${analysis.types} types`);

    // Step 3: Generate SDK
    console.log('Generating SDK...');
    const result = await generator.generate({
      inputFile: './api.json',
      language: 'typescript',
      type: 'web2',
      outputPath: './generated-sdk',
      config: {
        includeTests: true,
        includeDocumentation: true,
      },
    });

    console.log(`Generated ${result.filesGenerated} files`);

    // Step 4: Run tests
    console.log('Running tests...');
    const testResult = await generator.runTests({
      sdkPath: './generated-sdk',
      coverage: true,
    });

    console.log(`Tests: ${testResult.passedTests}/${testResult.totalTests} passed`);

    // Step 5: Lint code
    console.log('Linting code...');
    const lintResult = await generator.lintCode({
      sdkPath: './generated-sdk',
      fix: true,
    });

    console.log(`Fixed ${lintResult.fixedCount} linting issues`);

  } catch (error) {
    console.error('Generation failed:', error.message);
    process.exit(1);
  }
}

generateFullSDK();
```

### Pattern 2: Batch Generation

```typescript
async function generateMultipleSDKs() {
  const generator = new GeneratorService();
  const specs = [
    { file: './github-api.json', lang: 'typescript', name: 'github-sdk' },
    { file: './stripe-api.json', lang: 'python', name: 'stripe-sdk' },
    { file: './uniswap.abi.json', lang: 'typescript', name: 'uniswap-sdk' },
  ];

  for (const spec of specs) {
    try {
      console.log(`Generating ${spec.name}...`);
      const result = await generator.generate({
        inputFile: spec.file,
        language: spec.lang,
        type: spec.file.includes('.abi') ? 'web3' : 'web2',
        outputPath: `./generated/${spec.name}`,
        name: spec.name,
      });
      console.log(`  OK - ${result.filesGenerated} files`);
    } catch (error) {
      console.error(`  FAILED - ${error.message}`);
    }
  }
}
```

### Pattern 3: CI/CD Integration

```typescript
// Integrate into your build pipeline
import { GeneratorService } from '@fost/sdk-generator';

async function buildSDK() {
  const generator = new GeneratorService();

  // Regenerate SDK if spec changed
  const validation = await generator.validate({
    inputFile: process.env.API_SPEC || './api.json',
    type: process.env.SDK_TYPE || 'web2',
  });

  if (!validation.valid) {
    throw new Error('API spec validation failed');
  }

  const result = await generator.generate({
    inputFile: process.env.API_SPEC || './api.json',
    language: process.env.TARGET_LANG || 'typescript',
    type: process.env.SDK_TYPE || 'web2',
    outputPath: './sdk',
  });

  // Run tests
  const tests = await generator.runTests({
    sdkPath: './sdk',
    coverage: true,
  });

  if (!tests.allPassed) {
    throw new Error(`${tests.failedTests} tests failed`);
  }

  return result;
}
```

### Pattern 4: Watch Mode

```typescript
import { watch } from 'chokidar';
import { GeneratorService } from '@fost/sdk-generator';

async function watchAndGenerate() {
  const generator = new GeneratorService();
  let isGenerating = false;

  const watcher = watch('./api.json', {
    ignored: /(^|[\/\\])\.|node_modules/,
    persistent: true,
  });

  watcher.on('change', async () => {
    if (isGenerating) return;

    isGenerating = true;
    try {
      console.log('API spec changed, regenerating...');
      const result = await generator.generate({
        inputFile: './api.json',
        language: 'typescript',
        type: 'web2',
        outputPath: './sdk',
      });
      console.log('Regeneration complete');
    } catch (error) {
      console.error('Regeneration failed:', error.message);
    } finally {
      isGenerating = false;
    }
  });
}
```

### Pattern 5: Custom Hooks

```typescript
import { GeneratorService } from '@fost/sdk-generator';

class CustomGenerator extends GeneratorService {
  async generate(config) {
    // Pre-generation hook
    await this.preGenerate(config);

    // Call parent generate
    const result = await super.generate(config);

    // Post-generation hook
    await this.postGenerate(config, result);

    return result;
  }

  private async preGenerate(config) {
    console.log('Pre-generation tasks...');
    // e.g., backup existing SDK, notify team
  }

  private async postGenerate(config, result) {
    console.log('Post-generation tasks...');
    // e.g., run tests, commit to git, deploy docs
  }
}
```

## Error Handling

All API methods throw errors that can be caught and handled:

```typescript
try {
  const result = await generator.generate({
    inputFile: './api.json',
    language: 'typescript',
    type: 'web2',
  });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Input validation failed');
  } else if (error.code === 'FILE_NOT_FOUND') {
    console.error('Input file not found');
  } else if (error.code === 'GENERATION_ERROR') {
    console.error('SDK generation failed');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Configuration

### Via Constructor

```typescript
const generator = new GeneratorService({
  defaultLanguage: 'typescript',
  defaultType: 'web2',
  outputDirectory: './generated-sdks',
  includeTests: true,
  includeDocumentation: true,
});
```

### Via setConfig()

```typescript
await generator.setConfig('defaultLanguage', 'python');
await generator.setConfig('includeTests', false);
```

### Via getConfig()

```typescript
const config = await generator.getConfig();
console.log(config);
```

## Events and Hooks

Future versions will support lifecycle events:

```typescript
// Subscribe to generation events
generator.on('start', (config) => {
  console.log('Generation started');
});

generator.on('progress', (event) => {
  console.log(`${event.phase}: ${event.percentage}%`);
});

generator.on('complete', (result) => {
  console.log('Generation complete');
});

generator.on('error', (error) => {
  console.error('Generation failed:', error);
});
```

## Type Definitions

All types are exported for TypeScript users:

```typescript
import {
  GeneratorAPI,
  GenerationConfig,
  GenerationResult,
  ValidationResult,
  TestResult,
  InputAnalysis,
} from '@fost/sdk-generator';
```

## Support and Documentation

- API Reference: https://docs.fost.dev/api
- Examples: https://github.com/foi/fost/tree/main/examples
- Issues: https://github.com/foi/fost/issues
