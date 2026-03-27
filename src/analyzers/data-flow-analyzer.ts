/**
 * DATA FLOW ANALYSIS ENGINE
 * 
 * Tracks how values flow through smart contract code.
 * Detects tainted values, data dependencies, and information flow.
 * 
 * Design principles:
 * - Track value origins and destinations
 * - Identify tainted values (from untrusted sources)
 * - Build data dependency graphs
 * - Detect use-after-free patterns
 * - Foundation for vulnerability detection
 * 
 * Usage:
 *   const analyzer = new DataFlowAnalyzer();
 *   const defs = analyzer.findDefinitions(sourceCode);
 *   const uses = analyzer.findUses(sourceCode);
 *   const deps = analyzer.buildDependencyGraph(defs, uses);
 */

/**
 * Variable definition or assignment
 */
export interface Definition {
  id: string; // Unique identifier
  variableName: string;
  lineNumber: number;
  columnNumber: number;
  value?: string; // Expression that defines the variable
  tainted: boolean; // Comes from untrusted source
  sources: string[]; // Variables this depends on
}

/**
 * Variable use or reference
 */
export interface Use {
  id: string;
  variableName: string;
  lineNumber: number;
  columnNumber: number;
  context: "read" | "write" | "passed" | "returned"; // How it's used
  definitionId?: string; // Which definition this refers to (if traceable)
}

/**
 * Data dependency edge
 */
export interface DataDependency {
  from: Definition;
  to: Definition;
  weight: number; // Strength of dependency (0-1)
  indirect: boolean; // Goes through intermediate variables
}

/**
 * Taint information
 */
export interface TaintInfo {
  isTainted: boolean;
  sources: string[]; // Functions/addresses that introduced taint
  propagationPath: string[]; // Variable chain: x -> y -> z
  severity: "critical" | "high" | "medium" | "low"; // Risk level
}

/**
 * Data flow analysis result
 */
export interface DataFlowAnalysis {
  definitions: Map<string, Definition[]>; // Variable name -> definitions
  uses: Map<string, Use[]>; // Variable name -> uses
  dependencies: DataDependency[]; // All dependencies
  taintAnalysis: Map<string, TaintInfo>; // Variable -> taint info
  unreachableDefinitions: Definition[]; // Definitions with no uses
  unusedVariables: string[]; // Variables never used after definition
  aliases: Map<string, Set<string>>; // Variables that alias each other
}

/**
 * Data flow analyzer for smart contracts
 */
export class DataFlowAnalyzer {
  private untrustedSources = [
    "msg.sender",
    "tx.origin",
    "msg.value",
    "block.timestamp",
    "block.number",
    "block.difficulty",
    "external_call_result",
  ];

