/**
 * CODE GENERATION - Public API
 *
 * Exports the complete code generation system for SDK production.
 */

// Type definitions
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
} from "./types";

// Code emitter
export { TypeScriptEmitter, CodeBuilder, EmitterOptions, DEFAULT_EMITTER_OPTIONS } from "./emitter";

// Generator builders
export {
  ClientClassBuilder,
  ErrorTypeBuilder,
  ConfigurationBuilder,
  MethodBuilder,
  TypeDefinitionBuilder,
} from "./generators";

// Main generator
export { SDKCodeGenerator, GenerationResult, GeneratedFile } from "./index";

// Examples
export { generateStripeSDK, STRIPE_SDK_DESIGN_PLAN, GENERATED_SDK_USAGE_EXAMPLE } from "./examples";
