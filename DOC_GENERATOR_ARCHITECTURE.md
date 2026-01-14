#  Documentation and Examples Generator Architecture

Complete guide to the automatic SDK documentation generation system.

## Overview

The Documentation and Examples Generator automatically produces production-ready documentation that exactly matches generated SDK code. It produces:

- **README.md** - Overview and quick links
- **Quickstart Guide** - Get running in 5 minutes
- **Authentication Guide** - Setup credentials/wallet
- **Usage Examples** - Common patterns with code
- **Error Handling Guide** - Error codes and recovery
- **API Reference** - Complete method documentation

**Key Features:**
-  Docs automatically match generated code
-  Beginner-friendly but technically accurate
-  Realistic, working code examples
-  Multi-language support
-  Web2 and Web3 adapted content
-  Automatic code example generation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  SDK Design Plan & Code                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            DocumentationGenerator (Main Coordinator)        │
├─────────────────────────────────────────────────────────────┤
│  • withDesignPlan()                                         │
│  • withMethods()                                            │
│  • withErrors()                                             │
│  • generateAll()                                            │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │  README    │    │ Quickstart │    │ Authent.   │
    │  Builder   │    │  Builder   │    │  Builder   │
    └────────────┘    └────────────┘    └────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │ Examples   │    │   Error    │    │   API      │
    │  Builder   │    │  Builder   │    │   Ref      │
    └────────────┘    └────────────┘    └────────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           GeneratedDocumentation Output                     │
├─────────────────────────────────────────────────────────────┤
│  • readme: string                                           │
│  • quickstart: string                                       │
│  • authentication: string                                   │
│  • examples: string                                         │
│  • errorHandling: string                                    │
│  • apiReference: string                                     │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. DocumentationConfig

Configuration for documentation generation:

```typescript
interface DocumentationConfig {
  // SDK Info
  sdkName: string;              // "GitHub SDK", "Uniswap V4 SDK"
  sdkVersion: string;           // "1.0.0"
  description: string;          // SDK description
  audience: "beginner" | "intermediate" | "advanced";

  // Language & Environment
  language: "typescript" | "python" | "go" | "javascript";
  targetEnvironment: "node" | "browser" | "both";

  // Documentation Structure
  sections: DocumentationSection[];
  customSections?: CustomDocumentationSection[];

  // Links
  baseURL?: string;
  repositoryURL?: string;
  documentationBaseURL?: string;
  issueTrackerURL?: string;

  // Auth
  authMethod?: "none" | "api-key" | "oauth" | "wallet" | "custom";
  authRequired: boolean;
}
```

**Example - Web2 (GitHub):**

```typescript
const web2Config: DocumentationConfig = {
  sdkName: "GitHub API SDK",
  sdkVersion: "1.0.0",
  description: "Type-safe TypeScript SDK for GitHub REST API",
  audience: "beginner",
  language: "typescript",
  targetEnvironment: "node",
  authMethod: "api-key",
  authRequired: true,
  repositoryURL: "https://github.com/example/github-sdk",
  sections: [
    "overview",
    "installation",
    "authentication",
    "quickstart",
    "examples",
    "error-handling"
  ]
};
```

**Example - Web3 (Uniswap):**

```typescript
const web3Config: DocumentationConfig = {
  sdkName: "Uniswap V4 SDK",
  sdkVersion: "1.0.0",
  description: "Type-safe TypeScript SDK for Uniswap V4 smart contracts",
  audience: "beginner",
  language: "typescript",
  targetEnvironment: "both",
  authMethod: "wallet",
  authRequired: true,
  repositoryURL: "https://github.com/example/uniswap-v4-sdk",
  sections: [
    "overview",
    "installation",
    "authentication",
    "quickstart",
    "examples",
    "error-handling",
    "advanced"
  ]
};
```

### 2. DocumentationContext

Built context with extracted information:

```typescript
interface DocumentationContext {
  config: DocumentationConfig;
  designPlan: SDKDesignPlan;
  methods: Map<string, SDKMethod>;      // All SDK methods
  types: Map<string, SDKType>;          // All type definitions
  errorTypes: Map<string, ErrorDocumentation>;
  exampleCode: Map<string, string>;     // Pre-generated examples
  prerequisites: string[];              // Setup requirements
  setupSteps: string[];                 // Installation steps
}
```

### 3. Builder Classes

Each builder creates one documentation section:

#### ReadmeBuilder

Generates comprehensive README with overview and navigation:

```typescript
const readmeBuilder = new ReadmeBuilder(config)
  .withContext(context);

const readme = readmeBuilder.build();

// Produces:
// - Header with SDK name and version
// - Quick links to guides
// - Feature list
// - Installation instructions
// - Quick start section
// - Documentation links
// - Support information
```

