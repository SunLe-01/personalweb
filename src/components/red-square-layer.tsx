"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";

import { redTargets } from "@/data/portfolio";
import type { RedTarget } from "@/data/portfolio";
import type { SectionId } from "@/lib/section-types";

type RedSquareLayerProps = {
  activeSection: SectionId;
};

type DustParticle = {
  id: string;
  left: number;
  top: number;
  size: number;
  blur: number;
  alpha: number;
  scale: number;
  depth: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  twinkle: number;
};

const DUST_PARTICLES: DustParticle[] = [
  {
    id: "dust-1",
    left: 18,
    top: 22,
    size: 3.2,
    blur: 0.2,
    alpha: 0.22,
    scale: 1,
    depth: 2,
    driftX: 6,
    driftY: 12,
    duration: 16,
    delay: -4,
    twinkle: 7
  },
  {
    id: "dust-2",
    left: 29,
    top: 64,
    size: 2.4,
    blur: 0.35,
    alpha: 0.18,
    scale: 0.9,
    depth: 1,
    driftX: -5,
    driftY: 10,
    duration: 18,
    delay: -8,
    twinkle: 8.5
  },
  {
    id: "dust-3",
    left: 43,
    top: 28,
    size: 4.2,
    blur: 0.45,
    alpha: 0.16,
    scale: 1.12,
    depth: 3,
    driftX: 8,
    driftY: -7,
    duration: 21,
    delay: -3,
    twinkle: 10
  },
  {
    id: "dust-4",
    left: 58,
    top: 44,
    size: 2.8,
    blur: 0.28,
    alpha: 0.15,
    scale: 0.96,
    depth: 2,
    driftX: -7,
    driftY: 8,
    duration: 17.5,
    delay: -11,
    twinkle: 8
  },
  {
    id: "dust-5",
    left: 69,
    top: 24,
    size: 3.6,
    blur: 0.4,
    alpha: 0.19,
    scale: 1.08,
    depth: 2,
    driftX: 5,
    driftY: 13,
    duration: 22,
    delay: -6,
    twinkle: 9.2
  },
  {
    id: "dust-6",
    left: 77,
    top: 62,
    size: 2.2,
    blur: 0.3,
    alpha: 0.13,
    scale: 0.84,
    depth: 1,
    driftX: -4,
    driftY: -9,
    duration: 15.5,
    delay: -9,
    twinkle: 6.8
  },
  {
    id: "dust-7",
    left: 34,
    top: 48,
    size: 5,
    blur: 0.65,
    alpha: 0.11,
    scale: 1.18,
    depth: 4,
    driftX: 9,
    driftY: 11,
    duration: 24,
    delay: -12,
    twinkle: 11
  },
  {
    id: "dust-8",
    left: 52,
    top: 72,
    size: 2.7,
    blur: 0.32,
    alpha: 0.17,
    scale: 0.92,
    depth: 1,
    driftX: 6,
    driftY: -8,
    duration: 19,
    delay: -5,
    twinkle: 8.4
  },
  {
    id: "dust-9",
    left: 84,
    top: 38,
    size: 3.1,
    blur: 0.35,
    alpha: 0.12,
    scale: 1.04,
    depth: 2,
    driftX: -6,
    driftY: 7,
    duration: 20.5,
    delay: -14,
    twinkle: 9
  }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toPixels(target: RedTarget, viewport: { width: number; height: number }) {
  return {
    x: (target.x / 100) * viewport.width,
    y: (target.y / 100) * viewport.height,
    width: (target.width / 100) * viewport.width,
    height: (target.height / 100) * viewport.height,
    rotation: target.rotation,
    borderRadius: target.radius,
    opacity: target.opacity
  };
}

function getDustStyle(particle: DustParticle): CSSProperties {
  return {
    "--dust-left": `${particle.left}%`,
    "--dust-top": `${particle.top}%`,
    "--dust-size": `${particle.size}px`,
    "--dust-blur": `${particle.blur}px`,
    "--dust-alpha": particle.alpha.toString(),
    "--dust-scale": particle.scale.toString(),
    "--dust-depth": `${particle.depth}px`,
    "--dust-drift-x": `${particle.driftX}px`,
    "--dust-drift-y": `${particle.driftY}px`,
    "--dust-duration": `${particle.duration}s`,
    "--dust-delay": `${particle.delay}s`,
    "--dust-twinkle": `${particle.twinkle}s`
  } as CSSProperties;
}

export function RedSquareLayer({ activeSection }: RedSquareLayerProps) {
  const squareRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const isInteractive = activeSection === "contact";

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const target = useMemo(() => {
    const layout = viewport.width < 900 ? "mobile" : "desktop";
    return redTargets[activeSection][layout];
  }, [activeSection, viewport.width]);

  useEffect(() => {
    if (!squareRef.current || viewport.width === 0) {
      return;
    }

    gsap.set(squareRef.current, {
      transformPerspective: 1200,
      transformOrigin: "center center"
    });

    gsap.to(squareRef.current, {
      ...toPixels(target, viewport),
      duration: 0.88,
      ease: "power3.inOut"
    });
  }, [target, viewport]);

  useEffect(() => {
    const square = squareRef.current;
    const pulse = pulseRef.current;
    if (!square || !pulse) {
      return;
    }

    square.style.setProperty("--glare-x", "56%");
    square.style.setProperty("--glare-y", "24%");
    square.style.setProperty("--glare-opacity", isInteractive ? "0.54" : "0");
    square.style.setProperty("--pulse-x", "50%");
    square.style.setProperty("--pulse-y", "50%");
    square.style.setProperty("--pulse-scale", "0.16");
    square.style.setProperty("--pulse-opacity", "0");

    gsap.killTweensOf(square, "rotationX,rotationY");
    gsap.set(square, { rotationX: 0, rotationY: 0 });

    if (!isInteractive) {
      return;
    }

    const setGlareX = gsap.quickTo(square, "--glare-x", {
      duration: 0.26,
      ease: "power3.out",
      unit: "%"
    });
    const setGlareY = gsap.quickTo(square, "--glare-y", {
      duration: 0.26,
      ease: "power3.out",
      unit: "%"
    });
    const setGlareOpacity = gsap.quickTo(square, "--glare-opacity", {
      duration: 0.26,
      ease: "power3.out"
    });
    const setRotateX = gsap.quickTo(square, "rotationX", {
      duration: 0.3,
      ease: "power3.out"
    });
    const setRotateY = gsap.quickTo(square, "rotationY", {
      duration: 0.3,
      ease: "power3.out"
    });

    const resetInteraction = () => {
      setGlareX(56);
      setGlareY(24);
      setGlareOpacity(0.54);
      setRotateX(0);
      setRotateY(0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = square.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const relativeX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const relativeY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      const falloff = clamp(
        1 - distance / Math.max(window.innerWidth * 0.7, window.innerHeight * 0.7),
        0.22,
        1
      );
      const tiltX = (0.5 - relativeY) * 10 * falloff;
      const tiltY = (relativeX - 0.5) * 12 * falloff;

      setGlareX(relativeX * 100);
      setGlareY(relativeY * 100);
      setGlareOpacity(0.24 + falloff * 0.46);
      setRotateX(tiltX);
      setRotateY(tiltY);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const rect = square.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const pulseX = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      const pulseY = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

      square.style.setProperty("--pulse-x", `${pulseX}%`);
      square.style.setProperty("--pulse-y", `${pulseY}%`);

      gsap.killTweensOf(square, "--pulse-scale");
      gsap.killTweensOf(square, "--pulse-opacity");
      gsap.fromTo(
        square,
        {
          "--pulse-scale": 0.14,
          "--pulse-opacity": 0.82
        },
        {
          "--pulse-scale": 1.9,
          "--pulse-opacity": 0,
          duration: 0.82,
          ease: "power3.out"
        }
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("blur", resetInteraction);
    window.addEventListener("pointerleave", resetInteraction);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("blur", resetInteraction);
      window.removeEventListener("pointerleave", resetInteraction);
      resetInteraction();
    };
  }, [isInteractive]);

      return (
        <div className="red-square-layer" data-active-section={activeSection} aria-hidden="true">
          <div ref={squareRef} className="red-square-layer__box" data-interactive={isInteractive}>
            <span className="red-square-layer__surface" />
            <span className="red-square-layer__dust red-square-layer__dust--base">
              {DUST_PARTICLES.map((particle) => (
                <span
                  key={`${particle.id}-base`}
                  className="red-square-layer__dust-particle"
                  style={getDustStyle(particle)}
                />
              ))}
            </span>
            <span className="red-square-layer__dust red-square-layer__dust--lit">
              {DUST_PARTICLES.map((particle) => (
                <span
                  key={`${particle.id}-lit`}
                  className="red-square-layer__dust-particle"
                  style={getDustStyle(particle)}
                />
              ))}
            </span>
            <span className="red-square-layer__sheen" />
            <span ref={pulseRef} className="red-square-layer__pulse" />
          </div>
    </div>
  );
}
