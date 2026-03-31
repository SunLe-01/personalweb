"use client";

import { useEffect, useRef, useState } from "react";

type ProjectTitleGLProps = {
  title: string;
  active: boolean;
  preferWebGL?: boolean;
};

const SOURCE_WIDTH = 2400;
const SOURCE_HEIGHT = 720;
const MAX_DPR = 1.5;
const IDLE_STATE = {
  hover: 0,
  trail: 0.16,
  lineCount: 13,
  lineWidth: 0.24,
  distort: 0.024,
  offset: 0
};
const ACTIVE_STATE = {
  hover: 1,
  trail: 1,
  lineCount: 1.5,
  lineWidth: 0.92,
  distort: 0.12,
  offset: 0.24
};

type AnimationState = {
  hover: number;
  trail: number;
  lineCount: number;
  lineWidth: number;
  distort: number;
  offset: number;
  exit: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function blendColor(from: [number, number, number], to: [number, number, number], amount: number) {
  return [
    Math.round(mix(from[0], to[0], amount)),
    Math.round(mix(from[1], to[1], amount)),
    Math.round(mix(from[2], to[2], amount))
  ] as const;
}

function rgba(color: readonly [number, number, number], alpha: number) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function createTextMask(title: string) {
  const canvas = document.createElement("canvas");
  canvas.width = SOURCE_WIDTH;
  canvas.height = SOURCE_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.font = "900 540px Impact, Arial Black, sans-serif";
  context.fillText(title, 0, canvas.height / 2 + 22);

  return canvas;
}

function sizeCanvasToElement(canvas: HTMLCanvasElement) {
  const bounds = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const width = Math.max(1, Math.round(bounds.width * dpr));
  const height = Math.max(1, Math.round(bounds.height * dpr));

  if (canvas.width === width && canvas.height === height) {
    return;
  }

  canvas.width = width;
  canvas.height = height;
}

function drawEffectFill(
  context: CanvasRenderingContext2D,
  maskCanvas: HTMLCanvasElement,
  time: number,
  state: AnimationState
) {
  const width = maskCanvas.width;
  const height = maskCanvas.height;
  context.clearRect(0, 0, width, height);

  const colorMix = clamp(state.hover * 0.78 + state.trail * 0.12, 0, 1);
  const lightColor = blendColor([248, 236, 232], [255, 110, 92], colorMix);
  const darkColor = blendColor([160, 132, 134], [255, 88, 72], colorMix);
  const hotColor = blendColor([255, 228, 220], [255, 150, 118], clamp(0.35 + state.hover * 0.45, 0, 1));

  const baseGradient = context.createLinearGradient(0, 0, width, 0);
  baseGradient.addColorStop(0, rgba(lightColor, 1));
  baseGradient.addColorStop(0.55, rgba(darkColor, 1));
  baseGradient.addColorStop(1, rgba(lightColor, 1));
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, width, height);

  const lineCount = Math.max(state.lineCount, 1.2);
  const stripeGap = width / lineCount;
  const stripeWidth = stripeGap * clamp(state.lineWidth, 0.14, 0.98);
  const sweepShift = (state.offset + time * (0.14 + state.hover * 0.24 + state.trail * 0.04)) * stripeGap * 2.2;
  const idleSlant = (1 - state.hover) * height * 0.08;

  context.fillStyle = rgba([255, 255, 255], 0.36 + state.hover * 0.12);
  for (let x = -stripeGap * 2; x < width + stripeGap * 2; x += stripeGap) {
    const stripeX = x - (sweepShift % stripeGap);
    context.beginPath();
    context.moveTo(stripeX + idleSlant, 0);
    context.lineTo(stripeX + stripeWidth + idleSlant, 0);
    context.lineTo(stripeX + stripeWidth - idleSlant, height);
    context.lineTo(stripeX - idleSlant, height);
    context.closePath();
    context.fill();
  }

  const headX = ((time * (0.1 + state.hover * 0.18 + state.trail * 0.05) + state.offset * 0.6) % 1) * width;
  const tailX = headX - width * (0.12 + state.trail * 0.08);

  context.globalCompositeOperation = "screen";

  const headGradient = context.createLinearGradient(headX - width * 0.16, 0, headX + width * 0.1, 0);
  headGradient.addColorStop(0, "rgba(255,255,255,0)");
  headGradient.addColorStop(0.5, rgba(hotColor, 0.56 + state.hover * 0.18));
  headGradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = headGradient;
  context.fillRect(0, 0, width, height);

  const tailGradient = context.createLinearGradient(tailX - width * 0.18, 0, tailX + width * 0.1, 0);
  tailGradient.addColorStop(0, "rgba(255,255,255,0)");
  tailGradient.addColorStop(0.5, "rgba(255,90,90,0.18)");
  tailGradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = tailGradient;
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = "overlay";
  for (let y = 0; y < height; y += 10) {
    const alpha = 0.035 + 0.025 * Math.sin(y * 0.16 + time * 7.4);
    context.fillStyle = `rgba(255,255,255,${alpha})`;
    context.fillRect(0, y, width, 3);
  }

  context.globalCompositeOperation = "destination-in";
  context.drawImage(maskCanvas, 0, 0);
  context.globalCompositeOperation = "source-over";
}

