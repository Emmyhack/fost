# Tooling Recommendations for SDK Validation and Testing

## Overview

This document provides tooling recommendations for implementing the validation and testing layer within the FOST SDK generation system.

## Validation Layer Tools

### Schema Validation

#### Primary Tool: JSON Schema Validator
- **Tool**: `ajv` (Another JSON Schema Validator)
- **Version**: ^8.12.0
- **Purpose**: Validate SDK schema against JSON Schema standards
- **Integration**:
  ```bash
  npm install ajv ajv-keywords
  ```
- **Usage**:
  ```typescript
  import Ajv from 'ajv';
  const ajv = new Ajv();
  const validate = ajv.compile(sdkDesignSchema);
  const valid = validate(sdkDesign);
  ```
- **Advantages**: Fast, comprehensive, well-maintained
- **Configuration**: Enable strict mode for type safety

#### Secondary Tool: TypeScript Compiler API
- **Tool**: `typescript`
- **Version**: ^5.0.0
- **Purpose**: Type checking and type inference validation
- **Integration**: Already in project (core dependency)
- **Usage**: Use `ts.typeChecker` to validate type consistency

### Linting Rules

#### Primary Tool: ESLint with Custom Rules
- **Tool**: `eslint`
- **Version**: ^8.0.0
- **Purpose**: Enforce consistent SDK code patterns
- **Plugins**:
  - `@typescript-eslint/eslint-plugin` (TypeScript support)
  - `eslint-plugin-jsdoc` (Documentation validation)
- **Custom Rules**:
  - `sdk-method-naming`: Enforce camelCase, max 50 chars
  - `sdk-parameter-ordering`: Required before optional
  - `sdk-documentation`: Minimum description length
  - `sdk-error-handling`: Error documentation requirement
  - `sdk-type-safety`: Type annotation requirement
  - `sdk-deprecation-notice`: Track deprecated methods

#### Alternative: Custom Linting Engine
- **Tool**: Internal LintingEngine (validation.ts)
- **Advantages**: SDK-specific, zero dependencies, fast
- **Configuration**: Via LintRule interface
- **Extensibility**: Plugin system for custom rules

### Hallucination Detection

#### Primary Approach: Pattern Matching
- **Tool**: Internal HallucinationDetector (validation.ts)
- **Methods**:
  1. Lexical Analysis (name patterns, descriptions)
  2. Structural Analysis (parameter consistency)
  3. Knowledge Base Lookup (endpoint validation)
  4. Semantic Analysis (description plausibility)

#### Optional Enhancement: Machine Learning
- **Tool**: `transformers.js` or `ollama`
- **Purpose**: Advanced semantic analysis
- **Trade-offs**: Performance vs. accuracy
- **Recommendation**: Start with pattern matching, add ML if needed

### Breaking Change Detection

#### Primary Tool: Diff Analysis
- **Tool**: Internal BreakingChangeDetector (validation.ts)
- **Methods**:
  1. Signature comparison
  2. Parameter analysis
  3. Type hierarchy checking
  4. Severity classification

#### Version Management
- **Tool**: `semver`
- **Version**: ^7.0.0
- **Purpose**: Version bump recommendations based on changes
- **Integration**:
  ```typescript
  import semver from 'semver';
  const newVersion = semver.inc(currentVersion, severity); // 'major', 'minor', 'patch'
  ```

## Testing Layer Tools

### Web2 Mock API Testing

#### Primary Tool: Mock Server Framework
- **Tool**: `msw` (Mock Service Worker)
- **Version**: ^2.0.0
- **Purpose**: Intercept and mock HTTP requests
- **Advantages**:
  - Works in browser and Node.js
  - Clean handler-based API
  - No server port conflicts
  - Per-request customization

- **Configuration**:
  ```typescript
  import { rest } from 'msw';
  import { setupServer } from 'msw/node';

  const server = setupServer(
    rest.get('/api/users/:username', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ username: req.params.username }));
    })
  );
  ```

#### Alternative: `nock` for HTTP Mocking
- **Tool**: `nock`
- **Version**: ^13.0.0
- **Advantages**: Simpler syntax, focused on HTTP interception
- **Disadvantages**: Node.js only, less flexible

#### Test Assertions
- **Tool**: `chai` or `jest`
- **Recommendation**: Use built-in jest assertions (if jest is primary)
- **Alternative**: `chai` for BDD-style assertions
  ```typescript
  expect(response).to.have.property('id');
  expect(response.status).to.equal(200);
  ```

#### Test Data Generation
- **Tool**: `faker` or `chance`
- **Version**: faker@8.0.0
- **Purpose**: Generate realistic test data
- **Usage**:
  ```typescript
  import { faker } from '@faker-js/faker';
  const user = {
    id: faker.number.int(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
  };
  ```

### Web3 Blockchain Testing

