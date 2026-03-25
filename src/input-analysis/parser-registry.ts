/**
 * Parser Registry - Plugin System for Input Parsers
 *
 * Provides auto-detection and registration of format-specific parsers.
 * New parsers can be registered dynamically without modifying core code.
 */

import { InputSpec, ParserResult, SpecParser } from "./types";

/**
 * ParserPlugin extends SpecParser with metadata for registry management
 */
export interface ParserPlugin extends SpecParser {
  /** Display name of the parser */
  displayName: string;
  /** Version of the parser */
  version: string;
  /** Supported input types (e.g., "openapi-3.0", "graphql") */
  supportedTypes: string[];
  /** Confidence score 0-1 for detection (higher = more confident) */
  detectConfidence(input: InputSpec): number;
}

/**
 * Parser Registry - Central hub for all format parsers
 */
export class ParserRegistry {
  private parsers: Map<string, ParserPlugin> = new Map();
  private detectionStrategies: Array<{
    name: string;
    detect: (input: InputSpec) => boolean;
    parser: ParserPlugin;
  }> = [];

  /**
   * Register a new parser
   */
  register(parser: ParserPlugin): void {
    for (const type of parser.supportedTypes) {
      this.parsers.set(type, parser);
    }

    // Add to detection strategies (for auto-detection by content)
    this.detectionStrategies.push({
      name: parser.displayName,
      detect: (input) => parser.canParse(input),
      parser,
    });

    // Sort by confidence (highest first) - only for registered parsing attempts
    this.detectionStrategies.sort(
      (a, b) => {
        const dummyInput: InputSpec = {
          type: "custom",
          format: "json",
          source: "test",
          rawContent: {},
        };
        return b.parser.detectConfidence(dummyInput) - a.parser.detectConfidence(dummyInput);
      }
    );
  }

  /**
   * Get parser by explicit type
   */
  getParser(inputType: string): ParserPlugin | undefined {
    return this.parsers.get(inputType);
  }

  /**
   * Auto-detect appropriate parser based on input content
   */
  detectParser(input: InputSpec): ParserPlugin | undefined {
    // First try direct type match
    const byType = this.getParser(input.type);
    if (byType && byType.canParse(input)) {
      return byType;
    }

    // Then try content-based detection, sorted by confidence
    for (const strategy of this.detectionStrategies) {
      if (strategy.detect(input)) {
        return strategy.parser;
      }
    }

    return undefined;
  }

  /**
   * List all registered parsers
   */
  listParsers(): Array<{
    displayName: string;
    version: string;
    supportedTypes: string[];
  }> {
    return Array.from(this.parsers.values())
      .filter((p, i, arr) => arr.findIndex((x) => x.displayName === p.displayName) === i)
      .map((p) => ({
        displayName: p.displayName,
        version: p.version,
        supportedTypes: p.supportedTypes,
      }));
  }

  /**
   * Parse with auto-detected parser
   */
  parse(input: InputSpec): ParserResult {
    const parser = this.detectParser(input);
    if (!parser) {
      return {
        success: false,
        errors: [
          {
            code: "NO_PARSER_FOUND",
            message: `No parser found for input type: ${input.type}`,
            context: { inputType: input.type },
          },
        ],
        warnings: [],
      };
    }

    return parser.parse(input);
  }

  /**
   * Clear all parsers
   */
  clear(): void {
    this.parsers.clear();
    this.detectionStrategies = [];
  }
}

/**
 * Global registry instance
 */
let globalRegistry: ParserRegistry | null = null;

/**
 * Get or create the global parser registry
 */
export function getParserRegistry(): ParserRegistry {
  if (!globalRegistry) {
    globalRegistry = new ParserRegistry();
  }
  return globalRegistry;
}

/**
 * Register a parser globally
 */
export function registerParser(parser: ParserPlugin): void {
  getParserRegistry().register(parser);
}
