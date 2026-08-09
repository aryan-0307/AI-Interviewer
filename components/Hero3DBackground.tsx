"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT_COLORS = {
  indigo:  "#6366f1",
  violet:  "#8b5cf6",
  lavender:"#a78bfa",
} as const;

// ─── Mouse parallax state (module-level so shared cleanly) ───────────────────

let mouseX = 0;
let mouseY = 0;

// ─── Starfield ────────────────────────────────────────────────────────────────

function Starfield({ count = 320 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);

  useFrame((_, delta) => {
    if (!ref.current) return;
    // Drift very slowly
    ref.current.rotation.y += delta * 0.006;
    ref.current.rotation.x += delta * 0.003;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={ACCENT_COLORS.lavender}
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  );
}

// ─── Individual floating geometry ─────────────────────────────────────────────

interface FloatShapeProps {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotationSpeed: [number, number, number];
  driftSpeed: number;
  driftRadius: number;
  driftOffset: number;
  color: string;
  opacity: number;
  scale: number;
}

function FloatShape({
  geometry,
  position,
  rotationSpeed,
  driftSpeed,
  driftRadius,
  driftOffset,
  color,
  opacity,
  scale,
}: FloatShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const originX = position[0];
  const originY = position[1];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Gentle figure-eight drift
    meshRef.current.position.x =
      originX + Math.sin(t * driftSpeed + driftOffset) * driftRadius;
    meshRef.current.position.y =
      originY + Math.cos(t * driftSpeed * 0.7 + driftOffset) * driftRadius * 0.6;

    // Slow independent rotation
    meshRef.current.rotation.x += rotationSpeed[0] * 0.01;
    meshRef.current.rotation.y += rotationSpeed[1] * 0.01;
    meshRef.current.rotation.z += rotationSpeed[2] * 0.01;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color={color}
        wireframe
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Scene — all 3D content ───────────────────────────────────────────────────

function Scene({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree();
  const camRef = useRef({ x: 0, y: 0 });

  // Smooth camera parallax towards mouse
  useFrame(() => {
    const targetX = mouseX * 1.4;
    const targetY = mouseY * 0.9;
    camRef.current.x += (targetX - camRef.current.x) * 0.025;
    camRef.current.y += (targetY - camRef.current.y) * 0.025;

    camera.position.x = camRef.current.x;
    camera.position.y = camRef.current.y;
    camera.lookAt(0, 0, 0);
  });

  // Geometry definitions — created once
  const shapes = useMemo<FloatShapeProps[]>(() => [
    {
      geometry: new THREE.IcosahedronGeometry(1.15, 0),
      position: [-4.5, 1.8, -6],
      rotationSpeed: [0.18, 0.22, 0.08],
      driftSpeed: 0.28,
      driftRadius: 0.45,
      driftOffset: 0,
      color: ACCENT_COLORS.indigo,
      opacity: 0.22,
      scale: 1,
    },
    {
      geometry: new THREE.TorusGeometry(0.9, 0.32, 12, 36),
      position: [4.2, -1.6, -5],
      rotationSpeed: [0.25, 0.12, 0.2],
      driftSpeed: 0.21,
      driftRadius: 0.55,
      driftOffset: 1.2,
      color: ACCENT_COLORS.violet,
      opacity: 0.2,
      scale: 1,
    },
    {
      geometry: new THREE.OctahedronGeometry(1.0, 0),
      position: [2.8, 2.6, -8],
      rotationSpeed: [0.14, 0.3, 0.1],
      driftSpeed: 0.19,
      driftRadius: 0.6,
      driftOffset: 2.5,
      color: ACCENT_COLORS.lavender,
      opacity: 0.18,
      scale: 1,
    },
    {
      geometry: new THREE.TetrahedronGeometry(0.9, 0),
      position: [-3.2, -2.4, -4],
      rotationSpeed: [0.2, 0.15, 0.25],
      driftSpeed: 0.24,
      driftRadius: 0.4,
      driftOffset: 4.1,
      color: ACCENT_COLORS.indigo,
      opacity: 0.15,
      scale: 1,
    },
    {
      geometry: new THREE.IcosahedronGeometry(0.65, 1),
      position: [0.6, -3.0, -3],
      rotationSpeed: [0.3, 0.2, 0.12],
      driftSpeed: 0.32,
      driftRadius: 0.35,
      driftOffset: 3.0,
      color: ACCENT_COLORS.violet,
      opacity: 0.2,
      scale: 1,
    },
  ], []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight
        position={[5, 4, 2]}
        intensity={1.8}
        color={ACCENT_COLORS.violet}
        distance={20}
        decay={2}
      />
      <pointLight
        position={[-6, -3, -4]}
        intensity={0.9}
        color={ACCENT_COLORS.indigo}
        distance={18}
        decay={2}
      />

      {/* Stars — fewer on mobile */}
      <Starfield count={isMobile ? 120 : 320} />

      {/* Floating wireframe shapes — skip last 2 on mobile */}
      {shapes
        .slice(0, isMobile ? 3 : shapes.length)
        .map((props, i) => (
          <FloatShape key={i} {...props} />
        ))}
    </>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function Hero3DBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Detect mobile once on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Track mouse for parallax — passive, no rerender needed
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      // Normalize to -1 … +1
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * -2;
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d0b18 55%, #0a0a0f 100%)" }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55, near: 0.1, far: 200 }}
        dpr={[1, isMobile ? 1 : 1.5]}   // cap pixel ratio for performance
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene isMobile={isMobile} />
      </Canvas>

      {/* Ambient Mesh Gradient Glow Orbs (#7C3AED Purple & #06B6D4 Cyan) */}
      <div
        className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-25 mix-blend-screen filter blur-[120px] animate-pulse pointer-events-none"
        style={{ background: "#7C3AED" }}
      />
      <div
        className="absolute top-1/3 right-1/4 translate-x-1/4 -translate-y-1/2 w-[450px] h-[450px] rounded-full opacity-20 mix-blend-screen filter blur-[120px] animate-pulse pointer-events-none"
        style={{ background: "#06B6D4", animationDelay: "2s" }}
      />

      {/* SVG Film Grain Noise Overlay (4% opacity) */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial vignette overlay so edges feel like deep space */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(10,10,15,0.75) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Soft violet bloom at top-center behind hero headline */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}
