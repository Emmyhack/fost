/**
 * ANALYZERS MODULE EXPORTS
 * 
 * Smart contract analysis tools
 */

// ABI Parsing (existing)
export { parseABI } from "./abi-parser";
export type {
  ABI,
  ExtractedContract,
  ExtractedFunction as ExtractedABIFunction,
  ExtractedEvent,
  StateVariable as ABIStateVariable,
  Parameter as ABIParameter,
} from "./abi-parser";

// Solidity Source Parsing
export { SolidityParser } from "./solidity-parser";
export type {
  ContractAnalysis,
  FunctionAnalysis,
  Parameter,
  StateVariable,
  EventAnalysis,
  ModifierAnalysis,
} from "./solidity-parser";

// Bytecode Analysis
export { BytecodeAnalyzer } from "./bytecode-analyzer";
export type {
  Opcode,
  ExtractedFunction,
  BasicBlock,
  BytecodeAnalysis,
} from "./bytecode-analyzer";

// Control Flow Graph
export { CFGBuilder } from "./control-flow-graph";
export type {
  ControlFlowGraph,
  ExecutionPath,
  Cycle,
  BasicBlock as CFGBasicBlock,
  Statement,
} from "./control-flow-graph";

// Data Flow Analysis
export { DataFlowAnalyzer } from "./data-flow-analyzer";
export type {
  Definition,
  Use,
  DataDependency,
  TaintInfo,
  DataFlowAnalysis,
} from "./data-flow-analyzer";

// Gas Analysis
export { GasAnalyzer } from "./gas-analyzer";
export type {
  FunctionGasProfile,
  GasAnalysisReport,
  GasOptimization,
  GasOperation,
} from "./gas-analyzer";

// Vulnerability Detection
export { VulnerabilityDetector } from "./vulnerability-detector";
export type {
  Vulnerability,
  VulnerabilityReport,
  VulnerabilityCategory,
} from "./vulnerability-detector";
