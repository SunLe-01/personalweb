"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer
} from "three";

type AboutColorBendsProps = {
  active?: boolean;
  colors?: string[];
  speed?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  rotation?: number;
  autoRotate?: boolean;
  transparent?: boolean;
};

const MAX_COLORS = 6;
const DEFAULT_COLORS = ["#120015", "#250010", "#4a0409", "#84080a", "#d91511", "#ff3a22"];
const MAX_DPR = 1.5;

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

#define MAX_COLORS ${MAX_COLORS}

varying vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform vec3 uColors[MAX_COLORS];
uniform float uColorCount;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform float uRotation;
uniform float uAutoRotate;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;

  for (int i = 0; i < 4; i += 1) {
    value += noise(p) * amp;
    p = p * 2.02 + vec2(14.1, -9.2);
    amp *= 0.5;
  }

  return value;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * p;
}

vec3 palette(float t) {
  float count = max(uColorCount, 1.0);
  float scaled = clamp(t, 0.0, 0.9999) * max(count - 1.0, 0.0);
  float low = floor(scaled);
  float high = min(low + 1.0, count - 1.0);
  float blend = fract(scaled);

  vec3 lowColor = uColors[0];
  vec3 highColor = uColors[0];

  for (int i = 0; i < MAX_COLORS; i += 1) {
    float fi = float(i);
    if (fi <= low + 0.001) {
      lowColor = uColors[i];
    }
    if (fi <= high + 0.001) {
      highColor = uColors[i];
    }
  }

  return mix(lowColor, highColor, blend);
}

