"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

const MAX_COLORS = 8;

type GradientBlindsProps = {
  className?: string;
  dpr?: number;
  paused?: boolean;
  gradientColors?: readonly string[];
  angle?: number;
  noise?: number;
  blindCount?: number;
  blindMinWidth?: number;
  mouseDampening?: number;
  mirrorGradient?: boolean;
  spotlightRadius?: number;
  spotlightSoftness?: number;
  spotlightOpacity?: number;
  distortAmount?: number;
  shineDirection?: "left" | "right";
  mixBlendMode?: CSSProperties["mixBlendMode"];
};

type UniformValue = {
  value: unknown;
};

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);

  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv0 = fragCoord.xy / iResolution.xy;

    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv0 * 2.0 - 1.0;
    p.x *= aspect;
    vec2 pr = rotate2D(p, uAngle);
    pr.x /= aspect;
    vec2 uv = pr * 0.5 + 0.5;

    vec2 uvMod = uv;
    if (uDistort > 0.0) {
      float a = uvMod.y * 6.0;
      float b = uvMod.x * 6.0;
      float w = 0.01 * uDistort;
      uvMod.x += sin(a) * w;
      uvMod.y += cos(b) * w;
    }
    float t = uvMod.x;
    if (uMirror > 0.5) {
      t = 1.0 - abs(1.0 - 2.0 * fract(t));
    }
    vec3 base = getGradientColor(t);

    vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);
  float d = length(uv0 - offset);
  float r = max(uSpotlightRadius, 1e-4);
  float dn = d / r;
  float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
  vec3 cir = vec3(spot);
  float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
  if (uShineFlip > 0.5) stripe = 1.0 - stripe;
    vec3 ran = vec3(stripe);

    vec3 col = cir + base - ran;
    col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

    fragColor = vec4(col, 1.0);
}

