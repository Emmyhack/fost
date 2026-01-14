"use strict";
/**
 * Input Analysis Layer - Public API
 *
 * Export only what consumers need; hide implementation details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runExamples = exports.EXAMPLE_CONTRACT_ABI = exports.EXAMPLE_OPENAPI_SPEC = exports.PREDEFINED_CHAINS = exports.ChainMetadataParser = exports.ContractABIParser = exports.OpenAPIParser = exports.getNormalizer = exports.normalizeInput = exports.InputNormalizer = void 0;
// Main normalizer
var normalizer_1 = require("./normalizer");
Object.defineProperty(exports, "InputNormalizer", { enumerable: true, get: function () { return normalizer_1.InputNormalizer; } });
Object.defineProperty(exports, "normalizeInput", { enumerable: true, get: function () { return normalizer_1.normalizeInput; } });
Object.defineProperty(exports, "getNormalizer", { enumerable: true, get: function () { return normalizer_1.getNormalizer; } });
// Parsers (for custom registration)
var openapi_1 = require("./parsers/openapi");
Object.defineProperty(exports, "OpenAPIParser", { enumerable: true, get: function () { return openapi_1.OpenAPIParser; } });
var contract_abi_1 = require("./parsers/contract-abi");
Object.defineProperty(exports, "ContractABIParser", { enumerable: true, get: function () { return contract_abi_1.ContractABIParser; } });
var chain_metadata_1 = require("./parsers/chain-metadata");
Object.defineProperty(exports, "ChainMetadataParser", { enumerable: true, get: function () { return chain_metadata_1.ChainMetadataParser; } });
Object.defineProperty(exports, "PREDEFINED_CHAINS", { enumerable: true, get: function () { return chain_metadata_1.PREDEFINED_CHAINS; } });
// Examples
var examples_1 = require("./examples");
Object.defineProperty(exports, "EXAMPLE_OPENAPI_SPEC", { enumerable: true, get: function () { return examples_1.EXAMPLE_OPENAPI_SPEC; } });
Object.defineProperty(exports, "EXAMPLE_CONTRACT_ABI", { enumerable: true, get: function () { return examples_1.EXAMPLE_CONTRACT_ABI; } });
Object.defineProperty(exports, "runExamples", { enumerable: true, get: function () { return examples_1.runExamples; } });
//# sourceMappingURL=index.js.map