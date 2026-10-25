"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const slides = [
  {
    eyebrow: "TECH & GADGETS",
    title: "Smarter living, simplified",
    href: "/shop?category=electronics",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1600&h=900&fit=crop",
  },
  {
    eyebrow: "SPORTS & OUTDOORS",
    title: "Gear up for every adventure",
    href: "/shop?category=sports-outdoors",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&h=900&fit=crop",
  },
  {
    eyebrow: "HOME & KITCHEN",
    title: "Everyday essentials, elevated",
    href: "/shop?category=home-kitchen",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=900&fit=crop",
  },
  {
    eyebrow: "AUDIO",
    title: "Hear every detail",
    href: "/shop?category=headphones-audio",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&h=900&fit=crop",
  },
  {
    eyebrow: "FASHION",
    title: "Style that moves with you",
    href: "/shop?category=fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=900&fit=crop",
  },
  {
    eyebrow: "LAPTOPS",
    title: "Power for work and play",
    href: "/shop?category=laptops",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600&h=900&fit=crop",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 6000);
    return () => clearInterval(id);
  }, [total]);

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-zinc-900">
      <div className="relative aspect-[21/9] min-h-[280px] w-full sm:min-h-[360px]">
        {slides.map((s, i) => (
          <div
            key={s.title}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={s.image}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
        ))}

        <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white tabular-nums backdrop-blur">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-xl px-8 sm:px-12 lg:px-16">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-white/80">
              {slide.eyebrow}
            </p>
            <h1 className="font-serif text-3xl font-medium leading-tight text-white sm:text-4xl md:text-5xl">
              {slide.title}
            </h1>
            <Link
              href={slide.href}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-white/90"
            >
              Shop the look
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
          onClick={() => setIndex((i) => (i - 1 + total) % total)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
          onClick={() => setIndex((i) => (i + 1) % total)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 w-2 rounded-full transition",
                i === index ? "bg-white" : "bg-white/40",
              )}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
