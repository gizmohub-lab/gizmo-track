import React, { useState } from 'react';
import {
  X,
  User,
  Calendar,
  Clock,
  Flag,
  Tag,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { CustomDesigner, ProjectPriorityItem, ProjectTypeItem } from '../../../types';
import { formatSystemTimestamp } from '../../../utils/projectUtils';

interface EditWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: string;
  workType: 'Project' | 'Local Work' | 'Custom';
  title: string;
  clientName?: string;
  initialDesignerId?: string;
  initialDesignerName?: string;
  initialCustomDisplayName?: string;
  initialStatus: string;
  initialPriority?: string;
  initialDeadlineDate?: string;
  initialDeadlineTime?: string;
  initialCategory?: string;
  initialWorkType?: string;
  initialNotes?: string;
  designers: CustomDesigner[];
  projectTypes?: ProjectTypeItem[];
  priorities?: ProjectPriorityItem[];
  onSave: (payload: {
    workId: string;
    workType: 'Project' | 'Local Work' | 'Custom';
    assignedDesignerId?: string;
    assignedDesignerName?: string;
    customDisplayName?: string;
    status: string;
    priority?: string;
    deadlineDate?: string;
    deadlineTime?: string;
    hasDeadline: boolean;
    category?: string;
    projectType?: string;
    notes?: string;
    completedAt?: string;
    historyLog: string;
  }) => void;
  onOpenEditPayment?: () => void;
}

