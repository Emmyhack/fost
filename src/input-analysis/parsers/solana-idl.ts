/**
 * Solana IDL Parser
 *
 * Converts Solana IDL (Interface Definition Language) to NormalizedSpec.
 * Handles Anchor program definitions with instructions, accounts, and events.
 */

import {
  InputSpec,
  NormalizedSpec,
  NormalizedProductInfo,
  NormalizedType,
  NormalizedOperation,
  NormalizedParameter,
  NormalizedNetwork,
  ParserResult,
} from "../types";
import { BaseParser } from "../base-parser";
import type { ParserPlugin } from "../parser-registry";

export class SolanaIDLParser extends BaseParser implements ParserPlugin {
  displayName = "Solana IDL Parser";
  version = "1.0.0";
  supportedTypes = ["solana-idl"];

  detectConfidence(input: InputSpec): number {
    if (input.type === "solana-idl") return 1.0;
    if (
      typeof input.rawContent === "object" &&
      input.rawContent &&
      (input.rawContent.version || input.rawContent.instructions)
    ) {
      return input.rawContent.programs ? 0.95 : 0.7;
    }
    return 0;
  }

  canParse(input: InputSpec): boolean {
    if (input.type === "solana-idl") return true;
    if (typeof input.rawContent !== "object" || !input.rawContent) return false;
    // Solana IDL typically has version, instructions, and/or accounts
    return !!(input.rawContent.version || input.rawContent.instructions || input.rawContent.accounts);
  }

  parse(input: InputSpec): ParserResult {
    this.resetState();

    try {
      const idl = input.rawContent;

      if (!idl.name) {
        this.addError("MISSING_NAME", "Solana IDL missing program 'name'");
        return { success: false, errors: this.errors, warnings: this.warnings };
      }

      // Extract product info
      const product: NormalizedProductInfo = {
        name: idl.name,
        version: idl.version || "1.0.0",
        description: idl.docs || `Solana program: ${idl.name}`,
      };

      // Extract types from types and accounts
      const types = this.extractTypes(idl);

      // Extract operations from instructions
      const operations = this.extractOperations(idl.instructions || [], types);

      // Extract networks (Solana networks)
      const networks = this.extractNetworks(idl);

      const normalized: NormalizedSpec = {
        product,
        types,
        operations,
        errors: [],
        authentication: { type: "none", required: false },
        networks,
        source: {
          inputType: "solana-idl",
          sourcePath: input.source,
          parsedAt: new Date().toISOString(),
          parser: "SolanaIDLParser",
          version: idl.version,
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
      this.addError("PARSE_ERROR", `Failed to parse Solana IDL: ${message}`);
      return {
        success: false,
        errors: this.errors,
        warnings: this.warnings,
      };
    }
  }

  private extractTypes(idl: any): Record<string, NormalizedType> {
    const types: Record<string, NormalizedType> = {};

    // Extract from types array
    if (idl.types && Array.isArray(idl.types)) {
      for (const type of idl.types) {
        if (type.name) {
          types[type.name] = {
            name: type.name,
            description: "",
            type: this.classifyType(type),
            fields: this.extractTypeFields(type),
            nullable: false,
            enumValues: type.type === "enum" ? type.variants?.map((v: any) => v.name) : undefined,
          };
        }
      }
    }

    // Extract from accounts
    if (idl.accounts && Array.isArray(idl.accounts)) {
      for (const account of idl.accounts) {
        if (account.name) {
          types[account.name] = {
            name: account.name,
            description: account.docs?.join(" ") || "",
            type: "object",
            fields: this.extractAccountFields(account),
            nullable: false,
          };
        }
      }
    }

    return types;
  }

  private classifyType(type: any): NormalizedType["type"] {
    if (type.type === "enum") return "enum";
    if (type.type === "struct") return "object";
    return "object";
  }

  private extractTypeFields(type: any): Record<string, any> | undefined {
    if (!type.fields) return undefined;

    const fields: Record<string, any> = {};
    for (const field of type.fields) {
      fields[field.name] = {
        name: field.name,
        type: this.normalizeSolanaType(field.type),
        description: field.docs?.join(" ") || "",
        required: true,
      };
    }

    return fields;
  }

  private extractAccountFields(account: any): Record<string, any> | undefined {
    if (!account.fields) return undefined;

    const fields: Record<string, any> = {};
    for (const field of account.fields) {
      fields[field.name] = {
        name: field.name,
        type: this.normalizeSolanaType(field.type),
        description: field.docs?.join(" ") || "",
        required: true,
      };
    }

    return fields;
  }

  private normalizeSolanaType(type: any): string {
    if (typeof type === "string") {
      const typeMap: Record<string, string> = {
        u8: "integer",
        u16: "integer",
        u32: "integer",
        u64: "bigint",
        u128: "bigint",
        i8: "integer",
        i16: "integer",
        i32: "integer",
        i64: "bigint",
        i128: "bigint",
        f32: "number",
        f64: "number",
        bool: "boolean",
        bytes: "bytes",
        pubkey: "string",
        string: "string",
        vec: "array",
        option: "object",
      };

      return typeMap[type.toLowerCase()] || type;
    }

    if (typeof type === "object") {
      if (type.vec) {
        return "array";
      }
      if (type.option) {
        return this.normalizeSolanaType(type.option);
      }
      if (type.defined) {
        return type.defined;
      }
    }

    return "any";
  }

  private extractOperations(instructions: any[], types: Record<string, any>): NormalizedOperation[] {
    const operations: NormalizedOperation[] = [];

    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];

      operations.push({
        id: `solana_${i}`,
        name: instruction.name,
        description: instruction.docs?.join(" ") || "",
        method: "function",
        functionName: instruction.name,
        parameters: this.extractInstructionParams(instruction),
        response: { type: "object" },
        errors: [],
      });
    }

    return operations;
  }

