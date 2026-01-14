# FOST LLM Operations Strategy

## Overview

This document outlines how the FOST SDK generator uses Large Language Models (LLMs) for code generation, documentation, and test creation. The strategy prioritizes reliability, reproducibility, and safety over raw throughput.

## 1. Prompt Versioning

### Version Format

Prompts use semantic versioning: `MAJOR.MINOR.PATCH`

```
prompt-typescript-types@1.0.0
prompt-docstring-generation@1.2.1
prompt-test-generation@2.1.0
```

### Prompt Registry

```typescript
interface PromptVersion {
  id: string;                    // e.g., "typescript-types"
  version: string;               // semver
  description: string;           // Human-readable purpose
  model: string;                 // e.g., "gpt-4-turbo", "claude-3-opus"
  temperature: number;           // 0.0-1.0, lower = more deterministic
  maxTokens: number;
  systemPrompt: string;          // System role and instructions
  userPromptTemplate: string;    // Template with ${placeholder}s
  validationSchema: JSONSchema;  // Expected output format
  examples: PromptExample[];     // Few-shot examples
  createdAt: Date;
  modifiedAt: Date;
  retiredAt?: Date;              // null if current, date if deprecated
  tags: string[];                // e.g., ["code-gen", "typescript", "types"]
}

interface PromptExample {
  input: string;                 // Example input
  output: string;                // Expected output
  explanation?: string;          // Why this is the right output
}
```

### Version Changelog

```json
{
  "prompts": {
    "typescript-types": [
      {
        "version": "1.0.0",
        "date": "2026-01-01",
        "changes": "Initial version"
      },
      {
        "version": "1.1.0",
        "date": "2026-01-07",
        "changes": "Added support for generic type constraints"
      },
      {
        "version": "1.1.1",
        "date": "2026-01-12",
        "changes": "Fixed hallucination of non-existent type properties"
      },
      {
        "version": "2.0.0",
        "date": "2026-01-14",
        "changes": "Complete rewrite with chain-of-thought reasoning, deprecates 1.x"
      }
    ]
  }
}
```

### Lifecycle States

```
DRAFT → TESTING → PRODUCTION → DEPRECATED → RETIRED
  ↓       ↓         ↓            ↓          ↓
  (development)    (active)   (warn users) (delete)
```

## 2. Output Validation

### Multi-Layer Validation

```typescript
interface ValidationStrategy {
  // Layer 1: Schema validation
  schema: JSONSchema;

  // Layer 2: Syntax validation
  syntaxValidator?: (code: string) => SyntaxError[];

  // Layer 3: Semantic validation
  semanticValidator?: (code: string, context: AnalysisContext) => SemanticError[];

  // Layer 4: Self-critique
  selfCritique?: string; // Prompt asking model to review its own output

  // Layer 5: Consistency check
  consistencyValidator?: (output: any, context: any) => boolean;
}
```

### Validation Pipeline

```
LLM Output
    ↓
[1] Parse JSON/Code
    ↓ (fail: return error)
[2] Validate Schema
    ↓ (fail: return error)
[3] Syntax Validation
    ↓ (fail: return error)
[4] Semantic Validation
    ↓ (fail: return error)
[5] Consistency Check
    ↓ (fail: return error)
[6] Success: Return output
```

### Validation Example: TypeScript Type Generation

