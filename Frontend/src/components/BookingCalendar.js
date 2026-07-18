import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const BookingCalendar = ({ availableDates, onDateSelect, selectedCheckIn, selectedCheckOut }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isAvailable = (day) => {
    if (!availableDates) return true;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availableDates.includes(dateStr);
  };

  const isSelected = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selectedCheckIn && date.getTime() === new Date(selectedCheckIn).getTime()) return 'checkin';
    if (selectedCheckOut && date.getTime() === new Date(selectedCheckOut).getTime()) return 'checkout';
    if (selectedCheckIn && selectedCheckOut && date > new Date(selectedCheckIn) && date < new Date(selectedCheckOut)) return 'between';
    return null;
  };

  const isPast = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < new Date().setHours(0, 0, 0, 0);
  };

  const handleDateClick = (day) => {
    if (isPast(day) || !isAvailable(day)) return;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  return (
    <div className="bg-surface dark:bg-surface rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4">Select Dates</h3>

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-surface-alt rounded-full"
        >
          <FaChevronLeft />
        </button>
        <h4 className="text-lg font-semibold text-ink-soft-soft dark:text-ink-soft-soft">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-surface-alt rounded-full"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-ink-soft-soft py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {[...Array(firstDay)].map((_, i) => (
          <div key={`empty-${i}`} className="h-10"></div>
        ))}

        {/* Day cells */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const selected = isSelected(day);
          const past = isPast(day);
          const available = isAvailable(day);

          let className = 'h-10 flex items-center justify-center rounded-lg text-sm cursor-pointer transition ';

          if (past) {
            className += 'border-outline cursor-not-allowed';
          } else if (!available) {
            className += 'border-outline bg-surface-alt dark:bg-app-bg cursor-not-allowed line-through';
          } else if (selected === 'checkin' || selected === 'checkout') {
            className += 'bg-green-600 text-white font-bold';
          } else if (selected === 'between') {
            className += 'bg-green-100 text-green-800';
          } else {
            className += 'hover:bg-green-50 text-ink-soft-soft dark:text-ink-soft-soft';
          }

          return (
            <div
              key={day}
              className={className}
              onClick={() => handleDateClick(day)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-500 dark:text-ink-soft-soft">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-600 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span>Stay Period</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-200 dark:bg-surface-alt rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;