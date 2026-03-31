"use client";

/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, ShaderMaterial, type Mesh } from "three";

type WorkSilkProps = {
  active?: boolean;
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
};

function hexToNormalizedRGB(hex: string): [number, number, number] {
  const normalizedHex = hex.replace("#", "");

  return [
    Number.parseInt(normalizedHex.slice(0, 2), 16) / 255,
    Number.parseInt(normalizedHex.slice(2, 4), 16) / 255,
    Number.parseInt(normalizedHex.slice(4, 6), 16) / 255
  ];
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float E = 2.71828182845904523536;

float noise(vec2 texCoord) {
  vec2 r = E * sin(E * texCoord);
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2 rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd = noise((vUv + vec2(0.173, 0.617)) * vec2(960.0, 420.0));
  vec2 uv = rotateUvs(vUv * uScale, uRotation);
  vec2 tex = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern =
    0.6 +
    0.4 * sin(
      5.0 * (
        tex.x +
        tex.y +
        cos(3.0 * tex.x + 5.0 * tex.y) +
        0.02 * tOffset
      ) +
      sin(20.0 * (tex.x + tex.y - 0.1 * tOffset))
    );

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

function SilkPlane({
  active,
  uniforms
}: {
  active: boolean;
  uniforms: {
    uTime: { value: number };
    uSpeed: { value: number };
    uScale: { value: number };
    uRotation: { value: number };
    uNoiseIntensity: { value: number };
    uColor: { value: Color };
  };
}) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { viewport } = useThree();

  useLayoutEffect(() => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.scale.set(viewport.width, viewport.height, 1);
  }, [viewport.height, viewport.width]);

  useFrame((_, delta) => {
    if (!active || !materialRef.current) {
      return;
    }

    materialRef.current.uniforms.uTime.value += 0.12 * delta;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
      />
    </mesh>
  );
}

export function WorkSilk({
  active = true,
  speed = 2.6,
  scale = 1,
  color = "#d11017",
  noiseIntensity = 1.5,
  rotation = -0.38
}: WorkSilkProps) {
  const uniforms = useMemo(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 }
    }),
    [speed, scale, noiseIntensity, color, rotation]
  );

  return (
    <Canvas
      dpr={[1, 1.25]}
      frameloop={active ? "always" : "demand"}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1], fov: 50 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <SilkPlane active={active} uniforms={uniforms} />
    </Canvas>
  );
}

export default WorkSilk;
