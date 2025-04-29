import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

interface StatCard3DProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
  glassEffect?: boolean;
}

export const StatCard3D: React.FC<StatCard3DProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  className = "",
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

    const rotateXValue = ((y - centerY) / centerY) * -7;
    const rotateYValue = ((x - centerX) / centerX) * 7;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const variantClasses = {
    default: "bg-blue-50 text-blue-700",
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
  };

  const iconClasses = {
    default: "text-blue-400",
    success: "text-green-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  const baseClasses = glassEffect
    ? "glass-effect rounded-lg p-6 flex items-start"
    : "bg-white rounded-lg shadow-3d p-6 flex items-start";

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
        <div
          className={`p-3 rounded-full mr-4 ${variantClasses[variant]}`}
          style={{ transform: "translateZ(20px)" }}
        >
          <div className={iconClasses[variant]}>{icon}</div>
        </div>
        <div style={{ transform: "translateZ(15px)" }}>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 text-3xl font-semibold text-gray-900">
            {value}
          </div>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
};
