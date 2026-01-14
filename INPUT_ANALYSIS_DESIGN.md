# Input Analysis Layer - Design Document

**Date:** January 14, 2026  
**Status:** Implementation Complete  
**Phase:** Core Input Normalization

## 1. Overview

The Input Analysis Layer is the **first deterministic processing stage** that converts diverse product specifications (OpenAPI, Smart Contract ABIs, etc.) into a unified intermediate representation (NormalizedSpec).

**Key constraint:** No LLM usage. Pure deterministic parsing and validation.

## 2. Design Principles

### 2.1 Determinism First

```
Input Spec → Parser → NormalizedSpec
  (fixed)  (deterministic logic) (deterministic)

Same input always produces:
- Identical output
- Identical error codes
- Identical warnings
```

This enables:
- Reproducible SDK generation
- Testable parsing logic
- Auditable transformations
- No hallucination

### 2.2 No Implicit Assumptions

Parsers work only with what's explicitly defined:

| Implicit Assumption | Wrong ❌ | Explicit ✅ |
|--------------------|---------|-----------|
| "Status field probably indicates error" | Guess enum values | Error codes explicitly listed |
| "This field looks like a price" | Assume decimal handling | Type explicitly specified |
| "User probably auth-required" | Add auth requirement | Auth explicitly defined per operation |

### 2.3 Clear Error Semantics

All errors include:
1. **Code** (machine-readable): `UNRESOLVABLE_TYPE_REFS`
2. **Message** (human-readable): `Found unresolvable type references: PaymentMethod`
3. **Path** (JSON path): `operations[5].response.type`
4. **Suggestion** (remediation): `Define PaymentMethod in the types section`

## 3. Architecture

### 3.1 Parser Pipeline

```
Input Spec
    │
    ├─ Format Detection
    │   └─ Lookup in ParserRegistry
    │
    ├─ Format-Specific Parser
    │   ├─ Syntax validation (JSON, YAML)
    │   ├─ Schema-level validation
    │   ├─ Extract types
    │   ├─ Extract operations
    │   ├─ Extract auth model
    │   └─ Extract errors
    │
    ├─ Type Reference Resolution
    │   ├─ Check all type references
    │   ├─ Detect circular dependencies
    │   └─ Build complete type graph
    │
    ├─ Semantic Validation
    │   ├─ Verify completeness
    │   ├─ Check consistency
    │   └─ Validate constraints
    │
    └─ Output
        └─ NormalizedSpec (with warnings)
```

### 3.2 Key Components

#### InputNormalizer (Registry & Coordinator)

```typescript
class InputNormalizer {
  - parsers: SpecParser[]
  - normalize(input: InputSpec): NormalizationResult
  - registerParser(parser: SpecParser): void
  - validateNormalizedSpec(spec: NormalizedSpec): ValidationResult
}
```

**Responsibilities:**
1. Dispatch input to correct parser
2. Coordinate validation
3. Collect errors/warnings
4. Return structured result

#### Parser Interface

```typescript
abstract class SpecParser {
  abstract canParse(input: InputSpec): boolean
  abstract parse(input: InputSpec): ParserResult
}
```

**Responsibilities:**
1. Validate input format
2. Extract entities (types, operations, errors)
3. Perform type resolution
4. Return NormalizedSpec or errors

#### BaseParser (Shared Utilities)

Common functionality all parsers use:
- Type reference resolution
- Validation helpers
- Error collection
- Type normalization

## 4. NormalizedSpec - Intermediate Representation

The bridge format between input spec and canonical schema.

### 4.1 Why Not Use Input Spec Directly?

| Aspect | Input Spec | NormalizedSpec |
|--------|-----------|----------------|
| **Format** | Many: OpenAPI, ABI, custom | One: unified |
| **Explicitness** | May be implicit | All explicit |
| **Completeness** | May have required fields missing | Guaranteed complete for SDK gen |
| **Type Safety** | TypeScript type coverage | 100% type coverage |
| **Validation** | Tool-specific | Uniform |

### 4.2 Structure

```
NormalizedSpec {
  product: {
    name, version, description,
    contact, license, termsOfService
  }
  types: {
    [name]: {
      name, description, type (object|enum|primitive|array|union),
      fields, enumValues, items, mapValueType,
      nullable, examples, required
    }
  }
  operations: {
    id, name, description,
    method (GET|POST|PUT|function),
    path, functionName,
    parameters, requestBody, response,
    errors, authentication, tags,
    deprecated, examples
  }
  errors: {
    code, httpStatus, message, description
  }
  authentication: {
    type (none|api_key|bearer|oauth2|wallet),
    required, description, details
  }
  networks: {
    id, name, type (rest|rpc|graphql),
    url, chainId, environment
  }
  source: {
    inputType, sourcePath, parsedAt, parser, version
  }
  normalizationNotes: [
    { level, code, message, location }
  ]
}
```

