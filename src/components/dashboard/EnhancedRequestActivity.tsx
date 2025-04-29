import React, { useState, useEffect } from 'react';
import { RequestActivity3D } from './RequestActivity3D';
import { RequestActivityAnimated } from './RequestActivityAnimated';

export const EnhancedRequestActivity: React.FC = () => {
  const [supports3D, setSupports3D] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if browser supports WebGL
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const supported = !!gl;
        setSupports3D(supported);
      } catch (e) {
        setSupports3D(false);
      }
      setIsLoading(false);
    };

    checkWebGLSupport();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return supports3D ? <RequestActivity3D /> : <RequestActivityAnimated />;
};
