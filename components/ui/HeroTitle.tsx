"use client";

import { motion } from "framer-motion";

interface HeroTitleProps {
  lines: string[];
  startDelay?: number;
}

export default function HeroTitle({ lines, startDelay = 0.25 }: HeroTitleProps) {
  let wordCounter = 0;

  return (
    <h1 className="max-w-4xl text-[2.75rem] font-extralight leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[5rem]">
      {lines.map((line, lineIndex) => {
        const lineWords = line.split(" ");
        return (
          <span key={lineIndex} className="block overflow-hidden pb-1">
            {lineWords.map((word, i) => {
              const currentIndex = wordCounter;
              wordCounter += 1;
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                    delay: startDelay + currentIndex * 0.09,
                  }}
                  className="mr-[0.28em] inline-block"
                >
                  {word}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
