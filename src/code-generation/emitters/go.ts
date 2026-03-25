/**
 * GO SDK CODE EMITTER
 *
 * Generates idiomatic Go code from SDK specifications.
 * Uses CamelCase for exports, idiomatic error handling, and Go modules.
 */

import * as AST from "../types";

/**
 * Simple Go code emitter
 */
export class GoEmitter {
  /**
   * Emit a complete Go program
   */
  emitProgram(program: AST.ASTProgram): string {
    const lines: string[] = [];

    // Add package header
    lines.push("package sdk");
    lines.push("");
    lines.push("import (");
    lines.push('    "context"');
    lines.push('    "net/http"');
    lines.push('    "encoding/json"');
    lines.push(")");
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
        return this.emitInterface(stmt as AST.ASTInterfaceDeclaration);
      case "EnumDeclaration":
        return this.emitEnum(stmt as AST.ASTEnumDeclaration);
      case "FunctionDeclaration":
        return this.emitFunction(stmt as AST.ASTFunctionDeclaration);
      default:
        return [`// Unsupported statement: ${stmt.type}`];
    }
  }

  /**
   * Emit a Go struct (equivalent to class)
   */
  private emitStruct(cls: AST.ASTClassDeclaration): string[] {
    const lines: string[] = [];
    const structName = this.toPascalCase(cls.name); // Go exports use PascalCase

    lines.push(`type ${structName} struct {`);

    if (cls.properties && cls.properties.length > 0) {
      cls.properties.forEach((prop) => {
        const fieldName = this.toPascalCase(prop.name); // Exported fields are PascalCase
        const goType = this.goType(prop.valueType);
        lines.push(`    ${fieldName} ${goType}`);
      });
    }

    lines.push("}");
    lines.push("");

    // Constructor function
    const constructor = this.emitConstructor(cls);
    lines.push(...constructor);

    // Methods
    if (cls.methods && cls.methods.length > 0) {
      cls.methods.forEach((method) => {
        const methodLines = this.emitMethod(structName, method);
        lines.push(...methodLines);
        lines.push("");
      });
    }

    return lines;
  }

  /**
   * Emit a Go constructor function
   */
  private emitConstructor(cls: AST.ASTClassDeclaration): string[] {
    const lines: string[] = [];
    const structName = this.toPascalCase(cls.name);
    const funcName = `New${structName}`;

    lines.push(`func ${funcName}() *${structName} {`);
    lines.push(`    return &${structName}{}`);
    lines.push("}");

    return lines;
  }

  /**
   * Emit a Go method
   */
  private emitMethod(receiverType: string, method: AST.ASTMethodDeclaration): string[] {
    const lines: string[] = [];
    const methodName = this.toPascalCase(method.name);
    const receiverName = "c";
    const params = (method.parameters || []).map((p) => `${this.toCamelCase(p.name)} ${this.goType(p.parameterType)}`).join(", ");
    const returnType = method.returnType ? ` ${this.goType(method.returnType)}` : "";

    lines.push(`func (${receiverName} *${receiverType}) ${methodName}(${params})${returnType} {`);
    lines.push("    // TODO: implement");
    lines.push("}");

    return lines;
  }

  /**
   * Emit a Go interface
   */
  private emitInterface(iface: AST.ASTInterfaceDeclaration): string[] {
    const lines: string[] = [];
    const interfaceName = this.toPascalCase(iface.name);

    lines.push(`type ${interfaceName} interface {`);

    if (iface.properties && iface.properties.length > 0) {
      iface.properties.forEach((prop) => {
        const methodName = this.toPascalCase(prop.name);
        const returnType = this.goType(prop.valueType);
        lines.push(`    ${methodName}() ${returnType}`);
      });
    }

    lines.push("}");

    return lines;
  }

  /**
   * Emit a Go enum (const block)
   */
  private emitEnum(enumDecl: AST.ASTEnumDeclaration): string[] {
    const lines: string[] = [];
    const enumName = this.toPascalCase(enumDecl.name);

    lines.push("const (");

    enumDecl.members.forEach((member, idx) => {
      const iota = idx === 0 ? " = iota" : "";
      lines.push(`    ${enumName}${member.name}${iota}`);
    });

    lines.push(")");

    return lines;
  }

  /**
   * Emit a Go function
   */
  private emitFunction(func: AST.ASTFunctionDeclaration): string[] {
    const lines: string[] = [];
    const funcName = this.toPascalCase(func.name);
    const params = (func.parameters || []).map((p) => `${this.toCamelCase(p.name)} ${this.goType(p.parameterType)}`).join(", ");
    const returnType = func.returnType ? ` ${this.goType(func.returnType)}` : "";

    lines.push(`func ${funcName}(${params})${returnType} {`);
    lines.push("    // TODO: implement");
    lines.push("}");

    return lines;
  }

  // ============ Helper Methods ============

  /**
   * Convert to PascalCase (exported names)
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
   * Convert to camelCase (unexported names)
   */
  private toCamelCase(name: string): string {
    // If already camelCase, return as-is
    if (name[0] === name[0].toLowerCase()) {
      return name;
    }
    // Convert from PascalCase
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  /**
   * Map TypeScript types to Go types
   */
  private goType(tsType: string | undefined): string {
    if (!tsType) return "interface{}";

    const typeMap: Record<string, string> = {
      string: "string",
      number: "float64",
      integer: "int",
      boolean: "bool",
      any: "interface{}",
      unknown: "interface{}",
      void: "",
      null: "nil",
      undefined: "nil",
      object: "map[string]interface{}",
      array: "[]interface{}",
      Promise: "chan interface{}",
    };

    return typeMap[tsType] || tsType;
  }
}
