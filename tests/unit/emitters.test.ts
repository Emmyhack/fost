/**
 * Tests for Multi-Language Emitters
 * 
 * Tests the Python, Go, and Rust emitters ensure they generate idiomatic code.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PythonEmitter } from "../../src/code-generation/emitters/python";
import { GoEmitter } from "../../src/code-generation/emitters/go";
import { RustEmitter } from "../../src/code-generation/emitters/rust";
import type * as AST from "../../src/code-generation/types";

describe("Multi-Language Emitters", () => {
  describe("PythonEmitter", () => {
    let emitter: PythonEmitter;

    beforeEach(() => {
      emitter = new PythonEmitter();
    });

    it("should emit Python program with imports", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain('"""Generated Python SDK"""');
      expect(code).toContain("from typing import");
      expect(code).toContain("from dataclasses import dataclass");
      expect(code).toContain("from enum import Enum");
    });

    it("should emit Python class with snake_case properties", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [
          {
            type: "ClassDeclaration",
            name: "UserClient",
            isExported: true,
            constructor: undefined,
            properties: [
              {
                type: "PropertyDeclaration",
                name: "baseUrl",
                valueType: "string",
                readonly: false,
                isPrivate: false,
              },
              {
                type: "PropertyDeclaration",
                name: "apiKey",
                valueType: "string",
                readonly: true,
                isPrivate: false,
              },
            ],
            methods: [],
          } as AST.ASTClassDeclaration,
        ],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("class UserClient:");
      expect(code).toContain("def __init__(self, base_url: str, api_key: str) -> None:");
      expect(code).toContain("self.base_url = base_url");
      expect(code).toContain("self.api_key = api_key");
    });

    it("should emit Python interface as Protocol", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [
          {
            type: "InterfaceDeclaration",
            name: "HttpClient",
            isExported: true,
            properties: [
              {
                type: "PropertyDeclaration",
                name: "request",
                valueType: "Awaitable",
                readonly: false,
                isPrivate: false,
              },
            ],
          } as AST.ASTInterfaceDeclaration,
        ],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("class HttpClient(Protocol):");
      expect(code).toContain("request: Awaitable");
    });

    it("should emit Python enum", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [
          {
            type: "EnumDeclaration",
            name: "Status",
            isExported: true,
            members: [
              { name: "ACTIVE", value: "active" },
              { name: "INACTIVE", value: "inactive" },
            ],
          } as AST.ASTEnumDeclaration,
        ],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("class Status(Enum):");
      expect(code).toContain("ACTIVE = ");
      expect(code).toContain("INACTIVE = ");
    });
  });

  describe("GoEmitter", () => {
    let emitter: GoEmitter;

    beforeEach(() => {
      emitter = new GoEmitter();
    });

    it("should emit Go program with package and imports", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("package sdk");
      expect(code).toContain('import (');
      expect(code).toContain('"context"');
      expect(code).toContain('"net/http"');
    });

    it("should emit Go struct with PascalCase fields", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [
          {
            type: "ClassDeclaration",
            name: "UserClient",
            isExported: true,
            constructor: undefined,
            properties: [
              {
                type: "PropertyDeclaration",
                name: "baseUrl",
                valueType: "string",
                readonly: false,
                isPrivate: false,
              },
            ],
            methods: [],
          } as AST.ASTClassDeclaration,
        ],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("type UserClient struct {");
      expect(code).toContain("Baseurl string"); // Go converts camelCase to PascalCase
      expect(code).toContain("func NewUserClient() *UserClient {");
    });

    it("should emit Go interface", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [
          {
            type: "InterfaceDeclaration",
            name: "HttpClient",
            isExported: true,
            properties: [
              {
                type: "PropertyDeclaration",
                name: "request",
                valueType: "string",
                readonly: false,
                isPrivate: false,
              },
            ],
          } as AST.ASTInterfaceDeclaration,
        ],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("type HttpClient interface {");
      expect(code).toContain("Request() string");
    });

    it("should emit Go enum  as const block", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [
          {
            type: "EnumDeclaration",
            name: "Status",
            isExported: true,
            members: [
              { name: "ACTIVE", value: 0 },
              { name: "INACTIVE", value: 1 },
            ],
          } as AST.ASTEnumDeclaration,
        ],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("const (");
      expect(code).toContain("StatusACTIVE");
      expect(code).toContain("StatusINACTIVE");
    });
  });

  describe("RustEmitter", () => {
    let emitter: RustEmitter;

    beforeEach(() => {
      emitter = new RustEmitter();
    });

    it("should emit Rust program with crate header", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("//! Generated Rust SDK");
      expect(code).toContain("use serde::{Deserialize, Serialize};");
      expect(code).toContain("use async_trait::async_trait;");
    });

    it("should emit Rust struct with derive macros", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [
          {
            type: "ClassDeclaration",
            name: "UserClient",
            isExported: true,
            constructor: undefined,
            properties: [
              {
                type: "PropertyDeclaration",
                name: "baseUrl",
                valueType: "string",
                readonly: false,
                isPrivate: false,
              },
            ],
            methods: [],
          } as AST.ASTClassDeclaration,
        ],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("#[derive(Debug, Clone, Serialize, Deserialize)]");
      expect(code).toContain("pub struct UserClient {");
      expect(code).toContain("pub base_url: String,");
    });

    it("should emit Rust trait", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [
          {
            type: "InterfaceDeclaration",
            name: "HttpClient",
            isExported: true,
            properties: [
              {
                type: "PropertyDeclaration",
                name: "request",
                valueType: "string",
                readonly: false,
                isPrivate: false,
              },
            ],
          } as AST.ASTInterfaceDeclaration,
        ],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("#[async_trait]");
      expect(code).toContain("pub trait HttpClient {");
      expect(code).toContain("async fn request(&self) -> String;");
    });

    it("should emit Rust enum with derive", () => {
      const program: AST.ASTProgram = {
        type: "Program",
        body: [
          {
            type: "EnumDeclaration",
            name: "Status",
            isExported: true,
            members: [
              { name: "ACTIVE", value: "active" },
              { name: "INACTIVE", value: "inactive" },
            ],
          } as AST.ASTEnumDeclaration,
        ],
      };

      const code = emitter.emitProgram(program);

      expect(code).toContain("#[derive(Debug, Clone, Serialize, Deserialize)]");
      expect(code).toContain("pub enum Status {");
      expect(code).toContain("ACTIVE,");
      expect(code).toContain("INACTIVE,");
    });
  });
});
