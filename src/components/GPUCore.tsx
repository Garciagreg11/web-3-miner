// src/components/GPUCore.tsx
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMiner } from "../hooks/useMiner";

/* -------------------------------------------------------
   PARTICLE BURST (share submission explosion)
------------------------------------------------------- */
function ParticleBurst({ lastShare }) {
  const group = useRef();
  const particles = useRef([]);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!lastShare) return;
    setTrigger((t) => t + 1);
  }, [lastShare]);

  useEffect(() => {
    if (!group.current) return;

    particles.current = Array.from({ length: 24 }).map(() => ({
      x: 0,
      y: 0,
      z: 0,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      vz: (Math.random() - 0.5) * 0.12,
      life: 1.0,
    }));
  }, [trigger]);

  useFrame((state, delta) => {
    if (!group.current) return;

    particles.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.life -= delta * 1.8;
    });

    group.current.children.forEach((mesh, i) => {
      const p = particles.current[i];
      if (!p || p.life <= 0) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      mesh.position.set(p.x, p.y, p.z);
      mesh.scale.setScalar(p.life);
      mesh.material.opacity = p.life;
    });
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {Array.from({ length: 24 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#00faff"
            emissive="#00faff"
            emissiveIntensity={2}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------
   ENERGY DISK (rotating plasma plate under the cube)
------------------------------------------------------- */
function EnergyDisk({ mining, hashrate, lastShare }) {
  const disk = useRef();
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (!lastShare) return;
    setFlash(1);
    const t = setTimeout(() => setFlash(0), 150);
    return () => clearTimeout(t);
  }, [lastShare]);

  useFrame((state, delta) => {
    if (!disk.current) return;

    disk.current.rotation.z += delta * 0.2;

    if (mining) {
      const boost = Math.min(hashrate / 9000, 2.0);
      disk.current.rotation.z += delta * boost;
    }
  });

  const glow = mining ? Math.min(hashrate / 3000, 1.8) : 0.15;

  return (
    <mesh
      ref={disk}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, -1.1, 0]}
      scale={2.8}
    >
      <cylinderGeometry args={[1.6, 1.6, 0.08, 64]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#00eaff"
        emissiveIntensity={glow + flash * 2.5}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

/* -------------------------------------------------------
   HOLOGRAM RINGS (outer + inner rotating rings)
------------------------------------------------------- */
function ReactorRings({ mining, hashrate, lastShare }) {
  const ring1 = useRef();
  const ring2 = useRef();
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (!lastShare) return;
    setFlash(1);
    const t = setTimeout(() => setFlash(0), 150);
    return () => clearTimeout(t);
  }, [lastShare]);

  useFrame((state, delta) => {
    if (ring1.current) {
      ring1.current.rotation.z += delta * 0.6;
      if (mining) ring1.current.rotation.z += delta * Math.min(hashrate / 9000, 1.5);
    }
    if (ring2.current) {
      ring2.current.rotation.z -= delta * 0.4;
      if (mining) ring2.current.rotation.z -= delta * Math.min(hashrate / 9000, 1.5);
    }
  });

  const glow = mining ? Math.min(hashrate / 3000, 1.8) : 0.2;

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]} scale={2.8}>
        <torusGeometry args={[1.4, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#00eaff"
          emissive="#00eaff"
          emissiveIntensity={glow + flash * 2}
          metalness={0.4}
          roughness={0.1}
        />
      </mesh>

      <mesh ref={ring2} rotation={[Math.PI / 2, 0, 0]} scale={2.2}>
        <torusGeometry args={[1.1, 0.035, 16, 100]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={glow + flash * 2}
          metalness={0.4}
          roughness={0.1}
        />
      </mesh>
    </>
  );
}

/* -------------------------------------------------------
   REACTOR CUBE (main GPU core)
------------------------------------------------------- */
function ReactorCube() {
  const mesh = useRef();
  const { mining, hashrate, lastShare } = useMiner();
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (!lastShare) return;
    setFlash(1);
    const t = setTimeout(() => setFlash(0), 150);
    return () => clearTimeout(t);
  }, [lastShare]);

  useEffect(() => {
    if (hashrate > 0) {
      setFlash(1);
      const t = setTimeout(() => setFlash(0), 120);
      return () => clearTimeout(t);
    }
  }, [hashrate]);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    mesh.current.rotation.x += delta * 0.4;
    mesh.current.rotation.y += delta * 0.6;

    if (mining) {
      const speedBoost = Math.min(hashrate / 8000, 2.5);
      mesh.current.rotation.x += delta * speedBoost;
      mesh.current.rotation.y += delta * speedBoost;
    }
  });

  const glow = mining ? Math.min(hashrate / 2500, 2.2) : 0.25;

  return (
    <mesh ref={mesh} scale={1.8}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={mining ? "#00f5ff" : "#555"}
        emissive={mining ? "#00eaff" : "#222"}
        emissiveIntensity={glow + flash * 2.5}
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  );
}

/* -------------------------------------------------------
   FLOATING HOLOGRAM STATS (HUD above cube)
------------------------------------------------------- */
function HologramStats({ mining, hashrate, lastShare }) {
  const group = useRef();
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (!lastShare) return;
    setFlash(1);
    const t = setTimeout(() => setFlash(0), 200);
    return () => clearTimeout(t);
  }, [lastShare]);

  useFrame((state, delta) => {
    if (!group.current) return;

    group.current.position.y =
      1.6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;

    group.current.rotation.y += delta * 0.4;
  });

  const glow = mining ? 1.2 : 0.3;

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[2.2, 1.1]} />
        <meshStandardMaterial
          color="#00eaff"
          emissive="#00eaff"
          emissiveIntensity={glow + flash * 2}
          transparent
          opacity={0.25}
        />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <textGeometry
          args={[
            `Hashrate: ${hashrate.toFixed(0)} H/s\nShare: ${
              lastShare ? "✓" : "—"
            }\nMining: ${mining ? "ON" : "OFF"}`,
            { size: 0.12, height: 0.01 },
          ]}
        />
        <meshStandardMaterial
          color="#00faff"
          emissive="#00faff"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------
   MAIN GPUCORE EXPORT
------------------------------------------------------- */
export default function GPUCore() {
  const { mining, hashrate, lastShare } = useMiner();

  return (
    <div style={{ width: "100%", height: "260px" }}>
      <Canvas camera={{ position: [3, 3, 3], fov: 55 }}>
        <ambientLight intensity={0.35} />
        <pointLight position={[10, 10, 10]} intensity={1.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.6} />

        <ReactorCube />
        <ReactorRings mining={mining} hashrate={hashrate} lastShare={lastShare} />
        <EnergyDisk mining={mining} hashrate={hashrate} lastShare={lastShare} />
        <HologramStats mining={mining} hashrate={hashrate} lastShare={lastShare} />
        <ParticleBurst lastShare={lastShare} />

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