```typescript
interface TypeGenerationValidation {
  // Schema: Ensure output is valid JSON
  schema: {
    type: "object",
    properties: {
      typeName: { type: "string" },
      definition: { type: "string" },
      imports: { type: "array", items: { type: "string" } },
      isGeneric: { type: "boolean" },
      documentation: { type: "string" }
    },
    required: ["typeName", "definition"]
  };

  // Syntax: Can TypeScript parse it?
  syntaxValidator: (code: string) => {
    try {
      parseTypescript(`type ${code}`);
      return [];
    } catch (error) {
      return [error];
    }
  };

  // Semantic: Does it match the OpenAPI schema?
  semanticValidator: (output: any, context: OpenAPISchema) => {
    const errors = [];

    // Check that generated type aligns with source schema
    if (output.properties && !matchesOpenAPIStructure(output, context)) {
      errors.push({
        type: "SEMANTIC_MISMATCH",
        message: "Generated type structure doesn't match source schema",
      });
    }

    // Check for hallucinated properties
    const sourceFields = Object.keys(context.properties || {});
    const generatedFields = Object.keys(output.properties || {});
    const hallucinated = generatedFields.filter(f => !sourceFields.includes(f));

    if (hallucinated.length > 0) {
      errors.push({
        type: "HALLUCINATION_DETECTED",
        message: `Generated type includes non-existent fields: ${hallucinated.join(", ")}`,
        fields: hallucinated,
      });
    }

    return errors;
  };

  // Self-critique: Ask model to review
  selfCritique: `
    Review your generated TypeScript type. Check:
    1. Are all properties from the source schema included?
    2. Did you invent any properties not in the source?
    3. Are the types correct (string, number, boolean, etc.)?
    4. Are required fields marked correctly?

    Format your response as JSON:
    {
      "issues": ["issue1", "issue2"],
      "corrected_definition": "corrected code"
    }
  `;

  // Consistency: Does it match the full SDK context?
  consistencyValidator: (output: any, context: FullSDKContext) => {
    // Check naming conventions
    if (!output.typeName.startsWith('I') && context.convention === 'interface-prefix') {
      return false; // Should be IPrefixed
    }

    // Check no conflicts with existing types
    if (context.existingTypes.includes(output.typeName)) {
      return false; // Name already exists
    }

    return true;
  };
}
```

## 3. Retry and Fallback Strategies

### Retry Strategy: Exponential Backoff with Jitter

```typescript
interface RetryConfig {
  maxRetries: number;              // 1-5 typically
  initialDelayMs: number;          // 1000ms
  maxDelayMs: number;              // 60000ms
  backoffMultiplier: number;       // 1.5-2.0
  jitterFactor: number;            // 0.1-0.3
  retryableErrors: string[];       // ['RATE_LIMIT', 'TIMEOUT', 'SERVICE_UNAVAILABLE']
}

async function callLLMWithRetry(
  prompt: string,
  config: LLMConfig,
  retryConfig: RetryConfig
): Promise<string> {
  let lastError: Error;
  let delay = retryConfig.initialDelayMs;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await callLLM(prompt, config);
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!retryConfig.retryableErrors.includes(error.code)) {
        throw error; // Not retryable, fail immediately
      }

      // Check if we have retries left
      if (attempt === retryConfig.maxRetries) {
        break; // Will fall through to fallback
      }

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * retryConfig.jitterFactor;
      const actualDelay = delay * (1 + jitter);

      console.warn(`LLM call failed (${error.code}), retrying in ${actualDelay}ms`);
      await sleep(actualDelay);

      // Increase delay for next iteration
      delay = Math.min(delay * retryConfig.backoffMultiplier, retryConfig.maxDelayMs);
    }
  }

  // All retries exhausted, fall through to fallback
  return await fallback(prompt, config, lastError);
}
```

### Fallback Strategy: Multi-Tier

