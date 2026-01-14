/**
 * CODE EMITTER - Converts AST to Language-Specific Code
 *
 * Transforms structured AST nodes into idiomatic code without raw string concatenation.
 * Handles indentation, formatting, and language-specific syntax.
 */

import * as AST from "./types";

/**
 * Configuration for code emission
 */
export interface EmitterOptions {
  indentation: "spaces" | "tabs";
  indentSize: number;
  lineWidth: number;
  trailingNewline: boolean;
  semicolons: boolean;
}

/**
 * Default options for TypeScript
 */
export const DEFAULT_EMITTER_OPTIONS: EmitterOptions = {
  indentation: "spaces",
  indentSize: 2,
  lineWidth: 100,
  trailingNewline: true,
  semicolons: true,
};

/**
 * Code builder with accumulated content and indentation tracking
 */
export class CodeBuilder {
  private lineArray: string[] = [];
  private currentIndent: number = 0;
  private options: EmitterOptions;

  constructor(options: Partial<EmitterOptions> = {}) {
    this.options = { ...DEFAULT_EMITTER_OPTIONS, ...options };
  }

  /**
   * Get indentation string for current level
   */
  private getIndent(): string {
    if (this.options.indentation === "tabs") {
      return "\t".repeat(this.currentIndent);
    } else {
      return " ".repeat(this.currentIndent * this.options.indentSize);
    }
  }

  /**
   * Add a raw line (will be indented)
   */
  line(content: string): this {
    if (content === "") {
      this.lineArray.push("");
    } else {
      this.lineArray.push(this.getIndent() + content);
    }
    return this;
  }

  /**
   * Add multiple lines
   */
  lines(content: string[]): this {
    content.forEach((line) => this.line(line));
    return this;
  }

  /**
   * Add a comment line
   */
  comment(text: string, multiline: boolean = false): this {
    if (multiline) {
      this.line("/**");
      text.split("\n").forEach((line) => {
        this.line(` * ${line}`);
      });
      this.line(" */");
    } else {
      this.line(`// ${text}`);
    }
    return this;
  }

  /**
   * Add JSDoc comment
   */
  jsDoc(doc: {
    description?: string;
    params?: { name: string; type?: string; description?: string }[];
    returns?: { type?: string; description?: string };
    throws?: string[];
    deprecated?: boolean;
    example?: string;
  }): this {
    this.line("/**");

    if (doc.description) {
      doc.description.split("\n").forEach((line) => {
        this.line(` * ${line}`);
      });
    }

    if (doc.params && doc.params.length > 0) {
      this.line(" *");
      doc.params.forEach((param) => {
        const typeStr = param.type ? ` {${param.type}}` : "";
        this.line(
          ` * @param ${param.name}${typeStr} ${param.description || ""}`
        );
      });
    }

    if (doc.returns) {
      const typeStr = doc.returns.type ? ` {${doc.returns.type}}` : "";
      this.line(` * @returns${typeStr} ${doc.returns.description || ""}`);
    }

    if (doc.throws && doc.throws.length > 0) {
      this.line(" *");
      doc.throws.forEach((error) => {
        this.line(` * @throws {${error}}`);
      });
    }

    if (doc.deprecated) {
      this.line(" * @deprecated");
    }

    if (doc.example) {
      this.line(" *");
      this.line(" * @example");
      doc.example.split("\n").forEach((line) => {
        this.line(` * ${line}`);
      });
    }

    this.line(" */");
    return this;
  }

  /**
   * Increase indentation
   */
  indent(): this {
    this.currentIndent++;
    return this;
  }

  /**
   * Decrease indentation
   */
  outdent(): this {
    this.currentIndent = Math.max(0, this.currentIndent - 1);
    return this;
  }

  /**
   * Scoped indentation
   */
  block(fn: () => void): this {
    this.indent();
    fn();
    this.outdent();
    return this;
  }

  /**
   * Add blank line
   */
  blank(): this {
    this.lineArray.push("");
    return this;
  }

  /**
   * Get final code
   */
  toString(): string {
    let code = this.lineArray.join("\n");
    if (this.options.trailingNewline && !code.endsWith("\n")) {
      code += "\n";
    }
    return code;
  }

  /**
   * Get lines array
   */
  getLines(): string[] {
    return [...this.lineArray];
  }
}

/**
 * TypeScript code emitter - Converts AST to TypeScript code
 */
export class TypeScriptEmitter {
  private options: EmitterOptions;

