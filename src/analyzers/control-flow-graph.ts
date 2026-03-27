/**
 * CONTROL FLOW GRAPH (CFG) BUILDER
 * 
 * Constructs control flow graphs from smart contract code.
 * Traces execution paths, identifies loops and branches.
 * 
 * Design principles:
 * - Build CFG from AST or bytecode
 * - Identify basic blocks and edges
 * - Find cycles and deeply nested conditions
 * - Detect unreachable code
 * - Foundation for path analysis
 * 
 * Usage:
 *   const builder = new CFGBuilder();
 *   const cfg = builder.buildFromCode(solidityCode);
 *   const paths = builder.findExecutionPaths(cfg);
 *   const cycles = builder.detectCycles(cfg);
 */

/**
 * Basic block in control flow
 */
export interface BasicBlock {
  id: string;
  label: string;
  statements: Statement[];
  successors: string[]; // Block IDs of successor blocks
  predecessors: string[]; // Block IDs of predecessor blocks
}

/**
 * Statement representation
 */
export interface Statement {
  type: "assignment" | "call" | "condition" | "return" | "revert" | "throw";
  code: string;
  lineNumber: number;
  variables?: {
    read: string[]; // Variables read
    written: string[]; // Variables written
  };
}

/**
 * Execution path through CFG
 */
export interface ExecutionPath {
  id: string;
  blocks: string[]; // Sequence of block IDs
  conditions: string[]; // Conditions encountered
  complexity: number; // Path complexity score
}

/**
 * Control flow cycle
 */
export interface Cycle {
  id: string;
  blocks: string[]; // Blocks in cycle
  entries: string[]; // How to enter the cycle
  exits: string[]; // How to exit the cycle
  isCritical: boolean; // Risk assessment
}

/**
 * Complete control flow graph
 */
export interface ControlFlowGraph {
  name: string;
  blocks: Map<string, BasicBlock>;
  entryBlock: string;
  exitBlocks: string[];
  paths: ExecutionPath[];
  cycles: Cycle[];
  complexity: {
    cyclomatic: number;
    essential: number;
    cognitive: number;
  };
}

/**
 * Builds control flow graphs from smart contract code
 */
export class CFGBuilder {
  private blockCounter = 0;
  private pathCounter = 0;
  private cycleCounter = 0;

  /**
   * Build CFG from Solidity source code
   */
  buildFromCode(code: string): ControlFlowGraph {
    const blocks = new Map<string, BasicBlock>();

    // Parse functions from code
    const functions = this.extractFunctions(code);

    if (functions.length === 0) {
      return {
        name: "empty",
        blocks,
        entryBlock: "",
        exitBlocks: [],
        paths: [],
        cycles: [],
        complexity: { cyclomatic: 0, essential: 0, cognitive: 0 },
      };
    }

    // Build CFG for first function (main analysis target)
    const func = functions[0];
    const entryBlockId = this.createBlockId();
    const blocks_ = new Map<string, BasicBlock>();

    // Create entry block
    const entryBlock: BasicBlock = {
      id: entryBlockId,
      label: `${func.name}_entry`,
      statements: [],
      successors: [],
      predecessors: [],
    };
    blocks_.set(entryBlockId, entryBlock);

    // Parse function body into blocks
    const bodyBlocks = this.parseBlocksFromCode(func.body);
    for (const block of bodyBlocks) {
      blocks_.set(block.id, block);
    }

    // Connect blocks
    this.connectBlocks(blocks_, entryBlockId, bodyBlocks);

    // Find exit blocks
    const exitBlocks: string[] = [];
    for (const [blockId, block] of blocks_) {
      if (
        block.successors.length === 0 ||
        block.statements.some((s) => s.type === "return" || s.type === "revert")
      ) {
        exitBlocks.push(blockId);
      }
    }

    // Analyze paths and cycles
    const paths = this.findAllExecutionPaths(blocks_, entryBlockId, exitBlocks);
    const cycles = this.detectCycles(blocks_, entryBlockId);

    // Calculate complexity metrics
    const complexity = this.calculateComplexity(
      blocks_,
      entryBlockId,
      cycles.length
    );

    return {
      name: func.name,
      blocks: blocks_,
      entryBlock: entryBlockId,
      exitBlocks,
      paths,
      cycles,
      complexity,
    };
  }

