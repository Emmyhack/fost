"use strict";
/**
 * Chain Metadata Parser (Web3)
 *
 * Converts blockchain network metadata into NormalizedSpec network configurations.
 * Used for configuring multi-chain SDK support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREDEFINED_CHAINS = exports.SOLANA_DEVNET = exports.SOLANA_MAINNET = exports.OPTIMISM_MAINNET = exports.ARBITRUM_ONE = exports.POLYGON_MAINNET = exports.ETHEREUM_SEPOLIA = exports.ETHEREUM_MAINNET = exports.ChainMetadataParser = void 0;
const base_parser_1 = require("../base-parser");
class ChainMetadataParser extends base_parser_1.BaseParser {
    canParse(input) {
        return input.type === "chain-metadata";
    }
    parse(input) {
        this.resetState();
        try {
            const metadata = input.rawContent;
            // Validate structure
            if (typeof metadata !== "object" || !metadata) {
                this.addError("INVALID_METADATA", "Chain metadata must be a JSON object");
                return { success: false, errors: this.errors, warnings: this.warnings };
            }
            // Extract network configurations
            const networks = this.extractNetworks(metadata);
            if (networks.length === 0) {
                this.addError("NO_NETWORKS", "No valid networks found in chain metadata");
                return { success: false, errors: this.errors, warnings: this.warnings };
            }
            // Build a minimal NormalizedSpec for chains
            const normalized = {
                product: {
                    name: "chain-metadata",
                    version: "1.0.0",
                    apiVersion: "1.0",
                    description: "Blockchain network metadata",
                },
                types: {},
                operations: [],
                errors: [],
                authentication: { type: "none", required: false },
                networks,
                source: {
                    inputType: input.type,
                    sourcePath: input.source,
                    parsedAt: new Date().toISOString(),
                    parser: "ChainMetadataParser",
                },
                normalizationNotes: this.warnings,
            };
            return {
                success: this.errors.length === 0,
                normalized,
                errors: this.errors,
                warnings: this.warnings,
            };
        }
        catch (e) {
            this.addError("PARSE_EXCEPTION", `Unexpected error: ${e.message}`);
            return { success: false, errors: this.errors, warnings: this.warnings };
        }
    }
    extractNetworks(metadata) {
        const networks = [];
        // Handle both single chain and multiple chains
        const chains = Array.isArray(metadata.chains)
            ? metadata.chains
            : metadata.chain
                ? [metadata.chain]
                : [];
        if (chains.length === 0 && metadata.chainId) {
            // Single chain as object
            chains.push(metadata);
        }
        chains.forEach((chain, idx) => {
            if (!chain || typeof chain !== "object") {
                this.addWarning("warning", "INVALID_CHAIN", `Chain at index ${idx} is invalid`);
                return;
            }
            const network = this.normalizeChain(chain);
            if (network) {
                networks.push(network);
            }
        });
        return networks;
    }
    normalizeChain(chain) {
        // Validate required fields
        if (!chain.id && !chain.chainId) {
            this.addWarning("warning", "MISSING_CHAIN_ID", "Chain missing id or chainId");
            return null;
        }
        if (!chain.rpcEndpoints && !chain.rpcUrl && !chain.endpoint) {
            this.addWarning("warning", "MISSING_RPC", `Chain ${chain.id || chain.chainId} missing RPC endpoint`);
            return null;
        }
        const id = chain.id || chain.chainId?.toString();
        const name = chain.name || `Chain ${id}`;
        const rpcUrl = Array.isArray(chain.rpcEndpoints)
            ? chain.rpcEndpoints[0]
            : chain.rpcUrl || chain.endpoint;
        const network = {
            id: id.toString().toLowerCase(),
            name,
            type: "rpc",
            url: rpcUrl,
            chainId: chain.chainId ? chain.chainId.toString() : id.toString(),
            environment: this.classifyEnvironment(name, chain.environment),
        };
        return network;
    }
    classifyEnvironment(name, explicit) {
        if (explicit) {
            const lower = explicit.toLowerCase();
            if (lower.includes("test"))
                return "test";
            if (lower.includes("staging") || lower.includes("stage"))
                return "staging";
            return "production";
        }
        const lower = name.toLowerCase();
        if (lower.includes("testnet") || lower.includes("test") || lower.includes("sepolia") || lower.includes("goerli")) {
            return "test";
        }
        if (lower.includes("staging")) {
            return "staging";
        }
        return "production";
    }
}
exports.ChainMetadataParser = ChainMetadataParser;
// ============================================================================
// PREDEFINED CHAIN CONFIGURATIONS
// ============================================================================
/**
 * Predefined metadata for common blockchains
 * Use these as templates when building multi-chain SDKs
 */