  constructor(options: Partial<EmitterOptions> = {}) {
    this.options = { ...DEFAULT_EMITTER_OPTIONS, ...options };
  }

  /**
   * Emit program (file)
   */
  emitProgram(program: AST.ASTProgram): string {
    const builder = new CodeBuilder(this.options);
    program.body.forEach((stmt) => {
      this.emitStatement(builder, stmt);
      builder.blank();
    });
    return builder.toString();
  }

  /**
   * Emit a single statement
   */
  private emitStatement(builder: CodeBuilder, stmt: AST.ASTStatement): void {
    switch (stmt.type) {
      case "ImportStatement":
        this.emitImport(builder, stmt as AST.ASTImportStatement);
        break;

      case "ClassDeclaration":
        this.emitClassDeclaration(builder, stmt as AST.ASTClassDeclaration);
        break;

      case "InterfaceDeclaration":
        this.emitInterfaceDeclaration(builder, stmt as AST.ASTInterfaceDeclaration);
        break;

      case "EnumDeclaration":
        this.emitEnumDeclaration(builder, stmt as AST.ASTEnumDeclaration);
        break;

      case "FunctionDeclaration":
        this.emitFunctionDeclaration(builder, stmt as AST.ASTFunctionDeclaration);
        break;

      case "VariableDeclaration":
        this.emitVariableDeclaration(
          builder,
          stmt as AST.ASTVariableDeclaration
        );
        break;

      case "ReturnStatement":
        this.emitReturnStatement(builder, stmt as AST.ASTReturnStatement);
        break;

      case "ThrowStatement":
        this.emitThrowStatement(builder, stmt as AST.ASTThrowStatement);
        break;

      case "IfStatement":
        this.emitIfStatement(builder, stmt as AST.ASTIfStatement);
        break;

      case "TryCatchStatement":
        this.emitTryCatchStatement(builder, stmt as AST.ASTTryCatchStatement);
        break;

      default:
        builder.line(`// Unsupported statement type: ${stmt.type}`);
    }
  }

  /**
   * Emit import statement
   */
  private emitImport(builder: CodeBuilder, stmt: AST.ASTImportStatement): void {
    const imports = stmt.imports
      .map((imp) => (imp.alias ? `${imp.name} as ${imp.alias}` : imp.name))
      .join(", ");
    const semicolon = this.options.semicolons ? ";" : "";
    builder.line(`import { ${imports} } from "${stmt.source}"${semicolon}`);
  }

  /**
   * Emit class declaration
   */
  private emitClassDeclaration(
    builder: CodeBuilder,
    cls: AST.ASTClassDeclaration
  ): void {
    if (cls.documentation) {
      builder.jsDoc({ description: cls.documentation });
    }

    let classLine = "class " + cls.name;
    if (cls.extends) {
      classLine += ` extends ${cls.extends}`;
    }
    if (cls.implements && cls.implements.length > 0) {
      classLine += ` implements ${cls.implements.join(", ")}`;
    }
    classLine += " {";

    if (cls.isExported) {
      classLine = "export " + classLine;
    }

    builder.line(classLine);
    builder.indent();

    // Properties
    if (cls.properties && cls.properties.length > 0) {
      cls.properties.forEach((prop) => {
        this.emitPropertyDeclaration(builder, prop);
      });
      builder.blank();
    }

    // Constructor
    if (cls.constructor) {
      this.emitConstructor(builder, cls.constructor);
      builder.blank();
    }

    // Methods
    if (cls.methods && cls.methods.length > 0) {
      cls.methods.forEach((method) => {
        this.emitMethodDeclaration(builder, method);
        builder.blank();
      });
    }

    builder.outdent();
    const semicolon = this.options.semicolons ? "" : "";
    builder.line(`}${semicolon}`);
  }

  /**
   * Emit interface declaration
   */
  private emitInterfaceDeclaration(
    builder: CodeBuilder,
    iface: AST.ASTInterfaceDeclaration
  ): void {
    if (iface.documentation) {
      builder.jsDoc({ description: iface.documentation });
    }

    let interfaceLine = "interface " + iface.name;
    if (iface.extends && iface.extends.length > 0) {
      interfaceLine += ` extends ${iface.extends.join(", ")}`;
    }
    interfaceLine += " {";

    if (iface.isExported) {
      interfaceLine = "export " + interfaceLine;
    }

    builder.line(interfaceLine);
    builder.indent();

    if (iface.properties && iface.properties.length > 0) {
      iface.properties.forEach((prop) => {
        const optional = prop.readonly ? "readonly " : "";
        const typeStr = prop.valueType || "any";
        const semicolon = this.options.semicolons ? ";" : "";
        builder.line(
          `${optional}${prop.name}${prop.readonly ? "" : "?"}: ${typeStr}${semicolon}`
        );
      });
    }

    builder.outdent();
    builder.line("}");
  }

