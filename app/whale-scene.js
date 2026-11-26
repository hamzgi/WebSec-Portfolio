"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function Whale() {
  const whale = useRef();
  const { scene, animations } = useLoader(GLTFLoader, "/models/whale.glb");
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  useEffect(() => {
    const action = animations.length ? mixer.clipAction(animations[0]) : null;
    action?.play();
    return () => {
      action?.stop();
      mixer.uncacheRoot(scene);
    };
  }, [animations, mixer, scene]);

  useFrame((state, delta) => {
    mixer.update(delta);
    if (!whale.current) return;
    const time = state.clock.getElapsedTime();
    const easing = 1 - Math.exp(-3 * delta);
    whale.current.rotation.y = THREE.MathUtils.lerp(whale.current.rotation.y, state.pointer.x * 0.18 - 1.0, easing);
    whale.current.rotation.x = THREE.MathUtils.lerp(whale.current.rotation.x, -state.pointer.y * 0.12 + 0.06, easing);
    whale.current.position.y = Math.sin(time * 0.85) * 0.11;
  });

  return (
    <group ref={whale}>
      <primitive object={scene} position={[0.35, 0, 0]} />
    </group>
  );
}

function Bubbles() {
  const group = useRef();
  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.getElapsedTime() * 0.06;
  });
  return (
    <group ref={group}>
      {[[2.7, 1.4, -1], [-2.8, -1.45, -1], [-2.4, 1.7, -2], [2.55, -1.6, -1.4]].map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.07 + index * 0.025, 20, 20]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.6} roughness={0.1} transmission={0.55} />
        </mesh>
      ))}
    </group>
  );
}

export default function WhaleScene() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.05, 7.35], fov: 37 }}>
      <color attach="background" args={["#eaf7f4"]} />
      <fog attach="fog" args={["#eaf7f4", 6, 14]} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[3.5, 4.5, 4]} intensity={2.5} color="#fff5e6" />
      <pointLight position={[-4, -1, 2]} intensity={2} color="#70d7dd" />
      <pointLight position={[2, -2, 1]} intensity={1.2} color="#ffb898" />
      <Suspense fallback={null}><Whale /></Suspense>
      <Bubbles />
    </Canvas>
  );
}
