"use client";

import { motion } from "motion/react";
import type { ElementType } from "react";
import { easeSilk, durations, inViewOnce } from "@/lib/motion";

type SplitTextProps = {
  text: string;
  className?: string;
  /** Split unit. */
  by?: "word" | "line";
  as?: ElementType;
  stagger?: number;
  delay?: number;
};

/**
 * Editorial heading reveal: each word/line rises from behind a mask
 * (clip). Bespoke timing tuned to the house rhythm — never a canned effect.
 */
export function SplitText({
  text,
  className,
  by = "word",
  as = "span",
  stagger = 0.055,
  delay = 0,
}: SplitTextProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = as as any;
  const units = by === "line" ? text.split("\n") : text.split(" ");

  return (
    <Tag className={className}>
      <motion.span
        style={{ display: "inline" }}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      >
        {units.map((u, i) => (
          <span
            key={i}
            style={{
              display: by === "line" ? "block" : "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
            }}
          >
            <motion.span
              style={{ display: "inline-block", willChange: "transform" }}
              variants={{
                hidden: { y: "115%" },
                show: {
                  y: "0%",
                  transition: { duration: durations.slow, ease: easeSilk },
                },
              }}
            >
              {u}
              {by === "word" && i < units.length - 1 ? " " : null}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
