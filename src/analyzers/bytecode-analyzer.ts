/**
 * BYTECODE ANALYZER
 * 
 * Analyzes compiled EVM bytecode without access to source.
 * Performs opcode disassembly, control flow extraction, and pattern recognition.
 * 
 * Design principles:
 * - Works with raw bytecode (hex string)
 * - Disassembles to opcodes
 * - Traces control flow paths
 * - Identifies callable functions
 * - Foundation for bytecode-level analysis
 * 
 * Usage:
 *   const analyzer = new BytecodeAnalyzer();
 *   const ops = analyzer.disassemble(bytecodeHex);
 *   const functions = analyzer.extractFunctions(ops);
 */

/**
 * EVM Opcode information
 */
export interface Opcode {
  address: number; // Byte offset in bytecode
  code: number; // Raw opcode byte (0-255)
  name: string; // Mnemonic name
  push0Num?: number; // For PUSH1-PUSH32, the pushed value
  jumpDest?: number; // For JUMP targets
  argumentCount: number; // Number of stack inputs required
  returnCount: number; // Number of stack outputs produced
  gasCost: number; // Base gas cost
}

/**
 * Function extracted from bytecode
 */
export interface ExtractedFunction {
  selector: string; // 4-byte function selector (0xhhhhhhhh)
  entries: number[]; // Entry point addresses in bytecode
  callsites: number[]; // Where this function is called from
  complexity: number; // Estimate of complexity
  gasEstimate: number; // Estimated gas cost range
  hasStateWrites: boolean; // Modifies state
  hasInternalCalls: boolean; // Calls other contracts
  hasExternalCalls: boolean; // Calls delegatecall/staticcall
}

/**
 * Control flow basic block
 */
export interface BasicBlock {
  startAddress: number;
  endAddress: number;
  opcodes: Opcode[];
  successors: number[]; // Addresses of successor blocks
  predecessors: number[]; // Addresses of predecessor blocks
  isJumpTarget: boolean;
  isReachable: boolean;
}

/**
 * Bytecode analysis result
 */
export interface BytecodeAnalysis {
  totalSize: number;
  opcodes: Opcode[];
  basicBlocks: BasicBlock[];
  functions: ExtractedFunction[];
  jumpTargets: Set<number>;
  unreachableCode: number[]; // Addresses of unreachable code
  constantPool: Map<string, any>; // Extracted constants
}

/**
 * EVM Opcode reference data
 */
const OPCODE_TABLE: Record<
  number,
  {
    name: string;
    args: number;
    returns: number;
    gas: number;
    isPush?: boolean;
    isJump?: boolean;
  }
