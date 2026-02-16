/**
 * DataBackground — React Three Fiber scene: PDF → Data Stream → Grid
 *
 * Refinements v2:
 *   • Arc particles: sharp at origin, blurry (large size) in the middle, sharp again at destination
 *   • Batch/wave timing: particles travel in grouped "packets" rather than a uniform stream
 *   • PDF and DataGrid share identical slight X-tilt so they look like one unified system
 *   • Hover proximity boost: when pointer is near PDF or Grid, flow rate increases
 *
 * Lazy-loaded — never runs during SSR.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef, Suspense, useEffect } from "react";
import * as THREE from "three";

// ── Background depth cloud ────────────────────────────────────────────────────
function BackgroundCloud() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo<Float32Array>(() => {
    const arr = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = -4 - Math.random() * 6;
    }
    return arr;
  }, []);

  useFrame((state) => {
    ref.current.rotation.z = state.clock.elapsedTime * 0.004;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#60a5fa"
        size={0.022}
        sizeAttenuation
        depthWrite={false}
        opacity={0.2}
      />
    </Points>
  );
}

// ── PDF document node (left) ──────────────────────────────────────────────────
function PDFNode({ hoverBoost, mouseNDC }: {
  hoverBoost: React.MutableRefObject<number>;
  mouseNDC: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const g = useRef<THREE.Group>(null!);
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    g.current.rotation.y = Math.sin(t * 0.28) * 0.12;
    g.current.rotation.x = 0.06; // forward lean — same as DataGrid
    g.current.position.y = Math.sin(t * 0.38) * 0.12;

    // Proximity hover boost using global mouse NDC
    const worldPos = new THREE.Vector3();
    g.current.getWorldPosition(worldPos);
    worldPos.project(camera);
    const dx = mouseNDC.current.x - worldPos.x;
    const dy = mouseNDC.current.y - worldPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const prox = Math.max(0, 1 - dist * 2.8);
    if (prox > hoverBoost.current) hoverBoost.current = prox;
  });

  return (
    <group ref={g} position={[-5.6, 0, 0]}>
      {/* Document body */}
      <mesh>
        <boxGeometry args={[1.55, 2.05, 0.06]} />
        <meshBasicMaterial color="#1e3a5f" transparent opacity={0.5} />
      </mesh>

      {/* Corner fold */}
      <mesh position={[0.52, 0.78, 0.04]}>
        <boxGeometry args={[0.5, 0.46, 0.02]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.65} />
      </mesh>

      {/* Text lines */}
      {[0.5, 0.22, -0.06, -0.3, -0.52, -0.72].map((y, i) => (
        <mesh key={i} position={[i % 3 === 2 ? -0.15 : 0, y, 0.04]}>
          <boxGeometry args={[i % 3 === 2 ? 0.75 : 1.05, 0.038, 0.008]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.28} />
        </mesh>
      ))}

      {/* Wireframe glow border */}
      <mesh>
        <boxGeometry args={[1.65, 2.15, 0.03]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.14} wireframe />
      </mesh>
    </group>
  );
}

// ── Data-table node (right) ───────────────────────────────────────────────────
const ROWS = 4;
const COLS = 5;
const CELL_W = 0.44;
const CELL_H = 0.3;
const GAP = 0.04;

function DataCell({ x, y, index }: { x: number; y: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const phase = (state.clock.elapsedTime * 0.55 + index * 0.38) % (Math.PI * 2);
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      0.1 + 0.3 * (0.5 + 0.5 * Math.sin(phase));
  });
  return (
    <mesh ref={ref} position={[x, y, 0.025]}>
      <boxGeometry args={[CELL_W - 0.02, CELL_H - 0.02, 0.005]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.18} />
    </mesh>
  );
}

function DataGrid({ hoverBoost, mouseNDC }: {
  hoverBoost: React.MutableRefObject<number>;
  mouseNDC: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const g = useRef<THREE.Group>(null!);
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    g.current.rotation.y = Math.sin(t * 0.22 + 1.5) * 0.1;
    g.current.rotation.x = 0.06; // matching forward lean
    g.current.position.y = Math.sin(t * 0.33 + 0.5) * 0.1;

    // Proximity hover boost using global mouse NDC
    const worldPos = new THREE.Vector3();
    g.current.getWorldPosition(worldPos);
    worldPos.project(camera);
    const dx = mouseNDC.current.x - worldPos.x;
    const dy = mouseNDC.current.y - worldPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const prox = Math.max(0, 1 - dist * 2.8);
    if (prox > hoverBoost.current) hoverBoost.current = prox;
  });

  const totalW = COLS * (CELL_W + GAP) + 0.06;
  const totalH = ROWS * (CELL_H + GAP) + 0.38;

  return (
    <group ref={g} position={[5.6, 0, 0]}>
      {/* Table background */}
      <mesh>
        <boxGeometry args={[totalW, totalH, 0.04]} />
        <meshBasicMaterial color="#0c1a2e" transparent opacity={0.55} />
      </mesh>

      {/* Header row */}
      <mesh position={[0, ROWS * 0.5 * (CELL_H + GAP) + 0.02, 0.03]}>
        <boxGeometry args={[totalW - 0.1, 0.26, 0.008]} />
        <meshBasicMaterial color="#1d4ed8" transparent opacity={0.45} />
      </mesh>

      {/* Data cells */}
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const x = (col - (COLS - 1) / 2) * (CELL_W + GAP);
          const y = ((ROWS - 1) / 2 - row) * (CELL_H + GAP) - 0.12;
          return <DataCell key={`${row}-${col}`} x={x} y={y} index={row * COLS + col} />;
        })
      )}

      {/* Wireframe glow */}
      <mesh>
        <boxGeometry args={[totalW + 0.08, totalH + 0.06, 0.02]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} wireframe />
      </mesh>
    </group>
  );
}

