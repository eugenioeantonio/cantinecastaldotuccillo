/**
 * FrameSource — the abstraction the hero talks to. Today it is backed by a
 * WebP image sequence (`ImageSequenceSource`); tomorrow a `WebCodecsSource`
 * can be dropped behind the same interface with zero changes to the hero.
 *
 * Memory strategy: compressed blobs are fetched progressively (cheap), but
 * only a *window* of frames around the current index is ever decoded to
 * `ImageBitmap`. Bitmaps leaving the window are `.close()`d immediately, so
 * peak decoded memory stays bounded (critical for iOS Safari's ~384MB cap).
 */
export interface FrameSource {
  readonly count: number;
  /** How many compressed frames have been fetched (for preload UI). */
  readonly loadedCount: number;
  /** Fetch these frame indices first (checkpoints). */
  prime(indices: number[]): void;
  /** Decode frames within `radius` of `center`; close everything else. */
  ensureWindow(center: number, radius: number): void;
  /** Best available bitmap for `i` (exact, else nearest decoded, else null). */
  frame(i: number): ImageBitmap | null;
  /** Abort in-flight work and release all bitmaps/blobs. */
  dispose(): void;
}

type Opts = {
  count: number;
  url: (i: number) => string;
  /** Bytes per decoded frame, for the debug memory estimate. */
  bytesPerFrame: number;
};

export class ImageSequenceSource implements FrameSource {
  readonly count: number;
  private url: (i: number) => string;
  readonly bytesPerFrame: number;

  private blobs: (Blob | null)[];
  private bitmaps: (ImageBitmap | null)[];
  private fetching: boolean[];
  private decoding: boolean[];
  private controller = new AbortController();
  private _loaded = 0;
  private disposed = false;

  constructor(opts: Opts) {
    this.count = opts.count;
    this.url = opts.url;
    this.bytesPerFrame = opts.bytesPerFrame;
    this.blobs = new Array(opts.count).fill(null);
    this.bitmaps = new Array(opts.count).fill(null);
    this.fetching = new Array(opts.count).fill(false);
    this.decoding = new Array(opts.count).fill(false);
  }

  get loadedCount() {
    return this._loaded;
  }

  /** Number of frames currently decoded (debug). */
  get decodedCount() {
    let n = 0;
    for (const b of this.bitmaps) if (b) n++;
    return n;
  }

  prime(indices: number[]) {
    // Checkpoints first (dedup, clamp), then a progressive fill of the rest.
    const seen = new Set<number>();
    const order: number[] = [];
    for (const i of indices) {
      const c = Math.max(0, Math.min(this.count - 1, i));
      if (!seen.has(c)) {
        seen.add(c);
        order.push(c);
      }
    }
    for (let i = 0; i < this.count; i++) if (!seen.has(i)) order.push(i);
    this.runQueue(order);
  }

  private async runQueue(order: number[]) {
    // Small concurrency to stay friendly on slow links.
    const CONCURRENCY = 4;
    let cursor = 0;
    const worker = async () => {
      while (cursor < order.length && !this.disposed) {
        const i = order[cursor++];
        await this.fetchOne(i);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  }

  private async fetchOne(i: number) {
    if (this.disposed || this.blobs[i] || this.fetching[i]) return;
    this.fetching[i] = true;
    try {
      const res = await fetch(this.url(i), {
        signal: this.controller.signal,
        cache: "force-cache",
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      if (this.disposed) return;
      this.blobs[i] = blob;
      this._loaded++;
    } catch {
      // Aborted or 404 — leave null; draw() falls back to the nearest frame.
    } finally {
      this.fetching[i] = false;
    }
  }

  ensureWindow(center: number, radius: number) {
    if (this.disposed) return;
    const lo = Math.max(0, center - radius);
    const hi = Math.min(this.count - 1, center + radius);
    // Release bitmaps outside the window (deterministic memory).
    for (let i = 0; i < this.count; i++) {
      if (i < lo || i > hi) {
        const bm = this.bitmaps[i];
        if (bm) {
          bm.close();
          this.bitmaps[i] = null;
        }
      }
    }
    // Decode inside the window, nearest-to-center first.
    for (let d = 0; d <= radius; d++) {
      this.decodeOne(center - d);
      if (d) this.decodeOne(center + d);
    }
  }

  private async decodeOne(i: number) {
    if (this.disposed || i < 0 || i >= this.count) return;
    if (this.bitmaps[i] || this.decoding[i]) return;
    const blob = this.blobs[i];
    if (!blob) {
      // Not fetched yet — pull it, decode will be retried next frame.
      this.fetchOne(i);
      return;
    }
    this.decoding[i] = true;
    try {
      const bm = await createImageBitmap(blob);
      if (this.disposed) {
        bm.close();
        return;
      }
      this.bitmaps[i] = bm;
    } catch {
      /* ignore */
    } finally {
      this.decoding[i] = false;
    }
  }

  frame(i: number): ImageBitmap | null {
    const c = Math.max(0, Math.min(this.count - 1, i));
    if (this.bitmaps[c]) return this.bitmaps[c];
    // Nearest decoded bitmap, so the canvas is never blank once anything loads.
    for (let d = 1; d < this.count; d++) {
      if (this.bitmaps[c - d]) return this.bitmaps[c - d]!;
      if (this.bitmaps[c + d]) return this.bitmaps[c + d]!;
    }
    return null;
  }

  dispose() {
    this.disposed = true;
    this.controller.abort();
    for (let i = 0; i < this.count; i++) {
      const bm = this.bitmaps[i];
      if (bm) bm.close();
      this.bitmaps[i] = null;
      this.blobs[i] = null;
    }
  }
}
