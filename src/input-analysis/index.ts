/**
 * Input Analysis Layer - Public API
 *
 * Export only what consumers need; hide implementation details.
 */

// Core types
export {
  InputSpec,
  InputSpecType,
  NormalizedSpec,
  NormalizedProductInfo,
  NormalizedType,
  NormalizedField,
  NormalizedOperation,
  NormalizedParameter,
  NormalizedError,
  NormalizedAuth,
  NormalizedNetwork,
  NormalizedSmartContract,
  NormalizedABIFunction,
  NormalizedABIEvent,
  ParsingError,
  ParserResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "./types";

// Main normalizer
export { InputNormalizer, normalizeInput, getNormalizer, type NormalizationResult } from "./normalizer";

// Parsers (for custom registration)
export { OpenAPIParser } from "./parsers/openapi";
export { ContractABIParser } from "./parsers/contract-abi";
export { ChainMetadataParser, PREDEFINED_CHAINS } from "./parsers/chain-metadata";

// Examples
export {
  EXAMPLE_OPENAPI_SPEC,
  EXAMPLE_CONTRACT_ABI,
  runExamples,
} from "./examples";
