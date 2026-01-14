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
export declare function createLogger(): Logger;
//# sourceMappingURL=logger.d.ts.map