export interface ValidationError {
    type: 'SCHEMA' | 'SYNTAX' | 'SEMANTIC' | 'CONSISTENCY';
    message: string;
    path?: string;
    suggestion?: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    output?: any;
    confidence: number;
}
/**
 * Output Validator - Multi-layer validation
 * 1. Schema validation (structure)
 * 2. Syntax validation (correctness)
 * 3. Semantic validation (meaning)
 * 4. Consistency validation (alignment with context)
 */
export declare class OutputValidator {
    /**
     * Validate output against schema
     */
    validate(output: any, schema: any): ValidationResult;
    /**
     * Validate against JSON Schema
     */
    private validateSchema;
    /**
     * Validate individual property
     */
    private validateProperty;
    /**
     * Check if actual type matches expected type
     */
    private typeMatches;
    /**
     * Semantic validation - Check for obvious errors
     */
    private validateSemantic;
    /**
     * Check for hallucinations - properties not in source
     */
    detectHallucinations(output: any, sourceSchema: any): string[];
    /**
     * Calculate output quality score
     */
    scoreOutput(result: ValidationResult): number;
}
/**
 * Specialized validators for specific output types
 */
export declare class TypeScriptValidator {
    /**
     * Validate TypeScript interface definition
     */
    static validateInterface(code: string): ValidationError[];
    /**
     * Validate TypeScript method signature
     */
    static validateMethod(code: string): ValidationError[];
}
export declare class JSONValidator {
    /**
     * Validate JSON structure
     */
    static validateJSON(text: string): ValidationError[];
}
//# sourceMappingURL=output-validator.d.ts.map