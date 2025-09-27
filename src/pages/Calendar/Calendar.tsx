import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper functions to replace date-fns
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getStartOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getEndOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const getStartOfWeek = (date) => {
    const day = date.getDay();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
  };

  const getEndOfWeek = (date) => {
    const day = date.getDay();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - day));
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const isSameMonth = (date1, date2) => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  // Dummy attendance data (dates in current month when user was present)
  const attendanceDates = [
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 3),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 8),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 12),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 21),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 26),
  ];

  const renderHeader = () => {
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    return (
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={prevMonth} 
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
        </button>
        
        <h2 className="text-lg font-medium text-gray-900">
          {formatMonth(currentMonth)}
        </h2>
        
        <button 
          onClick={nextMonth} 
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return (
      <div className="grid grid-cols-7 mb-1">
        {days.map((day, index) => (
          <div key={day + index} className="h-8 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = getStartOfMonth(currentMonth);
    const monthEnd = getEndOfMonth(monthStart);
    const startDate = getStartOfWeek(monthStart);
    const endDate = getEndOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = day.getDate().toString();
        const cloneDay = new Date(day);
        const isPresent = attendanceDates.some((date) => isSameDay(date, cloneDay));
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            className="h-8 flex items-center justify-center relative"
            key={day.toString()}
          >
            <div
              className={`
                w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200
                ${!isCurrentMonth 
                  ? "text-gray-300" 
                  : isPresent 
                    ? "bg-green-500 text-white shadow-md" 
                    : isToday
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {formattedDate}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  const attendanceCount = attendanceDates.length;
  const totalDaysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const attendancePercentage = Math.round((attendanceCount / totalDaysInMonth) * 100);

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Calendar Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      {/* Stats Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Attendance</span>
          <span className="font-medium text-gray-900">{attendanceCount}/{totalDaysInMonth}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Rate</span>
          <span className={`font-medium ${attendancePercentage >= 75 ? 'text-green-600' : 'text-orange-600'}`}>
            {attendancePercentage}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                attendancePercentage >= 75 ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${attendancePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;