export const EditWorkItemModal: React.FC<EditWorkItemModalProps> = ({
  isOpen,
  onClose,
  workId,
  workType,
  title,
  clientName,
  initialDesignerId = '',
  initialDesignerName = '',
  initialCustomDisplayName = '',
  initialStatus = 'In Progress',
  initialPriority = 'Normal',
  initialDeadlineDate = '',
  initialDeadlineTime = '',
  initialCategory = '',
  initialWorkType = '',
  initialNotes = '',
  designers = [],
  projectTypes = [],
  priorities = [],
  onSave,
  onOpenEditPayment,
}) => {
  const [designerId, setDesignerId] = useState<string>(initialDesignerId);
  const [designerName, setDesignerName] = useState<string>(initialDesignerName);
  const [customDisplayName, setCustomDisplayName] = useState<string>(initialCustomDisplayName);
  const [status, setStatus] = useState<string>(initialStatus);
  const [priority, setPriority] = useState<string>(initialPriority);
  const [hasDeadline, setHasDeadline] = useState<boolean>(!!initialDeadlineDate);
  const [deadlineDate, setDeadlineDate] = useState<string>(initialDeadlineDate);
  const [deadlineTime, setDeadlineTime] = useState<string>(initialDeadlineTime || '18:00');
  const [category, setCategory] = useState<string>(initialCategory);
  const [selectedWorkType, setSelectedWorkType] = useState<string>(initialWorkType);
  const [notes, setNotes] = useState<string>(initialNotes);

  if (!isOpen) return null;

  const handleDesignerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'unassigned') {
      setDesignerId('');
      setDesignerName('Unassigned');
    } else if (val === 'custom') {
      setDesignerId('custom');
      // Keep existing name or let user edit
    } else {
      const match = designers.find((d) => d.id === val || d.name === val);
      if (match) {
        setDesignerId(match.id);
        setDesignerName(match.name);
      } else {
        setDesignerId(val);
        setDesignerName(val);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate descriptive activity logs
    const changes: string[] = [];
    if (status !== initialStatus) {
      changes.push(`Status changed from ${initialStatus} → ${status}`);
    }
    if (designerName !== initialDesignerName) {
      changes.push(`Designer changed from ${initialDesignerName || 'Unassigned'} → ${designerName}`);
    }
    if (customDisplayName !== initialCustomDisplayName) {
      changes.push(`Display name updated to "${customDisplayName}"`);
    }
    if (deadlineDate !== initialDeadlineDate) {
      changes.push(`Deadline updated to ${deadlineDate || 'No Deadline'}`);
    }
    if (priority !== initialPriority) {
      changes.push(`Priority changed to ${priority}`);
    }

    const historyLog = changes.length > 0 ? changes.join(' · ') : `Work details updated`;

    onSave({
      workId,
      workType,
      assignedDesignerId: designerId,
      assignedDesignerName: designerName,
      customDisplayName: customDisplayName.trim() || undefined,
      status,
      priority,
      deadlineDate: hasDeadline ? deadlineDate : undefined,
      deadlineTime: hasDeadline ? deadlineTime : undefined,
      hasDeadline,
      category,
      projectType: selectedWorkType,
      notes: notes.trim() || undefined,
      completedAt: status === 'Completed' && initialStatus !== 'Completed' ? formatSystemTimestamp() : undefined,
      historyLog,
    });

    onClose();
  };

  return (
    <div
      id="modal-edit-work-item"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Edit Work Record</h2>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                {title} {clientName ? `· ${clientName}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {/* Status Quick Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Work Status
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {[
                { label: 'New', color: 'bg-zinc-100 text-zinc-700' },
                { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Waiting for Client', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { label: 'Revision', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { label: 'Ready', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200' },
              ].map((st) => (
                <button
                  key={st.label}
                  type="button"
                  onClick={() => setStatus(st.label)}
                  className={`rounded-lg py-1.5 px-2 text-center font-bold border transition-all text-[11px] ${
                    status === st.label
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                      : `${st.color} border-zinc-200/80 hover:border-zinc-300`
                  }`}
                >
                  {st.label === 'Completed' && status === 'Completed' ? '✓ Completed' : st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Designer Assignment & Custom Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Assigned Designer
              </label>
              <select
                value={designerId || (designerName ? 'custom' : 'unassigned')}
                onChange={handleDesignerSelect}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-orange-500"
              >
                <option value="unassigned">Unassigned</option>
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.type})
                  </option>
                ))}
                <option value="custom">Custom / External Designer...</option>
              </select>
              {designerId === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter designer full name"
                  value={designerName}
                  onChange={(e) => setDesignerName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-orange-500"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Custom Display Name (This Work Only)
              </label>
              <input
                type="text"
                placeholder="e.g. Aryan Studio"
                value={customDisplayName}
                onChange={(e) => setCustomDisplayName(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                Shown on client portal and invoices.
              </span>
            </div>
          </div>

          {/* Deadline & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                  Deadline Schedule
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDeadline}
                    onChange={(e) => setHasDeadline(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Has Deadline</span>
                </label>
              </div>

              {hasDeadline ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required={hasDeadline}
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-mono font-bold text-zinc-800 outline-none focus:border-orange-500"
                  />
                  <input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="w-24 rounded-xl border border-zinc-300 bg-white px-2 py-2 text-xs font-mono font-bold text-zinc-800 outline-none focus:border-orange-500"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 p-2.5 text-center text-zinc-400 text-xs">
                  No deadline set (excluded from urgent alarms)
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-orange-500"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent 🔥</option>
                <option value="Client Critical">Client Critical ⚡</option>
                <option value="VIP">VIP</option>
                {priorities.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Work Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Work Type
              </label>
              <input
                type="text"
                value={selectedWorkType}
                onChange={(e) => setSelectedWorkType(e.target.value)}
                placeholder="e.g. Poster, Motion, Branding, Logo"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Design Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Social Media Campaign, Print Media"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
              Internal Admin Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private notes regarding revisions, instructions, or scope..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-orange-500"
            />
          </div>

          {/* Shortcut to Edit Designer Payment */}
          {onOpenEditPayment && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-orange-900 block">Designer Payment &amp; Fee</span>
                <span className="text-[11px] text-orange-700">
                  Manage assigned designer earnings, disbursements and payment records.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditPayment();
                }}
                className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 text-xs font-bold shadow-2xs flex items-center gap-1 shrink-0"
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Edit Payment</span>
              </button>
            </div>
          )}

          {/* Footer actions */}
          <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-edit-work-item"
              className="rounded-xl bg-zinc-900 hover:bg-black text-white px-5 py-2 text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
