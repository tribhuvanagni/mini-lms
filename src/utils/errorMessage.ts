import { AxiosError } from 'axios';

// map http codes + network failures to user-readable strings
export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    if (!err.response) return 'No internet connection. Check your network.';
    switch (err.response.status) {
      case 400: return 'Invalid request. Check your inputs and try again.';
      case 401: return 'Session expired. Please log in again.';
      case 403: return "You don't have permission to do that.";
      case 404: return 'Content not found.';
      case 409: return 'Account with this email already exists.';
      case 429: return 'Too many requests. Wait a moment and retry.';
      case 500:
      case 502:
      case 503: return 'Server error. Try again in a bit.';
      default:  return `Something went wrong (${err.response.status}).`;
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}
