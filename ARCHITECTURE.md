# SDK Generation System - Architecture Design

**Date:** January 14, 2026  
**Status:** Design Phase  
**Audience:** Engineering team, system architects

---

## 1. Executive Summary

The SDK generation system is a deterministic-first pipeline that:
1. **Normalizes** diverse product specifications into a canonical intermediate representation (IR)
2. **Designs** opinionated SDKs based on product type and target language
3. **Generates** code, documentation, and tests with LLM assistance where it adds value
4. **Validates** outputs against quality gates before delivery

**Key architectural principle:** LLMs are *enhancement layers*, not the system backbone. All critical logic is deterministic, testable, and auditable.

---

## 2. Core System Components

### 2.1 Input Ingestion Layer
**Responsibility:** Accept and parse diverse product specifications into normalized schemas.

**Components:**
- **REST Parser** → OpenAPI 3.x → Normalized Spec
- **GraphQL Parser** → GraphQL Schema → Normalized Spec
- **Smart Contract Parser** → ABI/Source → Normalized Spec
- **gRPC Parser** → Proto files → Normalized Spec
- **Input Validator** → Schema conformance checks

**Deterministic:** ✅ 100% (parsing + validation via schema)  
**Extensible:** New parsers registered in parser registry

### 2.2 Canonicalization Layer
**Responsibility:** Convert diverse normalized specs into a single canonical intermediate representation.

**Components:**
- **Type System Normalizer** → All types → Core IR type set
- **Endpoint/Method Normalizer** → Unify operation representations
- **Error Mapping** → Standardize error contracts
- **Authentication Mapper** → OAuth, API keys, wallets, etc.
- **IR Validator** → Ensure IR completeness and consistency

**Output:** `ProductCanonicalIR` (deterministic, language-agnostic)

**Deterministic:** ✅ 100%

### 2.3 Product Classification Engine
**Responsibility:** Determine SDK generation strategy based on product characteristics.

**Components:**
- **Type Detector** → Web2 REST? GraphQL? Web3 blockchain? Hybrid?
- **Complexity Analyzer** → Endpoint count, type complexity, dependency depth
- **Chain Detector** (Web3) → Ethereum, Solana, Cosmos, etc.
- **SDK Profile Selector** → Thin wrapper vs. thick SDK vs. domain-specific

**Deterministic:** ✅ 100% (rules-based classification)

### 2.4 SDK Design Layer
**Responsibility:** Create an opinionated SDK design specification for the target language.

**Components:**
- **Language-Specific Designer** → TypeScript, Python, Go, Rust patterns
- **API Style Guide** → Naming conventions, error handling, async patterns
- **Client Architecture** → Request/response, retries, caching, batch operations
- **Web2 vs Web3 Divergence Handler** → Route to appropriate design paths
- **Design Validator** → Consistency, completeness, adherence to conventions

**Deterministic with LLM Guidance:**
- **Deterministic:** ✅ Structure, patterns, conventions
- **LLM-Assisted:** ⚡ API naming refinement, code idiom suggestions

**Output:** `SDKDesignSpec` (blueprint for code generation)

### 2.5 Code Generation Layer
**Responsibility:** Generate production-quality SDK code from design specifications.

**Components:**
- **Type Generator** → Generate type definitions
- **Client Generator** → Generate HTTP/RPC client code
- **Method Generator** → Generate operation methods with proper signatures
- **Error Handler Generator** → Custom error types and handling
- **Web3-Specific Generators:**
  - Transaction builder
  - Gas estimator wrapper
  - Wallet/signer integration
  - Chain-specific utilities

**Deterministic:** ✅ 95% (template-based code generation)  
**LLM-Assisted:** ⚡ Complex method implementations, edge case handling

**Output:** Language-specific source files (.ts, .py, .go, etc.)

### 2.6 Documentation Generator
**Responsibility:** Create comprehensive, accurate, developer-friendly documentation.

**Components:**
- **Reference Doc Generator** → Auto-generate from IR (deterministic)
- **Example Generator** → Realistic, runnable examples
- **Guide Generator** → Setup, auth flows, common patterns
- **Changelog Generator** → Version notes, breaking changes

**Deterministic:** ✅ 70%  
**LLM-Driven:** ⚡ 30% (example quality, prose quality, guide structure)

