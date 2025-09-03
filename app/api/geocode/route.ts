import { NextResponse } from 'next/server';

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  // Check cache
  const cacheKey = query.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    // Add retry logic for resilience
    let lastError;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=us&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            headers: {
              'User-Agent': 'GoMeasure/1.0 (contact@gomeasure.com)',
              'Accept': 'application/json',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 503 || response.status === 429) {
            // Service unavailable or rate limited, retry after delay
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache successful response
        cache.set(cacheKey, { data, timestamp: Date.now() });
        
        // Clean old cache entries periodically
        if (cache.size > 100) {
          const now = Date.now();
          for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > CACHE_TTL) {
              cache.delete(key);
            }
          }
        }

        return NextResponse.json(data);
      } catch (error: any) {
        lastError = error;
        if (error.name === 'AbortError') {
          // Timeout, try again if we have attempts left
          continue;
        }
        // For other errors, don't retry
        break;
      }
    }
    
    console.error('Geocoding error after retries:', lastError);
    return NextResponse.json([]);
  } catch (error) {
    console.error('Unexpected geocoding error:', error);
    return NextResponse.json([]);
  }
}