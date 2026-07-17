"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useReducedMotion, type MotionValue } from "motion/react";

/**
 * Photoreal hero: a pre-rendered WebP frame sequence scrubbed by scroll —
 * the advertising-grade technique (Apple-style). Drop render frames into
 * /public/frames/{desktop,mobile}/glass_0000.webp … and this takes over the
 * hero automatically; nothing else needs to change.
 */
export const FRAME_SEQ = {
  desktop: { count: 120, dir: "/frames/desktop", pad: 4 },
  mobile: { count: 90, dir: "/frames/mobile", pad: 4 },
};

export function framePath(dir: string, i: number, pad: number) {
  return `${dir}/glass_${String(i).padStart(pad, "0")}.webp`;
}

export function HeroFrames({ progress }: { progress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const imgs = useRef<HTMLImageElement[]>([]);
  const cur = useRef(0);
  const cfg = useRef(FRAME_SEQ.desktop);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.matchMedia("(max-width:768px)").matches;
    cfg.current = isMobile ? FRAME_SEQ.mobile : FRAME_SEQ.desktop;
    const { count, dir, pad } = cfg.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    imgs.current = new Array(count);
    for (let i = 0; i < count; i++) {
      const im = new Image();
      im.src = framePath(dir, i, pad);
      imgs.current[i] = im;
    }

    const cover = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const ir = img.width / img.height;
      const cr = cw / ch;
      let w: number, h: number;
      if (ir > cr) {
        h = ch;
        w = ch * ir;
      } else {
        w = cw;
        h = cw / ir;
      }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const draw = () => {
      const im = imgs.current[cur.current] || imgs.current[0];
      if (im && im.naturalWidth) cover(im);
    };

    const size = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      draw();
    };

    const first = imgs.current[0];
    if (first.complete) size();
    else first.onload = size;

    window.addEventListener("resize", size);

    // Initial frame in reduced-motion mode = a poised, filled pose
    if (reduced) {
      cur.current = Math.round(count * 0.55);
      draw();
    }

    return () => window.removeEventListener("resize", size);
  }, [reduced]);

  useMotionValueEvent(progress, "change", (v) => {
    if (reduced) return;
    const { count } = cfg.current;
    const p = Math.max(0, Math.min(1, v / 0.8));
    const f = Math.round(p * (count - 1));
    if (f !== cur.current) {
      cur.current = f;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const im = imgs.current[f] || imgs.current[0];
      if (canvas && ctx && im && im.naturalWidth) {
        const cw = canvas.width;
        const ch = canvas.height;
        const ir = im.width / im.height;
        const cr = cw / ch;
        let w: number, h: number;
        if (ir > cr) {
          h = ch;
          w = ch * ir;
        } else {
          w = cw;
          h = cw / ir;
        }
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
      }
    }
  });

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