**LLM Usage Rationale:** Documentation prose needs human-like quality; examples benefit from creative variation.

### 2.7 Test Generator
**Responsibility:** Create test suites ensuring SDK reliability.

**Components:**
- **Unit Test Generator** → Type correctness, method signatures
- **Integration Test Template Generator** → Mock API patterns
- **Test Data Generator** → Realistic payloads from spec
- **Web3-Specific Test Generator** → Transaction simulation, gas estimation

**Deterministic:** ✅ 85%  
**LLM-Assisted:** ⚡ Test case edge case discovery

### 2.8 Quality Assurance Layer
**Responsibility:** Validate all outputs before delivery.

**Components:**
- **Type Checker** → Language-specific (tsc, pyright, etc.)
- **Linter** → Code quality, style conformance
- **Integration Validator** → Generated SDK works with real/mock APIs
- **Documentation Validator** → Links, code snippets compile
- **Security Scanner** → No secrets, proper auth handling

**Deterministic:** ✅ 100%

### 2.9 Extensibility Registry
**Responsibility:** Maintain pluggable components for new languages, chains, patterns.

**Components:**
- **Language Registry** → TypeScript, Python, Go, Rust, Kotlin, Swift
- **Chain Registry** (Web3) → Ethereum, Solana, Cosmos, Starknet, etc.
- **Parser Registry** → Custom spec formats
- **Generator Registry** → Domain-specific generators (trading SDKs, payment SDKs, etc.)

**Deterministic:** ✅ 100%

---

## 3. Architectural Principles & Boundaries

### 3.1 Deterministic vs. LLM Logic

| Layer | Deterministic | LLM-Assisted | Rationale |
|-------|---------------|--------------|-----------|
| **Parsing** | 100% | — | Must be reproducible and auditable |
| **Canonicalization** | 100% | — | Must be deterministic bridge between formats |
| **Classification** | 100% | — | Rule-based detection prevents inconsistency |
| **SDK Design** | 95% | 5% | Structure is deterministic; naming guidance from LLM |
| **Code Generation** | 95% | 5% | Boilerplate is deterministic; complex logic patterns assisted |
| **Documentation** | 70% | 30% | Reference auto-generated; prose quality improved by LLM |
| **Tests** | 85% | 15% | Structure deterministic; edge cases suggested by LLM |
| **QA** | 100% | — | Must be reproducible and fail deterministically |

**Key Rule:** If it affects production code correctness, it must be deterministic.

### 3.2 Web2 vs. Web3 Divergence & Convergence

```
┌─────────────────────────────────────────────────────┐
│         Input: Product Specification                │
│  (OpenAPI, GraphQL, ABI, Proto, Custom)             │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│      Canonicalization (Type-Agnostic)               │
│    Create ProductCanonicalIR                        │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  Product Classification (Deterministic)             │
│  ┌──────────────────────────────────────────────┐  │
│  │ Is this Web2 (REST/GraphQL) or              │  │
│  │ Web3 (Blockchain) or Hybrid?                │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────┬─────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    ┌────────┐           ┌────────┐
    │ WEB2   │           │ WEB3   │
    │ FLOW   │           │ FLOW   │
    └────────┘           └────────┘
        │                     │
        ▼                     ▼
    WEB2:                 WEB3:
    - REST paths          - Chain detection
    - Query/body          - ABI parsing
    - Auth mapping        - Wallet integration
    - Error schemas       - Gas estimation
    - Rate limits         - Transaction building
    - Middleware          - Network abstraction
        │                     │
        └──────────┬──────────┘
                   ▼
    ┌─────────────────────────────────────┐
    │ SDK Design (Language-Agnostic)      │
    │ - API style guide                   │
    │ - Error handling patterns           │
    │ - Retry/caching strategy            │
    │ - Configuration model               │
    └─────────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ Language-Specific Code Generation   │
    │ (TypeScript, Python, Go, etc.)      │
    └─────────────────────────────────────┘
```

**Web2 Characteristics:**
- Stateless request/response
- Authentication (OAuth, API keys, basic auth)
- HTTP semantics (GET, POST, etc.)
- Deterministic error codes
- Rate limiting and timeouts
- Simple retry logic

