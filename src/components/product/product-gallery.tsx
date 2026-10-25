"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  title,
}: {
  images: { id: string; url: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-muted-foreground">
        No images
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
        <Image
          src={current.url}
          alt={title}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">More views</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white",
                  i === active ? "border-primary" : "border-transparent",
                )}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-contain p-1"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