**Output Structure:**

```markdown
# SDK Name

SDK Description

## Quick Links
- Documentation
- Examples
- GitHub
- Support

## Features
- Feature 1
- Feature 2
- ...

## Installation

### Package Manager
```bash
npm install package-name
```

## Quick Start

### 1. Import
### 2. Create Client
### 3. First Call

## Documentation Links

## Support
```

#### QuickstartBuilder

Generates 5-minute getting started guide:

```typescript
const quickstartBuilder = new QuickstartBuilder(config)
  .withContext(context);

const quickstart = quickstartBuilder.build();

// Produces:
// - Prerequisites
// - Installation steps
// - Environment setup
// - First API call with code
// - Common tasks (3 examples)
// - Next steps
```

#### AuthenticationBuilder

Generates authentication setup guide (adapts to auth method):

```typescript
// For API Key Auth
const authBuilder = new AuthenticationBuilder(config)
  .withContext(context);

const auth = authBuilder.build();

// For "api-key" method, produces:
// - Get API key instructions
// - Set up environment variables
// - Code examples
// - Security best practices

// For "wallet" method, produces:
// - Supported wallets
// - Connection code
// - Wallet events
// - Security best practices
```

#### ExamplesBuilder

Generates working code examples organized by difficulty:

```typescript
const examplesBuilder = new ExamplesBuilder(config)
  .withContext(context)
  .addExample(example1)
  .addExample(example2);

const examples = examplesBuilder.build();

// Produces:
// - Beginner Examples
//   - Example with output
//   - Example with explanation
// - Intermediate Examples
//   - More complex patterns
// - Advanced Examples
//   - Real-world use cases
```

#### ErrorHandlingBuilder

Generates error guide with recovery strategies:

```typescript
const errorBuilder = new ErrorHandlingBuilder(config)
  .withContext(context);

const errors = errorBuilder.build();

// Produces:
// - Error Types (categorized)
//   - Error Code
//   - Description
//   - Cause
//   - Solution
//   - Recovery example
// - Recovery Strategies
// - Best Practices
```

### 4. DocumentationGenerator (Main Coordinator)

Coordinates all builders and produces complete documentation:

```typescript
const generator = new DocumentationGenerator(config)
  .withDesignPlan(sdkDesignPlan)
  .withMethods(sdkMethods)
  .withErrors(errorDocumentation);

const docs: GeneratedDocumentation = generator.generateAll(examples);

// Returns:
{
  readme: "# SDK Name\n...",
  quickstart: "# Quickstart\n...",
  authentication: "# Auth\n...",
  examples: "# Examples\n...",
  errorHandling: "# Error Handling\n...",
  apiReference: "# API Reference\n..."
}
```

## Generation Pipeline

### Phase 1: Configuration

Define what documentation to generate:

```typescript
const config: DocumentationConfig = {
  sdkName: "My SDK",
  sdkVersion: "1.0.0",
  language: "typescript",
  authMethod: "api-key",
  // ... more config
};
```

### Phase 2: Extract Context

Build context from SDK design plan:

```typescript
const context: DocumentationContext = {
  config,
  designPlan: sdkDesignPlan,
  methods: new Map(methods.map(m => [m.name, m])),
  types: new Map(types.map(t => [t.name, t])),
  errorTypes: new Map(errors.map(e => [e.code, e])),
  // ...
};
```

### Phase 3: Generate Sections

Generate each documentation section:

```typescript
const generator = new DocumentationGenerator(config);

const readme = generator.generateReadme();          // Header + overview
const quickstart = generator.generateQuickstart();  // Getting started
const auth = generator.generateAuthentication();    // Setup guide
const examples = generator.generateExamples([...]);// Code examples
const errors = generator.generateErrorHandling();  // Error reference
const apiRef = generator.generateApiReference();   // Method docs
```

### Phase 4: Output

Write documentation files:

```typescript
const docs = generator.generateAll(examples);

// Write files
await writeFile('README.md', docs.readme);
await writeFile('docs/QUICKSTART.md', docs.quickstart);
await writeFile('docs/AUTHENTICATION.md', docs.authentication);
await writeFile('docs/EXAMPLES.md', docs.examples);
await writeFile('docs/ERROR_HANDLING.md', docs.errorHandling);
await writeFile('docs/API_REFERENCE.md', docs.apiReference);
```

## Section Details

### 1. README Section

**Purpose:** Overview and navigation

**Content:**
- SDK name, version, description
- Quick links to all docs
- Feature list (extracted from design)
- Installation instructions
- Quick start snippet
- Documentation navigation
- Support information

**Example Generator Logic:**

```typescript
buildHeader() {
  return `# ${this.config.sdkName}
