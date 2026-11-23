"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const oceanBlue = "#3574d7";
const deepBlue = "#184d9f";

function Fin({ position, rotation, scale = 1 }) {
  return (
    <mesh position={position} rotation={rotation} scale={[scale, scale, scale]} castShadow>
      <sphereGeometry args={[0.62, 32, 32]} />
      <meshPhysicalMaterial color="#3567b6" roughness={0.24} clearcoat={0.72} clearcoatRoughness={0.18} />
    </mesh>
  );
}

function BellyRidges() {
  return (
    <group>
      {[-1.28, -0.94, -0.6, -0.26].map((x, index) => (
        <mesh key={x} position={[x, -0.57 + index * 0.012, 0.75]} rotation={[0, 0, -0.1 + index * 0.06]} scale={[0.032, 0.33, 0.024]}>
          <capsuleGeometry args={[1, 1, 8, 12]} />
          <meshStandardMaterial color="#b7cbd9" roughness={0.48} />
        </mesh>
      ))}
    </group>
  );
}

function Whale() {
  const whale = useRef();
  const tail = useRef();

  useFrame((state) => {
    if (!whale.current) return;
    const time = state.clock.getElapsedTime();
    whale.current.rotation.y = THREE.MathUtils.lerp(whale.current.rotation.y, state.pointer.x * 0.42 + 0.22, 0.045);
    whale.current.rotation.x = THREE.MathUtils.lerp(whale.current.rotation.x, -state.pointer.y * 0.17 + 0.03, 0.045);
    whale.current.position.y = Math.sin(time * 0.85) * 0.15;
    whale.current.position.x = Math.sin(time * 0.45) * 0.06;
    if (tail.current) tail.current.rotation.y = Math.sin(time * 2.1) * 0.27;
  });

  return (
    <group ref={whale} rotation={[0.06, 0.22, 0]} scale={1.05}>
      <mesh position={[0.02, 0, 0]} scale={[1.58, 0.88, 0.82]} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial color="#3567b6" roughness={0.2} metalness={0.03} clearcoat={0.82} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[-1.18, 0.04, 0.08]} scale={[1.1, 0.98, 0.88]} castShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial color="#3c71c3" roughness={0.19} clearcoat={0.84} clearcoatRoughness={0.11} />
      </mesh>
      <mesh position={[-0.45, -0.48, 0.07]} scale={[1.42, 0.5, 0.77]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#edf4f5" roughness={0.42} />
      </mesh>
      <BellyRidges />
      <mesh position={[1.35, 0.12, 0]} scale={[1.05, 0.48, 0.47]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial color="#3567b6" roughness={0.22} clearcoat={0.78} clearcoatRoughness={0.13} />
      </mesh>
      <mesh position={[-1.58, 0.08, 0.76]}><sphereGeometry args={[0.115, 28, 28]} /><meshStandardMaterial color="#071728" roughness={0.12} metalness={0.15} /></mesh>
      <mesh position={[-1.61, 0.125, 0.84]}><sphereGeometry args={[0.037, 18, 18]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[-1.38, 0.9, 0.04]} scale={[0.12, 0.042, 0.075]}><sphereGeometry args={[1, 22, 22]} /><meshBasicMaterial color="#173b72" /></mesh>
      <Fin position={[-0.62, -0.64, 0.72]} rotation={[0.28, 0.08, -0.76]} scale={0.88} />
      <Fin position={[-0.12, -0.6, -0.7]} rotation={[-0.28, -0.1, -0.74]} scale={0.66} />
      <group ref={tail} position={[2.04, 0.45, 0]}>
        <mesh position={[0.2, 0.25, 0.44]} rotation={[0.3, 0.15, 0.73]} scale={[0.72, 0.43, 0.75]}><sphereGeometry args={[0.74, 32, 32]} /><meshPhysicalMaterial color="#3567b6" roughness={0.25} clearcoat={0.68} /></mesh>
        <mesh position={[0.2, 0.25, -0.44]} rotation={[-0.3, -0.15, 0.73]} scale={[0.72, 0.43, 0.75]}><sphereGeometry args={[0.74, 32, 32]} /><meshPhysicalMaterial color="#3567b6" roughness={0.25} clearcoat={0.68} /></mesh>
      </group>
      <mesh position={[-0.15, 0.82, 0]} rotation={[0, 0, 0.22]} scale={[0.26, 0.55, 0.22]}><sphereGeometry args={[1, 32, 32]} /><meshStandardMaterial color="#285bb0" roughness={0.3} /></mesh>
    </group>
  );
}

function useWhaleGeometry() {
  return useMemo(() => {
    const profile = [
      [0.14, -2.32], [0.31, -2.16], [0.54, -1.82], [0.79, -1.35],
      [1.03, -0.7], [1.22, -0.06], [1.43, 0.58], [1.49, 1.04],
      [1.36, 1.43], [1.02, 1.71], [0.46, 1.86], [0, 1.9],
    ].map(([radius, axis]) => new THREE.Vector2(radius, axis));

    const geometry = new THREE.LatheGeometry(profile, 96);
    geometry.rotateX(Math.PI / 2);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

function useLeafGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.38);
    shape.bezierCurveTo(0.56, -0.2, 0.88, 0.42, 0.56, 0.96);
    shape.bezierCurveTo(0.27, 1.16, -0.2, 0.62, 0, -0.38);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.17,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.065,
      bevelThickness: 0.06,
      curveSegments: 24,
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

function useSmileGeometry() {
  return useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.26, -0.28, 2.67),
      new THREE.Vector3(0, -0.4, 2.76),
      new THREE.Vector3(0.26, -0.28, 2.67),
    );
    return new THREE.TubeGeometry(curve, 24, 0.022, 10, false);
  }, []);
}

