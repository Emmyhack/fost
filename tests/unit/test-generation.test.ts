import { describe, it, expect, beforeEach } from "vitest";
import {
  UnitTestGenerator,
  createUnitTestGenerator,
  IntegrationTestGenerator,
  createIntegrationTestGenerator,
  Web3ContractTestGenerator,
  createWeb3TestGenerator,
  CiWorkflowGenerator,
  createCiWorkflowGenerator,
  VitestConfigGenerator,
  createVitestConfigGenerator,
} from "../../src/test-generation/index";

describe("Unit Test Generator", () => {
  let generator: UnitTestGenerator;

  beforeEach(() => {
    generator = createUnitTestGenerator("src/utils/helpers.ts");
  });

  it("should create unit test generator", () => {
    expect(generator).toBeDefined();
    expect(typeof generator.renderTestFile).toBe("function");
  });

  it("should add function signature", () => {
    generator.addFunctionSignature({
      name: "fetchUser",
      params: [{ name: "id", type: "string" }],
      returnType: "Promise<User>",
      isAsync: true,
    });

    const spec = generator.getTestSpecs();
    expect(spec).toBeDefined();
    expect(spec.testSuites.length).toBeGreaterThan(0);
  });

  it("should generate function tests", () => {
    generator.addFunctionSignature({
      name: "add",
      params: [
        { name: "a", type: "number" },
        { name: "b", type: "number" },
      ],
      returnType: "number",
      isAsync: false,
    });

    const testFile = generator.renderTestFile();
    expect(testFile).toContain("describe");
    expect(testFile).toContain("it(");
    expect(testFile).toBeTruthy();
  });

  it("should add class metadata", () => {
    generator.addClass({
      name: "UserService",
      constructor: undefined,
      methods: [
        {
          name: "getUser",
          params: [{ name: "id", type: "string" }],
          returnType: "Promise<User>",
          isAsync: true,
          isMethod: true,
        },
      ],
      properties: [],
    });

    const testFile = generator.renderTestFile();
    expect(testFile).toContain("UserService");
  });

  it("should include imports in generated test", () => {
    const testFile = generator.renderTestFile();
    expect(testFile).toContain("import");
    expect(testFile).toContain("describe");
    expect(testFile).toContain("it");
  });

  it("should handle multiple test suites", () => {
    generator.addFunctionSignature({
      name: "func1",
      params: [],
      returnType: "void",
      isAsync: false,
    });

    generator.addClass({
      name: "Class1",
      constructor: undefined,
      methods: [],
      properties: [],
    });

    const spec = generator.getTestSpecs();
    expect(spec.testSuites).toBeDefined();
  });
});

describe("Integration Test Generator", () => {
  let generator: IntegrationTestGenerator;

  beforeEach(() => {
    generator = createIntegrationTestGenerator("http://localhost:3000");
  });

  it("should create integration test generator", () => {
    expect(generator).toBeDefined();
    expect(typeof generator.renderTestFile).toBe("function");
  });

  it("should add API endpoint", () => {
    generator.addEndpoint({
      method: "GET",
      path: "/users",
      description: "fetch all users",
      responseBody: { users: [] },
    });

    const spec = generator.getTestSpec();
    expect(spec).toBeDefined();
    expect(spec.tests.length).toBeGreaterThan(0);
  });

  it("should generate MSW handlers", () => {
    generator.addEndpoint({
      method: "POST",
      path: "/users",
      description: "create user",
      requestBody: { name: "John" },
      responseBody: { id: "1", name: "John" },
      statusCode: 201,
    });

    const testFile = generator.renderTestFile();
    expect(testFile).toContain("http.post");
    expect(testFile).toContain("HttpResponse");
    expect(testFile).toContain("setupServer");
  });

  it("should generate test cases for endpoints", () => {
    generator.addEndpoint({
      method: "GET",
      path: "/users/1",
      description: "fetch single user",
      responseBody: { id: "1", name: "John" },
    });

    const testFile = generator.renderTestFile();
    expect(testFile).toContain("it(");
    expect(testFile).toContain("fetch");
  });

  it("should include error handling tests", () => {
    generator.addEndpoint({
      method: "DELETE",
      path: "/users/1",
      description: "delete user",
      responseBody: { success: true },
    });

    const testFile = generator.renderTestFile();
    expect(testFile).toContain("error");
  });

  it("should support multiple HTTP methods", () => {
    generator
      .addEndpoint({
        method: "GET",
        path: "/api/data",
        description: "get data",
        responseBody: { data: [] },
      })
      .addEndpoint({
        method: "POST",
        path: "/api/data",
        description: "create data",
        responseBody: { id: "new" },
      })
      .addEndpoint({
        method: "DELETE",
        path: "/api/data/1",
        description: "delete data",
        responseBody: { success: true },
      });

    const testFile = generator.renderTestFile();
    expect(testFile).toContain("http.get");
    expect(testFile).toContain("http.post");
    expect(testFile).toContain("http.delete");
  });

  it("should get all endpoints", () => {
    generator.addEndpoint({
      method: "GET",
      path: "/test",
      description: "test",
      responseBody: {},
    });

    const endpoints = generator.getEndpoints();
    expect(endpoints.length).toBe(1);
  });
});

