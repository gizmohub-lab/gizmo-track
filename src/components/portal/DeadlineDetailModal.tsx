import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Pencil,
  Check,
  User,
  Building,
  FileText,
} from 'lucide-react';
import { DeadlineItem, ActiveTab } from '../../types';
import { evaluateDeadline, EvaluatedDeadline } from '../../utils/deadlineUtils';

interface DeadlineDetailModalProps {
  deadline: DeadlineItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (deadline: DeadlineItem) => void;
  onToggleComplete: (id: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DeadlineDetailModal: React.FC<DeadlineDetailModalProps> = ({
  deadline,
  isOpen,
  onClose,
  onEdit,
  onToggleComplete,
  onNavigateTab,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen || !deadline) return null;

  const evaluated: EvaluatedDeadline = evaluateDeadline(deadline, currentTime);
  const { urgency, relativeStatus, countdownText, exactDateTimeText } = evaluated;

  const isOverdue = urgency === 'OVERDUE' && !deadline.isCompleted;
  const isCritical = (urgency === 'URGENT' || urgency === 'DUE_NOW') && !deadline.isCompleted;

  const handleOpenRelated = () => {
    onClose();
    if (deadline.type === 'project' || deadline.referenceId?.startsWith('proj')) {
      onNavigateTab('projects');
    } else if (
      deadline.type === 'local-work' ||
      deadline.type === 'order' ||
      deadline.referenceId?.startsWith('lw')
    ) {
      onNavigateTab('local-works');
    } else if (
      deadline.type === 'invoice' ||
      deadline.referenceId?.startsWith('inv')
    ) {
      onNavigateTab('invoice');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-black shadow-2xl max-w-lg w-full overflow-hidden text-zinc-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-zinc-100 flex items-start justify-between bg-white">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isOverdue
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : isCritical
                  ? 'bg-[#FFF1EE] text-[#FF5738] border border-[#FFB2A1]'
                  : 'bg-zinc-100 text-black border border-zinc-200'
              }`}
            >
              {isOverdue ? (
                <AlertTriangle className="w-5 h-5" />
              ) : isCritical ? (
                <Bell className="w-5 h-5 animate-pulse" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {deadline.type.toUpperCase()}
                </span>
                {deadline.priority === 'Urgent' && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF1EE] text-[#FF5738] border border-[#FFB2A1]">
                    Urgent Priority
                  </span>
                )}
              </div>
              <h3 className="font-display font-black text-lg text-zinc-950 mt-1">
                {deadline.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATUS BANNER */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            deadline.isCompleted
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : isOverdue
              ? 'bg-rose-50 border-rose-100 text-rose-800'
              : isCritical
              ? 'bg-[#FFF1EE] border-[#FFB2A1] text-[#FF5738]'
              : 'bg-zinc-50 border-zinc-100 text-zinc-800'
          }`}
        >
          <div>
            <div className="text-[11px] font-mono uppercase font-bold tracking-wider">
              {deadline.isCompleted
                ? 'Task Finished'
                : isOverdue
                ? 'Overdue Deadline'
                : isCritical
                ? 'Critical Deadline Notice'
                : 'Upcoming Deadline'}
            </div>
            <div className="text-sm font-black font-mono mt-0.5">
              {deadline.isCompleted
                ? 'Completed'
                : urgency === 'OVERDUE'
                ? '• Overdue'
                : urgency === 'DUE_NOW'
                ? '• Due now'
                : `• ${relativeStatus || countdownText}`}
            </div>
          </div>

          <button
            onClick={() => onToggleComplete(deadline.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
              deadline.isCompleted
                ? 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-black text-white border-black hover:bg-zinc-800'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{deadline.isCompleted ? 'Mark Active' : 'Mark Completed'}</span>
          </button>
        </div>

        {/* DETAILS BODY */}
        <div className="p-5 space-y-4 text-xs">
          {/* Exact Date & Time */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between text-zinc-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF5738]" />
                <span>Exact Due Date &amp; Time</span>
              </span>
              <span className="font-mono text-[11px]">Local System Time</span>
            </div>
            <div className="text-base font-black font-mono text-zinc-950">
              {exactDateTimeText}
            </div>
          </div>

          {/* Client & Assignment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-1.5 text-zinc-500 font-semibold mb-1">
                <Building className="w-3.5 h-3.5 text-zinc-400" />
                <span>Client / Account</span>
              </div>
              <div className="font-bold text-zinc-900 truncate">
                {deadline.clientName || 'Direct Studio Order'}
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-1.5 text-zinc-500 font-semibold mb-1">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Assigned Team</span>
              </div>
              <div className="font-bold text-zinc-900 truncate">
                {deadline.assignedTo || 'Gizmo Studio Lead'}
              </div>
            </div>
          </div>

          {/* Description */}
          {deadline.description && (
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-1.5 text-zinc-500 font-semibold mb-1">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Deliverable &amp; Notes</span>
              </div>
              <p className="text-zinc-700 leading-relaxed font-medium">
                {deadline.description}
              </p>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEdit(deadline);
            }}
            className="px-3 py-2 text-xs font-bold text-zinc-700 hover:text-black border border-zinc-300 rounded-lg bg-white flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <div className="flex items-center gap-2">
            {(deadline.type === 'project' ||
              deadline.type === 'local-work' ||
              deadline.type === 'order' ||
              deadline.type === 'invoice') && (
              <button
                onClick={handleOpenRelated}
                className="px-3.5 py-2 text-xs font-bold bg-[#FF5738] hover:bg-[#e0482c] text-white rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Open in {deadline.type === 'project' ? 'Projects' : deadline.type === 'invoice' ? 'Invoices' : 'Local Works'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-black hover:bg-zinc-800 text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