void main() {
  vec2 uv = vUv;
  vec2 centered = uv - 0.5;
  centered.x *= uResolution.x / max(uResolution.y, 1.0);

  float spin = uRotation + uAutoRotate * uTime * 0.11;
  centered = rotate2D(centered, spin);

  vec2 pointer = (uPointer - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 pointerDelta = centered - pointer;
  float pointerDist = length(pointerDelta);
  float pointerField = exp(-pointerDist * (2.35 - uMouseInfluence * 1.1));

  vec2 flow = centered * uScale;
  vec2 pointerFlow = pointerDelta * pointerField * uParallax * (0.62 + uMouseInfluence * 0.28);
  flow += pointerFlow;

  float pointerBend = pointerField * (0.12 + uMouseInfluence * 0.22);
  float pointerTwist = atan(pointerDelta.y, pointerDelta.x);

  float warp = fbm(flow * (1.0 + uFrequency * 0.6) + vec2(uTime * 0.08, -uTime * 0.07));
  float swayA = sin(flow.x * (1.9 * uFrequency) + uTime * 0.22 + warp * uWarpStrength * 1.25 + pointerTwist * 0.24) * (0.14 + pointerBend * 0.08);
  float swayB = sin(flow.x * (1.6 * uFrequency) - uTime * 0.19 + 2.2 + warp * uWarpStrength * 1.05 - pointerTwist * 0.2) * (0.13 + pointerBend * 0.08);

  float ribbonY1 = 0.22 + swayA + pointerFlow.y * 0.8;
  float ribbonY2 = -0.18 + swayB + pointerFlow.y * 0.8;

  float widthCore1 = 0.062 + 0.012 * sin(flow.x * 0.8 + uTime * 0.14) + pointerBend * 0.018;
  float widthCore2 = 0.062 + 0.012 * sin(flow.x * 0.9 - uTime * 0.16 + 1.7) + pointerBend * 0.016;

  float dist1 = abs(flow.y - ribbonY1);
  float dist2 = abs(flow.y - ribbonY2);

  float core1 = smoothstep(widthCore1, widthCore1 * 0.18, dist1);
  float core2 = smoothstep(widthCore2, widthCore2 * 0.18, dist2);
  float halo1 = smoothstep(0.22, widthCore1 * 0.6, dist1) * 0.34;
  float halo2 = smoothstep(0.22, widthCore2 * 0.6, dist2) * 0.31;

  float ribbon1 = max(core1, halo1);
  float ribbon2 = max(core2, halo2);

  float hueA = clamp(0.78 + 0.16 * sin(flow.x * 1.1 + uTime * 0.16), 0.0, 1.0);
  float hueB = clamp(0.86 + 0.12 * sin(flow.x * 1.0 - uTime * 0.14 + 1.3), 0.0, 1.0);
  vec3 ribbonColor1 = palette(hueA);
  vec3 ribbonColor2 = palette(hueB);

  vec3 bgTop = vec3(0.04, 0.0, 0.10);
  vec3 bgBottom = vec3(0.01, 0.0, 0.05);
  vec3 color = mix(bgBottom, bgTop, uv.y);

  color += ribbonColor1 * (0.24 * halo1 + 1.18 * core1);
  color += ribbonColor2 * (0.22 * halo2 + 1.14 * core2);

  float hotLine = smoothstep(0.03, 0.0, min(dist1, dist2));
  color += vec3(0.28, 0.04, 0.02) * hotLine * 0.52;

  float pointerGlow = pointerField * (0.08 + uMouseInfluence * 0.2);
  color += vec3(0.16, 0.02, 0.02) * pointerGlow;

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    color += (n - 0.5) * uNoise;
  }

  color = clamp(color, 0.0, 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`;

function normalizePalette(colors: string[]) {
  const safe = colors.length > 0 ? colors : DEFAULT_COLORS;
  const trimmed = safe.slice(0, MAX_COLORS);
  const padded = [...trimmed];

  while (padded.length < MAX_COLORS) {
    padded.push(trimmed[trimmed.length - 1]);
  }

  return {
    count: Math.max(1, trimmed.length),
    values: padded.map((value) => new Color(value))
  };
}

export function AboutColorBends({
  active = true,
  colors = DEFAULT_COLORS,
  speed = 0.22,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 0.78,
  parallax = 0.42,
  noise = 0.06,
  rotation = -0.22,
  autoRotate = true,
  transparent = true
}: AboutColorBendsProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);

  const palette = useMemo(() => normalizePalette(colors), [colors]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    mount.style.pointerEvents = "none";

    const renderer = new WebGLRenderer({ antialias: true, alpha: transparent, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setClearColor(0x000000, transparent ? 0 : 1);
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uResolution: { value: new Vector2(1, 1) },
      uPointer: { value: new Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uColors: { value: palette.values },
      uColorCount: { value: palette.count },
      uScale: { value: scale },
      uFrequency: { value: frequency },
      uWarpStrength: { value: warpStrength },
      uMouseInfluence: { value: mouseInfluence },
      uParallax: { value: parallax },
      uNoise: { value: noise },
      uRotation: { value: rotation },
      uAutoRotate: { value: autoRotate ? 1 : 0 }
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent,
      depthWrite: false,
      depthTest: false
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    mount.appendChild(renderer.domElement);

    const pointerTarget = new Vector2(0.5, 0.5);
    const pointerCurrent = new Vector2(0.5, 0.5);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      const safeWidth = Math.max(1, Math.floor(width));
      const safeHeight = Math.max(1, Math.floor(height));
      renderer.setSize(safeWidth, safeHeight, false);
      uniforms.uResolution.value.set(safeWidth, safeHeight);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      pointerTarget.set(Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y)));
    };

    const handlePointerLeave = () => {
      pointerTarget.set(0.5, 0.5);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(mount);

    resize();

    let frameId = 0;
    let previousTimestamp = 0;
    let disposed = false;

    const render = (timestamp: number) => {
      if (disposed) {
        return;
      }

      const dt = previousTimestamp ? (timestamp - previousTimestamp) / 1000 : 0;
      previousTimestamp = timestamp;

      if (activeRef.current) {
        uniforms.uTime.value += dt * speed;
      }

      pointerCurrent.lerp(pointerTarget, activeRef.current ? 0.14 : 0.08);
      uniforms.uPointer.value.copy(pointerCurrent);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      resizeObserver.disconnect();

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [
    autoRotate,
    frequency,
    mouseInfluence,
    noise,
    palette.count,
    palette.values,
    parallax,
    rotation,
    scale,
    speed,
    transparent,
    warpStrength
  ]);

  return <div className="about-color-bends" ref={mountRef} />;
}