  /**
   * Find all execution paths through CFG
   */
  findAllExecutionPaths(
    blocks: Map<string, BasicBlock>,
    entryBlockId: string,
    exitBlockIds: string[]
  ): ExecutionPath[] {
    const paths: ExecutionPath[] = [];
    const visited = new Set<string>();

    const dfs = (blockId: string, path: string[]) => {
      if (visited.has(blockId) && path.length > 1) {
        return; // Avoid infinite loops, but allow revisiting in new paths
      }

      path.push(blockId);
      const block = blocks.get(blockId);

      if (!block) return;

      // Check if reached exit
      if (exitBlockIds.includes(blockId)) {
        const execPath: ExecutionPath = {
          id: `path-${this.pathCounter++}`,
          blocks: [...path],
          conditions: this.extractConditionsFromPath(blocks, path),
          complexity: path.length,
        };
        paths.push(execPath);
        path.pop();
        return;
      }

      // Explore successors
      for (const successorId of block.successors) {
        if (!path.includes(successorId) || path.length > 5) {
          // Limit path depth to prevent explosion
          dfs(successorId, path);
        }
      }

      path.pop();
    };

    // Reset visited set for each path exploration
    dfs(entryBlockId, []);

    // If no explicit exit blocks found, find terminal blocks
    if (paths.length === 0) {
      for (const [blockId, block] of blocks) {
        if (block.successors.length === 0) {
          paths.push({
            id: `path-${this.pathCounter++}`,
            blocks: [blockId],
            conditions: [],
            complexity: 1,
          });
        }
      }
    }

    return paths;
  }

  /**
   * Detect cycles in CFG
   */
  detectCycles(
    blocks: Map<string, BasicBlock>,
    entryBlockId: string
  ): Cycle[] {
    const cycles: Cycle[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (blockId: string, path: string[]): string[][] => {
      const cyclesFound: string[][] = [];

      visited.add(blockId);
      recursionStack.add(blockId);
      path.push(blockId);

      const block = blocks.get(blockId);
      if (!block) return cyclesFound;

      for (const successorId of block.successors) {
        if (recursionStack.has(successorId)) {
          // Found a cycle
          const cycleStart = path.indexOf(successorId);
          if (cycleStart >= 0) {
            cyclesFound.push([...path.slice(cycleStart), successorId]);
          }
        } else if (!visited.has(successorId)) {
          const subCycles = dfs(successorId, path);
          cyclesFound.push(...subCycles);
        }
      }

      path.pop();
      recursionStack.delete(blockId);

      return cyclesFound;
    };

    const cycleBlocks = dfs(entryBlockId, []);

    // Convert cycles to Cycle objects
    const seenCycles = new Set<string>();
    for (const cycle of cycleBlocks) {
      const cycleKey = cycle.sort().join(",");
      if (!seenCycles.has(cycleKey) && cycle.length > 1) {
        seenCycles.add(cycleKey);

        // Find entry and exit points
        const cycleSet = new Set(cycle);
        const entries: string[] = [];
        const exits: string[] = [];

        for (const blockId of cycle) {
          const block = blocks.get(blockId);
          if (!block) continue;

          // Check for predecessors outside cycle
          for (const predId of block.predecessors) {
            if (!cycleSet.has(predId)) {
              entries.push(predId);
            }
          }

          // Check for successors outside cycle
          for (const succId of block.successors) {
            if (!cycleSet.has(succId)) {
              exits.push(succId);
            }
          }
        }

        cycles.push({
          id: `cycle-${this.cycleCounter++}`,
          blocks: cycle,
          entries: [...new Set(entries)],
          exits: [...new Set(exits)],
          isCritical: cycle.length > 4, // Long cycles are more risky
        });
      }
    }

    return cycles;
  }

  /**
   * Calculate complexity metrics
   */
  private calculateComplexity(
    blocks: Map<string, BasicBlock>,
    entryBlockId: string,
    cycleCount: number
  ): { cyclomatic: number; essential: number; cognitive: number } {
    // Cyclomatic: 1 + number of decision points
    let decisions = 0;
    for (const block of blocks.values()) {
      decisions += block.successors.length > 1 ? 1 : 0;
    }

    const cyclomatic = decisions + 1;

    // Essential: based on nesting depth
    let maxDepth = 0;
    const visited = new Set<string>();

    const measureDepth = (blockId: string, depth: number): number => {
      if (visited.has(blockId)) return 0;
      visited.add(blockId);

      const block = blocks.get(blockId);
      if (!block) return depth;

      maxDepth = Math.max(maxDepth, depth);

      let maxSubDepth = depth;
      for (const succId of block.successors) {
        maxSubDepth = Math.max(maxSubDepth, measureDepth(succId, depth + 1));
      }

      return maxSubDepth;
    };

    measureDepth(entryBlockId, 0);
    const essential = Math.max(1, cyclomatic - cycleCount);

    // Cognitive: sum of decision nesting depth
    const cognitive = cyclomatic + cycleCount * 2;

    return { cyclomatic, essential, cognitive };
  }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private extractFunctions(
    code: string
  ): Array<{ name: string; body: string }> {
    const functions: Array<{ name: string; body: string }> = [];

    // Match function definitions
    const funcRegex = /function\s+(\w+)\s*\([^)]*\)\s*(?:public|private|internal|external)?\s*{([^}]+)}/g;
    let match;

