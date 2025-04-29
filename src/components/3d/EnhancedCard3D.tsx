import React, { useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";

interface EnhancedCard3DProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  depth?: number;
  glassEffect?: boolean;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  elevation?: "low" | "medium" | "high";
  onClick?: () => void;
  hoverEffect?: boolean;
  animate?: boolean;
}

export const EnhancedCard3D: React.FC<EnhancedCard3DProps> = ({
  title,
  children,
  className = "",
  footer,
  depth = 20,
  glassEffect = false,
  variant = "default",
  elevation = "medium",
  onClick,
  hoverEffect = true,
  animate = true,
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hoverEffect) return;

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

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200";
      case "success":
        return "bg-gradient-to-br from-green-50 to-green-100 border border-green-200";
      case "warning":
        return "bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200";
      case "danger":
        return "bg-gradient-to-br from-red-50 to-red-100 border border-red-200";
      case "info":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200";
      default:
        return "bg-white";
    }
  };

  const getElevationClasses = () => {
    switch (elevation) {
      case "low":
        return "shadow-3d-soft";
      case "high":
        return "shadow-3d-intense";
      default:
        return "shadow-3d";
    }
  };

  const getGlassEffectClasses = () => {
    if (!glassEffect) return "";
    return "backdrop-blur-md bg-opacity-70 border border-white border-opacity-20";
  };

  const baseClasses = `rounded-xl overflow-hidden ${getElevationClasses()} ${getVariantClasses()} ${getGlassEffectClasses()}`;

  return (
    <motion.div
      ref={cardRef}
      className={`perspective-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`${baseClasses} transition-all duration-200 ease-out ${
          onClick ? "cursor-pointer hover:shadow-3d-hover" : ""
        }`}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
        whileHover={onClick && hoverEffect ? { y: -5, scale: 1.02 } : {}}
      >
        {title && (
          <div
            className="px-6 py-4 border-b border-gray-200 font-medium text-gray-800"
            style={{ transform: `translateZ(${depth + 5}px)` }}
          >
            {title}
          </div>
        )}

        <div className="p-6" style={{ transform: `translateZ(${depth}px)` }}>
          {children}
        </div>

        {footer && (
          <div
            className="px-6 py-4 border-t border-gray-200 bg-gray-50"
            style={{ transform: `translateZ(${depth + 5}px)` }}
          >
            {footer}
          </div>
        )}

        {/* Subtle highlight effect on top edge */}
        <div
          className="absolute inset-x-0 top-0 h-1 bg-white bg-opacity-50 rounded-t-xl"
          style={{ transform: `translateZ(${depth + 1}px)` }}
        />
      </motion.div>
    </motion.div>
  );
};