## 5. Supported Input Formats

### 5.1 OpenAPI 3.0 / 3.1

**Parser:** `OpenAPIParser`

**Converts:**
- `openapi.info` → `product`
- `openapi.components.schemas` → `types`
- `openapi.paths` → `operations`
- `openapi.components.securitySchemes` → `authentication`
- `openapi.servers` → `networks`

**Type mappings:**
```
OpenAPI                  → Normalized
type: "string"          → primitive "string"
type: "integer"         → primitive "number"
$ref: "#/..."           → resolved reference
type: "array"           → array with items
type: "object"          → object with fields
enum: [...]             → enum with enumValues
```

**Parameter location classification:**
- `in: "path"` → `location: "path"`
- `in: "query"` → `location: "query"`
- `in: "body"` → `location: "body"`
- `in: "header"` → `location: "header"`

**Error extraction:**
- Response codes ≥ 400 → error code
- HTTP 400 → `BAD_REQUEST`
- HTTP 401 → `UNAUTHORIZED`
- HTTP 429 → `RATE_LIMITED`
- etc.

**Authentication detection:**
- `securitySchemes` present → auth required
- `type: "http", scheme: "bearer"` → bearer auth
- `type: "apiKey"` → API key auth
- `type: "oauth2"` → OAuth2 auth

### 5.2 Swagger 2.0

**Parser:** `OpenAPIParser` (with backward compatibility)

**Converts:**
- `swagger.info` → `product`
- `swagger.definitions` → `types`
- `swagger.paths` → `operations`
- `swagger.securityDefinitions` → `authentication`
- `swagger.host + swagger.basePath` → `networks`

### 5.3 Smart Contract ABI (Solidity/EVM)

**Parser:** `ContractABIParser`

**Converts:**
- Metadata → `product`
- Event types → custom types
- Functions → `operations`
- Function parameters → `parameters`
- Return types → `response.type`
- Custom errors → error codes
- Function mutability (`view`, `payable`) → auth requirements

**Solidity type mappings:**
```
Solidity        → Normalized
uint256         → BigInt
uint8-uint64    → number
address         → Address
bytes32         → Bytes32
bool            → boolean
string          → string
tuple           → tuple (with fields)
address[]       → Address[]
```

**State mutability mapping:**
- `view`, `pure` → read-only (no auth needed)
- `payable`, `nonpayable` → transaction (wallet auth)

### 5.4 Chain Metadata (Web3)

**Parser:** `ChainMetadataParser`

**Converts:**
- Chain configs → `networks`
- Predefined chains → RPC endpoints, block times, finality

**Predefined chains:**
- Ethereum Mainnet, Sepolia, etc.
- Polygon, Arbitrum, Optimism
- Solana Mainnet, Devnet
- Extensible registry

## 6. Validation Strategy

### 6.1 Levels of Validation

| Level | When | Severity | Action |
|-------|------|----------|--------|
| **Syntax** | During parse | Error | Reject |
| **Schema** | During parse | Error | Reject |
| **Semantic** | After parse | Error/Warning | Reject if major, warn if minor |
| **Reference** | After all parse | Warning | Warn if unresolvable |
| **Circular** | After ref check | Warning | Warn on circular refs |

### 6.2 Validation Rules

#### Type References
- All types in operations must be defined or built-in
- All fields must reference defined types
- Array element types must be resolvable
- Union types must all be defined

#### Operation Completeness
- All operations must have unique IDs
- Response types must exist
- All error codes referenced must be defined
- Parameters must have types

#### Error Coverage
- All operations must list errors they throw
- Error codes must be defined
- No undefined error codes

#### Auth Consistency
- Operations with conflicting auth requirements must be flagged
- Global auth model must align with operation-level auth

### 6.3 Error Reporting

```typescript
ValidationError {
  code: "UNRESOLVABLE_TYPE_REFS"
  message: "Operation getUser references undefined type: User"
  path: "operations[0].response.type"
  suggestion: "Define User type in types section"
}
```

Error codes are consistent, searchable, and actionable.

## 7. Determinism & Testing

### 7.1 Test Strategy

