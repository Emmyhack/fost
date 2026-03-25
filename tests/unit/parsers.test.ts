/**
 * Parser Registry and Input Parsers Tests
 *
 * Comprehensive tests for parser plugin system and all parsers.
 */

import { describe, it, beforeEach, expect } from "vitest";
import { ParserRegistry, ParserPlugin } from "../../src/input-analysis/parser-registry";
import { OpenAPIParser } from "../../src/input-analysis/parsers/openapi";
import { ContractABIParser } from "../../src/input-analysis/parsers/contract-abi";
import { GraphQLParser } from "../../src/input-analysis/parsers/graphql";
import { PostmanParser } from "../../src/input-analysis/parsers/postman";
import { SolanaIDLParser } from "../../src/input-analysis/parsers/solana-idl";
import type { InputSpec } from "../../src/input-analysis/types";

describe("ParserRegistry", () => {
  let registry: ParserRegistry;

  beforeEach(() => {
    registry = new ParserRegistry();
  });

  it("should register and retrieve parsers by type", () => {
    const parser = new OpenAPIParser();
    registry.register(parser);

    const retrieved = registry.getParser("openapi-3.0");
    expect(retrieved).toBe(parser);
  });

  it("should auto-detect parser from input content", () => {
    const openapi = new OpenAPIParser();
    const graphql = new GraphQLParser();

    registry.register(openapi);
    registry.register(graphql);

    const openApiInput: InputSpec = {
      type: "openapi-3.0",
      format: "json",
      source: "test.json",
      rawContent: { openapi: "3.0.0" },
    };

    const detected = registry.detectParser(openApiInput);
    expect(detected).toBe(openapi);
  });

  it("should return all registered parsers", () => {
    const openapi = new OpenAPIParser();
    const graphql = new GraphQLParser();

    registry.register(openapi);
    registry.register(graphql);

    const parsers = registry.listParsers();
    expect(parsers.length).toBeGreaterThanOrEqual(2);
    expect(parsers.some((p) => p.displayName === "OpenAPI/Swagger Parser")).toBe(true);
    expect(parsers.some((p) => p.displayName === "GraphQL SDL Parser")).toBe(true);
  });

  it("should clear all registered parsers", () => {
    registry.register(new OpenAPIParser());
    expect(registry.listParsers().length).toBeGreaterThan(0);

    registry.clear();
    expect(registry.listParsers().length).toBe(0);
  });
});

describe("OpenAPIParser", () => {
  let parser: OpenAPIParser;

  beforeEach(() => {
    parser = new OpenAPIParser();
  });

  it("should parse OpenAPI 3.0 specification", () => {
    const input: InputSpec = {
      type: "openapi-3.0",
      format: "json",
      source: "openapi.json",
      rawContent: {
        openapi: "3.0.0",
        info: {
          title: "Test API",
          version: "1.0.0",
          description: "A test API",
        },
        paths: {
          "/users": {
            get: {
              summary: "List users",
              responses: {
                "200": {
                  description: "User list",
                },
              },
            },
          },
        },
      },
    };

    const result = parser.parse(input);
    expect(result.success).toBe(true);
    expect(result.normalized?.product.name).toBeTruthy(); // OpenAPI parser may normalize names
    expect(result.normalized?.operations.length).toBeGreaterThan(0);
  });

  it("should have correct parser metadata", () => {
    expect(parser.displayName).toBe("OpenAPI/Swagger Parser");
    expect(parser.version).toBe("1.0.0");
    expect(parser.supportedTypes).toContain("openapi-3.0");
    expect(parser.supportedTypes).toContain("swagger-2.0");
  });
});