  private extractInstructionParams(instruction: any): NormalizedParameter[] {
    const params: NormalizedParameter[] = [];

    // Add accounts as parameters
    if (instruction.accounts && Array.isArray(instruction.accounts)) {
      for (const account of instruction.accounts) {
        params.push({
          name: account.name,
          type: "string", // pubkey type
          description: account.docs?.join(" ") || "",
          required: !account.optional,
          nullable: account.optional ?? false,
          location: "input",
        });
      }
    }

    // Add instruction arguments
    if (instruction.args && Array.isArray(instruction.args)) {
      for (const arg of instruction.args) {
        params.push({
          name: arg.name,
          type: this.normalizeSolanaType(arg.type),
          description: arg.docs?.join(" ") || "",
          required: true,
          nullable: false,
          location: "input",
        });
      }
    }

    return params;
  }

  private extractABI(instructions: any[]): Record<string, any> {
    const abi: Record<string, any> = {};

    for (const instruction of instructions) {
      abi[instruction.name] = {
        name: instruction.name,
        type: "function",
        inputs: this.extractInstructionParams(instruction),
        outputs: undefined,
        description: instruction.docs?.join(" ") || "",
      };
    }

    return abi;
  }

  private extractNetworks(idl: any): any[] {
    const networks: any[] = [
      { id: "mainnet", name: "Solana Mainnet", type: "rpc" as const, url: "https://api.mainnet-beta.solana.com" },
      { id: "devnet", name: "Solana Devnet", type: "rpc" as const, url: "https://api.devnet.solana.com" },
      { id: "testnet", name: "Solana Testnet", type: "rpc" as const, url: "https://api.testnet.solana.com" },
    ];

    // Add metadata if present
    if (idl.metadata && idl.metadata.address) {
      networks[0] = { ...networks[0], chainId: idl.metadata.address };
    }

    return networks;
  }
}