  /**
   * Emit enum declaration
   */
  private emitEnumDeclaration(
    builder: CodeBuilder,
    enumDecl: AST.ASTEnumDeclaration
  ): void {
    if (enumDecl.documentation) {
      builder.jsDoc({ description: enumDecl.documentation });
    }

    let enumLine = "enum " + enumDecl.name + " {";
    if (enumDecl.isExported) {
      enumLine = "export " + enumLine;
    }

    builder.line(enumLine);
    builder.indent();

    enumDecl.members.forEach((member, idx) => {
      const isLast = idx === enumDecl.members.length - 1;
      const comma = isLast ? "" : ",";
      builder.line(`${member.name} = ${JSON.stringify(member.value)}${comma}`);
    });

    builder.outdent();
    builder.line("}");
  }

  /**
   * Emit function declaration
   */
  private emitFunctionDeclaration(
    builder: CodeBuilder,
    func: AST.ASTFunctionDeclaration
  ): void {
    if (func.documentation) {
      builder.jsDoc({ description: func.documentation });
    }

    const asyncKeyword = func.isAsync ? "async " : "";
    const exportKeyword = func.isExported ? "export " : "";
    const returnType = func.returnType ? `: ${func.returnType}` : "";
    const params = func.parameters
      .map((p) => `${p.name}: ${p.parameterType}${p.optional ? "?" : ""}`)
      .join(", ");
    const semicolon = this.options.semicolons ? "" : "";

    builder.line(
      `${exportKeyword}${asyncKeyword}function ${func.name}(${params})${returnType} {`
    );
    builder.indent();

    func.body.forEach((stmt) => this.emitStatement(builder, stmt));

    builder.outdent();
    builder.line(`}${semicolon}`);
  }

  /**
   * Emit method declaration
   */
  private emitMethodDeclaration(
    builder: CodeBuilder,
    method: AST.ASTMethodDeclaration
  ): void {
    if (method.documentation) {
      builder.jsDoc({ description: method.documentation });
    }

    const privateKeyword = method.isPrivate ? "private " : "";
    const asyncKeyword = method.isAsync ? "async " : "";
    const returnType = method.returnType ? `: ${method.returnType}` : "";
    const params = method.parameters
      .map((p) => `${p.name}: ${p.parameterType}${p.optional ? "?" : ""}`)
      .join(", ");
    const semicolon = this.options.semicolons ? "" : "";

    builder.line(
      `${privateKeyword}${asyncKeyword}${method.name}(${params})${returnType} {`
    );
    builder.indent();

    method.body.forEach((stmt) => this.emitStatement(builder, stmt));

    builder.outdent();
    builder.line(`}${semicolon}`);
  }

  /**
   * Emit property declaration
   */
  private emitPropertyDeclaration(
    builder: CodeBuilder,
    prop: AST.ASTPropertyDeclaration
  ): void {
    const privateKeyword = prop.isPrivate ? "private " : "";
    const readonlyKeyword = prop.readonly ? "readonly " : "";
    const initializer = prop.initializer
      ? ` = ${this.emitExpression(prop.initializer)}`
      : "";
    const semicolon = this.options.semicolons ? ";" : "";

    builder.line(
      `${privateKeyword}${readonlyKeyword}${prop.name}: ${prop.type}${initializer}${semicolon}`
    );
  }

  /**
   * Emit constructor
   */
  private emitConstructor(
    builder: CodeBuilder,
    ctor: AST.ASTConstructor
  ): void {
    const params = ctor.parameters
      .map((p) => `${p.name}: ${p.parameterType}${p.optional ? "?" : ""}`)
      .join(", ");

    builder.line(`constructor(${params}) {`);
    builder.indent();

    ctor.body.forEach((stmt) => this.emitStatement(builder, stmt));

    builder.outdent();
    builder.line("}");
  }