void main() {
    vec4 color;
    mainImage(color, vUv * iResolution.xy);
    gl_FragColor = color;
}
`;

const hexToRGB = (hex: string): [number, number, number] => {
  const cleaned = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  return [r, g, b];
};

const prepStops = (stops?: readonly string[]) => {
  const base = (stops && stops.length ? stops : ["#FF9FFC", "#5227FF"]).slice(0, MAX_COLORS);

  if (base.length === 1) {
    base.push(base[0]);
  }

  while (base.length < MAX_COLORS) {
    base.push(base[base.length - 1]);
  }

  const arr: [number, number, number][] = [];

  for (let index = 0; index < MAX_COLORS; index += 1) {
    arr.push(hexToRGB(base[index]));
  }

  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));
  return { arr, count };
};

const callIfFn = (target: unknown, key: string) => {
  if (
    target &&
    typeof target === "object" &&
    key in target &&
    typeof (target as Record<string, unknown>)[key] === "function"
  ) {
    (target as Record<string, () => void>)[key]();
  }
};

export function GradientBlinds({
  className,
  dpr,
  paused = false,
  gradientColors,
  angle = 0,
  noise = 0.3,
  blindCount = 16,
  blindMinWidth = 60,
  mouseDampening = 0.15,
  mirrorGradient = false,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  spotlightOpacity = 1,
  distortAmount = 0,
  shineDirection = "left",
  mixBlendMode = "lighten"
}: GradientBlindsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const programRef = useRef<Program | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const geometryRef = useRef<Triangle | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const mouseTargetRef = useRef<[number, number]>([0, 0]);
  const lastTimeRef = useRef(0);
  const firstResizeRef = useRef(true);
  const pausedRef = useRef(paused);
  const gradientKey = useMemo(() => (gradientColors ?? []).join("|"), [gradientColors]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const renderer = new Renderer({
      dpr: dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
      alpha: true,
      antialias: true
    });

    rendererRef.current = renderer;

    const gl = renderer.gl;
    const canvas = gl.canvas;

    canvas.className = "gradient-blinds__canvas";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const { arr: colorArr, count: colorCount } = prepStops(gradientColors);
    const uniforms: Record<string, UniformValue> = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uAngle: { value: (angle * Math.PI) / 180 },
      uNoise: { value: noise },
      uBlindCount: { value: Math.max(1, blindCount) },
      uSpotlightRadius: { value: spotlightRadius },
      uSpotlightSoftness: { value: spotlightSoftness },
      uSpotlightOpacity: { value: spotlightOpacity },
      uMirror: { value: mirrorGradient ? 1 : 0 },
      uDistort: { value: distortAmount },
      uShineFlip: { value: shineDirection === "right" ? 1 : 0 },
      uColor0: { value: colorArr[0] },
      uColor1: { value: colorArr[1] },
      uColor2: { value: colorArr[2] },
      uColor3: { value: colorArr[3] },
      uColor4: { value: colorArr[4] },
      uColor5: { value: colorArr[5] },
      uColor6: { value: colorArr[6] },
      uColor7: { value: colorArr[7] },
      uColorCount: { value: colorCount }
    };

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms
    });
    programRef.current = program;

    const geometry = new Triangle(gl);
    geometryRef.current = geometry;

    const mesh = new Mesh(gl, { geometry, program });
    meshRef.current = mesh;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];

      if (blindMinWidth && blindMinWidth > 0) {
        const maxByMinWidth = Math.max(1, Math.floor(rect.width / blindMinWidth));
        const effective = blindCount ? Math.min(blindCount, maxByMinWidth) : maxByMinWidth;
        uniforms.uBlindCount.value = Math.max(1, effective);
      } else {
        uniforms.uBlindCount.value = Math.max(1, blindCount);
      }

      if (firstResizeRef.current) {
        firstResizeRef.current = false;
        const centerX = gl.drawingBufferWidth / 2;
        const centerY = gl.drawingBufferHeight / 2;
        uniforms.iMouse.value = [centerX, centerY];
        mouseTargetRef.current = [centerX, centerY];
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const resetMouse = () => {
      const centerX = gl.drawingBufferWidth / 2;
      const centerY = gl.drawingBufferHeight / 2;

      mouseTargetRef.current = [centerX, centerY];

      if (mouseDampening <= 0) {
        uniforms.iMouse.value = [centerX, centerY];
      }
    };

    const updateMouseFromClient = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const scale = renderer.dpr || 1;
      const x = (clientX - rect.left) * scale;
      const y = (rect.height - (clientY - rect.top)) * scale;

      mouseTargetRef.current = [x, y];

      if (mouseDampening <= 0) {
        uniforms.iMouse.value = [x, y];
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      updateMouseFromClient(event.clientX, event.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      updateMouseFromClient(touch.clientX, touch.clientY);
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", resetMouse);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    const loop = (time: number) => {
      rafRef.current = window.requestAnimationFrame(loop);
      uniforms.iTime.value = time * 0.001;

      if (mouseDampening > 0) {
        if (!lastTimeRef.current) {
          lastTimeRef.current = time;
        }

        const deltaSeconds = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        const tau = Math.max(0.0001, mouseDampening);
        let factor = 1 - Math.exp(-deltaSeconds / tau);

        if (factor > 1) {
          factor = 1;
        }

        const target = mouseTargetRef.current;
        const current = uniforms.iMouse.value as number[];
        current[0] += (target[0] - current[0]) * factor;
        current[1] += (target[1] - current[1]) * factor;
      } else {
        lastTimeRef.current = time;
      }

      if (!pausedRef.current && programRef.current && meshRef.current) {
        try {
          renderer.render({ scene: meshRef.current });
        } catch (error) {
          console.error(error);
        }
      }
    };

    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", resetMouse);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      resizeObserver.disconnect();

      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }

      callIfFn(programRef.current, "remove");
      callIfFn(geometryRef.current, "remove");
      callIfFn(meshRef.current, "remove");
      callIfFn(rendererRef.current, "destroy");

      programRef.current = null;
      geometryRef.current = null;
      meshRef.current = null;
      rendererRef.current = null;
      rafRef.current = null;
      lastTimeRef.current = 0;
      firstResizeRef.current = true;
    };
  }, [
    angle,
    blindCount,
    blindMinWidth,
    dpr,
    distortAmount,
    gradientKey,
    mirrorGradient,
    mouseDampening,
    noise,
    shineDirection,
    spotlightOpacity,
    spotlightRadius,
    spotlightSoftness
  ]);

  return (
    <div
      ref={containerRef}
      className={`gradient-blinds-container ${className ?? ""}`.trim()}
      style={mixBlendMode ? { mixBlendMode } : undefined}
    />
  );
}

export default GradientBlinds;
