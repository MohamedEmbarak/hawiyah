import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CompileClient, type CompileRequest } from './compile-client';

/** A worker that never answers. */
class SilentWorker extends EventTarget {
  terminated = false;
  posted = 0;
  postMessage(): void {
    this.posted += 1;
  }
  terminate(): void {
    this.terminated = true;
  }
}

const request: CompileRequest = { kind: 'convert', framework: 'react', files: {}, compilersBase: 'http://localhost/runtime/compilers/' };

describe('CompileClient time limit', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ends a worker that does not answer and creates a new one for the next request', async () => {
    const workers: SilentWorker[] = [];
    const client = new CompileClient(() => {
      const worker = new SilentWorker();
      workers.push(worker);
      return worker as unknown as Worker;
    }, 1000);
    const first = client.request(request);
    await vi.advanceTimersByTimeAsync(999);
    expect(workers[0]?.terminated).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(first).resolves.toEqual({ ok: false, timeout: true, loaded: [] });
    expect(workers[0]?.terminated).toBe(true);

    void client.request(request);
    expect(workers.length).toBe(2);
    expect(workers[1]?.posted).toBe(1);
  });

  it('keeps the worker when the answer comes in time', async () => {
    const worker = new SilentWorker();
    const client = new CompileClient(() => worker as unknown as Worker, 1000);
    const answer = client.request(request);
    worker.dispatchEvent(new MessageEvent('message', { data: { id: 1, body: { ok: true, kind: 'convert', files: {}, loaded: [] } } }));
    await expect(answer).resolves.toMatchObject({ ok: true });
    await vi.advanceTimersByTimeAsync(2000);
    expect(worker.terminated).toBe(false);
  });
});
