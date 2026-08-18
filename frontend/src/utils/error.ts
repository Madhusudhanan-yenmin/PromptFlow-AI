import { AxiosError } from 'axios';

interface FastAPIValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Safely extracts a clean, displayable error string from any API error response,
 * preventing React runtime errors when FastAPI returns array/object detail payloads.
 */
export function extractErrorMessage(error: any, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (!error) return fallbackMessage;

  // Handle Axios / Network Error
  if (error.isAxiosError || error.response || error.request) {
    const axiosErr = error as AxiosError<any>;

    // Network connection refused or timeout
    if (!axiosErr.response) {
      if (axiosErr.code === 'ERR_NETWORK' || axiosErr.message?.includes('Network Error')) {
        return 'Unable to connect to the backend server. Please verify the server is running.';
      }
      return axiosErr.message || fallbackMessage;
    }

    const data = axiosErr.response.data;

    if (data) {
      // 1. FastAPI detail as string
      if (typeof data.detail === 'string' && data.detail.trim().length > 0) {
        return data.detail;
      }

      // 2. FastAPI validation error array (HTTP 422)
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        const messages = data.detail.map((errItem: FastAPIValidationError) => {
          if (typeof errItem === 'string') return errItem;
          if (errItem.msg) {
            const field = errItem.loc && errItem.loc.length > 1 ? `${errItem.loc[errItem.loc.length - 1]}: ` : '';
            return `${field}${errItem.msg}`;
          }
          return JSON.stringify(errItem);
        });
        return messages.join(' | ');
      }

      // 3. Simple message property
      if (typeof data.message === 'string' && data.message.trim().length > 0) {
        return data.message;
      }
    }

    // Status code fallback messages
    if (axiosErr.response.status === 401) {
      return 'Invalid credentials or expired session. Please log in again.';
    }
    if (axiosErr.response.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (axiosErr.response.status === 404) {
      return 'Requested resource not found.';
    }
    if (axiosErr.response.status >= 500) {
      return 'Server error occurred. Please try again later.';
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
}
