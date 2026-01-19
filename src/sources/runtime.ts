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
import type { NormalizedError } from '../types.js'

export function normalizeRuntimeError(error: unknown): NormalizedError {
  const message = safeMessage(error)

  return createError({
    type: 'unknown_error',
    message,
    source: 'runtime',
    original: error
  })
}