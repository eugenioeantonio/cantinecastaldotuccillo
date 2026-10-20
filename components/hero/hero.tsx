"use client";

import { useState, useSyncExternalStore } from "react";
import { HERO_RENDERER } from "./sequence-config";
import { PourHero } from "./pour-hero";
import { WineGlassScrollSequence } from "./wine-glass-scroll-sequence";
import { supportsWebGL2 } from "./pour/renderer";

const subscribe = () => () => {};

/**
 * Chooses the hero. The live pour needs WebGL2 and a visitor who has not
 * asked for reduced motion; everyone else gets the original photoreal frame
 * sequence (which also handles reduced motion with a still frame).
 */
export function Hero() {
  const capable = useSyncExternalStore(
    subscribe,
    () =>
      HERO_RENDERER === "pour" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      supportsWebGL2(),
    () => HERO_RENDERER === "pour",
  );
  const [failed, setFailed] = useState(false);

  if (capable && !failed) return <PourHero onFail={() => setFailed(true)} />;
  return <WineGlassScrollSequence />;
}
