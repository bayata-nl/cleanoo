/**
 * Production-safe logger utility
 * Console.error/warn/log only in development, silent in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  /**
   * Log errors - always logged but formatted differently in production
   */
  error: (message: string, error?: unknown, context?: Record<string, any>) => {
    if (isDevelopment) {
      console.error(`❌ ${message}`, error, context);
    } else if (isProduction) {
      // In production, only log essential error info
      console.error(JSON.stringify({
        level: 'error',
        message,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n'), // Only first 3 lines of stack
        } : error,
        context,
        timestamp: new Date().toISOString(),
      }));
    }
  },

  /**
   * Log warnings - only in development
   */
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`⚠️  ${message}`, data);
    }
  },

  /**
   * Log info - only in development
   */
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`ℹ️  ${message}`, data);
    }
  },

  /**
   * Log debug - only in development
   */
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🐛 ${message}`, data);
    }
  },

  /**
   * Log success - only in development
   */
  success: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, data);
    }
  },

  /**
   * Database logs - with emoji and formatting
   */
  db: {
    query: (operation: string, table: string, params?: any) => {
      if (isDevelopment) {
        console.log(`🗄️  DB ${operation}: ${table}`, params);
      }
    },
    error: (operation: string, error: unknown) => {
      logger.error(`Database ${operation} failed`, error);
    },
  },

  /**
   * API logs - with emoji and formatting
   */
  api: {
    request: (method: string, path: string, body?: any) => {
      if (isDevelopment) {
        console.log(`📨 API ${method} ${path}`, body);
      }
    },
    response: (method: string, path: string, status: number, time?: number) => {
      if (isDevelopment) {
        const emoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';
        console.log(`${emoji} API ${method} ${path} - ${status}${time ? ` (${time}ms)` : ''}`);
      }
    },
    error: (method: string, path: string, error: unknown) => {
      logger.error(`API ${method} ${path} failed`, error);
    },
  },
};

/**
 * Performance measurement utility
 */
export function measurePerformance<T>(
  operation: string,
  fn: () => T
): T {
  if (!isDevelopment) {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (duration > 100) {
    console.warn(`⏱️  Slow operation: ${operation} took ${duration.toFixed(2)}ms`);
  } else {
    console.log(`⏱️  ${operation}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Async performance measurement
 */
export async function measurePerformanceAsync<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!isDevelopment) {
    return fn();
  }

  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (duration > 100) {
    console.warn(`⏱️  Slow async operation: ${operation} took ${duration.toFixed(2)}ms`);
  } else {
    console.log(`⏱️  ${operation}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

