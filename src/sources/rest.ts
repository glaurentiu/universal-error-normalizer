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

function getErrorType(status?: number, errorData?: unknown): ErrorType {
  if (!status) return 'unknown_error'

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

function isRetryable(status?: number): boolean {
  if (!status) return false

  // Network errors and 5xx are retryable
  if (status >= 500) return true

  // 429 (rate limited) is retryable
  if (status === 429) return true

  return false
}

function extractMessageFromRestError(errorData: unknown): string {
  // If errorData is null/undefined, provide default message
  if (errorData == null) {
    return 'Request failed'
  }

  if (!isObject(errorData)) {
    return safeMessage(errorData)
  }

  // Try common REST error shapes
  if (typeof errorData.error === 'string') {
    return errorData.error
  }

  if (typeof errorData.message === 'string') {
    return errorData.message
  }

  if (typeof errorData.detail === 'string') {
    return errorData.detail
  }

  // Handle errors array
  if (Array.isArray(errorData.errors)) {
    if (errorData.errors.length === 0) {
      return 'Validation errors occurred'
    }

    const firstError = errorData.errors[0]
    if (typeof firstError === 'string') {
      return firstError
    }

    if (isObject(firstError) && typeof firstError.message === 'string') {
      return firstError.message
    }
  }

  // Handle nested errors object
  if (isObject(errorData.errors)) {
    const errors = errorData.errors
    const fields = Object.keys(errors)

    if (fields.length > 0) {
      const firstField = fields[0]
      const fieldError = errors[firstField]

      if (typeof fieldError === 'string') {
        return fieldError
      }

      if (Array.isArray(fieldError) && fieldError.length > 0) {
        return fieldError[0]
      }
    }
  }

  // Fallback
  return 'Request failed'
}

function extractFieldFromRestError(errorData: unknown): string | undefined {
  if (!isObject(errorData)) {
    return undefined
  }

  // Check for field in nested errors object
  if (isObject(errorData.errors)) {
    const errors = errorData.errors
    const fields = Object.keys(errors)
    if (fields.length > 0) {
      return fields[0]
    }
  }

  // Check for direct field property
  if (typeof errorData.field === 'string') {
    return errorData.field
  }

  return undefined
}

export function normalizeRestError(error: unknown): NormalizedError {
  const status = getStatus(error)

  // If we have error data (like from a response), extract information
  let errorData: unknown = error
  if (isObject(error) && isObject(error.response)) {
    errorData = error.response.data || error
  }

  const errorType = getErrorType(status, errorData)
  const message = extractMessageFromRestError(errorData)
  const retryable = isRetryable(status)
  const field = extractFieldFromRestError(errorData)

  return createError({
    type: errorType,
    message,
    status,
    field,
    retryable,
    source: 'rest',
    original: error
  })
}