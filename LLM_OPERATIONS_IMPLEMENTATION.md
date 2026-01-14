# LLM Operations Implementation Guide

## Quick Start

```typescript
import { LLMOperationsManager } from '@fost/llm-operations';

// Initialize
const llmOps = new LLMOperationsManager({
  modelProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  environment: 'production',
  enableMonitoring: true,
  enableLogging: true,
});

// Use with full safety (validation, retry, fallback, monitoring)
const result = await llmOps.callWithSafety({
  promptId: 'typescript-types',
  input: { schema: myOpenAPISchema },
  context: { sdkType: 'web2' },
});

// Check health
const health = llmOps.checkHealth();
if (!health.healthy) {
  console.warn('LLM system has issues:', health);
}

// Get metrics
const metrics = llmOps.getMetrics();
console.log(`Success rate: ${(metrics.successRate * 100).toFixed(1)}%`);
```

## Architecture

```
User Code
    ↓
LLMOperationsManager
├─ Argument Validation
├─ Prompt Registry Lookup
└─ Safety Pipeline
    ├─ Retry Strategy (exponential backoff)
    │   └─ LLM API Call
    ├─ Output Validation (multi-layer)
    │   ├─ Layer 1: Parse JSON
    │   ├─ Layer 2: Schema validation
    │   ├─ Layer 3: Syntax validation
    │   ├─ Layer 4: Semantic validation
    │   └─ Layer 5: Consistency check
    ├─ Fallback Strategy (if validation fails)
    │   ├─ Tier 1: Alternate prompt (stricter params)
    │   ├─ Tier 2: Different model (faster)
    │   ├─ Tier 3: Template-based
    │   └─ Tier 4: Cached result
    └─ Monitoring
        ├─ Metrics collection
        ├─ Health checks
        ├─ Alert generation
        └─ Trend analysis
```

## Component Details

### 1. Prompt Registry

**Purpose:** Manage all prompts with versioning and lifecycle

**Key Features:**
- Semantic versioning (e.g., 1.0.0, 1.2.3, 2.0.0)
- Lifecycle states: DRAFT → TESTING → PRODUCTION → DEPRECATED → RETIRED
- Per-prompt examples and validation schemas
- Guardrails for hallucination prevention

**Usage:**

```typescript
import { createDefaultPromptRegistry } from '@fost/llm-operations/prompt-registry';

const registry = createDefaultPromptRegistry();

// Get latest version
const prompt = registry.get('typescript-types');

// Get specific version
const oldPrompt = registry.get('typescript-types', '1.0.0');

// Register new prompt
registry.register({
  id: 'my-prompt',
  version: '1.0.0',
  description: 'My custom prompt',
  model: 'gpt-4-turbo-2024-04-09',
  temperature: 0.1,
  maxTokens: 2000,
  systemPrompt: '...',
  userPromptTemplate: '...',
  validationSchema: { ... },
  examples: [ ... ],
  tags: ['custom'],
  createdAt: new Date(),
  modifiedAt: new Date(),
});

// Get statistics
const stats = registry.getStats();
console.log(`${stats.activePrompts} active prompts`);

// Deprecate a version
registry.deprecate('typescript-types', '1.0.0', new Date('2026-02-14'));
```

### 2. Retry Strategy

**Purpose:** Handle transient failures automatically

**Key Features:**
- Exponential backoff with jitter
- Configurable retryable errors
- Circuit breaker pattern
- HTTP status code handling

**Usage:**

```typescript
import { RetryStrategy, DEFAULT_RETRY_CONFIG } from '@fost/llm-operations/retry-strategy';

const retryStrategy = new RetryStrategy({
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
  backoffMultiplier: 2.0,
  jitterFactor: 0.1,
});

try {
  const result = await retryStrategy.executeWithRetry(async () => {
    return await callLLM();
  });
} catch (error) {
  // All retries exhausted
}

// Circuit breaker
import { CircuitBreaker } from '@fost/llm-operations/retry-strategy';

const breaker = new CircuitBreaker(5, 2, 60000);
try {
  const result = await breaker.execute(async () => {
    return await callLLM();
  });
} catch (error) {
  // Circuit is OPEN, service unavailable
}
```

### 3. Output Validator

**Purpose:** Multi-layer validation to catch errors and hallucinations

