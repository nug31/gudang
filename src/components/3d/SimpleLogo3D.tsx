import React from 'react';
import { motion } from 'framer-motion';

interface SimpleLogo3DProps {
  text?: string;
  color?: string;
  className?: string;
}

export const SimpleLogo3D: React.FC<SimpleLogo3DProps> = ({
  text = 'IT',
  color = '#4f46e5',
  className = ''
}) => {
  return (
    <motion.div 
      className={`relative w-10 h-10 flex items-center justify-center ${className}`}
      initial={{ rotateY: 0 }}
      animate={{ rotateY: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    >
      <div 
        className="absolute inset-0 rounded-md"
        style={{ 
          backgroundColor: color,
          transform: 'translateZ(-5px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
        }}
      />
      <span className="text-white font-bold text-lg relative z-10">
        {text}
      </span>
    </motion.div>
  );
};
