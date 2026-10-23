import axios, { AxiosError } from 'axios';

export let API_BASE_URL = 'http://192.168.1.106:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    Accept: 'application/json',
  },
});

export function updateApiBaseUrl(newUrl: string): string {
  let cleaned = newUrl.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `http://${cleaned}`;
  }
  API_BASE_URL = cleaned;
  apiClient.defaults.baseURL = cleaned;
  return cleaned;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
  raw?: unknown;
}

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    if (!axiosError.response) {
      return {
        message:
          'Cannot connect to CardioSense server. Ensure your phone is on the same Wi-Fi and the backend is running with host 0.0.0.0.',
        isNetworkError: true,
        raw: axiosError,
      };
    }

    const detail = axiosError.response.data?.detail || axiosError.message;
    return {
      message: typeof detail === 'string' ? detail : 'Server returned an error.',
      statusCode: axiosError.response.status,
      isNetworkError: false,
      raw: axiosError.response.data,
    };
  }

  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    isNetworkError: false,
    raw: error,
  };
}
