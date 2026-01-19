import { describe, it, expect } from 'vitest'
import { normalizeError } from '../src/index.js'

describe('Runtime Error Normalization', () => {
  it('should normalize a native Error object', () => {
    const error = new Error('Something went wrong')
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'Something went wrong',
      retryable: false,
      source: 'runtime',
      original: error
    })
  })

  it('should normalize a string error', () => {
    const error = 'Simple error message'
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'Simple error message',
      retryable: false,
      source: 'runtime',
      original: error
    })
  })

  it('should normalize an object with message property', () => {
    const error = { message: 'Object error message' }
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'Object error message',
      retryable: false,
      source: 'runtime',
      original: error
    })
  })

  it('should normalize unknown error types safely', () => {
    const error = null
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'An unknown error occurred',
      retryable: false,
      source: 'runtime',
      original: error
    })
  })

  it('should normalize undefined', () => {
    const error = undefined
    const result = normalizeError(error)

    expect(result).toEqual({
      type: 'unknown_error',
      message: 'An unknown error occurred',
      retryable: false,
      source: 'runtime',
      original: error
    })
  })
})