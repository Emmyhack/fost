"use strict";
/**
 * Logger
 * Handles console output with levels and formatting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
const levelPriority = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    success: 4,
};
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
};
function createLogger() {
    let config = {
        level: "info",
        colorize: true,
        format: "text",
    };
    return {
        debug(message) {
            if (shouldLog("debug", config.level)) {
                output("DEBUG", message, colors.gray, config);
            }
        },
        info(message) {
            if (shouldLog("info", config.level)) {
                output("INFO", message, colors.blue, config);
            }
        },
        warn(message) {
            if (shouldLog("warn", config.level)) {
                output("WARN", message, colors.yellow, config);
            }
        },
        error(message) {
            if (shouldLog("error", config.level)) {
                output("ERROR", message, colors.red, config);
            }
        },
        success(message) {
            if (shouldLog("success", config.level)) {
                output("SUCCESS", message, colors.green, config);
            }
        },
        configure(options) {
            config = { ...config, ...options };
        },
    };
}
/**
 * Check if message should be logged
 */
function shouldLog(messageLevel, configLevel) {
    const level = configLevel || "info";
    return levelPriority[messageLevel] >= levelPriority[level];
}
/**
 * Output message
 */
function output(level, message, color, config) {
    if (config.format === "json") {
        console.log(JSON.stringify({ level, message, timestamp: new Date().toISOString() }));
    }
    else {
        const prefix = config.colorize ? `${color}${level}${colors.reset}` : level;
        const icon = getIcon(level);
        console.log(`${icon} ${prefix}: ${message}`);
    }
}
/**
 * Get icon for log level
 */
function getIcon(level) {
    switch (level) {
        case "DEBUG":
            return "";
        case "INFO":
            return "i";
        case "WARN":
            return "!";
        case "ERROR":
            return "x";
        case "SUCCESS":
            return "✓";
        default:
            return "";
    }
}
//# sourceMappingURL=logger.js.map