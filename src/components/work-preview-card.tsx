"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent
} from "react";

import { ProjectGalleryImage } from "@/components/project-gallery-image";
import type { ProjectGalleryItem, ProjectItem } from "@/data/portfolio";

import styles from "./work-preview-card.module.css";

const ANIMATION_CONFIG = {
  INITIAL_DURATION: 1200,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  ENTER_TRANSITION_MS: 180
};

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);
const round = (value: number, precision = 3) => Number.parseFloat(value.toFixed(precision));
const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));

type WorkPreviewCardProps = {
  project: ProjectItem;
  media: ProjectGalleryItem;
  className?: string;
  enableTilt?: boolean;
  onActivate?: () => void;
  disabled?: boolean;
};

function assignForwardedRef<T>(ref: ForwardedRef<T>, value: T) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

export const WorkPreviewCard = forwardRef<HTMLDivElement, WorkPreviewCardProps>(function WorkPreviewCard(
  { project, media, className, enableTilt = true, onActivate, disabled = false },
  forwardedRef
) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const enterTimerRef = useRef<number | null>(null);
  const leaveRafRef = useRef<number | null>(null);

  const setWrapperRef = useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      assignForwardedRef(forwardedRef, node);
    },
    [forwardedRef]
  );

  const tiltEngine = useMemo(() => {
    if (!enableTilt) {
      return null;
    }

    let rafId: number | null = null;
    let running = false;
    let lastTimestamp = 0;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const defaultTau = 0.14;
    const initialTau = 0.6;
    let initialUntil = 0;

    const setVarsFromXY = (x: number, y: number) => {
      const shell = shellRef.current;
      const wrapper = wrapperRef.current;

      if (!shell || !wrapper) {
        return;
      }

      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;

      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);
      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties: Record<string, string> = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 5.1))}deg`,
        "--rotate-y": `${round(centerY / 4.2)}deg`
      };

      for (const [property, propertyValue] of Object.entries(properties)) {
        wrapper.style.setProperty(property, propertyValue);
      }
    };

    const step = (timestamp: number) => {
      if (!running) {
        return;
      }

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }

      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const tau = timestamp < initialUntil ? initialTau : defaultTau;
      const factor = 1 - Math.exp(-delta / tau);

      currentX += (targetX - currentX) * factor;
      currentY += (targetY - currentY) * factor;

      setVarsFromXY(currentX, currentY);

      const stillMoving = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;
      if (stillMoving || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
        return;
      }

      running = false;
      lastTimestamp = 0;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const start = () => {
      if (running) {
        return;
      }

      running = true;
      lastTimestamp = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate(x: number, y: number) {
        currentX = x;
        currentY = y;
        setVarsFromXY(currentX, currentY);
      },
      setTarget(x: number, y: number) {
        targetX = x;
        targetY = y;
        start();
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) {
          return;
        }

        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(durationMs: number) {
        initialUntil = performance.now() + durationMs;
        start();
      },
      getCurrent() {
        return { x: currentX, y: currentY, targetX, targetY };
      },
      cancel() {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }

        rafId = null;
        running = false;
        lastTimestamp = 0;
      }
    };
  }, [enableTilt]);

  const getOffsets = useCallback((event: PointerEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) {
        return;
      }

      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [getOffsets, tiltEngine]
  );

  const handlePointerEnter = useCallback(
    (event: PointerEvent) => {
      const shell = shellRef.current;
      const wrapper = wrapperRef.current;
      if (!shell || !wrapper || !tiltEngine) {
        return;
      }

      wrapper.classList.add(styles.isActive);
      shell.classList.add(styles.isActive, styles.isEntering);

      if (enterTimerRef.current) {
        window.clearTimeout(enterTimerRef.current);
      }

      enterTimerRef.current = window.setTimeout(() => {
        shell.classList.remove(styles.isEntering);
      }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);

      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [getOffsets, tiltEngine]
  );

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    const wrapper = wrapperRef.current;
    if (!shell || !wrapper || !tiltEngine) {
      return;
    }

    tiltEngine.toCenter();

    const checkSettle = () => {
      const { x, y, targetX, targetY } = tiltEngine.getCurrent();
      const settled = Math.hypot(targetX - x, targetY - y) < 0.6;

      if (settled) {
        wrapper.classList.remove(styles.isActive);
        shell.classList.remove(styles.isActive);
        leaveRafRef.current = null;
        return;
      }

      leaveRafRef.current = requestAnimationFrame(checkSettle);
    };

    if (leaveRafRef.current) {
      cancelAnimationFrame(leaveRafRef.current);
    }

    leaveRafRef.current = requestAnimationFrame(checkSettle);
  }, [tiltEngine]);

  useEffect(() => {
    if (!enableTilt || !tiltEngine) {
      return;
    }

    const shell = shellRef.current;
    const wrapper = wrapperRef.current;
    if (!shell || !wrapper) {
      return;
    }

    shell.addEventListener("pointerenter", handlePointerEnter);
    shell.addEventListener("pointermove", handlePointerMove);
    shell.addEventListener("pointerleave", handlePointerLeave);

    const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    tiltEngine.setImmediate(initialX, ANIMATION_CONFIG.INITIAL_Y_OFFSET);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

    return () => {
      shell.removeEventListener("pointerenter", handlePointerEnter);
      shell.removeEventListener("pointermove", handlePointerMove);
      shell.removeEventListener("pointerleave", handlePointerLeave);

      if (enterTimerRef.current) {
        window.clearTimeout(enterTimerRef.current);
      }

      if (leaveRafRef.current) {
        cancelAnimationFrame(leaveRafRef.current);
      }

      tiltEngine.cancel();
      wrapper.classList.remove(styles.isActive);
      shell.classList.remove(styles.isActive, styles.isEntering);
    };
  }, [enableTilt, handlePointerEnter, handlePointerLeave, handlePointerMove, tiltEngine]);

  const cardStyle = useMemo(
    () =>
      ({
        "--preview-background": project.preview.background,
        "--preview-surface": project.preview.surface,
        "--preview-aspect-ratio": project.preview.aspectRatio,
        "--behind-glow-color": "rgba(255, 50, 50, 0.4)",
        "--behind-glow-size": project.preview.layout === "window" ? "62%" : "58%",
        "--inner-gradient":
          project.preview.copyAlign === "end"
            ? "linear-gradient(145deg, rgba(34, 24, 34, 0.78) 0%, rgba(110, 8, 8, 0.18) 55%, rgba(255,255,255,0.04) 100%)"
            : "linear-gradient(145deg, rgba(18, 22, 30, 0.78) 0%, rgba(126, 20, 20, 0.18) 54%, rgba(255,255,255,0.04) 100%)",
        "--preview-copy-width": project.preview.layout === "portrait" ? "min(25rem, 84%)" : "min(24rem, 82%)"
      }) as CSSProperties,
    [project.preview]
  );

  const isInteractive = Boolean(onActivate) && !disabled;

  const handleActivate = useCallback(() => {
    if (!isInteractive || !onActivate) {
      return;
    }

    onActivate();
  }, [isInteractive, onActivate]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractive) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate?.();
      }
    },
    [isInteractive, onActivate]
  );

  return (
    <div
      ref={setWrapperRef}
      className={[styles.wrapper, isInteractive ? styles.isInteractive : "", className].filter(Boolean).join(" ")}
      style={cardStyle}
      role={isInteractive ? "link" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Open ${project.title} project` : undefined}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.behind} />
      <div ref={shellRef} className={styles.shell}>
        <section
          className={styles.card}
          data-layout={project.preview.layout}
          data-copy-align={project.preview.copyAlign}
        >
          <div className={styles.inside}>
            <div data-preview-part className={styles.base} />
            <div className={styles.shine} />
            <div className={styles.glare} />

            <div className={styles.mediaLayer}>
              <div data-preview-media className={styles.imageFrame}>
                <ProjectGalleryImage
                  realSrc={media.realSrc}
                  fallbackSrc={media.fallbackSrc}
                  alt={media.imageAlt}
                  priority={false}
                  sizes="(max-width: 900px) 100vw, 34vw"
                  objectPosition={media.crop.previewPosition ?? media.crop.detailPosition}
                  mobileObjectPosition={media.crop.mobilePosition}
                  scale={media.crop.previewScale ?? media.crop.detailScale ?? 1}
                  className={styles.image}
                />
              </div>
            </div>

            <div data-preview-part className={styles.metaRow}>
              <span>{project.client}</span>
              <span>{project.year}</span>
            </div>

            <div data-preview-part className={styles.copy}>
              <span className={styles.eyebrow}>{project.preview.eyebrow}</span>
              <h3>{project.preview.heading}</h3>
              <p>{project.summary}</p>
              <ul className={styles.tags}>
                {project.preview.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});

export default WorkPreviewCard;