**Web3 Characteristics:**
- Stateful transactions
- Wallet/signer responsibility moved to client
- Gas cost estimation required
- Multi-chain support needed
- Asynchronous finality
- Custom error semantics per chain
- Batch operations common
- Transaction simulation available

**Re-convergence:** Both produce language-specific SDKs with:
- Type-safe client construction
- Proper error handling
- Logging/observability
- Configuration management
- Example usage

---

## 4. Data Flow & Key Models

### 4.1 Core Data Models

```
1. INPUT SPECS (Heterogeneous)
   ├── OpenAPI 3.x JSON/YAML
   ├── GraphQL Schema
   ├── Smart Contract ABI (JSON)
   ├── Proto Files
   └── Custom Format

2. NORMALIZED SPEC (Post-Parser)
   {
     name, version, description
     endpoints: [{ method, path, params, response, auth, errors }]
     types: [{ name, schema, nullable, required_fields }]
     errors: [{ code, message, recovery }]
     auth: { type, scheme, scopes }
   }

3. PRODUCT CANONICAL IR (Language-Agnostic)
   {
     product: { name, version, type }
     classification: { is_web2, is_web3, primary_chain, complexity }
     api_surface: {
       operations: [Operation],
       types: [Type],
       errors: [ErrorSpec],
       auth: AuthSpec,
     }
     constraints: { rate_limits, timeouts, pagination }
     web3_specific?: {
       chains: [Chain],
       contract_addresses: Map<chain, address>,
       gas_estimation_method: string,
       wallet_patterns: [WalletPattern],
     }
   }

4. SDK DESIGN SPEC (Language-Agnostic)
   {
     target_language: string,
     architecture: {
       client_pattern: "thin_wrapper" | "thick_sdk" | "domain_specific"
       error_hierarchy: [ErrorClass],
       async_model: "promises" | "callbacks" | "async_await" | "channels"
       config_pattern: "constructor" | "env_vars" | "config_file"
     }
     modules: [{ name, exports, responsibilities }]
     conventions: { naming, error_handling, logging, testing }
   }

5. GENERATED CODE (Language-Specific)
   ├── client.ts (TypeScript)
   ├── types.ts
   ├── errors.ts
   └── index.ts
```

---

## 5. Failure Points & Resilience

### 5.1 Failure Categories

| Category | Failure Point | Detection | Recovery |
|----------|---------------|-----------|----------|
| **Input** | Malformed spec | Schema validation | Reject with clear error + remediation hints |
| **Parsing** | Unsupported format | Parser not found | Suggest format conversion or custom parser |
| **Canonicalization** | Conflicting semantics | IR validator | Mark ambiguities, require manual clarification |
| **Classification** | Ambiguous product type | Heuristic ambiguity | Ask user for clarification (Web2? Web3? Hybrid?) |
| **Web3 Chain** | Unknown chain | Chain registry lookup | Suggest adding chain config or custom integrations |
| **Code Generation** | Type incompatibility | Type system validator | Suggest simplification or custom handling |
| **Type Checking** | Code doesn't compile | Language-specific checker | Report error + suggest fix patterns |
| **Test Generation** | Mock API mismatch | Integration test failure | Report gap + suggest manual test case |

### 5.2 Deterministic Error Handling

**Principle:** All errors must be:
1. Reproducible (same input → same error)
2. Actionable (clear remediation path)
3. Auditable (logged, traceable)

**Error Flow:**
```
Input Error
    ↓
Catch & Classify
    ↓
Lookup Resolution Strategy
    ↓
Return (Error Code, Message, Remediation)
    ↓
User Action
```

**No silent failures.** No LLM hallucination of fixes.

---

## 6. Extensibility Model

### 6.1 Adding a New Language (e.g., Rust)

```
1. Register Language Parser
   LanguageRegistry.register("rust", {
     type_system: RustTypeMapper,
     async_model: "async_await",
     error_convention: "Result<T, E>",
   })

2. Create Language-Specific Generators
   - RustClientGenerator(SDKDesignSpec) → client.rs
   - RustTypeGenerator(Types) → types.rs
   - RustErrorGenerator(Errors) → errors.rs

3. Add Language Tests
   - Verify generated code compiles
   - Type signatures match contract
   - Error handling patterns work

4. Register in Code Generation Pipeline
   GeneratorRegistry.register("rust", RustGeneratorPipeline)
```

