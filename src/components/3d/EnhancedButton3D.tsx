import React from "react";
import { motion } from "framer-motion";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "outline"
  | "glass"
  | "gradient"
  | "logout";
type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonAnimation = "none" | "bounce" | "pulse" | "glow" | "float";

interface EnhancedButton3DProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
  depth?: number;
  icon?: React.ReactNode;
  animation?: ButtonAnimation;
  fullWidth?: boolean;
  iconPosition?: "left" | "right";
  rounded?: boolean;
}

export const EnhancedButton3D: React.FC<EnhancedButton3DProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  depth = 4,
  icon,
  animation = "none",
  fullWidth = false,
  iconPosition = "left",
  rounded = false,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out focus:outline-none";

  const variantClasses = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
    outline:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    glass:
      "backdrop-blur-md bg-white/20 text-white hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 border border-white/20",
    gradient:
      "bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:from-primary-600 hover:to-primary-800 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    logout:
      "bg-white text-gray-700 border border-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 shadow-sm hover:shadow-red-200",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
    xl: "text-lg px-8 py-4",
  };

  const animationClasses = {
    none: "",
    bounce: "animate-bounce-subtle",
    pulse: "animate-pulse-slow",
    glow: "shadow-3d-glow",
    float: "animate-hover-float",
  };

  const roundedClasses = rounded ? "rounded-full" : "rounded-md";
  const widthClasses = fullWidth ? "w-full" : "";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <motion.button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${animationClasses[animation]}
        ${roundedClasses}
        ${widthClasses}
        ${props.disabled ? disabledClasses : ""}
        ${className}
        btn-3d
      `}
      disabled={isLoading || props.disabled}
      whileTap={{ scale: 0.95 }}
      whileHover={{
        y: -depth,
        boxShadow: `0 ${depth * 2}px ${depth * 3}px rgba(0, 0, 0, 0.1)`,
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      <span
        style={{ transform: `translateZ(${depth}px)` }}
        className="flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="ml-2">{icon}</span>
            )}
          </>
        )}
      </span>

      {/* Subtle highlight effect on top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-white bg-opacity-50"
        style={{ transform: `translateZ(${depth + 1}px)` }}
      />
    </motion.button>
  );
};
