/**
 * Universal Error Normalizer
 * Author: Laurentiu Gingioveanu
 * Email: laurentiu@eagertowork.ro
 * GitHub: https://github.com/glaurentiu
 * Twitter: @eager_to_work
 * License: MIT
 */

import { normalizeAxiosError } from './sources/axios.js'
import { normalizeFetchError } from './sources/fetch.js'
import { normalizeGraphQLError } from './sources/graphql.js'
import { normalizeRestError } from './sources/rest.js'
import { normalizeRuntimeError } from './sources/runtime.js'
import { isObject } from './utils/isObject.js'
import type { NormalizedError, NormalizeOptions, ErrorSource } from './types.js'

function detectErrorSource(error: unknown): ErrorSource {
  // Check for Axios error
  if (isObject(error) && error.isAxiosError === true) {
    return 'axios'
  }

  // Check for GraphQL error (array of errors)
  if (isObject(error) && Array.isArray(error.errors)) {
    return 'graphql'
  }

  // Check for fetch Response object
  if (isObject(error) && typeof error.ok === 'boolean' && typeof error.status === 'number') {
    return 'fetch'
  }

  // Check for fetch network errors (TypeError)
  if (error instanceof TypeError) {
    return 'fetch'
  }

  // Check for AbortError (timeout)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'fetch'
  }

  // Check for REST-like error objects (response.data structure from HTTP clients)
  if (isObject(error) && isObject(error.response) && error.response.data) {
    return 'rest'
  }

  // Check for GraphQL single error objects (with extensions)
  if (isObject(error) && isObject(error.extensions)) {
    return 'graphql'
  }

  // Check for fetch error-like objects (with status property)
  if (isObject(error) && typeof error.status === 'number') {
    return 'fetch'
  }

  // Check for REST plain error objects (common API error shapes) - only if they have response or specific error properties
  if (isObject(error) && (error.response || error.error || error.detail || error.errors)) {
    return 'rest'
  }

  // Default to runtime - only for plain objects/strings/native errors
  return 'runtime'
}

export function normalizeError(error: unknown, options?: NormalizeOptions): NormalizedError {
  const source = options?.source || detectErrorSource(error)

  switch (source) {
    case 'axios':
      return normalizeAxiosError(error)
    case 'fetch':
      return normalizeFetchError(error)
    case 'graphql':
      return normalizeGraphQLError(error)
    case 'rest':
      return normalizeRestError(error)
    case 'runtime':
      return normalizeRuntimeError(error)
    default:
      // For now, fall back to runtime for unsupported sources
      return normalizeRuntimeError(error)
  }
}