describe("Web3 Contract Test Generator", () => {
  let generator: Web3ContractTestGenerator;

  beforeEach(() => {
    generator = createWeb3TestGenerator(
      {
        name: "Token",
        symbol: "TKN",
        functions: [
          {
            name: "transfer",
            visibility: "public",
            isPayable: false,
            params: [
              { name: "to", type: "address", isPrimitive: true },
              { name: "amount", type: "uint256", isPrimitive: true },
            ],
          },
        ],
        events: [],
      },
      "hardhat"
    );
  });

  it("should create Web3 test generator", () => {
    expect(generator).toBeDefined();
    expect(typeof generator.renderTestFile).toBe("function");
  });

  it("should generate Hardhat test file", () => {
    const testFile = generator.renderTestFile();
    expect(testFile).toContain("describe");
    expect(testFile).toContain("import");
    expect(testFile).toContain("ethers");
  });

  it("should include deployment test", () => {
    const testFile = generator.renderTestFile();
    expect(testFile).toContain("deploy");
  });

  it("should generate function tests", () => {
    const testFile = generator.renderTestFile();
    expect(testFile).toContain("transfer");
    expect(testFile).toContain("expect");
  });

  it("should support Foundry framework", () => {
    const foundryGen = createWeb3TestGenerator(
      {
        name: "Counter",
        functions: [
          {
            name: "increment",
            visibility: "public",
            isPayable: false,
            params: [],
          },
        ],
        events: [],
      },
      "foundry"
    );

    const testFile = foundryGen.renderTestFile();
    expect(testFile).toContain("pragma solidity");
    expect(testFile).toContain("forge-std");
  });

  it("should generate gas measurement tests", () => {
    const testFile = generator.renderTestFile();
    expect(testFile).toContain("gas");
  });

  it("should generate event tests", () => {
    const eventGen = createWeb3TestGenerator(
      {
        name: "EventEmitter",
        functions: [],
        events: [
          {
            name: "Transfer",
            parameters: [
              { name: "from", type: "address", isPrimitive: true },
              { name: "to", type: "address", isPrimitive: true },
            ],
          },
        ],
      },
      "hardhat"
    );

    const eventTests = eventGen.generateEventTests();
    expect(eventTests.length).toBeGreaterThan(0);
    expect(eventTests[0]).toContain("emit");
  });

  it("should handle multiple functions", () => {
    const multiGen = createWeb3TestGenerator(
      {
        name: "MultiFunc",
        functions: [
          {
            name: "func1",
            visibility: "public",
            isPayable: false,
            params: [],
          },
          {
            name: "func2",
            visibility: "public",
            isPayable: false,
            params: [],
          },
        ],
        events: [],
      },
      "hardhat"
    );

    const testFile = multiGen.renderTestFile();
    expect(testFile).toContain("func1");
    expect(testFile).toContain("func2");
  });
});

