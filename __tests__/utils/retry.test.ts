import { retry } from '../../src/utils/retry';

describe('retry', () => {
  it('returns on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    await expect(retry(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure then succeeds', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('net'))
      .mockResolvedValue('ok');
    await expect(retry(fn, { attempts: 3, baseDelayMs: 0 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after all attempts exhausted', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('gone'));
    await expect(retry(fn, { attempts: 3, baseDelayMs: 0 })).rejects.toThrow('gone');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry 4xx errors', async () => {
    const err = { response: { status: 400 } };
    const fn = jest.fn().mockRejectedValue(err);
    await expect(retry(fn, { attempts: 3, baseDelayMs: 0 })).rejects.toEqual(err);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 (rate limit)', async () => {
    const err = { response: { status: 429 } };
    const fn = jest.fn()
      .mockRejectedValueOnce(err)
      .mockResolvedValue('ok');
    await expect(retry(fn, { attempts: 3, baseDelayMs: 0 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('respects custom shouldRetry', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('nope'));
    const shouldRetry = jest.fn().mockReturnValue(false);
    await expect(retry(fn, { attempts: 3, baseDelayMs: 0, shouldRetry })).rejects.toThrow('nope');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledTimes(1);
  });
});
