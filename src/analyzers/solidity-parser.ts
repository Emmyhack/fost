/**
 * SOLIDITY PARSER (solc JSON AST)
 * 
 * Parses Solidity source code through solc JSON AST format.
 * Extracts contract structure, functions, state variables, and events.
 * 
 * Design principles:
 * - Works with solc JSON AST (formal Abstract Syntax Tree)
 * - Replaces regex-based parsing with proper AST navigation
 * - Extracts contracts, functions, state, and events
 * - Foundation for higher-level analysis (CFG, data flow, etc.)
 * 
 * Usage:
 *   const parser = new SolidityParser();
 *   const analysis = await parser.parseSourceCode(solidityCode);
 */

/**
 * Solidity contract analysis result
 */
export interface ContractAnalysis {
  name: string;
  baseName?: string;
  functions: FunctionAnalysis[];
  stateVariables: StateVariable[];
  events: EventAnalysis[];
  modifiers: ModifierAnalysis[];
  isInterface: boolean;
  isLibrary: boolean;
  isAbstract: boolean;
  sloc: number; // Source lines of code
}

/**
 * Function analysis
 */
export interface FunctionAnalysis {
  name: string;
  isConstructor: boolean;
  isExternal: boolean;
  isPublic: boolean;
  isInternal: boolean;
  isPrivate: boolean;
  isPure: boolean;
  isView: boolean;
  isPayable: boolean;
  parameters: Parameter[];
  returnValues: Parameter[];
  modifiers: string[];
  startLine: number;
  endLine: number;
  complexity: number; // Cyclomatic complexity
}

/**
 * Function parameter
 */
export interface Parameter {
  name: string;
  type: string;
  isArray: boolean;
  isMapping: boolean;
  keyType?: string; // For mappings
  valueType?: string; // For mappings
}

/**
 * State variable
 */
export interface StateVariable {
  name: string;
  type: string;
  visibility: "public" | "private" | "internal" | "external";
  isConstant: boolean;
  isImmutable: boolean;
  initialValue?: string;
}

/**
 * Event analysis
 */
export interface EventAnalysis {
  name: string;
  parameters: Parameter[];
  indexedCount: number;
  startLine: number;
  endLine: number;
}

/**
 * Modifier analysis
 */
export interface ModifierAnalysis {
  name: string;
  parameters: Parameter[];
  startLine: number;
  endLine: number;
}

/**
 * Solc JSON AST Node types
 */
interface ASTNode {
  nodeType: string;
  id: number;
  name?: string;
  src: string;
  [key: string]: any;
}

/**
 * Contract-level AST node
 */
interface ContractNode extends ASTNode {
  nodeType: "ContractDefinition";
  name: string;
  nodes: ASTNode[];
  contractKind: "contract" | "interface" | "library";
  baseContracts?: Array<{ baseName: string }>;
}

/**
 * Function-level AST node
 */
interface FunctionNode extends ASTNode {
  nodeType: "FunctionDefinition";
  name: string;
  parameters: FunctionParameters;
  returnParameters: FunctionParameters;
  modifiers: Array<{ modifierName: string }>;
  stateMutability: string;
  visibility: string;
  isConstructor: boolean;
  body: ASTNode;
}

/**
 * Function parameters node
 */
interface FunctionParameters {
  parameters: Array<{
    name: string;
    typeName: any;
  }>;
}

/**
 * Variable-level AST node
 */
interface VariableNode extends ASTNode {
  nodeType: "VariableDeclaration";
  name: string;
  typeName: any;
  stateVariable: boolean;
  visibility?: string;
  constant?: boolean;
  immutable?: boolean;
}

/**
 * Event-level AST node
 */
interface EventNode extends ASTNode {
  nodeType: "EventDefinition";
  name: string;
  parameters: FunctionParameters;
}

/**
 * Modifier-level AST node
 */
interface ModifierNode extends ASTNode {
  nodeType: "ModifierDefinition";
  name: string;
  parameters: FunctionParameters;
}

/**
 * Parses Solidity source code and extracts structure
 */