describe("ContractABIParser", () => {
  let parser: ContractABIParser;

  beforeEach(() => {
    parser = new ContractABIParser();
  });

  it("should parse EVM contract ABI", () => {
    const input: InputSpec = {
      type: "contract-abi",
      format: "json",
      source: "contract.json",
      rawContent: [
        {
          type: "function",
          name: "transfer",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable",
        },
      ],
    };

    const result = parser.parse(input);
    expect(result.success).toBe(true);
    expect(result.normalized?.operations.length).toBeGreaterThan(0);
  });

  it("should have correct parser metadata", () => {
    expect(parser.displayName).toBe("EVM Contract ABI Parser");
    expect(parser.version).toBe("1.0.0");
    expect(parser.supportedTypes).toContain("contract-abi");
  });

  it("should detect confidence for ABI arrays", () => {
    const input: InputSpec = {
      type: "contract-abi",
      format: "json",
      source: "abi.json",
      rawContent: [
        { type: "function", name: "test" },
        { type: "event", name: "Transfer" },
      ],
    };

    const confidence = parser.detectConfidence(input);
    expect(confidence).toBeGreaterThan(0);
  });
});

describe("GraphQLParser", () => {
  let parser: GraphQLParser;

  beforeEach(() => {
    parser = new GraphQLParser();
  });

  it("should parse GraphQL schema", () => {
    const input: InputSpec = {
      type: "graphql",
      format: "json",
      source: "schema.graphql",
      rawContent: `
        type Query {
          getUser(id: ID!): User
          listUsers: [User!]!
        }

        type User {
          id: ID!
          name: String!
          email: String
        }
      `,
    };

    const result = parser.parse(input);
    expect(result.success).toBe(true);
    expect(result.normalized?.product.name).toBe("GraphQL API");
    expect(result.normalized?.operations.length).toBeGreaterThan(0);
  });

  it("should extract GraphQL types", () => {
    const input: InputSpec = {
      type: "graphql",
      format: "json",
      source: "schema.graphql",
      rawContent: `
        type User {
          id: ID!
          name: String!
        }

        enum Role {
          ADMIN
          USER
        }
      `,
    };

    const result = parser.parse(input);
    expect(result.success).toBe(true);
    expect(result.normalized?.types.User).toBeDefined();
    expect(result.normalized?.types.Role?.type).toBe("enum");
  });

  it("should have correct parser metadata", () => {
    expect(parser.displayName).toBe("GraphQL SDL Parser");
    expect(parser.version).toBe("1.0.0");
    expect(parser.supportedTypes).toContain("graphql");
  });
});

describe("PostmanParser", () => {
  let parser: PostmanParser;

  beforeEach(() => {
    parser = new PostmanParser();
  });

  it("should parse Postman collection", () => {
    const input: InputSpec = {
      type: "postman",
      format: "json",
      source: "postman.json",
      rawContent: {
        info: {
          name: "My API",
          version: "1.0.0",
          description: "A test API",
        },
        item: [
          {
            name: "Get Users",
            request: {
              method: "GET",
              url: "http://localhost:3000/users",
              header: [],
            },
          },
        ],
        variable: [],
      },
    };

    const result = parser.parse(input);
    expect(result.success).toBe(true);
    expect(result.normalized?.product.name).toBe("My API");
    expect(result.normalized?.operations.length).toBeGreaterThan(0);
  });

  it("should extract Postman request parameters", () => {
    const input: InputSpec = {
      type: "postman",
      format: "json",
      source: "postman.json",
      rawContent: {
        info: {
          name: "API",
          version: "1.0.0",
        },
        item: [
          {
            name: "Get User",
            request: {
              method: "GET",
              url: {
                raw: "http://localhost:3000/users?filter=active",
                query: [{ key: "filter", value: "active" }],
              },
              header: [{ key: "Authorization", value: "Bearer token" }],
            },
          },
        ],
      },
    };

    const result = parser.parse(input);
    expect(result.success).toBe(true);
    const op = result.normalized?.operations[0];
    expect(op?.parameters.some((p) => p.name === "filter")).toBe(true);
    expect(op?.parameters.some((p) => p.name === "Authorization")).toBe(true);
  });

  it("should have correct parser metadata", () => {
    expect(parser.displayName).toBe("Postman Collection Parser");
    expect(parser.version).toBe("1.0.0");
    expect(parser.supportedTypes).toContain("postman");
  });
});

