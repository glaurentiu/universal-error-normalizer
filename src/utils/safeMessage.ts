import { isObject } from './isObject.js'

export function safeMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (isObject(error) && typeof error.message === 'string') {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}