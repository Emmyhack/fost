/**
 * OpenAPI 3.x Parser
 *
 * Deterministically converts OpenAPI/Swagger specs to NormalizedSpec.
 * No hallucination: explicit handling of missing/ambiguous data.
 */
import { InputSpec, ParserResult } from "../types";
import { BaseParser } from "../base-parser";
export declare class OpenAPIParser extends BaseParser {
    canParse(input: InputSpec): boolean;
    parse(input: InputSpec): ParserResult;
    private extractProductInfo;
    private extractTypes;
    private normalizeType;
    private extractOperations;
    private extractParameters;
    private extractResponse;
    private extractErrorCodes;
    private extractOperationAuth;
    private extractOperationExample;
    private extractErrors;
    private statusFromErrorCode;
    private extractAuthentication;
    private extractNetworks;
}
//# sourceMappingURL=openapi.d.ts.map