export class SolidityParser {
  /**
   * Parse solc JSON AST output
   */
  parseAST(astJson: string): ContractAnalysis[] {
    try {
      const ast = JSON.parse(astJson);
      const contracts: ContractAnalysis[] = [];

      this.walkAST(ast, (node: ASTNode) => {
        if (node.nodeType === "ContractDefinition") {
          const contractAnalysis = this.analyzeContract(node as ContractNode);
          if (contractAnalysis) {
            contracts.push(contractAnalysis);
          }
        }
      });

      return contracts;
    } catch (error) {
      throw new Error(
        `Failed to parse Solidity AST: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Parse raw Solidity source code (requires solc compilation first)
   */
  async parseSourceCode(_solidityCode: string): Promise<ContractAnalysis[]> {
    // In production, would call solc compiler first:
    // const solc = require('solc');
    // const output = solc.compile(JSON.stringify({
    //   language: 'Solidity',
    //   sources: { 'Contract.sol': { content: solidityCode } },
    //   settings: {
    //     outputSelection: { '*': { '*': ['*'] } }
    //   }
    // }));
    // const ast = output.contracts['Contract.sol'].AST;

    // For now, throw an error indicating solc compilation needed
    throw new Error(
      "Direct source code parsing requires solc compilation. Use parseAST() with pre-compiled JSON output."
    );
  }

  /**
   * Analyze a single contract from AST
   */
  private analyzeContract(contractNode: ContractNode): ContractAnalysis {
    const functions: FunctionAnalysis[] = [];
    const stateVariables: StateVariable[] = [];
    const events: EventAnalysis[] = [];
    const modifiers: ModifierAnalysis[] = [];
    let sloc = 0;

    for (const node of contractNode.nodes) {
      switch (node.nodeType) {
        case "FunctionDefinition":
          functions.push(this.analyzeFunction(node as FunctionNode));
          break;

        case "VariableDeclaration": {
          const varNode = node as VariableNode;
          if (varNode.stateVariable) {
            stateVariables.push(this.analyzeStateVariable(varNode));
          }
          break;
        }

        case "EventDefinition":
          events.push(this.analyzeEvent(node as EventNode));
          break;

        case "ModifierDefinition":
          modifiers.push(this.analyzeModifier(node as ModifierNode));
          break;
      }
    }

    // Calculate source lines of code
    sloc = this.getLineCount(contractNode.src);

    const baseName =
      contractNode.baseContracts && contractNode.baseContracts.length > 0
        ? contractNode.baseContracts[0].baseName
        : undefined;

    return {
      name: contractNode.name,
      baseName,
      functions,
      stateVariables,
      events,
      modifiers,
      isInterface: contractNode.contractKind === "interface",
      isLibrary: contractNode.contractKind === "library",
      isAbstract: contractNode.nodes.some(
        (n) =>
          n.nodeType === "FunctionDefinition" &&
          !(n as FunctionNode).body
      ),
      sloc,
    };
  }

  /**
   * Analyze a function from AST
   */
  private analyzeFunction(funcNode: FunctionNode): FunctionAnalysis {
    const params = this.parseParameters(funcNode.parameters);
    const returns = this.parseParameters(funcNode.returnParameters);
    const modifiers = funcNode.modifiers
      ? funcNode.modifiers.map((m: any) => m.modifierName || "")
      : [];

    const stateMutability = funcNode.stateMutability || "nonpayable";
    const visibility = funcNode.visibility || "internal";

    const complexity = this.calculateCyclomaticComplexity(funcNode.body);
    const lineInfo = this.getLineRange(funcNode.src);

    return {
      name: funcNode.name,
      isConstructor: funcNode.isConstructor || false,
      parameters: params,
      returnValues: returns,
      modifiers,
      isExternal: visibility === "external",
      isPublic: visibility === "public",
      isInternal: visibility === "internal",
      isPrivate: visibility === "private",
      isPure: stateMutability === "pure",
      isView: stateMutability === "view",
      isPayable: stateMutability === "payable",
      startLine: lineInfo.start,
      endLine: lineInfo.end,
      complexity,
    };
  }

  /**
   * Analyze state variable
   */
  private analyzeStateVariable(varNode: VariableNode): StateVariable {
    const typeInfo = this.parseTypeName(varNode.typeName);

    return {
      name: varNode.name,
      type: typeInfo.baseType,
      visibility: (varNode.visibility || "internal") as any,
      isConstant: varNode.constant || false,
      isImmutable: varNode.immutable || false,
      initialValue: undefined, // Would be extracted from initValue if present
    };
  }

  /**
   * Analyze event
   */
  private analyzeEvent(eventNode: EventNode): EventAnalysis {
    const params = this.parseParameters(eventNode.parameters);
    const lineInfo = this.getLineRange(eventNode.src);

    // Count indexed parameters
    const indexedCount = params.filter((p) => (p as any).isIndexed).length;

    return {
      name: eventNode.name,
      parameters: params,
      indexedCount,
      startLine: lineInfo.start,
      endLine: lineInfo.end,
    };
  }

  /**
   * Analyze modifier
   */
  private analyzeModifier(modNode: ModifierNode): ModifierAnalysis {
    const params = this.parseParameters(modNode.parameters);
    const lineInfo = this.getLineRange(modNode.src);

    return {
      name: modNode.name,
      parameters: params,
      startLine: lineInfo.start,
      endLine: lineInfo.end,
    };
  }

  /**
   * Parse function parameters
   */
  private parseParameters(paramsNode: FunctionParameters): Parameter[] {
    if (!paramsNode || !paramsNode.parameters) {
      return [];
    }

    return paramsNode.parameters.map((p) => {
      const typeInfo = this.parseTypeName(p.typeName);
      return {
        name: p.name || "",
        type: typeInfo.baseType,
        isArray: typeInfo.isArray,
        isMapping: typeInfo.isMapping,
        keyType: typeInfo.keyType,
        valueType: typeInfo.valueType,
      };
    });
  }

  /**
   * Parse type information from AST type nodes
   */
  private parseTypeName(
    typeNode: any
  ): {
    baseType: string;
    isArray: boolean;
    isMapping: boolean;
    keyType?: string;
    valueType?: string;
  } {
    if (!typeNode) {
      return { baseType: "unknown", isArray: false, isMapping: false };
    }

    if (typeNode.nodeType === "ArrayTypeName") {
      const baseType = this.parseTypeName(typeNode.baseType);
      return {
        ...baseType,
        isArray: true,
        baseType: baseType.baseType + "[]",
      };
    }

    if (typeNode.nodeType === "Mapping") {
      return {
        baseType: "mapping",
        isArray: false,
        isMapping: true,
        keyType: this.parseTypeName(typeNode.keyType).baseType,
        valueType: this.parseTypeName(typeNode.valueType).baseType,
      };
    }

    return {
      baseType: typeNode.name || "unknown",
      isArray: false,
      isMapping: false,
    };
  }

  /**
   * Calculate cyclomatic complexity
   */
  private calculateCyclomaticComplexity(bodyNode: ASTNode): number {
    if (!bodyNode) return 1;

    let complexity = 1; // Base complexity

    // Count control flow statements
    const getComplexityIncrease = (node: ASTNode): number => {
      let inc = 0;
      switch (node.nodeType) {
        case "IfStatement":
        case "WhileStatement":
        case "ForStatement":
        case "DoWhileStatement":
          inc = 1;
          break;
        case "TryStatement":
          inc = 1; // count try as one decision point
          break;
      }
      return inc;
    };

    this.walkAST(bodyNode, (node: ASTNode) => {
      complexity += getComplexityIncrease(node);
    });

    return complexity;
  }

  /**
   * Get line range from source location string "start:length:fileId"
   */
  private getLineRange(
    _srcLocation: string
  ): { start: number; end: number } {
    // Source format: "start:length:file-index"
    // For now, simplified implementation
    return { start: 0, end: 0 };
  }

  /**
   * Get line count from source location
   */
  private getLineCount(_srcLocation: string): number {
    // Count lines from source string - simplified
    return 0;
  }

  /**
   * Walk AST tree
   */
  private walkAST(node: ASTNode, callback: (node: ASTNode) => void): void {
    if (!node) return;

    callback(node);

    // Recursively walk child nodes
    for (const key in node) {
      if (key === "nodeType" || key === "id" || key === "src") continue;

      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          if (typeof item === "object" && item !== null && "nodeType" in item) {
            this.walkAST(item as ASTNode, callback);
          }
        }
      } else if (typeof child === "object" && child !== null && "nodeType" in child) {
        this.walkAST(child as ASTNode, callback);
      }
    }
  }
}
