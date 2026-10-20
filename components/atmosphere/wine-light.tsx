/**
 * The wine's light, carried through the dark scenes after the pour: a slow
 * ruby glow and a few faint shafts, as if the room were still lit through
 * a glass. Pure CSS (no canvas); drifts only when motion is allowed.
 */
export function WineLight({ side = "right", className = "" }: { side?: "left" | "right"; className?: string }) {
  return (
    <div aria-hidden className={`wine-light pointer-events-none absolute inset-0 overflow-hidden ${className}`} data-side={side}>
      <span className="wine-light-glow" />
      <span className="wine-light-shafts" />
    </div>
  );
}
