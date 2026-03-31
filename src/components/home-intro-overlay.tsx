"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import styles from "./home-intro-overlay.module.css";

type HomeIntroOverlayProps = {
  active: boolean;
  title: string;
  subtitle: string;
  label?: string;
  onComplete: () => void;
};

export function HomeIntroOverlay({
  active,
  title,
  subtitle,
  label = "Opening Frame",
  onComplete
}: HomeIntroOverlayProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const leftCurtainRef = useRef<HTMLDivElement | null>(null);
  const rightCurtainRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const seamRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef(false);

  useLayoutEffect(() => {
    if (!active) {
      return;
    }

    completedRef.current = false;

    const root = rootRef.current;
    const leftCurtain = leftCurtainRef.current;
    const rightCurtain = rightCurtainRef.current;
    const labelNode = labelRef.current;
    const titleNode = titleRef.current;
    const subtitleNode = subtitleRef.current;
    const seam = seamRef.current;
    const glow = glowRef.current;
    const pulse = pulseRef.current;

    if (
      !root ||
      !leftCurtain ||
      !rightCurtain ||
      !labelNode ||
      !titleNode ||
      !subtitleNode ||
      !seam ||
      !glow ||
      !pulse
    ) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        if (completedRef.current) {
          return;
        }

        completedRef.current = true;
        onComplete();
      }
    });

    gsap.set(root, { autoAlpha: 1 });
    gsap.set([labelNode, subtitleNode], { autoAlpha: 0, y: 16 });
    gsap.set(titleNode, { autoAlpha: 0, y: 28, scale: 0.94 });
    gsap.set(seam, { autoAlpha: 0, scaleY: 0.24, transformOrigin: "center center" });
    gsap.set(glow, { autoAlpha: 0, scaleX: 0.72, transformOrigin: "center center" });
    gsap.set(pulse, { autoAlpha: 0, scale: 0.88, transformOrigin: "center center" });
    gsap.set(leftCurtain, { xPercent: 0 });
    gsap.set(rightCurtain, { xPercent: 0 });

    if (prefersReducedMotion) {
      timeline.to(root, {
        autoAlpha: 0,
        duration: 0.24,
        delay: 0.24,
        ease: "power2.out"
      });

      return () => {
        timeline.kill();
      };
    }

    timeline
      .to([labelNode, subtitleNode], {
        autoAlpha: 1,
        y: 0,
        duration: 0.38,
        stagger: 0.04
      })
      .to(
        titleNode,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.58,
          ease: "power4.out"
        },
        "<0.06"
      )
      .to(
        glow,
        {
          autoAlpha: 1,
          scaleX: 1,
          duration: 0.42
        },
        "<0.02"
      )
      .to(
        [seam, pulse],
        {
          autoAlpha: 1,
          scale: 1,
          scaleY: 1,
          duration: 0.36,
          stagger: 0.04
        },
        "<0.08"
      )
      .to(
        [leftCurtain, rightCurtain],
        {
          xPercent: (index) => (index === 0 ? -108 : 108),
          duration: 1.04,
          ease: "power4.inOut"
        },
        "+=0.16"
      )
      .to(
        glow,
        {
          autoAlpha: 0,
          duration: 0.2
        },
        "<0.18"
      )
      .to(
        seam,
        {
          autoAlpha: 0,
          duration: 0.16
        },
        "<"
      )
      .to(
        titleNode,
        {
          autoAlpha: 0,
          y: -20,
          duration: 0.26
        },
        "<0.06"
      )
      .to(
        [labelNode, subtitleNode],
        {
          autoAlpha: 0,
          y: -12,
          duration: 0.22,
          stagger: 0.02
        },
        "<"
      )
      .to(
        root,
        {
          autoAlpha: 0,
          duration: 0.22,
          ease: "power2.out"
        },
        "-=0.08"
      );

    return () => {
      timeline.kill();
    };
  }, [active, onComplete]);

  if (!active) {
    return null;
  }

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div className={styles.backdrop} />
      <div className={styles.frame} />
      <div ref={pulseRef} className={styles.pulse} />
      <div ref={glowRef} className={styles.glow} />
      <div ref={seamRef} className={styles.seam} />
      <div ref={leftCurtainRef} className={`${styles.curtain} ${styles.curtainLeft}`}>
        <div className={styles.curtainInner} />
      </div>
      <div ref={rightCurtainRef} className={`${styles.curtain} ${styles.curtainRight}`}>
        <div className={styles.curtainInner} />
      </div>
      <div className={styles.copy}>
        <p ref={labelRef} className={styles.label}>
          {label}
        </p>
        <h2 ref={titleRef} className={styles.title}>
          {title}
        </h2>
        <p ref={subtitleRef} className={styles.subtitle}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default HomeIntroOverlay;
