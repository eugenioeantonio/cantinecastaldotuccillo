"use client";

import { motion, type Variants } from "motion/react";
import type { ComponentProps, ElementType, ReactNode } from "react";
import { rise, riseSoft, stagger, inViewOnce } from "@/lib/motion";

/** Stable, module-scope motion components (never created during render). */
const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  li: motion.li,
  p: motion.p,
  span: motion.span,
} as const;

export type MotionTagName = keyof typeof TAGS;

type Dom = ComponentProps<typeof motion.div>;

type RevealProps = Dom & {
  children: ReactNode;
  /** Shorter travel for inline/secondary content. */
  soft?: boolean;
  /** Extra delay before the reveal starts. */
  delay?: number;
  as?: MotionTagName;
};

/** Single-element fade + blur + rise on entering the viewport. */
export function Reveal({
  children,
  soft = false,
  delay = 0,
  as = "div",
  ...rest
}: RevealProps) {
  const MotionTag = TAGS[as] as ElementType;
  const variant = soft ? riseSoft : rise;
  return (
    <MotionTag
      variants={variant}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

type RevealGroupProps = Dom & {
  children: ReactNode;
  gap?: number;
  delayChildren?: number;
  as?: MotionTagName;
};

/**
 * Staggered container: direct children should each use `variants={rise}`
 * (or wrap them with <RevealItem/>). Cascades on view.
 */
export function RevealGroup({
  children,
  gap = 0.09,
  delayChildren = 0,
  as = "div",
  ...rest
}: RevealGroupProps) {
  const MotionTag = TAGS[as] as ElementType;
  return (
    <MotionTag
      variants={stagger(gap, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

type RevealItemProps = Dom & {
  children: ReactNode;
  soft?: boolean;
  as?: MotionTagName;
};

export function RevealItem({
  children,
  soft = false,
  as = "div",
  ...rest
}: RevealItemProps) {
  const MotionTag = TAGS[as] as ElementType;
  const variant: Variants = soft ? riseSoft : rise;
  return (
    <MotionTag variants={variant} {...rest}>
      {children}
    </MotionTag>
  );
}
