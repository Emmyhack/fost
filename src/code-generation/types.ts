/**
 * CODE GENERATION LAYER - TYPE DEFINITIONS
 *
 * Defines the SDK design plan and code generation interfaces.
 * These types bridge from Canonical Schema to generated code.
 */

// ============================================================================
// SDK DESIGN PLAN - Input to Code Generation
// ============================================================================

/**
 * Specification for how to generate an SDK for a specific language/platform
 * Created during SDK Design layer, consumed by Code Generation layer
 */
export interface SDKDesignPlan {
  /** Product information */
  product: {
    name: string;
    version: string;
    description: string;
    apiVersion: string;
  };

  /** SDK generation target */
  target: {
    language: "typescript" | "python" | "go" | "rust" | "kotlin" | "swift";
    platform: "node" | "browser" | "both" | "mobile";
    packageManager: "npm" | "pip" | "cargo" | "go-modules" | "gradle" | "cocoapods";
  };

  /** Client architecture decisions */
  client: {
    className: string; // e.g., "StripeClient"
    baseUrl?: string; // For REST SDKs
    timeout: number; // ms
    retryPolicy: {
      maxRetries: number;
      backoffMultiplier: number;
      initialDelayMs: number;
    };
    caching?: {
      enabled: boolean;
      ttlMs?: number;
    };
  };

  /** Methods to generate */
  methods: SDKMethod[];

  /** Type definitions */
  types: SDKTypeDefinition[];

  /** Error types */
  errors: SDKErrorType[];

  /** Authentication scheme */
  auth: AuthScheme;

  /** Configuration schema */
  config: ConfigurationSchema;

  /** Generated folder structure */
  outputStructure: FolderStructure;

  /** Code generation options */
  options: GenerationOptions;
}

/**
 * Single method/operation to generate
 */
export interface SDKMethod {
  name: string;
  description?: string;
  category?: string; // "payment", "account", "admin", etc.

  /** HTTP method or RPC call type */
  httpMethod?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint?: string; // REST endpoint path

  /** Input parameters */
  parameters: MethodParameter[];

  /** Return type */
  returns: {
    type: string; // Reference to SDKTypeDefinition
    isAsync: boolean;
    isStream?: boolean;
  };

  /** Possible errors */
  throws?: string[]; // References to SDKErrorType names

  /** Authentication required */
  requiresAuth: boolean;
  authType?: "bearer" | "api-key" | "oauth" | "wallet";

  /** Rate limiting */
  rateLimit?: {
    requestsPerSecond?: number;
    requestsPerHour?: number;
  };

  /** Code generation hints */
  generationHints?: {
    deprecated?: boolean;
    experimental?: boolean;
    requiresManualSetup?: boolean;
    customImplementation?: string; // Inline code template
  };
}

/**
 * Single parameter for a method
 */
export interface MethodParameter {
  name: string;
  type: string; // Reference to SDKTypeDefinition or primitive
  required: boolean;
  description?: string;
  defaultValue?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string; // Regex
    min?: number;
    max?: number;
    enum?: string[];
  };
}

/**
 * Type definition to generate
 */
export interface SDKTypeDefinition {
  name: string;
  kind: "class" | "interface" | "type-alias" | "enum";
  description?: string;

  /** For classes */
  constructor?: {
    parameters: MethodParameter[];
    body?: string; // Custom constructor logic
  };

  /** Properties/fields */
  fields?: {
    name: string;
    type: string;
    required: boolean;
    readonly?: boolean;
    description?: string;
  }[];

  /** Methods on class */
  methods?: SDKMethod[];

  /** For enums */
  enumValues?: {
    name: string;
    value: string | number;
    description?: string;
  }[];

  /** Generic type parameters */
  generics?: string[];

  /** Extends/Implements */
  extends?: string;
  implements?: string[];

  /** JSDoc/Doc string to emit */
  documentation?: string;

  isExported: boolean;
}

/**
 * Error type definition
 */
