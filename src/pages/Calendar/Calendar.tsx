import { useState, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Employee {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  status?: string;
}

interface CalendarProps {
  employee: Employee;
}

const Calendar = ({ employee }: CalendarProps): ReactNode => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper functions
  const formatMonth = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getEndOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const getStartOfWeek = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  const getEndOfWeek = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - date.getDay()));

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const isSameMonth = (date1: Date, date2: Date) =>
    date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();

  // Dummy attendance data
  const attendanceDates: Date[] = [
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 3),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 8),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 12),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 21),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 26),
  ];

  // Header
  const renderHeader = () => {
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    return (
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white" />
        </button>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{formatMonth(currentMonth)}</h2>
        <button
          onClick={nextMonth}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white" />
        </button>
      </div>
    );
  };

  // Weekday headers
  const renderDays = () => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return (
      <div className="grid grid-cols-7 mb-1">
        {days.map((day, idx) => (
          <div key={idx} className="h-8 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{day}</span>
          </div>
        ))}
      </div>
    );
  };

  // Calendar cells
  const renderCells = () => {
    const monthStart = getStartOfMonth(currentMonth);
    const monthEnd = getEndOfMonth(monthStart);
    const startDate = getStartOfWeek(monthEnd); // corrected
    const endDate = getEndOfWeek(monthEnd);

    const rows: ReactNode[] = [];
    let days: ReactNode[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const isPresent = attendanceDates.some((date) => isSameDay(date, cloneDay));
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div className="h-8 flex items-center justify-center relative" key={day.toString()}>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200
                ${
                  !isCurrentMonth
                    ? "text-gray-300 dark:text-gray-600"
                    : isPresent
                    ? "bg-green-500 text-white shadow-md"
                    : isToday
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {day.getDate()}
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

  // Stats
  const attendanceCount = attendanceDates.length;
  const totalDaysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const attendancePercentage = Math.round((attendanceCount / totalDaysInMonth) * 100);

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Calendar Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        {renderHeader()}
        {renderDays()}
        {renderCells()}

        {/* Employee info */}
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            Employee: {employee.first_name} {employee.last_name} ({employee.email})
          </p>
          <p>Role: {employee.role} | Status: {employee.status}</p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mt-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Attendance</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {attendanceCount}/{totalDaysInMonth}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600 dark:text-gray-400">Rate</span>
          <span className={`font-medium ${attendancePercentage >= 75 ? "text-green-600" : "text-orange-600"}`}>
            {attendancePercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${attendancePercentage >= 75 ? "bg-green-500" : "bg-orange-500"}`}
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
