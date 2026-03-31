"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type WhoMorphCanvasProps = {
  active: boolean;
  hovered: boolean;
  variant: number;
  triggerKey: string;
};

type Rgb = [number, number, number];
type TonePalette = {
  ghost: Rgb;
  top: Rgb;
  mid: Rgb;
  bottom: Rgb;
  shadow: Rgb;
};

const WHO_TONE_PALETTES: TonePalette[] = [
  {
    ghost: [108, 0, 0],
    top: [255, 104, 104],
    mid: [255, 38, 38],
    bottom: [194, 0, 0],
    shadow: [255, 32, 32]
  },
  {
    ghost: [44, 16, 72],
    top: [168, 110, 255],
    mid: [120, 62, 214],
    bottom: [62, 22, 118],
    shadow: [163, 108, 255]
  },
  {
    ghost: [124, 24, 24],
    top: [255, 186, 186],
    mid: [255, 108, 136],
    bottom: [228, 52, 82],
    shadow: [255, 132, 132]
  }
];

function mixRgb(a: Rgb, b: Rgb, amount: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * amount),
    Math.round(a[1] + (b[1] - a[1]) * amount),
    Math.round(a[2] + (b[2] - a[2]) * amount)
  ];
}

function rgba(rgb: Rgb, alpha: number) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function resolveTonePalette(tone: number): TonePalette {
  const safeTone = Math.min(Math.max(tone, 0), WHO_TONE_PALETTES.length - 1);
  const lowerIndex = Math.floor(safeTone);
  const upperIndex = Math.min(lowerIndex + 1, WHO_TONE_PALETTES.length - 1);
  const mix = safeTone - lowerIndex;
  const lower = WHO_TONE_PALETTES[lowerIndex];
  const upper = WHO_TONE_PALETTES[upperIndex];

  return {
    ghost: mixRgb(lower.ghost, upper.ghost, mix),
    top: mixRgb(lower.top, upper.top, mix),
    mid: mixRgb(lower.mid, upper.mid, mix),
    bottom: mixRgb(lower.bottom, upper.bottom, mix),
    shadow: mixRgb(lower.shadow, upper.shadow, mix)
  };
}

function drawSteppedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  segments: number,
  jitter: number
) {
  const topStep = width / (segments + 1);
  const sideStep = height / (segments + 1);

  context.beginPath();
  context.moveTo(x + radius, y);

  for (let i = 1; i <= segments; i += 1) {
    const px = x + i * topStep;
    const py = y + (i % 2 === 0 ? jitter : 0);
    context.lineTo(px, py);
  }

  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);

  for (let i = 1; i <= segments; i += 1) {
    const py = y + i * sideStep;
    const px = x + width - (i % 2 === 0 ? jitter : 0);
    context.lineTo(px, py);
  }

  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

  for (let i = segments; i >= 1; i -= 1) {
    const px = x + i * topStep;
    const py = y + height - (i % 2 === 1 ? jitter : 0);
    context.lineTo(px, py);
  }

  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);

  for (let i = segments; i >= 1; i -= 1) {
    const py = y + i * sideStep;
    const px = x + (i % 2 === 1 ? jitter : 0);
    context.lineTo(px, py);
  }

  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawWhoWord(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  const fontSize = height * 0.94;
  const baseline = height * 0.605;
  const tracking = width * (0.006 + (1 - progress) * 0.008);
  const stretch = 1 + (1 - progress) * 0.18;
  const letters = ["W", "H", "O"];

  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
  context.scale(stretch, 1);

  const metrics = letters.map((letter) => context.measureText(letter).width);
  const totalWidth =
    metrics.reduce((sum, value) => sum + value, 0) + tracking * (letters.length - 1);
  let cursor = width / (2 * stretch) - totalWidth / 2;

  letters.forEach((letter, index) => {
    const advance = metrics[index];
    context.fillText(letter, cursor + advance / 2, baseline);
    cursor += advance + tracking;
  });

  context.restore();
}