```typescript
interface FallbackStrategy {
  tier1?: FallbackOption;        // Alternative prompt (tweaked parameters)
  tier2?: FallbackOption;        // Different model (cheaper/faster)
  tier3?: FallbackOption;        // Template-based (no LLM)
  tier4?: FallbackOption;        // Cached result from similar query
}

interface FallbackOption {
  type: 'alternate-prompt' | 'different-model' | 'template' | 'cache';
  prompt?: string;               // For alternate-prompt
  model?: string;                // For different-model
  temperature?: number;
  template?: string;             // For template-based
  condition?: (error: Error) => boolean;
}

async function callLLMWithFallback(
  prompt: string,
  config: LLMConfig,
  fallbackConfig: FallbackStrategy
): Promise<string> {
  try {
    return await callLLMWithRetry(prompt, config, defaultRetryConfig);
  } catch (error) {
    // Tier 1: Try alternate prompt with different parameters
    if (fallbackConfig.tier1?.condition(error) ?? true) {
      console.warn('Falling back to Tier 1: Alternate prompt');
      try {
        return await callLLM(fallbackConfig.tier1.prompt || prompt, {
          ...config,
          temperature: fallbackConfig.tier1.temperature ?? 0.1,
          maxTokens: Math.floor(config.maxTokens * 0.8),
        });
      } catch (tier1Error) {
        console.warn('Tier 1 fallback failed:', tier1Error.message);
      }
    }

    // Tier 2: Try different model (e.g., GPT-3.5 instead of GPT-4)
    if (fallbackConfig.tier2?.condition(error) ?? true) {
      console.warn('Falling back to Tier 2: Different model');
      try {
        return await callLLM(prompt, {
          ...config,
          model: fallbackConfig.tier2.model || 'gpt-3.5-turbo',
        });
      } catch (tier2Error) {
        console.warn('Tier 2 fallback failed:', tier2Error.message);
      }
    }

    // Tier 3: Use template-based generation
    if (fallbackConfig.tier3) {
      console.warn('Falling back to Tier 3: Template-based');
      return generateFromTemplate(fallbackConfig.tier3.template, {
        // context variables
      });
    }

    // Tier 4: Return cached result
    if (fallbackConfig.tier4) {
      console.warn('Falling back to Tier 4: Cached result');
      return getCachedResult(prompt);
    }

    // No fallback available
    throw error;
  }
}
```

### Circuit Breaker Pattern

```typescript
interface CircuitBreakerState {
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime?: Date;
  successCount: number;
}

class LLMCircuitBreaker {
  private state: CircuitBreakerState = { status: 'CLOSED', failureCount: 0, successCount: 0 };
  private failureThreshold = 5;
  private successThreshold = 2;
  private resetTimeoutMs = 60000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.status === 'OPEN') {
      const timeSinceFailure = Date.now() - (this.state.lastFailureTime?.getTime() || 0);
      if (timeSinceFailure > this.resetTimeoutMs) {
        this.state.status = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN, LLM service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.state.failureCount = 0;
    if (this.state.status === 'HALF_OPEN') {
      this.state.successCount++;
      if (this.state.successCount >= this.successThreshold) {
        this.state.status = 'CLOSED';
        this.state.successCount = 0;
      }
    }
  }

  private onFailure() {
    this.state.lastFailureTime = new Date();
    this.state.failureCount++;
    if (this.state.failureCount >= this.failureThreshold) {
      this.state.status = 'OPEN';
    }
  }
}
```

## 4. Determinism Controls

### Temperature and Seed Management

```typescript
interface DeterminismControl {
  // Temperature: 0 = deterministic, 1 = creative
  // Use 0-0.3 for code generation (deterministic)
  // Use 0.7-1.0 for brainstorming (creative)
  temperature: number;

  // Top-p: Controls diversity via nucleus sampling
  // 0.9 = keep 90% of probability mass
  topP?: number;

  // Seed: For reproducible outputs (if model supports it)
  seed?: number;

  // Model version: Pin to specific model release
  model: string;
}

// Example configurations
const CODE_GENERATION_CONFIG: DeterminismControl = {
  temperature: 0.1,    // Very deterministic
  topP: 0.95,
  seed: 42,            // Reproducible
  model: 'gpt-4-turbo-2024-04-09',  // Specific version
};

const DOCUMENTATION_CONFIG: DeterminismControl = {
  temperature: 0.3,    // Somewhat deterministic
  topP: 0.95,
  model: 'gpt-4-turbo-2024-04-09',
};

const CREATIVE_EXAMPLES_CONFIG: DeterminismControl = {
  temperature: 0.7,    // More creative
  topP: 0.9,
  model: 'gpt-4-turbo-2024-04-09',
};
```