exports.ETHEREUM_MAINNET = {
    id: "ethereum",
    name: "Ethereum Mainnet",
    type: "evm",
    chainId: "1",
    rpcEndpoints: ["https://eth.llamarpc.com", "https://eth-mainnet.alchemyapi.io/v2"],
    blockTime: 12000,
    finality: 15,
    nativeToken: "ETH",
    explorer: "https://etherscan.io",
};
exports.ETHEREUM_SEPOLIA = {
    id: "ethereum-sepolia",
    name: "Ethereum Sepolia Testnet",
    type: "evm",
    chainId: "11155111",
    rpcEndpoints: ["https://sepolia.infura.io/v3"],
    blockTime: 12000,
    finality: 15,
    nativeToken: "ETH",
    explorer: "https://sepolia.etherscan.io",
};
exports.POLYGON_MAINNET = {
    id: "polygon",
    name: "Polygon Mainnet",
    type: "evm",
    chainId: "137",
    rpcEndpoints: ["https://polygon.llamarpc.com", "https://polygon-rpc.com"],
    blockTime: 2000,
    finality: 256,
    nativeToken: "MATIC",
    explorer: "https://polygonscan.com",
};
exports.ARBITRUM_ONE = {
    id: "arbitrum",
    name: "Arbitrum One",
    type: "evm",
    chainId: "42161",
    rpcEndpoints: ["https://arb1.arbitrum.io/rpc"],
    blockTime: 250,
    finality: 1,
    nativeToken: "ARB",
    explorer: "https://arbiscan.io",
};
exports.OPTIMISM_MAINNET = {
    id: "optimism",
    name: "Optimism Mainnet",
    type: "evm",
    chainId: "10",
    rpcEndpoints: ["https://mainnet.optimism.io"],
    blockTime: 2000,
    finality: 1,
    nativeToken: "OP",
    explorer: "https://optimistic.etherscan.io",
};
exports.SOLANA_MAINNET = {
    id: "solana",
    name: "Solana Mainnet",
    type: "solana",
    chainId: "5eykt4UsFv2P6ysrq7IvVTgs5kfrqQ",
    rpcEndpoints: ["https://api.mainnet-beta.solana.com", "https://solana.llamarpc.com"],
    blockTime: 400,
    finality: 32,
    nativeToken: "SOL",
    explorer: "https://solscan.io",
};
exports.SOLANA_DEVNET = {
    id: "solana-devnet",
    name: "Solana Devnet",
    type: "solana",
    chainId: "EtWTRABZaoDmUwtDrhAvbtFroJAzsCvVf5KoNGRNvQ",
    rpcEndpoints: ["https://api.devnet.solana.com"],
    blockTime: 400,
    finality: 32,
    nativeToken: "SOL",
    explorer: "https://solscan.io/?cluster=devnet",
};
exports.PREDEFINED_CHAINS = {
    "ethereum": exports.ETHEREUM_MAINNET,
    "ethereum-sepolia": exports.ETHEREUM_SEPOLIA,
    "polygon": exports.POLYGON_MAINNET,
    "arbitrum": exports.ARBITRUM_ONE,
    "optimism": exports.OPTIMISM_MAINNET,
    "solana": exports.SOLANA_MAINNET,
    "solana-devnet": exports.SOLANA_DEVNET,
};
//# sourceMappingURL=chain-metadata.js.map