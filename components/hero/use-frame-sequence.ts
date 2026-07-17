"use client";

import { useEffect, useRef } from "react";
import {
  SEQUENCE,
  framePath,
  type SequenceVariant,
} from "./sequence-config";
import { ImageSequenceSource, type FrameSource } from "./frame-source";

export type SeqDebug = {
  frame: number;
  progress: number;
  fps: number;
  variant: "desktop" | "mobile";
  loaded: number;
  count: number;
  decoded: number;
  estMemMB: number;
  reduced: boolean;
  paused: boolean;
};

type NavigatorConnection = {
  saveData?: boolean;
  effectiveType?: string;
};
type NavigatorMemory = { deviceMemory?: number };

/** Checkpoint order used by Apple-style progressive preloads. */
function checkpoints(count: number): number[] {
  const last = count - 1;
  return [
    0,
    last,
    Math.round(last * 0.5),
    Math.round(last * 0.25),
    Math.round(last * 0.75),
    Math.round(last * 0.12),
    Math.round(last * 0.37),
    Math.round(last * 0.62),
    Math.round(last * 0.87),
  ];
}

function pickVariant(): SequenceVariant {
  if (typeof window === "undefined") return SEQUENCE.desktop;
  return window.matchMedia(`(max-width:${SEQUENCE.mobileBreakpoint - 0.02}px)`)
    .matches
    ? SEQUENCE.mobile
    : SEQUENCE.desktop;
}

function isLowMemory() {
  if (typeof navigator === "undefined") return false;
  const mem = (navigator as Navigator & NavigatorMemory).deviceMemory;
  return typeof mem === "number" && mem <= 4;
}

function isSaveData() {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: NavigatorConnection })
    .connection;
  if (!c) return false;
  return c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g";
}

/**
 * Drives the hero canvas from scroll. Everything lives in refs and a single
 * rAF loop — React state is only touched for the (optional) debug panel.
 */
export function useFrameSequence(debugEnabled: boolean) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Progress state (imperative — never setState per frame).
  const target = useRef(0); // 0..1 from scroll
  const current = useRef(0); // smoothed
  const activeFrame = useRef(-1);
  const inView = useRef(true);

  const debugRef = useRef<SeqDebug>({
    frame: 0, progress: 0, fps: 0, variant: "desktop",
    loaded: 0, count: 0, decoded: 0, estMemMB: 0, reduced: false, paused: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = isSaveData();
    const lowMem = isLowMemory();

    let variant = pickVariant();
    let source: FrameSource = createSource(variant);
    const bytesPerFrame = variant.width * variant.height * 4;
    debugRef.current.variant = variant.dir;
    debugRef.current.count = variant.count;
    debugRef.current.reduced = reduced;

    function createSource(v: SequenceVariant): FrameSource {
      const src = new ImageSequenceSource({
        count: v.count,
        url: (i) => framePath(v, i),
        bytesPerFrame: v.width * v.height * 4,
      });
      // On very slow links, only fetch the poster; otherwise checkpoints → fill.
      if (saveData) src.prime([0]);
      else src.prime(checkpoints(v.count));
      return src;
    }

    // ---- Canvas sizing (DPR capped to 2 for the iOS canvas-area limit) ----
    function sizeCanvas() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function draw(i: number) {
      if (!canvas || !ctx) return;
      const bm = source.frame(i);
      const cw = canvas.width;
      const ch = canvas.height;
      // Base fill = the end color, so any letterboxing merges with the
      // next section and the final (solid) frames are seamless.
      ctx.fillStyle = SEQUENCE.endColor;
      ctx.fillRect(0, 0, cw, ch);
      if (!bm) return;
      const ir = bm.width / bm.height;
      const cr = cw / ch;
      let w: number, h: number;
      if (ir > cr) {
        h = ch;
        w = ch * ir;
      } else {
        w = cw;
        h = cw / ir;
      }
      ctx.drawImage(bm, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    function computeTarget() {
      if (!section) return 0;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / total));
    }

    // ---- Main loop ----
    let raf = 0;
    let last = performance.now();
    let fpsEma = 60;
    const radius = lowMem ? variant.windowRadiusLow : variant.windowRadius;

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (fpsEma) fpsEma = fpsEma * 0.9 + (1 / Math.max(dt, 1e-3)) * 0.1;

      // Pause work only when the hero is scrolled out of view. Truly hidden
      // tabs are already handled by the browser (it stops firing rAF).
      const paused = !inView.current;

      if (reduced) {
        // Static, poised pose — no scrubbing, no decode churn.
        const f = Math.round((variant.count - 1) * 0.55);
        // Keep requesting until it's actually decoded, then stop.
        if (activeFrame.current !== f || !source.frame(f)) {
          source.ensureWindow(f, 2);
          activeFrame.current = f;
        }
        draw(f);
      } else if (!paused) {
        target.current = computeTarget();
        // Smooth, frame-rate-independent easing toward the scroll target.
        const k = 1 - Math.pow(0.0015, dt); // ~critically damped feel
        current.current += (target.current - current.current) * k;
        if (Math.abs(target.current - current.current) < 0.0002) {
          current.current = target.current;
        }
        const f = Math.round(current.current * (variant.count - 1));
        // Re-arm the window when the frame changes OR the current frame is
        // not decoded yet (e.g. its blob only just finished fetching).
        if (f !== activeFrame.current || !source.frame(f)) {
          source.ensureWindow(f, radius);
          activeFrame.current = f;
        }
        draw(f);
      }

      if (debugEnabled) {
        const d = debugRef.current;
        d.frame = activeFrame.current;
        d.progress = reduced ? 0.55 : current.current;
        d.fps = fpsEma;
        d.loaded = source.loadedCount;
        d.count = variant.count;
        d.decoded = (source as ImageSequenceSource).decodedCount ?? 0;
        d.estMemMB = (d.decoded * bytesPerFrame) / 1048576;
        d.paused = paused;
      }
    }

    // ---- Observers & listeners ----
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        sizeCanvas();
        draw(activeFrame.current < 0 ? 0 : activeFrame.current);
      }, 150);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (es) => {
        inView.current = es[0].isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(section);

    // Reset the frame clock when returning to a backgrounded tab, so the
    // smoothing doesn't lurch on the first frame after resume.
    const onVisibility = () => {
      if (document.visibilityState === "visible") last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Swap sequence only when we actually cross the breakpoint.
    const mq = window.matchMedia(
      `(max-width:${SEQUENCE.mobileBreakpoint - 0.02}px)`,
    );
    const onBreakpoint = () => {
      const next = pickVariant();
      if (next.dir === variant.dir) return;
      source.dispose();
      variant = next;
      source = createSource(variant);
      activeFrame.current = -1;
      debugRef.current.variant = variant.dir;
      debugRef.current.count = variant.count;
      sizeCanvas();
    };
    mq.addEventListener("change", onBreakpoint);

    sizeCanvas();
    draw(0);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener("change", onBreakpoint);
      window.clearTimeout(resizeTimer);
      source.dispose();
    };
  }, [debugEnabled]);

  return { sectionRef, canvasRef, debugRef };
}