### Reproducibility Testing

```typescript
interface ReproducibilityTest {
  prompt: string;
  expectedOutput: string;
  tolerance: number;  // 0-1, how exact must match be
  runs: number;       // How many times to run
}

async function testReproducibility(test: ReproducibilityTest): Promise<boolean> {
  const outputs: string[] = [];

  for (let i = 0; i < test.runs; i++) {
    const output = await callLLM(test.prompt, CODE_GENERATION_CONFIG);
    outputs.push(output);
  }

  // Calculate how many match expected
  const matches = outputs.filter(o => similarity(o, test.expectedOutput) > test.tolerance).length;
  const reproducibility = matches / test.runs;

  console.log(`Reproducibility: ${(reproducibility * 100).toFixed(1)}%`);
  return reproducibility > 0.8; // 80% threshold
}
```

## 5. Guardrails Against Hallucination

### Anti-Hallucination Techniques

```typescript
interface HallucinationGuardrails {
  // 1. Source grounding: Reference specific input
  sourceReferences: boolean;

  // 2. Chain-of-thought: Explicit reasoning
  chainOfThought: boolean;

  // 3. Few-shot examples: Show what good output looks like
  fewShotExamples: number;

  // 4. Constraint specification: Explicit rules
  constraints: string[];

  // 5. Schema validation: Output must match schema
  schema: JSONSchema;

  // 6. Self-review: Ask model to catch its own mistakes
  selfReview: boolean;

  // 7. Confidence scoring: Ask model how confident it is
  confidenceScoring: boolean;

  // 8. Explicit negations: Tell model what NOT to do
  negations: string[];
}

const ANTI_HALLUCINATION_CONFIG: HallucinationGuardrails = {
  sourceReferences: true,
  chainOfThought: true,
  fewShotExamples: 3,
  constraints: [
    'Only use properties defined in the input schema',
    'Do not invent additional fields',
    'All required fields must be included',
    'Generated code must be syntactically valid',
  ],
  schema: typescriptTypeSchema,
  selfReview: true,
  confidenceScoring: true,
  negations: [
    'Do not create properties that do not exist in the source',
    'Do not hallucinate methods or fields',
    'Do not invent import paths',
  ],
};
```

### Example: Anti-Hallucination Prompt

```
System Prompt:
You are a TypeScript type generator. Your task is to generate accurate TypeScript types from OpenAPI schemas.

CONSTRAINTS:
1. Only use properties exactly as defined in the input schema
2. Do not invent or assume additional properties
3. Mark properties as optional (?) only if specified as not required
4. Use exact type names from the input (string, number, boolean, etc.)
5. Do not create helper types unless requested

WHAT NOT TO DO:
- Do not add properties that aren't in the source schema
- Do not assume additional methods or fields
- Do not use external imports unless provided

USER PROMPT:
Convert this OpenAPI schema to TypeScript:

SCHEMA:
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["id", "name"]
}

REASONING:
Think through each step:
1. What properties are in the schema? id, name, email
2. Which are required? id, name (email is optional)
3. What are the types? All strings
4. Should I add anything else? No, only what's in the schema

OUTPUT:
Provide your answer in this JSON format:
{
  "reasoning": "step-by-step explanation",
  "properties": [
    { "name": "id", "type": "string", "required": true },
    { "name": "name", "type": "string", "required": true },
    { "name": "email", "type": "string", "required": false }
  ],
  "generated_type": "interface User { ... }",
  "hallucination_check": {
    "properties_match_schema": true,
    "no_invented_fields": true,
    "types_are_correct": true
  }
}

SELF-REVIEW:
After generating, review your output:
- Did you use only properties from the input? YES/NO
- Did you invent any fields? YES/NO
- Are all types correct? YES/NO

If any review fails, regenerate without the problematic parts.
```