**Layers:**
1. **Schema Validation**: Verify JSON structure and required fields
2. **Syntax Validation**: Check TypeScript/code syntax
3. **Semantic Validation**: Look for obvious errors (placeholders, undefined)
4. **Consistency Validation**: Align with context

**Usage:**

```typescript
import { OutputValidator } from '@fost/llm-operations/output-validator';

const validator = new OutputValidator();

const result = validator.validate(llmOutput, schema);

if (!result.valid) {
  console.error('Validation failed:');
  result.errors.forEach(err => {
    console.error(`  [${err.type}] ${err.message}`);
    if (err.suggestion) {
      console.log(`  Suggestion: ${err.suggestion}`);
    }
  });
}

// Check for hallucinations
const hallucinations = validator.detectHallucinations(output, sourceSchema);
if (hallucinations.length > 0) {
  console.warn(`Hallucinated properties: ${hallucinations.join(', ')}`);
}

// Score output quality
const score = validator.scoreOutput(result);
console.log(`Output quality: ${(score * 100).toFixed(1)}%`);
```

### 4. Fallback Strategy

**Purpose:** Multi-tier fallback when main LLM call fails

**Tiers:**
1. **Tier 1**: Retry with alternate prompt (stricter parameters)
2. **Tier 2**: Try different model (faster/cheaper)
3. **Tier 3**: Template-based generation (no LLM)
4. **Tier 4**: Cached result from similar query

**Usage:**

```typescript
import { FallbackStrategy } from '@fost/llm-operations/fallback-strategy';

const fallback = new FallbackStrategy();

try {
  const result = await fallback.execute({
    promptId: 'typescript-types',
    input: { schema: mySchema },
    context: {},
    originalError: error,
    config: {
      tier1: { type: 'alternate-prompt', temperature: 0.05 },
      tier2: { type: 'different-model', model: 'gpt-3.5-turbo' },
      tier3: { type: 'template' },
      tier4: { type: 'cache' },
    },
  });

  if (result.success) {
    console.log(`Used fallback Tier ${result.tier}`);
    console.log('Note: Output quality may be reduced');
  }
} catch (error) {
  console.error('All fallbacks exhausted');
}

// Cache successful results
fallback.cacheResult('typescript-types', input, output);
```

### 5. Determinism Controls

**Purpose:** Ensure reproducible and consistent outputs

**Presets:**
- `CODE_GENERATION`: temperature 0.1, seed 42
- `DOCUMENTATION`: temperature 0.3, seed 42
- `CREATIVE`: temperature 0.8

**Usage:**

```typescript
import { 
  DeterminismManager, 
  DETERMINISM_PRESETS,
  ReproducibilityTester 
} from '@fost/llm-operations/determinism';

// Use preset
const config = DETERMINISM_PRESETS.CODE_GENERATION;

// Get recommendation
const config = DeterminismManager.getRecommendation('code');

// Adjust determinism
const stricter = DeterminismManager.makeMoreDeterministic(config);
const creative = DeterminismManager.makeMoreCreative(config);

// Test reproducibility
const tester = new ReproducibilityTester();
const test = tester.createTest({
  promptId: 'typescript-types',
  input: { schema },
  runs: 5,
  tolerance: 0.95,
  config: DETERMINISM_PRESETS.CODE_GENERATION,
});

const result = await tester.runTest(test);
console.log(`Reproducibility: ${result.reproducibilityPercent.toFixed(1)}%`);
if (!result.passed) {
  console.warn('Output not reproducible enough');
}

// Pin model version
import { ModelVersionManager } from '@fost/llm-operations/determinism';

const modelMgr = new ModelVersionManager();
modelMgr.pin('typescript-types', 'gpt-4-turbo-2024-04-09');
const version = modelMgr.getPinned('typescript-types');
```

### 6. Monitoring

**Purpose:** Track health and performance metrics

**Metrics Tracked:**
- Success rate
- Hallucination rate
- Validation failure rate
- Fallback usage rate
- Latencies (avg, p95, p99, max)
- Costs (per call, total)
- Trends (improving, stable, degrading)
- Alerts (thresholds crossed)

**Usage:**

