"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "motion/react";
import { SEQUENCE } from "./sequence-config";
import { HeroOverlay } from "./hero-overlay";
import { POUR_GEOMETRY } from "./pour/geometry.generated";
import { buildTimeline, smoothstep, type PourVariant } from "./pour/choreography";
import { PourRenderer } from "./pour/renderer";

/** How long the glass takes to rise out of the dark once its layers are in. */
const EMERGE_MS = 2400;

/**
 * The live hero: the photographed glass, tilted by scroll until it pours,
 * its wine pooling up the frame into the deep field the site continues on.
 * Any failure (no WebGL2, lost context, missing asset) hands over to the
 * original frame sequence through `onFail`.
 */
export function PourHero({ onFail }: { onFail: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const failRef = useRef(onFail);
  useEffect(() => {
    failRef.current = onFail;
  }, [onFail]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    document.documentElement.style.setProperty("--seq-end", SEQUENCE.endColor);

    const variant: PourVariant = window.matchMedia(
      `(max-width: ${SEQUENCE.mobileBreakpoint - 0.02}px)`,
    ).matches
      ? "mobile"
      : "desktop";

    let renderer: PourRenderer;
    try {
      renderer = new PourRenderer(canvas, variant);
    } catch {
      failRef.current();
      return;
    }
    const timeline = buildTimeline(POUR_GEOMETRY[variant]);
    renderer.setRest(timeline.at(0));

    let alive = true;
    let raf = 0;
    let readyAt = 0;
    let visible = true;
    let target = 0;
    let current = 0;
    let last = performance.now();
    // adaptive quality: long frames lower the render scale, a step at a time
    let slow = 0;
    let sampled = 0;

    const measure = () => {
      const r = section.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      target = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
    };

    const tick = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!visible || !readyAt) return;
      measure();
      // A heavy, critically damped follow: the glass has weight, never bounces.
      current += (target - current) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - current) < 1e-5) current = target;

      const t = smoothstep(0, 1, (now - readyAt) / EMERGE_MS);
      renderer.render(timeline.at(current), 1 - (1 - t) ** 3);

      if (dt > 0.026) slow++;
      if (++sampled === 45) {
        if (slow > 18 && renderer.quality > 0.55) {
          renderer.quality *= 0.8;
          renderer.resize();
        }
        slow = 0;
        sampled = 0;
      }
    };

    renderer
      .load()
      .then(() => {
        if (!alive) return;
        renderer.resize();
        // a reload mid-page starts where the reader is, not from the top
        measure();
        current = target;
        readyAt = performance.now();
        raf = requestAnimationFrame(tick);
      })
      .catch(() => alive && failRef.current());

    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(section);
    const onLost = (e: Event) => {
      e.preventDefault();
      failRef.current();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      renderer.dispose();
    };
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label="Introduzione — Il tempo diventa vino"
      className="relative"
      style={{ height: `${SEQUENCE.stickyVh}vh` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink">
        {/* The glass and its wine (decorative; the words are in the overlay) */}
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <HeroOverlay progress={scrollYProgress} reduced={false} />
      </div>
    </section>
  );
}
