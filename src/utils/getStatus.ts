import { isObject } from './isObject.js'

export function getStatus(error: unknown): number | undefined {
  if (isObject(error)) {
    // Check for status property
    if (typeof error.status === 'number') {
      return error.status
    }

    // Check for response.status (Axios style)
    if (isObject(error.response) && typeof error.response.status === 'number') {
      return error.response.status
    }

    // Check for statusCode
    if (typeof error.statusCode === 'number') {
      return error.statusCode
    }

    // Check for code (sometimes status codes are stored as strings)
    if (typeof error.code === 'string') {
      const parsed = parseInt(error.code, 10)
      if (!isNaN(parsed)) {
        return parsed
      }
    }
  }

  return undefined
}