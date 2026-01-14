/**
 * Input Analysis Layer Types
 *
 * Intermediate representations between raw specs and canonical schema.
 * These are deterministically produced from raw inputs.
 */
export type InputSpecType = "openapi-3.0" | "openapi-3.1" | "swagger-2.0" | "contract-abi" | "chain-metadata" | "custom";
export interface InputSpec {
    type: InputSpecType;
    format: "json" | "yaml" | "raw-object";
    source: string;
    rawContent: any;
    metadata?: Record<string, any>;
}
/**
 * NormalizedSpec is produced by parsers and consumed by canonicalization layer.
 * It represents the "shape" of an API/contract in a common language.
 */
export interface NormalizedSpec {
    /** Metadata about the product */
    product: NormalizedProductInfo;
    /** Type definitions */
    types: Record<string, NormalizedType>;
    /** Operations/endpoints/methods */
    operations: NormalizedOperation[];
    /** Error definitions */
    errors: NormalizedError[];
    /** Authentication configuration */
    authentication: NormalizedAuth;
    /** Network/environment configuration */
    networks: NormalizedNetwork[];
    /** Input source information (for debugging/tracing) */
    source: InputSourceInfo;
    /** Warnings/notes from normalization process */
    normalizationNotes: NormalizationNote[];
}
export interface NormalizedProductInfo {
    name: string;
    version: string;
    apiVersion?: string;
    description: string;
    title?: string;
    contact?: {
        name?: string;
        email?: string;
        url?: string;
    };
    license?: {
        name: string;
        url?: string;
    };
    termsOfService?: string;
}
export interface NormalizedType {
    name: string;
    description: string;
    type: "object" | "array" | "enum" | "primitive" | "union" | "map";
    primitiveType?: string;
    nullable: boolean;
    fields?: Record<string, NormalizedField>;
    items?: {
        type: string;
        nullable: boolean;
    };
    enumValues?: string[];
    unionTypes?: string[];
    mapValueType?: string;
    example?: any;
    required?: string[];
    additionalProperties?: boolean;
}
export interface NormalizedField {
    name: string;
    type: string;
    description: string;
    required: boolean;
    nullable: boolean;
    example?: any;
    default?: any;
    enum?: any[];
    validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        minimum?: number;
        maximum?: number;
    };
}
export interface NormalizedOperation {
    id: string;
    name: string;
    description: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "function" | "event";
    path?: string;
    functionName?: string;
    parameters: NormalizedParameter[];
    requestBody?: {
        type: string;
        required: boolean;
        contentType?: string;
    };
    response: {
        type: string;
        statusCode?: number;
        contentType?: string;
    };
    errors: string[];
    authentication?: {
        required: boolean;
        type: string;
    };
    deprecated?: boolean;
    example?: {
        request?: any;
        response?: any;
    };
    tags?: string[];
    operationId?: string;
}
export interface NormalizedParameter {
    name: string;
    type: string;
    description: string;
    required: boolean;
    nullable: boolean;
    location: "path" | "query" | "header" | "body" | "input";
    default?: any;
    enum?: any[];
    example?: any;
    validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        minimum?: number;
        maximum?: number;
    };
}
export interface NormalizedError {
    code: string;
    httpStatus?: number;
    message: string;
    description?: string;
}
export interface NormalizedAuth {
    type: "none" | "api_key" | "bearer" | "oauth2" | "basic" | "custom";
    required: boolean;
    description?: string;
    details?: Record<string, any>;
}
export interface NormalizedNetwork {
    id: string;
    name: string;
    type: "rest" | "rpc" | "graphql" | "custom";
    url: string;
    chainId?: string;
    environment?: "production" | "staging" | "test";
}
export interface InputSourceInfo {
    inputType: InputSpecType;
    sourcePath: string;
    parsedAt: string;
    parser: string;
    version?: string;
}
export interface NormalizationNote {
    level: "info" | "warning" | "error";
    code: string;
    message: string;
    location?: string;
}
export interface ParserResult {
    success: boolean;
    normalized?: NormalizedSpec;
    errors: ParsingError[];
    warnings: NormalizationNote[];
}
export interface ParsingError {
    code: string;
    message: string;
    location?: string;
    context?: any;
}
export declare abstract class SpecParser {
    abstract parse(input: InputSpec): ParserResult;
    abstract canParse(input: InputSpec): boolean;
}
export interface NormalizedSmartContract {
    name: string;
    address?: string;
    abi: Record<string, NormalizedABIFunction | NormalizedABIEvent>;
    constructor?: {
        inputs: NormalizedParameter[];
    };
    networks?: Record<string, string>;
}
export interface NormalizedABIFunction {
    name: string;
    type: "function";
    stateMutability: "pure" | "view" | "nonpayable" | "payable";
    inputs: NormalizedParameter[];
    outputs?: Array<{
        name: string;
        type: string;
    }>;
    description?: string;
}
export interface NormalizedABIEvent {
    name: string;
    type: "event";
    inputs: Array<NormalizedParameter & {
        indexed: boolean;
    }>;
    description?: string;
}
export interface NormalizedChainMetadata {
    id: string;
    name: string;
    type: "evm" | "solana" | "cosmos" | "other";
    chainId: string;
    rpcEndpoints: string[];
    blockTime?: number;
    finality?: number;
    nativeToken?: string;
    explorer?: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    code: string;
    message: string;
    path: string;
    suggestion?: string;
}
export interface ValidationWarning {
    code: string;
    message: string;
    path: string;
    severity: "minor" | "major";
}
//# sourceMappingURL=types.d.ts.map