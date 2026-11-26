"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function Whale() {
  const whale = useRef();
  const pointer = useRef({ x: 0, y: 0 });
  const canvas = useThree((state) => state.gl.domElement);
  const { scene, animations } = useLoader(GLTFLoader, "/models/whale.glb?v=flippers-1");
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  useEffect(() => {
    const action = animations.length ? mixer.clipAction(animations[0]) : null;
    action?.play();
    return () => {
      action?.stop();
      mixer.uncacheRoot(scene);
    };
  }, [animations, mixer, scene]);

  useEffect(() => {
    const followPointer = (event) => {
      if (event.pointerType === "touch") return;
      const bounds = canvas.getBoundingClientRect();
      pointer.current.x = THREE.MathUtils.clamp(
        (event.clientX - (bounds.left + bounds.width / 2)) / (window.innerWidth / 2), -1, 1,
      );
      pointer.current.y = THREE.MathUtils.clamp(
        ((bounds.top + bounds.height / 2) - event.clientY) / (window.innerHeight / 2), -1, 1,
      );
    };
    const resetPointer = () => { pointer.current.x = 0; pointer.current.y = 0; };
    window.addEventListener("pointermove", followPointer, { passive: true });
    window.addEventListener("blur", resetPointer);
    return () => {
      window.removeEventListener("pointermove", followPointer);
      window.removeEventListener("blur", resetPointer);
    };
  }, [canvas]);

  useFrame((state, delta) => {
    mixer.update(delta);
    if (!whale.current) return;
    const time = state.clock.getElapsedTime();
    const easing = 1 - Math.exp(-3 * delta);
    whale.current.rotation.y = THREE.MathUtils.lerp(whale.current.rotation.y, -Math.PI / 2 + pointer.current.x * 0.45, easing);
    whale.current.rotation.x = THREE.MathUtils.lerp(whale.current.rotation.x, -pointer.current.y * 0.25, easing);
    whale.current.position.y = Math.sin(time * 0.85) * 0.11;
  });

  return (
    <group ref={whale} rotation={[0, -Math.PI / 2, 0]}>
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
      <ambientLight intensity={1.8} />
      <directionalLight position={[3.5, 4.5, 4]} intensity={1.8} color="#fff8f3" />
      <pointLight position={[-4, -1, 2]} intensity={1.2} color="#a9e7ea" />
      <pointLight position={[2, -2, 1]} intensity={0.8} color="#ffd1c4" />
      <Suspense fallback={null}><Whale /></Suspense>
      <Bubbles />
    </Canvas>
  );
}
