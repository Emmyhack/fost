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
export declare const DEFAULT_EMITTER_OPTIONS: EmitterOptions;
/**
 * Code builder with accumulated content and indentation tracking
 */
export declare class CodeBuilder {
    private lineArray;
    private currentIndent;
    private options;
    constructor(options?: Partial<EmitterOptions>);
    /**
     * Get indentation string for current level
     */
    private getIndent;
    /**
     * Add a raw line (will be indented)
     */
    line(content: string): this;
    /**
     * Add multiple lines
     */
    lines(content: string[]): this;
    /**
     * Add a comment line
     */
    comment(text: string, multiline?: boolean): this;
    /**
     * Add JSDoc comment
     */
    jsDoc(doc: {
        description?: string;
        params?: {
            name: string;
            type?: string;
            description?: string;
        }[];
        returns?: {
            type?: string;
            description?: string;
        };
        throws?: string[];
        deprecated?: boolean;
        example?: string;
    }): this;
    /**
     * Increase indentation
     */
    indent(): this;
    /**
     * Decrease indentation
     */
    outdent(): this;
    /**
     * Scoped indentation
     */
    block(fn: () => void): this;
    /**
     * Add blank line
     */
    blank(): this;
    /**
     * Get final code
     */
    toString(): string;
    /**
     * Get lines array
     */
    getLines(): string[];
}
/**
 * TypeScript code emitter - Converts AST to TypeScript code
 */
export declare class TypeScriptEmitter {
    private options;
    constructor(options?: Partial<EmitterOptions>);
    /**
     * Emit program (file)
     */
    emitProgram(program: AST.ASTProgram): string;
    /**
     * Emit a single statement
     */
    private emitStatement;
    /**
     * Emit import statement
     */
    private emitImport;
    /**
     * Emit class declaration
     */
    private emitClassDeclaration;
    /**
     * Emit interface declaration
     */
    private emitInterfaceDeclaration;
    /**
     * Emit enum declaration
     */
    private emitEnumDeclaration;
    /**
     * Emit function declaration
     */
    private emitFunctionDeclaration;
    /**
     * Emit method declaration
     */
    private emitMethodDeclaration;
    /**
     * Emit property declaration
     */
    private emitPropertyDeclaration;
    /**
     * Emit constructor
     */
    private emitConstructor;
    /**
     * Emit variable declaration
     */
    private emitVariableDeclaration;
    /**
     * Emit return statement
     */
    private emitReturnStatement;
    /**
     * Emit throw statement
     */
    private emitThrowStatement;
    /**
     * Emit if statement
     */
    private emitIfStatement;
    /**
     * Emit try-catch statement
     */
    private emitTryCatchStatement;
    /**
     * Emit expression
     */
    private emitExpression;
}
//# sourceMappingURL=emitter.d.ts.map