import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Activity } from 'lucide-react';
import { useRequest } from '../../context/RequestContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const RequestActivityAnimated: React.FC = () => {
  const { requests } = useRequest();
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
  
  // Find max count for scaling
  const maxCount = Math.max(...requestsPerDay.map(day => day.count), 5);
  
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
  
  // Format day name
  const formatDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
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
        className="mb-4"
      >
        <div className="flex items-end justify-between h-48 mt-4">
          {requestsPerDay.map((day, i) => {
            const heightPercent = (day.count / maxCount) * 100;
            const isToday = day.date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
            
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <motion.div 
                  className={`relative w-full mx-1 rounded-t cursor-pointer transition-colors duration-300 ${
                    isSelected 
                      ? 'bg-blue-700' 
                      : isToday 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                  initial={{ height: 0 }}
                  animate={{ 
                    height: `${heightPercent}%`,
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: i * 0.1,
                    y: { 
                      repeat: isSelected ? Infinity : 0, 
                      repeatType: "reverse", 
                      duration: 1.5 
                    }
                  }}
                  onClick={() => handleDateSelect(day.date)}
                  whileHover={{ scale: 1.05 }}
                >
                  {day.count > 0 && (
                    <motion.div 
                      className="absolute -top-6 left-0 right-0 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                    >
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {day.count}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
                <div className="text-xs text-gray-500 mt-2 font-medium">
                  {formatDayName(day.date)}
                </div>
                <div className="text-xs text-gray-400">
                  {day.date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
      
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-200 pt-4 mt-4"
        >
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Activity className="h-4 w-4 mr-1 text-blue-500" />
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
              {selectedRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
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