function drawCanvasFrame(
  canvas: HTMLCanvasElement,
  effectCanvas: HTMLCanvasElement,
  state: AnimationState,
  time: number
) {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);

  const stripCount = 30;
  const sourceStripHeight = effectCanvas.height / stripCount;
  const destinationStripHeight = height / stripCount;
  const horizontalAmplitude = width * state.distort * 0.1;
  const verticalAmplitude = height * state.distort * 0.032;
  const overallAlpha = 0.72 + state.hover * 0.26;

  context.globalAlpha = overallAlpha;

  for (let index = 0; index < stripCount; index += 1) {
    const progress = index / Math.max(stripCount - 1, 1);
    const bend = Math.sin(progress * 8 + time * 1.3) * horizontalAmplitude * (0.4 + state.hover * 0.7);
    const fold = Math.sin(progress * 11 + time * 1.05) * horizontalAmplitude * 0.28;
    const shear = (progress - 0.5) * state.exit * width * 0.08;
    const driftY = Math.sin(progress * 7 + time * 1.1) * verticalAmplitude;
    const sourceY = index * sourceStripHeight;
    const destinationY = index * destinationStripHeight + driftY;

    context.drawImage(
      effectCanvas,
      0,
      sourceY,
      effectCanvas.width,
      sourceStripHeight + 2,
      bend + fold + shear,
      destinationY,
      width,
      destinationStripHeight + 2
    );
  }

  if (state.exit > 0.01) {
    context.globalAlpha = state.exit * 0.14;
    context.drawImage(effectCanvas, 0, 0, effectCanvas.width, effectCanvas.height, width * 0.018, 0, width, height);
  }

  context.globalAlpha = 1;
}

