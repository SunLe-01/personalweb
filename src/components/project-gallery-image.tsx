"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";

type ProjectGalleryImageProps = {
  realSrc: string;
  fallbackSrc: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  objectPosition?: string;
  mobileObjectPosition?: string;
  scale?: number;
  className?: string;
};

export function ProjectGalleryImage({
  realSrc,
  fallbackSrc,
  alt,
  priority = false,
  sizes = "(max-width: 900px) 100vw, 60vw",
  objectPosition = "50% 50%",
  mobileObjectPosition,
  scale = 1,
  className
}: ProjectGalleryImageProps) {
  const [src, setSrc] = useState(realSrc);
  const imageClassName = ["project-page__image", className].filter(Boolean).join(" ");

  useEffect(() => {
    setSrc(realSrc);
  }, [realSrc]);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={imageClassName}
      style={
        {
          "--project-image-position": objectPosition,
          "--project-image-position-mobile": mobileObjectPosition ?? objectPosition,
          "--project-image-scale": String(scale)
        } as CSSProperties
      }
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}
