/**
 * GAS COST ANALYSIS MODULE
 * 
 * Analyzes and estimates gas costs for smart contract operations.
 * Identifies inefficient patterns and optimization opportunities.
 * 
 * Design principles:
 * - Per-opcode and per-function gas estimation
 * - Detect expensive operations (SSTORE, CALL, etc.)
 * - Identify optimization opportunities
 * - Profile different execution paths
 * - Support EIP-1559 dynamic fees
 * 
 * Usage:
 *   const analyzer = new GasAnalyzer();
 *   const report = analyzer.analyzeGasCosts(bytecode);
 *   const opts = analyzer.findOptimizations(code);
 */

import { Opcode } from "./bytecode-analyzer";

/**
 * Gas cost for an operation
 */
export interface GasOperation {
  opcode: string;
  baseCost: number;
  dynamicCost?: number; // Additional cost based on context
  totalCost: number;
  frequency: number; // How many times this operation occurs
}

/**
 * Function gas profile
 */
export interface FunctionGasProfile {
  name: string;
  minGas: number; // Minimum gas for execution
  maxGas: number; // Maximum gas (worst case)
  avgGas: number; // Average estimated gas
  costBreakdown: Map<string, GasOperation>;
  hotspots: {
    opcode: string;
    frequency: number;
    totalCost: number;
  }[];
  complexity: "low" | "medium" | "high" | "critical";
}

/**
 * Optimization opportunity
 */
export interface GasOptimization {
  type: "storage" | "computation" | "external-call" | "loop" | "conditional";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  location: {
    lineNumber?: number;
    functionName?: string;
  };
  estimatedSavings: number; // Gas units that could be saved
  recommendation: string;
}

/**
 * Complete gas analysis report
 */
export interface GasAnalysisReport {
  totalContractGas: number;
  functions: FunctionGasProfile[];
  optimizations: GasOptimization[];
  hotspots: Array<{
    function: string;
    operation: string;
    frequency: number;
    totalCost: number;
  }>;
  riskLevel: "low" | "medium" | "high" | "critical";
}

/**
 * Gas prices for different operations (EIP-1559 post-London fork)
 */
const GAS_PRICES: Record<string, number> = {
  // Arithmetic (3 gas)
  ADD: 3,
  SUB: 3,
  LT: 3,
  GT: 3,
  EQ: 3,
  ISZERO: 3,
  AND: 3,
  OR: 3,
  XOR: 3,
  NOT: 3,
  BYTE: 3,
  SHL: 3,
  SHR: 3,
  SAR: 3,

  // More expensive arithmetic
  MUL: 5,
  DIV: 5,
  SDIV: 5,
  MOD: 5,
  SMOD: 5,
  ADDMOD: 8,
  MULMOD: 8,
  EXP: 10,
  SIGNEXTEND: 5,

  // Hashing
  KECCAK256: 30,

  // Memory operations (3 gas)
  MLOAD: 3,
  MSTORE: 3,
  MSTORE8: 3,

  // Storage (expensive!)
  SLOAD: 2100, // Cold, 100 warm
  SSTORE: 20000, // Cold, 2900 warm, 0 refund

  // Control flow
  JUMP: 8,
  JUMPI: 10,
  JUMPDEST: 1,
  PC: 2,
  MSIZE: 2,
  GAS: 2,

  // Stack
  POP: 2,
  DUP1: 3,
  SWAP1: 3,

  // Environment
  ADDRESS: 2,
  BALANCE: 100,
  ORIGIN: 2,
  CALLER: 2,
  CALLVALUE: 2,
  CALLDATALOAD: 3,
  CALLDATASIZE: 2,
  CALLDATACOPY: 3,
  CODESIZE: 2,
  CODECOPY: 3,
  GASPRICE: 2,
  EXTCODESIZE: 2600, // Cold, 100 warm
  EXTCODECOPY: 2600,
  EXTCODEHASH: 2600,
  RETURNDATASIZE: 2,
  RETURNDATACOPY: 3,

  // Block info
  BLOCKHASH: 20,
  COINBASE: 2,
  TIMESTAMP: 2,
  NUMBER: 2,
  DIFFICULTY: 2,
  GASLIMIT: 2,
  CHAINID: 2,
  SELFBALANCE: 5,
  BASEFEE: 2,

  // External calls (very expensive!)
  CALL: 700, // Cold, 100 warm
  CALLCODE: 700,
  DELEGATECALL: 700,
  STATICCALL: 700,
  CREATE: 32000,
  CREATE2: 32000,

  // Logging
  LOG0: 375,
  LOG1: 750,
  LOG2: 1125,
  LOG3: 1500,
  LOG4: 1875,

  // Termination
  RETURN: 0,
  REVERT: 0,
  SELFDESTRUCT: 5000,
  STOP: 0,
};

