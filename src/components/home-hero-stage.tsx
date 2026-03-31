"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { GradientBlinds } from "@/components/gradient-blinds";

type HomeHeroStageProps = {
  active: boolean;
};

const homeGradientBlindsColors = ["#ff2d55", "#2a053f"] as const;

export function HomeHeroStage({ active }: HomeHeroStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const root = rootRef.current;
    const stageParts = root.querySelectorAll<HTMLElement>("[data-stage-part]");
    const timeline = gsap.timeline();

    timeline.fromTo(
      root,
      { autoAlpha: 0.2, scale: 0.985 },
      {
        autoAlpha: active ? 1 : 0.7,
        scale: 1,
        duration: active ? 0.88 : 0.44,
        ease: "power3.out"
      }
    );

    timeline.fromTo(
      stageParts,
      { autoAlpha: 0, scale: 0.96, y: 14 },
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 0.76,
        stagger: 0.07,
        ease: "power3.out"
      },
      0.04
    );

    return () => {
      timeline.kill();
    };
  }, [active]);

  return (
    <div ref={rootRef} className="home-hero-stage" aria-hidden="true">
      <div data-stage-part className="home-hero-stage__blinds">
        <GradientBlinds
          className="home-hero-stage__blinds-surface"
          paused={!active}
          gradientColors={homeGradientBlindsColors}
          angle={-18}
          noise={0.3}
          blindCount={18}
          blindMinWidth={36}
          mouseDampening={0.15}
          spotlightRadius={0.82}
          spotlightSoftness={1.15}
          spotlightOpacity={1}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>
      <div data-stage-part className="home-hero-stage__grain" />
    </div>
  );
}