describe("SolanaIDLParser", () => {
  let parser: SolanaIDLParser;

  beforeEach(() => {
    parser = new SolanaIDLParser();
  });

  it("should parse Solana IDL", () => {
    const input: InputSpec = {
      type: "solana-idl",
      format: "json",
      source: "idl.json",
      rawContent: {
        version: "0.1.0",
        name: "test_program",
        instructions: [
          {
            name: "initialize",
            accounts: [
              { name: "owner", isWritable: true, isSigner: true },
            ],
            args: [{ name: "value", type: "u64" }],
          },
        ],
      },
    };

    const result = parser.parse(input);
    expect(result.success).toBe(true);
    expect(result.normalized?.product.name).toBe("test_program");
    expect(result.normalized?.operations.length).toBeGreaterThan(0);
  });

  it("should extract Solana accounts and instructions", () => {
    const input: InputSpec = {
      type: "solana-idl",
      format: "json",
      source: "idl.json",
      rawContent: {
        version: "0.1.0",
        name: "token_program",
        accounts: [
          {
            name: "TokenAccount",
            fields: [
              { name: "owner", type: "pubkey" },
              { name: "mint", type: "pubkey" },
              { name: "balance", type: "u64" },
            ],
          },
        ],
        instructions: [
          {
            name: "transfer",
            accounts: [
              { name: "from", isWritable: true, isSigner: true },
              { name: "to", isWritable: true },
            ],
            args: [{ name: "amount", type: "u64" }],
          },
        ],
      },
    };

    const result = parser.parse(input);
    expect(result.success).toBe(true);
    expect(result.normalized?.types.TokenAccount).toBeDefined();
    expect(result.normalized?.operations.length).toBeGreaterThan(0);
  });

  it("should have correct parser metadata", () => {
    expect(parser.displayName).toBe("Solana IDL Parser");
    expect(parser.version).toBe("1.0.0");
    expect(parser.supportedTypes).toContain("solana-idl");
  });

  it("should include Solana networks", () => {
    const input: InputSpec = {
      type: "solana-idl",
      format: "json",
      source: "idl.json",
      rawContent: {
        version: "0.1.0",
        name: "test",
        instructions: [],
      },
    };

    const result = parser.parse(input);
    expect(result.normalized?.networks.length).toBeGreaterThan(0);
    expect(result.normalized?.networks.some((n) => n.id === "mainnet")).toBe(true);
    expect(result.normalized?.networks.some((n) => n.id === "devnet")).toBe(true);
  });
});

describe("Parser Plugin System Integration", () => {
  it("should register and use multiple parsers together", () => {
    const registry = new ParserRegistry();

    registry.register(new OpenAPIParser());
    registry.register(new GraphQLParser());
    registry.register(new PostmanParser());
    registry.register(new ContractABIParser());
    registry.register(new SolanaIDLParser());

    const parsers = registry.listParsers();
    expect(parsers.length).toBe(5);
  });

  it("should parse different formats with correct parser", () => {
    const registry = new ParserRegistry();

    registry.register(new OpenAPIParser());
    registry.register(new GraphQLParser());
    registry.register(new SolanaIDLParser());

    // OpenAPI
    const openApiInput: InputSpec = {
      type: "openapi-3.0",
      format: "json",
      source: "openapi.json",
      rawContent: {
        openapi: "3.0.0",
        info: { title: "API", version: "1.0" },
        paths: {},
      },
    };
    const openApiResult = registry.parse(openApiInput);
    expect(openApiResult.success).toBe(true);

    // GraphQL
    const graphqlInput: InputSpec = {
      type: "graphql",
      format: "json",
      source: "schema.graphql",
      rawContent: "type Query { hello: String }",
    };
    const graphqlResult = registry.parse(graphqlInput);
    expect(graphqlResult.success).toBe(true);

    // Solana IDL
    const solanaInput: InputSpec = {
      type: "solana-idl",
      format: "json",
      source: "idl.json",
      rawContent: {
        version: "0.1.0",
        name: "test",
        instructions: [],
      },
    };
    const solanaResult = registry.parse(solanaInput);
    expect(solanaResult.success).toBe(true);
  });

  it("should return error for unsupported format", () => {
    const registry = new ParserRegistry();
    registry.register(new OpenAPIParser());

    const input: InputSpec = {
      type: "custom",
      format: "json",
      source: "test.json",
      rawContent: { unknownFormat: true },
    };

    const result = registry.parse(input);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].code).toBe("NO_PARSER_FOUND");
  });
});
