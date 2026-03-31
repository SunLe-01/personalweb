"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type HTMLAttributes } from "react";

import styles from "./scrambled-text.module.css";

type ScrambledTextProps = {
  as?: "p" | "div" | "span";
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: CSSProperties;
  children: string;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "style">;

type CharMetric = {
  x: number;
  y: number;
};

type ActiveChar = {
  endTime: number;
  nextSwapTime: number;
  revealLeadMs: number;
  swapEveryMs: number;
};

function renderCharacter(character: string) {
  if (character === " ") {
    return "\u00A0";
  }

  return character;
}

export function ScrambledText({
  as: Component = "p",
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = ".:",
  className = "",
  style,
  children,
  ...htmlProps
}: ScrambledTextProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const charRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const charMetricsRef = useRef<CharMetric[]>([]);
  const activeCharsRef = useRef<Map<number, ActiveChar>>(new Map());
  const frameRef = useRef<number | null>(null);

  const characters = useMemo(() => Array.from(children), [children]);

  useEffect(() => {
    charRefs.current = charRefs.current.slice(0, characters.length);
  }, [characters.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const measureChars = () => {
      charRefs.current.forEach((node) => {
        if (!node) {
          return;
        }

        node.style.width = "";
        node.style.minWidth = "";
      });

      charMetricsRef.current = charRefs.current.map((node) => {
        if (!node) {
          return { x: 0, y: 0 };
        }

        const rect = node.getBoundingClientRect();
        node.style.width = `${rect.width}px`;
        node.style.minWidth = `${rect.width}px`;

        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      });
    };

    const updateChar = (index: number, time: number) => {
      const node = charRefs.current[index];
      const activeChar = activeCharsRef.current.get(index);

      if (!node || !activeChar) {
        activeCharsRef.current.delete(index);
        return false;
      }

      const original = node.dataset.content ?? "";

      if (time >= activeChar.endTime || original.trim().length === 0) {
        node.textContent = renderCharacter(original);
        activeCharsRef.current.delete(index);
        return false;
      }

      if (time >= activeChar.nextSwapTime) {
        const remaining = activeChar.endTime - time;
        if (remaining <= activeChar.revealLeadMs) {
          node.textContent = renderCharacter(original);
        } else {
          const randomIndex = Math.floor(Math.random() * scrambleChars.length);
          node.textContent = scrambleChars[randomIndex] ?? original;
        }

        activeChar.nextSwapTime = time + activeChar.swapEveryMs;
      }

      return true;
    };

    const tick = (time: number) => {
      frameRef.current = null;
      let hasActiveChars = false;

      activeCharsRef.current.forEach((_, index) => {
        hasActiveChars = updateChar(index, time) || hasActiveChars;
      });

      if (hasActiveChars) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    const ensureFrame = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    const activateChar = (index: number, intensity: number) => {
      const node = charRefs.current[index];
      if (!node) {
        return;
      }

      const original = node.dataset.content ?? "";
      if (original.trim().length === 0) {
        return;
      }

      const now = performance.now();
      const totalDuration = Math.max(140, duration * 1000 * intensity);
      const swapEveryMs = Math.max(24, 72 / Math.max(speed, 0.1));
      const revealLeadMs = Math.max(60, totalDuration * 0.24);
      const current = activeCharsRef.current.get(index);

      if (current) {
        current.endTime = Math.max(current.endTime, now + totalDuration);
        current.revealLeadMs = Math.max(current.revealLeadMs, revealLeadMs);
        current.swapEveryMs = swapEveryMs;
        return;
      }

      activeCharsRef.current.set(index, {
        endTime: now + totalDuration,
        nextSwapTime: now,
        revealLeadMs,
        swapEveryMs
      });
      ensureFrame();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const isNearBlock =
        event.clientX >= rect.left - radius &&
        event.clientX <= rect.right + radius &&
        event.clientY >= rect.top - radius &&
        event.clientY <= rect.bottom + radius;

      if (!isNearBlock) {
        return;
      }

      const metrics = charMetricsRef.current;
      for (let index = 0; index < metrics.length; index += 1) {
        const metric = metrics[index];
        const dx = event.clientX - metric.x;
        const dy = event.clientY - metric.y;
        const dist = Math.hypot(dx, dy);

        if (dist >= radius) {
          continue;
        }

        activateChar(index, 1 - dist / radius);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      measureChars();
    });

    resizeObserver.observe(root);
    measureChars();
    void document.fonts.ready.then(() => {
      measureChars();
    });

    root.addEventListener("pointerenter", measureChars);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", measureChars);

    return () => {
      root.removeEventListener("pointerenter", measureChars);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", measureChars);
      resizeObserver.disconnect();

      activeCharsRef.current.forEach((_, index) => {
        const node = charRefs.current[index];
        if (node) {
          node.textContent = renderCharacter(node.dataset.content ?? "");
        }
      });
      activeCharsRef.current.clear();

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [characters, duration, radius, scrambleChars, speed]);

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        rootRef.current = node;
      }}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style}
      {...htmlProps}
    >
      {characters.map((character, index) => (
        <span
          key={`${character}-${index}`}
          ref={(node) => {
            charRefs.current[index] = node;
          }}
          className={styles.char}
          data-content={character}
        >
          {renderCharacter(character)}
        </span>
      ))}
    </Component>
  );
}

export default ScrambledText;
