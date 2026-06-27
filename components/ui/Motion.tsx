"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type MotionTag = "div" | "section" | "article" | "footer" | "header" | "li";

const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  footer: motion.footer,
  header: motion.header,
  li: motion.li,
};

const ease = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  as?: MotionTag;
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
  y?: number;
};

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  immediate = false,
  y = 22,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motionTags[as];

  if (prefersReducedMotion || immediate) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease, delay }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function Stagger({
  as = "div",
  children,
  className,
  delay = 0,
  immediate = false,
}: Omit<RevealProps, "y">) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motionTags[as];

  if (prefersReducedMotion || immediate) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.08,
          },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  as = "div",
  children,
  className,
}: Omit<RevealProps, "delay" | "y">) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motionTags[as];

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function MotionCard({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<typeof motion.article>) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -6,
              borderColor: "rgba(103, 232, 249, 0.36)",
            }
      }
      transition={{ duration: 0.22, ease }}
      className={cn(
        "rounded-lg border border-white/10 bg-[#05071a]",
        className
      )}
      {...props}
    >
      {children}
    </motion.article>
  );
}