  /**
   * Emit variable declaration
   */
  private emitVariableDeclaration(
    builder: CodeBuilder,
    varDecl: AST.ASTVariableDeclaration
  ): void {
    const typeStr = varDecl.valueType ? `: ${varDecl.valueType}` : "";
    const initializer = varDecl.initializer
      ? ` = ${this.emitExpression(varDecl.initializer)}`
      : "";
    const semicolon = this.options.semicolons ? ";" : "";

    builder.line(
      `${varDecl.kind} ${varDecl.name}${typeStr}${initializer}${semicolon}`
    );
  }

  /**
   * Emit return statement
   */
  private emitReturnStatement(
    builder: CodeBuilder,
    stmt: AST.ASTReturnStatement
  ): void {
    const value = stmt.argument
      ? ` ${this.emitExpression(stmt.argument)}`
      : "";
    const semicolon = this.options.semicolons ? ";" : "";
    builder.line(`return${value}${semicolon}`);
  }

  /**
   * Emit throw statement
   */
  private emitThrowStatement(
    builder: CodeBuilder,
    stmt: AST.ASTThrowStatement
  ): void {
    const semicolon = this.options.semicolons ? ";" : "";
    builder.line(`throw ${this.emitExpression(stmt.argument)}${semicolon}`);
  }

  /**
   * Emit if statement
   */
  private emitIfStatement(
    builder: CodeBuilder,
    stmt: AST.ASTIfStatement
  ): void {
    builder.line(`if (${this.emitExpression(stmt.condition)}) {`);
    builder.indent();
    stmt.consequent.forEach((s) => this.emitStatement(builder, s));
    builder.outdent();

    if (stmt.alternate && stmt.alternate.length > 0) {
      builder.line("} else {");
      builder.indent();
      stmt.alternate.forEach((s) => this.emitStatement(builder, s));
      builder.outdent();
    }

    builder.line("}");
  }

  /**
   * Emit try-catch statement
   */
  private emitTryCatchStatement(
    builder: CodeBuilder,
    stmt: AST.ASTTryCatchStatement
  ): void {
    builder.line("try {");
    builder.indent();
    stmt.tryBlock.forEach((s) => this.emitStatement(builder, s));
    builder.outdent();

    if (stmt.catchClause) {
      builder.line(`} catch (${stmt.catchClause.param}) {`);
      builder.indent();
      stmt.catchClause.body.forEach((s) => this.emitStatement(builder, s));
      builder.outdent();
    }

    if (stmt.finallyBlock) {
      builder.line("} finally {");
      builder.indent();
      stmt.finallyBlock.forEach((s) => this.emitStatement(builder, s));
      builder.outdent();
    }

    builder.line("}");
  }

  /**
   * Emit expression
   */
  private emitExpression(expr: AST.ASTExpression): string {
    switch (expr.type) {
      case "Literal":
        return (expr as AST.ASTLiteral).raw;

      case "Identifier":
        return (expr as AST.ASTIdentifier).name;

      case "MemberExpression": {
        const me = expr as AST.ASTMemberExpression;
        const bracket = me.computed ? `[${me.property}]` : `.${me.property}`;
        return `${me.object}${bracket}`;
      }

      case "CallExpression": {
        const ce = expr as AST.ASTCallExpression;
        const args = ce.arguments
          .map((arg) =>
            typeof arg === "string" ? arg : this.emitExpression(arg)
          )
          .join(", ");
        return `${ce.callee}(${args})`;
      }

      case "ObjectExpression": {
        const oe = expr as AST.ASTObjectExpression;
        const props = oe.properties
          .map((p) => {
            const val =
              typeof p.value === "string"
                ? p.value
                : this.emitExpression(p.value);
            return `${p.key}: ${val}`;
          })
          .join(", ");
        return `{ ${props} }`;
      }

      case "ArrayExpression": {
        const ae = expr as AST.ASTArrayExpression;
        const elements = ae.elements
          .map((e) =>
            typeof e === "string" ? e : this.emitExpression(e)
          )
          .join(", ");
        return `[${elements}]`;
      }

      case "BinaryExpression": {
        const be = expr as AST.ASTBinaryExpression;
        const left = typeof be.left === "string" ? be.left : this.emitExpression(be.left);
        const right = typeof be.right === "string" ? be.right : this.emitExpression(be.right);
        return `${left} ${be.operator} ${right}`;
      }

      case "ConditionalExpression": {
        const ce = expr as AST.ASTConditionalExpression;
        return `${this.emitExpression(ce.condition)} ? ${this.emitExpression(ce.consequent)} : ${this.emitExpression(ce.alternate)}`;
      }

      default:
        return `/* unknown expression type: ${expr.type} */`;
    }
  }
}