#### Primary Tool: Hardhat
- **Tool**: `hardhat`
- **Version**: ^2.19.0
- **Purpose**: Ethereum development environment
- **Features**:
  - Local blockchain (Hardhat Network)
  - Account management
  - Contract deployment and interaction
  - Console logging and debugging
- **Setup**:
  ```bash
  npm install --save-dev hardhat
  npx hardhat
  ```

#### Alternative: Ganache
- **Tool**: `ganache-cli` or `ganache`
- **Version**: ^7.0.0
- **Advantages**: Web3.js compatible, simple setup
- **Setup**:
  ```bash
  npm install --save-dev ganache
  ```

#### Web3 Interaction Library
- **Tool**: `ethers.js` or `web3.js`
- **Recommendation**: `ethers.js` for new projects
- **Version**: ethers@^6.0.0
- **Purpose**: Contract interaction, transaction simulation
- **Usage**:
  ```typescript
  import { ethers } from 'ethers';
  
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const signer = provider.getSigner(0);
  const contract = new ethers.Contract(address, abi, signer);
  const tx = await contract.swap(...args);
  ```

#### Contract Verification
- **Tool**: `hardhat-verify` or `@nomiclabs/hardhat-etherscan`
- **Purpose**: Verify contract behavior matches expectations
- **Configuration**: API keys for Etherscan integration

#### Gas Simulation
- **Tool**: Built-in Hardhat gas reporting
- **Configuration**: `hardhat-gas-reporter` plugin
- **Usage**:
  ```bash
  REPORT_GAS=true npx hardhat test
  ```

### Testing Frameworks

#### Primary: Jest
- **Tool**: `jest`
- **Version**: ^29.0.0
- **Advantages**:
  - Zero configuration for TypeScript with ts-jest
  - Parallel test execution
  - Built-in mocking and coverage
  - ESM and CommonJS support
- **Setup**:
  ```bash
  npm install --save-dev jest @types/jest ts-jest
  npx jest --init
  ```

#### Alternative: Vitest
- **Tool**: `vitest`
- **Version**: ^1.0.0
- **Advantages**: Faster, ESM first, Vite integration
- **When to use**: Vite-based projects

### Test Organization and Reporting

#### Test Runner: Custom Test Harness
- **Purpose**: Execute validation.ts and testing.ts classes
- **Input**: SDK design plan
- **Output**: Test report with pass/fail/warnings
- **Implementation**:
  ```typescript
  import { MockAPITester } from './testing';
  import { ValidationEngine } from './validation';

  async function runFullTestSuite(sdkPlan: SDKDesignPlan) {
    const validator = new ValidationEngine();
    const validation = validator.validate(sdkPlan);
    
    if (validation.hasErrors) {
      return { passed: false, errors: validation.errors };
    }

    const tester = new MockAPITester();
    const tests = tester.generateTestSuite(sdkPlan);
    return await runTests(tests);
  }
  ```

#### Report Generation
- **Tool**: Custom report generator or `allure-commandline`
- **Formats**: JSON, HTML, JUnit XML
- **Features**:
  - Test summary (passed/failed/skipped)
  - Coverage metrics
  - Execution timeline
  - Error details and stack traces

#### Coverage Reporting
- **Tool**: `c8` or jest built-in
- **Thresholds**:
  - Minimum: 80% statement coverage
  - Target: 90%+ line coverage
  - Critical paths: 100% coverage
- **Report formats**: LCOV, HTML, text

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: SDK Validation and Testing

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run validation
        run: npm run validate
      
      - name: Run tests
        run: npm run test
      
      - name: Check coverage
        run: npm run coverage
      
      - name: Report results
        if: always()
        uses: dorny/test-reporter@v1
        with:
          name: Test Results
          path: test-results.xml
          reporter: jest-junit
```

### GitLab CI Configuration
```yaml
validate-and-test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run validate
    - npm run test
    - npm run coverage
  artifacts:
    reports:
      junit: test-results.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

## Development Tools

### IDE Extensions

#### VS Code Extensions
1. **ESLint** (dbaeumer.vscode-eslint)
   - Real-time linting in editor
   - Quick fixes and refactoring

2. **Jest** (firsttris.vscode-jest-runner)
   - Run/debug tests directly from editor
   - Inline test results

3. **Thunder Client** (rangav.vscode-thunder-client)
   - Manual API testing alongside automated tests
   - Request/response inspection

4. **Hardhat Snippets** (NomicFoundation.hardhat-chai-matchers)
   - Web3 development support
   - Smart contract templates

### Command-line Tools

#### npm Scripts Configuration
```json
{
  "scripts": {
    "validate": "ts-node src/validation-cli.ts",
    "lint": "eslint src --ext .ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:web3": "hardhat test",
    "test:api": "jest --testPathPattern=api",
    "test:regression": "jest --testPathPattern=regression",
    "test:report": "jest --json --outputFile=test-results.json",
    "quality:check": "npm run validate && npm run lint && npm run test"
  }
}
```

#### Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run validate
RUN npm run test
RUN npm run coverage

CMD ["npm", "run", "test:report"]
```

## Quality Gates and Automation

### Pre-commit Hooks
- **Tool**: `husky` and `lint-staged`
- **Purpose**: Run validation before commits
- **Setup**:
  ```bash
  npm install husky lint-staged
  npx husky install
  ```

- **Configuration**:
  ```json
  {
    "lint-staged": {
      "src/**/*.ts": ["eslint --fix", "prettier --write"],
      "src/**/*.test.ts": ["jest --bail --findRelatedTests"]
    }
  }
  ```

### Automated Quality Checks
- **Tool**: `sonarqube` or `codecov`
- **Purpose**: Track quality metrics over time
- **Integration**: CI/CD pipeline integration
- **Metrics**:
  - Code coverage
  - Code complexity
  - Duplication
  - Security issues
  - Performance regressions

### Automatic Approval
- **Criteria**:
  1. All validation passes (zero errors)
  2. All tests pass (100%)
  3. Code coverage meets threshold (80%+)
  4. No hallucinations detected (confidence < 0.5)
  5. No breaking changes (or documented)
  6. No new security issues

- **Implementation**:
  ```typescript
  async function shouldAutoApprove(results: ValidationResults): Promise<boolean> {
    return (
      results.validation.errors.length === 0 &&
      results.tests.passed === results.tests.total &&
      results.coverage >= 80 &&
      results.hallucinations.every(h => h.confidence < 0.5) &&
      results.breakingChanges.filter(b => b.severity === 'CRITICAL').length === 0
    );
  }
  ```

## Performance Optimization

### Parallel Execution
- **Tests**: Run Web2 and Web3 tests in parallel
- **Validation**: Run schema, hallucination, linting concurrently
- **Configuration**:
  ```typescript
  const [validation, tests] = await Promise.all([
    runValidation(sdkPlan),
    runTests(sdkPlan),
  ]);
  ```

### Caching Strategies
- **npm**: `npm ci` with `.npm-cache` directory
- **Jest**: `--cache` for incremental testing
- **Validation**: Cache schema compilation results

### Timeout Management
- **API tests**: 30s timeout (with retry)
- **Web3 tests**: 60s timeout (account for block times)
- **Validation**: 5s timeout (schema validation)

## Troubleshooting Tools

### Debugging
- **Tool**: `debug` npm package
- **Usage**: `DEBUG=fost:* npm run test`
- **Output**: Detailed execution traces

### Performance Profiling
- **Tool**: Node.js built-in profiler
- **Usage**: `node --prof src/validation-cli.ts`
- **Analysis**: `node --prof-process isolate-*.log > profile.txt`

### Log Aggregation
- **Tool**: `winston` or `pino`
- **Purpose**: Structured logging for debugging
- **Levels**: debug, info, warn, error, critical

## Summary Matrix

| Category | Tool | Purpose | Priority |
|----------|------|---------|----------|
| Schema Validation | ajv | JSON Schema validation | High |
| Linting | ESLint + Custom | Code pattern enforcement | High |
| Hallucination | Internal ML/Pattern | Fake method detection | High |
| Breaking Changes | Internal Detector | Change severity analysis | High |
| Web2 Testing | MSW + Jest | Mock API testing | High |
| Web3 Testing | Hardhat + ethers.js | Blockchain simulation | High |
| Test Framework | Jest | Test execution | High |
| CI/CD | GitHub Actions | Automated validation | Medium |
| Reporting | Custom + Allure | Results visualization | Medium |
| Coverage | c8/Jest | Coverage tracking | Medium |
| Performance | Node profiler | Performance analysis | Low |
| Debugging | debug/Winston | Issue diagnosis | Low |

## Installation Script

```bash
#!/bin/bash

# Core validation and testing
npm install --save-dev ajv ajv-keywords typescript

# Linting
npm install --save-dev eslint @typescript-eslint/eslint-plugin eslint-plugin-jsdoc

# Web2 testing
npm install --save-dev msw jest ts-jest @types/jest faker

# Web3 testing
npm install --save-dev hardhat ethers

# Reporting and coverage
npm install --save-dev c8 jest-junit

# CI/CD and development
npm install --save-dev husky lint-staged debug

echo "All dependencies installed successfully!"
```

## Best Practices

1. **Test Coverage**: Aim for 90%+ coverage, focus on critical paths
2. **Mock Strategy**: Use MSW for Web2, Hardhat for Web3
3. **Error Messages**: Include context in assertions (expected vs. actual)
4. **Performance**: Keep unit tests < 100ms, integration tests < 1s
5. **Maintenance**: Review and update test cases with each SDK update
6. **Documentation**: Add comments explaining complex test logic
7. **Versioning**: Use semver for SDK versions based on breaking changes
8. **Regression**: Always add test for reported issues before fixing
