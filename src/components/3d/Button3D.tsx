import React from "react";
import { motion } from "framer-motion";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "outline"
  | "glass"
  | "gradient";
type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonAnimation = "none" | "bounce" | "pulse" | "glow" | "float";

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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

export const Button3D: React.FC<Button3DProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  depth = 4,
  icon,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 ease-in-out focus:outline-none";

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
      "glass-effect text-white backdrop-blur-md hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:ring-offset-2",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <motion.button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
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
      {...props}
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
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};
