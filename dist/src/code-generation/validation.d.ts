/**
 * Validation and Testing Layer for Generated SDKs
 * Validates schema compliance, detects hallucinated methods, and tests SDK behavior
 * Catches breaking changes during regeneration
 */
import { SDKDesignPlan, SDKMethod } from "./types";
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    metadata: ValidationMetadata;
}
export interface ValidationError {
    code: string;
    message: string;
    severity: "critical" | "error";
    location?: string;
    suggestion?: string;
}
export interface ValidationWarning {
    code: string;
    message: string;
    severity: "warning" | "info";
    location?: string;
}
export interface ValidationMetadata {
    timestamp: string;
    duration: number;
    schemaVersion: string;
    validatorsRun: string[];
}
export interface SchemaComplianceReport {
    schemaValid: boolean;
    methodsCompliant: Map<string, MethodCompliance>;
    parametersValid: boolean;
    typesValid: boolean;
    errors: ValidationError[];
}
export interface MethodCompliance {
    name: string;
    valid: boolean;
    requiredFieldsPresent: boolean;
    parameterTypesValid: boolean;
    returnTypeValid: boolean;
    documentationComplete: boolean;
    issues: string[];
}
export interface HallucinationReport {
    hallucinated: boolean;
    detectedMethods: string[];
    suspiciousMethods: string[];
    confidence: Map<string, number>;
    analysis: string;
}
export interface LintingResult {
    passed: boolean;
    violations: LintViolation[];
    categoryBreakdown: Map<string, number>;
}
export interface LintViolation {
    rule: string;
    severity: "error" | "warning" | "info";
    message: string;
    location: string;
    autoFixable: boolean;
    suggestion?: string;
}
export interface TestResult {
    passed: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    testCases: TestCase[];
    coverage: {
        methods: number;
        parameters: number;
        errorCases: number;
    };
}
export interface TestCase {
    name: string;
    passed: boolean;
    duration: number;
    error?: string;
    output?: unknown;
}
export interface BreakingChangeReport {
    breaking: boolean;
    changedMethods: MethodChange[];
    removedMethods: string[];
    modifiedParameters: ParameterChange[];
    deprecatedFeatures: string[];
    severity: "critical" | "major" | "minor" | "patch";
}
export interface MethodChange {
    name: string;
    type: "modified" | "removed" | "signature_changed";
    previousSignature?: string;
    newSignature?: string;
    impact: "high" | "medium" | "low";
}
export interface ParameterChange {
    methodName: string;
    parameterName: string;
    change: "removed" | "type_changed" | "made_required";
    oldType?: string;
    newType?: string;
    impact: "breaking" | "non_breaking";
}
export interface MockAPIConfig {
    baseURL: string;
    methods: Map<string, MockMethodConfig>;
    responseDelay: number;
    errorSimulation: boolean;
}
export interface MockMethodConfig {
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    requestSchema: unknown;
    responseSchema: unknown;
    errorCases: MockErrorCase[];
}
export interface MockErrorCase {
    statusCode: number;
    errorCode: string;
    message: string;
    probability: number;
}
export interface Web3SimulatorConfig {
    chainId: number;
    rpcUrl: string;
    contractAddress: string;
    methods: Map<string, Web3MethodConfig>;
    gasEstimates: Map<string, number>;
}
export interface Web3MethodConfig {
    signature: string;
    inputs: Web3Input[];
    outputs: Web3Output[];
    isPayable: boolean;
    isReadOnly: boolean;
    gasEstimate: number;
}
export interface Web3Input {
    name: string;
    type: string;
    indexed?: boolean;
}
export interface Web3Output {
    name: string;
    type: string;
}
declare class SchemaValidator {
    private designPlan;
    private methods;
    constructor(designPlan: SDKDesignPlan, methods: SDKMethod[]);
    validate(): SchemaComplianceReport;
    private validateMethod;
    private validateParameterTypes;
    private validateParameters;
    private validateTypes;
    private isValidType;
    private isObjectType;
}
declare class HallucinationDetector {
    private designPlan;
    private methods;
    private knownPatterns;
    constructor(designPlan: SDKDesignPlan, methods: SDKMethod[]);
    detect(): HallucinationReport;
    private calculateHallucinationScore;
    private hasUnrealisticName;
    private hasSuspiciousDescription;
    private hasInconsistentParameters;
    private isNonExistentEndpoint;
    private initializePatterns;
    private generateAnalysis;
}
declare class LintingEngine {
    private methods;
    private rules;
    constructor(methods: SDKMethod[]);
    lint(): LintingResult;
    private initializeRules;
}
declare class BreakingChangeDetector {
    private previousMethods;
    private currentMethods;
    constructor(previousMethods: SDKMethod[], currentMethods: SDKMethod[]);
    detect(): BreakingChangeReport;
    private methodSignatureChanged;
    private detectParameterChanges;
    private getSignature;
    private calculateSeverity;
}
export { SchemaValidator, HallucinationDetector, LintingEngine, BreakingChangeDetector, };
//# sourceMappingURL=validation.d.ts.map