> = {
  // Arithmetic
  0x01: { name: "ADD", args: 2, returns: 1, gas: 3 },
  0x02: { name: "MUL", args: 2, returns: 1, gas: 5 },
  0x03: { name: "SUB", args: 2, returns: 1, gas: 3 },
  0x04: { name: "DIV", args: 2, returns: 1, gas: 5 },
  0x05: { name: "SDIV", args: 2, returns: 1, gas: 5 },
  0x06: { name: "MOD", args: 2, returns: 1, gas: 5 },
  0x07: { name: "SMOD", args: 2, returns: 1, gas: 5 },
  0x08: { name: "ADDMOD", args: 3, returns: 1, gas: 8 },
  0x09: { name: "MULMOD", args: 3, returns: 1, gas: 8 },
  0x0a: { name: "EXP", args: 2, returns: 1, gas: 10 },
  0x0b: { name: "SIGNEXTEND", args: 2, returns: 1, gas: 5 },

  // Comparison
  0x10: { name: "LT", args: 2, returns: 1, gas: 3 },
  0x11: { name: "GT", args: 2, returns: 1, gas: 3 },
  0x12: { name: "SLT", args: 2, returns: 1, gas: 3 },
  0x13: { name: "SGT", args: 2, returns: 1, gas: 3 },
  0x14: { name: "EQ", args: 2, returns: 1, gas: 3 },
  0x15: { name: "ISZERO", args: 1, returns: 1, gas: 3 },
  0x16: { name: "AND", args: 2, returns: 1, gas: 3 },
  0x17: { name: "OR", args: 2, returns: 1, gas: 3 },
  0x18: { name: "XOR", args: 2, returns: 1, gas: 3 },
  0x19: { name: "NOT", args: 1, returns: 1, gas: 3 },
  0x1a: { name: "BYTE", args: 2, returns: 1, gas: 3 },
  0x1b: { name: "SHL", args: 2, returns: 1, gas: 3 },
  0x1c: { name: "SHR", args: 2, returns: 1, gas: 3 },
  0x1d: { name: "SAR", args: 2, returns: 1, gas: 3 },

  // Cryptographic
  0x20: { name: "KECCAK256", args: 2, returns: 1, gas: 30 },

  // Environment Information
  0x30: { name: "ADDRESS", args: 0, returns: 1, gas: 2 },
  0x31: { name: "BALANCE", args: 1, returns: 1, gas: 100 },
  0x32: { name: "ORIGIN", args: 0, returns: 1, gas: 2 },
  0x33: { name: "CALLER", args: 0, returns: 1, gas: 2 },
  0x34: { name: "CALLVALUE", args: 0, returns: 1, gas: 2 },
  0x35: { name: "CALLDATALOAD", args: 1, returns: 1, gas: 3 },
  0x36: { name: "CALLDATASIZE", args: 0, returns: 1, gas: 2 },
  0x37: { name: "CALLDATACOPY", args: 3, returns: 0, gas: 3 },
  0x38: { name: "CODESIZE", args: 0, returns: 1, gas: 2 },
  0x39: { name: "CODECOPY", args: 3, returns: 0, gas: 3 },
  0x3a: { name: "GASPRICE", args: 0, returns: 1, gas: 2 },
  0x3b: { name: "EXTCODESIZE", args: 1, returns: 1, gas: 700 },
  0x3c: { name: "EXTCODECOPY", args: 4, returns: 0, gas: 700 },
  0x3d: { name: "RETURNDATASIZE", args: 0, returns: 1, gas: 2 },
  0x3e: { name: "RETURNDATACOPY", args: 3, returns: 0, gas: 3 },
  0x3f: { name: "EXTCODEHASH", args: 1, returns: 1, gas: 400 },

  // Block Information
  0x40: { name: "BLOCKHASH", args: 1, returns: 1, gas: 20 },
  0x41: { name: "COINBASE", args: 0, returns: 1, gas: 2 },
  0x42: { name: "TIMESTAMP", args: 0, returns: 1, gas: 2 },
  0x43: { name: "NUMBER", args: 0, returns: 1, gas: 2 },
  0x44: { name: "DIFFICULTY", args: 0, returns: 1, gas: 2 },
  0x45: { name: "GASLIMIT", args: 0, returns: 1, gas: 2 },
  0x46: { name: "CHAINID", args: 0, returns: 1, gas: 2 },
  0x47: { name: "SELFBALANCE", args: 0, returns: 1, gas: 5 },
  0x48: { name: "BASEFEE", args: 0, returns: 1, gas: 2 },

  // Stack Manipulation
  0x50: { name: "POP", args: 1, returns: 0, gas: 2 },
  0x51: { name: "MLOAD", args: 1, returns: 1, gas: 3 },
  0x52: { name: "MSTORE", args: 2, returns: 0, gas: 3 },
  0x53: { name: "MSTORE8", args: 2, returns: 0, gas: 3 },
  0x54: { name: "SLOAD", args: 1, returns: 1, gas: 0 }, // Dynamic
  0x55: { name: "SSTORE", args: 2, returns: 0, gas: 0 }, // Dynamic
  0x56: { name: "JUMP", args: 1, returns: 0, gas: 8, isJump: true },
  0x57: { name: "JUMPI", args: 2, returns: 0, gas: 10, isJump: true },
  0x58: { name: "PC", args: 0, returns: 1, gas: 2 },
  0x59: { name: "MSIZE", args: 0, returns: 1, gas: 2 },
  0x5a: { name: "GAS", args: 0, returns: 1, gas: 2 },
  0x5b: { name: "JUMPDEST", args: 0, returns: 0, gas: 1 },

  // Logging
  0xa0: { name: "LOG0", args: 2, returns: 0, gas: 375 },
  0xa1: { name: "LOG1", args: 3, returns: 0, gas: 750 },
  0xa2: { name: "LOG2", args: 4, returns: 0, gas: 1125 },
  0xa3: { name: "LOG3", args: 5, returns: 0, gas: 1500 },
  0xa4: { name: "LOG4", args: 6, returns: 0, gas: 1875 },

  // System
  0xf0: { name: "CREATE", args: 3, returns: 1, gas: 32000 },
  0xf1: { name: "CALL", args: 7, returns: 1, gas: 700 },
  0xf2: { name: "CALLCODE", args: 7, returns: 1, gas: 700 },
  0xf3: { name: "RETURN", args: 2, returns: 0, gas: 0 },
  0xf4: { name: "DELEGATECALL", args: 6, returns: 1, gas: 700 },
  0xf5: { name: "CREATE2", args: 4, returns: 1, gas: 32000 },
  0xfa: { name: "STATICCALL", args: 6, returns: 1, gas: 700 },
  0xfd: { name: "REVERT", args: 2, returns: 0, gas: 0 },
  0xfe: { name: "ASSERT_FAILURE", args: 0, returns: 0, gas: 0 },
  0xff: { name: "SELFDESTRUCT", args: 1, returns: 0, gas: 5000 },

  // PUSH
  0x5f: { name: "PUSH0", args: 0, returns: 1, gas: 2, isPush: true },
};