export function WhoMorphCanvas({
  active,
  hovered,
  variant,
  triggerKey
}: WhoMorphCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousHoveredRef = useRef(hovered);
  const sizeRef = useRef({ width: 0, height: 0 });
  const frameRef = useRef<number | null>(null);
  const animationRef = useRef({
    progress: active ? 1 : 0.22,
    hover: hovered ? 1 : 0,
    exit: 0,
    time: 0,
    tone: variant
  });

  useEffect(() => {
    const resizeCanvas = () => {
      if (!wrapperRef.current || !canvasRef.current) {
        return;
      }

      const { width, height } = wrapperRef.current.getBoundingClientRect();
      sizeRef.current = { width, height };
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = Math.max(1, Math.floor(width * dpr));
      canvasRef.current.height = Math.max(1, Math.floor(height * dpr));
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;

      const context = canvasRef.current.getContext("2d");
      if (!context) {
        return;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [variant]);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) {
      return;
    }

    const { width, height } = wrapperRef.current.getBoundingClientRect();
    const tween = gsap.to(animationRef.current, {
      progress: active ? 1 : 0.22,
      duration: active ? 1.05 : 0.42,
      ease: active ? "power3.inOut" : "power2.out",
      onUpdate: () => {
        draw(
          context,
          width,
          height,
          animationRef.current.progress,
          animationRef.current.hover,
          animationRef.current.exit,
          animationRef.current.time,
          variant,
          animationRef.current.tone
        );
      }
    });

    return () => {
      tween.kill();
    };
  }, [active, triggerKey, variant]);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) {
      return;
    }

    const { width, height } = wrapperRef.current.getBoundingClientRect();
    const timeline = gsap.timeline({
      onUpdate: () => {
        draw(
          context,
          width,
          height,
          animationRef.current.progress,
          animationRef.current.hover,
          animationRef.current.exit,
          animationRef.current.time,
          variant,
          animationRef.current.tone
        );
      }
    });

    if (!hovered && previousHoveredRef.current) {
      timeline.fromTo(
        animationRef.current,
        { exit: 0.9 },
        { exit: 0, duration: 0.42, ease: "power2.out" },
        0
      );
    }

    timeline.to(
      animationRef.current,
      {
        hover: hovered ? 1 : 0,
        duration: hovered ? 0.36 : 0.28,
        ease: hovered ? "power2.out" : "power2.inOut"
      },
      0
    );

    previousHoveredRef.current = hovered;

    return () => {
      timeline.kill();
    };
  }, [hovered, variant]);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) {
      return;
    }

    const { width, height } = wrapperRef.current.getBoundingClientRect();
    const tween = gsap.to(animationRef.current, {
      tone: variant,
      duration: 0.48,
      ease: "power2.inOut",
      onUpdate: () => {
        draw(
          context,
          width,
          height,
          animationRef.current.progress,
          animationRef.current.hover,
          animationRef.current.exit,
          animationRef.current.time,
          variant,
          animationRef.current.tone
        );
      }
    });

    return () => {
      tween.kill();
    };
  }, [variant]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) {
      return;
    }

    const render = () => {
      animationRef.current.time += active ? 0.018 : 0.012;
      const { width, height } = sizeRef.current;

      if (width > 0 && height > 0) {
        draw(
          context,
          width,
          height,
          animationRef.current.progress,
          animationRef.current.hover,
          animationRef.current.exit,
          animationRef.current.time,
          variant,
          animationRef.current.tone
        );
      }

      frameRef.current = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [active, variant, triggerKey]);

  return (
    <div ref={wrapperRef} className="who-morph" aria-label="WHO">
      <canvas ref={canvasRef} />
    </div>
  );
}