```typescript
// Snapshot testing ensures deterministic output
test("OpenAPI parsing produces consistent output", () => {
  const spec = fs.readFileSync("stripe-openapi.json");
  const input: InputSpec = {
    type: "openapi-3.0",
    format: "json",
    source: "stripe",
    rawContent: JSON.parse(spec)
  };
  
  // Run 100 times - must produce identical output
  const results = [];
  for (let i = 0; i < 100; i++) {
    results.push(normalizeInput(input));
  }
  
  // All results must be identical
  expect(results).toEqual([results[0], ...results.slice(1)]);
});
```

### 7.2 Properties Tested

1. **Idempotence**: parse(parse(spec)) ≈ parse(spec)
2. **Consistency**: Multiple parses produce identical output
3. **Type coverage**: All types extracted
4. **Operation coverage**: All operations extracted
5. **Error handling**: Expected errors are caught

## 8. Error Cases & Handling

### 8.1 Graceful Degradation

```typescript
// Missing optional field → warning, continue
{
  level: "warning",
  code: "MISSING_DESCRIPTION",
  message: "Operation createUser has no description",
  suggestion: "Add description for better documentation"
}

// Undefined type reference → error, fail
{
  level: "error",
  code: "UNRESOLVABLE_TYPE",
  message: "Operation createUser references undefined type: User",
  path: "operations[0].response.type",
  suggestion: "Define User type"
}
```

### 8.2 Ambiguity Handling

**When:** Multiple valid interpretations exist  
**Action:** Reject or ask for clarification

```typescript
// Example: Parameter could be query or body
{
  level: "warning",
  code: "AMBIGUOUS_PARAMETER",
  message: "Parameter 'filter' location ambiguous",
  suggestion: "Explicitly specify in: 'query' or in: 'body'"
}
```

## 9. Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Parse OpenAPI (100 endpoints) | < 50ms | Sequential |
| Parse ABI (50 functions) | < 10ms | Sequential |
| Validate types | < 20ms | Linear in type count |
| Type resolution | < 30ms | With circular detection |

## 10. Extension Points

### 10.1 Custom Parser

```typescript
class CustomFormatParser extends BaseParser {
  canParse(input: InputSpec): boolean {
    return input.type === "my-format";
  }

  parse(input: InputSpec): ParserResult {
    // Custom parsing logic
    // Must validate, resolve types, return NormalizedSpec
  }
}

// Register
const normalizer = getNormalizer();
normalizer.registerParser(new CustomFormatParser());
```

### 10.2 Custom Validation

```typescript
const validationResult = normalizer.validateNormalizedSpec(spec);
if (!validationResult.valid) {
  // Handle validation errors
}
```

## 11. Data Flow Example

### OpenAPI → NormalizedSpec

```
Input:
{
  openapi: "3.0.0",
  info: { title: "Payments", version: "1.0.0" },
  components: {
    schemas: {
      Payment: {
        type: "object",
        properties: { id: { type: "string" } }
      }
    }
  },
  paths: {
    "/payments": {
      post: {
        requestBody: { schema: { $ref: "#/components/schemas/Payment" } },
        responses: { 201: { schema: { $ref: "#/components/schemas/Payment" } } }
      }
    }
  }
}

Processing:
1. OpenAPIParser.parse() called
2. Extract info → product.name = "payments", product.version = "1.0.0"
3. Extract schemas → types.Payment = { type: "object", fields: { id } }
4. Extract paths → operations[0] = { method: "POST", path: "/payments" }
5. Resolve $ref → "Payment" → found in types ✓
6. Validate → all refs valid ✓

Output:
NormalizedSpec {
  product: { name: "payments", version: "1.0.0" },
  types: { Payment: { type: "object", fields: { id } } },
  operations: [{
    id: "createPayment",
    method: "POST",
    path: "/payments",
    response: { type: "Payment" }
  }],
  normalizationNotes: []
}
```

## 12. Success Criteria

- ✅ All format-specific parsers implemented
- ✅ Type reference resolution working
- ✅ Validation catches all inconsistencies
- ✅ Error messages are actionable
- ✅ Zero hallucination (parsing only what's present)
- ✅ Deterministic output (same input → same output)
- ✅ Performance < 100ms for typical specs
- ✅ Full type safety (TypeScript)

## 13. Next Phase

NormalizedSpec flows to **Canonicalization Layer**, which:

1. Classifies product (Web2 vs Web3)
2. Applies domain-specific transformations
3. Produces `ProductCanonicalSchema`
4. Ready for code generation

---

**Implementation Status:** ✅ Complete
- [x] Types defined
- [x] OpenAPI parser
- [x] Contract ABI parser
- [x] Chain metadata parser
- [x] Validation
- [x] Normalizer registry
- [x] Examples
- [x] Documentation