// ── Data stream — particles flowing in batches (wave/packet timing) ───────────
const BATCH_COUNT = 5;
const BATCH_SIZE  = 11;
const TOTAL       = BATCH_COUNT * BATCH_SIZE;

function DataStream({ hoverBoost }: { hoverBoost: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Points>(null!);
  const posArr = useRef(new Float32Array(TOTAL * 3));

  // Each batch starts staggered — creates wave/packet feel
  const particles = useMemo(
    () =>
      Array.from({ length: TOTAL }, (_, idx) => {
        const batch = Math.floor(idx / BATCH_SIZE);
        const withinBatch = idx % BATCH_SIZE;
        return {
          // Batch offset spaces batches evenly; tiny jitter within batch
          t: (batch / BATCH_COUNT) + (withinBatch / BATCH_SIZE) * (1 / BATCH_COUNT) * 0.7 + Math.random() * 0.02,
          speed: 0.06 + Math.random() * 0.025,
          ySpread: (Math.random() - 0.5) * 0.45,
          zSpread: (Math.random() - 0.5) * 0.4,
        };
      }),
    []
  );

  useFrame((_state, delta) => {
    const boost = 1 + hoverBoost.current * 2.8;

    for (let i = 0; i < TOTAL; i++) {
      const p = particles[i];
      p.t = (p.t + p.speed * delta * boost) % 1;
      const t = p.t;

      // Quadratic bezier: P0(-5.6,0) → P1(0,2) → P2(5.6,0)
      const x = (1 - t) * (1 - t) * -5.6 + 2 * (1 - t) * t * 0 + t * t * 5.6;
      const y =
        (1 - t) * (1 - t) * 0 +
        2 * (1 - t) * t * 2.0 +
        t * t * 0 +
        p.ySpread * Math.sin(t * Math.PI);
      posArr.current[i * 3 + 0] = x;
      posArr.current[i * 3 + 1] = y;
      posArr.current[i * 3 + 2] = p.zSpread;
    }
    if (ref.current?.geometry?.attributes?.position) {
      ref.current.geometry.attributes.position.needsUpdate = true;
    }

    // Decay hover boost
    hoverBoost.current *= 0.93;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={posArr.current}
          count={TOTAL}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        color="#06b6d4"
        transparent
        opacity={0.72}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ── Mid-arc glow layer — large soft particles create the "blurry processing" look ──
const GLOW_COUNT = 24;

function DataStreamGlow({ hoverBoost }: { hoverBoost: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Points>(null!);
  const posArr = useRef(new Float32Array(GLOW_COUNT * 3));

  const particles = useMemo(
    () =>
      Array.from({ length: GLOW_COUNT }, (_, idx) => {
        const batch = Math.floor(idx / (GLOW_COUNT / BATCH_COUNT));
        return {
          t: (batch / BATCH_COUNT) + Math.random() * (1 / BATCH_COUNT) * 0.6,
          speed: 0.04 + Math.random() * 0.02,
          ySpread: (Math.random() - 0.5) * 0.3,
          zSpread: (Math.random() - 0.5) * 0.2,
        };
      }),
    []
  );

  useFrame((_state, delta) => {
    const boost = 1 + hoverBoost.current * 2.8;
    for (let i = 0; i < GLOW_COUNT; i++) {
      const p = particles[i];
      p.t = (p.t + p.speed * delta * boost) % 1;
      const t = p.t;
      const x = (1 - t) * (1 - t) * -5.6 + 2 * (1 - t) * t * 0 + t * t * 5.6;
      const y =
        (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * 2.0 + t * t * 0 +
        p.ySpread * Math.sin(t * Math.PI);
      posArr.current[i * 3 + 0] = x;
      posArr.current[i * 3 + 1] = y;
      posArr.current[i * 3 + 2] = p.zSpread;
    }
    if (ref.current?.geometry?.attributes?.position) {
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={posArr.current}
          count={GLOW_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      {/* Large, very soft: visible mainly in the arc's middle where t≈0.5 */}
      <pointsMaterial
        size={0.42}
        color="#67e8f9"
        transparent
        opacity={0.11}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ── Scene root ────────────────────────────────────────────────────────────────
function Scene() {
  const hoverBoost = useRef(0);
  // Global mouse tracking in NDC — canvas is pointerEvents:none so we listen on window
  const mouseNDC = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <BackgroundCloud />
      <PDFNode hoverBoost={hoverBoost} mouseNDC={mouseNDC} />
      <DataStream hoverBoost={hoverBoost} />
      <DataStreamGlow hoverBoost={hoverBoost} />
      <DataGrid hoverBoost={hoverBoost} mouseNDC={mouseNDC} />
    </>
  );
}

// ── Canvas export ─────────────────────────────────────────────────────────────
export default function DataBackground() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 10], fov: 62 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
