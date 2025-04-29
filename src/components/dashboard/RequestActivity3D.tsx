import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, useTexture, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useRequest } from '../../context/RequestContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import * as THREE from 'three';

// Day cube component
const DayCube = ({ 
  date, 
  count, 
  maxCount, 
  isToday, 
  isSelected, 
  onSelect,
  position,
  dayName
}) => {
  const meshRef = useRef();
  const textRef = useRef();
  
  // Calculate height based on request count
  const height = Math.max(0.2, (count / maxCount) * 2);
  
  // Colors
  const baseColor = isToday 
    ? new THREE.Color('#3b82f6') 
    : new THREE.Color('#64748b');
  
  const hoverColor = isToday 
    ? new THREE.Color('#2563eb') 
    : new THREE.Color('#475569');
  
  const selectedColor = new THREE.Color('#1d4ed8');
  
  // Animation
  useFrame(() => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.001) * 0.05;
      
      // Rotate slightly when selected
      if (isSelected) {
        meshRef.current.rotation.y += 0.01;
      } else {
        // Smoothly return to original rotation
        meshRef.current.rotation.y *= 0.95;
      }
    }
  });

  return (
    <group position={position}>
      {/* Day cube */}
      <mesh
        ref={meshRef}
        onClick={() => onSelect(date)}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
          if (meshRef.current) {
            meshRef.current.scale.set(1.1, 1.1, 1.1);
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          if (meshRef.current) {
            meshRef.current.scale.set(1, 1, 1);
          }
        }}
      >
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial 
          color={isSelected ? selectedColor : baseColor} 
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
      
      {/* Day number */}
      <Text
        ref={textRef}
        position={[0, height / 2 + 0.1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="bottom"
      >
        {date.getDate()}
      </Text>
      
      {/* Day name */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="top"
      >
        {dayName}
      </Text>
      
      {/* Request count */}
      {count > 0 && (
        <Text
          position={[0, height / 2 + 0.4, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="bottom"
        >
          {count} {count === 1 ? 'request' : 'requests'}
        </Text>
      )}
    </group>
  );
};

// Scene component
const CalendarScene = ({ requestsPerDay, selectedDate, setSelectedDate }) => {
  // Find max count for scaling
  const maxCount = Math.max(...requestsPerDay.map(day => day.count), 1);
  
  // Format day names
  const formatDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <PerspectiveCamera makeDefault position={[0, 2, 7]} />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        rotateSpeed={0.5}
      />
      
      {requestsPerDay.map((day, i) => {
        const position = [(i - 3) * 1.5, 0, 0];
        const isToday = day.date.toDateString() === new Date().toDateString();
        const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
        
        return (
          <DayCube
            key={i}
            date={day.date}
            count={day.count}
            maxCount={maxCount}
            isToday={isToday}
            isSelected={isSelected}
            onSelect={setSelectedDate}
            position={position}
            dayName={formatDayName(day.date)}
          />
        );
      })}
    </>
  );
};

// Main component
export const RequestActivity3D: React.FC = () => {
  const { requests } = useRequest();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    return startOfWeek;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRequests, setSelectedRequests] = useState([]);
  
  // Generate days for the current week
  const daysOfWeek = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      return day;
    });
  }, [currentWeekStart]);
  
  // Calculate requests per day
  const requestsPerDay = useMemo(() => {
    return daysOfWeek.map(day => {
      const dayRequests = requests.filter(req => {
        const reqDate = new Date(req.createdAt);
        return reqDate.toDateString() === day.toDateString();
      });
      
      return { 
        date: day, 
        count: dayRequests.length,
        requests: dayRequests
      };
    });
  }, [daysOfWeek, requests]);
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
    setSelectedDate(null);
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
    setSelectedDate(null);
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dayData = requestsPerDay.find(day => 
      day.date.toDateString() === date.toDateString()
    );
    setSelectedRequests(dayData?.requests || []);
  };
  
  // Format date range for display
  const formatDateRange = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(currentWeekStart.getDate() + 6);
    
    const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
    
    const startDay = currentWeekStart.getDate();
    const endDay = endOfWeek.getDate();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Request Activity
        </h3>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-sm font-medium text-gray-700 mx-2">
            {formatDateRange()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative h-64 mb-4"
      >
        <Canvas>
          <CalendarScene 
            requestsPerDay={requestsPerDay} 
            selectedDate={selectedDate}
            setSelectedDate={handleDateSelect}
          />
        </Canvas>
      </motion.div>
      
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-200 pt-4 mt-4"
        >
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Requests for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          
          {selectedRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No requests on this day</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {selectedRequests.map(request => (
                <motion.div
                  key={request.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{request.projectName}</p>
                    <p className="text-xs text-gray-500">{request.requester.name}</p>
                  </div>
                  <Badge status={request.status} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
};
