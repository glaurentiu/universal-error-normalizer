/**
 * Universal Error Normalizer
 * Author: Laurentiu Gingioveanu
 * Email: laurentiu@eagertowork.ro
 * GitHub: https://github.com/glaurentiu
 * Twitter: @eager_to_work
 * License: MIT
 */

import type { ErrorType, NormalizedError } from './types.js'

export type CreateErrorOptions = {
  type: ErrorType
  message: string
  status?: number
  code?: string
  field?: string
  retryable?: boolean
  details?: unknown
  source?: NormalizedError['source']
  original?: unknown
}

export function createError(options: CreateErrorOptions): NormalizedError {
  const {
    type,
    message,
    status,
    code,
    field,
    retryable = false,
    details,
    source = 'custom',
    original
  } = options

  return {
    type,
    message,
    status,
    code,
    field,
    details,
    retryable,
    source,
    original
  }
}