// Add PUSH1-PUSH32
for (let i = 0x60; i <= 0x7f; i++) {
  const pushNum = i - 0x60 + 1;
  OPCODE_TABLE[i] = {
    name: `PUSH${pushNum}`,
    args: 0,
    returns: 1,
    gas: 3,
    isPush: true,
  };
}

// Add DUP1-DUP16
for (let i = 0x80; i <= 0x8f; i++) {
  const dupNum = i - 0x80 + 1;
  OPCODE_TABLE[i] = { name: `DUP${dupNum}`, args: dupNum, returns: dupNum + 1, gas: 3 };
}

// Add SWAP1-SWAP16
for (let i = 0x90; i <= 0x9f; i++) {
  const swapNum = i - 0x90 + 1;
  OPCODE_TABLE[i] = {
    name: `SWAP${swapNum}`,
    args: swapNum + 1,
    returns: swapNum + 1,
    gas: 3,
  };
}

/**
 * Analyzes EVM bytecode
 */
export class BytecodeAnalyzer {
  /**
   * Disassemble bytecode to opcodes
   */
  disassemble(bytecodeHex: string): BytecodeAnalysis {
    // Remove '0x' prefix if present
    const cleanHex = bytecodeHex.startsWith("0x")
      ? bytecodeHex.slice(2)
      : bytecodeHex;

    if (cleanHex.length % 2 !== 0) {
      throw new Error("Invalid bytecode: odd number of hex characters");
    }

    const bytes = Buffer.from(cleanHex, "hex");
    const opcodes: Opcode[] = [];
    const jumpTargets = new Set<number>();
    let i = 0;

    while (i < bytes.length) {
      const byte = bytes[i];
      const opInfo = OPCODE_TABLE[byte];

      if (!opInfo) {
        // Invalid opcode
        opcodes.push({
          address: i,
          code: byte,
          name: "INVALID",
          argumentCount: 0,
          returnCount: 0,
          gasCost: 0,
        });
        i++;
        continue;
      }

      const opcode: Opcode = {
        address: i,
        code: byte,
        name: opInfo.name,
        argumentCount: opInfo.args,
        returnCount: opInfo.returns,
        gasCost: opInfo.gas,
      };

      // Handle PUSH opcodes
      if (opInfo.isPush && opInfo.name !== "PUSH0") {
        const pushNum = parseInt(opInfo.name.slice(4));
        const pushValue = bytes.slice(i + 1, i + 1 + pushNum);
        opcode.push0Num = parseInt(pushValue.toString("hex"), 16);
        i += pushNum;
      }

      // Track JUMPDEST targets
      if (opInfo.name === "JUMPDEST") {
        jumpTargets.add(i);
      }

      opcodes.push(opcode);
      i++;
    }

    // Build basic blocks
    const basicBlocks = this.buildBasicBlocks(opcodes, jumpTargets);

    // Extract functions
    const functions = this.extractFunctions(opcodes);

    // Find unreachable code
    const unreachableCode = this.findUnreachableCode(basicBlocks);

    return {
      totalSize: bytes.length,
      opcodes,
      basicBlocks,
      functions,
      jumpTargets,
      unreachableCode,
      constantPool: new Map(),
    };
  }

