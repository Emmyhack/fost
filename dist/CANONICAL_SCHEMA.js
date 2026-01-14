"use strict";
/**
 * CANONICAL SDK SCHEMA
 *
 * Language-agnostic, deterministic representation of any SDK.
 * Acts as the single source of truth for code generation, documentation, and testing.
 *
 * Key principles:
 * - All information needed for code generation is present
 * - No interpretation needed; everything explicit
 * - Web2 and Web3 concepts unified but distinguished
 * - Fields are never optional when they affect SDK behavior
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchemaReferences = validateSchemaReferences;
// ============================================================================
// TYPE VALIDATION & HELPERS
// ============================================================================
/**
 * Validates that all referenced types exist in the types record
 * Call during schema ingestion to catch errors early
 */
function validateSchemaReferences(schema) {
    const errors = [];
    const validTypes = new Set(Object.keys(schema.types));
    const builtInTypes = new Set([
        "string",
        "number",
        "boolean",
        "bytes",
        "bigint",
        "timestamp",
        "null",
        "any",
    ]);
    // Check all type references are valid
    schema.operations.forEach((op) => {
        if (!validTypes.has(op.responseType) && !builtInTypes.has(op.responseType)) {
            errors.push(`Operation ${op.id}: responseType "${op.responseType}" not found`);
        }
        op.parameters.forEach((param) => {
            if (!validTypes.has(param.type) && !builtInTypes.has(param.type)) {
                errors.push(`Operation ${op.id}: parameter "${param.name}" type "${param.type}" not found`);
            }
        });
        op.errorCodes.forEach((code) => {
            if (!schema.errors.some((e) => e.code === code)) {
                errors.push(`Operation ${op.id}: error code "${code}" not defined`);
            }
        });
    });
    // Check nested type references
    Object.entries(schema.types).forEach(([typeName, type]) => {
        if (type.category === "object" && type.fields) {
            Object.entries(type.fields).forEach(([fieldName, field]) => {
                if (!validTypes.has(field.type) && !builtInTypes.has(field.type)) {
                    errors.push(`Type ${typeName}: field "${fieldName}" type "${field.type}" not found`);
                }
            });
        }
        if (type.category === "array" && type.elementType) {
            if (!validTypes.has(type.elementType) && !builtInTypes.has(type.elementType)) {
                errors.push(`Type ${typeName}: elementType "${type.elementType}" not found`);
            }
        }
        if (type.category === "union" && type.unionTypes) {
            type.unionTypes.forEach((t) => {
                if (!validTypes.has(t) && !builtInTypes.has(t)) {
                    errors.push(`Type ${typeName}: union type "${t}" not found`);
                }
            });
        }
    });
    return errors;
}
//# sourceMappingURL=CANONICAL_SCHEMA.js.map