function useBellyLineGeometries() {
  return useMemo(() => (
    [-0.66, -0.33, 0, 0.33, 0.66].map((x) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(x * 0.86, -0.98 + Math.abs(x) * 0.1, 2.48),
        new THREE.Vector3(x * 0.96, -0.48, 2.63),
        new THREE.Vector3(x * 0.7, -0.04 + Math.abs(x) * 0.09, 2.47),
      );
      return new THREE.TubeGeometry(curve, 16, 0.018, 8, false);
    })
  ), []);
}

function CuteWhale() {
  const whale = useRef();
  const tail = useRef();
  const bodyGeometry = useWhaleGeometry();
  const leafGeometry = useLeafGeometry();
  const smileGeometry = useSmileGeometry();
  const bellyLines = useBellyLineGeometries();

  useFrame((state) => {
    if (!whale.current) return;
    const time = state.clock.getElapsedTime();
    whale.current.rotation.y = THREE.MathUtils.lerp(whale.current.rotation.y, state.pointer.x * 0.24, 0.04);
    whale.current.rotation.x = THREE.MathUtils.lerp(whale.current.rotation.x, -state.pointer.y * 0.12 + 0.03, 0.04);
    whale.current.position.y = Math.sin(time * 0.85) * 0.13;
    whale.current.position.x = Math.sin(time * 0.42) * 0.05;
    if (tail.current) tail.current.rotation.z = Math.sin(time * 2.2) * 0.11;
  });

  return (
    <group ref={whale} rotation={[0.04, -0.08, 0]} scale={1.02}>
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial color={oceanBlue} roughness={0.17} metalness={0.01} clearcoat={0.95} clearcoatRoughness={0.11} />
      </mesh>

      <mesh position={[0, -0.65, 1.72]} scale={[1.16, 0.53, 1.06]} castShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial color="#fff8ef" roughness={0.34} clearcoat={0.28} clearcoatRoughness={0.32} />
      </mesh>
      {bellyLines.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshStandardMaterial color="#d7c5c3" roughness={0.5} />
        </mesh>
      ))}

      <group ref={tail} position={[0, 0.16, -2.15]}>
        <mesh position={[0, -0.05, 0.2]} scale={[0.42, 0.5, 0.64]}>
          <sphereGeometry args={[1, 40, 40]} />
          <meshPhysicalMaterial color={deepBlue} roughness={0.22} clearcoat={0.75} />
        </mesh>
        <mesh geometry={leafGeometry} position={[0.48, 0.28, -0.03]} rotation={[0, 0, -0.87]} scale={[0.9, 0.9, 0.9]} castShadow>
          <meshPhysicalMaterial color={oceanBlue} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.13} />
        </mesh>
        <mesh geometry={leafGeometry} position={[-0.48, 0.28, -0.03]} rotation={[0, 0, 0.87]} scale={[0.9, 0.9, 0.9]} castShadow>
          <meshPhysicalMaterial color={oceanBlue} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.13} />
        </mesh>
      </group>

      <mesh geometry={leafGeometry} position={[1.14, -0.36, 0.56]} rotation={[0.13, 0.1, -1.1]} scale={[0.8, 0.8, 0.82]} castShadow>
        <meshPhysicalMaterial color={deepBlue} roughness={0.23} clearcoat={0.78} />
      </mesh>
      <mesh geometry={leafGeometry} position={[-1.12, -0.36, 0.56]} rotation={[0.13, -0.1, 1.1]} scale={[0.8, 0.8, 0.82]} castShadow>
        <meshPhysicalMaterial color={deepBlue} roughness={0.23} clearcoat={0.78} />
      </mesh>
      <mesh geometry={leafGeometry} position={[0, 1.14, -0.32]} rotation={[0, Math.PI / 2, 0.08]} scale={[0.58, 0.77, 0.74]} castShadow>
        <meshPhysicalMaterial color={deepBlue} roughness={0.25} clearcoat={0.72} />
      </mesh>

      {[-0.5, 0.5].map((x) => (
        <group key={x} position={[x, 0.16, 2.59]}>
          <mesh scale={[0.17, 0.25, 0.08]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshPhysicalMaterial color="#10224a" roughness={0.08} clearcoat={1} clearcoatRoughness={0.04} />
          </mesh>
          <mesh position={[-0.045, 0.075, 0.07]} scale={[0.047, 0.07, 0.02]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      <mesh geometry={smileGeometry}>
        <meshBasicMaterial color="#29477f" />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, -0.27, 2.47]} scale={[0.24, 0.12, 0.035]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color="#f7a8b8" transparent opacity={0.72} />
        </mesh>
      ))}
      <group position={[0, 1.18, 1.63]} rotation={[0.3, 0, 0]}>
        {[-0.09, 0.09].map((x) => (
          <mesh key={x} position={[x, 0, 0]} scale={[0.032, 0.06, 0.027]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#163b76" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Bubbles() {
  const group = useRef();
  useFrame((state) => { if (group.current) group.current.rotation.y = state.clock.getElapsedTime() * 0.06; });
  return (
    <group ref={group}>
      {[[2.7, 1.4, -1], [-2.8, -1.45, -1], [-2.4, 1.7, -2], [2.55, -1.6, -1.4]].map((point, index) => (
        <mesh key={index} position={point}><sphereGeometry args={[0.07 + index * 0.025, 20, 20]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.6} roughness={0.1} transmission={0.55} /></mesh>
      ))}
    </group>
  );
}

export default function WhaleScene() {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 0.05, 7.35], fov: 37 }}>
      <color attach="background" args={["#eaf7f4"]} /><fog attach="fog" args={["#eaf7f4", 6, 14]} />
      <ambientLight intensity={1.75} /><directionalLight position={[3.5, 4.5, 4]} intensity={2.6} color="#fff5d8" castShadow />
      <pointLight position={[-4, -1, 2]} intensity={2.3} color="#70d7dd" /><pointLight position={[2, -2, 1]} intensity={1.3} color="#ffb898" />
      <CuteWhale /><Bubbles />
    </Canvas>
  );
}
