import { NextResponse } from 'next/server';

/**
 * Standard API error response formats
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handles API errors and returns consistent error responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Check for database errors
    if ('code' in error && error.code === 'SQLITE_ERROR') {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error occurred',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Validation error helper
 */
export function validationError(message: string, fields?: Record<string, string>): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      fields,
    },
    { status: 400 }
  );
}

/**
 * Not found error helper
 */
export function notFoundError(resource: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
    },
    { status: 404 }
  );
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(message: string = 'Not authenticated'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

/**
 * Validates required fields in request body
 */
export function validateRequired(
  body: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missing: string[] } {
  const missing = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ''
  );

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Email validation helper
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone validation helper (basic international format)
 */
export function isValidPhone(phone: string): boolean {
  // Allows: +, digits, spaces, hyphens, parentheses
  // Min 10 digits
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Wraps an async API handler with error handling
 */
export function withErrorHandling(
  handler: (...args: any[]) => Promise<NextResponse>
) {
  return async (...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