export interface SDKErrorType {
  name: string;
  statusCode?: number;
  message: string;
  description?: string;
  extendsFrom?: string; // Parent error class
  properties?: {
    name: string;
    type: string;
    description?: string;
  }[];
}

/**
 * Authentication scheme
 */
export interface AuthScheme {
  type: "api-key" | "bearer" | "oauth2" | "wallet" | "none";
  configurable: boolean;

  /** For API key */
  apiKey?: {
    header?: string;
    query?: string;
    prefix?: string;
  };

  /** For Bearer tokens */
  bearer?: {
    prefix: string; // "Bearer " or similar
  };

  /** For OAuth2 */
  oauth2?: {
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
  };

  /** For Web3 wallet */
  wallet?: {
    signerType: "ethers" | "web3js" | "native";
    chainRequired: boolean;
  };

  /** Default to use if not provided */
  default?: string;
}

/**
 * Configuration schema for SDK initialization
 */
export interface ConfigurationSchema {
  apiKey?: {
    required: boolean;
    description?: string;
  };
  apiSecret?: {
    required: boolean;
    description?: string;
  };
  baseUrl?: {
    required: boolean;
    default?: string;
    description?: string;
  };
  environment?: {
    required: boolean;
    options: string[]; // "production", "sandbox", etc.
    default?: string;
  };
  timeout?: {
    required: boolean;
    default?: number;
  };
  retryPolicy?: {
    required: boolean;
    default?: {
      maxRetries: number;
      backoffMultiplier: number;
    };
  };
  customHeaders?: {
    required: boolean;
    description?: string;
  };
  logger?: {
    required: boolean;
    description?: string;
  };
  /** Custom config fields */
  custom?: Record<
    string,
    {
      type: string;
      required: boolean;
      default?: string;
      description?: string;
    }
  >;
}

/**
 * Output folder structure
 */
export interface FolderStructure {
  root: string;
  src: string;
  lib: {
    client: string;
    types: string;
    errors: string;
    config: string;
    auth: string;
    utils: string;
  };
  tests?: string;
  examples?: string;
}

/**
 * Code generation options
 */
export interface GenerationOptions {
  generateTypes: boolean;
  generateErrors: boolean;
  generateTests: boolean;
  generateExamples: boolean;
  generateReadme: boolean;

  /** Emit strict type checking features */
  strictTypes: boolean;

  /** Include JSDoc comments */
  emitJSDoc: boolean;

  /** Include inline examples in code */
  includeExamples: boolean;

  /** Format code after generation */
  formatCode: boolean;
  formatter?: "prettier" | "none";

  /** Output language version */
  languageVersion?: string;
}

// ============================================================================
// CODE GENERATION OUTPUT
// ============================================================================

/**
 * Generated code file
 */
export interface GeneratedCodeFile {
  path: string; // Relative path in SDK
  language: string;
  content: string;
  type: "source" | "test" | "example" | "config";
}

/**
 * Complete generated SDK
 */
export interface GeneratedSDK {
  product: {
    name: string;
    version: string;
  };
  files: GeneratedCodeFile[];
  metadata: {
    generatedAt: string;
    generatorVersion: string;
    designPlanHash: string; // For reproducibility
  };
}

// ============================================================================
// AST NODES - Structured code representation
// ============================================================================

/**
 * Abstract Syntax Tree node for structured code generation
 */
export interface ASTNode {
  type: string;
  line?: number;
  column?: number;
  comments?: string[]; // Preceding comments
}

export interface ASTProgram extends ASTNode {
  type: "Program";
  body: ASTStatement[];
}

export interface ASTStatement extends ASTNode {}

export interface ASTExpression extends ASTNode {}

export interface ASTImportStatement extends ASTStatement {
  type: "ImportStatement";
  source: string; // Module path
  imports: {
    name: string;
    alias?: string;
  }[];
}

export interface ASTClassDeclaration extends ASTStatement {
  type: "ClassDeclaration";
  name: string;
  extends?: string;
  implements?: string[];
  constructor?: ASTConstructor;
  properties: ASTPropertyDeclaration[];
  methods: ASTMethodDeclaration[];
  documentation?: string;
  isExported: boolean;
}

