"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay?: number;
}

export default function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  label,
  delay = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 60 });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(target);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [isInView, target, delay, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [springValue, prefix, suffix]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center"
    >
      <span
        ref={ref}
        className="text-5xl font-extralight tracking-tight text-stone-900 sm:text-6xl"
      >
        {prefix}0{suffix}
      </span>
      <motion.span
        initial={{ width: 0 }}
        whileInView={{ width: "2.5rem" }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay / 1000 + 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 block h-px bg-[#6B2737]"
      />
      <span className="mt-4 text-xs font-medium uppercase tracking-[0.3em] text-stone-500">
        {label}
      </span>
    </motion.div>
  );
}
