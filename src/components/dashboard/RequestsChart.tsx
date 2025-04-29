import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useRequest } from "../../context/RequestContext";

export const RequestsChart: React.FC = () => {
  const { requests } = useRequest();
  const [chartView, setChartView] = useState<"week" | "month">("week");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState(false);

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

  // Initialize the week to start on Sunday of the current week
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    setCurrentWeekStart(startOfWeek);
  }, []);

  // Generate days of the week
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    return day;
  });

  // Format dates
  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };

  const formatDateRange = () => {
    const startMonth = currentWeekStart.toLocaleDateString("en-US", {
      month: "short",
    });
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });

    if (startMonth === endMonth) {
      return `${startMonth} ${currentWeekStart.getDate()} - ${endDate.getDate()}`;
    } else {
      return `${startMonth} ${currentWeekStart.getDate()} - ${endMonth} ${endDate.getDate()}`;
    }
  };

  // Calculate requests per day for the week
  const requestsPerDay = daysOfWeek.map((day) => {
    const count = requests.filter((req) => {
      const reqDate = new Date(req.createdAt);
      return reqDate.toDateString() === day.toDateString();
    }).length;

    return { date: day, count };
  });

  // Find max for scaling
  const maxRequests = Math.max(...requestsPerDay.map((r) => r.count), 5);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Find today's index in the current week
  const todayIndex = daysOfWeek.findIndex(
    (day) => new Date().toDateString() === day.toDateString()
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">
            Request Activity
          </h3>
        </div>
        <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
          <button
            className="p-1 rounded-md text-gray-400 hover:text-gray-500"
            onClick={goToPreviousWeek}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-medium text-gray-700 mx-2">
            {formatDateRange()}
          </div>
          <button
            className="p-1 rounded-md text-gray-400 hover:text-gray-500"
            onClick={goToNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar view for mobile */}
      <div className="mt-4 overflow-x-auto pb-2">
        <div className="min-w-[300px]">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day, i) => (
              <div
                key={i}
                className={`text-center p-1 ${
                  todayIndex === i ? "bg-blue-100 rounded-full" : ""
                }`}
              >
                <div className="text-xs text-gray-500">
                  {formatWeekday(day)}
                </div>
                <div
                  className={`text-sm font-medium ${
                    todayIndex === i ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {formatDay(day)}
                </div>
              </div>
            ))}
          </div>

          {/* Status indicators */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-4 text-xs">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-1"></span>
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1"></span>
              <span className="text-gray-600">Approved</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-1"></span>
              <span className="text-gray-600">Denied</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-1"></span>
              <span className="text-gray-600">Fulfilled</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-1"></span>
              <span className="text-gray-600">Out of Stock</span>
            </div>
          </div>

          {/* Activity bars */}
          <div className="flex items-end justify-between h-24 sm:h-36 mt-4">
            {requestsPerDay.map((day, i) => {
              const heightPercent =
                day.count > 0
                  ? Math.max((day.count / maxRequests) * 100, 15)
                  : 0;

              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  {day.count > 0 && (
                    <div className="text-xs font-medium text-blue-600 mb-1">
                      {day.count}
                    </div>
                  )}
                  <div
                    className={`w-full mx-1 rounded-t transition-all duration-300 ${
                      todayIndex === i
                        ? "bg-blue-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