function draw(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  hover: number,
  exit: number,
  time: number,
  variant: number,
  tone: number
) {
  context.clearRect(0, 0, width, height);

  const tonePalette = resolveTonePalette(tone);

  const padX = width * 0.03;
  const padY = height * 0.12;
  const blockWidth = width - padX * 2;
  const blockHeight = height - padY * 2;
  const radius = Math.max(14, height * 0.11);
  const variantShift = variant * width * 0.018;
  const jitter = Math.max(6, height * 0.07) * (0.42 + (1 - progress) * 0.6 + hover * 0.28);
  const shutters =
    width *
    (0.18 + (1 - progress) * 0.24 - hover * 0.05 + exit * 0.06 + Math.sin(time * 1.4 + variant) * 0.01);
  const sweepPhase = (time * (0.28 + hover * 0.08) + variant * 0.14) % 1;
  const sweepX = padX - blockWidth * 0.35 + sweepPhase * blockWidth * 1.72;
  const innerInset = height * (0.06 + progress * 0.03);
  const sliceOffset = width * (0.012 + hover * 0.014 + exit * 0.04);
  const ghostYOffset = Math.sin(time * 1.8 + variant) * 2.4;

  context.save();
  context.globalAlpha = 0.22 + exit * 0.22;
  context.fillStyle = rgba(tonePalette.ghost, 1);
  drawSteppedRect(
    context,
    padX + sliceOffset * 0.55,
    padY + 4 + ghostYOffset,
    blockWidth,
    blockHeight,
    radius,
    6,
    jitter * 0.9
  );
  context.fill();
  context.restore();

  context.save();
  const fill = context.createLinearGradient(padX, padY, padX, padY + blockHeight);
  fill.addColorStop(0, rgba(tonePalette.top, 0.98));
  fill.addColorStop(0.34, rgba(tonePalette.mid, 0.98));
  fill.addColorStop(1, rgba(tonePalette.bottom, 0.98));
  context.fillStyle = fill;
  drawSteppedRect(
    context,
    padX + Math.sin(time * 1.1 + variant * 0.6) * variantShift * 0.18,
    padY,
    blockWidth,
    blockHeight,
    radius,
    6,
    jitter
  );
  context.shadowColor = rgba(tonePalette.shadow, 0.28);
  context.shadowBlur = 28 + hover * 12;
  context.fill();
  context.restore();

  context.save();
  context.globalCompositeOperation = "destination-out";
  context.fillStyle = "#000";
  context.fillRect(padX, padY, shutters, blockHeight);
  context.fillRect(width - padX - shutters, padY, shutters, blockHeight);
  drawWhoWord(context, width + exit * width * 0.02, height, Math.max(0.12, progress - exit * 0.08));
  context.restore();

  context.save();
  context.strokeStyle = `rgba(255,255,255,${0.1 + hover * 0.06})`;
  context.lineWidth = 1;
  drawSteppedRect(context, padX, padY, blockWidth, blockHeight, radius, 6, jitter * 0.6);
  context.stroke();

  context.strokeStyle = "rgba(255,255,255,0.06)";
  drawSteppedRect(
    context,
    padX + innerInset,
    padY + innerInset,
    blockWidth - innerInset * 2,
    blockHeight - innerInset * 2,
    radius * 0.6,
    5,
    jitter * 0.35
  );
  context.stroke();
  context.restore();

  context.save();
  context.globalCompositeOperation = "screen";
  const sweep = context.createLinearGradient(sweepX, 0, sweepX + width * 0.18, 0);
  sweep.addColorStop(0, "rgba(255,255,255,0)");
  sweep.addColorStop(0.45, `rgba(255,255,255,${0.18 + hover * 0.1 + exit * 0.08})`);
  sweep.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = sweep;
  context.fillRect(padX, padY, blockWidth, blockHeight);
  context.restore();

  context.save();
  context.strokeStyle = `rgba(255,255,255,${0.04 + hover * 0.03})`;
  for (let y = padY + 6; y < padY + blockHeight; y += 9) {
    context.beginPath();
    context.moveTo(padX, y + Math.sin((y + variant * 16) * 0.08 + time * 2.1) * (1.2 + hover * 1.8));
    context.lineTo(
      padX + blockWidth,
      y + Math.cos((y + variant * 14) * 0.08 + time * 1.7) * (1.2 + hover * 1.8)
    );
    context.stroke();
  }
  context.restore();

  context.save();
  context.globalAlpha = 0.18 + hover * 0.08 + exit * 0.12;
  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  for (let index = 0; index < 2; index += 1) {
    const x = padX + blockWidth * (0.08 + index * 0.78) + Math.sin(time * 1.3 + index) * 3;
    context.fillRect(x, padY, 2, blockHeight);
  }
  context.restore();
}