### 6.2 Adding a New Blockchain (e.g., Starknet)

```
1. Register Chain
   ChainRegistry.register("starknet", {
     network_type: "cairo_vm",
     signature_scheme: "stark_curve",
     gas_model: "invoke_variant",
   })

2. Create Chain-Specific Parsers
   - StarknetABIParser(abi_json) → NormalizedSpec
   - StarknetContractParser(cairo_source) → NormalizedSpec

3. Add Chain-Specific Generators
   - StarknetTransactionBuilder(...)
   - StarknetGasEstimator(...)
   - StarknetSignerIntegration(...)

4. Register in Web3 Generation Pipeline
   Web3GeneratorRegistry.register("starknet", StarknetGeneratorPipeline)
```

### 6.3 Adding a New Input Format (e.g., AsyncAPI)

```
1. Create Parser
   AsyncAPIParser(spec: string) → NormalizedSpec

2. Register in Parser Registry
   ParserRegistry.register("asyncapi", AsyncAPIParser)

3. Add to Input Detection
   InputDetector.register_format("asyncapi-3.0", detector_fn)

4. Test Against Canonicalization
   - Verify round-trip: AsyncAPI → NormalizedSpec → ProductCanonicalIR
```

---

## 7. System Architecture Diagram

```
╔════════════════════════════════════════════════════════════════╗
║                    EXTERNAL INPUTS                             ║
║  OpenAPI │ GraphQL │ ABI │ Proto │ Custom Format              ║
╚════════════════════════════════════════════════════════════════╝
                            │
                            ▼
╔════════════════════════════════════════════════════════════════╗
║              INPUT INGESTION LAYER                             ║
║  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             ║
║  │REST Parser  │ │GraphQL Parse│ │Contract Prs │ ...         ║
║  └────────┬────┘ └────────┬────┘ └────────┬────┘             ║
║           │               │               │                   ║
║           └───────────────┴───────────────┘                   ║
║                    Input Validator                             ║
╚────────────────────────┬────────────────────────────────────────╝
                         ▼
╔════════════════════════════════════════════════════════════════╗
║          CANONICALIZATION LAYER                               ║
║  Type Normalizer │ Endpoint Normalizer │ Auth Mapper          ║
║  Error Mapper │ IR Validator                                  ║
║                ▼                                              ║
║     ProductCanonicalIR (Type-Agnostic)                        ║
╚────────────────────────┬────────────────────────────────────────╝
                         ▼
╔════════════════════════════════════════════════════════════════╗
║       PRODUCT CLASSIFICATION ENGINE (Deterministic)           ║
║  Type Detector │ Chain Detector │ Complexity Analyzer         ║
║                ▼                                              ║
║     Classification: { web2 | web3 | hybrid }                 ║
╚────────────────┬──────────────────────────┬────────────────────╝
                 ▼                          ▼
          ┌──────────────┐          ┌──────────────┐
          │  WEB2 FLOW   │          │  WEB3 FLOW   │
          │              │          │              │
          │ REST Routes  │          │ Chain Detect │
          │ Auth Mapping │          │ ABI Parse    │
          │ Error Schema │          │ Gas Model    │
          │              │          │ Signers      │
          └──────────────┘          └──────────────┘
                 │                          │
                 └──────────────┬───────────┘
                                ▼
╔════════════════════════════════════════════════════════════════╗
║        SDK DESIGN LAYER (Language-Agnostic)                   ║
║  Language Designer │ API Style Guide │ Error Hierarchy        ║
║  Web2/Web3 Patterns │ Design Validator                        ║
║                ▼                                              ║
║     SDKDesignSpec (Blueprint for Language)                   ║
╚────────────────────────┬────────────────────────────────────────╝
                         ▼
╔════════════════════════════════════════════════════════════════╗
║     LANGUAGE-SPECIFIC CODE GENERATION                         ║
║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         ║
║  │TypeScript    │ │Python        │ │Go            │ ...     ║
║  │Generator     │ │Generator     │ │Generator     │         ║
║  └────────┬─────┘ └────────┬─────┘ └────────┬─────┘         ║
║           │                │                │                ║
║  Type Gen │ Client Gen │ Method Gen │ Error Gen │ Web3 Gen  ║
║           │                │                │                ║
║           └────────────────┴────────────────┘                ║
║                        ▼                                      ║
║         Generated Source Code (.ts, .py, .go, ...)           ║
╚────────────────────────┬────────────────────────────────────────╝
                         ▼
╔════════════════════════════════════════════════════════════════╗
║     DOCUMENTATION & TEST GENERATION                           ║
║  ┌──────────────────┐      ┌──────────────────┐             ║
║  │Doc Generator     │      │Test Generator    │             ║
║  │- Reference       │      │- Unit tests      │             ║
║  │- Examples        │      │- Integration     │             ║
║  │- Guides          │      │- Mocks           │             ║
║  └──────────────────┘      └──────────────────┘             ║
╚────────────────────────┬────────────────────────────────────────╝
                         ▼
╔════════════════════════════════════════════════════════════════╗
║        QUALITY ASSURANCE LAYER (Deterministic)                ║
║  Type Checker │ Linter │ Integration Validator                ║
║  Doc Validator │ Security Scanner                             ║
║                ▼                                              ║
║     PASS / FAIL (with detailed diagnostics)                  ║
╚────────────────────────┬────────────────────────────────────────╝
                         ▼
╔════════════════════════════════════════════════════════════════╗
║                OUTPUT PACKAGE                                 ║
║  SDK Code │ Types │ Docs │ Tests │ Examples │ README          ║
║                                                                ║
║  Ready for: npm publish, PyPI, crates.io, GitHub, etc.       ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 8. Extensibility Registry (System Design)

```
REGISTRIES (Singleton Pattern)

