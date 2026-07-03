"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface HeroCarouselProps {
  images: string[];
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="absolute inset-0">
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt="Featured furniture showcase"
          fill
          priority={index === 0}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-stone-950/55" />
    </div>
  );
}
