/**
 * Universal Error Normalizer
 * Author: Laurentiu Gingioveanu
 * Email: laurentiu@eagertowork.ro
 * GitHub: https://github.com/glaurentiu
 * Twitter: @eager_to_work
 * License: MIT
 */

// Main functions
export { normalizeError } from './normalizeError.js'
export { createError } from './createError.js'

// Helper guards
export { isRetryable, isValidationError } from './guards.js'

// Types
export type {
  NormalizedError,
  ErrorType,
  ErrorSource,
  NormalizeOptions
} from './types.js'

export type { CreateErrorOptions } from './createError.js'