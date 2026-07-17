/**
 * Single source of truth for the hero wine-glass frame sequence.
 * Change values here and the whole hero (canvas, preload, ring buffer,
 * placeholder generator, next-section color) follows.
 */

export type SequenceVariant = {
  /** Sub-folder under basePath. */
  dir: "desktop" | "mobile";
  /** Number of frames (files are 1-based: frame_0001 … frame_{count}). */
  count: number;
  /** Native render resolution. */
  width: number;
  height: number;
  /** Ring-buffer radius (frames decoded on each side of the current frame). */
  windowRadius: number;
  /** Reduced radius under memory pressure. */
  windowRadiusLow: number;
};

export const SEQUENCE = {
  /** Public base path for the frames. */
  basePath: "/sequences/wine-glass",
  filePrefix: "frame_",
  /** Zero-padding width for the frame index. */
  pad: 4,
  ext: "webp",
  /**
   * Bump when the frame files change (same filenames, new content) so
   * browsers/CDN fetch fresh assets instead of serving the cached sequence.
   */
  version: "2",

  /**
   * The color the final frames converge to AND the background of the section
   * that follows. Configurable in one place (requirement: no hard-coding in
   * multiple spots). Injected at runtime as the CSS var `--seq-end`.
   */
  endColor: "#25070D",

  /** Sticky scroll length (vh). Range 350–450. */
  stickyVh: 420,

  /** Below this viewport width we serve the vertical mobile sequence. */
  mobileBreakpoint: 768,

  desktop: {
    dir: "desktop",
    count: 120,
    width: 1920,
    height: 1080,
    windowRadius: 8,
    windowRadiusLow: 4,
  } satisfies SequenceVariant,

  mobile: {
    dir: "mobile",
    count: 90,
    width: 828,
    height: 1472,
    windowRadius: 6,
    windowRadiusLow: 3,
  } satisfies SequenceVariant,
} as const;

/** Build the public URL for frame `i` (1-based). */
export function framePath(variant: SequenceVariant, i: number): string {
  const n = String(i + 1).padStart(SEQUENCE.pad, "0");
  return `${SEQUENCE.basePath}/${variant.dir}/${SEQUENCE.filePrefix}${n}.${SEQUENCE.ext}?v=${SEQUENCE.version}`;
}

/** Poster (first frame) URL used for LCP / no-JS / fallback. */
export function posterPath(variant: SequenceVariant): string {
  return framePath(variant, 0);
}
