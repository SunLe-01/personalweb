"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";

const ANIMATION_CONFIG = {
  smoothTau: 0.25,
  minCopies: 2,
  copyHeadroom: 2
} as const;

type LogoNodeItem = {
  node: ReactNode;
  title?: string;
  href?: string;
  ariaLabel?: string;
};

type LogoImageItem = {
  src: string;
  alt?: string;
  href?: string;
  title?: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export type LogoLoopItem = LogoNodeItem | LogoImageItem;

type LogoLoopProps = {
  logos: LogoLoopItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoLoopItem, key: string) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

function toCssLength(value: number | string | undefined) {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

function isImageLogo(item: LogoLoopItem): item is LogoImageItem {
  return "src" in item;
}

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 120,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = "Partner logos",
  className,
  style
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.minCopies);
  const [isHovered, setIsHovered] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  const isVertical = direction === "up" || direction === "down";

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) {
      return hoverSpeed;
    }

    if (pauseOnHover === false) {
      return undefined;
    }

    return 0;
  }, [hoverSpeed, pauseOnHover]);

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const axisDirection = isVertical ? (direction === "up" ? 1 : -1) : direction === "left" ? 1 : -1;
    const explicitDirection = speed < 0 ? -1 : 1;

    return magnitude * axisDirection * explicitDirection;
  }, [direction, isVertical, speed]);

  const updateDimensions = useCallback(() => {
    const container = containerRef.current;
    const sequence = seqRef.current;

    if (!container || !sequence) {
      return;
    }

    const sequenceRect = sequence.getBoundingClientRect();
    const measuredWidth = Math.ceil(sequenceRect.width);
    const measuredHeight = Math.ceil(sequenceRect.height);

    if (isVertical) {
      if (measuredHeight <= 0) {
        return;
      }

      setSeqHeight(measuredHeight);

      const viewportSize = container.clientHeight || measuredHeight;
      const copiesNeeded = Math.ceil(viewportSize / measuredHeight) + ANIMATION_CONFIG.copyHeadroom;
      setCopyCount(Math.max(ANIMATION_CONFIG.minCopies, copiesNeeded));
      return;
    }

    if (measuredWidth <= 0) {
      return;
    }

    setSeqWidth(measuredWidth);

    const viewportSize = container.clientWidth || measuredWidth;
    const copiesNeeded = Math.ceil(viewportSize / measuredWidth) + ANIMATION_CONFIG.copyHeadroom;
    setCopyCount(Math.max(ANIMATION_CONFIG.minCopies, copiesNeeded));
  }, [isVertical]);

  useEffect(() => {
    const elements = [containerRef.current, seqRef.current].filter(Boolean) as HTMLElement[];

    if (elements.length === 0) {
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      const handleResize = () => updateDimensions();
      window.addEventListener("resize", handleResize);
      updateDimensions();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    const observers = elements.map((element) => {
      const observer = new ResizeObserver(() => updateDimensions());
      observer.observe(element);
      return observer;
    });

    updateDimensions();

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [logos, logoHeight, gap, isVertical, updateDimensions]);

  useEffect(() => {
    const images = Array.from(seqRef.current?.querySelectorAll("img") ?? []);

    if (images.length === 0) {
      updateDimensions();
      return;
    }

    let remaining = images.length;

    const handleImageLoad = () => {
      remaining -= 1;

      if (remaining === 0) {
        updateDimensions();
      }
    };

    images.forEach((image) => {
      if (image.complete) {
        handleImageLoad();
        return;
      }

      image.addEventListener("load", handleImageLoad, { once: true });
      image.addEventListener("error", handleImageLoad, { once: true });
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener("load", handleImageLoad);
        image.removeEventListener("error", handleImageLoad);
      });
    };
  }, [logos, updateDimensions]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const sequenceSize = isVertical ? seqHeight : seqWidth;

    if (sequenceSize <= 0) {
      track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    offsetRef.current = ((offsetRef.current % sequenceSize) + sequenceSize) % sequenceSize;

    const updateTransform = (value: number) => {
      track.style.transform = isVertical
        ? `translate3d(0, ${-value}px, 0)`
        : `translate3d(${-value}px, 0, 0)`;
    };

    updateTransform(offsetRef.current);

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = isHovered && effectiveHoverSpeed !== undefined ? effectiveHoverSpeed : targetVelocity;
      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.smoothTau);

      velocityRef.current += (target - velocityRef.current) * easingFactor;

      let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
      nextOffset = ((nextOffset % sequenceSize) + sequenceSize) % sequenceSize;
      offsetRef.current = nextOffset;

      updateTransform(nextOffset);
      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastTimestampRef.current = null;
    };
  }, [effectiveHoverSpeed, isHovered, isVertical, seqHeight, seqWidth, targetVelocity]);

  const cssVariables = useMemo(
    () =>
      ({
        "--logoloop-gap": `${gap}px`,
        "--logoloop-logoHeight": `${logoHeight}px`,
        ...(fadeOutColor ? { "--logoloop-fadeColor": fadeOutColor } : null)
      }) as CSSProperties,
    [fadeOutColor, gap, logoHeight]
  );

  const rootClassName = useMemo(
    () =>
      [
        "logoloop",
        isVertical ? "logoloop--vertical" : "logoloop--horizontal",
        fadeOut ? "logoloop--fade" : null,
        scaleOnHover ? "logoloop--scale-hover" : null,
        className
      ]
        .filter(Boolean)
        .join(" "),
    [className, fadeOut, isVertical, scaleOnHover]
  );

  const handleMouseEnter = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) {
      setIsHovered(true);
    }
  }, [effectiveHoverSpeed]);

  const handleMouseLeave = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) {
      setIsHovered(false);
    }
  }, [effectiveHoverSpeed]);

  const renderLogoItem = useCallback(
    (item: LogoLoopItem, key: string) => {
      if (renderItem) {
        return (
          <li className="logoloop__item" key={key}>
            {renderItem(item, key)}
          </li>
        );
      }

      const content = isImageLogo(item) ? (
        <img
          src={item.src}
          srcSet={item.srcSet}
          sizes={item.sizes}
          width={item.width}
          height={item.height}
          alt={item.alt ?? ""}
          title={item.title}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : (
        <span className="logoloop__node" aria-hidden={item.href ? true : undefined}>
          {item.node}
        </span>
      );

      const itemAriaLabel = isImageLogo(item) ? item.alt ?? item.title : item.ariaLabel ?? item.title;

      const wrappedContent = item.href ? (
        <a
          className="logoloop__link"
          href={item.href}
          aria-label={itemAriaLabel || "logo link"}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content}
        </a>
      ) : (
        content
      );

      return (
        <li className="logoloop__item" key={key}>
          {wrappedContent}
        </li>
      );
    },
    [renderItem]
  );

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          className="logoloop__list"
          key={`copy-${copyIndex}`}
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? seqRef : undefined}
        >
          {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
        </ul>
      )),
    [copyCount, logos, renderLogoItem]
  );

  const rootStyle = useMemo(
    () =>
      ({
        width: toCssLength(width) ?? "100%",
        ...cssVariables,
        ...style
      }) as CSSProperties,
    [cssVariables, style, width]
  );

  return (
    <div ref={containerRef} className={rootClassName} style={rootStyle} role="region" aria-label={ariaLabel}>
      <div className="logoloop__track" ref={trackRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {logoLists}
      </div>
    </div>
  );
});

export default LogoLoop;
