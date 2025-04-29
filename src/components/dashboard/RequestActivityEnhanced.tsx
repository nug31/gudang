import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity,
  Info,
} from "lucide-react";
import { useRequest } from "../../context/RequestContext";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const RequestActivityEnhanced: React.FC = () => {
  const { requests } = useRequest();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    return startOfWeek;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

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
    return daysOfWeek.map((day) => {
      const dayRequests = requests.filter((req) => {
        const reqDate = new Date(req.createdAt);
        return reqDate.toDateString() === day.toDateString();
      });

      return {
        date: day,
        count: dayRequests.length,
        requests: dayRequests,
      };
    });
  }, [daysOfWeek, requests]);

  // Find max count for scaling
  const maxCount = Math.max(...requestsPerDay.map((day) => day.count), 5);

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
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      // If clicking the same date, deselect it
      setSelectedDate(null);
      setSelectedRequests([]);
    } else {
      setSelectedDate(date);
      const dayData = requestsPerDay.find(
        (day) => day.date.toDateString() === date.toDateString()
      );
      setSelectedRequests(dayData?.requests || []);
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(currentWeekStart.getDate() + 6);

    const startMonth = currentWeekStart.toLocaleDateString("en-US", {
      month: "short",
    });
    const endMonth = endOfWeek.toLocaleDateString("en-US", { month: "short" });

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
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Get status counts for a specific day
  const getStatusCounts = (requests) => {
    const counts = {
      pending: 0,
      approved: 0,
      denied: 0,
      fulfilled: 0,
      out_of_stock: 0,
    };

    requests.forEach((req) => {
      counts[req.status]++;
    });

    return counts;
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
        <div className="flex items-end justify-between h-48 mt-4 px-2">
          {requestsPerDay.map((day, i) => {
            const heightPercent = (day.count / maxCount) * 100;
            const isToday =
              day.date.toDateString() === new Date().toDateString();
            const isSelected =
              selectedDate &&
              day.date.toDateString() === selectedDate.toDateString();
            const statusCounts = getStatusCounts(day.requests);

            // Calculate heights for each status segment
            const totalCount = day.count || 1; // Avoid division by zero
            const pendingHeight =
              (statusCounts.pending / totalCount) * heightPercent;
            const approvedHeight =
              (statusCounts.approved / totalCount) * heightPercent;
            const deniedHeight =
              (statusCounts.denied / totalCount) * heightPercent;
            const fulfilledHeight =
              (statusCounts.fulfilled / totalCount) * heightPercent;
            const outOfStockHeight =
              (statusCounts.out_of_stock / totalCount) * heightPercent;

            return (
              <div
                key={i}
                className="flex flex-col items-center flex-1"
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  className={`relative w-full mx-1 rounded-t cursor-pointer transition-all duration-300 ${
                    isSelected ? "ring-2 ring-blue-500 ring-opacity-75" : ""
                  }`}
                  style={{ height: `${heightPercent}%` }}
                  onClick={() => handleDateSelect(day.date)}
                >
                  {/* Stacked bar segments for different statuses */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-amber-400 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${pendingHeight}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    style={{ zIndex: 5 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-green-400"
                    initial={{ height: 0 }}
                    animate={{ height: `${pendingHeight + approvedHeight}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }}
                    style={{ zIndex: 4 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-red-400"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${
                        pendingHeight + approvedHeight + deniedHeight
                      }%`,
                    }}
                    transition={{ duration: 0.5, delay: i * 0.05 + 0.2 }}
                    style={{ zIndex: 3 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-blue-400"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${
                        pendingHeight +
                        approvedHeight +
                        deniedHeight +
                        fulfilledHeight
                      }%`,
                    }}
                    transition={{ duration: 0.5, delay: i * 0.05 + 0.3 }}
                    style={{ zIndex: 2 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gray-400 rounded-t"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${
                        pendingHeight +
                        approvedHeight +
                        deniedHeight +
                        fulfilledHeight +
                        outOfStockHeight
                      }%`,
                    }}
                    transition={{ duration: 0.5, delay: i * 0.05 + 0.4 }}
                    style={{ zIndex: 1 }}
                  />

                  {/* Hover effect */}
                  <motion.div
                    className={`absolute inset-0 bg-black rounded-t ${
                      isSelected ? "opacity-10" : "opacity-0"
                    }`}
                    whileHover={{ opacity: 0.05 }}
                  />

                  {/* Count badge */}
                  {day.count > 0 && (
                    <motion.div
                      className="absolute -top-6 left-0 right-0 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                    >
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isToday
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {day.count}
                      </span>
                    </motion.div>
                  )}

                  {/* Tooltip on hover */}
                  <AnimatePresence>
                    {hoveredDay === i && day.count > 0 && (
                      <motion.div
                        className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg z-10 w-36"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="text-xs font-medium mb-1 text-center">
                          {formatDayName(day.date)} {day.date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {statusCounts.pending > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                              <span className="text-xs">
                                Pending: {statusCounts.pending}
                              </span>
                            </div>
                          )}
                          {statusCounts.approved > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              <span className="text-xs">
                                Approved: {statusCounts.approved}
                              </span>
                            </div>
                          )}
                          {statusCounts.denied > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="w-2 h-2 rounded-full bg-red-400"></div>
                              <span className="text-xs">
                                Denied: {statusCounts.denied}
                              </span>
                            </div>
                          )}
                          {statusCounts.fulfilled > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                              <span className="text-xs">
                                Fulfilled: {statusCounts.fulfilled}
                              </span>
                            </div>
                          )}
                          {statusCounts.out_of_stock > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                              <span className="text-xs">
                                Out of Stock: {statusCounts.out_of_stock}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Day label */}
                <div
                  className={`text-xs mt-2 font-medium ${
                    isToday ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {formatDayName(day.date)}
                </div>
                <div
                  className={`text-xs ${
                    isToday ? "text-blue-500 font-medium" : "text-gray-400"
                  }`}
                >
                  {day.date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center mt-6 space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-400 mr-1"></div>
            <span className="text-xs text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
            <span className="text-xs text-gray-600">Approved</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
            <span className="text-xs text-gray-600">Denied</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>
            <span className="text-xs text-gray-600">Fulfilled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
            <span className="text-xs text-gray-600">Out of Stock</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 pt-4 mt-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Activity className="h-4 w-4 mr-1 text-blue-500" />
                Requests for{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {selectedRequests.length}{" "}
                {selectedRequests.length === 1 ? "request" : "requests"}
              </span>
            </div>

            {selectedRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-md">
                <Info className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No requests on this day</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {selectedRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {request.projectName}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 mr-1">
                          {request.requester.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs text-gray-500">
                          {request.requester.name}
                        </p>
                        <span className="mx-1 text-gray-300">•</span>
                        <p className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge status={request.status} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
