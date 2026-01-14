/**
 * Chain Metadata Parser (Web3)
 *
 * Converts blockchain network metadata into NormalizedSpec network configurations.
 * Used for configuring multi-chain SDK support.
 */
import { InputSpec, ParserResult, NormalizedChainMetadata } from "../types";
import { BaseParser } from "../base-parser";
export declare class ChainMetadataParser extends BaseParser {
    canParse(input: InputSpec): boolean;
    parse(input: InputSpec): ParserResult;
    private extractNetworks;
    private normalizeChain;
    private classifyEnvironment;
}
/**
 * Predefined metadata for common blockchains
 * Use these as templates when building multi-chain SDKs
 */
export declare const ETHEREUM_MAINNET: NormalizedChainMetadata;
export declare const ETHEREUM_SEPOLIA: NormalizedChainMetadata;
export declare const POLYGON_MAINNET: NormalizedChainMetadata;
export declare const ARBITRUM_ONE: NormalizedChainMetadata;
export declare const OPTIMISM_MAINNET: NormalizedChainMetadata;
export declare const SOLANA_MAINNET: NormalizedChainMetadata;
export declare const SOLANA_DEVNET: NormalizedChainMetadata;
export declare const PREDEFINED_CHAINS: Record<string, NormalizedChainMetadata>;
//# sourceMappingURL=chain-metadata.d.ts.map