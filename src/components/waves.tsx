"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import styles from "./waves.module.css";

class Grad {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  dot2(x: number, y: number) {
    return this.x * x + this.y * y;
  }
}

class Noise {
  private grad3: Grad[];
  private p: number[];
  private perm: number[];
  private gradP: Grad[];

  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1, 1, 0),
      new Grad(-1, 1, 0),
      new Grad(1, -1, 0),
      new Grad(-1, -1, 0),
      new Grad(1, 0, 1),
      new Grad(-1, 0, 1),
      new Grad(1, 0, -1),
      new Grad(-1, 0, -1),
      new Grad(0, 1, 1),
      new Grad(0, -1, 1),
      new Grad(0, 1, -1),
      new Grad(0, -1, -1)
    ];
    this.p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
      142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219,
      203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
      74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230,
      220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209,
      76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173,
      186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
      59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163,
      70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
      178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176,
      115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128,
      195, 78, 66, 215, 61, 156, 180
    ];
    this.perm = new Array(512);
    this.gradP = new Array(512);
    this.seed(seed);
  }

  seed(seed: number) {
    let nextSeed = seed;
    if (nextSeed > 0 && nextSeed < 1) {
      nextSeed *= 65536;
    }

    nextSeed = Math.floor(nextSeed);
    if (nextSeed < 256) {
      nextSeed |= nextSeed << 8;
    }

    for (let i = 0; i < 256; i += 1) {
      const value =
        i & 1 ? this.p[i] ^ (nextSeed & 255) : this.p[i] ^ ((nextSeed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = value;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[value % 12];
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
  }

  perlin2(x: number, y: number) {
    let X = Math.floor(x);
    let Y = Math.floor(y);
    const localX = x - X;
    const localY = y - Y;

    X &= 255;
    Y &= 255;

    const n00 = this.gradP[X + this.perm[Y]].dot2(localX, localY);
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(localX, localY - 1);
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(localX - 1, localY);
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(localX - 1, localY - 1);
    const u = this.fade(localX);

    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(localY));
  }
}

type WavePoint = {
  x: number;
  y: number;
  wave: { x: number; y: number };
  cursor: { x: number; y: number; vx: number; vy: number };
};

type WavesProps = {
  active?: boolean;
  lineColor?: string;
  backgroundColor?: string;
  waveSpeedX?: number;
  waveSpeedY?: number;
  waveAmpX?: number;
  waveAmpY?: number;
  xGap?: number;
  yGap?: number;
  friction?: number;
  tension?: number;
  maxCursorMove?: number;
  style?: CSSProperties;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function Waves({
  active = true,
  lineColor = "black",
  backgroundColor = "transparent",
  waveSpeedX = 0.0125,
  waveSpeedY = 0.005,
  waveAmpX = 32,
  waveAmpY = 16,
  xGap = 10,
  yGap = 32,
  friction = 0.925,
  tension = 0.005,
  maxCursorMove = 100,
  style,
  className = ""
}: WavesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const boundingRef = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const noiseRef = useRef(new Noise(Math.random()));
  const linesRef = useRef<WavePoint[][]>([]);
  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    lx: -9999,
    ly: -9999,
    sx: -9999,
    sy: -9999,
    vs: 0,
    a: 0,
    set: false
  });
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !active) {
      if (frameIdRef.current !== null) {
        window.cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }

      const ctx = ctxRef.current;
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctxRef.current = ctx;

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      boundingRef.current = {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top
      };

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 1;
    };

    const setLines = () => {
      const { width, height } = boundingRef.current;
      const nextLines: WavePoint[][] = [];
      const outerWidth = width + 200;
      const outerHeight = height + 30;
      const totalLines = Math.ceil(outerWidth / xGap);
      const totalPoints = Math.ceil(outerHeight / yGap);
      const xStart = (width - xGap * totalLines) / 2;
      const yStart = (height - yGap * totalPoints) / 2;

      for (let i = 0; i <= totalLines; i += 1) {
        const points: WavePoint[] = [];
        for (let j = 0; j <= totalPoints; j += 1) {
          points.push({
            x: xStart + xGap * i,
            y: yStart + yGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 }
          });
        }
        nextLines.push(points);
      }

      linesRef.current = nextLines;
    };

    const moved = (point: WavePoint, withCursor = true) => ({
      x: Math.round((point.x + point.wave.x + (withCursor ? point.cursor.x : 0)) * 10) / 10,
      y: Math.round((point.y + point.wave.y + (withCursor ? point.cursor.y : 0)) * 10) / 10
    });

    const movePoints = (time: number) => {
      const lines = linesRef.current;
      const mouse = mouseRef.current;
      const noise = noiseRef.current;

      lines.forEach((points) => {
        points.forEach((point) => {
          const move =
            noise.perlin2(
              (point.x + time * waveSpeedX) * 0.002,
              (point.y + time * waveSpeedY) * 0.0015
            ) * 12;

          point.wave.x = Math.cos(move) * waveAmpX;
          point.wave.y = Math.sin(move) * waveAmpY;

          const dx = point.x - mouse.sx;
          const dy = point.y - mouse.sy;
          const dist = Math.hypot(dx, dy);
          const influence = Math.max(175, mouse.vs);

          if (dist < influence) {
            const strength = 1 - dist / influence;
            const force = Math.cos(dist * 0.001) * strength;
            point.cursor.vx += Math.cos(mouse.a) * force * influence * mouse.vs * 0.00065;
            point.cursor.vy += Math.sin(mouse.a) * force * influence * mouse.vs * 0.00065;
          }

          point.cursor.vx += (0 - point.cursor.x) * tension;
          point.cursor.vy += (0 - point.cursor.y) * tension;
          point.cursor.vx *= friction;
          point.cursor.vy *= friction;
          point.cursor.x += point.cursor.vx * 2;
          point.cursor.y += point.cursor.vy * 2;
          point.cursor.x = clamp(point.cursor.x, -maxCursorMove, maxCursorMove);
          point.cursor.y = clamp(point.cursor.y, -maxCursorMove, maxCursorMove);
        });
      });
    };

    const drawLines = () => {
      const { width, height } = boundingRef.current;
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = lineColor;

      linesRef.current.forEach((points) => {
        let pointA = moved(points[0], false);
        ctx.moveTo(pointA.x, pointA.y);

        points.forEach((point, index) => {
          const isLast = index === points.length - 1;
          pointA = moved(point, !isLast);
          const pointB = moved(points[index + 1] || points[points.length - 1], !isLast);

          ctx.lineTo(pointA.x, pointA.y);
          if (isLast) {
            ctx.moveTo(pointB.x, pointB.y);
          }
        });
      });

      ctx.stroke();
    };

    const updateMouse = (clientX: number, clientY: number) => {
      const mouse = mouseRef.current;
      const bounds = boundingRef.current;

      mouse.x = clientX - bounds.left;
      mouse.y = clientY - bounds.top;

      if (!mouse.set) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;
        mouse.set = true;
      }
    };

    const tick = (time: number) => {
      const mouse = mouseRef.current;
      const dx = mouse.x - mouse.lx;
      const dy = mouse.y - mouse.ly;
      const distance = Math.hypot(dx, dy);

      mouse.sx += (mouse.x - mouse.sx) * 0.1;
      mouse.sy += (mouse.y - mouse.sy) * 0.1;
      mouse.vs += (distance - mouse.vs) * 0.1;
      mouse.vs = Math.min(100, mouse.vs);
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.a = Math.atan2(dy, dx);

      movePoints(time);
      drawLines();
      frameIdRef.current = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateMouse(event.clientX, event.clientY);
    };

    const handleResize = () => {
      setSize();
      setLines();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();
    frameIdRef.current = window.requestAnimationFrame(tick);

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);

      if (frameIdRef.current !== null) {
        window.cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [
    active,
    friction,
    lineColor,
    maxCursorMove,
    tension,
    waveAmpX,
    waveAmpY,
    waveSpeedX,
    waveSpeedY,
    xGap,
    yGap
  ]);

  return (
    <div
      ref={containerRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={{
        backgroundColor,
        ...style
      }}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

export default Waves;
