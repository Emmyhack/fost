/**
 * Validation utility for ABI and OpenAPI specifications
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  type?: 'abi' | 'openapi' | 'unknown';
}

/**
 * Detect if a spec is an ABI (smart contract)
 */
export function isContractABI(spec: any): boolean {
  if (!Array.isArray(spec)) {
    return false;
  }

  // Check for common ABI properties
  return spec.some(
    (item) =>
      (item.type === 'function' ||
        item.type === 'constructor' ||
        item.type === 'event' ||
        item.type === 'fallback') &&
      (item.inputs || item.outputs || item.stateMutability)
  );
}

/**
 * Detect if a spec is OpenAPI
 */
export function isOpenAPI(spec: any): boolean {
  return !!(
    spec &&
    typeof spec === 'object' &&
    (spec.openapi || spec.swagger) &&
    (spec.paths || spec.info)
  );
}

/**
 * Validate ABI structure
 */
export function validateABI(spec: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(spec)) {
    errors.push('ABI must be an array');
    return { valid: false, errors, warnings };
  }

  if (spec.length === 0) {
    warnings.push('ABI is empty');
  }

  // Validate each item in the ABI
  spec.forEach((item, index) => {
    if (!item.type) {
      errors.push(`Item ${index}: Missing required field 'type'`);
    }

    const validTypes = ['function', 'constructor', 'event', 'fallback', 'receive'];
    if (item.type && !validTypes.includes(item.type)) {
      errors.push(`Item ${index}: Invalid type '${item.type}'`);
    }

    // Functions and events should have inputs
    if ((item.type === 'function' || item.type === 'event') && !Array.isArray(item.inputs)) {
      warnings.push(`Item ${index}: Missing or invalid 'inputs' field`);
    }

    // Functions should have outputs
    if (item.type === 'function' && !Array.isArray(item.outputs)) {
      warnings.push(`Item ${index}: Missing or invalid 'outputs' field`);
    }

    // Functions should have stateMutability
    if (item.type === 'function' && !item.stateMutability) {
      warnings.push(`Item ${index}: Missing 'stateMutability' field`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    type: 'abi',
  };
}

/**
 * Validate OpenAPI specification
 */
export function validateOpenAPI(spec: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!spec || typeof spec !== 'object') {
    errors.push('OpenAPI spec must be an object');
    return { valid: false, errors, warnings };
  }

  // Check required fields
  if (!spec.openapi && !spec.swagger) {
    errors.push('Missing required field: openapi or swagger version');
  }

  if (!spec.info) {
    errors.push('Missing required field: info');
  } else {
    if (!spec.info.title) {
      errors.push('Missing required field: info.title');
    }
    if (!spec.info.version) {
      errors.push('Missing required field: info.version');
    }
  }

  if (!spec.paths) {
    errors.push('Missing required field: paths');
  } else if (Object.keys(spec.paths).length === 0) {
    warnings.push('No API paths defined in specification');
  }

  // Validate path objects
  if (spec.paths && typeof spec.paths === 'object') {
    Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
      if (!path.startsWith('/')) {
        warnings.push(`Path '${path}' should start with /`);
      }

      if (pathItem && typeof pathItem === 'object') {
        const methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
        const hasMethod = methods.some((method) => method in pathItem);

        if (!hasMethod && !('parameters' in pathItem)) {
          warnings.push(`Path '${path}' has no operations or parameters defined`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    type: 'openapi',
  };
}

/**
 * Validate any specification (auto-detect type)
 */
export function validateSpecification(content: string): ValidationResult {
  let spec: any;
  const validationWarnings: string[] = [];

  // Try to parse as JSON
  try {
    spec = JSON.parse(content);
  } catch (e) {
    // If not JSON, try basic YAML detection
    if (content.includes('openapi:') || content.includes('swagger:')) {
      validationWarnings.push('YAML format detected but JSON parsing required - please convert to JSON');
    }
    return {
      valid: false,
      errors: ['Invalid JSON/YAML format'],
      warnings: validationWarnings,
    };
  }

  // Detect type and validate
  if (isContractABI(spec)) {
    return validateABI(spec);
  } else if (isOpenAPI(spec)) {
    return validateOpenAPI(spec);
  } else {
    return {
      valid: false,
      errors: ['Specification type not recognized - must be ABI or OpenAPI'],
      warnings: [],
      type: 'unknown',
    };
  }
}

/**
 * Extract basic info from specification
 */
export function extractSpecInfo(content: string): {
  type?: 'abi' | 'openapi';
  name?: string;
  version?: string;
  functionCount?: number;
  pathCount?: number;
} {
  try {
    const spec = JSON.parse(content);

    if (isContractABI(spec)) {
      return {
        type: 'abi',
        name: 'Smart Contract',
        functionCount: spec.filter((item: any) => item.type === 'function').length,
      };
    } else if (isOpenAPI(spec)) {
      return {
        type: 'openapi',
        name: spec.info?.title,
        version: spec.info?.version,
        pathCount: Object.keys(spec.paths || {}).length,
      };
    }
  } catch (e) {
    // Parsing failed, return empty
  }

  return {};
}