${this.config.description}
**Version:** ${this.config.sdkVersion}`;
}

buildFeatures() {
  // Extract from designPlan
  return features.map(f => `- ${f}`).join('\n');
}
```

### 2. Quickstart Section

**Purpose:** Get running in 5 minutes

**Content:**
- Prerequisites list
- Installation command
- Credentials setup
- First successful request
- 3-4 common tasks with code
- Links to deeper docs

**Web2 vs Web3 Differences:**
- Web2: API key setup
- Web3: Wallet connection

### 3. Authentication Section

**Purpose:** Setup and security guide

**Content varies by authMethod:**

**API Key:**
- How to get key
- Environment variable setup
- Code example
- Security practices

**OAuth:**
- Authorization flow diagram
- Step-by-step setup
- Token exchange code
- Security practices

**Wallet:**
- Supported wallets list
- Connection code
- Event handlers
- Gas fee considerations

**None:**
- Simple import/use
- No setup required

### 4. Examples Section

**Purpose:** Working code for common use cases

**Organization by Difficulty:**

**Beginner (Basic Operations):**
- Read a single item
- List items
- Create simple resource
- Handle basic errors

**Intermediate (Complex Flows):**
- Multi-step operations
- Error recovery
- Filtering and searching
- Event handling

**Advanced (Real-World Patterns):**
- Background jobs/polling
- Batch operations
- Complex workflows
- Performance optimization

**Code Example Format:**

```markdown
### Example Title

Brief description of what it does.

\`\`\`language
// Full working code
\`\`\`

**Output:**
\`\`\`
Expected output
\`\`\`

**Explanation:**
What the code does and why.
```

### 5. Error Handling Section

**Purpose:** Understand and recover from errors

**Content:**

1. **Error Types** (categorized):
   ```
   - Authentication Errors
     - INVALID_CREDENTIALS
     - INSUFFICIENT_PERMISSIONS
   - Validation Errors
     - VALIDATION_FAILED
   - Network Errors
     - CONNECTION_TIMEOUT
     - RATE_LIMIT_EXCEEDED
   ```

2. **Error Documentation** for each type:
   - Error code
   - Description
   - Cause
   - Solution
   - Recovery code example

3. **Recovery Strategies**:
   - Retry with backoff
   - Error detection patterns
   - Fallback approaches

4. **Best Practices**:
   - Always use try-catch
   - Check error codes
   - Implement appropriate backoff
   - Log with context

### 6. API Reference Section

**Purpose:** Complete method documentation

**Content:**

For each method:
```markdown
## method_name()

Description of what it does.

### Parameters

| Name | Type | Description |
|------|------|-------------|
| param1 | string | Description |

### Returns

`ReturnType`

### Example

\`\`\`typescript
const result = await client.method_name(params);
\`\`\`
```

## Web2 vs Web3 Documentation Adaptations

### Web2 SDKs (REST/GraphQL APIs)

**Characteristics:**
- API Key authentication
- HTTP-based requests
- Synchronous (mostly)
- Standard error codes
- Rate limiting

**Adapted Sections:**
- Authentication: API key setup
- Examples: REST call patterns, pagination
- Errors: HTTP status codes, standard errors
- Setup: Environment variables, baseURL

**Example: GitHub SDK**

```typescript
// Authentication
const config = {
  token: process.env.GITHUB_TOKEN
};

// Error Handling
if (error.code === 'NOT_FOUND') {
  // 404 error
}

// Examples
const repos = await github.repos.list();
```

### Web3 SDKs (Blockchain)

**Characteristics:**
- Wallet authentication
- Transaction-based operations
- Asynchronous operations
- Explicit state tracking
- Multi-chain support

**Adapted Sections:**
- Authentication: Wallet connection
- Examples: Transaction lifecycle, gas estimation
- Errors: Blockchain-specific errors
- Setup: RPC endpoint, chain selection

**Example: Uniswap SDK**

```typescript
// Authentication
await uniswap.connectWallet();

// Transaction Lifecycle
const tx = await uniswap.swap({...});
const receipt = await uniswap.waitForConfirmation(tx.hash);

// Error Handling
if (error.code === 'WRONG_CHAIN') {
  // Handle chain mismatch
}

// Examples
const gasEstimate = await uniswap.estimateGasForSwap({...});
```

## Ensuring Docs Match Code

### 1. Automatic Method Extraction

Methods extracted directly from SDKDesignPlan:

```typescript
withMethods(methods: SDKMethod[]): DocumentationGenerator {
  methods.forEach(method => {
    this.context.methods.set(method.name, method);
    
    // API Reference auto-generated from method signatures
    // Examples auto-generated from method parameters
  });
  return this;
}
```

