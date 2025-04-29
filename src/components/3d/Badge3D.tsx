import React from 'react';
import { motion } from 'framer-motion';
import { RequestStatus } from '../../types';

interface Badge3DProps {
  status: RequestStatus;
  className?: string;
  elevated?: boolean;
  pulse?: boolean;
}

export const Badge3D: React.FC<Badge3DProps> = ({ 
  status, 
  className = '',
  elevated = true,
  pulse = false
}) => {
  let baseClasses = 'px-3 py-1 text-xs font-medium rounded-full inline-block';
  
  const statusClasses = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    fulfilled: 'bg-blue-100 text-blue-800',
    out_of_stock: 'bg-gray-100 text-gray-800'
  };
  
  const statusText = {
    pending: 'Pending',
    approved: 'Approved',
    denied: 'Denied',
    fulfilled: 'Fulfilled',
    out_of_stock: 'Out of Stock'
  };

  const shadowClasses = elevated ? 'shadow-md' : '';
  const pulseAnimation = pulse ? (status === 'pending' ? 'animate-pulse-slow' : '') : '';

  return (
    <motion.span 
      className={`${baseClasses} ${statusClasses[status]} ${shadowClasses} ${pulseAnimation} ${className}`}
      initial={{ y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
      transition={{ duration: 0.2 }}
    >
      {statusText[status]}
    </motion.span>
  );
};