ParserRegistry
├── register(format, Parser) → void
├── detect(input) → Parser?
└── parse(input) → NormalizedSpec

ChainRegistry (Web3)
├── register(chain_name, ChainConfig) → void
└── get(chain_name) → ChainConfig?

LanguageRegistry
├── register(lang, LanguageConfig) → void
├── get(lang) → LanguageConfig?
└── list() → [Language]

GeneratorRegistry
├── register(lang, GeneratorPipeline) → void
└── get(lang) → GeneratorPipeline

CustomParserRegistry
├── register(name, ParserFn) → void
└── get(name) → ParserFn?
```

---

## 9. Decision Log

| Decision | Rationale | Alternative |
|----------|-----------|-------------|
| **LLM as enhancement, not backbone** | Determinism + auditability required for production | LLM-first approach |
| **Canonicalization layer required** | Bridge heterogeneous inputs without explosion of converters | Direct N-to-M parsers |
| **Web2/Web3 flow divergence** | Fundamentally different constraints need different handling | Force unified flow |
| **Registry pattern for extensibility** | Plugin architecture without core code changes | Hard-coded language support |
| **Design-before-generation** | Separation of concerns; reusable design specs | Direct code generation |
| **Quality assurance layer mandatory** | Catch errors before user delivery; deterministic validation | Skip QA, rely on LLM confidence |
| **Error-as-data model** | Errors must be machine-processable, not prose | Error messages as LLM outputs |

---

## 10. Open Questions for Implementation Phase

1. **Caching strategy:** Should we cache ProductCanonicalIR to speed up regeneration?
2. **Version management:** How do we handle SDK version bumps when spec changes?
3. **Breaking changes:** How does the system detect and communicate breaking changes?
4. **Custom business logic:** Where does product-specific code injection happen?
5. **SDK distribution:** Do we generate package.json, setup.py, Cargo.toml, etc.?
6. **Monorepo support:** Should one spec generate multiple language SDKs in a monorepo?
7. **Real-world testing:** How do we validate against live APIs without breaking them?
8. **Telemetry:** How do we track what specs, languages, chains are actually being used?

---

## 11. Success Metrics

- **Determinism:** 100% reproducible outputs (same input → bit-identical output)
- **Type coverage:** 100% of spec types expressible in generated SDK
- **Error fidelity:** All spec errors mapped to SDK errors
- **Code quality:** Generated code passes language-specific linters without warnings
- **Documentation:** All generated docs pass link checkers, code examples compile
- **Test coverage:** Test suite covers 80%+ of generated code paths
- **Extensibility:** New language support requires <500 LOC
- **Time-to-SDK:** <30 seconds from spec to deployable package
- **Developer experience:** SDK feels hand-crafted; no AI artifact odor

