/**
 * Get the API base URL
 * In Docker, uses the service name. In local dev, uses localhost
 */
export function getApiUrl(): string {
  // Check if we're in Docker (API_URL env var is set)
  // This is for server-side rendering in Docker
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  
  // Server-side fallback (for local development)
  // When running locally, Next.js server can access localhost:5001
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
}