```typescript
import { LLMMonitor, MetricsFormatter } from '@fost/llm-operations/monitoring';

const monitor = new LLMMonitor(true); // enabled=true

// Record events
monitor.recordSuccess({
  promptId: 'typescript-types',
  duration: 2500,
  tokens: 150,
  cost: 0.002,
});

monitor.recordFallback({
  promptId: 'typescript-types',
  reason: 'Validation failed',
  fallbackTier: 'tier2',
});

monitor.recordHallucinations({
  promptId: 'typescript-types',
  count: 2,
});

// Get metrics
const metrics = monitor.getMetrics();
console.log(MetricsFormatter.formatMetrics(metrics));

// Check health
const health = monitor.checkHealth();
console.log(MetricsFormatter.formatHealth(health));

// Get per-prompt metrics
const perPrompt = monitor.getMetricsPerPrompt();
for (const [promptId, metrics] of perPrompt) {
  console.log(`${promptId}: ${(metrics.successRate * 100).toFixed(1)}%`);
}

// Export for analysis
const export = monitor.export();
fs.writeFileSync('metrics.json', JSON.stringify(export, null, 2));
```

## Integration Points

### With Code Generation

```typescript
// src/code-generation/generators.ts

import { LLMOperationsManager } from '@fost/llm-operations';

const llmOps = new LLMOperationsManager(config);

export async function generateTypes(schema: OpenAPISchema) {
  return await llmOps.callWithSafety({
    promptId: 'typescript-types',
    promptVersion: '2.0.0', // Pin to specific version
    input: { schema },
    context: {
      sdkType: 'web2',
      convention: 'interface-prefix',
      existingTypes: existingTypeNames,
    },
  });
}

export async function generateMethods(typeInfo: TypeInfo) {
  return await llmOps.callWithSafety({
    promptId: 'method-implementation',
    input: { typeInfo },
  });
}

export async function generateTests(sdkStructure: SDKStructure) {
  return await llmOps.callWithSafety({
    promptId: 'test-generation',
    input: { sdkStructure },
  });
}
```

### With CLI

```typescript
// src/cli/commands/generate.ts

import { LLMOperationsManager, MetricsFormatter } from '@fost/llm-operations';

export async function handleGenerate(options: CLIOptions) {
  const llmOps = new LLMOperationsManager(llmConfig);
  const progress = createProgressReporter();

  try {
    progress.start();
    progress.update('Generating types...', 10);

    const result = await llmOps.callWithSafety({
      promptId: 'typescript-types',
      input: { schema },
    });

    progress.update('Generating methods...', 50);
    // ... continue generation

    progress.succeed('Generation complete!');

    // Show metrics
    if (options.verbose) {
      const metrics = llmOps.getMetrics();
      console.log(MetricsFormatter.formatMetrics(metrics));
    }
  } catch (error) {
    progress.fail();

    // Show health issues
    const health = llmOps.checkHealth();
    if (!health.healthy) {
      console.error('LLM system issues detected:');
      health.issues.forEach(issue => console.error(`  - ${issue}`));
    }

    throw error;
  }
}
```

## Best Practices

### 1. Pin Model Versions
```typescript
// Always pin to specific model version, not "latest"
const config = {
  model: 'gpt-4-turbo-2024-04-09', // Specific ✓
  // NOT: model: 'gpt-4-turbo'     // Floating ✗
};
```

### 2. Use Temperature Presets
```typescript
// Don't guess, use tested presets
import { DETERMINISM_PRESETS } from '@fost/llm-operations/determinism';

const config = DETERMINISM_PRESETS.CODE_GENERATION; // Recommended ✓
// NOT: { temperature: 0.15 }                       // Arbitrary ✗
```

### 3. Validate All Output
```typescript
// Always validate before using
const result = await llmOps.callWithSafety({ ... });
if (!result.valid) {
  // Result is already validated by callWithSafety
  // But you should still check for warnings
  if (result.warnings.length > 0) {
    console.warn('Output has warnings:', result.warnings);
  }
}
```

### 4. Monitor Health Regularly
```typescript
// Check health periodically
setInterval(() => {
  const health = llmOps.checkHealth();
  if (!health.healthy) {
    alertOps(`LLM issues: ${health.issues.join(', ')}`);
  }
}, 60000); // Every minute
```

### 5. Use Circuit Breaker
```typescript
// Prevent cascading failures
import { CircuitBreaker } from '@fost/llm-operations/retry-strategy';

const breaker = new CircuitBreaker();
const result = await breaker.execute(() => llmOps.callWithSafety(...));
```

## Troubleshooting

### Problem: High Hallucination Rate

