import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Package,
  ShoppingCart,
  PlusCircle,
  Download,
  HandGrabbing,
} from "lucide-react";
import { Item } from "../../types";
import { Button3D } from "./Button3D";

interface ItemCard3DProps {
  item: Item;
  onClick: (item: Item) => void;
  className?: string;
}

export const ItemCard3D: React.FC<ItemCard3DProps> = ({
  item,
  onClick,
  className = "",
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !item.availableStock) return;

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
    setIsHovered(false);
  };

  const isAvailable = item.availableStock > 0;
  const stockStatus = isAvailable
    ? item.availableStock > 10
      ? "text-green-600"
      : "text-amber-600"
    : "text-red-600";

  return (
    <motion.div
      ref={cardRef}
      className={`perspective-container h-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`bg-white rounded-xl shadow-3d h-full transition-all duration-200 ease-out ${
          isAvailable ? "hover:shadow-3d-hover" : "opacity-75"
        }`}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
        whileHover={isAvailable ? { y: -5 } : {}}
      >
        <div className="p-4 h-full flex flex-col relative">
          {isAvailable && (
            <motion.div
              className="absolute top-2 right-2 bg-blue-100 text-blue-700 rounded-full p-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ transform: "translateZ(20px)" }}
            >
              <ExternalLink className="h-4 w-4" />
            </motion.div>
          )}

          <div
            className="flex items-center mb-3"
            style={{ transform: "translateZ(15px)" }}
          >
            <div className="p-2 rounded-full bg-blue-50 mr-3">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-medium text-gray-900">{item.name}</h3>
          </div>

          <div
            className="text-sm text-gray-600 mb-3"
            style={{ transform: "translateZ(10px)" }}
          >
            {item.description}
          </div>

          <div
            className="mt-auto flex justify-between items-center"
            style={{ transform: "translateZ(15px)" }}
          >
            <div className="text-sm font-medium">
              Category: <span className="text-gray-600">{item.category}</span>
            </div>
            <div className={`text-sm font-medium ${stockStatus}`}>
              {isAvailable ? `${item.availableStock} in stock` : "Out of stock"}
            </div>
          </div>

          {/* Request Item Button */}
          {isAvailable && (
            <>
              {/* Mobile version - Always visible at the bottom */}
              {isMobile && (
                <div className="mt-4 w-full">
                  <Button3D
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick(item);
                    }}
                    className="w-full shadow-lg"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Request
                  </Button3D>
                </div>
              )}

              {/* Desktop version - Only shows on hover */}
              {!isMobile && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl pointer-events-none"
                  initial={{ opacity: 0, visibility: "hidden" }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    visibility: isHovered ? "visible" : "hidden",
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ transform: "translateZ(25px)" }}
                >
                  <div className="pointer-events-auto">
                    <Button3D
                      variant="primary"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick(item);
                      }}
                      className="shadow-lg"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Request Item
                    </Button3D>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
