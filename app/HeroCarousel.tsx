"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface HeroCarouselProps {
  images: string[];
}

const SLIDE_DURATION = 6000;

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    setZoomed(false);
    const raf = requestAnimationFrame(() => setZoomed(true));
    return () => cancelAnimationFrame(raf);
  }, [activeIndex]);

  return (
    <div className="absolute inset-0">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 transition-transform ease-linear"
            style={{
              transitionDuration: `${SLIDE_DURATION + 1200}ms`,
              transform:
                index === activeIndex && zoomed ? "scale(1.08)" : "scale(1)",
            }}
          >
            <Image
              src={src}
              alt="Featured furniture showcase"
              fill
              priority={index === 0}
              className="object-cover"
            />
          </div>
        </div>
      ))}
      {/* cinematic gradient: darker at bottom, clearer at top */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-stone-950/40 to-stone-950/70" />
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
