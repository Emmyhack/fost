/**
 * Test Generation Module
 *
 * Exports all test generation capabilities:
 * - Unit test generation
 * - Integration test generation (MSW)
 * - Web3 contract test generation
 * - CI workflow generation
 * - Vitest configuration generation
 */

export {
  UnitTestGenerator,
  createUnitTestGenerator,
  type FunctionSignature,
  type ClassMetadata,
  type UnitTestSpec,
} from "./unit-test-generator";

export {
  IntegrationTestGenerator,
  createIntegrationTestGenerator,
  type ApiEndpoint,
  type MswHandlerSpec,
  type IntegrationTestSpec,
  type HttpMethod,
} from "./integration-test-generator";

export {
  Web3ContractTestGenerator,
  createWeb3TestGenerator,
  type SmartContractMetadata,
  type SolidityFunction,
  type ContractParam,
  type ContractEvent,
  type Web3Framework,
} from "./web3-test-generator";

export {
  CiWorkflowGenerator,
  createCiWorkflowGenerator,
  type GithubJob,
  type GithubWorkflow,
} from "./ci-workflow-generator";

export {
  VitestConfigGenerator,
  createVitestConfigGenerator,
  type VitestConfigSpec,
  type CoverageConfig,
  type ReporterConfig,
} from "./config-generator";
