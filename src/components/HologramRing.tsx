import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useMining } from "../context/MiningContext";

export default function HologramRing({ radius = 2, speed = 1, color = "#00eaff" }) {
  const ring = useRef();
  const { hashrate, mining } = useMining();

  useFrame((state, delta) => {
    if (!ring.current) return;

    const boost = mining ? Math.min(hashrate / 5000, 2.5) : 0.2;
    ring.current.rotation.z += delta * speed * boost;
    ring.current.material.opacity = mining ? 0.45 + boost * 0.2 : 0.2;
  });

  return (
    <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.92, radius, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.35}
        side={2}
      />
    </mesh>
  );
}
