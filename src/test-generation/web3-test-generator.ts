/**
 * Web3 Contract Test Generator
 *
 * Generates test templates for Solidity contracts (Hardhat and Foundry).
 * Supports deployment tests, function tests, events, and gas estimates.
 */

/**
 * Contract function parameter
 */
export interface ContractParam {
  name: string;
  type: string;
  isPrimitive: boolean;
}

/**
 * Event emitted by contract
 */
export interface ContractEvent {
  name: string;
  parameters: ContractParam[];
}

/**
 * Solidity function definition
 */
export interface SolidityFunction {
  name: string;
  visibility: "public" | "private" | "internal" | "external";
  isPayable: boolean;
  params: ContractParam[];
  returns?: ContractParam[];
  description?: string;
}

/**
 * Smart contract metadata
 */
export interface SmartContractMetadata {
  name: string;
  symbol?: string;
  version?: string;
  functions: SolidityFunction[];
  events: ContractEvent[];
  stateVars?: Array<{ name: string; type: string }>;
}

/**
 * Web3 test generation framework
 */
export type Web3Framework = "hardhat" | "foundry";

/**
 * Web3 test generator
 */
export class Web3ContractTestGenerator {
  private contract: SmartContractMetadata;
  private framework: Web3Framework;

  /**
   * Create generator for contract with framework choice
   */
  constructor(contract: SmartContractMetadata, framework: Web3Framework = "hardhat") {
    this.contract = contract;
    this.framework = framework;
  }

  /**
   * Generate Hardhat test file
   */
  private generateHardhatTest(): string {
    const lines: string[] = [];

    lines.push(`import { expect } from "chai";`);
    lines.push(`import { ethers } from "hardhat";`);
    lines.push("");

    lines.push(`describe("${this.contract.name}", function () {`);
    lines.push(`  let contract: any;`);
    lines.push(`  let owner: any;`);
    lines.push(`  let addr1: any;`);
    lines.push("");

    // Fixture
    lines.push(`  beforeEach(async function () {`);
    lines.push(`    [owner, addr1] = await ethers.getSigners();`);
    lines.push(`    const ${this.contract.name} = await ethers.getContractFactory("${this.contract.name}");`);
    lines.push(`    contract = await ${this.contract.name}.deploy();`);
    lines.push(`    await contract.deployed();`);
    lines.push(`  });`);
    lines.push("");

    // Deployment test
    lines.push(`  it("Should deploy contract", async function () {`);
    lines.push(`    expect(contract.address).to.exist;`);
    lines.push(`  });`);
    lines.push("");

    // Function tests
    for (const fn of this.contract.functions) {
      if (fn.visibility === "public" || fn.visibility === "external") {
        lines.push(`  it("Should call ${fn.name}", async function () {`);
        lines.push(`    const result = await contract.${fn.name}(${this.generateParamCall(fn.params)});`);
        if (fn.returns && fn.returns.length > 0) {
          lines.push(`    expect(result).to.exist;`);
        }
        lines.push(`  });`);
        lines.push("");
      }
    }

    lines.push(`});`);

    return lines.join("\n");
  }

  /**
   * Generate Foundry test file (Solidity tests)
   */
  private generateFoundryTest(): string {
    const lines: string[] = [];

    lines.push(`// SPDX-License-Identifier: MIT`);
    lines.push(`pragma solidity ^0.8.0;`);
    lines.push("");

    lines.push(`import "forge-std/Test.sol";`);
    lines.push(`import "../src/${this.contract.name}.sol";`);
    lines.push("");

    lines.push(`contract ${this.contract.name}Test is Test {`);
    lines.push(`  ${this.contract.name} contract;`);
    lines.push("");

    // Fixture
    lines.push(`  function setUp() public {`);
    lines.push(`    contract = new ${this.contract.name}();`);
    lines.push(`  }`);
    lines.push("");

    // Deployment test
    lines.push(`  function test_Deploy() public {`);
    lines.push(`    assertNotEq(address(contract), address(0));`);
    lines.push(`  }`);
    lines.push("");

    // Function tests
    for (const fn of this.contract.functions) {
      if (fn.visibility === "public" || fn.visibility === "external") {
        lines.push(`  function test_${this.capitalize(fn.name)}() public {`);
        lines.push(`    contract.${fn.name}(${this.generateParamCall(fn.params)});`);
        lines.push(`  }`);
        lines.push("");
      }
    }

    lines.push(`}`);

    return lines.join("\n");
  }

  /**
   * Generate gas benchmark tests
   */
  private generateGasTests(): string[] {
    const tests: string[] = [];

    for (const fn of this.contract.functions) {
      if (fn.visibility === "public" || fn.visibility === "external") {
        const testName = this.framework === "hardhat" ? "hardhat" : "foundry";

        if (testName === "hardhat") {
          tests.push(
            `  it("Should measure gas for ${fn.name}", async function () {
    const tx = await contract.${fn.name}(${this.generateParamCall(fn.params)});
    const receipt = await tx.wait();
    console.log("Gas used: " + receipt.gasUsed);
    expect(receipt.gasUsed).to.be.a("number");
  });`
          );
        } else {
          tests.push(
            `  function test_GasMeasure_${this.capitalize(fn.name)}() public {
    // Foundry automatically tracks gas usage
    contract.${fn.name}(${this.generateParamCall(fn.params)});
  }`
          );
        }
      }
    }

    return tests;
  }

  /**
   * Generate complete test file
   */
  renderTestFile(): string {
    if (this.framework === "hardhat") {
      const baseTest = this.generateHardhatTest();
      const lines = baseTest.split("\n");

      // Insert gas tests before closing brace
      const gasTests = this.generateGasTests();
      lines.splice(lines.length - 1, 0, "", ...gasTests);

      return lines.join("\n");
    } else {
      const baseTest = this.generateFoundryTest();
      const lines = baseTest.split("\n");

      // Insert gas tests before closing brace
      const gasTests = this.generateGasTests();
      lines.splice(lines.length - 1, 0, "", ...gasTests);

      return lines.join("\n");
    }
  }

  /**
   * Generate event tests
   */
  generateEventTests(): string[] {
    const tests: string[] = [];

    for (const event of this.contract.events) {
      if (this.framework === "hardhat") {
        tests.push(
          `  it("Should emit ${event.name} event", async function () {
    await expect(contract.trigger${this.capitalize(event.name)}()).to.emit(contract, "${event.name}");
  });`
        );
      } else {
        tests.push(
          `  function test_Emit_${this.capitalize(event.name)}() public {
    vm.expectEmit(true, true, true, true);
    emit ${event.name}();
    contract.trigger${this.capitalize(event.name)}();
  }`
        );
      }
    }

    return tests;
  }

  /**
   * Helper: generate parameter call
   */
  private generateParamCall(params: ContractParam[]): string {
    if (params.length === 0) return "";

    return params
      .map((p) => {
        if (p.type === "address") return `address(this)`;
        if (p.type.includes("uint")) return "100";
        if (p.type === "bool") return "true";
        if (p.type === "string") return `"test"`;
        if (p.type.includes("[]")) return "[]";
        return "0";
      })
      .join(", ");
  }

  /**
   * Helper: capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get contract metadata
   */
  getContract(): SmartContractMetadata {
    return this.contract;
  }

  /**
   * Get selected framework
   */
  getFramework(): Web3Framework {
    return this.framework;
  }
}

/**
 * Create Web3 contract test generator
 */
export function createWeb3TestGenerator(
  contract: SmartContractMetadata,
  framework?: Web3Framework
): Web3ContractTestGenerator {
  return new Web3ContractTestGenerator(contract, framework);
}
