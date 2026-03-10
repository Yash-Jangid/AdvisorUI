import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { nanoid } from 'nanoid';
import type { ApiError } from '@/lib/api/types';
import { CONFIG } from '@/lib/constants/config';

// ─── Mutating HTTP Methods ────────────────────────────────────────────────────
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

// ─── Normalized API Error ─────────────────────────────────────────────────────
export class ApiClientError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly raw?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// ─── ApiClient ────────────────────────────────────────────────────────────────
// Internal implementation detail. Components never instantiate this directly.
// Public interface is the React Query hooks in lib/api/hooks/.

class ApiClient {
  private readonly http: AxiosInstance;
  // ── Refresh singleton ─────────────────────────────────────────────────────
  // Ensures concurrent 401s share a single refresh call instead of each
  // attempting their own, which would hit the backend's rate limit (10/60s).
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.http = axios.create({
      baseURL: CONFIG.apiUrl,
      timeout: 15_000,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true, // sends httpOnly cookie on every request
    });

    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  // ── Request Interceptor ───────────────────────────────────────────────────
  private setupRequestInterceptor(): void {
    this.http.interceptors.request.use(async (config) => {
      // Attach Idempotency-Key on all mutating requests
      if (config.method && MUTATING_METHODS.has(config.method.toLowerCase())) {
        config.headers['Idempotency-Key'] = nanoid(21);
      }

      // If running on the server (Next.js SSR or Server Actions)
      if (typeof window === 'undefined') {
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const cookieHeader: string[] = [];
          
          const accToken = cookieStore.get('access_token')?.value;
          if (accToken) cookieHeader.push(`access_token=${accToken}`);
          
          const refToken = cookieStore.get('refresh_token')?.value;
          if (refToken) cookieHeader.push(`refresh_token=${refToken}`);

          if (cookieHeader.length > 0) {
            config.headers.Cookie = cookieHeader.join('; ');
          }
        } catch (e) {
          // Ignore errors (e.g., if called in an unsupported server context)
        }
      }

      return config;
    });
  }

  // ── Response Interceptor ──────────────────────────────────────────────────
  private setupResponseInterceptor(): void {
    this.http.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (!axios.isAxiosError(error)) throw error;

        const status = error.response?.status ?? 0;
        const payload = error.response?.data as ApiError | undefined;
        const message = (Array.isArray(payload?.message)
          ? payload.message.join('; ')
          : payload?.message) || error.message || 'An unexpected error occurred';

        // 401 → attempt token refresh then retry once
        if (status === 401 && !error.config?.headers?.['X-Retry-After-Refresh']) {
          const retried = await this.tryRefreshAndRetry(error.config);
          if (retried) return retried;
        }

        throw new ApiClientError(status, message, error.response?.data);
      }
    );
  }

  // ── Token Refresh ─────────────────────────────────────────────────────────
  private async tryRefreshAndRetry(
    originalConfig: AxiosRequestConfig | undefined
  ): Promise<unknown | null> {
    if (!originalConfig) return null;
    try {
      // If a refresh is already in-flight, wait for it instead of firing another.
      // NOTE: do NOT swallow errors here — if refresh fails, the promise must
      // reject so the outer catch returns null and stops the retry cycle.
      if (!this.refreshPromise) {
        this.refreshPromise = this.http
          .post('/auth/refresh')
          .then(() => { /* success — new Set-Cookie headers applied by backend */ })
          .finally(() => { this.refreshPromise = null; });
      }

      await this.refreshPromise;

      const retryConfig = {
        ...originalConfig,
        headers: { ...(originalConfig.headers ?? {}), 'X-Retry-After-Refresh': 'true' },
      };
      return await this.http.request(retryConfig);
    } catch {
      // Refresh failed — propagate original 401
      return null;
    }
  }

  // ── Public Methods ────────────────────────────────────────────────────────

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.http.get<T>(endpoint, { params });
    return res.data;
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await this.http.post<T>(endpoint, body);
    return res.data;
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await this.http.put<T>(endpoint, body);
    return res.data;
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await this.http.patch<T>(endpoint, body);
    return res.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const res = await this.http.delete<T>(endpoint);
    return res.data;
  }

  /**
   * Opens a Server-Sent Events connection.
   * The caller is responsible for calling source.close() on cleanup.
   */
  sse(endpoint: string): EventSource {
    const url = `${CONFIG.apiUrl}${endpoint}`;
    return new EventSource(url, { withCredentials: true });
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────
// Import `api` wherever HTTP requests are needed.
export const api = new ApiClient();
