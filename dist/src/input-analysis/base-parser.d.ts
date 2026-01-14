/**
 * Base Parser Class and Common Utilities
 *
 * All format-specific parsers extend BaseParser.
 * Deterministic parsing logic lives here.
 */
import { NormalizedSpec, NormalizedType, ParsingError, SpecParser, NormalizationNote } from "./types";
export declare abstract class BaseParser extends SpecParser {
    protected errors: ParsingError[];
    protected warnings: NormalizationNote[];
    protected addError(code: string, message: string, location?: string, context?: any): void;
    protected addWarning(level: "info" | "warning" | "error", code: string, message: string, location?: string): void;
    protected resetState(): void;
    /**
     * Resolve a type reference to ensure it exists
     * Returns the actual type name, or null if unresolvable
     */
    protected resolveTypeReference(typeRef: string, builtInTypes: Set<string>, definedTypes: Map<string, NormalizedType>): string | null;
    /**
     * Extract primitive type from various formats
     * "string", "String", "String!", etc. -> "string"
     */
    protected normalizePrimitiveType(type: string): string;
    /**
     * Check if a type looks like a reference to another type
     */
    protected isTypeReference(type: string): boolean;
    /**
     * Validate that all type references are resolvable
     * Returns list of unresolvable references
     */
    protected validateTypeReferences(spec: NormalizedSpec): {
        unresolvable: string[];
        circular: string[];
    };
}
/**
 * Extract required fields from a schema
 */
export declare function extractRequiredFields(schema: any): string[];
/**
 * Determine if a field is required based on schema and parent's required list
 */
export declare function isFieldRequired(fieldName: string, requiredList: string[], schema: any): boolean;
/**
 * Extract type from various schema formats
 */
export declare function extractType(schema: any): string;
/**
 * Extract example value from schema, with fallback
 */
export declare function extractExample(schema: any, type: string): any;
/**
 * Build a path string for error reporting
 */
export declare function buildPath(parts: (string | number)[]): string;
/**
 * Check if a status code indicates an error
 */
export declare function isErrorStatusCode(code: number | string): boolean;
/**
 * Normalize HTTP method to uppercase
 */
export declare function normalizeHttpMethod(method: string): "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "function" | "event" | null;
/**
 * Extract content type from Content-Type header or schema
 */
export declare function extractContentType(contentTypeHeader?: string, schema?: any): string;
/**
 * Safe JSON parse with error reporting
 */
export declare function safeJsonParse(content: string, location: string): {
    success: boolean;
    data?: any;
    error?: string;
};
/**
 * Flatten OpenAPI $ref paths
 * "#/components/schemas/User" -> "User"
 */
export declare function flattenRefPath(ref: string): string;
/**
 * Check if parameter is located in request body
 */
export declare function isBodyParameter(param: any): boolean;
/**
 * Classify HTTP parameter location
 */
export declare function classifyParameterLocation(param: any): "path" | "query" | "header" | "body";
//# sourceMappingURL=base-parser.d.ts.map