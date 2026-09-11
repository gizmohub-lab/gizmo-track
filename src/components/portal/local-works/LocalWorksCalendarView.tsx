import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { LocalWork } from '../../../types';
import { getStatusConfig, calculateWorkDeadline } from '../../../utils/localWorkUtils';

interface LocalWorksCalendarViewProps {
  works: LocalWork[];
  onSelectWork: (work: LocalWork) => void;
}

export const LocalWorksCalendarView: React.FC<LocalWorksCalendarViewProps> = ({
  works,
  onSelectWork,
}) => {
  // Current view month (starts with September 2026 as per application timeline)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 10)); // Sep 10, 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 10));
  };

  // Build days grid for this month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, isCurrentMonth: true, dateStr });
  }

  // Next month padding to complete 35 or 42 grid cells
  const remainingCells = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, isCurrentMonth: false, dateStr });
  }

  const todayStr = '2026-09-10';

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-black text-zinc-950">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Bar */}
      <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/70 text-center text-[11px] font-bold text-zinc-500 py-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-zinc-200 bg-zinc-100">
        {days.map((item, idx) => {
          const isToday = item.dateStr === todayStr;
          const dayWorks = works.filter((w) => (w.deadlineDate || w.date) === item.dateStr);

          return (
            <div
              key={idx}
              className={`min-h-[105px] p-2 bg-white transition flex flex-col justify-between ${
                !item.isCurrentMonth ? 'bg-zinc-50/50 text-zinc-300' : ''
              } ${isToday ? 'ring-2 ring-inset ring-[#FF5738]/30 bg-[#FFF1EE]/10' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday
                      ? 'bg-[#FF5738] text-white'
                      : item.isCurrentMonth
                      ? 'text-zinc-800'
                      : 'text-zinc-400'
                  }`}
                >
                  {item.day}
                </span>

                {dayWorks.length > 0 && (
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                    {dayWorks.length}
                  </span>
                )}
              </div>

              {/* Works for this day */}
              <div className="space-y-1 overflow-y-auto max-h-[85px]">
                {dayWorks.slice(0, 3).map((w) => {
                  const statusCfg = getStatusConfig(w.status);
                  const isUrgent = w.priority === 'Urgent';

                  return (
                    <button
                      key={w.id}
                      onClick={() => onSelectWork(w)}
                      className={`w-full text-left p-1 rounded text-[10px] font-bold truncate block border transition ${
                        isUrgent
                          ? 'bg-[#FFF1EE] text-[#FF5738] border-[#FFB2A1]'
                          : `${statusCfg.badgeBg} ${statusCfg.textColor} ${statusCfg.borderColor}`
                      }`}
                      title={`${w.title} (${w.clientName}) · ${w.deadlineTime || ''}`}
                    >
                      <span className="mr-1">{statusCfg.symbol}</span>
                      <span>{w.title}</span>
                    </button>
                  );
                })}
                {dayWorks.length > 3 && (
                  <div className="text-[9px] font-bold text-zinc-500 text-center">
                    +{dayWorks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