/**
 * Analyzes gas costs in smart contracts
 */
export class GasAnalyzer {
  /**
   * Analyze gas costs for bytecode operations
   */
  analyzeBytecodeCosts(opcodes: Opcode[]): GasAnalysisReport {
    const functions = new Map<string, FunctionGasProfile>();
    const costBreakdown = new Map<string, GasOperation>();

    // Count opcodes and calculate gas
    let totalGas = 0;
    for (const opcode of opcodes) {
      const baseCost = GAS_PRICES[opcode.name] || 3; // Default to 3 if unknown

      const existing = costBreakdown.get(opcode.name) || {
        opcode: opcode.name,
        baseCost,
        frequency: 0,
        totalCost: 0,
      };

      existing.frequency++;
      existing.totalCost = existing.baseCost * existing.frequency;
      costBreakdown.set(opcode.name, existing);

      totalGas += baseCost;
    }

    // Create default function profile (no function extraction from bytecode)
    const defaultProfile: FunctionGasProfile = {
      name: "contract_execution",
      minGas: totalGas,
      maxGas: totalGas,
      avgGas: totalGas,
      costBreakdown,
      hotspots: this.findHotspots(costBreakdown),
      complexity: this.assessComplexity(totalGas),
    };

    functions.set("contract_execution", defaultProfile);

    // Find optimizations
    const optimizations = this.identifyOptimizations(costBreakdown, opcodes);

    // Build hotspots list
    const hotspots = Array.from(costBreakdown.values())
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5)
      .map((op) => ({
        function: "contract_execution",
        operation: op.opcode,
        frequency: op.frequency,
        totalCost: op.totalCost,
      }));

    // Assess risk
    const riskLevel = this.assessRiskLevel(totalGas, optimizations.length);

