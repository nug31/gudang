import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Box } from "@react-three/drei";
import { Group } from "three";

interface Logo3DProps {
  size?: number;
  color?: string;
  text?: string;
  className?: string;
  rotate?: boolean;
}

const LogoModel: React.FC<{
  size: number;
  color: string;
  text: string;
  rotate: boolean;
}> = ({ size, color, text, rotate }) => {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current && rotate) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <Box args={[size * 1.2, size * 1.2, size * 0.2]} position={[0, 0, -0.1]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Box>
      <Text
        position={[0, 0, 0.1]}
        fontSize={size * 0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZs.woff"
      >
        {text}
      </Text>
    </group>
  );
};

export const Logo3D: React.FC<Logo3DProps> = ({
  size = 2,
  color = "#4f46e5",
  text = "IT",
  className = "",
  rotate = true,
}) => {
  return (
    <div className={`w-16 h-16 ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <LogoModel size={size} color={color} text={text} rotate={rotate} />
      </Canvas>
    </div>
  );
};
