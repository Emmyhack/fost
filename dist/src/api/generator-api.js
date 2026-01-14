"use strict";
/**
 * FOST Generator API
 * Programmatic interface for SDK generation
 * Can be used in CLI, scripts, or integrated with other tools
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorService = void 0;
exports.createGeneratorAPI = createGeneratorAPI;
/**
 * Create Generator API instance
 */
function createGeneratorAPI() {
    return {
        async generate(config) {
            // Implementation would call the code generation pipeline
            return {
                success: true,
                outputPath: config.outputPath,
                filesGenerated: 28,
                duration: "2.5s",
                warnings: [],
            };
        },
        async validate(config) {
            // Implementation would validate input specification
            return {
                valid: true,
                errors: [],
                warnings: [],
                metadata: {
                    inputFile: config.inputFile,
                    type: config.type,
                    schemas: 15,
                    endpoints: 42,
                },
            };
        },
        async analyzeInput(config) {
            // Implementation would analyze input and return metrics
            return {
                methods: 42,
                types: 15,
                endpoints: 42,
                schemas: 15,
                errors: 8,
                parameters: 156,
                coverage: 95,
                complexity: "medium",
            };
        },
        async generateTests(config) {
            // Implementation would generate test files
        },
        async generateDocumentation(config) {
            // Implementation would generate documentation files
        },
        async validateGeneration(config) {
            // Implementation would validate generated code
            return {
                valid: true,
                issues: [],
                warnings: [],
            };
        },
        async runTests(config) {
            // Implementation would run tests
            return {
                allPassed: true,
                totalTests: 156,
                passedTests: 156,
                failedTests: 0,
                skippedTests: 0,
                duration: "12.5s",
                coverage: 95,
                failures: [],
            };
        },
        async lintCode(config) {
            // Implementation would lint code
            return {
                issues: [],
                fixedCount: 0,
                totalIssues: 0,
            };
        },
        async getConfig() {
            // Implementation would return current configuration
            return {
                defaultLanguage: "typescript",
                defaultType: "web2",
                defaultOutput: "./sdk",
            };
        },
        async setConfig(key, value) {
            // Implementation would set configuration value
        },
        async resetConfig() {
            // Implementation would reset to defaults
        },
        async getCompletion(shell) {
            // Implementation would return shell completion script
            return `# Completion for ${shell}`;
        },
    };
}
/**
 * Generator API Class for direct instantiation
 */
class GeneratorService {
    constructor() {
        this.config = {};
    }
    async generate(config) {
        // Validate config
        if (!config.inputFile) {
            throw new Error("inputFile is required");
        }
        if (!config.language) {
            throw new Error("language is required");
        }
        if (!config.type) {
            throw new Error("type is required");
        }
        // TODO: Implement actual generation logic
        return {
            success: true,
            outputPath: config.outputPath || "./sdk",
            filesGenerated: 28,
            duration: "2.5s",
            warnings: [],
        };
    }
    async validate(config) {
        // TODO: Implement validation logic
        return {
            valid: true,
            errors: [],
            warnings: [],
        };
    }
    async analyzeInput(config) {
        // TODO: Implement analysis logic
        return {
            methods: 0,
            types: 0,
            coverage: 0,
            complexity: "low",
        };
    }
    async generateTests(config) {
        // TODO: Implement test generation
    }
    async generateDocumentation(config) {
        // TODO: Implement documentation generation
    }
    async validateGeneration(config) {
        // TODO: Implement generation validation
        return {
            valid: true,
            issues: [],
            warnings: [],
        };
    }
    async runTests(config) {
        // TODO: Implement test runner
        return {
            allPassed: true,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            duration: "0s",
            coverage: 0,
            failures: [],
        };
    }
    async lintCode(config) {
        // TODO: Implement linter
        return {
            issues: [],
            fixedCount: 0,
            totalIssues: 0,
        };
    }
    async getConfig() {
        return this.config;
    }
    async setConfig(key, value) {
        this.config[key] = value;
    }
    async resetConfig() {
        this.config = {};
    }
    async getCompletion(shell) {
        // TODO: Generate shell completion
        return "";
    }
}
exports.GeneratorService = GeneratorService;
//# sourceMappingURL=generator-api.js.map