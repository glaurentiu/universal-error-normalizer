import { describe, it, expect } from 'vitest'
import { normalizeError } from '../src/index.js'

describe('REST Error Normalization', () => {
  it('should normalize REST error with error property', () => {
    const error = {
      response: {
        status: 400,
        data: {
          error: 'Bad Request'
        }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'client_error',
      message: 'Bad Request',
      status: 400,
      retryable: false,
      source: 'rest',
      original: error
    })
  })

  it('should normalize REST error with message property', () => {
    const error = {
      response: {
        status: 404,
        data: {
          message: 'Resource not found'
        }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'not_found',
      message: 'Resource not found',
      status: 404,
      retryable: false,
      source: 'rest',
      original: error
    })
  })

  it('should normalize REST error with detail property', () => {
    const error = {
      response: {
        status: 422,
        data: {
          detail: 'Validation failed'
        }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'validation_error',
      message: 'Validation failed',
      status: 422,
      retryable: false,
      source: 'rest',
      original: error
    })
  })

  it('should normalize REST error with nested errors object', () => {
    const error = {
      response: {
        status: 422,
        data: {
          errors: {
            email: 'Invalid email format',
            password: 'Too short'
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
      source: 'rest',
      original: error
    })
  })

  it('should normalize REST error with errors array', () => {
    const error = {
      response: {
        status: 400,
        data: {
          errors: ['First error', 'Second error']
        }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'client_error',
      message: 'First error',
      status: 400,
      retryable: false,
      source: 'rest',
      original: error
    })
  })

  it('should normalize REST error with field property', () => {
    const error = {
      response: {
        status: 422,
        data: {
          message: 'Invalid input',
          field: 'username'
        }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'validation_error',
      message: 'Invalid input',
      status: 422,
      field: 'username',
      retryable: false,
      source: 'rest',
      original: error
    })
  })

  it('should normalize 500 server errors as retryable', () => {
    const error = {
      response: {
        status: 500,
        data: {
          message: 'Internal Server Error'
        }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'server_error',
      message: 'Internal Server Error',
      status: 500,
      retryable: true,
      source: 'rest',
      original: error
    })
  })

  it('should normalize 429 rate limited errors as retryable', () => {
    const error = {
      response: {
        status: 429,
        data: {
          message: 'Too Many Requests'
        }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'rate_limited',
      message: 'Too Many Requests',
      status: 429,
      retryable: true,
      source: 'rest',
      original: error
    })
  })

  it('should normalize plain REST error objects', () => {
    const error = {
      error: 'Something went wrong'
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'Something went wrong',
      retryable: false,
      source: 'rest',
      original: error
    })
  })

  it('should handle empty errors array', () => {
    const error = {
      response: {
        status: 422,
        data: {
          errors: []
        }
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'validation_error',
      message: 'Validation errors occurred',
      status: 422,
      retryable: false,
      source: 'rest',
      original: error
    })
  })

  it('should handle malformed error data', () => {
    const error = {
      response: {
        status: 400,
        data: null
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'client_error',
      message: 'Request failed',
      status: 400,
      retryable: false,
      source: 'rest',
      original: error
    })
  })
})