/**
 * RUST SDK CODE EMITTER
 *
 * Generates idiomatic Rust code from SDK specifications.
 * Uses snake_case for methods, PascalCase for types, and async/await.
 */

import * as AST from "../types";

/**
 * Simple Rust code emitter
 */
export class RustEmitter {
  /**
   * Emit a complete Rust program (crate root)
   */
  emitProgram(program: AST.ASTProgram): string {
    const lines: string[] = [];

    // Add crate header
    lines.push("//! Generated Rust SDK");
    lines.push("");
    lines.push("use serde::{Deserialize, Serialize};");
    lines.push("use async_trait::async_trait;");
    lines.push("");

    // Emit statements
    program.body.forEach((stmt) => {
      lines.push(...this.emitStatement(stmt));
      lines.push("");
    });

    return lines.join("\n");
  }

  /**
   * Emit a single statement
   */
  private emitStatement(stmt: AST.ASTStatement): string[] {
    switch (stmt.type) {
      case "ClassDeclaration":
        return this.emitStruct(stmt as AST.ASTClassDeclaration);
      case "InterfaceDeclaration":
        return this.emitTrait(stmt as AST.ASTInterfaceDeclaration);
      case "EnumDeclaration":
        return this.emitEnum(stmt as AST.ASTEnumDeclaration);
      case "FunctionDeclaration":
        return this.emitFunction(stmt as AST.ASTFunctionDeclaration);
      default:
        return [`// Unsupported statement: ${stmt.type}`];
    }
  }

  /**
   * Emit a Rust struct
   */
  private emitStruct(cls: AST.ASTClassDeclaration): string[] {
    const lines: string[] = [];
    const structName = this.toPascalCase(cls.name);

    lines.push(`#[derive(Debug, Clone, Serialize, Deserialize)]`);
    lines.push(`pub struct ${structName} {`);

    if (cls.properties && cls.properties.length > 0) {
      cls.properties.forEach((prop) => {
        const fieldName = this.toSnakeCase(prop.name);
        const rustType = this.rustType(prop.valueType);
        lines.push(`    pub ${fieldName}: ${rustType},`);
      });
    }

    lines.push("}");
    lines.push("");

    // Implementation block for methods
    if (cls.methods && cls.methods.length > 0) {
      lines.push(`impl ${structName} {`);

      cls.methods.forEach((method) => {
        const methodLines = this.emitMethod(method);
        lines.push(...methodLines.map((line) => `    ${line}`));
      });

      lines.push("}");
    }

    return lines;
  }

  /**
   * Emit a Rust method
   */
  private emitMethod(method: AST.ASTMethodDeclaration): string[] {
    const lines: string[] = [];
    const methodName = this.toSnakeCase(method.name);
    const async = method.isAsync ? "async " : "";
    const params = (method.parameters || [])
      .map((p) => `${this.toSnakeCase(p.name)}: ${this.rustType(p.parameterType)}`)
      .join(", ");
    const returnType = method.returnType ? ` -> ${this.rustType(method.returnType)}` : " -> ()";

    lines.push(`pub ${async}fn ${methodName}(&self, ${params})${returnType} {`);
    lines.push("    // TODO: implement");
    lines.push("}");

    return lines;
  }

  /**
   * Emit a Rust trait (equivalent to interface)
   */
  private emitTrait(iface: AST.ASTInterfaceDeclaration): string[] {
    const lines: string[] = [];
    const traitName = this.toPascalCase(iface.name);

    lines.push(`#[async_trait]`);
    lines.push(`pub trait ${traitName} {`);

    if (iface.properties && iface.properties.length > 0) {
      iface.properties.forEach((prop) => {
        const methodName = this.toSnakeCase(prop.name);
        const returnType = this.rustType(prop.valueType);
        lines.push(`    async fn ${methodName}(&self) -> ${returnType};`);
      });
    }

    lines.push("}");

    return lines;
  }

  /**
   * Emit a Rust enum
   */
  private emitEnum(enumDecl: AST.ASTEnumDeclaration): string[] {
    const lines: string[] = [];
    const enumName = this.toPascalCase(enumDecl.name);

    lines.push(`#[derive(Debug, Clone, Serialize, Deserialize)]`);
    lines.push(`pub enum ${enumName} {`);

    enumDecl.members.forEach((member) => {
      lines.push(`    ${this.toPascalCase(member.name)},`);
    });

    lines.push("}");

    return lines;
  }

  /**
   * Emit a Rust function
   */
  private emitFunction(func: AST.ASTFunctionDeclaration): string[] {
    const lines: string[] = [];
    const funcName = this.toSnakeCase(func.name);
    const async = func.isAsync ? "async " : "";
    const params = (func.parameters || [])
      .map((p) => `${this.toSnakeCase(p.name)}: ${this.rustType(p.parameterType)}`)
      .join(", ");
    const returnType = func.returnType ? ` -> ${this.rustType(func.returnType)}` : " -> ()";

    lines.push(`pub ${async}fn ${funcName}(${params})${returnType} {`);
    lines.push("    // TODO: implement");
    lines.push("}");

    return lines;
  }

  // ============ Helper Methods ============

  /**
   * Convert to PascalCase
   */
  private toPascalCase(name: string): string {
    // If already PascalCase, return as-is
    if (name[0] === name[0].toUpperCase() && !name.includes("_")) {
      return name;
    }
    // Otherwise convert from snake_case
    return name
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  /**
   * Convert to snake_case
   */
  private toSnakeCase(name: string): string {
    // If already snake_case, return as-is
    if (name === name.toLowerCase()) {
      return name;
    }
    // Convert from PascalCase/camelCase
    return name
      .replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
      .replace(/^_/, "");
  }

  /**
   * Map TypeScript types to Rust types
   */
  private rustType(tsType: string | undefined): string {
    if (!tsType) return "()";

    const typeMap: Record<string, string> = {
      string: "String",
      number: "f64",
      integer: "i32",
      boolean: "bool",
      any: "serde_json::Value",
      unknown: "serde_json::Value",
      void: "()",
      null: "()",
      undefined: "Option<()>",
      object: "serde_json::json!({})",
      array: "Vec<serde_json::Value>",
      Promise: "tokio::sync::mpsc::Receiver",
    };

    return typeMap[tsType] || tsType;
  }
}
