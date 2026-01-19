/**
 * Universal Error Normalizer
 * Author: Laurentiu Gingioveanu
 * Email: laurentiu@eagertowork.ro
 * GitHub: https://github.com/glaurentiu
 * Twitter: @eager_to_work
 * License: MIT
 */

import { createError } from '../createError.js'
import { isObject } from '../utils/isObject.js'
import type { NormalizedError, ErrorType } from '../types.js'

function mapGraphQLErrorCode(code?: string): ErrorType {
  if (!code) return 'unknown_error'

  switch (code.toUpperCase()) {
    case 'UNAUTHENTICATED':
      return 'authentication_error'
    case 'FORBIDDEN':
      return 'authorization_error'
    case 'NOT_FOUND':
      return 'not_found'
    case 'VALIDATION_ERROR':
    case 'BAD_USER_INPUT':
      return 'validation_error'
    case 'INTERNAL_ERROR':
      return 'server_error'
    case 'RATE_LIMITED':
      return 'rate_limited'
    default:
      return 'unknown_error'
  }
}

function isRetryable(type: ErrorType): boolean {
  // GraphQL errors are generally not retryable unless they're network/server related
  switch (type) {
    case 'server_error':
    case 'rate_limited':
      return true
    default:
      return false
  }
}

function extractFieldFromGraphQLError(error: unknown): string | undefined {
  if (isObject(error) && isObject(error.extensions) && typeof error.extensions.field === 'string') {
    return error.extensions.field
  }

  // Try to extract field from path
  if (isObject(error) && Array.isArray(error.path) && error.path.length > 0) {
    const lastPath = error.path[error.path.length - 1]
    if (typeof lastPath === 'string') {
      return lastPath
    }
  }

  return undefined
}

export function normalizeGraphQLError(error: unknown): NormalizedError {
  // Handle GraphQL error response format
  if (isObject(error) && Array.isArray(error.errors) && error.errors.length > 0) {
    const firstError = error.errors[0]
    const message = (isObject(firstError) && typeof firstError.message === 'string')
      ? firstError.message
      : 'GraphQL error occurred'

    const code = isObject(firstError) && isObject(firstError.extensions) && typeof firstError.extensions.code === 'string'
      ? firstError.extensions.code
      : undefined

    const errorType = mapGraphQLErrorCode(code)
    const field = extractFieldFromGraphQLError(firstError)
    const retryable = isRetryable(errorType)

    return createError({
      type: errorType,
      message,
      code,
      field,
      retryable,
      source: 'graphql',
      original: error
    })
  }

  // Handle single GraphQL error object
  if (isObject(error) && typeof error.message === 'string') {
    const message = error.message
    const code = isObject(error.extensions) && typeof error.extensions.code === 'string'
      ? error.extensions.code
      : undefined

    const errorType = mapGraphQLErrorCode(code)
    const field = extractFieldFromGraphQLError(error)
    const retryable = isRetryable(errorType)

    return createError({
      type: errorType,
      message,
      code,
      field,
      retryable,
      source: 'graphql',
      original: error
    })
  }

  // Fallback for unknown GraphQL error format
  return createError({
    type: 'unknown_error',
    message: 'GraphQL error occurred',
    source: 'graphql',
    original: error
  })
}