    while ((match = funcRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        body: match[2] || "",
      });
    }

    return functions;
  }

  private parseBlocksFromCode(code: string): BasicBlock[] {
    const blocks: BasicBlock[] = [];
    const statements = code.split("\n").filter((s) => s.trim());

    let currentBlock: Statement[] = [];

    for (const line of statements) {
      const stmt = this.parseStatement(line);
      if (stmt) {
        currentBlock.push(stmt);

        // End block on control flow statements
        if (stmt.type === "condition" || stmt.type === "return" || stmt.type === "revert") {
          if (currentBlock.length > 0) {
            blocks.push({
              id: this.createBlockId(),
              label: `block_${blocks.length}`,
              statements: currentBlock,
              successors: [],
              predecessors: [],
            });
            currentBlock = [];
          }
        }
      }
    }

    if (currentBlock.length > 0) {
      blocks.push({
        id: this.createBlockId(),
        label: `block_${blocks.length}`,
        statements: currentBlock,
        successors: [],
        predecessors: [],
      });
    }

    return blocks;
  }

  private parseStatement(line: string): Statement | null {
    line = line.trim();
    if (!line) return null;

    if (line.includes("if ") || line.includes("?")) {
      return {
        type: "condition",
        code: line,
        lineNumber: 0,
      };
    } else if (line.includes("return")) {
      return {
        type: "return",
        code: line,
        lineNumber: 0,
      };
    } else if (line.includes("revert")) {
      return {
        type: "revert",
        code: line,
        lineNumber: 0,
      };
    } else if (line.includes("(")) {
      return {
        type: "call",
        code: line,
        lineNumber: 0,
      };
    } else {
      return {
        type: "assignment",
        code: line,
        lineNumber: 0,
      };
    }
  }

  private connectBlocks(
    blocks: Map<string, BasicBlock>,
    _entryBlockId: string,
    _bodyBlocks: BasicBlock[]
  ): void {
    const blockIds = Array.from(blocks.keys());

    for (let i = 0; i < blockIds.length - 1; i++) {
      const blockId = blockIds[i];
      const block = blocks.get(blockId);
      if (!block) continue;

      // Check last statement for conditional
      const lastStmt = block.statements[block.statements.length - 1];

      if (lastStmt?.type === "condition") {
        // Two successors: true and false branches
        if (i + 1 < blockIds.length) {
          block.successors.push(blockIds[i + 1]); // True branch
        }
        if (i + 2 < blockIds.length) {
          block.successors.push(blockIds[i + 2]); // False branch
        }
      } else if (lastStmt?.type !== "return" && lastStmt?.type !== "revert") {
        // Continue to next block
        if (i + 1 < blockIds.length) {
          block.successors.push(blockIds[i + 1]);
        }
      }
    }

    // Build predecessors
    for (const [blockId, block] of blocks) {
      for (const succId of block.successors) {
        const succBlock = blocks.get(succId);
        if (succBlock && !succBlock.predecessors.includes(blockId)) {
          succBlock.predecessors.push(blockId);
        }
      }
    }
  }

  private extractConditionsFromPath(
    blocks: Map<string, BasicBlock>,
    path: string[]
  ): string[] {
    const conditions: string[] = [];

    for (let i = 0; i < path.length; i++) {
      const blockId = path[i];
      const block = blocks.get(blockId);
      if (!block) continue;

      const lastStmt = block.statements[block.statements.length - 1];
      if (lastStmt?.type === "condition") {
        conditions.push(lastStmt.code);
      }
    }

    return conditions;
  }

  private createBlockId(): string {
    return `block-${this.blockCounter++}`;
  }
}