**Symptoms:**
- Monitoring shows hallucinations > 2 per 1000
- Generated properties not in source schema

**Solutions:**
1. Check prompt guardrails are enabled
2. Reduce temperature (more deterministic)
3. Add more few-shot examples
4. Use self-review prompting
5. Increase validation strictness

```typescript
// Make more deterministic
const stricter = DeterminismManager.makeMoreDeterministic(config);
```

### Problem: High Latency

**Symptoms:**
- Average latency > 10 seconds
- P95 latency > 30 seconds

**Solutions:**
1. Use faster model (gpt-3.5-turbo instead of gpt-4)
2. Reduce max tokens
3. Shorten prompts
4. Increase parallelization
5. Check API status

```typescript
// Use faster model in Tier 2 fallback
const fallbackConfig = {
  tier2: { type: 'different-model', model: 'gpt-3.5-turbo' }
};
```

### Problem: Cost Increasing

**Symptoms:**
- Cost per call trending upward
- Total cost exceeding budget

**Solutions:**
1. Use cheaper model for appropriate tasks
2. Reduce prompt verbosity
3. Increase max token limits (paradoxically faster)
4. Use cached results more
5. Batch requests

```typescript
// Switch to cheaper model
const budget = DETERMINISM_PRESETS.CODE_GENERATION;
budget.model = 'gpt-3.5-turbo'; // Cheaper ✓
```

### Problem: Inconsistent Output

**Symptoms:**
- Same input produces different outputs
- Reproducibility < 80%

**Solutions:**
1. Pin seed value
2. Reduce temperature
3. Use specific model version
4. Disable top_p sampling
5. Run reproducibility test

```typescript
// Ensure reproducibility
const tester = new ReproducibilityTester();
const test = tester.createTest({
  promptId: 'typescript-types',
  input,
  runs: 10,
  config: DETERMINISM_PRESETS.CODE_GENERATION,
});
const result = await tester.runTest(test);
if (result.reproducibilityPercent < 80) {
  console.warn('Output not reproducible');
}
```

## Migration Guide

### From Manual LLM Calls to Managed System

**Before:**
```typescript
async function generateType(schema: any) {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });
  return JSON.parse(response.choices[0].message.content);
}
```

**After:**
```typescript
async function generateType(schema: any) {
  return await llmOps.callWithSafety({
    promptId: 'typescript-types',
    input: { schema },
  });
}
```

**Benefits:**
- ✓ Automatic retry with backoff
- ✓ Multi-layer output validation
- ✓ Fallback strategies
- ✓ Comprehensive monitoring
- ✓ Model version pinning
- ✓ Determinism controls
- ✓ Hallucination detection
- ✓ Performance metrics
- ✓ Health checks
- ✓ Cost tracking

## Testing

```typescript
import { expect } from 'chai';
import { LLMOperationsManager } from '@fost/llm-operations';

describe('LLM Operations', () => {
  let llmOps: LLMOperationsManager;

  beforeEach(() => {
    llmOps = new LLMOperationsManager({
      modelProvider: 'openai',
      apiKey: 'test-key',
      environment: 'development',
      enableMonitoring: true,
    });
  });

  it('should validate output schema', async () => {
    const result = await llmOps.callWithSafety({
      promptId: 'typescript-types',
      input: { schema: testSchema },
    });

    expect(result.valid).to.be.true;
  });

  it('should retry on transient failure', async () => {
    // Test setup with mock that fails once then succeeds
    const result = await llmOps.callWithSafety({
      promptId: 'typescript-types',
      input: { schema: testSchema },
    });

    expect(result.valid).to.be.true;
  });

  it('should fallback when validation fails', async () => {
    // Test that fallback is triggered
  });

  it('should track metrics', () => {
    const metrics = llmOps.getMetrics();
    expect(metrics.successRate).to.be.at.least(0);
    expect(metrics.successRate).to.be.at.most(1);
  });

  it('should detect health issues', () => {
    const health = llmOps.checkHealth();
    expect(health).to.have.property('healthy');
    expect(health).to.have.property('issues');
  });
});
```

## Performance Targets

```
Success Rate:          ≥ 95%
Validation Failures:   < 5%
Hallucination Rate:    < 2 per 1000 calls
Fallback Usage:        < 10%
Average Latency:       < 3000ms
P95 Latency:           < 10000ms
Cost per Call:         < $0.02
Reproducibility:       ≥ 80%
```

