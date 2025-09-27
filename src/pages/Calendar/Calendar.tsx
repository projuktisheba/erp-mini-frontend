import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    const dateFormat = "MMMM yyyy";

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          Prev
        </button>
        <h2 className="text-xl font-bold">{format(currentMonth, dateFormat)}</h2>
        <button onClick={nextMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          Next
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2 text-center font-semibold">
        {days.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows: JSX.Element[] = [];
    let days: JSX.Element[] = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;

        const isPresent = attendanceDates.some((date) => isSameDay(date, cloneDay));

        days.push(
          <div
            className={`p-2 h-14 flex items-center justify-center border border-gray-200 ${
              !isSameMonth(day, monthStart) ? "text-gray-400" : ""
            } ${isPresent ? "bg-green-400 text-white font-bold rounded" : ""}`}
            key={day.toString()}
          >
            {formattedDate}
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

    return <div>{rows}</div>;
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;
