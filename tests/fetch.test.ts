import { describe, it, expect } from 'vitest'
import { normalizeError } from '../src/index.js'

describe('Fetch Error Normalization', () => {
  it('should normalize network errors (TypeError)', () => {
    const error = new TypeError('Failed to fetch')
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'network_error',
      message: 'Network request failed',
      retryable: true,
      source: 'fetch',
      original: error
    })
  })

  it('should normalize timeout errors (AbortError)', () => {
    const error = new DOMException('The operation was aborted.', 'AbortError')
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'timeout',
      message: 'Request timed out',
      retryable: true,
      source: 'fetch',
      original: error
    })
  })

  it('should normalize 404 responses', () => {
    const error = { status: 404, statusText: 'Not Found' }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'not_found',
      message: 'An unknown error occurred',
      status: 404,
      retryable: false,
      source: 'fetch',
      original: error
    })
  })

  it('should normalize 422 validation errors', () => {
    const error = {
      status: 422,
      statusText: 'Unprocessable Entity',
      message: 'Validation failed'
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'validation_error',
      message: 'Validation failed',
      status: 422,
      retryable: false,
      source: 'fetch',
      original: error
    })
  })

  it('should normalize 401 authentication errors', () => {
    const error = { status: 401, message: 'Unauthorized' }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'authentication_error',
      message: 'Unauthorized',
      status: 401,
      retryable: false,
      source: 'fetch',
      original: error
    })
  })

  it('should normalize 429 rate limited errors as retryable', () => {
    const error = { status: 429, message: 'Too Many Requests' }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'rate_limited',
      message: 'Too Many Requests',
      status: 429,
      retryable: true,
      source: 'fetch',
      original: error
    })
  })

  it('should normalize 500 server errors as retryable', () => {
    const error = { status: 500, message: 'Internal Server Error' }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'server_error',
      message: 'Internal Server Error',
      status: 500,
      retryable: true,
      source: 'fetch',
      original: error
    })
  })

  it('should normalize unknown status codes as client errors', () => {
    const error = { status: 418, message: "I'm a teapot" }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'client_error',
      message: "I'm a teapot",
      status: 418,
      retryable: false,
      source: 'fetch',
      original: error
    })
  })
})