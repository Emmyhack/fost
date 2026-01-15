/**
 * SDK storage utilities
 */

// Store generated SDKs in memory (in production, store in database)
export const sdkStorage: Map<string, { files: { [key: string]: string }; projectName: string }> = new Map();

/**
 * Store generated SDK files
 */
export function storeSDK(
  sdkId: string,
  files: { [key: string]: string },
  projectName: string
): void {
  sdkStorage.set(sdkId, { files, projectName });
}

/**
 * Create a simple SDK package content
 */
export function createSDKPackageContent(files: { [key: string]: string }, projectName: string): string {
  let content = `# SDK Package: ${projectName}\n\n`;
  content += `Generated at: ${new Date().toISOString()}\n\n`;
  content += `## Files\n\n`;

  for (const [filename, fileContent] of Object.entries(files)) {
    content += `### ${filename}\n`;
    content += `\`\`\`\n${fileContent}\n\`\`\`\n\n`;
  }

  return content;
}
