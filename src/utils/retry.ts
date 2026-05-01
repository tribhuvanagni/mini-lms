interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  shouldRetry?: (err: unknown) => boolean;
}

export async function retry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const { attempts = 3, baseDelayMs = 500, shouldRetry } = opts;

  const defaultShouldRetry = (err: unknown): boolean => {
    if (err && typeof err === 'object' && 'response' in err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      // don't retry 4xx (except network glitches on 408/429)
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        return false;
      }
    }
    return true;
  };

  const check = shouldRetry ?? defaultShouldRetry;

  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1 && check(err)) {
        await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, i)));
      } else {
        break;
      }
    }
  }
  throw lastErr;
}
