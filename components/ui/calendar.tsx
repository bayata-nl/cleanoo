'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface CalendarProps {
  assignments: any[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export default function Calendar({ assignments, onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get assignments for a specific date
  const getAssignmentsForDate = (date: Date) => {
    if (!assignments) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return assignments.filter(assignment => {
      const assignmentDate = assignment.preferred_date || assignment.preferredDate;
      return assignmentDate === dateStr;
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-24"></div>;
          }

          const dayAssignments = getAssignmentsForDate(date);
          const hasAssignments = dayAssignments.length > 0;

          return (
            <div
              key={index}
              className={`
                h-24 border border-gray-200 p-1 cursor-pointer transition-colors
                ${isToday(date) ? 'bg-blue-50 border-blue-300' : ''}
                ${isSelected(date) ? 'bg-blue-100 border-blue-400' : ''}
                ${hasAssignments ? 'bg-green-50 border-green-300' : ''}
                hover:bg-gray-50
              `}
              onClick={() => onDateSelect?.(date)}
            >
              <div className="flex flex-col h-full">
                <div className={`
                  text-sm font-medium mb-1
                  ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}
                `}>
                  {date.getDate()}
                </div>
                
                {/* Assignment indicators */}
                <div className="flex-1 overflow-hidden">
                  {dayAssignments.slice(0, 2).map((assignment, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-green-500 text-white rounded px-1 py-0.5 mb-1 truncate"
                      title={`${assignment.service_type} - ${assignment.customer_name}`}
                    >
                      {assignment.service_type}
                    </div>
                  ))}
                  {dayAssignments.length > 2 && (
                    <div className="text-xs text-green-600 font-medium">
                      +{dayAssignments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
