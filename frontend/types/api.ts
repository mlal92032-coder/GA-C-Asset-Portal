// Unified API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
  path?: string;
}

// Error Response Type
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
  path?: string;
}

// Paginated Response Type
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Codes
export enum ErrorCode {
  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Business Logic Errors
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DUPLICATE_ASSET_TAG = 'DUPLICATE_ASSET_TAG',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ASSET_ALREADY_CHECKED_OUT = 'ASSET_ALREADY_CHECKED_OUT',
  ASSET_NOT_CHECKED_OUT = 'ASSET_NOT_CHECKED_OUT',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
}

// HTTP Status Codes
export const statusCodeMap: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.ASSET_NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.DUPLICATE_ASSET_TAG]: 409,
  [ErrorCode.DUPLICATE_EMAIL]: 409,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.ASSET_ALREADY_CHECKED_OUT]: 409,
  [ErrorCode.ASSET_NOT_CHECKED_OUT]: 409,
  [ErrorCode.INVALID_STATE_TRANSITION]: 400,
};

// Helper to create success response
export function createSuccessResponse<T>(data: T, pagination?: any): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(pagination && { pagination }),
    timestamp: new Date().toISOString(),
  };
}

// Helper to create error response
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, any>
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };
}