export interface ASTConstructor extends ASTNode {
  type: "Constructor";
  parameters: ASTParameter[];
  body: ASTStatement[];
}

export interface ASTMethodDeclaration extends ASTNode {
  type: "MethodDeclaration";
  name: string;
  parameters: ASTParameter[];
  returnType?: string;
  body: ASTStatement[];
  isAsync: boolean;
  isPrivate: boolean;
  documentation?: string;
}

export interface ASTPropertyDeclaration extends ASTNode {
  type: "PropertyDeclaration";
  name: string;
  valueType: string;
  initializer?: ASTExpression;
  readonly: boolean;
  isPrivate: boolean;
  documentation?: string;
}

export interface ASTParameter extends ASTNode {
  type: "Parameter";
  name: string;
  parameterType: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ASTInterfaceDeclaration extends ASTStatement {
  type: "InterfaceDeclaration";
  name: string;
  extends?: string[];
  properties: ASTPropertyDeclaration[];
  isExported: boolean;
  documentation?: string;
}

export interface ASTEnumDeclaration extends ASTStatement {
  type: "EnumDeclaration";
  name: string;
  members: {
    name: string;
    value: string | number;
  }[];
  isExported: boolean;
  documentation?: string;
}

export interface ASTReturnStatement extends ASTStatement {
  type: "ReturnStatement";
  argument?: ASTExpression;
}

export interface ASTThrowStatement extends ASTStatement {
  type: "ThrowStatement";
  argument: ASTExpression;
}

export interface ASTIfStatement extends ASTStatement {
  type: "IfStatement";
  condition: ASTExpression;
  consequent: ASTStatement[];
  alternate?: ASTStatement[];
}

export interface ASTForStatement extends ASTStatement {
  type: "ForStatement";
  init?: string; // Variable declaration
  condition: ASTExpression;
  update?: string;
  body: ASTStatement[];
}

export interface ASTTryCatchStatement extends ASTStatement {
  type: "TryCatchStatement";
  tryBlock: ASTStatement[];
  catchClause?: {
    param: string;
    body: ASTStatement[];
  };
  finallyBlock?: ASTStatement[];
}

export interface ASTCallExpression extends ASTExpression {
  type: "CallExpression";
  callee: string; // Function name or this.method
  arguments: (string | ASTExpression)[];
}

export interface ASTObjectExpression extends ASTExpression {
  type: "ObjectExpression";
  properties: {
    key: string;
    value: string | ASTExpression;
  }[];
}

export interface ASTArrayExpression extends ASTExpression {
  type: "ArrayExpression";
  elements: (string | ASTExpression)[];
}

export interface ASTLiteral extends ASTExpression {
  type: "Literal";
  value: string | number | boolean | null;
  raw: string;
}

export interface ASTIdentifier extends ASTExpression {
  type: "Identifier";
  name: string;
}

export interface ASTMemberExpression extends ASTExpression {
  type: "MemberExpression";
  object: string; // Object name
  property: string; // Property name
  computed: boolean; // this[prop] vs this.prop
}

export interface ASTBinaryExpression extends ASTExpression {
  type: "BinaryExpression";
  left: string | ASTExpression;
  operator: string; // "+", "-", "===", etc.
  right: string | ASTExpression;
}

export interface ASTConditionalExpression extends ASTExpression {
  type: "ConditionalExpression";
  condition: ASTExpression;
  consequent: ASTExpression;
  alternate: ASTExpression;
}

export interface ASTVariableDeclaration extends ASTStatement {
  type: "VariableDeclaration";
  kind: "const" | "let" | "var";
  name: string;
  valueType?: string;
  initializer?: ASTExpression;
}

export interface ASTFunctionDeclaration extends ASTStatement {
  type: "FunctionDeclaration";
  name: string;
  parameters: ASTParameter[];
  returnType?: string;
  body: ASTStatement[];
  isAsync: boolean;
  isExported: boolean;
  documentation?: string;
}