  /**
   * Find all variable definitions in code
   */
  findDefinitions(code: string): Definition[] {
    const definitions: Definition[] = [];
    const lines = code.split("\n");
    let defCounter = 0;

    // Regex patterns for various definition types
    const _patterns = [
      /^(\s*)(?:let|const|var)\s+(\w+)\s*=\s*(.+)/gm, // Variable declarations
      /^(\s*)(\w+)\s*=\s*(.+)/gm, // Assignments
      /^(\s*)function\s+(\w+)\s*\(/gm, // Function definitions
      /^(\s*)struct\s+(\w+)\s*{/gm, // Struct definitions
      /^(\s*)mapping\s*\(\s*\w+\s*=>\s*\w+\s*\)\s+(\w+)/gm, // State variables
    ];

    lines.forEach((line, lineIdx) => {
      // Simple pattern matching for definitions
      const assignMatch = line.match(/^\s*(\w+)\s*=/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const defId = `def-${defCounter++}`;

        definitions.push({
          id: defId,
          variableName: varName,
          lineNumber: lineIdx + 1,
          columnNumber: assignMatch.index || 0,
          value: line.trim(),
          tainted: this.isTaintedSource(line),
          sources: this.extractDependencies(line),
        });
      }

      // Function parameter definitions
      const funcMatch = line.match(/function\s+\w+\s*\(\s*([^)]*)\s*\)/);
      if (funcMatch && funcMatch[1]) {
        const params = funcMatch[1]
          .split(",")
          .map((p) => p.trim().split(/\s+/).pop());

        params.forEach((param: string | undefined) => {
          if (param) {
            definitions.push({
              id: `def-${defCounter++}`,
              variableName: param,
              lineNumber: lineIdx + 1,
              columnNumber: 0,
              tainted: this.isTaintedSource(param),
              sources: [],
            });
          }
        });
      }
    });

    return definitions;
  }

  /**
   * Find all variable uses in code
   */
  findUses(code: string): Use[] {
    const uses: Use[] = [];
    const lines = code.split("\n");
    let useCounter = 0;

    lines.forEach((line, lineIdx) => {
      // Find all identifiers
      const identifiers = line.match(/\b[a-zA-Z_]\w*\b/g) || [];

      // Filter out keywords and duplicates
      const keywords = new Set([
        "function",
        "if",
        "else",
        "for",
        "while",
        "return",
        "require",
        "assert",
        "revert",
        "uint",
        "address",
        "string",
        "bool",
        "bytes",
        "mapping",
        "public",
        "private",
        "internal",
        "external",
        "pure",
        "view",
        "payable",
        "const",
        "let",
        "var",
      ]);

      const seen = new Set<string>();
      for (const identifier of identifiers) {
        if (!keywords.has(identifier) && !seen.has(identifier)) {
          seen.add(identifier);

          // Determine context
          let context: "read" | "write" | "passed" | "returned" = "read";
          if (line.includes(`${identifier}(`)) {
            context = "passed";
          } else if (line.match(new RegExp(`^\\s*${identifier}\\s*=`))) {
            context = "write";
          } else if (line.includes(`return ${identifier}`)) {
            context = "returned";
          }

          uses.push({
            id: `use-${useCounter++}`,
            variableName: identifier,
            lineNumber: lineIdx + 1,
            columnNumber: line.indexOf(identifier),
            context,
          });
        }
      }
    });

    return uses;
  }

  /**
   * Build data dependency graph
   */
  buildDependencyGraph(
    definitions: Definition[],
    uses: Use[]
  ): DataDependency[] {
    const dependencies: DataDependency[] = [];

    // For each use, find which definitions it depends on
    for (const use of uses) {
      const relevantDefs = definitions.filter(
        (def) =>
          def.variableName === use.variableName && def.lineNumber < use.lineNumber
      );

      // Link to the most recent definition
      const lastDef = relevantDefs[relevantDefs.length - 1];
      if (lastDef) {
        // Find definitions that this definition depends on
        for (const source of lastDef.sources) {
          const sourceDefs = definitions.filter(
            (def) =>
              def.variableName === source && def.lineNumber < lastDef.lineNumber
          );

          if (sourceDefs.length > 0) {
            const lastSourceDef = sourceDefs[sourceDefs.length - 1];
            dependencies.push({
              from: lastSourceDef,
              to: lastDef,
              weight: 1.0,
              indirect: false,
            });
          }
        }
      }
    }

    // Compute indirect dependencies (transitive)
    const visited = new Set<string>();
    const computeIndirectDeps = (defId: string, depth = 0) => {
      if (depth > 10 || visited.has(defId)) return; // Prevent infinite recursion
      visited.add(defId);

      const directDeps = dependencies.filter((d) => d.to.id === defId);
      for (const dep of directDeps) {
        const indirectDeps = dependencies.filter(
          (d) => d.to.id === dep.from.id
        );
        for (const indirectDep of indirectDeps) {
          // Check if not already in dependencies
          if (
            !dependencies.some(
              (d) => d.from.id === indirectDep.from.id && d.to.id === defId
            )
          ) {
            // Find the definition object that matches defId
            const targetDef = definitions.find((d) => d.id === defId);
            if (targetDef) {
              dependencies.push({
                from: indirectDep.from,
                to: targetDef,
                weight: dep.weight * 0.8,
                indirect: true,
              });
            }
          }
        }
        computeIndirectDeps(dep.from.id, depth + 1);
      }
    };

    for (const def of definitions) {
      visited.clear();
      computeIndirectDeps(def.id);
    }

    return dependencies;
  }

  /**
   * Perform taint analysis
   */
  performTaintAnalysis(definitions: Definition[]): Map<string, TaintInfo> {
    const taintMap = new Map<string, TaintInfo>();

    // Initialize taint info for all definitions
    for (const def of definitions) {
      if (!taintMap.has(def.variableName)) {
        taintMap.set(def.variableName, {
          isTainted: false,
          sources: [],
          propagationPath: [],
          severity: "low",
        });
      }

      // Check if this definition is tainted
      if (def.tainted) {
        const taintInfo = taintMap.get(def.variableName)!;
        taintInfo.isTainted = true;
        taintInfo.sources.push(def.variableName);
        taintInfo.severity = this.calculateTaintSeverity(def);
      }

      // Propagate taint from dependencies
      for (const source of def.sources) {
        const sourceTaint = taintMap.get(source);
        if (sourceTaint?.isTainted) {
          const taintInfo = taintMap.get(def.variableName)!;
          taintInfo.isTainted = true;
          taintInfo.sources = [...new Set([...taintInfo.sources, ...sourceTaint.sources])];
          taintInfo.propagationPath.push(source);
          taintInfo.severity = this.calculateTaintSeverity(def);
        }
      }
    }

    return taintMap;
  }

  /**
   * Find unused variables
   */
  findUnusedVariables(
    definitions: Definition[],
    uses: Use[]
  ): string[] {
    const unused: string[] = [];
    const definedVars = new Set(definitions.map((d) => d.variableName));
    const usedVars = new Set(uses.map((u) => u.variableName));

    for (const varName of definedVars) {
      if (!usedVars.has(varName)) {
        unused.push(varName);
      }
    }

    return unused;
  }

  /**
   * Analyze complete data flow
   */
  analyzeDataFlow(code: string): DataFlowAnalysis {
    const definitions = this.findDefinitions(code);
    const uses = this.findUses(code);
    const dependencies = this.buildDependencyGraph(definitions, uses);
    const taintAnalysis = this.performTaintAnalysis(definitions);
    const unusedVariables = this.findUnusedVariables(definitions, uses);

    // Find unreachable definitions (dead code)
    const usedDefIds = new Set<string>();
    for (const use of uses) {
      const relevantDefs = definitions.filter(
        (def) =>
          def.variableName === use.variableName &&
          def.lineNumber < use.lineNumber
      );
      if (relevantDefs.length > 0) {
        usedDefIds.add(relevantDefs[relevantDefs.length - 1].id);
      }
    }
    const unreachableDefinitions = definitions.filter(
      (def) => !usedDefIds.has(def.id)
    );

    // Build definition map
    const defMap = new Map<string, Definition[]>();
    for (const def of definitions) {
      if (!defMap.has(def.variableName)) {
        defMap.set(def.variableName, []);
      }
      defMap.get(def.variableName)!.push(def);
    }

    // Build use map
    const useMap = new Map<string, Use[]>();
    for (const use of uses) {
      if (!useMap.has(use.variableName)) {
        useMap.set(use.variableName, []);
      }
      useMap.get(use.variableName)!.push(use);
    }

    // Find aliases (variables assigned to each other)
    const aliases = new Map<string, Set<string>>();
    for (const def of definitions) {
      if (def.sources.length === 1) {
        const source = def.sources[0];
        if (!aliases.has(def.variableName)) {
          aliases.set(def.variableName, new Set());
        }
        aliases.get(def.variableName)!.add(source);

        if (!aliases.has(source)) {
          aliases.set(source, new Set());
        }
        aliases.get(source)!.add(def.variableName);
      }
    }

    return {
      definitions: defMap,
      uses: useMap,
      dependencies,
      taintAnalysis,
      unreachableDefinitions,
      unusedVariables,
      aliases,
    };
  }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private isTaintedSource(code: string): boolean {
    return this.untrustedSources.some((source) => code.includes(source));
  }

  private extractDependencies(code: string): string[] {
    // Extract variable references from an expression
    const matches = code.match(/\b[a-zA-Z_]\w*\b/g) || [];
    const keywords = new Set([
      "function",
      "if",
      "else",
      "for",
      "while",
      "return",
      "uint",
      "address",
      "string",
      "bool",
      "bytes",
      "mapping",
    ]);

    return matches.filter((m) => !keywords.has(m) && m !== "true" && m !== "false");
  }

  private calculateTaintSeverity(
    def: Definition
  ): "critical" | "high" | "medium" | "low" {
    // Severity depends on how tainted variable is used
    if (def.variableName.includes("timestamp") || def.variableName.includes("block")) {
      return "medium";
    }
    if (def.variableName.includes("amount") || def.variableName.includes("balance")) {
      return "high";
    }
    if (
      def.variableName.includes("caller") ||
      def.variableName.includes("msg.sender")
    ) {
      return "critical";
    }
    return "low";
  }
}
