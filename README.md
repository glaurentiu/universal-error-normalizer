# Universal Error Normalizer
[![npm version](https://badge.fury.io/js/universal-error-normalizer.svg)](https://www.npmjs.com/package/universal-error-normalizer)
[![npm downloads](https://img.shields.io/npm/dy/universal-error-normalizer)](https://www.npmjs.com/package/universal-error-normalizer)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)

**Stop writing error adapters. Normalize once. Handle consistently.**

A lightweight, framework-agnostic library that normalizes errors from different sources (REST, fetch, Axios, GraphQL, runtime errors) into a single predictable error shape that frontend and backend developers can rely on.

## Problem Statement

Every application receives errors in different formats:

- REST APIs return inconsistent error shapes
- Axios, fetch, GraphQL all behave differently
- Validation errors are nested or unreadable
- Frontend code is full of `if (error.response?.data?.error?.message)`

Developers constantly write custom adapters. This library solves that once.

## Before / After

### Before
```javascript
if (error.response?.data?.error?.message) {
  setError(error.response.data.error.message)
} else if (error.response?.data?.message) {
  setError(error.response.data.message)
} else if (error.graphQLErrors?.[0]?.message) {
  setError(error.graphQLErrors[0].message)
} else {
  setError('Something went wrong')
}
```

### After
```javascript
const err = normalizeError(error)
setError(err.message)
```

## Installation

```bash
npm install universal-error-normalizer
```

## Basic Usage

```typescript
import { normalizeError } from "universal-error-normalizer"

try {
  await fetchData()
} catch (error) {
  const err = normalizeError(error)
  console.error(err.message)

  if (err.retryable) {
    // Retry the request
  }
}
```

## Example Output

```json
{
  "type": "validation_error",
  "message": "Email is invalid",
  "status": 422,
  "field": "email",
  "retryable": false,
  "source": "rest"
}
```

## API Reference

### `normalizeError(error: unknown, options?: NormalizeOptions): NormalizedError`

The main function that normalizes any error into the canonical shape.

**Parameters:**
- `error`: The error to normalize (any type)
- `options.source`: Override automatic source detection

**Returns:** A `NormalizedError` object

### `createError(options: CreateErrorOptions): NormalizedError`

Create a custom normalized error.

```typescript
import { createError } from "universal-error-normalizer"

const err = createError({
  type: "validation_error",
  message: "Email is required",
  field: "email",
  retryable: false
})
```

### `isRetryable(error: NormalizedError): boolean`

Check if an error is retryable.

### `isValidationError(error: NormalizedError): boolean`

Check if an error is a validation error.

## Supported Error Sources

### fetch
- Network failures (`TypeError`)
- Non-2xx responses
- Timeout errors (`AbortError`)

### axios
- `error.response` (HTTP errors)
- `error.request` (network errors)
- Timeout errors
- Canceled requests

### graphql
```json
{
  "errors": [
    {
      "message": "Validation failed",
      "extensions": {
        "code": "VALIDATION_ERROR"
      }
    }
  ]
}
```

### rest
Common REST API error shapes:
```json
{ "error": "Invalid email" }
{ "message": "Unauthorized" }
{ "errors": { "email": "Invalid format" } }
```

### runtime
- Native `Error` objects
- String errors
- Unknown error types

### custom
Errors created with `createError()`

## Canonical Error Shape

```typescript
type NormalizedError = {
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
```

### Error Types

- `"network_error"` - Network connectivity issues
- `"timeout"` - Request timeouts
- `"validation_error"` - Input validation failures
- `"authentication_error"` - Auth failures (401)
- `"authorization_error"` - Permission failures (403)
- `"not_found"` - Resource not found (404)
- `"conflict"` - Resource conflicts (409)
- `"rate_limited"` - Rate limiting (429)
- `"server_error"` - Server errors (5xx)
- `"client_error"` - Client errors (4xx)
- `"unknown_error"` - Unclassified errors

### Retryable Rules

**Retryable:**
- Network errors
- Timeouts
- 5xx server errors
- 429 (rate limited)

**Not retryable:**
- Validation errors (422)
- Authentication errors (401)
- Authorization errors (403)
- 4xx client errors (except 429)

## Non-Goals

❌ **Logging** - This is not a logging library

❌ **Monitoring** - Not an APM or error tracking tool

❌ **Auto retries** - Does not perform retries

❌ **Framework-specific code** - No React, Vue, or Angular bindings

❌ **UI rendering** - No error display components

## Why This Library Exists

This library removes repeated boilerplate and makes errors predictable. Instead of writing custom error handling for every API call, you normalize once and handle consistently.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT
