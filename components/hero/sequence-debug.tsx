"use client";

import { useEffect, useState, type RefObject } from "react";
import type { SeqDebug } from "./use-frame-sequence";

/**
 * Developer HUD for the frame sequence. Rendered ONLY when
 * `?debugWineSequence=true`. Polls the live ref that the rAF loop mutates on
 * a throttled interval (never per-frame React work, never reads the ref
 * during render).
 */
export function SequenceDebug({ debugRef }: { debugRef: RefObject<SeqDebug> }) {
  const [d, setD] = useState<SeqDebug | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (debugRef.current) setD({ ...debugRef.current });
    }, 200);
    return () => window.clearInterval(id);
  }, [debugRef]);

  if (!d) return null;
  const rows: [string, string][] = [
    ["sequence", d.variant.toUpperCase()],
    ["frame", `${d.frame + 1} / ${d.count}`],
    ["progress", `${(d.progress * 100).toFixed(1)}%`],
    ["fps", d.fps.toFixed(0)],
    ["preload", `${d.loaded} / ${d.count}`],
    ["decoded", `${d.decoded} frame`],
    ["est. memory", `${d.estMemMB.toFixed(0)} MB`],
    ["reduced-motion", d.reduced ? "on" : "off"],
    ["state", d.paused ? "paused" : "running"],
  ];
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-[60] rounded-md border border-gold/30 bg-black/70 p-3 font-mono text-[11px] leading-relaxed text-ivory/90 backdrop-blur">
      <div className="mb-1 tracking-[0.2em] text-gold">WINE SEQUENCE · DEBUG</div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-6">
          <span className="text-stone/70">{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}