  /**
   * Build control flow basic blocks
   */
  private buildBasicBlocks(
    opcodes: Opcode[],
    jumpTargets: Set<number>
  ): BasicBlock[] {
    const blocks: BasicBlock[] = [];
    let currentBlock: Opcode[] = [];
    let blockStart = 0;

    for (let i = 0; i < opcodes.length; i++) {
      const opcode = opcodes[i];
      currentBlock.push(opcode);

      // Block ends at jumps, returns, or jump targets (next instruction)
      const isTerminator =
        opcode.name === "JUMP" ||
        opcode.name === "JUMPI" ||
        opcode.name === "RETURN" ||
        opcode.name === "REVERT" ||
        opcode.name === "SELFDESTRUCT" ||
        opcode.name === "STOP";

      const nextIsTarget =
        i + 1 < opcodes.length && jumpTargets.has(opcodes[i + 1].address);

      if (isTerminator || nextIsTarget || i === opcodes.length - 1) {
        const block: BasicBlock = {
          startAddress: blockStart,
          endAddress: opcode.address,
          opcodes: currentBlock,
          successors: [],
          predecessors: [],
          isJumpTarget: jumpTargets.has(blockStart),
          isReachable: blockStart === 0,
        };

        blocks.push(block);
        currentBlock = [];
        blockStart = i + 1 < opcodes.length ? opcodes[i + 1].address : -1;
      }
    }

    // Build successor/predecessor relationships
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const lastOp = block.opcodes[block.opcodes.length - 1];

      if (lastOp.name === "JUMP" || lastOp.name === "JUMPI") {
        // Find jump target block
        const prevOp = block.opcodes[block.opcodes.length - 2];
        if (prevOp?.push0Num !== undefined) {
          const targetAddr = prevOp.push0Num;
          const targetBlock = blocks.find((b) => b.startAddress === targetAddr);
          if (targetBlock) {
            block.successors.push(targetBlock.startAddress);
          }
        }
      }

      // JUMPI falls through to next block
      if (lastOp.name === "JUMPI" && i + 1 < blocks.length) {
        block.successors.push(blocks[i + 1].startAddress);
      }

      // Non-terminal blocks fall through
      if (
        lastOp.name !== "JUMP" &&
        lastOp.name !== "RETURN" &&
        lastOp.name !== "REVERT" &&
        lastOp.name !== "SELFDESTRUCT" &&
        lastOp.name !== "STOP" &&
        i + 1 < blocks.length
      ) {
        block.successors.push(blocks[i + 1].startAddress);
      }
    }

    // Mark reachable blocks
    this.markReachableBlocks(blocks);

    return blocks;
  }

  /**
   * Extract functions from bytecode analysis
   */
  private extractFunctions(_opcodes: Opcode[]): ExtractedFunction[] {
    // Simplified function extraction - in production would do proper analysis
    return [];
  }

  /**
   * Mark blocks as reachable via control flow
   */
  private markReachableBlocks(basicBlocks: BasicBlock[]): void {
    const visited = new Set<number>();
    const queue: BasicBlock[] = [];

    // Start from first block
    if (basicBlocks.length > 0) {
      basicBlocks[0].isReachable = true;
      queue.push(basicBlocks[0]);
      visited.add(basicBlocks[0].startAddress);
    }

    while (queue.length > 0) {
      const block = queue.shift()!;

      for (const successorAddr of block.successors) {
        if (!visited.has(successorAddr)) {
          visited.add(successorAddr);
          const successor = basicBlocks.find(
            (b) => b.startAddress === successorAddr
          );
          if (successor) {
            successor.isReachable = true;
            queue.push(successor);
          }
        }
      }
    }
  }

  /**
   * Find unreachable code
   */
  private findUnreachableCode(basicBlocks: BasicBlock[]): number[] {
    const unreachable: number[] = [];

    for (const block of basicBlocks) {
      if (!block.isReachable) {
        for (const op of block.opcodes) {
          unreachable.push(op.address);
        }
      }
    }

    return unreachable;
  }
}