export function ProjectTitleGL({ title, active, preferWebGL = true }: ProjectTitleGLProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousActiveRef = useRef(active);
  const kickRenderRef = useRef<(() => void) | null>(null);
  const inViewRef = useRef(false);
  const targetStateRef = useRef<AnimationState>({
    ...IDLE_STATE,
    ...ACTIVE_STATE,
    hover: active ? 1 : 0,
    trail: active ? 1 : 0.16,
    lineCount: active ? 1.5 : 13,
    lineWidth: active ? 0.92 : 0.24,
    distort: active ? 0.12 : 0.024,
    offset: active ? 0.24 : 0,
    exit: 0
  });
  const currentStateRef = useRef<AnimationState>({ ...targetStateRef.current });
  const [renderMode, setRenderMode] = useState<"canvas" | "fallback">(preferWebGL ? "canvas" : "fallback");

  useEffect(() => {
    if (!preferWebGL || typeof window === "undefined" || window.innerWidth <= 900) {
      setRenderMode("fallback");
      inViewRef.current = false;
      return;
    }

    setRenderMode("canvas");
  }, [preferWebGL]);

  useEffect(() => {
    if (!rootRef.current || renderMode !== "canvas") {
      inViewRef.current = false;
      return;
    }

    const root = rootRef.current;
    const scrollRoot = root.closest(".projects-shell__list");
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        inViewRef.current = entry?.isIntersecting ?? false;
        if (inViewRef.current) {
          kickRenderRef.current?.();
        }
      },
      {
        root: scrollRoot instanceof Element ? scrollRoot : null,
        rootMargin: "220px 0px 220px 0px",
        threshold: 0.01
      }
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
      inViewRef.current = false;
    };
  }, [renderMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root || renderMode !== "canvas") {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      setRenderMode("fallback");
      return;
    }

    const maskCanvas = createTextMask(title);
    const effectCanvas = document.createElement("canvas");
    effectCanvas.width = SOURCE_WIDTH;
    effectCanvas.height = SOURCE_HEIGHT;
    const effectContext = effectCanvas.getContext("2d");
    if (!effectContext) {
      setRenderMode("fallback");
      return;
    }

    let frame = 0;
    let destroyed = false;

    const resize = () => {
      if (destroyed) {
        return;
      }

      sizeCanvasToElement(canvas);
    };

    const renderFrame = (timestamp: number) => {
      if (destroyed) {
        return false;
      }

      const target = targetStateRef.current;
      const current = currentStateRef.current;
      const time = timestamp * 0.001;

      current.hover = mix(current.hover, target.hover, target.hover > current.hover ? 0.18 : 0.14);
      current.trail = mix(current.trail, target.trail, 0.12);
      current.lineCount = mix(current.lineCount, target.lineCount, 0.12);
      current.lineWidth = mix(current.lineWidth, target.lineWidth, 0.12);
      current.distort = mix(current.distort, target.distort, 0.12);
      current.offset = mix(current.offset, target.offset, 0.1);
      current.exit = mix(current.exit, 0, 0.12);

      drawEffectFill(effectContext, maskCanvas, time, current);
      drawCanvasFrame(canvas, effectCanvas, current, time);

      const needsMoreFrames =
        inViewRef.current ||
        Math.abs(current.hover - target.hover) > 0.002 ||
        Math.abs(current.trail - target.trail) > 0.002 ||
        Math.abs(current.lineCount - target.lineCount) > 0.01 ||
        Math.abs(current.lineWidth - target.lineWidth) > 0.002 ||
        Math.abs(current.distort - target.distort) > 0.001 ||
        Math.abs(current.offset - target.offset) > 0.001 ||
        current.exit > 0.002;

      return needsMoreFrames;
    };

    const tick = (timestamp: number) => {
      frame = 0;
      if (renderFrame(timestamp)) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const kick = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(tick);
      }
    };
    kickRenderRef.current = kick;

    const resizeObserver = new ResizeObserver(() => {
      resize();
      kick();
    });

    resizeObserver.observe(root);
    resize();
    kick();

    return () => {
      destroyed = true;
      kickRenderRef.current = null;
      resizeObserver.disconnect();
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [renderMode, title]);

  useEffect(() => {
    if (!active && previousActiveRef.current) {
      currentStateRef.current.exit = 1;
    }

    targetStateRef.current = {
      hover: active ? ACTIVE_STATE.hover : IDLE_STATE.hover,
      trail: active ? ACTIVE_STATE.trail : IDLE_STATE.trail,
      lineCount: active ? ACTIVE_STATE.lineCount : IDLE_STATE.lineCount,
      lineWidth: active ? ACTIVE_STATE.lineWidth : IDLE_STATE.lineWidth,
      distort: active ? ACTIVE_STATE.distort : IDLE_STATE.distort,
      offset: active ? ACTIVE_STATE.offset : IDLE_STATE.offset,
      exit: currentStateRef.current.exit
    };

    previousActiveRef.current = active;
    kickRenderRef.current?.();
  }, [active]);

  return (
    <div ref={rootRef} className="project-title-gl" data-active={active} data-renderer={renderMode}>
      <div className="project-title-gl__canvas" aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>
      <span className="project-title-gl__fallback">{title}</span>
    </div>
  );
}
