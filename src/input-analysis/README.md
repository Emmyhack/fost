# Input Analysis Layer

**Status:** Deterministic parsing & normalization (no LLM usage)

The input analysis layer converts diverse product specifications (OpenAPI, Solidity ABI, etc.) into a unified **normalized intermediate representation (NormalizedSpec)** that serves as input to the canonicalization layer.

## Architecture

```
Raw Input Specs
  ├── OpenAPI 3.0/3.1
  ├── Swagger 2.0
  ├── Smart Contract ABIs
  ├── Chain Metadata
  └── Custom Formats

         │
         ▼

  Input Analysis Layer
  ├── Parser Registry
  ├── Format-Specific Parsers
  ├── Type Resolution
  └── Validation

         │
         ▼

  NormalizedSpec (Intermediate)
  ├── Product Info
  ├── Types
  ├── Operations
  ├── Errors
  ├── Auth Model
  └── Networks

         │
         ▼

  Canonicalization Layer
  (Next step: ProductCanonicalSchema)
```

## Core Concepts

### 1. **NormalizedSpec** - Intermediate Representation

The bridge between raw input and canonical schema. Contains all information needed for downstream processing, expressed in a language-agnostic way.

**Key properties:**
- `product`: Metadata (name, version, description)
- `types`: All type definitions (object, enum, primitive, etc.)
- `operations`: All API operations/contract functions
- `errors`: Error code definitions
- `authentication`: Auth model (API key, OAuth, wallet, etc.)
- `networks`: Network/environment configs
- `source`: Input traceability (what parser, when)
- `normalizationNotes`: Warnings and info from parsing

### 2. **Parsers** - Format-Specific Conversion

Each parser implements the `SpecParser` interface and converts from a specific format to `NormalizedSpec`.

**Available parsers:**

| Format | Parser | Status |
|--------|--------|--------|
| OpenAPI 3.0 | `OpenAPIParser` | [DONE] |
| OpenAPI 3.1 | `OpenAPIParser` | [DONE] |
| Swagger 2.0 | `OpenAPIParser` | [DONE] |
| Contract ABI (Solidity) | `ContractABIParser` | [DONE] |
| Chain Metadata | `ChainMetadataParser` | [DONE] |

**Adding a parser:**

```typescript
class MyCustomParser extends BaseParser {
  canParse(input: InputSpec): boolean {
    return input.type === "my-format";
  }

  parse(input: InputSpec): ParserResult {
    // Deterministic parsing logic
    // Return NormalizedSpec or errors
  }
}

const normalizer = getNormalizer();
normalizer.registerParser(new MyCustomParser());
```

### 3. **Validation** - Consistency Checks

After parsing, validation ensures:
- All type references resolve
- No duplicate operation IDs or type names
- All error codes referenced by operations are defined
- Required fields are present

**Validation does NOT require LLM.** It's pure deterministic checking.

## Usage

### Basic Normalization

```typescript
import { normalizeInput, InputSpec } from "@fost/input-analysis";

const spec: InputSpec = {
  type: "openapi-3.0",
  format: "json",
  source: "https://api.example.com/openapi.json",
  rawContent: { /* OpenAPI spec */ }
};

const result = normalizeInput(spec);

if (result.success) {
  console.log("Normalized:", result.spec);
} else {
  console.error("Error:", result.error);
  console.error("Parse errors:", result.parseErrors);
}

// Check warnings even on success
if (result.warnings.length > 0) {
  console.warn("Warnings:", result.warnings);
}
```

### Handling Errors

All errors are structured with:
- `code`: Machine-readable error code
- `message`: Human-readable description
- `path`: JSON path to problematic data (for validation errors)
- `suggestion`: How to fix it

```typescript
if (!result.success && result.validationErrors) {
  result.validationErrors.forEach(error => {
    console.error(`[${error.code}] ${error.path}:`);
    console.error(`  ${error.message}`);
    if (error.suggestion) {
      console.error(`  Fix: ${error.suggestion}`);
    }
  });
}
```

### Custom Validation

```typescript
const normalizer = new InputNormalizer();

// Add custom parser
normalizer.registerParser(new MyCustomParser());

// Normalize
const result = normalizer.normalize(spec);
```

## Error Handling Strategy

### Deterministic Error Classification