## 6. Prompt Lifecycle

### Complete Lifecycle

```
Phase 1: DRAFT
├─ Create initial prompt
├─ Document intent and examples
├─ Version as 0.x.x (pre-release)
└─ Internal testing only

Phase 2: TESTING
├─ Run validation suite
├─ Test on representative samples
├─ Measure quality metrics (precision, recall)
├─ Compare against baselines
├─ Iterate based on results
├─ Version as 1.0.0-beta
└─ Collect feedback

Phase 3: PRODUCTION
├─ Version as 1.0.0 (stable)
├─ Monitor in production
├─ Track failure rates
├─ Collect usage metrics
└─ Use for live generation

Phase 4: UPDATES
├─ Bug fixes: 1.0.1, 1.0.2 (patch)
├─ Improvements: 1.1.0, 1.2.0 (minor)
├─ Major rewrites: 2.0.0 (major)
└─ Update changelog

Phase 5: DEPRECATED
├─ Mark version as deprecated
├─ Add sunset date (e.g., 3 months)
├─ Log warnings when used
├─ Direct users to new version
└─ Version as 1.0.0-deprecated

Phase 6: RETIRED
├─ Remove from active registry
├─ Archive in historical records
├─ No longer selectable
└─ Delete from production systems
```

### Governance

```typescript
interface PromptGovernance {
  // Who can create prompts?
  createPermissions: 'admin' | 'owner' | 'team' | 'anyone';

  // Who can approve for production?
  approvalPermissions: 'admin' | 'owner' | 'team-lead';

  // Who can deprecate?
  deprecationPermissions: 'admin' | 'owner';

  // Testing requirements before production
  testingRequirements: {
    minTestCases: number;           // e.g., 50
    minPassRate: number;            // e.g., 0.95 (95%)
    minCoveragePercent: number;     // e.g., 80%
    reviewsRequired: number;        // e.g., 2 peer reviews
  };

  // Monitoring in production
  monitoring: {
    trackFailureRate: boolean;
    failureRateThreshold: number;   // e.g., 0.05 (5%)
    trackLatency: boolean;
    maxLatencyMs: number;
    trackCost: boolean;
    alertOnCostIncrease: number;    // e.g., 0.2 (20%)
  };
}
```

## 7. Example Prompts

### Example 1: TypeScript Type Generation

```typescript
const typeGenerationPrompt: PromptVersion = {
  id: 'typescript-types',
  version: '2.0.0',
  description: 'Generate TypeScript interface from OpenAPI schema',
  model: 'gpt-4-turbo-2024-04-09',
  temperature: 0.1,
  maxTokens: 2000,

  systemPrompt: `
You are a TypeScript code generator specializing in converting OpenAPI schemas to TypeScript interfaces.

CORE RULES:
1. Generate interfaces matching the exact schema structure
2. Only include properties defined in the schema
3. Do not invent properties or methods
4. Use correct type mappings: string→string, number→number, boolean→boolean, array→T[]
5. Mark optional fields with ? 
6. Add JSDoc comments from schema descriptions

CHAIN OF THOUGHT:
Before generating, think through:
- What properties are in the schema?
- Which are required vs optional?
- What are the correct types?
- Are there any nested objects?
- Should this use extends or implements?

OUTPUT FORMAT:
Return JSON with:
{
  "interface_name": "string",
  "properties": [
    { "name": "string", "type": "string", "required": boolean, "description": "string?" }
  ],
  "code": "interface X { ... }",
  "imports": ["string"],
  "validation": {
    "properties_from_schema": boolean,
    "no_hallucinations": boolean,
    "syntax_correct": boolean
  }
}
`,

  userPromptTemplate: `
Convert this OpenAPI schema to TypeScript:

SCHEMA:
\`\`\`json
\${schema}
\`\`\`

Context:
- SDK Type: \${sdkType}
- Naming Convention: \${convention}
- Existing Types: \${existingTypes}

Generate the TypeScript interface.
`,

  validationSchema: {
    type: 'object',
    properties: {
      interface_name: { type: 'string', pattern: '^[A-Z][a-zA-Z0-9]*$' },
      code: { type: 'string' },
      imports: { type: 'array', items: { type: 'string' } },
    },
    required: ['interface_name', 'code'],
  },

  examples: [
    {
      input: JSON.stringify({
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
          },
          required: ['id'],
        },
      }),
      output: JSON.stringify({
        interface_name: 'User',
        code: 'interface User { id: string; email?: string; }',
        imports: [],
      }),
      explanation: 'id is required, email is optional',
    },
  ],

  tags: ['code-gen', 'typescript', 'types', 'openapi'],
  createdAt: new Date('2026-01-14'),
  modifiedAt: new Date('2026-01-14'),
};
```

### Example 2: Documentation Generation

```typescript
const docGenerationPrompt: PromptVersion = {
  id: 'docstring-generation',
  version: '1.0.0',
  description: 'Generate JSDoc comments for TypeScript methods',
  model: 'gpt-4-turbo-2024-04-09',
  temperature: 0.3,
  maxTokens: 1000,

  systemPrompt: `
You are a technical documentation writer. Generate clear, accurate JSDoc comments.

STYLE GUIDE:
- Be concise but complete
- Include @param for each parameter with type
- Include @returns with type
- Include @throws if applicable
- Include @example if useful
- Use markdown in descriptions
- Include relevant @see references

RULES:
- Infer parameter descriptions from context
- Be specific about types
- Mention side effects if any
- Keep examples short
`,

  userPromptTemplate: `
Generate JSDoc for this method:

\`\`\`typescript
\${methodSignature}
\`\`\`

Context:
- Class: \${className}
- Purpose: \${purpose}
- Related methods: \${relatedMethods}

Add JSDoc above the method.
`,

  validationSchema: {
    type: 'object',
    properties: {
      jsdoc: { type: 'string', pattern: '/\\*\\*[\\s\\S]*?\\*/' },
      isComplete: { type: 'boolean' },
    },
    required: ['jsdoc', 'isComplete'],
  },

  examples: [
    {
      input: 'function getUserById(id: string): Promise<User>',
      output: `/**
 * Fetch a user by ID
 * @param id - The user identifier
 * @returns Promise resolving to the user object
 * @throws Error if user not found
 */`,
      explanation: 'Complete documentation with all sections',
    },
  ],

  tags: ['documentation', 'jsdoc', 'typescript'],
  createdAt: new Date('2026-01-14'),
  modifiedAt: new Date('2026-01-14'),
};
```

### Example 3: Test Generation

```typescript
const testGenerationPrompt: PromptVersion = {
  id: 'test-generation',
  version: '1.2.0',
  description: 'Generate unit tests for SDK methods',
  model: 'gpt-4-turbo-2024-04-09',
  temperature: 0.2,
  maxTokens: 3000,

  systemPrompt: `
You are a test engineer. Generate comprehensive Jest unit tests.

TEST COVERAGE:
- Happy path: Normal operation
- Error paths: What can go wrong?
- Edge cases: Boundary conditions
- Mocking: External dependencies

PATTERNS:
- Use describe() for grouping
- Use it() for test cases
- Use beforeEach() for setup
- Use afterEach() for cleanup
- Mock external calls
- Test error conditions

ASSERTIONS:
- Test return values
- Test side effects
- Test error messages
- Test parameter validation
`,

  userPromptTemplate: `
Generate tests for this method:

\`\`\`typescript
\${methodCode}
\`\`\`

Dependencies:
\${dependencies}

Generate Jest tests covering:
1. Success case
2. Error cases
3. Edge cases
4. Mocking external calls
`,

  validationSchema: {
    type: 'object',
    properties: {
      tests: { type: 'string' },
      testCount: { type: 'number' },
      hasErrorTests: { type: 'boolean' },
      hasEdgeCases: { type: 'boolean' },
    },
    required: ['tests', 'testCount'],
  },

  tags: ['testing', 'jest', 'unit-tests'],
  createdAt: new Date('2026-01-14'),
  modifiedAt: new Date('2026-01-14'),
};
```

## 8. Failure Modes and Mitigations

### Failure Mode Matrix

| Mode | Cause | Detection | Mitigation |
|------|-------|-----------|-----------|
| **Hallucination** | Model invents properties/methods | Schema validation + semantic check | Few-shot examples, constraint specification, self-review |
| **Incomplete Output** | Token limit or timeout | Output length check | Reduce scope, split into smaller prompts |
| **Wrong Type Mapping** | Misunderstanding schema | Type validation | Type examples in few-shot learning |
| **Syntax Errors** | Invalid code generation | Parse/syntax check | Template fallback, retry with stricter prompt |
| **Rate Limiting** | API quota exceeded | 429 response | Exponential backoff + queue system |
| **Model Degradation** | Model quality varies over time | Quality metrics tracking | Version pinning, automatic rollback |
| **Inconsistency** | Different outputs for same input | Hash comparison | Increase temperature control, add seed |
| **Timeout** | LLM service slow | Elapsed time > threshold | Fallback to faster model/template |
| **Cost Explosion** | Unexpected token usage | Monitor tokens/cost | Alert on 20% cost increase, switch to cheaper model |
| **Context Confusion** | Model loses track of spec | Validation fails | Add explicit context reminders, break into smaller tasks |

### Example: Hallucination Detection and Recovery

```typescript
interface HallucinationRecovery {
  detection: {
    // Properties in generated output not in source schema
    unknownProperties: string[];

    // Methods not defined in API spec
    unknownMethods: string[];

    // Types that don't exist
    unknownTypes: string[];

    // Import paths that don't exist
    invalidImports: string[];

    confidence: number; // 0-1
  };

