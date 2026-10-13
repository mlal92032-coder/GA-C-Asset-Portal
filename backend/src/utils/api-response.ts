export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
  path?: string
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const successResponse = <T>(
  data: T,
  path?: string,
): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
  path,
})

export const errorResponse = (
  code: string,
  message: string,
  statusCode: number = 400,
  details?: Record<string, any>,
  path?: string,
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
  timestamp: new Date().toISOString(),
  path,
})

export const badRequestError = (
  message: string,
  details?: Record<string, any>,
): ApiError => new ApiError('BAD_REQUEST', message, 400, details)

export const unauthorizedError = (message: string = 'Unauthorized'): ApiError =>
  new ApiError('UNAUTHORIZED', message, 401)

export const forbiddenError = (
  message: string = 'Forbidden',
  details?: Record<string, any>,
): ApiError => new ApiError('FORBIDDEN', message, 403, details)

export const notFoundError = (
  resource: string,
  id?: string,
): ApiError =>
  new ApiError(
    'NOT_FOUND',
    `${resource}${id ? ` with ID ${id}` : ''} not found`,
    404,
  )

export const conflictError = (
  message: string,
  details?: Record<string, any>,
): ApiError => new ApiError('CONFLICT', message, 409, details)

export const validationError = (
  message: string,
  details?: Record<string, any>,
): ApiError =>
  new ApiError(
    'VALIDATION_ERROR',
    message,
    400,
    details,
  )

export const internalServerError = (
  message: string = 'Internal Server Error',
): ApiError =>
  new ApiError('INTERNAL_SERVER_ERROR', message, 500)

export const handleApiError = (error: any, path?: string) => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      response: errorResponse(
        error.code,
        error.message,
        error.statusCode,
        error.details,
        path,
      ),
    }
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      response: errorResponse(
        'INTERNAL_SERVER_ERROR',
        error.message,
        500,
        { stack: process.env.NODE_ENV === 'development' ? error.stack : undefined },
        path,
      ),
    }
  }

  return {
    statusCode: 500,
    response: errorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unknown error occurred',
      500,
      undefined,
      path,
    ),
  }
}

// Zod error formatting
export const formatZodErrors = (
  errors: Record<string, any>,
): Record<string, string> => {
  const formatted: Record<string, string> = {}

  for (const [field, error] of Object.entries(errors)) {
    if (Array.isArray(error)) {
      formatted[field] = error[0]?.message || 'Invalid value'
    } else if (typeof error === 'object' && error?.message) {
      formatted[field] = error.message
    } else {
      formatted[field] = String(error)
    }
  }

  return formatted
}

// Pagination response
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
  }
}

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 50,
): PaginatedResponse<T> => {
  const pages = Math.ceil(total / limit)
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasMore: page < pages,
    },
  }
}
