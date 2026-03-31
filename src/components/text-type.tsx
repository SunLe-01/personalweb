"use client";

import {
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type CSSProperties,
  type HTMLAttributes,
  type RefObject
} from "react";
import { gsap } from "gsap";

type Falloff = "linear" | "exponential" | "gaussian";

type ProximitySettings = {
  axis: string;
  fromValue: number;
  toValue: number;
};

type ProximityTextProps = {
  label: string;
  className?: string;
  style?: CSSProperties;
  containerRef?: RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: Falloff;
  fromFontVariationSettings?: string;
  toFontVariationSettings?: string;
};

type TextTypeProps = HTMLAttributes<HTMLElement> & {
  text: string | readonly string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  className?: string;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  active?: boolean;
  hideCursorOnComplete?: boolean;
  textColor?: CSSProperties["color"];
  onTextUpdate?: (value: string) => void;
  variableProximity?: boolean;
  proximityRadius?: number;
  proximityFalloff?: Falloff;
  fromFontVariationSettings?: string;
  toFontVariationSettings?: string;
  proximityContainerRef?: RefObject<HTMLElement | null>;
};

const parseFontVariationSettings = (settings: string) =>
  new Map<string, number>(
    settings
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => {
        const [axisToken, valueToken] = segment.split(/\s+/);
        const axis = axisToken?.replace(/["']/g, "") ?? "";
        const value = Number.parseFloat(valueToken ?? "0");
        return [axis, value] as const;
      })
      .filter((entry): entry is readonly [string, number] => Boolean(entry[0]) && !Number.isNaN(entry[1]))
  );

const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const calculateFalloff = (distance: number, radius: number, falloff: Falloff) => {
  const normalized = Math.min(Math.max(1 - distance / radius, 0), 1);

  switch (falloff) {
    case "exponential":
      return normalized ** 2;
    case "gaussian":
      return Math.exp(-((distance / Math.max(radius / 2, 1)) ** 2) / 2);
    case "linear":
    default:
      return normalized;
  }
};

function ProximityText({
  label,
  className = "",
  style,
  containerRef,
  radius = 110,
  falloff = "linear",
  fromFontVariationSettings = "'wght' 620, 'opsz' 16",
  toFontVariationSettings = "'wght' 980, 'opsz' 48"
}: ProximityTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: Number.NaN, y: Number.NaN });
  const parsedSettings = useMemo<ProximitySettings[]>(() => {
    const fromMap = parseFontVariationSettings(fromFontVariationSettings);
    const toMap = parseFontVariationSettings(toFontVariationSettings);

    return Array.from(fromMap.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toMap.get(axis) ?? fromValue
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  useEffect(() => {
    const updateMouse = (clientX: number, clientY: number) => {
      const container = containerRef?.current ?? rootRef.current;

      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMouseMove = (event: MouseEvent) => {
      updateMouse(event.clientX, event.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];

      if (touch) {
        updateMouse(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [containerRef]);

  useEffect(() => {
    let rafId = 0;

    const loop = () => {
      const container = containerRef?.current ?? rootRef.current;

      if (!container) {
        rafId = window.requestAnimationFrame(loop);
        return;
      }

      const { x, y } = mouseRef.current;
      if (lastMouseRef.current.x === x && lastMouseRef.current.y === y) {
        rafId = window.requestAnimationFrame(loop);
        return;
      }

      lastMouseRef.current = { x, y };

      const containerRect = container.getBoundingClientRect();

      letterRefs.current.forEach((letterRef) => {
        if (!letterRef) {
          return;
        }

        const rect = letterRef.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2 - containerRect.left;
        const centerY = rect.top + rect.height / 2 - containerRect.top;
        const distance = calculateDistance(x, y, centerX, centerY);

        if (distance >= radius) {
          letterRef.style.fontVariationSettings = fromFontVariationSettings;
          letterRef.style.transform = "translate3d(0, 0, 0) scale(1)";
          letterRef.style.opacity = "1";
          letterRef.style.filter = "brightness(1) saturate(1)";
          return;
        }

        const falloffValue = calculateFalloff(distance, radius, falloff);
        const newSettings = parsedSettings
          .map(({ axis, fromValue, toValue }) => {
            const interpolated = fromValue + (toValue - fromValue) * falloffValue;
            return `'${axis}' ${interpolated}`;
          })
          .join(", ");

        letterRef.style.fontVariationSettings = newSettings;
        letterRef.style.transform = `translate3d(0, ${-falloffValue * 0.1}em, 0) scale(${
          1 + falloffValue * 0.18
        }) skewX(${falloffValue * -4}deg)`;
        letterRef.style.opacity = `${0.82 + falloffValue * 0.18}`;
        letterRef.style.filter = `brightness(${1 + falloffValue * 0.38}) saturate(${
          1 + falloffValue * 0.22
        }) drop-shadow(0 0 ${6 + falloffValue * 10}px rgba(133, 20, 48, ${0.1 + falloffValue * 0.22}))`;
      });

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [containerRef, falloff, fromFontVariationSettings, parsedSettings, radius]);

  const words = useMemo(() => label.split(" "), [label]);
  let letterIndex = 0;

  return (
    <span ref={rootRef} className={`variable-proximity ${className}`.trim()} style={style}>
      {words.map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          className="variable-proximity__word"
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {word.split("").map((letter) => {
            const currentIndex = letterIndex;
            letterIndex += 1;

            return (
              <span
                key={`${letter}-${currentIndex}`}
                className="variable-proximity__letter"
                ref={(element) => {
                  letterRefs.current[currentIndex] = element;

                  if (element) {
                    element.style.fontVariationSettings = fromFontVariationSettings;
                  }
                }}
                style={{
                  display: "inline-block",
                  transformOrigin: "50% 100%",
                  "--proximity-gradient-delay": `${currentIndex * -0.32}s`,
                  willChange: "font-variation-settings, transform, opacity, filter"
                } as CSSProperties}
              >
                {letter}
              </span>
            );
          })}
          {wordIndex < words.length - 1 ? <span style={{ display: "inline-block" }}>&nbsp;</span> : null}
        </span>
      ))}
    </span>
  );
}

export function VariableProximityText(props: ProximityTextProps) {
  return <ProximityText {...props} />;
}

export function TextType({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 0,
  className = "",
  showCursor = true,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  active = true,
  hideCursorOnComplete = true,
  textColor,
  onTextUpdate,
  variableProximity = false,
  proximityRadius = 110,
  proximityFalloff = "linear",
  fromFontVariationSettings = "'wght' 620, 'opsz' 16",
  toFontVariationSettings = "'wght' 980, 'opsz' 48",
  proximityContainerRef,
  ...props
}: TextTypeProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const textArray = useMemo(() => (Array.isArray(text) ? [...text] : [text]), [text]);
  const currentText = textArray[0] ?? "";

  useEffect(() => {
    if (!showCursor || !cursorRef.current) {
      return;
    }

    gsap.set(cursorRef.current, { opacity: 1 });

    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });

    return () => {
      tween.kill();
      gsap.set(cursorRef.current, { opacity: 1 });
    };
  }, [cursorBlinkDuration, showCursor]);

  useEffect(() => {
    if (!active) {
      return;
    }

    setDisplayedText("");
    setCurrentCharIndex(0);
    setIsComplete(false);
  }, [active, currentText]);

  useEffect(() => {
    if (!active || isComplete) {
      return;
    }

    if (currentCharIndex >= currentText.length) {
      setIsComplete(true);
      return;
    }

    const delay = currentCharIndex === 0 ? initialDelay : typingSpeed;
    const timeout = window.setTimeout(() => {
      setDisplayedText((previous) => previous + currentText[currentCharIndex]);
      setCurrentCharIndex((previous) => previous + 1);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [active, currentCharIndex, currentText, initialDelay, isComplete, typingSpeed]);

  useEffect(() => {
    onTextUpdate?.(displayedText);
  }, [displayedText, onTextUpdate]);

  const shouldHideCursor = !showCursor || (hideCursorOnComplete && isComplete);

  return createElement(
    Component,
    {
      className: `text-type ${className}`.trim(),
      ...props
    },
    variableProximity ? (
      <ProximityText
        label={displayedText}
        className="text-type__content text-type__content--proximity"
        style={{ color: textColor ?? "inherit" }}
        containerRef={proximityContainerRef}
        radius={proximityRadius}
        falloff={proximityFalloff}
        fromFontVariationSettings={fromFontVariationSettings}
        toFontVariationSettings={toFontVariationSettings}
      />
    ) : (
      <span className="text-type__content" style={{ color: textColor ?? "inherit" }}>
        {displayedText}
      </span>
    ),
    showCursor && (
      <span
        ref={cursorRef}
        className={`text-type__cursor ${cursorClassName} ${
          shouldHideCursor ? "text-type__cursor--hidden" : ""
        }`.trim()}
      >
        {cursorCharacter}
      </span>
    )
  );
}
