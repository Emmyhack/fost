/**
 * Logger
 * Handles console output with levels and formatting
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "success";

export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  success(message: string): void;
  configure(options: LoggerConfig): void;
}

export interface LoggerConfig {
  level?: LogLevel;
  colorize?: boolean;
  format?: "text" | "json";
}

const levelPriority: Record<LogLevel, number> = {
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

export function createLogger(): Logger {
  let config: LoggerConfig = {
    level: "info",
    colorize: true,
    format: "text",
  };

  return {
    debug(message: string): void {
      if (shouldLog("debug", config.level)) {
        output("DEBUG", message, colors.gray, config);
      }
    },

    info(message: string): void {
      if (shouldLog("info", config.level)) {
        output("INFO", message, colors.blue, config);
      }
    },

    warn(message: string): void {
      if (shouldLog("warn", config.level)) {
        output("WARN", message, colors.yellow, config);
      }
    },

    error(message: string): void {
      if (shouldLog("error", config.level)) {
        output("ERROR", message, colors.red, config);
      }
    },

    success(message: string): void {
      if (shouldLog("success", config.level)) {
        output("SUCCESS", message, colors.green, config);
      }
    },

    configure(options: LoggerConfig): void {
      config = { ...config, ...options };
    },
  };
}

/**
 * Check if message should be logged
 */
function shouldLog(messageLevel: LogLevel, configLevel?: LogLevel): boolean {
  const level = configLevel || "info";
  return levelPriority[messageLevel] >= levelPriority[level];
}

/**
 * Output message
 */
function output(
  level: string,
  message: string,
  color: string,
  config: LoggerConfig
): void {
  if (config.format === "json") {
    console.log(JSON.stringify({ level, message, timestamp: new Date().toISOString() }));
  } else {
    const prefix = config.colorize ? `${color}${level}${colors.reset}` : level;
    const icon = getIcon(level);
    console.log(`${icon} ${prefix}: ${message}`);
  }
}

/**
 * Get icon for log level
 */
function getIcon(level: string): string {
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