describe("CI Workflow Generator", () => {
  let generator: CiWorkflowGenerator;

  beforeEach(() => {
    generator = createCiWorkflowGenerator("CI");
  });

  it("should create CI workflow generator", () => {
    expect(generator).toBeDefined();
    expect(typeof generator.renderWorkflow).toBe("function");
  });

  it("should generate basic workflow", () => {
    const workflow = generator.renderWorkflow();
    expect(workflow).toContain("name: CI");
    expect(workflow).toContain("on:");
    expect(workflow).toContain("jobs:");
  });

  it("should include build job", () => {
    const workflow = generator.renderWorkflow();
    expect(workflow).toContain("build:");
    expect(workflow).toContain("npm run build");
  });

  it("should include test job", () => {
    const workflow = generator.renderWorkflow();
    expect(workflow).toContain("test:");
    expect(workflow).toContain("npm test");
  });

  it("should include lint job", () => {
    const workflow = generator.renderWorkflow();
    expect(workflow).toContain("lint:");
    expect(workflow).toContain("npm run lint");
  });

  it("should support publish job", () => {
    const workflow = generator.renderWorkflow(true);
    expect(workflow).toContain("publish:");
    expect(workflow).toContain("npm publish");
  });

  it("should support matrix testing", () => {
    const workflow = generator.renderWorkflow(false, true);
    expect(workflow).toContain("matrix:");
    expect(workflow).toContain("node-version");
  });

  it("should include codecov step", () => {
    const workflow = generator.renderWorkflow();
    expect(workflow).toContain("codecov");
  });

  it("should set Node versions", () => {
    generator.setNodeVersions(["16", "18", "20"]);
    const jobs = generator.generateAllJobs();
    expect(jobs.length).toBeGreaterThan(0);
  });

  it("should generate multiple jobs", () => {
    const jobs = generator.generateAllJobs();
    expect(jobs.length).toBe(4);
    expect(jobs.some((j) => j.id === "build")).toBe(true);
    expect(jobs.some((j) => j.id === "test")).toBe(true);
    expect(jobs.some((j) => j.id === "lint")).toBe(true);
    expect(jobs.some((j) => j.id === "publish")).toBe(true);
  });
});

describe("Vitest Config Generator", () => {
  let generator: VitestConfigGenerator;

  beforeEach(() => {
    generator = createVitestConfigGenerator();
  });

  it("should create Vitest config generator", () => {
    expect(generator).toBeDefined();
    expect(typeof generator.renderConfigFile).toBe("function");
  });

  it("should generate default config", () => {
    const config = generator.renderConfigFile();
    expect(config).toContain("defineConfig");
    expect(config).toContain("test:");
  });

  it("should set coverage thresholds", () => {
    generator.setCoverageThresholds({
      lines: 90,
      functions: 85,
      branches: 80,
      statements: 90,
    });

    const config = generator.renderConfigFile();
    expect(config).toContain("lines: 90");
    expect(config).toContain("functions: 85");
    expect(config).toContain("branches: 80");
  });

  it("should add reporters", () => {
    generator.addReporter({ name: "html", outputFile: "coverage/index.html" });

    const config = generator.renderConfigFile();
    expect(config).toContain("html");
  });

  it("should add setup files", () => {
    generator.addSetupFile("tests/setup.ts");

    const config = generator.renderConfigFile();
    expect(config).toContain("setupFiles");
    expect(config).toContain("tests/setup.ts");
  });

  it("should set test environment", () => {
    generator.setEnvironment("jsdom");

    const config = generator.renderConfigFile();
    expect(config).toContain("jsdom");
  });

  it("should enable globals", () => {
    generator.enableGlobals(true);

    const config = generator.renderConfigFile();
    expect(config).toContain("globals: true");
  });

  it("should render setup file template", () => {
    const setupFile = generator.renderSetupFile();
    expect(setupFile).toContain("beforeAll");
    expect(setupFile).toContain("afterAll");
  });

  it("should get coverage thresholds", () => {
    generator.setCoverageThresholds({ lines: 95 });
    const thresholds = generator.getCoverageThresholds();
    expect(thresholds.lines).toBe(95);
  });

  it("should get reporters", () => {
    generator.addReporter({ name: "default" });
    const reporters = generator.getReporters();
    expect(reporters.length).toBeGreaterThan(0);
  });

  it("should get environment", () => {
    generator.setEnvironment("node");
    expect(generator.getEnvironment()).toBe("node");
  });

  it("should generate config object", () => {
    const configObj = generator.generateConfigObject();
    expect(configObj.test).toBeDefined();
    expect(configObj.test.coverage).toBeDefined();
    expect(configObj.test.include).toBeDefined();
  });

  it("should include default exclusions", () => {
    const config = generator.renderConfigFile();
    expect(config).toContain("node_modules");
    expect(config).toContain("dist");
    expect(config).toContain("coverage");
  });
});

