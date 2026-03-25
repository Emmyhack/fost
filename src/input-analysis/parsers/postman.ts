/**
 * Postman Collection Parser
 *
 * Converts Postman Collection format to NormalizedSpec.
 * Handles v2.1 and earlier versions with request/response definitions.
 */

import {
  InputSpec,
  NormalizedSpec,
  NormalizedProductInfo,
  NormalizedType,
  NormalizedOperation,
  NormalizedParameter,
  NormalizedAuth,
  NormalizedNetwork,
  ParserResult,
} from "../types";
import { BaseParser } from "../base-parser";
import type { ParserPlugin } from "../parser-registry";

export class PostmanParser extends BaseParser implements ParserPlugin {
  displayName = "Postman Collection Parser";
  version = "1.0.0";
  supportedTypes = ["postman"];

  detectConfidence(input: InputSpec): number {
    if (input.type === "postman") return 1.0;
    if (
      input.format === "json" &&
      typeof input.rawContent === "object" &&
      input.rawContent &&
      (input.rawContent.info || input.rawContent.item)
    ) {
      const hasPostmanStructure = input.rawContent.info && input.rawContent.item;
      return hasPostmanStructure ? 0.9 : 0;
    }
    return 0;
  }

  canParse(input: InputSpec): boolean {
    if (input.type === "postman") return true;
    if (typeof input.rawContent !== "object" || !input.rawContent) return false;
    return !!(input.rawContent.info && input.rawContent.item);
  }

  parse(input: InputSpec): ParserResult {
    this.resetState();

    try {
      const collection = input.rawContent;

      if (!collection.info) {
        this.addError("MISSING_INFO", "Postman collection missing 'info' section");
        return { success: false, errors: this.errors, warnings: this.warnings };
      }

      // Extract product info
      const product: NormalizedProductInfo = {
        name: collection.info.name || "Postman API",
        version: collection.info.version || "1.0.0",
        description: collection.info.description || "",
      };

      // Extract types (from request/response body schemas)
      const types: Record<string, NormalizedType> = {};

      // Extract operations from collection items
      const operations = this.extractOperations(collection.item || [], types);

      // Extract authentication
      const authentication = this.extractAuthentication(collection.auth);

      // Extract networks (base URLs)
      const networks: NormalizedNetwork[] = [];
      if (collection.variable) {
        for (const variable of collection.variable) {
          if (variable.key === "base_url" || variable.key === "baseUrl") {
            networks.push({
              id: "default",
              name: "Base URL",
              type: "rest",
              url: variable.value || "",
            });
          }
        }
      }

      if (networks.length === 0) {
        networks.push({
          id: "default",
          name: "Postman Collection",
          type: "rest",
          url: "http://localhost:3000",
        });
      }

      const normalized: NormalizedSpec = {
        product,
        types,
        operations,
        errors: [],
        authentication,
        networks,
        source: {
          inputType: "postman",
          sourcePath: input.source,
          parsedAt: new Date().toISOString(),
          parser: "PostmanParser",
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
      this.addError("PARSE_ERROR", `Failed to parse Postman collection: ${message}`);
      return {
        success: false,
        errors: this.errors,
        warnings: this.warnings,
      };
    }
  }

  private extractOperations(
    items: any[],
    types: Record<string, any>,
    parentPath = ""
  ): NormalizedOperation[] {
    const operations: NormalizedOperation[] = [];
    let opIndex = 0;

    for (const item of items) {
      // Handle folder recursion
      if (item.item && Array.isArray(item.item)) {
        const nestedPath = parentPath + (item.name ? `/${item.name}` : "");
        operations.push(
          ...this.extractOperations(item.item, types, nestedPath)
        );
        continue;
      }

      // Handle individual requests
      if (item.request) {
        const request = item.request;
        const method = request.method || "GET";
        const url = typeof request.url === "string" ? request.url : request.url?.raw || "";

        operations.push({
          id: `request_${opIndex++}`,
          name: item.name || url,
          description: item.description || "",
          method: this.normalizeMethod(method),
          path: this.extractPath(url),
          parameters: this.extractParameters(request),
          requestBody: this.extractRequestBody(request),
          response: {
            type: "object",
            contentType: "application/json",
          },
          errors: [],
        });

        // Extract types from response examples
        if (item.response && Array.isArray(item.response)) {
          for (const resp of item.response) {
            if (resp.body) {
              try {
                const bodyJson = typeof resp.body === "string" ? JSON.parse(resp.body) : resp.body;
                this.extractTypesFromBody(bodyJson, types, item.name || "Response");
              } catch {
                // Skip if not valid JSON
              }
            }
          }
        }
      }
    }

    return operations;
  }

  private normalizeMethod(method: string): NormalizedOperation["method"] {
    const upper = method.toUpperCase();
    const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    return validMethods.includes(upper) ? (upper as any) : "GET";
  }

  private extractPath(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      // If not a valid URL, just return as-is
      return url.split("?")[0];
    }
  }

  private extractParameters(request: any): NormalizedParameter[] {
    const params: NormalizedParameter[] = [];

    // Query parameters
    if (request.url && typeof request.url === "object" && request.url.query) {
      for (const param of request.url.query) {
        params.push({
          name: param.key,
          type: "string",
          description: param.description || "",
          required: param.disabled !== true,
          nullable: false,
          location: "query",
          example: param.value,
        });
      }
    }

    // Header parameters
    if (request.header && Array.isArray(request.header)) {
      for (const header of request.header) {
        if (!header.disabled) {
          params.push({
            name: header.key,
            type: "string",
            description: header.description || "",
            required: false,
            nullable: true,
            location: "header",
            example: header.value,
          });
        }
      }
    }

    return params;
  }

  private extractRequestBody(request: any): any {
    if (!request.body) return undefined;

    let contentType = "application/json";
    if (request.header) {
      const contentTypeHeader = request.header.find((h: any) => h.key?.toLowerCase() === "content-type");
      if (contentTypeHeader) {
        contentType = contentTypeHeader.value;
      }
    }

    return {
      type: "object",
      required: true,
      contentType,
    };
  }

  private extractTypesFromBody(body: any, types: Record<string, any>, name: string): void {
    if (typeof body !== "object" || !body) return;

    const typeName = `${name}Type`;
    if (!types[typeName]) {
      const fields: Record<string, any> = {};
      for (const [key, value] of Object.entries(body)) {
        fields[key] = {
          name: key,
          type: typeof value,
          description: "",
          required: true,
        };
      }

      types[typeName] = {
        name: typeName,
        description: `Type from ${name}`,
        type: "object",
        fields,
        nullable: false,
      };
    }
  }

  private extractAuthentication(auth: any): NormalizedAuth {
    if (!auth) {
      return { type: "none", required: false };
    }

    if (typeof auth === "object") {
      if (auth.bearer) {
        return { type: "bearer", required: true, description: "Bearer token authentication" };
      }
      if (auth.basic) {
        return { type: "basic", required: true, description: "Basic authentication" };
      }
      if (auth.apikey) {
        return { type: "api_key", required: true, description: "API key authentication" };
      }
      if (auth.oauth2) {
        return { type: "oauth2", required: true, description: "OAuth2 authentication" };
      }
    }

    return { type: "none", required: false };
  }
}
