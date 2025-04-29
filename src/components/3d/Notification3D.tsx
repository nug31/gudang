import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

type NotificationType = 'success' | 'warning' | 'info' | 'error';

interface Notification3DProps {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  isVisible?: boolean;
}

export const Notification3D: React.FC<Notification3DProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  isVisible = true
}) => {
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'success':
        return 'from-green-50 to-green-100 border-green-200';
      case 'warning':
        return 'from-amber-50 to-amber-100 border-amber-200';
      case 'info':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'error':
        return 'from-red-50 to-red-100 border-red-200';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 z-50 max-w-md w-full shadow-3d-soft rounded-xl overflow-hidden`}
          style={{ 
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          <div 
            className={`relative p-4 bg-gradient-to-br ${getGradient()} border`}
            style={{ transform: 'translateZ(5px)' }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                {getIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                <div className="mt-1 text-sm text-gray-700">{message}</div>
              </div>
              <button
                type="button"
                className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => {
                  setVisible(false);
                  if (onClose) onClose();
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