describe("Test Generation Module Integration", () => {
  it("should export all generators", () => {
    expect(createUnitTestGenerator).toBeDefined();
    expect(createIntegrationTestGenerator).toBeDefined();
    expect(createWeb3TestGenerator).toBeDefined();
    expect(createCiWorkflowGenerator).toBeDefined();
    expect(createVitestConfigGenerator).toBeDefined();
  });

  it("should chain generators in workflow", () => {
    const unitGen = createUnitTestGenerator("src/app.ts");
    const integrationGen = createIntegrationTestGenerator();
    const configGen = createVitestConfigGenerator();

    // Simulate workflow
    unitGen.addFunctionSignature({
      name: "testFunc",
      params: [],
      returnType: "void",
      isAsync: false,
    });

    integrationGen.addEndpoint({
      method: "GET",
      path: "/api/test",
      description: "test endpoint",
      responseBody: { test: true },
    });

    configGen.setCoverageThresholds({ lines: 85 });

    expect(unitGen.renderTestFile()).toBeTruthy();
    expect(integrationGen.renderTestFile()).toBeTruthy();
    expect(configGen.renderConfigFile()).toBeTruthy();
  });

  it("should support full test generation pipeline", () => {
    // Create all generators
    const unitGen = createUnitTestGenerator("src/lib.ts");
    const integrationGen = createIntegrationTestGenerator("http://api.example.com");
    const web3Gen = createWeb3TestGenerator(
      { name: "Sample", functions: [], events: [] },
      "hardhat"
    );
    const ciGen = createCiWorkflowGenerator("CD Pipeline");
    const configGen = createVitestConfigGenerator();

    // Configure all
    unitGen.addFunctionSignature({
      name: "sum",
      params: [
        { name: "a", type: "number" },
        { name: "b", type: "number" },
      ],
      returnType: "number",
      isAsync: false,
    });

    integrationGen.addEndpoint({
      method: "POST",
      path: "/api/calculate",
      description: "calculate endpoint",
      responseBody: { result: 42 },
    });

    configGen.setCoverageThresholds({ lines: 80, functions: 80 });

    // Render all
    const unitTest = unitGen.renderTestFile();
    const integrationTest = integrationGen.renderTestFile();
    const web3Test = web3Gen.renderTestFile();
    const ciWorkflow = ciGen.renderWorkflow(true, true);
    const config = configGen.renderConfigFile();

    // Verify all outputs
    expect(unitTest).toBeTruthy();
    expect(integrationTest).toBeTruthy();
    expect(web3Test).toBeTruthy();
    expect(ciWorkflow).toBeTruthy();
    expect(config).toBeTruthy();

    // Verify they contain expected content
    expect(unitTest).toContain("it(");
    expect(integrationTest).toContain("setupServer");
    expect(web3Test).toContain("describe");
    expect(ciWorkflow).toContain("jobs:");
    expect(config).toContain("defineConfig");
  });
});
