/**
 * PYTHON SDK CODE EMITTER
 * 
 * Generates idiomatic Python code from SDK specifications.
 * Uses snake_case, type hints, and proper Python conventions.
 */

import * as AST from "../types";
import { type EmitterOptions, DEFAULT_EMITTER_OPTIONS } from "../emitter";

/**
 * Simple Python code emitter
 */
export class PythonEmitter {
  private options: EmitterOptions;

  constructor(options: Partial<EmitterOptions> = {}) {
    this.options = {
      ...DEFAULT_EMITTER_OPTIONS,
      indentation: "spaces",
      indentSize: 4, // Python standard
      ...options,
    };
  }

  /**
   * Emit a complete Python program
   */
  emitProgram(program: AST.ASTProgram): string {
    const lines: string[] = [];

    // Add header
    lines.push('"""Generated Python SDK"""');
    lines.push("");
    lines.push("from typing import Any, Optional, Dict, List, AsyncIterator");
    lines.push("from dataclasses import dataclass");
    lines.push("from enum import Enum");
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
        return this.emitClass(stmt as AST.ASTClassDeclaration);
      case "InterfaceDeclaration":
        return this.emitInterface(stmt as AST.ASTInterfaceDeclaration);
      case "EnumDeclaration":
        return this.emitEnum(stmt as AST.ASTEnumDeclaration);
      case "FunctionDeclaration":
        return this.emitFunction(stmt as AST.ASTFunctionDeclaration);
      case "VariableDeclaration":
        return this.emitVariable(stmt as AST.ASTVariableDeclaration);
      default:
        return [`# Unsupported statement: ${stmt.type}`];
    }
  }

  /**
   * Emit a Python class
   */
  private emitClass(cls: AST.ASTClassDeclaration): string[] {
    const lines: string[] = [];
    const className = this.toPascalCase(cls.name); // Use PascalCase for classes

    // Class definition
    const inheritance = cls.extends ? `(${cls.extends})` : "";
    lines.push(`class ${className}${inheritance}:`);

    // Properties as __init__ parameters
    if (cls.properties && cls.properties.length > 0) {
      const params = cls.properties.map((p) => `${this.toSnakeCase(p.name)}: ${this.pythonType(p.valueType)}`).join(", ");
      lines.push(`    def __init__(self, ${params}) -> None:`);

      cls.properties.forEach((prop) => {
        lines.push(`        self.${this.toSnakeCase(prop.name)} = ${this.toSnakeCase(prop.name)}`);
      });

      lines.push("");
    }

    // Methods
    if (cls.methods && cls.methods.length > 0) {
      cls.methods.forEach((method) => {
        const methodLines = this.emitMethod(method);
        lines.push(...methodLines.map((line) => `    ${line}`));
        lines.push("");
      });
    }

    if (!cls.methods || cls.methods.length === 0) {
      lines[lines.length - 1] = lines[lines.length - 1] || "    pass";
    }

    return lines;
  }

  /**
   * Emit a Python method
   */
  private emitMethod(method: AST.ASTMethodDeclaration): string[] {
    const lines: string[] = [];
    const async = method.isAsync ? "async " : "";
    const params = method.parameters ? method.parameters.map((p) => `${this.toSnakeCase(p.name)}: ${this.pythonType(p.parameterType)}`).join(", ") : "";
    const returnType = method.returnType ? ` -> ${this.pythonType(method.returnType)}` : "";

    lines.push(`${async}def ${this.toSnakeCase(method.name)}(self, ${params})${returnType}:`);

    if (method.body && method.body.length > 0) {
      method.body.forEach((stmt) => {
        lines.push(...this.emitStatement(stmt).map((line) => `    ${line}`));
      });
    } else {
      lines.push("    pass");
    }

    return lines;
  }

  /**
   * Emit a Python interface (as typing.Protocol)
   */
  private emitInterface(iface: AST.ASTInterfaceDeclaration): string[] {
    const lines: string[] = [];
    const name = this.toPascalCase(iface.name);

    lines.push(`class ${name}(Protocol):`);

    if (iface.properties && iface.properties.length > 0) {
      iface.properties.forEach((prop) => {
        lines.push(`    ${this.toSnakeCase(prop.name)}: ${this.pythonType(prop.valueType)}`);
      });
    } else {
      lines.push("    pass");
    }

    return lines;
  }

  /**
   * Emit a Python enum
   */
  private emitEnum(enumDecl: AST.ASTEnumDeclaration): string[] {
    const lines: string[] = [];
    const name = this.toPascalCase(enumDecl.name);

    lines.push(`class ${name}(Enum):`);

    enumDecl.members.forEach((member) => {
      lines.push(`    ${member.name} = ${JSON.stringify(member.value)}`);
    });

    return lines;
  }

  /**
   * Emit a Python function
   */
  private emitFunction(func: AST.ASTFunctionDeclaration): string[] {
    const lines: string[] = [];
    const async = func.isAsync ? "async " : "";
    const params = func.parameters
      ? func.parameters.map((p) => `${this.toSnakeCase(p.name)}: ${this.pythonType(p.parameterType)}`).join(", ")
      : "";
    const returnType = func.returnType ? ` -> ${this.pythonType(func.returnType)}` : "";

    lines.push(`${async}def ${this.toSnakeCase(func.name)}(${params})${returnType}:`);

    if (func.body && func.body.length > 0) {
      func.body.forEach((stmt) => {
        lines.push(...this.emitStatement(stmt).map((line) => `    ${line}`));
      });
    } else {
      lines.push("    pass");
    }

    return lines;
  }

  /**
   * Emit a Python variable
   */
  private emitVariable(varDecl: AST.ASTVariableDeclaration): string[] {
    const varName = this.toSnakeCase(varDecl.name);
    return [`${varName}: ${varDecl.valueType || "Any"} = ...`];
  }

  // ============ Helper Methods ============

  /**
   * Convert to snake_case
   */
  private toSnakeCase(name: string): string {
    // If already snake_case, return as-is
    if (name === name.toLowerCase()) {
      return name;
    }
    // Convert from camelCase/PascalCase
    return name
      .replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
      .replace(/^_/, "");
  }

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
   * Map TypeScript types to Python types
   */
  private pythonType(tsType: string | undefined): string {
    if (!tsType) return "Any";

    const typeMap: Record<string, string> = {
      string: "str",
      number: "float",
      integer: "int",
      boolean: "bool",
      any: "Any",
      unknown: "Any",
      void: "None",
      null: "None",
      undefined: "Optional[Any]",
      object: "Dict[str, Any]",
      array: "List[Any]",
      Promise: "Awaitable",
    };

    return typeMap[tsType] || tsType;
  }
}
