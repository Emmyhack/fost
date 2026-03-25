/**
 * CODE GENERATION - Public API
 *
 * Exports the complete code generation system for SDK production.
 */

// Type definitions (interfaces/types must use `export type`)
export type {
  SDKDesignPlan,
  SDKMethod,
  MethodParameter,
  SDKTypeDefinition,
  SDKErrorType,
  AuthScheme,
  ConfigurationSchema,
  FolderStructure,
  GenerationOptions,
  GeneratedCodeFile,
  GeneratedSDK,
  ASTNode,
  ASTProgram,
  ASTStatement,
  ASTExpression,
  ASTImportStatement,
  ASTClassDeclaration,
  ASTConstructor,
  ASTMethodDeclaration,
  ASTPropertyDeclaration,
  ASTParameter,
  ASTInterfaceDeclaration,
  ASTEnumDeclaration,
  ASTReturnStatement,
  ASTThrowStatement,
  ASTIfStatement,
  ASTForStatement,
  ASTTryCatchStatement,
  ASTCallExpression,
  ASTObjectExpression,
  ASTArrayExpression,
  ASTLiteral,
  ASTIdentifier,
  ASTMemberExpression,
  ASTBinaryExpression,
  ASTConditionalExpression,
  ASTVariableDeclaration,
  ASTFunctionDeclaration,
  // FIX: also export the new ASTRawStatement type added in types.ts
  ASTRawStatement,
} from "./types";

// Code emitter — EmitterOptions is an interface, so it needs `export type`
export type { EmitterOptions } from "./emitter";
// TypeScriptEmitter, CodeBuilder, and DEFAULT_EMITTER_OPTIONS are values
export { TypeScriptEmitter, CodeBuilder, DEFAULT_EMITTER_OPTIONS } from "./emitter";

// Generator builders (all classes = values, no `type` needed)
export {
  ClientClassBuilder,
  ErrorTypeBuilder,
  ConfigurationBuilder,
  MethodBuilder,
  TypeDefinitionBuilder,
} from "./generators";

// Main generator — SDKCodeGenerator is a class (value); the result types are interfaces
export { SDKCodeGenerator } from "./index";
export type { GenerationResult, GeneratedFile } from "./index";