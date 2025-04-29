import React, { useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";

interface Card3DProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  depth?: number;
  glassEffect?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  title,
  children,
  className = "",
  footer,
  depth = 20,
  glassEffect = false,
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const baseClasses = glassEffect
    ? "glass-effect overflow-hidden"
    : "bg-white rounded-xl shadow-3d overflow-hidden";

  return (
    <motion.div
      ref={cardRef}
      className={`perspective-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`${baseClasses} transition-all duration-200 ease-out`}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {title && (
          <div
            className="px-6 py-4 border-b border-gray-200"
            style={{ transform: `translateZ(${depth / 2}px)` }}
          >
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
        )}

        <div
          className="px-6 py-4"
          style={{ transform: `translateZ(${depth}px)` }}
        >
          {children}
        </div>

        {footer && (
          <div
            className="px-6 py-4 bg-gray-50 border-t border-gray-200"
            style={{ transform: `translateZ(${depth / 2}px)` }}
          >
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
