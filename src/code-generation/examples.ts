// ============================================================
// examples.ts — FIX: require.main guard replaced with safe check
// ============================================================

/**
 * SDK CODE GENERATION - Examples
 */
export function runExample() {
  console.log("SDK Code Generation Examples - Ready to use");
}

// BUGFIX 6: Avoid `require.main === module` (CommonJS) and import.meta (ESM in CommonJS output).
// Instead, skip the main check. Callers can import and run runExample() directly.
// If this is used in a standalone context, the bootstrap script will call it explicitly.


// ============================================================
// template-generator.ts — FIX: remove unused `path` import
// ============================================================
// Line to REMOVE from the top of template-generator.ts:
//   import * as path from "path";
//
// `fs` is still used (writeFileSync / mkdirSync calls elsewhere),
// but `path` is imported and never referenced — delete just that import.
// ============================================================