import { describe, it, expect } from 'vitest'
import { normalizeError } from '../src/index.js'

describe('GraphQL Error Normalization', () => {
  it('should normalize GraphQL UNAUTHENTICATED errors', () => {
    const error = {
      errors: [
        {
          message: 'You must be logged in',
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        }
      ]
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'authentication_error',
      message: 'You must be logged in',
      code: 'UNAUTHENTICATED',
      retryable: false,
      source: 'graphql',
      original: error
    })
  })

  it('should normalize GraphQL VALIDATION_ERROR with field extraction', () => {
    const error = {
      errors: [
        {
          message: 'Email is required',
          extensions: {
            code: 'VALIDATION_ERROR',
            field: 'email'
          }
        }
      ]
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'validation_error',
      message: 'Email is required',
      code: 'VALIDATION_ERROR',
      field: 'email',
      retryable: false,
      source: 'graphql',
      original: error
    })
  })

  it('should extract field from path when extensions.field is not available', () => {
    const error = {
      errors: [
        {
          message: 'Invalid input',
          extensions: {
            code: 'BAD_USER_INPUT'
          },
          path: ['user', 'email']
        }
      ]
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'validation_error',
      message: 'Invalid input',
      code: 'BAD_USER_INPUT',
      field: 'email',
      retryable: false,
      source: 'graphql',
      original: error
    })
  })

  it('should normalize GraphQL INTERNAL_ERROR as retryable', () => {
    const error = {
      errors: [
        {
          message: 'Database connection failed',
          extensions: {
            code: 'INTERNAL_ERROR'
          }
        }
      ]
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'server_error',
      message: 'Database connection failed',
      code: 'INTERNAL_ERROR',
      retryable: true,
      source: 'graphql',
      original: error
    })
  })

  it('should normalize GraphQL RATE_LIMITED as retryable', () => {
    const error = {
      errors: [
        {
          message: 'Rate limit exceeded',
          extensions: {
            code: 'RATE_LIMITED'
          }
        }
      ]
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'rate_limited',
      message: 'Rate limit exceeded',
      code: 'RATE_LIMITED',
      retryable: true,
      source: 'graphql',
      original: error
    })
  })

  it('should normalize unknown GraphQL error codes', () => {
    const error = {
      errors: [
        {
          message: 'Some unknown error',
          extensions: {
            code: 'UNKNOWN_CODE'
          }
        }
      ]
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'Some unknown error',
      code: 'UNKNOWN_CODE',
      retryable: false,
      source: 'graphql',
      original: error
    })
  })

  it('should normalize GraphQL error without extensions', () => {
    const error = {
      errors: [
        {
          message: 'Simple error message'
        }
      ]
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'Simple error message',
      retryable: false,
      source: 'graphql',
      original: error
    })
  })

  it('should normalize single GraphQL error object', () => {
    const error = {
      message: 'Single error',
      extensions: {
        code: 'VALIDATION_ERROR'
      }
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'validation_error',
      message: 'Single error',
      code: 'VALIDATION_ERROR',
      retryable: false,
      source: 'graphql',
      original: error
    })
  })

  it('should handle empty errors array', () => {
    const error = {
      errors: []
    }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'GraphQL error occurred',
      retryable: false,
      source: 'graphql',
      original: error
    })
  })
})