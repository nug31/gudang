import React from "react";

interface SimpleBackgroundProps {
  className?: string;
  pattern?: "grid" | "dots" | "none";
  gradient?: boolean;
}

export const SimpleBackground: React.FC<SimpleBackgroundProps> = ({
  className = "",
  pattern = "grid",
  gradient = true,
}) => {
  // Get pattern class based on the pattern prop
  const getPatternClass = () => {
    switch (pattern) {
      case "grid":
        return "bg-grid-pattern";
      case "dots":
        return "bg-dots-pattern";
      default:
        return "";
    }
  };

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
      )}
      {pattern !== "none" && (
        <div
          className={`absolute inset-0 opacity-5 ${getPatternClass()}`}
        ></div>
      )}
    </div>
  );
};

export default SimpleBackground;
