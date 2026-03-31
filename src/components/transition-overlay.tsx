"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { gsap } from "gsap";

const COLUMN_COUNT = 15;

export type TransitionOverlayHandle = {
  play: (onCovered?: () => void) => Promise<void>;
};

export const TransitionOverlay = forwardRef<TransitionOverlayHandle>(function TransitionOverlay(_, ref) {
  const columnsRef = useRef<Array<HTMLDivElement | null>>([]);

  useImperativeHandle(ref, () => ({
    play: (onCovered) =>
      new Promise<void>((resolve) => {
        const columns = columnsRef.current.filter(Boolean) as HTMLDivElement[];

        gsap.killTweensOf(columns);
        gsap.set(columns, { scaleY: 0, transformOrigin: "top center" });

        const timeline = gsap.timeline({
          defaults: { ease: "power4.inOut" },
          onComplete: () => resolve()
        });

        timeline
          .to(columns, {
            scaleY: 1,
            duration: 0.34,
            stagger: 0.026
          })
          .add(() => {
            onCovered?.();
          }, ">-0.02")
          .to(
            columns,
            {
              scaleY: 0,
              transformOrigin: "bottom center",
              duration: 0.34,
              stagger: {
                each: 0.026,
                from: "end"
              }
            },
            "+=0.08"
          );
      })
  }));

  return (
    <div className="transition-overlay" aria-hidden="true">
      {Array.from({ length: COLUMN_COUNT }).map((_, index) => (
        <div
          key={index}
          ref={(node) => {
            columnsRef.current[index] = node;
          }}
          className="transition-overlay__column"
        />
      ))}
    </div>
  );
});
