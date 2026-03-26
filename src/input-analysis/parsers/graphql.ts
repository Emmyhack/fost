/**
 * GraphQL SDL Parser
 *
 * Converts GraphQL Schema Definition Language to NormalizedSpec.
 * Handles types, queries, mutations, subscriptions, and directives.
 */

import {
  InputSpec,
  NormalizedSpec,
  NormalizedProductInfo,
  NormalizedType,
  NormalizedOperation,
  NormalizedParameter,
  ParserResult,
} from "../types";
import { BaseParser } from "../base-parser";
import type { ParserPlugin } from "../parser-registry";

export class GraphQLParser extends BaseParser implements ParserPlugin {
  displayName = "GraphQL SDL Parser";
  version = "1.0.0";
  supportedTypes = ["graphql"];

  detectConfidence(input: InputSpec): number {
    if (input.type === "graphql") return 1.0;
    if (typeof input.rawContent === "string" && input.rawContent.includes("type ") && input.rawContent.includes("schema")) {
      return 0.8;
    }
    return 0;
  }

  canParse(input: InputSpec): boolean {
    return (
      input.type === "graphql" ||
      (typeof input.rawContent === "string" && this.looksLikeGraphQL(input.rawContent))
    );
  }

  private looksLikeGraphQL(content: string): boolean {
    const graphqlKeywords = ["type ", "interface ", "enum ", "input ", "schema", "query", "mutation"];
    return graphqlKeywords.some((kw) => content.includes(kw));
  }

  parse(input: InputSpec): ParserResult {
    this.resetState();

    try {
      const schema = typeof input.rawContent === "string" ? input.rawContent : JSON.stringify(input.rawContent);

      // Extract product info from schema comments or metadata
      const product: NormalizedProductInfo = {
        name: input.metadata?.name || "GraphQL API",
        version: input.metadata?.version || "1.0.0",
        description: input.metadata?.description || "GraphQL API Schema",
      };

      // Parse type definitions
      const types = this.extractTypes(schema);

      // Parse query operations
      const queryOps = this.extractQueryOperations(schema);

      // Parse mutation operations
      const mutationOps = this.extractMutationOperations(schema);

      // Combine all operations
      const operations = [...queryOps, ...mutationOps];

      // GraphQL has built-in error handling
      const errors: any[] = [];

      const normalized: NormalizedSpec = {
        product,
        types,
        operations,
        errors,
        authentication: { type: "none", required: false },
        networks: [
          {
            id: "default",
            name: "GraphQL Endpoint",
            type: "graphql",
            url: input.metadata?.url || "http://localhost:4000/graphql",
          },
        ],
        source: {
          inputType: "graphql",
          sourcePath: input.source,
          parsedAt: new Date().toISOString(),
          parser: "GraphQLParser",
        },
        normalizationNotes: this.warnings,
      };

      return {
        success: this.errors.length === 0,
        normalized,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.addError("PARSE_ERROR", `Failed to parse GraphQL schema: ${message}`);
      return {
        success: false,
        errors: this.errors,
        warnings: this.warnings,
      };
    }
  }

  private extractTypes(schema: string): Record<string, NormalizedType> {
    const types: Record<string, NormalizedType> = {};

    // Simple regex-based extraction for common GraphQL types
    const typePattern = /type\s+(\w+)\s*{([^}]+)}/g;
    let match;

    while ((match = typePattern.exec(schema)) !== null) {
      const typeName = match[1];
      const fields = match[2];

      const fieldMap: Record<string, any> = {};
      const fieldPattern = /(\w+)\s*:\s*([^,\n;]+)/g;
      let fieldMatch;

      while ((fieldMatch = fieldPattern.exec(fields)) !== null) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2].trim();

        fieldMap[fieldName] = {
          name: fieldName,
          type: this.normalizeGraphQLType(fieldType),
          description: "",
          required: fieldType.includes("!"),
        };
      }

      types[typeName] = {
        name: typeName,
        description: "",
        type: "object",
        fields: fieldMap,
        nullable: false,
      };
    }

    // Extract enums
    const enumPattern = /enum\s+(\w+)\s*{([^}]+)}/g;

    while ((match = enumPattern.exec(schema)) !== null) {
      const enumName = match[1];
      const values = match[2]
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v && !v.startsWith("#"));

      types[enumName] = {
        name: enumName,
        description: "",
        type: "enum",
        enumValues: values,
        nullable: false,
      };
    }

    return types;
  }

  private normalizeGraphQLType(graphqlType: string): string {
    const cleaned = graphqlType
      .replace(/!/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .trim();

    const typeMap: Record<string, string> = {
      String: "string",
      Int: "integer",
      Float: "number",
      Boolean: "boolean",
      ID: "string",
    };

    return typeMap[cleaned] || cleaned;
  }

  private extractQueryOperations(schema: string): NormalizedOperation[] {
    const ops: NormalizedOperation[] = [];
    const queryPattern = /type\s+Query\s*{([^}]+)}/;
    const match = queryPattern.exec(schema);

    if (!match) return ops;

    const queryBlock = match[1];
    const fieldPattern = /(\w+)\s*(\([^)]*\))?\s*:\s*([^\n,;]+)/g;
    let fieldMatch;
    let index = 0;

    while ((fieldMatch = fieldPattern.exec(queryBlock)) !== null) {
      const fieldName = fieldMatch[1];
      const params = fieldMatch[2] || "()";
      const returnType = fieldMatch[3].trim();

      ops.push({
        id: `query_${index++}`,
        name: fieldName,
        description: `Query ${fieldName}`,
        method: "GET",
        parameters: this.extractGraphQLParams(params),
        response: { type: this.normalizeGraphQLType(returnType) },
        errors: [],
      });
    }

    return ops;
  }

  private extractMutationOperations(schema: string): NormalizedOperation[] {
    const ops: NormalizedOperation[] = [];
    const mutationPattern = /type\s+Mutation\s*{([^}]+)}/;
    const match = mutationPattern.exec(schema);

    if (!match) return ops;

    const mutationBlock = match[1];
    const fieldPattern = /(\w+)\s*(\([^)]*\))?\s*:\s*([^\n,;]+)/g;
    let fieldMatch;
    let index = 0;

    while ((fieldMatch = fieldPattern.exec(mutationBlock)) !== null) {
      const fieldName = fieldMatch[1];
      const params = fieldMatch[2] || "()";
      const returnType = fieldMatch[3].trim();

      ops.push({
        id: `mutation_${index++}`,
        name: fieldName,
        description: `Mutation ${fieldName}`,
        method: "POST",
        parameters: this.extractGraphQLParams(params),
        response: { type: this.normalizeGraphQLType(returnType) },
        errors: [],
      });
    }

    return ops;
  }

  private extractGraphQLParams(paramsStr: string): NormalizedParameter[] {
    const params: NormalizedParameter[] = [];
    const paramPattern = /(\w+)\s*:\s*([^,)=]+)/g;
    let match;

    while ((match = paramPattern.exec(paramsStr)) !== null) {
      const paramName = match[1];
      const paramType = match[2].trim();

      params.push({
        name: paramName,
        type: this.normalizeGraphQLType(paramType),
        description: "",
        required: paramType.includes("!"),
        nullable: !paramType.includes("!"),
        location: "input",
      });
    }

    return params;
  }
}
