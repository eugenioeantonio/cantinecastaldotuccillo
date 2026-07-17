"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { easeSilk } from "@/lib/motion";

/** A quiet, ceremonial open: the name, a drawn gold line, then the curtain lifts. */
export function Preloader() {
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setDone(true), reduced ? 200 : 1900);
    return () => clearTimeout(t);
  }, [reduced]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: easeSilk }}
        >
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: easeSilk }}
            className="font-serif text-[clamp(20px,3vw,30px)] tracking-[0.55em] [text-indent:0.55em] text-ivory"
          >
            CASTALDO&nbsp;TUCCILLO
          </motion.div>
          <motion.div
            initial={reduced ? false : { width: 0 }}
            animate={{ width: 190 }}
            transition={{ duration: 1.4, ease: easeSilk, delay: 0.3 }}
            className="hairline"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
