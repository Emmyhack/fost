#!/usr/bin/env node
/**
 * Add shebang to dist/cli/index.js
 * Ensures the compiled CLI entry point can be executed as a command-line tool
 */

const fs = require('fs');
const path = require('path');

const cliIndexPath = path.join(__dirname, '../dist/cli/index.js');

try {
  const content = fs.readFileSync(cliIndexPath, 'utf-8');

  if (!content.startsWith('#!/usr/bin/env node')) {
    const withShebang = '#!/usr/bin/env node\n' + content;
    fs.writeFileSync(cliIndexPath, withShebang);
    console.log('✓ Added shebang to dist/cli/index.js');
  } else {
    console.log('✓ dist/cli/index.js already has shebang');
  }

  // Make the file executable
  fs.chmodSync(cliIndexPath, 0o755);
  console.log('✓ Made dist/cli/index.js executable');
} catch (error) {
  console.error('✗ Failed to add shebang:', error.message);
  process.exit(1);
}
