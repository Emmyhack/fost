/**
 * Progress Reporter
 * Displays progress with spinner and percentage
 */
export interface ProgressReporter {
    start(): void;
    update(message: string, percentage: number): void;
    succeed(message: string): void;
    fail(): void;
    warn(message: string): void;
}
export declare function createProgressReporter(): ProgressReporter;
//# sourceMappingURL=progress-reporter.d.ts.map