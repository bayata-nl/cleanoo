import { NextResponse } from 'next/server';

/**
 * Cache control helpers for API routes
 */

export interface CacheOptions {
  /**
   * Max age in seconds
   */
  maxAge?: number;
  /**
   * Stale-while-revalidate duration in seconds
   */
  swr?: number;
  /**
   * Whether to cache in browser (private) or CDN (public)
   */
  visibility?: 'private' | 'public';
  /**
   * Whether to revalidate on every request
   */
  mustRevalidate?: boolean;
  /**
   * Whether content can be cached
   */
  noCache?: boolean;
  /**
   * Whether content can be stored
   */
  noStore?: boolean;
}

/**
 * Generate Cache-Control header value
 */
export function generateCacheControl(options: CacheOptions): string {
  if (options.noStore) {
    return 'no-store';
  }

  if (options.noCache) {
    return 'no-cache';
  }

  const directives: string[] = [];

  if (options.visibility) {
    directives.push(options.visibility);
  }

  if (options.maxAge !== undefined) {
    directives.push(`max-age=${options.maxAge}`);
  }

  if (options.swr !== undefined) {
    directives.push(`stale-while-revalidate=${options.swr}`);
  }

  if (options.mustRevalidate) {
    directives.push('must-revalidate');
  }

  return directives.join(', ');
}

/**
 * Add cache headers to a NextResponse
 */
export function withCache(response: NextResponse, options: CacheOptions): NextResponse {
  const cacheControl = generateCacheControl(options);
  response.headers.set('Cache-Control', cacheControl);

  // Add ETag for better caching
  if (options.maxAge && options.maxAge > 0) {
    const etag = `"${Date.now()}-${Math.random().toString(36).substring(7)}"`;
    response.headers.set('ETag', etag);
  }

  return response;
}

/**
 * Predefined cache strategies
 */
export const CacheStrategies = {
  /**
   * No caching - for dynamic, user-specific data
   */
  NoCache: {
    noStore: true,
  },

  /**
   * Short cache - for frequently changing data (5 minutes)
   */
  Short: {
    visibility: 'public' as const,
    maxAge: 300, // 5 minutes
    swr: 60, // 1 minute stale-while-revalidate
  },

  /**
   * Medium cache - for semi-static data (1 hour)
   */
  Medium: {
    visibility: 'public' as const,
    maxAge: 3600, // 1 hour
    swr: 300, // 5 minutes stale-while-revalidate
  },

  /**
   * Long cache - for static data (1 day)
   */
  Long: {
    visibility: 'public' as const,
    maxAge: 86400, // 1 day
    swr: 3600, // 1 hour stale-while-revalidate
  },

  /**
   * Private cache - for user-specific data (5 minutes)
   */
  Private: {
    visibility: 'private' as const,
    maxAge: 300, // 5 minutes
    mustRevalidate: true,
  },

  /**
   * Static cache - for immutable data (1 year)
   */
  Static: {
    visibility: 'public' as const,
    maxAge: 31536000, // 1 year
  },
};

/**
 * Middleware-style cache wrapper for API routes
 */
export function cachedResponse<T>(
  data: T,
  options: CacheOptions = CacheStrategies.Short
): NextResponse {
  const response = NextResponse.json({
    success: true,
    data,
    cached: true,
    timestamp: new Date().toISOString(),
  });

  return withCache(response, options);
}

/**
 * Check if request has valid cache
 */
export function checkCacheHeaders(request: Request): {
  hasETag: boolean;
  etag?: string;
  hasIfNoneMatch: boolean;
  ifNoneMatch?: string;
  shouldRevalidate: boolean;
} {
  const etag = request.headers.get('etag');
  const ifNoneMatch = request.headers.get('if-none-match');

  return {
    hasETag: !!etag,
    etag: etag || undefined,
    hasIfNoneMatch: !!ifNoneMatch,
    ifNoneMatch: ifNoneMatch || undefined,
    shouldRevalidate: !!(etag && ifNoneMatch && etag === ifNoneMatch),
  };
}

/**
 * Return 304 Not Modified response
 */
export function notModifiedResponse(): NextResponse {
  return new NextResponse(null, {
    status: 304,
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
}

