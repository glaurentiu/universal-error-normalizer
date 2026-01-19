import { describe, it, expect } from 'vitest'
import { normalizeError } from '../src/index.js'

describe('Axios Error Normalization', () => {
  it('should normalize network errors (no response)', () => {
    const error = {
      isAxiosError: true,
      request: {},
      message: 'Network Error'
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'network_error',
      message: 'Network Error',
      retryable: true,
      source: 'axios',
      original: error
    })
  })

  it('should normalize timeout errors', () => {
    const error = {
      isAxiosError: true,
      code: 'ECONNABORTED',
      message: 'timeout of 5000ms exceeded'
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'timeout',
      message: 'timeout of 5000ms exceeded',
      retryable: true,
      source: 'axios',
      original: error
    })
  })

  it('should normalize 401 authentication errors', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'authentication_error',
      message: 'Unauthorized',
      status: 401,
      retryable: false,
      source: 'axios',
      original: error
    })
  })

  it('should normalize 422 validation errors with field extraction', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          errors: {
            email: 'Invalid email format'
          }
        }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'validation_error',
      message: 'Invalid email format',
      status: 422,
      field: 'email',
      retryable: false,
      source: 'axios',
      original: error
    })
  })

  it('should normalize 500 server errors as retryable', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { message: 'Internal Server Error' }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'server_error',
      message: 'Internal Server Error',
      status: 500,
      retryable: true,
      source: 'axios',
      original: error
    })
  })

  it('should normalize 429 rate limited errors as retryable', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 429,
        data: { message: 'Too Many Requests' }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'rate_limited',
      message: 'Too Many Requests',
      status: 429,
      retryable: true,
      source: 'axios',
      original: error
    })
  })

  it('should normalize unknown axios errors', () => {
    const error = {
      isAxiosError: true,
      message: 'Unknown axios error'
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'Unknown axios error',
      retryable: false,
      source: 'axios',
      original: error
    })
  })
})