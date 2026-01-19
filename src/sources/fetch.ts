/**
 * Universal Error Normalizer
 * Author: Laurentiu Gingioveanu
 * Email: laurentiu@eagertowork.ro
 * GitHub: https://github.com/glaurentiu
 * Twitter: @eager_to_work
 * License: MIT
 */

import { createError } from '../createError.js'
import { safeMessage } from '../utils/safeMessage.js'
import { getStatus } from '../utils/getStatus.js'
import { isObject } from '../utils/isObject.js'
import type { NormalizedError, ErrorType } from '../types.js'

function getErrorType(status?: number): ErrorType {
  if (!status) return 'network_error'

  if (status === 400) return 'client_error'
  if (status === 401) return 'authentication_error'
  if (status === 403) return 'authorization_error'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 422) return 'validation_error'
  if (status === 429) return 'rate_limited'
  if (status >= 500) return 'server_error'

  return 'client_error'
}

function isRetryable(status?: number, error?: unknown): boolean {
  if (!status) return true // Network errors are retryable

  // Network errors and 5xx are retryable
  if (status >= 500) return true

  // 429 (rate limited) is retryable
  if (status === 429) return true

  // Timeout errors are retryable
  if (isObject(error) && error.name === 'TimeoutError') return true

  return false
}

export function normalizeFetchError(error: unknown): NormalizedError {
  const status = getStatus(error)

  // Handle network errors (no response)
  if (!status && error instanceof TypeError) {
    return createError({
      type: 'network_error',
      message: 'Network request failed',
      retryable: true,
      source: 'fetch',
      original: error
    })
  }

  // Handle timeout errors
  if (isObject(error) && error.name === 'AbortError') {
    return createError({
      type: 'timeout',
      message: 'Request timed out',
      retryable: true,
      source: 'fetch',
      original: error
    })
  }

  const errorType = getErrorType(status)
  const message = safeMessage(error) || 'Request failed'
  const retryable = isRetryable(status, error)

  return createError({
    type: errorType,
    message,
    status,
    retryable,
    source: 'fetch',
    original: error
  })
}