import React from 'react';
import { motion } from 'framer-motion';

interface FloatingObjectProps {
  size: number;
  color: string;
  delay: number;
  duration: number;
  x: number;
  y: number;
}

const FloatingObject: React.FC<FloatingObjectProps> = ({ 
  size, 
  color, 
  delay, 
  duration, 
  x, 
  y 
}) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        left: `${x}%`,
        top: `${y}%`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
      }}
      initial={{ y: y - 10, opacity: 0 }}
      animate={{ y: y + 10, opacity: 0.7 }}
      transition={{
        y: {
          duration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay
        },
        opacity: {
          duration: 0.5,
          delay
        }
      }}
    />
  );
};

interface SimpleBackgroundSceneProps {
  objectCount?: number;
  className?: string;
}

export const SimpleBackgroundScene: React.FC<SimpleBackgroundSceneProps> = ({
  objectCount = 10,
  className = ''
}) => {
  // Generate random objects
  const objects = Array.from({ length: objectCount }).map((_, i) => ({
    size: Math.random() * 30 + 10,
    color: [
      '#4f46e5', // primary
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f43f5e', // rose
    ][Math.floor(Math.random() * 5)],
    delay: Math.random() * 2,
    duration: Math.random() * 4 + 3,
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {objects.map((obj, i) => (
        <FloatingObject key={i} {...obj} />
      ))}
    </div>
  );
};
