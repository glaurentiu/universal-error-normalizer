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
  if (isObject(error) && (error.code === 'ECONNABORTED' || error.name === 'TimeoutError')) {
    return true
  }

  return false
}

function extractMessageFromAxiosResponse(error: unknown): string | undefined {
  // Try to extract message from axios response data
  if (isObject(error) && isObject(error.response) && isObject(error.response.data)) {
    const data = error.response.data

    // Check for message property
    if (typeof data.message === 'string') {
      return data.message
    }

    // Check for error property
    if (typeof data.error === 'string') {
      return data.error
    }

    // Check for nested errors object and extract first error message
    if (isObject(data.errors)) {
      const errors = data.errors
      const fields = Object.keys(errors)
      if (fields.length > 0) {
        const firstFieldError = errors[fields[0]]
        if (typeof firstFieldError === 'string') {
          return firstFieldError
        }
      }
    }
  }

  return undefined
}

function extractFieldFromResponse(error: unknown): string | undefined {
  // Try to extract field from common axios response shapes
  if (isObject(error) && isObject(error.response) && isObject(error.response.data)) {
    const data = error.response.data

    // Check for nested errors object
    if (isObject(data.errors)) {
      const errors = data.errors
      // Get first field if it's an object with field keys
      const fields = Object.keys(errors)
      if (fields.length > 0) {
        return fields[0]
      }
    }

    // Check for field property directly
    if (typeof data.field === 'string') {
      return data.field
    }
  }

  return undefined
}

export function normalizeAxiosError(error: unknown): NormalizedError {
  // Check for timeout errors first (ECONNABORTED can happen with or without response)
  if (isObject(error) && error.code === 'ECONNABORTED') {
    return createError({
      type: 'timeout',
      message: safeMessage(error),
      retryable: true,
      source: 'axios',
      original: error
    })
  }

  // Network errors (no response received)
  if (isObject(error) && error.request && !error.response) {
    return createError({
      type: 'network_error',
      message: safeMessage(error),
      retryable: true,
      source: 'axios',
      original: error
    })
  }

  // HTTP error responses
  if (isObject(error) && error.response) {
    const status = error.response.status
    const errorType = getErrorType(status)
    // Try to get message from response data first, then fallback to error message
    const message = extractMessageFromAxiosResponse(error) || safeMessage(error)
    const retryable = isRetryable(status, error)
    const field = extractFieldFromResponse(error)

    return createError({
      type: errorType,
      message,
      status,
      field,
      retryable,
      source: 'axios',
      original: error
    })
  }

  // Fallback for unknown axios errors
  const message = safeMessage(error)
  return createError({
    type: 'unknown_error',
    message,
    source: 'axios',
    original: error
  })
}