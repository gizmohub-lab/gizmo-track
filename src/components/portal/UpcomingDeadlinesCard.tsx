import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowRight,
  ExternalLink,
  Check,
  MoreVertical,
  Flame,
} from 'lucide-react';
import { DeadlineItem, ActiveTab } from '../../types';
import {
  evaluateDeadline,
  sortEvaluatedDeadlines,
  EvaluatedDeadline,
} from '../../utils/deadlineUtils';

interface UpcomingDeadlinesCardProps {
  deadlines: DeadlineItem[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenDeadlineDetails?: (deadline: DeadlineItem) => void;
  onOpenAddDeadlineModal: () => void;
  onOpenViewAllModal: () => void;
  onToggleCompleteDeadline?: (id: string) => void;
}

export const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({
  deadlines,
  onNavigateTab,
  onOpenDeadlineDetails,
  onOpenAddDeadlineModal,
  onOpenViewAllModal,
  onToggleCompleteDeadline,
}) => {
  // Live ticker that updates every second for real-time second/minute countdowns
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Evaluate & sort all active deadlines
  const evaluatedAll: EvaluatedDeadline[] = deadlines.map((d) =>
    evaluateDeadline(d, currentTime)
  );

  const sortedList = sortEvaluatedDeadlines(evaluatedAll);
  // Separate active uncompleted items
  const activeList = sortedList.filter((item) => !item.deadline.isCompleted);
  const displayItems = activeList.slice(0, 5);
  const hasMoreThan5 = activeList.length > 5;

  const overdueCount = activeList.filter((item) => item.urgency === 'OVERDUE').length;
  const urgentCount = activeList.filter(
    (item) => item.urgency === 'URGENT' || item.urgency === 'DUE_NOW'
  ).length;

  const handleItemClick = (item: EvaluatedDeadline) => {
    if (onOpenDeadlineDetails) {
      onOpenDeadlineDetails(item.deadline);
      return;
    }

    // Default cross-navigation based on item type
    if (item.deadline.type === 'project' || item.deadline.referenceId?.startsWith('proj')) {
      onNavigateTab('projects');
    } else if (
      item.deadline.type === 'local-work' ||
      item.deadline.type === 'order' ||
      item.deadline.referenceId?.startsWith('lw')
    ) {
      onNavigateTab('local-works');
    } else if (
      item.deadline.type === 'invoice' ||
      item.deadline.referenceId?.startsWith('inv')
    ) {
      onNavigateTab('invoice');
    } else {
      onOpenViewAllModal();
    }
  };

  return (
    <section
      id="upcoming-deadlines-card"
      aria-labelledby="upcoming-deadlines-heading"
      className="bg-white border border-black rounded-2xl shadow-xs overflow-hidden transition-all duration-150"
    >
      {/* CARD HEADER */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-start gap-3">
          {/* Alarm / Bell Icon with subtle visual indicator */}
          <div className="relative shrink-0 mt-0.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                urgentCount > 0 || overdueCount > 0
                  ? 'bg-[#FFF1EE] text-[#FF5738] border border-[#FFB2A1]'
                  : 'bg-zinc-100 text-black border border-zinc-200'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            {(urgentCount > 0 || overdueCount > 0) && (
              <span
                className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF5738] rounded-full ring-2 ring-white animate-pulse"
                title="Critical deadline approaching"
              />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                id="upcoming-deadlines-heading"
                className="font-display font-black text-lg sm:text-xl tracking-tight text-black flex items-center gap-2"
              >
                Upcoming Deadlines
              </h2>

              {/* Status Badges */}
              {overdueCount > 0 && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  {overdueCount} Overdue
                </span>
              )}
              {urgentCount > 0 && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF1EE] text-[#FF5738] border border-[#FFB2A1] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5738] animate-pulse" />
                  {urgentCount} Urgent
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Don't miss your important deadlines
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={onOpenAddDeadlineModal}
            className="px-3 py-1.5 bg-black hover:bg-zinc-800 active:scale-98 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF5738]" />
            <span>New Deadline</span>
          </button>

          {activeList.length > 0 && (
            <button
              type="button"
              onClick={onOpenViewAllModal}
              className="px-3 py-1.5 border border-zinc-200 hover:border-black hover:bg-zinc-50 text-black rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({activeList.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* DEADLINE ITEMS LIST */}
      {displayItems.length === 0 ? (
        /* Empty State */
        <div className="py-10 px-6 text-center bg-zinc-50/50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-zinc-900">
            You're all caught up!
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            No upcoming deadlines. All project milestones, print runs, and client orders are on schedule.
          </p>
          <button
            type="button"
            onClick={onOpenAddDeadlineModal}
            className="mt-4 px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-zinc-100 text-black border border-black rounded-lg transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF5738]" />
            <span>Create a Deadline</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {displayItems.map((item, idx) => {
            const { deadline, urgency, relativeStatus, countdownText, exactDateTimeText } = item;

            // Visual priority styling:
            // OVERDUE: clear distinct warning style
            // DUE NOW / URGENT: stronger pinkish-orange (#FF5738) emphasis + alarm indicator
            // APPROACHING: pinkish-orange soft tints (#FFF1EE)
            // NORMAL: clean minimalist black/white/slate
            const isCritical = urgency === 'URGENT' || urgency === 'DUE_NOW';
            const isOverdue = urgency === 'OVERDUE';
            const isApproaching = urgency === 'APPROACHING';

            return (
              <div
                key={deadline.id || idx}
                onClick={() => handleItemClick(item)}
                className={`p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 cursor-pointer transition-colors group ${
                  isOverdue ? 'bg-rose-50/20' : isCritical ? 'bg-[#FFF1EE]/30' : ''
                }`}
              >
                {/* Left: Alarm Icon + Title + Due Date */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Alarm Icon specific to state */}
                  <div className="mt-0.5 shrink-0">
                    {isOverdue ? (
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : isCritical ? (
                      <div className="w-8 h-8 rounded-lg bg-[#FFF1EE] text-[#FF5738] flex items-center justify-center border border-[#FFB2A1]">
                        <Clock className="w-4 h-4 animate-pulse" />
                      </div>
                    ) : isApproaching ? (
                      <div className="w-8 h-8 rounded-lg bg-[#FFF1EE] text-[#FF5738] flex items-center justify-center border border-[#FFB2A1]/70">
                        <Clock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center border border-zinc-200">
                        <Calendar className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Task / Order Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-sm sm:text-base text-zinc-950 group-hover:text-[#FF5738] transition-colors truncate">
                        {deadline.title}
                      </span>

                      {/* Type Badge */}
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                        {deadline.type.toUpperCase()}
                      </span>

                      {deadline.clientName && (
                        <span className="text-xs text-zinc-500 font-medium truncate hidden md:inline">
                          · {deadline.clientName}
                        </span>
                      )}
                    </div>

                    {/* Exact Date & Time: Always visible! */}
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600 font-medium flex-wrap">
                      <span className="text-zinc-400 font-semibold">Due:</span>
                      <span className="font-mono text-zinc-900 font-semibold">
                        {exactDateTimeText}
                      </span>

                      {deadline.assignedTo && (
                        <span className="text-zinc-400 text-[11px] hidden sm:inline">
                          (Assigned: {deadline.assignedTo})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Relative Status / Live Countdown Badge */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pl-11 sm:pl-0">
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 transition ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : urgency === 'DUE_NOW'
                        ? 'bg-[#FF5738] text-white border border-[#FF5738] shadow-xs'
                        : urgency === 'URGENT'
                        ? 'bg-[#FFF1EE] text-[#FF5738] border border-[#FFB2A1] shadow-xs'
                        : isApproaching
                        ? 'bg-[#FFF1EE] text-[#FF5738] border border-[#FFB2A1]'
                        : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                    }`}
                  >
                    {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5738] animate-pulse" />}
                    <span>
                      {urgency === 'OVERDUE'
                        ? '• Overdue'
                        : urgency === 'DUE_NOW'
                        ? '• Due now'
                        : `• ${relativeStatus || countdownText}`}
                    </span>
                  </div>

                  {/* Mark complete button */}
                  {onToggleCompleteDeadline && (
                    <button
                      type="button"
                      title="Mark as completed"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompleteDeadline(deadline.id);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <div className="text-zinc-300 group-hover:text-black transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CARD FOOTER (When > 5 items or quick links) */}
      {hasMoreThan5 && (
        <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs px-5">
          <span className="text-zinc-500 font-medium">
            Showing top 5 priority deadlines of {activeList.length} total
          </span>
          <button
            type="button"
            onClick={onOpenViewAllModal}
            className="font-bold text-black hover:text-[#FF5738] flex items-center gap-1 transition"
          >
            <span>View all deadlines →</span>
          </button>
        </div>
      )}
    </section>
  );
};
