import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Sphere,
  Box,
  Environment,
  useTexture,
  Cloud,
  Stars,
} from "@react-three/drei";
import { Group, MathUtils, Vector3, Color } from "three";

interface FloatingObjectProps {
  position: [number, number, number];
  size: number;
  color: string;
  speed: number;
  rotationSpeed: number;
  shape: "sphere" | "box" | "cloud";
  opacity?: number;
}

const FloatingObject: React.FC<FloatingObjectProps> = ({
  position,
  size,
  color,
  speed,
  rotationSpeed,
  shape,
  opacity = 1,
}) => {
  const ref = useRef<Group>(null);
  const initialY = position[1];
  let time = Math.random() * 100;

  // Create a more realistic material with subtle variations
  const materialProps = useMemo(() => {
    return {
      color: color,
      roughness: MathUtils.randFloat(0.3, 0.7),
      metalness: MathUtils.randFloat(0.1, 0.5),
      transparent: opacity < 1,
      opacity: opacity,
      envMapIntensity: 1.5,
    };
  }, [color, opacity]);

  useFrame((state, delta) => {
    time += delta;
    if (ref.current) {
      // More natural floating motion with multiple sine waves
      ref.current.position.y =
        initialY +
        Math.sin(time * speed) * 0.3 +
        Math.sin(time * speed * 1.3) * 0.1;

      // Subtle position changes in x and z for more realism
      ref.current.position.x += Math.sin(time * speed * 0.7) * 0.002;
      ref.current.position.z += Math.cos(time * speed * 0.5) * 0.002;

      // Smooth rotation with varying speeds
      ref.current.rotation.x += delta * rotationSpeed * 0.3;
      ref.current.rotation.y += delta * rotationSpeed * 0.5;
      ref.current.rotation.z += delta * rotationSpeed * 0.2;
    }
  });

  return (
    <group ref={ref} position={position}>
      {shape === "sphere" ? (
        <Sphere args={[size, 32, 32]}>
          <meshPhysicalMaterial {...materialProps} />
        </Sphere>
      ) : shape === "box" ? (
        <Box args={[size, size, size]} radius={size * 0.05}>
          <meshPhysicalMaterial {...materialProps} />
        </Box>
      ) : (
        <Cloud
          opacity={opacity * 0.6}
          speed={0.4}
          width={size * 10}
          depth={size * 5}
          segments={20}
          color={color}
        />
      )}
    </group>
  );
};

interface BackgroundSceneProps {
  objectCount?: number;
  className?: string;
}

// Background fog component for depth
const BackgroundFog = () => {
  return <fog attach="fog" args={["#f8fafc", 15, 30]} />;
};

// Realistic background scene with depth and atmosphere
export const BackgroundScene: React.FC<BackgroundSceneProps> = ({
  objectCount = 15,
  className = "",
}) => {
  // Generate a variety of objects with different properties for a more realistic scene
  const objects = useMemo(() => {
    // Create foreground objects (closer to camera)
    const foregroundObjects = Array.from({
      length: Math.floor(objectCount * 0.4),
    }).map((_, i) => ({
      position: [
        MathUtils.randFloatSpread(12), // x
        MathUtils.randFloatSpread(6), // y
        MathUtils.randFloat(0, 5), // z - closer to camera
      ] as [number, number, number],
      size: MathUtils.randFloat(0.15, 0.3),
      color: [
        "#4f46e5", // primary
        "#3b82f6", // blue
        "#8b5cf6", // purple
      ][Math.floor(Math.random() * 3)],
      speed: MathUtils.randFloat(0.3, 0.8),
      rotationSpeed: MathUtils.randFloat(0.05, 0.2),
      shape: Math.random() > 0.7 ? "box" : "sphere",
      opacity: MathUtils.randFloat(0.7, 0.9),
    }));

    // Create midground objects
    const midgroundObjects = Array.from({
      length: Math.floor(objectCount * 0.4),
    }).map((_, i) => ({
      position: [
        MathUtils.randFloatSpread(16), // x
        MathUtils.randFloatSpread(8), // y
        MathUtils.randFloat(-5, -1), // z - mid distance
      ] as [number, number, number],
      size: MathUtils.randFloat(0.2, 0.4),
      color: [
        "#4f46e5", // primary
        "#3b82f6", // blue
        "#8b5cf6", // purple
        "#ec4899", // pink
      ][Math.floor(Math.random() * 4)],
      speed: MathUtils.randFloat(0.2, 0.5),
      rotationSpeed: MathUtils.randFloat(0.03, 0.15),
      shape:
        Math.random() > 0.5 ? "sphere" : Math.random() > 0.7 ? "cloud" : "box",
      opacity: MathUtils.randFloat(0.5, 0.8),
    }));

    // Create background objects (further from camera)
    const backgroundObjects = Array.from({
      length: Math.floor(objectCount * 0.2),
    }).map((_, i) => ({
      position: [
        MathUtils.randFloatSpread(20), // x
        MathUtils.randFloatSpread(10), // y
        MathUtils.randFloat(-10, -5), // z - far from camera
      ] as [number, number, number],
      size: MathUtils.randFloat(0.3, 0.6),
      color: [
        "#8b5cf6", // purple
        "#ec4899", // pink
        "#f43f5e", // rose
      ][Math.floor(Math.random() * 3)],
      speed: MathUtils.randFloat(0.1, 0.3),
      rotationSpeed: MathUtils.randFloat(0.02, 0.1),
      shape: Math.random() > 0.3 ? "cloud" : "sphere",
      opacity: MathUtils.randFloat(0.3, 0.6),
    }));

    return [...foregroundObjects, ...midgroundObjects, ...backgroundObjects];
  }, [objectCount]);

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas camera={{ position: [0, 0, 10], fov: 65 }} dpr={[1, 2]}>
        {/* Ambient lighting for base illumination */}
        <ambientLight intensity={0.4} />

        {/* Main light source */}
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#ffffff" />

        {/* Fill light for shadows */}
        <pointLight position={[-8, -5, -10]} intensity={0.2} color="#b4c6ef" />

        {/* Accent light for highlights */}
        <pointLight position={[0, 5, 0]} intensity={0.1} color="#fef3c7" />

        {/* Add subtle fog for depth */}
        <BackgroundFog />

        {/* Add stars in the background for depth */}
        <Stars
          radius={100}
          depth={50}
          count={1000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Render all our objects */}
        {objects.map((obj, i) => (
          <FloatingObject key={i} {...obj} />
        ))}

        {/* Environment map for realistic reflections */}
        <Environment preset="dawn" background={false} />
      </Canvas>
    </div>
  );
};