    return {
      totalContractGas: totalGas,
      functions: Array.from(functions.values()),
      optimizations,
      hotspots,
      riskLevel,
    };
  }

  /**
   * Analyze gas costs from source code
   */
  analyzeSourceCodeGas(code: string): GasAnalysisReport {
    const optimizations = this.analyzeSourcePatterns(code);

    return {
      totalContractGas: 0, // Would need to compile and analyze bytecode
      functions: [],
      optimizations,
      hotspots: [],
      riskLevel: optimizations.length > 5 ? "high" : "medium",
    };
  }

  /**
   * Find hotspot operations (most expensive)
   */
  private findHotspots(
    costBreakdown: Map<string, GasOperation>
  ): Array<{ opcode: string; frequency: number; totalCost: number }> {
    return Array.from(costBreakdown.values())
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5)
      .map((op) => ({
        opcode: op.opcode,
        frequency: op.frequency,
        totalCost: op.totalCost,
      }));
  }

  /**
   * Assess complexity level
   */
  private assessComplexity(
    totalGas: number
  ): "low" | "medium" | "high" | "critical" {
    if (totalGas < 5000) return "low";
    if (totalGas < 50000) return "medium";
    if (totalGas < 500000) return "high";
    return "critical";
  }

  /**
   * Identify optimization opportunities from bytecode
   */
  private identifyOptimizations(
    costBreakdown: Map<string, GasOperation>,
    _opcodes: Opcode[]
  ): GasOptimization[] {
    const optimizations: GasOptimization[] = [];

    // Check for multiple SSTOREs to same slot
    const xstoreOps = costBreakdown.get("SSTORE");
    if (xstoreOps && xstoreOps.frequency > 5) {
      optimizations.push({
        type: "storage",
        severity: "high",
        description: "Multiple SSTORE operations detected",
        location: { functionName: "unknown" },
        estimatedSavings: xstoreOps.frequency * 18000, // Save on cold access
        recommendation:
          "Consider using temporary memory variables to batch storage updates",
      });
    }

    // Check for external calls
    const callOps = Array.from(costBreakdown.keys()).filter(
      (op) => op.includes("CALL") || op.includes("CREATE")
    );
    if (callOps.length > 0) {
      optimizations.push({
        type: "external-call",
        severity: "high",
        description: "External contract calls detected",
        location: { functionName: "unknown" },
        estimatedSavings: 600, // Warm call cost savings
        recommendation: "Validate necessity of all external calls",
      });
    }

    // Check for loops (via JUMPI frequency)
    const jumpiOps = costBreakdown.get("JUMPI");
    if (jumpiOps && jumpiOps.frequency > 10) {
      optimizations.push({
        type: "loop",
        severity: "medium",
        description: "Potential loop with many iterations",
        location: { functionName: "unknown" },
        estimatedSavings: jumpiOps.frequency * 2,
        recommendation:
          "Consider using iteration limits or batch processing",
      });
    }

    // Check for expensive operations
    const expensiveOps = ["EXP", "MULMOD", "ADDMOD"];
    for (const op of expensiveOps) {
      if (costBreakdown.has(op)) {
        optimizations.push({
          type: "computation",
          severity: "medium",
          description: `Expensive operation: ${op}`,
          location: { functionName: "unknown" },
          estimatedSavings: 5,
          recommendation: `Review necessity of ${op} operation`,
        });
      }
    }

    return optimizations;
  }

  /**
   * Analyze gas patterns in source code
   */
  private analyzeSourcePatterns(code: string): GasOptimization[] {
    const optimizations: GasOptimization[] = [];

    // Check for common gas anti-patterns
    const patterns = [
      {
        regex: /for\s*\([^)]*<\s*\w+\.length\s*;\s*[^)]*\+\+\s*\)/g,
        type: "loop" as const,
        description: "Loop with array length in condition (reads length each iteration)",
        savings: 2100,
        recommendation:
          "Cache array.length before loop: uint len = array.length;",
      },
      {
        regex: /state_var\s*=/g,
        type: "storage" as const,
        description: "Frequent state variable updates",
        savings: 17900,
        recommendation:
          "Use local variables, then update state variable once",
      },
      {
        regex: /\.call\{.*?\}/g,
        type: "external-call" as const,
        description: "External function call",
        savings: 600,
        recommendation: "Evaluate if external call is necessary",
      },
      {
        regex: /require\([^,]+,\s*['"][^'"]+['"]\)/g,
        type: "computation" as const,
        description: "Require with string message",
        savings: 0,
        recommendation: "Use error codes (Solidity 0.8.4+) instead of strings",
      },
    ];

    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of patterns) {
        if (pattern.regex.test(line)) {
          optimizations.push({
            type: pattern.type,
            severity: "medium",
            description: pattern.description,
            location: { lineNumber: i + 1 },
            estimatedSavings: pattern.savings,
            recommendation: pattern.recommendation,
          });
        }
      }
    }

    return optimizations;
  }

  /**
   * Assess risk level based on gas usage
   */
  private assessRiskLevel(
    totalGas: number,
    optimizationCount: number
  ): "low" | "medium" | "high" | "critical" {
    // Block gas limit on Ethereum is ~30M
    // Most functions should be < 3M
    if (totalGas > 10000000) return "critical";
    if (totalGas > 3000000) return "high";
    if (optimizationCount > 10) return "high";
    if (optimizationCount > 5) return "medium";
    return "low";
  }

  /**
   * Calculate transaction cost (gas * gwei)
   */
  calculateTransactionCost(
    gasUsed: number,
    gasPriceGwei: number = 20 // Default to 20 gwei
  ): {
    gasUsed: number;
    gasPrice: number;
    totalWei: bigint;
    totalEth: number;
  } {
    const gasPrice = BigInt(gasPriceGwei) * BigInt(1_000_000_000); // Convert gwei to wei
    const totalWei = BigInt(gasUsed) * gasPrice;
    const totalEth = Number(totalWei) / 1_000_000_000_000_000_000;

    return {
      gasUsed,
      gasPrice: gasPriceGwei,
      totalWei,
      totalEth,
    };
  }

  /**
   * Estimate gas for EIP-1559 transactions
   */
  estimateEIP1559Gas(
    gasUsed: number,
    baseFeeGwei: number,
    priorityFeeGwei: number
  ): {
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
    totalCost: {
      best: number;
      worst: number;
    };
  } {
    const maxFeePerGas = baseFeeGwei + priorityFeeGwei;
    const maxPriorityFeePerGas = priorityFeeGwei;

    // Best case: transaction mines at base fee
    const bestCostWei = BigInt(gasUsed) * BigInt(baseFeeGwei) * BigInt(1_000_000_000);
    const bestCostEth = Number(bestCostWei) / 1_000_000_000_000_000_000;

    // Worst case: transaction mines at max fee
    const worstCostWei = BigInt(gasUsed) * BigInt(maxFeePerGas) * BigInt(1_000_000_000);
    const worstCostEth = Number(worstCostWei) / 1_000_000_000_000_000_000;

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
      totalCost: {
        best: bestCostEth,
        worst: worstCostEth,
      },
    };
  }
}