### 2. Signature-Based Generation

Method signatures drive code examples:

```typescript
buildMethodExample(method: SDKMethod) {
  const params = method.parameters
    .map(p => `${p.name}: ${p.type}`)
    .join(', ');
  
  return `await client.${method.name}({${params}})`;
}
```

### 3. Error Type Alignment

Error docs from actual SDK error definitions:

```typescript
withErrors(errors: ErrorDocumentation[]) {
  errors.forEach(error => {
    // Only document errors SDK actually throws
    // Recovery strategies match implementation
    this.context.errorTypes.set(error.code, error);
  });
}
```

### 4. Live Code Verification

Generated examples are executable:

```typescript
// Each code example can be run and tested
// Output examples verified to match actual SDK output
// Error handling examples tested against real errors
```

## Best Practices

### For Generator Configuration

 **DO:**
- Specify correct `audience` level for target users
- Include appropriate links for your documentation
- Set `authRequired: true` if auth is mandatory
- Match `language` to your SDK implementation
- Include all relevant `sections`

 **DON'T:**
- Mix advanced and beginner content
- Leave required fields empty
- Forget to specify auth method
- Use wrong SDK name/version

### For Code Examples

 **DO:**
- Make examples runnable and tested
- Include realistic input values
- Show error handling
- Add clear comments
- Display expected output
- Explain what code does

 **DON'T:**
- Use placeholder code that won't work
- Include irrelevant or confusing examples
- Skip error handling examples
- Make examples too simple for purpose
- Leave output ambiguous

### For Error Documentation

 **DO:**
- Include all SDK-specific error codes
- Explain causes clearly
- Provide recovery strategies
- Include recovery code examples
- Group errors by category
- List best practices

 **DON'T:**
- Document generic HTTP errors only
- Leave causes vague
- Suggest only one recovery path
- Forget error prevention tips
- Mix different error categories

## Integration with FOST System

The generator integrates with the main FOST pipeline:

```
Canonical SDK Schema
        ↓
   Design Plan
        ↓
   Code Generator  Generated Code
        ↓
Doc Generator  Documentation
        ↓
    Output (TypeScript files)
           
        Output (Markdown docs)
```

### Input from Code Generation

```typescript
// After code is generated, extract:
const designPlan = generator.designPlan;
const methods = codeGenerator.extractMethods();
const errors = codeGenerator.extractErrors();

// Pass to doc generator
const docGen = new DocumentationGenerator(config)
  .withDesignPlan(designPlan)
  .withMethods(methods)
  .withErrors(errors);
```

### Output to Users

```
/dist/
├── sdk/
│   ├── index.ts
│   ├── client.ts
│   └── types.ts
└── docs/
    ├── README.md
    ├── QUICKSTART.md
    ├── AUTHENTICATION.md
    ├── EXAMPLES.md
    ├── ERROR_HANDLING.md
    └── API_REFERENCE.md
```

## Extension Points

### Add Custom Sections

```typescript
const customSections: CustomDocumentationSection[] = [
  {
    name: "performance",
    title: "Performance Guide",
    content: "# Performance Optimization\n...",
    order: 7
  }
];

const config = {
  ...baseConfig,
  customSections
};
```

### Add Custom Builders

```typescript
class CustomBuilder {
  constructor(private config: DocumentationConfig) {}
  
  withContext(context: DocumentationContext): CustomBuilder {
    // Implementation
    return this;
  }
  
  build(): string {
    // Generate custom section
    return "...";
  }
}
```

### Extend with Languages

```typescript
// Add new language support in builders
if (this.config.language === 'python') {
  return generatePythonExample();
} else if (this.config.language === 'go') {
  return generateGoExample();
}
```

## Statistics

**Web2 (GitHub SDK):**
- README: ~800 lines
- Quickstart: ~300 lines
- Authentication: ~350 lines
- Examples: ~1,200 lines (6 examples)
- Error Handling: ~450 lines
- API Reference: ~400 lines
- **Total: ~3,500 lines**

**Web3 (Uniswap SDK):**
- README: ~1,000 lines
- Quickstart: ~500 lines
- Wallet Setup: ~350 lines
- Examples: ~1,500 lines (6 examples)
- Error Handling: ~600 lines
- API Reference: ~400 lines
- **Total: ~4,350 lines**

## Conclusion

The Documentation and Examples Generator automates the creation of production-ready SDK documentation that:

 Exactly matches generated code  
 Is beginner-friendly yet technically accurate  
 Includes realistic, working examples  
 Adapts to Web2 and Web3 patterns  
 Provides comprehensive error guidance  
 Enables quick developer onboarding  

This ensures users can get productive with generated SDKs immediately while having clear paths to understanding advanced features and best practices.