| Error Type | Handling | Example |
|-----------|----------|---------|
| **Syntax Error** | Reject with details | JSON parse failure |
| **Missing Required Field** | Reject with suggestion | Missing `name` in product |
| **Unresolvable Type Reference** | Reject or warn | Operation references undefined type |
| **Ambiguous Data** | Warn, suggest manual clarification | Multiple auth methods |
| **Extra/Unknown Field** | Warn, continue parsing | Unknown property in schema |

### No Hallucination

The parser will **never**:
- Invent missing types
- Assume auth requirements
- Generate default values for missing fields
- Guess at data structure

Instead, it returns explicit errors with remediation guidance.

## Examples

### Example 1: REST API (Payment API)

See [examples.ts](./examples.ts) for a complete OpenAPI 3.0 spec demonstrating:
- Complex object types with validation
- Multiple endpoints with different auth requirements
- Pagination configuration
- Error handling across multiple status codes

**Result:**
- 3 types extracted
- 3 operations extracted
- 6 error codes extracted
- Bearer token authentication detected

### Example 2: Smart Contract (Uniswap V3)

See [examples.ts](./examples.ts) for a complete Solidity ABI demonstrating:
- Function parameter parsing (including tuple types)
- State mutability mapping (view, payable, etc.)
- Event log definitions
- Custom error handling
- Gas considerations

**Result:**
- 3 functions extracted as operations
- 1 event extracted
- 3 custom errors extracted
- Wallet authentication requirement detected

## Type Mapping Reference

### REST → NormalizedSpec

| OpenAPI | Normalized | Notes |
|---------|-----------|-------|
| `type: "string"` | `{ type: "primitive", primitiveType: "string" }` | |
| `type: "integer"` | `{ type: "primitive", primitiveType: "number" }` | |
| `$ref: "#/components/schemas/User"` | `{ type: "User" }` | Reference resolved |
| `type: "array", items: {...}` | `{ type: "array", items: {...} }` | Array handling |
| `enum: [...]` | `{ type: "enum", enumValues: [...] }` | Enum support |

### Solidity → NormalizedSpec

| Solidity | Normalized | Example |
|----------|-----------|---------|
| `uint256` | `BigInt` | Large numbers |
| `uint8..uint64` | `number` | Small numbers |
| `address` | `Address` | Ethereum addresses |
| `bytes32` | `Bytes32` | Hash values |
| `bool` | `boolean` | Boolean |
| `string` | `string` | Strings |

## Design Principles

### 1. **Determinism**

Same input → same output, always. No randomness, no LLM variability.

### 2. **Explicit Over Implicit**

All assumptions are stated. Missing data is reported, not guessed.

### 3. **No Hallucination**

Parsers only extract what's present in the spec. Types/fields/operations must be explicitly defined.

### 4. **Composable**

Normalized specs can be merged or transformed. Each layer operates independently.

### 5. **Traceable**

All normalizations include source information for debugging:
- Which parser was used
- Timestamp
- Input source path
- Warnings and notes

## Performance

- OpenAPI 3.0 spec (100 endpoints): < 50ms
- Contract ABI (50 functions): < 10ms
- Chain metadata: < 5ms

All parsing is synchronous. No async I/O in this layer.

## Next Steps

The NormalizedSpec flows to the **Canonicalization Layer**, which:

1. Detects product type (Web2 vs Web3)
2. Applies domain-specific transformations
3. Produces `ProductCanonicalSchema` (language-agnostic blueprint)
4. Feeds into SDK design and code generation

## Files

```
src/input-analysis/
├── types.ts                    # Intermediate representation types
├── base-parser.ts              # Parser base class & utilities
├── parsers/
│   ├── openapi.ts              # OpenAPI/Swagger parser
│   ├── contract-abi.ts         # Smart contract ABI parser
│   └── chain-metadata.ts       # Blockchain network metadata
├── normalizer.ts               # Parser registry & pipeline
├── examples.ts                 # Working examples
├── index.ts                    # Public API
└── README.md                   # This file
```

## Testing

Run the examples:

```typescript
import { runExamples } from "@fost/input-analysis";
runExamples();
```

This demonstrates:
- OpenAPI parsing and normalization
- Contract ABI parsing
- Error detection and warnings
- Validation of type references

---

**Design Note:** This layer is intentionally **deterministic and free of LLM usage**. All logic is testable, auditable, and reproducible. LLMs enter the system only in the documentation generation and code quality improvement phases, not in the critical path of parsing and normalization.
