import type { AxiosError } from 'axios';

/**
 * Extracts the most specific, human-readable message from any thrown error.
 * Handles NestJS validation arrays, single-string messages, network errors, and unknown objects.
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!err) return fallback;

  // Axios error — pull from response body
  const axiosErr = err as AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>;
  if (axiosErr.isAxiosError) {
    const data = axiosErr.response?.data;
    if (data) {
      // NestJS ValidationPipe returns message as string[]
      if (Array.isArray(data.message) && data.message.length) {
        return data.message.join('. ');
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
    }
    // Network-level errors
    if (axiosErr.code === 'ERR_NETWORK' || axiosErr.message === 'Network Error') {
      return 'Cannot reach the server. Check your internet connection and try again.';
    }
    if (axiosErr.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (axiosErr.response?.status === 403) return 'You do not have permission to perform this action.';
    if (axiosErr.response?.status === 404) return 'The requested resource was not found.';
    if (axiosErr.response?.status === 409) return 'This record already exists.';
    if (axiosErr.response?.status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (axiosErr.response?.status && axiosErr.response.status >= 500) return 'A server error occurred. Please try again shortly.';
    if (axiosErr.message) return axiosErr.message;
  }

  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;

  return fallback;
}