  recovery: {
    // Tier 1: Rewrite hallucinated parts
    removeHallucinations: boolean;

    // Tier 2: Regenerate with stricter prompt
    regenerateWithConstraints: boolean;

    // Tier 3: Use template version
    useTemplate: boolean;

    // Tier 4: Manual review required
    requiresManualReview: boolean;
  };
}

async function detectAndRecoverHallucination(
  output: any,
  sourceSchema: any
): Promise<any> {
  const hallucinations = {
    unknownProperties: [],
    unknownMethods: [],
    unknownTypes: [],
    invalidImports: [],
    confidence: 0,
  };

  // Check each property in output
  for (const prop of Object.keys(output.properties || {})) {
    if (!sourceSchema.properties[prop]) {
      hallucinations.unknownProperties.push(prop);
    }
  }

  if (hallucinations.unknownProperties.length > 0) {
    hallucinations.confidence = Math.min(
      0.95,
      hallucinations.unknownProperties.length * 0.3
    );

    // Tier 1: Remove hallucinated properties
    for (const prop of hallucinations.unknownProperties) {
      delete output.properties[prop];
    }

    if (hallucinations.confidence > 0.7) {
      // Tier 2: Regenerate with stricter prompt
      return await callLLMWithStricterConstraints(output);
    }
  }

  return output;
}
```

### Monitoring and Alerting

```typescript
interface LLMMetrics {
  // Quality metrics
  successRate: number;              // Percentage of valid outputs
  hallucintionRate: number;         // Hallucinations per 1000 calls
  averageLatencyMs: number;
  costPerCall: number;

  // Trend detection
  successRateTrend: 'improving' | 'stable' | 'degrading';
  latencyTrend: 'improving' | 'stable' | 'degrading';

  // Alerts
  alerts: {
    successRateDropped: boolean;    // Below 90%
    hallucintionRateIncreased: boolean;
    latencyIncreased: boolean;      // 50%+ increase
    costIncreased: boolean;         // 20%+ increase
  };
}

