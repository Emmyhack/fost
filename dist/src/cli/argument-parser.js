"use strict";
/**
 * CLI Argument Parser
 * Parses command-line arguments and options
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArguments = parseArguments;
exports.parseConfig = parseConfig;
exports.validateOptions = validateOptions;
exports.getOption = getOption;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Parse command-line arguments
 */
function parseArguments(args) {
    const options = {
        color: true,
    };
    let command;
    let i = 0;
    // Get command
    if (args.length > 0 && !args[0].startsWith("-")) {
        command = args[0];
        i = 1;
    }
    // Parse options
    while (i < args.length) {
        const arg = args[i];
        if (arg === "--help" || arg === "-h") {
            options.help = true;
            i++;
        }
        else if (arg === "--version" || arg === "-v") {
            options.version = true;
            i++;
        }
        else if (arg === "--verbose") {
            options.verbose = true;
            i++;
        }
        else if (arg === "--quiet" || arg === "-q") {
            options.quiet = true;
            i++;
        }
        else if (arg === "--color") {
            options.color = true;
            i++;
        }
        else if (arg === "--no-color") {
            options.color = false;
            i++;
        }
        else if (arg === "--json") {
            options.json = true;
            i++;
        }
        else if (arg === "--debug") {
            options.debug = true;
            i++;
        }
        else if (arg === "--validate-only") {
            options.validateOnly = true;
            i++;
        }
        else if (arg === "--skip-tests") {
            options.skipTests = true;
            i++;
        }
        else if (arg === "--skip-docs") {
            options.skipDocs = true;
            i++;
        }
        else if (arg === "--fix") {
            options.fix = true;
            i++;
        }
        else if (arg === "--strict") {
            options.strict = true;
            i++;
        }
        else if (arg === "--coverage") {
            options.coverage = true;
            i++;
        }
        else if (arg === "--watch") {
            options.watch = true;
            i++;
        }
        else if (arg.startsWith("--")) {
            // Long option with value
            const [key, value] = arg.substring(2).split("=");
            const optionName = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            if (value) {
                options[optionName] = value;
            }
            else if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
                options[optionName] = args[i + 1];
                i++;
            }
            else {
                options[optionName] = true;
            }
            i++;
        }
        else if (arg.startsWith("-") && arg.length === 2) {
            // Short option
            const shortKey = arg.charAt(1);
            const optionName = expandShortOption(shortKey);
            if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
                options[optionName] = args[i + 1];
                i += 2;
            }
            else {
                options[optionName] = true;
                i++;
            }
        }
        else {
            // Positional argument
            if (!options.subcommand) {
                options.subcommand = arg;
            }
            i++;
        }
    }
    return { command, options };
}
/**
 * Expand short option to full name
 */
function expandShortOption(short) {
    const mapping = {
        i: "input",
        l: "language",
        t: "type",
        o: "output",
        c: "config",
        n: "name",
        v: "version",
        h: "help",
        q: "quiet",
    };
    return mapping[short] || short;
}
/**
 * Parse configuration file
 */
function parseConfig(configPath) {
    try {
        const fullPath = path.resolve(configPath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Config file not found: ${configPath}`);
        }
        const content = fs.readFileSync(fullPath, "utf-8");
        const ext = path.extname(fullPath).toLowerCase();
        let config;
        if (ext === ".json") {
            config = JSON.parse(content);
        }
        else if (ext === ".yaml" || ext === ".yml") {
            // Simple YAML parsing (for production, use a proper YAML parser)
            config = parseSimpleYAML(content);
        }
        else {
            throw new Error(`Unsupported config file format: ${ext}`);
        }
        return config;
    }
    catch (error) {
        throw new Error(`Failed to parse config: ${error.message}`);
    }
}
/**
 * Simple YAML parser (basic support)
 */
function parseSimpleYAML(content) {
    const config = {};
    const lines = content.split("\n");
    const stack = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim() || line.trim().startsWith("#")) {
            continue;
        }
        const indent = line.search(/\S/);
        const trimmed = line.trim();
        // Pop stack items with greater or equal indent
        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }
        const [key, value] = trimmed.split(":").map((s) => s.trim());
        if (!value || value === "") {
            // Nested object
            const obj = {};
            if (stack.length === 0) {
                config[key] = obj;
            }
            else {
                stack[stack.length - 1].obj[key] = obj;
            }
            stack.push({ key, indent, obj });
        }
        else {
            // Key-value pair
            const parsedValue = parseYAMLValue(value);
            if (stack.length === 0) {
                config[key] = parsedValue;
            }
            else {
                stack[stack.length - 1].obj[key] = parsedValue;
            }
        }
    }
    return config;
}
/**
 * Parse YAML value (handles strings, numbers, booleans)
 */
function parseYAMLValue(value) {
    if (value === "true")
        return true;
    if (value === "false")
        return false;
    if (value === "null")
        return null;
    if (!isNaN(Number(value)))
        return Number(value);
    if (value.startsWith("[") && value.endsWith("]")) {
        return JSON.parse(value);
    }
    return value.replace(/^["']|["']$/g, "");
}
/**
 * Validate parsed options
 */
function validateOptions(options, command) {
    const requiredByCommand = {
        generate: ["input", "language", "type"],
        validate: ["input"],
        test: [],
        lint: [],
    };
    const required = requiredByCommand[command] || [];
    for (const req of required) {
        if (!options[req] && !options[expandShortOption(req.charAt(0))]) {
            throw new Error(`--${req} is required for ${command} command`);
        }
    }
}
/**
 * Get option value (checks both long and short forms)
 */
function getOption(options, name) {
    return options[name] || options[expandShortOption(name.charAt(0))];
}
//# sourceMappingURL=argument-parser.js.map