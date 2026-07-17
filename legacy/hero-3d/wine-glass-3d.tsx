"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);

const FILL_MIN = 1.5;
const FILL_MAX = 1.745;

/** Dark studio environment: emissive strips on black → controlled crystal
 *  reflections instead of the flat white "plastic" look. */
function useStudioEnv() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const s = new THREE.Scene();
    s.background = new THREE.Color(0x050304);
    const strip = (
      w: number, h: number, hex: number, mul: number,
      x: number, y: number, z: number, ry: number,
    ) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(mul) }),
      );
      m.position.set(x, y, z);
      m.rotation.y = ry;
      s.add(m);
    };
    strip(5, 12, 0xffe9cf, 3.4, -7, 3.5, 1.5, Math.PI / 2.3); // warm key (left)
    strip(3.4, 12, 0xffdca6, 2.2, 7, 2.5, -1.5, -Math.PI / 2.3); // rim (right/back)
    strip(9, 3, 0x321a1f, 1.3, 0, 7.5, 0.5, 0); // soft top wash
    strip(3.5, 4, 0xffffff, 2.6, -2.2, 4.6, 4, Math.PI * 0.15); // crisp highlight
    const tex = pmrem.fromScene(s, 0.035).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
}

function GlassScene({
  progress,
  reduced,
}: {
  progress: MutableRefObject<number>;
  reduced: boolean;
}) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const group = useRef<THREE.Group>(null);

  const env = useStudioEnv();
  useMemo(() => {
    scene.environment = env;
    gl.localClippingEnabled = true;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.92;
  }, [scene, gl, env]);

  // ---- Glass ----
  const glassGeo = useMemo(() => {
    const P = [
      [0.6, 0.0], [0.6, 0.045], [0.3, 0.075], [0.06, 0.12],
      [0.048, 0.3], [0.045, 0.6], [0.046, 0.88],
      [0.1, 0.95], [0.24, 1.0], [0.42, 1.06], [0.54, 1.14],
      [0.615, 1.3], [0.635, 1.52], [0.605, 1.74], [0.53, 1.92],
      [0.44, 2.06], [0.36, 2.17], [0.335, 2.25], [0.33, 2.28],
    ].map((p) => new THREE.Vector2(p[0], p[1]));
    const g = new THREE.LatheGeometry(P, 160);
    g.computeVertexNormals();
    return g;
  }, []);

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.045, transmission: 1,
        thickness: 0.55, ior: 1.5, envMapIntensity: 1.5, clearcoat: 1,
        clearcoatRoughness: 0.06, transparent: true, side: THREE.DoubleSide,
        attenuationColor: new THREE.Color(0xffffff), attenuationDistance: 4,
      }),
    [],
  );

  // ---- Wine (clip-plane reveals the rising fill) ----
  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), FILL_MIN),
    [],
  );
  const wineGeo = useMemo(() => {
    const W = [
      [0.001, 1.14], [0.3, 1.16], [0.48, 1.24], [0.575, 1.42],
      [0.58, 1.58], [0.52, 1.72], [0.3, 1.74], [0.001, 1.745],
    ].map((p) => new THREE.Vector2(p[0], p[1]));
    const g = new THREE.LatheGeometry(W, 160);
    g.computeVertexNormals();
    return g;
  }, []);
  const wineMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x4a0f1b, metalness: 0, roughness: 0.1, transmission: 0.9,
        thickness: 1.4, ior: 1.37, attenuationColor: new THREE.Color(0x2a070e),
        attenuationDistance: 0.3, envMapIntensity: 1.25, clearcoat: 0.7,
        clearcoatRoughness: 0.16, specularIntensity: 1, transparent: true,
        side: THREE.DoubleSide, clippingPlanes: [clipPlane],
      }),
    [clipPlane],
  );

  // Top-surface vertices to deform (the visible "pelo")
  const surf = useMemo(() => {
    const pos = wineGeo.attributes.position;
    const orig = Float32Array.from(pos.array as Float32Array);
    const idx: number[] = [];
    for (let i = 0; i < pos.count; i++) if (orig[i * 3 + 1] > 1.58) idx.push(i);
    return { orig, idx };
  }, [wineGeo]);

  // ---- Falling stream ----
  const streamGeo = useMemo(
    () => new THREE.CylinderGeometry(0.026, 0.05, 1.0, 20, 1, true),
    [],
  );
  const streamMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x5a1122, roughness: 0.16, transmission: 0.55, thickness: 0.4,
        ior: 1.35, attenuationColor: new THREE.Color(0x2a070e),
        attenuationDistance: 0.28, envMapIntensity: 1.1, transparent: true,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const stream = useRef<THREE.Mesh>(null);

  // physics state
  const st = useRef({ sloshA: 0, sloshV: 0, energy: 0, impact: 0, impactT: 0, prevTilt: 0 });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const p = progress.current;
    const mo = reduced ? 0 : 1;
    const g = group.current;
    if (!g) return;

    const glassIn = seg(time, 0.1, 1.0);
    const introFill = reduced ? 1 : seg(time, 0.6, 2.8);
    const level = lerp(FILL_MIN, FILL_MAX, introFill);
    clipPlane.constant = level;

    // pour stream
    const pouring = !!mo && time > 0.5 && time < 3.0;
    if (stream.current) {
      if (pouring) {
        const top = 2.16;
        const len = Math.max(0.02, top - level);
        stream.current.visible = true;
        stream.current.scale.y = len;
        stream.current.position.set(0.05, (top + level) / 2, 0);
        const taper = 1 - seg(time, 2.4, 3.0);
        stream.current.scale.x = stream.current.scale.z = 0.55 + 0.45 * taper;
        streamMat.opacity = Math.min(1, taper + 0.15);
        st.current.impact = 1.0;
        st.current.impactT = time;
      } else {
        stream.current.visible = false;
        st.current.impact = Math.max(0, st.current.impact - 0.02);
      }
    }

    // gentle tilt (invisible hand) — never spins
    const idle = (Math.sin(time * 0.34) * 0.085 + Math.sin(time * 0.19 + 1.3) * 0.045) * mo;
    const scrollTilt = (seg(p, 0, 1) - 0.15) * 0.1;
    const glassTilt = (idle + scrollTilt) * glassIn;
    g.position.y = 0.02 - (1 - glassIn) * 0.28;
    g.rotation.z = glassTilt;
    g.rotation.x = Math.sin(time * 0.27) * 0.006 * mo;
    g.rotation.y = 0;

    // camera micro-parallax on scroll
    camera.position.set(Math.sin(time * 0.2) * 0.03 * mo, 1.28 - p * 0.1, 5.2);
    camera.lookAt(0, 1.12 - p * 0.06, 0);

    // liquid physics — spring-damper driven by angular velocity (inertia)
    const s = st.current;
    const angVel = glassTilt - s.prevTilt;
    s.prevTilt = glassTilt;
    s.sloshV += (glassTilt - s.sloshA) * 0.05 - angVel * 2.2;
    s.sloshV *= 0.945;
    s.sloshA += s.sloshV;
    const rel = s.sloshA - glassTilt;
    s.energy = lerp(
      s.energy,
      Math.min(Math.abs(s.sloshV) * 60 + Math.abs(rel) * 8, 1) * mo,
      0.15,
    );

    // deform the surface: slosh tilt + travelling waves + concentric impact
    const wpos = wineGeo.attributes.position;
    const arr = wpos.array as Float32Array;
    const { orig, idx } = surf;
    const imp = s.impact;
    for (let i = 0; i < idx.length; i++) {
      const ix = idx[i] * 3;
      const ox = orig[ix];
      const oz = orig[ix + 2];
      const r = Math.sqrt(ox * ox + oz * oz);
      const tiltZ = -rel * ox * 2.4;
      const waves =
        (Math.sin(r * 22 - time * 3.0) * 0.4 + Math.sin(ox * 16 + time * 2.1) * 0.35) *
        (0.0035 + s.energy * 0.022);
      const ripple =
        imp > 0
          ? Math.sin(r * 40 - (time - s.impactT) * 10.0) * Math.exp(-r * 4) * imp * 0.02
          : 0;
      arr[ix + 1] = orig[ix + 1] + tiltZ + waves + ripple;
    }
    wpos.needsUpdate = true;
    wineGeo.computeVertexNormals();

    // fade in; fade out into the flood transition near the end
    const a = glassIn * (1 - seg(p, 0.62, 0.8));
    glassMat.opacity = a;
    wineMat.opacity = a * 0.96;
    if (a < 0.5 && stream.current) stream.current.visible = false;
  });

  return (
    <group ref={group} position={[0, 0.02, 0]}>
      <directionalLight color={0xffe7c8} intensity={1.1} position={[-4, 4, 3]} />
      <directionalLight color={0xffd39a} intensity={1.6} position={[4, 2.4, -3.5]} />
      <mesh geometry={glassGeo} material={glassMat} />
      <mesh geometry={wineGeo} material={wineMat} />
      <mesh ref={stream} geometry={streamGeo} material={streamMat} visible={false} />
    </group>
  );
}

export function WineGlass3D({
  progress,
  active = true,
}: {
  progress: MutableRefObject<number>;
  active?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.1, far: 100, position: [0, 1.28, 5.2] }}
    >
      <GlassScene progress={progress} reduced={reduced} />
    </Canvas>
  );
}
