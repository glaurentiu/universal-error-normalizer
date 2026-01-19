import type { NormalizedError } from './types.js'

export function isRetryable(error: NormalizedError): boolean {
  return error.retryable
}

export function isValidationError(error: NormalizedError): boolean {
  return error.type === 'validation_error'
}