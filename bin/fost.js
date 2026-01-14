#!/usr/bin/env node

/**
 * Fost CLI Entry Point
 * Executable entry point for the Fost CLI when installed globally
 */

const { runCLI } = require('../dist/src/cli/index');

runCLI(process.argv.slice(2))
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
