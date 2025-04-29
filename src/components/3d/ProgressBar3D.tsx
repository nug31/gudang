import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBar3DProps {
  value: number;
  max?: number;
  height?: number;
  className?: string;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  animated?: boolean;
}

export const ProgressBar3D: React.FC<ProgressBar3DProps> = ({
  value,
  max = 100,
  height = 8,
  className = '',
  showValue = false,
  color = 'primary',
  animated = true
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'from-primary-400 to-primary-600';
      case 'success':
        return 'from-green-400 to-green-600';
      case 'warning':
        return 'from-amber-400 to-amber-600';
      case 'danger':
        return 'from-red-400 to-red-600';
      case 'info':
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="w-full overflow-hidden rounded-full bg-gray-200 shadow-inner"
        style={{ 
          height: `${height}px`,
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${getColorClasses()} rounded-full shadow-lg`}
          style={{ 
            transform: 'translateZ(2px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
        >
          {animated && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="animate-pulse-slow opacity-30 h-full w-full bg-white bg-opacity-20" />
            </div>
          )}
        </motion.div>
      </div>
      
      {showValue && (
        <div className="mt-1 text-xs font-medium text-gray-700 text-right">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};
