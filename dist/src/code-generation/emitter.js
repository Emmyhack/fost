"use strict";
/**
 * CODE EMITTER - Converts AST to Language-Specific Code
 *
 * Transforms structured AST nodes into idiomatic code without raw string concatenation.
 * Handles indentation, formatting, and language-specific syntax.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptEmitter = exports.CodeBuilder = exports.DEFAULT_EMITTER_OPTIONS = void 0;
/**
 * Default options for TypeScript
 */
exports.DEFAULT_EMITTER_OPTIONS = {
    indentation: "spaces",
    indentSize: 2,
    lineWidth: 100,
    trailingNewline: true,
    semicolons: true,
};
/**
 * Code builder with accumulated content and indentation tracking
 */
class CodeBuilder {
    constructor(options = {}) {
        this.lineArray = [];
        this.currentIndent = 0;
        this.options = { ...exports.DEFAULT_EMITTER_OPTIONS, ...options };
    }
    /**
     * Get indentation string for current level
     */
    getIndent() {
        if (this.options.indentation === "tabs") {
            return "\t".repeat(this.currentIndent);
        }
        else {
            return " ".repeat(this.currentIndent * this.options.indentSize);
        }
    }
    /**
     * Add a raw line (will be indented)
     */
    line(content) {
        if (content === "") {
            this.lineArray.push("");
        }
        else {
            this.lineArray.push(this.getIndent() + content);
        }
        return this;
    }
    /**
     * Add multiple lines
     */
    lines(content) {
        content.forEach((line) => this.line(line));
        return this;
    }
    /**
     * Add a comment line
     */
    comment(text, multiline = false) {
        if (multiline) {
            this.line("/**");
            text.split("\n").forEach((line) => {
                this.line(` * ${line}`);
            });
            this.line(" */");
        }
        else {
            this.line(`// ${text}`);
        }
        return this;
    }
    /**
     * Add JSDoc comment
     */
    jsDoc(doc) {
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
                this.line(` * @param ${param.name}${typeStr} ${param.description || ""}`);
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
    indent() {
        this.currentIndent++;
        return this;
    }
    /**
     * Decrease indentation
     */
    outdent() {
        this.currentIndent = Math.max(0, this.currentIndent - 1);
        return this;
    }
    /**
     * Scoped indentation
     */
    block(fn) {
        this.indent();
        fn();
        this.outdent();
        return this;
    }
    /**
     * Add blank line
     */
    blank() {
        this.lineArray.push("");
        return this;
    }
    /**
     * Get final code
     */
    toString() {
        let code = this.lineArray.join("\n");
        if (this.options.trailingNewline && !code.endsWith("\n")) {
            code += "\n";
        }
        return code;
    }
    /**
     * Get lines array
     */
    getLines() {
        return [...this.lineArray];
    }
}
exports.CodeBuilder = CodeBuilder;
/**
 * TypeScript code emitter - Converts AST to TypeScript code
 */
class TypeScriptEmitter {
    constructor(options = {}) {
        this.options = { ...exports.DEFAULT_EMITTER_OPTIONS, ...options };
    }
    /**
     * Emit program (file)
     */
    emitProgram(program) {
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
    emitStatement(builder, stmt) {
        switch (stmt.type) {
            case "ImportStatement":
                this.emitImport(builder, stmt);
                break;
            case "ClassDeclaration":
                this.emitClassDeclaration(builder, stmt);
                break;
            case "InterfaceDeclaration":
                this.emitInterfaceDeclaration(builder, stmt);
                break;
            case "EnumDeclaration":
                this.emitEnumDeclaration(builder, stmt);
                break;
            case "FunctionDeclaration":
                this.emitFunctionDeclaration(builder, stmt);
                break;
            case "VariableDeclaration":
                this.emitVariableDeclaration(builder, stmt);
                break;
            case "ReturnStatement":
                this.emitReturnStatement(builder, stmt);
                break;
            case "ThrowStatement":
                this.emitThrowStatement(builder, stmt);
                break;
            case "IfStatement":
                this.emitIfStatement(builder, stmt);
                break;
            case "TryCatchStatement":
                this.emitTryCatchStatement(builder, stmt);
                break;
            default:
                builder.line(`// Unsupported statement type: ${stmt.type}`);
        }
    }
    /**
     * Emit import statement
     */
    emitImport(builder, stmt) {
        const imports = stmt.imports
            .map((imp) => (imp.alias ? `${imp.name} as ${imp.alias}` : imp.name))
            .join(", ");
        const semicolon = this.options.semicolons ? ";" : "";
        builder.line(`import { ${imports} } from "${stmt.source}"${semicolon}`);
    }
    /**
     * Emit class declaration
     */
    emitClassDeclaration(builder, cls) {
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
    emitInterfaceDeclaration(builder, iface) {
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
                builder.line(`${optional}${prop.name}${prop.readonly ? "" : "?"}: ${typeStr}${semicolon}`);
            });
        }
        builder.outdent();
        builder.line("}");
    }
    /**
     * Emit enum declaration
     */
    emitEnumDeclaration(builder, enumDecl) {
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
    emitFunctionDeclaration(builder, func) {
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
        builder.line(`${exportKeyword}${asyncKeyword}function ${func.name}(${params})${returnType} {`);
        builder.indent();
        func.body.forEach((stmt) => this.emitStatement(builder, stmt));
        builder.outdent();
        builder.line(`}${semicolon}`);
    }
    /**
     * Emit method declaration
     */
    emitMethodDeclaration(builder, method) {
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
        builder.line(`${privateKeyword}${asyncKeyword}${method.name}(${params})${returnType} {`);
        builder.indent();
        method.body.forEach((stmt) => this.emitStatement(builder, stmt));
        builder.outdent();
        builder.line(`}${semicolon}`);
    }
    /**
     * Emit property declaration
     */
    emitPropertyDeclaration(builder, prop) {
        const privateKeyword = prop.isPrivate ? "private " : "";
        const readonlyKeyword = prop.readonly ? "readonly " : "";
        const initializer = prop.initializer
            ? ` = ${this.emitExpression(prop.initializer)}`
            : "";
        const semicolon = this.options.semicolons ? ";" : "";
        builder.line(`${privateKeyword}${readonlyKeyword}${prop.name}: ${prop.type}${initializer}${semicolon}`);
    }
    /**
     * Emit constructor
     */
    emitConstructor(builder, ctor) {
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
    emitVariableDeclaration(builder, varDecl) {
        const typeStr = varDecl.valueType ? `: ${varDecl.valueType}` : "";
        const initializer = varDecl.initializer
            ? ` = ${this.emitExpression(varDecl.initializer)}`
            : "";
        const semicolon = this.options.semicolons ? ";" : "";
        builder.line(`${varDecl.kind} ${varDecl.name}${typeStr}${initializer}${semicolon}`);
    }
    /**
     * Emit return statement
     */
    emitReturnStatement(builder, stmt) {
        const value = stmt.argument
            ? ` ${this.emitExpression(stmt.argument)}`
            : "";
        const semicolon = this.options.semicolons ? ";" : "";
        builder.line(`return${value}${semicolon}`);
    }
    /**
     * Emit throw statement
     */
    emitThrowStatement(builder, stmt) {
        const semicolon = this.options.semicolons ? ";" : "";
        builder.line(`throw ${this.emitExpression(stmt.argument)}${semicolon}`);
    }
    /**
     * Emit if statement
     */
    emitIfStatement(builder, stmt) {
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
    emitTryCatchStatement(builder, stmt) {
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
    emitExpression(expr) {
        switch (expr.type) {
            case "Literal":
                return expr.raw;
            case "Identifier":
                return expr.name;
            case "MemberExpression": {
                const me = expr;
                const bracket = me.computed ? `[${me.property}]` : `.${me.property}`;
                return `${me.object}${bracket}`;
            }
            case "CallExpression": {
                const ce = expr;
                const args = ce.arguments
                    .map((arg) => typeof arg === "string" ? arg : this.emitExpression(arg))
                    .join(", ");
                return `${ce.callee}(${args})`;
            }
            case "ObjectExpression": {
                const oe = expr;
                const props = oe.properties
                    .map((p) => {
                    const val = typeof p.value === "string"
                        ? p.value
                        : this.emitExpression(p.value);
                    return `${p.key}: ${val}`;
                })
                    .join(", ");
                return `{ ${props} }`;
            }
            case "ArrayExpression": {
                const ae = expr;
                const elements = ae.elements
                    .map((e) => typeof e === "string" ? e : this.emitExpression(e))
                    .join(", ");
                return `[${elements}]`;
            }
            case "BinaryExpression": {
                const be = expr;
                const left = typeof be.left === "string" ? be.left : this.emitExpression(be.left);
                const right = typeof be.right === "string" ? be.right : this.emitExpression(be.right);
                return `${left} ${be.operator} ${right}`;
            }
            case "ConditionalExpression": {
                const ce = expr;
                return `${this.emitExpression(ce.condition)} ? ${this.emitExpression(ce.consequent)} : ${this.emitExpression(ce.alternate)}`;
            }
            default:
                return `/* unknown expression type: ${expr.type} */`;
        }
    }
}
exports.TypeScriptEmitter = TypeScriptEmitter;
//# sourceMappingURL=emitter.js.map