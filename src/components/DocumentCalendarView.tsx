'use client';

import { useState, useMemo } from 'react';
import {
  Document,
  DOCUMENT_TYPES,
  EXPIRY_COLORS,
} from '@/types/document';
import { Employee } from '@/types/employee';
import {
  getCalendarDays,
  calculateDaysRemaining,
  getExpiryStatus,
} from '@/lib/documentManager';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentCalendarViewProps {
  documents: Document[];
  employees: Employee[];
  onDocumentClick?: (doc: Document) => void;
}

export default function DocumentCalendarView({
  documents,
  employees,
  onDocumentClick,
}: DocumentCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(
    () => getCalendarDays(documents, year, month),
    [documents, year, month]
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleDateString('en-AE', {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getEmployee = (employeeId?: string) =>
    employees.find((e) => e.id === employeeId);

  // Generate calendar grid
  const calendarGrid = [];
  let dayCounter = 1;

  for (let week = 0; week < 6; week++) {
    const weekDaysArr = [];
    for (let day = 0; day < 7; day++) {
      if ((week === 0 && day < firstDayOfMonth) || dayCounter > daysInMonth) {
        weekDaysArr.push(null);
      } else {
        weekDaysArr.push(dayCounter);
        dayCounter++;
      }
    }
    calendarGrid.push(weekDaysArr);
    if (dayCounter > daysInMonth) break;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h3 className="font-display font-semibold text-gray-900 min-w-[180px] text-center">
            {monthName}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                day === 'Fri' || day === 'Sat' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarGrid.flat().map((day, index) => {
            const docsForDay = day ? calendarDays.get(day) || [] : [];
            const hasExpiring = docsForDay.length > 0;

            return (
              <div
                key={index}
                className={`min-h-[80px] p-1 rounded-lg border ${
                  day === null
                    ? 'bg-gray-50 border-transparent'
                    : isToday(day)
                    ? 'bg-teal-50 border-teal-200'
                    : hasExpiring
                    ? 'bg-white border-gray-200 hover:border-gray-300'
                    : 'bg-white border-gray-100'
                }`}
              >
                {day !== null && (
                  <>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday(day) ? 'text-teal-600' : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {docsForDay.slice(0, 3).map((doc) => {
                        const status = getExpiryStatus(
                          calculateDaysRemaining(doc.expiryDate)
                        );
                        const employee = getEmployee(doc.employeeId);

                        return (
                          <button
                            key={doc.id}
                            onClick={() => onDocumentClick?.(doc)}
                            className={`w-full text-left px-1.5 py-0.5 rounded text-xs truncate ${EXPIRY_COLORS[status]} text-white hover:opacity-80 transition-opacity`}
                            title={`${DOCUMENT_TYPES[doc.documentType].label}${
                              employee
                                ? ` - ${employee.personalInfo.firstName}`
                                : ''
                            }`}
                          >
                            {DOCUMENT_TYPES[doc.documentType].icon}
                          </button>
                        );
                      })}
                      {docsForDay.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{docsForDay.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-gray-600">&gt;90 days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-600">60-90 days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-gray-600">30-60 days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-gray-600">7-30 days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-600">&lt;7 days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-500" />
            <span className="text-gray-600">Expired</span>
          </div>
        </div>
      </div>
    </div>
  );
}
