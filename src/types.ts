/**
 * Universal Error Normalizer
 * Author: Laurentiu Gingioveanu
 * Email: laurentiu@eagertowork.ro
 * GitHub: https://github.com/glaurentiu
 * Twitter: @eager_to_work
 * License: MIT
 */

export type ErrorType =
  | "network_error"
  | "timeout"
  | "validation_error"
  | "authentication_error"
  | "authorization_error"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "server_error"
  | "client_error"
  | "unknown_error"

export type ErrorSource =
  | "fetch"
  | "axios"
  | "graphql"
  | "rest"
  | "runtime"
  | "custom"

export type NormalizedError = {
  type: ErrorType
  message: string
  status?: number
  code?: string
  field?: string
  details?: unknown
  retryable: boolean
  source: ErrorSource
  original?: unknown
}

export type NormalizeOptions = {
  source?: ErrorSource
  defaultRetryable?: boolean
}