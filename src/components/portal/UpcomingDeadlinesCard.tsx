import React from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowRight,
  Check,
} from 'lucide-react';
import { DeadlineItem, ActiveTab, Project, LocalWork } from '../../types';
import {
  useLiveNow,
  getAllUnifiedDeadlines,
  UnifiedDeadlineRecord,
} from '../../utils/dateTimeUtils';

interface UpcomingDeadlinesCardProps {
  deadlines: DeadlineItem[];
  projects?: Project[];
  localWorks?: LocalWork[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenDeadlineDetails?: (deadline: DeadlineItem) => void;
  onOpenAddDeadlineModal: () => void;
  onOpenViewAllModal: () => void;
  onToggleCompleteDeadline?: (id: string) => void;
}

export const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({
  deadlines = [],
  projects = [],
  localWorks = [],
  onNavigateTab,
  onOpenDeadlineDetails,
  onOpenAddDeadlineModal,
  onOpenViewAllModal,
  onToggleCompleteDeadline,
}) => {
  // Live current time hook that updates every second for live countdowns
  const currentTime = useLiveNow(1000);

  // Compile unified dynamic deadlines from projects, deliverables, local works, and standalone deadlines
  const unifiedList: UnifiedDeadlineRecord[] = getAllUnifiedDeadlines(projects, localWorks, currentTime);

  // Exclude completed items for active view
  const activeUnified = unifiedList.filter((item) => !item.isCompleted);

  // Top 5 items for card display
  const displayItems = activeUnified.slice(0, 5);
  const hasMoreThan5 = activeUnified.length > 5;

  const overdueCount = activeUnified.filter((item) => item.evaluation.isOverdue).length;
  const urgentCount = activeUnified.filter(
    (item) => item.evaluation.statusType === 'DUE_NOW' || item.evaluation.statusType === 'DUE_SOON'
  ).length;

  const handleItemClick = (item: UnifiedDeadlineRecord) => {
    if (item.targetRoute) {
      onNavigateTab(item.targetRoute);
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
              Live date & time driven task and project schedules
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

          {activeUnified.length > 0 && (
            <button
              type="button"
              onClick={onOpenViewAllModal}
              className="px-3 py-1.5 border border-zinc-200 hover:border-black hover:bg-zinc-50 text-black rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({activeUnified.length})</span>
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
          {displayItems.map((item) => {
            const { evaluation } = item;
            const isOverdue = evaluation.isOverdue;
            const isCritical = evaluation.statusType === 'DUE_NOW' || evaluation.statusType === 'DUE_SOON';

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 cursor-pointer transition-colors group ${
                  isOverdue ? 'bg-rose-50/20' : isCritical ? 'bg-[#FFF1EE]/30' : ''
                }`}
              >
                {/* Left: Alarm Icon + Title + Due Date */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="mt-0.5 shrink-0">
                    {isOverdue ? (
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : isCritical ? (
                      <div className="w-8 h-8 rounded-lg bg-[#FFF1EE] text-[#FF5738] flex items-center justify-center border border-[#FFB2A1]">
                        <Clock className="w-4 h-4 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center border border-zinc-200">
                        <Calendar className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-sm sm:text-base text-zinc-950 group-hover:text-[#FF5738] transition-colors truncate">
                        {item.title}
                      </span>

                      {/* Type Badge */}
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                        {item.sourceType}
                      </span>

                      {item.clientName && (
                        <span className="text-xs text-zinc-500 font-medium truncate hidden md:inline">
                          · {item.clientName}
                        </span>
                      )}
                    </div>

                    {/* Exact Date & Time: Always visible */}
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600 font-medium flex-wrap">
                      <span className="text-zinc-400 font-semibold">Due:</span>
                      <span className="font-mono text-zinc-900 font-semibold">
                        {evaluation.exactDateTimeText}
                      </span>

                      {item.assignedDesignerName && (
                        <span className="text-zinc-400 text-[11px] hidden sm:inline">
                          (Assigned: {item.assignedDesignerName})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Relative Status / Live Countdown Badge */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pl-11 sm:pl-0">
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 transition ${evaluation.badgeClass}`}
                  >
                    {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5738] animate-pulse" />}
                    <span>• {evaluation.countdownText}</span>
                  </div>

                  {/* Mark complete button */}
                  {onToggleCompleteDeadline && (
                    <button
                      type="button"
                      title="Mark as completed"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompleteDeadline(item.sourceId);
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

      {/* CARD FOOTER */}
      {hasMoreThan5 && (
        <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs px-5">
          <span className="text-zinc-500 font-medium">
            Showing top 5 priority deadlines of {activeUnified.length} total
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