async function monitorLLMHealth(): Promise<LLMMetrics> {
  const metrics = {
    successRate: 0.94,
    hallucintionRate: 0.012,
    averageLatencyMs: 2500,
    costPerCall: 0.015,
    successRateTrend: 'stable',
    latencyTrend: 'degrading',
    alerts: {
      successRateDropped: false,
      hallucintionRateIncreased: true,   // Alert!
      latencyIncreased: true,             // Alert!
      costIncreased: false,
    },
  };

  if (metrics.alerts.hallucintionRateIncreased) {
    console.error('ALERT: Hallucination rate increased 50%');
    // Action: Investigate, maybe rollback to previous prompt version
  }

  if (metrics.alerts.latencyIncreased) {
    console.error('ALERT: Latency increased 50%');
    // Action: Investigate, maybe switch to faster model
  }

  return metrics;
}
```

## 9. Integration with FOST Pipeline

### Where LLMs are Used

```
Input Specification
    ↓
Input Analysis (CURRENT - NO LLM)
    ↓
Code Generation
    ├─ Type Generation [LLM: prompt-typescript-types]
    ├─ Class Generation [LLM: prompt-class-generation]
    ├─ Method Implementation [LLM: prompt-method-impl]
    └─ Error Handling [LLM: prompt-error-handling]
    ↓
Documentation Generation
    ├─ API Docs [LLM: prompt-api-docs]
    ├─ Usage Examples [LLM: prompt-usage-examples]
    └─ Docstrings [LLM: prompt-docstring-generation]
    ↓
Test Generation
    ├─ Unit Tests [LLM: prompt-test-generation]
    ├─ Integration Tests [LLM: prompt-integration-tests]
    └─ Mock Data [LLM: prompt-mock-data]
    ↓
Quality Assurance
    ├─ Code Review [LLM: prompt-code-review]
    └─ Suggestion Generation [LLM: prompt-suggestions]
    ↓
Generated SDK (Output)
```

### Implementation Hooks

```typescript
// In src/code-generation/generators.ts

async function generateTypes(schema: OpenAPISchema) {
  return await callLLMWithValidation({
    prompt: 'typescript-types',
    version: '2.0.0',
    input: { schema },
    validate: validateTypeGeneration,
    fallback: fallbackToTemplate,
  });
}

async function generateMethods(typeInfo: TypeInfo) {
  return await callLLMWithValidation({
    prompt: 'method-implementation',
    version: '1.0.0',
    input: { typeInfo },
    validate: validateMethodGeneration,
    fallback: fallbackToTemplate,
  });
}

async function generateTests(sdkStructure: SDKStructure) {
  return await callLLMWithValidation({
    prompt: 'test-generation',
    version: '1.2.0',
    input: { sdkStructure },
    validate: validateTestGeneration,
    fallback: fallbackToTemplate,
  });
}
```

## 10. Best Practices Summary

| Practice | Why | Example |
|----------|-----|---------|
| **Pin model version** | Reproducibility | `gpt-4-turbo-2024-04-09` not `gpt-4-turbo` |
| **Use low temperature** | Code predictability | 0.1-0.2 for generation, not 0.7 |
| **Validate all output** | Catch errors early | Schema + syntax + semantic validation |
| **Few-shot examples** | Guide behavior | 3-5 examples per prompt |
| **Chain-of-thought** | Better reasoning | Ask model to think step-by-step |
| **Test reproducibility** | Ensure consistency | 80%+ reproducibility target |
| **Monitor metrics** | Catch degradation | Alert on 20% change in any metric |
| **Version prompts** | Track changes | semver: 1.0.0, 1.0.1, 2.0.0 |
| **Use fallbacks** | Handle failures | 4-tier fallback strategy |
| **Retry with backoff** | Handle transients | Exponential backoff + jitter |

