import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Search,
  Filter,
  Bell,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Trash2,
  Pencil,
  ExternalLink,
  Check,
  RotateCcw,
} from 'lucide-react';
import { DeadlineItem, Client, ActiveTab } from '../../types';
import {
  evaluateDeadline,
  sortEvaluatedDeadlines,
  EvaluatedDeadline,
} from '../../utils/deadlineUtils';

interface DeadlinesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  deadlines: DeadlineItem[];
  clients?: Client[];
  onAddDeadline: (deadline: DeadlineItem) => void;
  onUpdateDeadline: (deadline: DeadlineItem) => void;
  onDeleteDeadline: (id: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DeadlinesManagerModal: React.FC<DeadlinesManagerModalProps> = ({
  isOpen,
  onClose,
  deadlines,
  clients = [],
  onAddDeadline,
  onUpdateDeadline,
  onDeleteDeadline,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<
    'all' | 'overdue' | 'urgent' | 'approaching' | 'normal' | 'completed'
  >('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<DeadlineItem | null>(null);

  // Live timer ticker
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<DeadlineItem['type']>('order');
  const [formClientName, setFormClientName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('17:00');
  const [formPriority, setFormPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('Gizmo Studio');

  const resetForm = () => {
    setFormTitle('');
    setFormType('order');
    setFormClientName('');
    const today = new Date().toISOString().split('T')[0];
    setFormDate(today);
    setFormTime('17:00');
    setFormPriority('Normal');
    setFormDescription('');
    setFormAssignedTo('Gizmo Studio');
    setEditingDeadline(null);
    setIsFormOpen(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (d: DeadlineItem) => {
    setEditingDeadline(d);
    setFormTitle(d.title);
    setFormType(d.type);
    setFormClientName(d.clientName || '');
    setFormDate(d.deadlineDate);
    setFormTime(d.deadlineTime || '17:00');
    setFormPriority(d.priority || 'Normal');
    setFormDescription(d.description || '');
    setFormAssignedTo(d.assignedTo || 'Gizmo Studio');
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    if (editingDeadline) {
      const updated: DeadlineItem = {
        ...editingDeadline,
        title: formTitle.trim(),
        type: formType,
        clientName: formClientName.trim() || undefined,
        deadlineDate: formDate,
        deadlineTime: formTime,
        priority: formPriority,
        description: formDescription.trim() || undefined,
        assignedTo: formAssignedTo.trim() || undefined,
      };
      onUpdateDeadline(updated);
    } else {
      const newDl: DeadlineItem = {
        id: `dl-${Date.now()}`,
        title: formTitle.trim(),
        type: formType,
        clientName: formClientName.trim() || undefined,
        deadlineDate: formDate,
        deadlineTime: formTime,
        priority: formPriority,
        description: formDescription.trim() || undefined,
        assignedTo: formAssignedTo.trim() || undefined,
        isCompleted: false,
      };
      onAddDeadline(newDl);
    }

    resetForm();
  };

  const handleToggleComplete = (deadline: DeadlineItem) => {
    onUpdateDeadline({
      ...deadline,
      isCompleted: !deadline.isCompleted,
    });
  };

  if (!isOpen) return null;

  // Evaluate & Filter
  const evaluatedAll: EvaluatedDeadline[] = deadlines.map((d) =>
    evaluateDeadline(d, currentTime)
  );

  const sortedList = sortEvaluatedDeadlines(evaluatedAll);

  const filtered = sortedList.filter((item) => {
    const d = item.deadline;
    // Search matching
    const searchMatch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.clientName && d.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Filter tabs
    if (filterTab === 'completed') return d.isCompleted;
    if (d.isCompleted) return false; // Other tabs hide completed

    if (filterTab === 'overdue') return item.urgency === 'OVERDUE';
    if (filterTab === 'urgent') return item.urgency === 'URGENT' || item.urgency === 'DUE_NOW';
    if (filterTab === 'approaching') return item.urgency === 'APPROACHING';
    if (filterTab === 'normal') return item.urgency === 'NORMAL';
    return true; // 'all'
  });

  const overdueCount = evaluatedAll.filter((i) => !i.deadline.isCompleted && i.urgency === 'OVERDUE').length;
  const urgentCount = evaluatedAll.filter(
    (i) => !i.deadline.isCompleted && (i.urgency === 'URGENT' || i.urgency === 'DUE_NOW')
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-black shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EE] text-[#FF5738] border border-[#FFB2A1] flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl tracking-tight">
                  Studio Operations Deadlines
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-bold">
                  {deadlines.length} Total
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Live countdown schedule for all client orders, print jobs, and design projects.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFormOpen && (
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#FF5738]" />
                <span>+ Add Deadline</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INLINE FORM: CREATE / EDIT */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmitForm}
            className="p-5 bg-zinc-50 border-b border-zinc-200 animate-in slide-in-from-top-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-sm text-black flex items-center gap-2">
                <span>{editingDeadline ? 'Edit Deadline' : 'Create New Studio Deadline'}</span>
                <span className="text-[10px] font-mono uppercase bg-[#FFF1EE] text-[#FF5738] px-2 py-0.5 rounded border border-[#FFB2A1]">
                  Admin Module
                </span>
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-zinc-500 hover:text-black font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-zinc-700 mb-1">
                  Title / Order Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order #GZ-1035 — Acrylic Sign Board"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Work Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:border-black font-medium"
                >
                  <option value="order">Order / Print Run</option>
                  <option value="project">Client Project</option>
                  <option value="local-work">Local Work</option>
                  <option value="invoice">Invoice Settlement</option>
                  <option value="task">Internal Task</option>
                  <option value="custom">Custom Milestone</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. DARUL HASANIYYAH SNEC"
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  list="clients-datalist"
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:border-black font-medium"
                />
                <datalist id="clients-datalist">
                  {clients.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Deadline Date (Exact) *
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:border-black font-medium font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Deadline Time (Exact) *
                </label>
                <input
                  type="time"
                  required
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:border-black font-medium font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:border-black font-medium"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent (Alarm Highlight)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Assigned Team</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Designer / Print Specialist"
                  value={formAssignedTo}
                  onChange={(e) => setFormAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:border-black font-medium"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-bold text-zinc-700 mb-1">
                  Scope &amp; Deliverable Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approved proof delivered to press; pickup at 4:30 PM"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:border-black font-medium"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-black border border-zinc-300 rounded-lg bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-[#FF5738] hover:bg-[#e0482c] text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingDeadline ? 'Save Changes' : 'Create Deadline'}</span>
              </button>
            </div>
          </form>
        )}

        {/* SEARCH & FILTER TABS */}
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, client, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-black font-medium"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === 'all'
                  ? 'bg-black text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              All ({deadlines.filter((d) => !d.isCompleted).length})
            </button>
            <button
              onClick={() => setFilterTab('overdue')}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                filterTab === 'overdue'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Overdue ({overdueCount})
            </button>
            <button
              onClick={() => setFilterTab('urgent')}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                filterTab === 'urgent'
                  ? 'bg-[#FF5738] text-white'
                  : 'text-[#FF5738] hover:bg-[#FFF1EE]'
              }`}
            >
              Urgent ({urgentCount})
            </button>
            <button
              onClick={() => setFilterTab('approaching')}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === 'approaching'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Approaching
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Completed ({deadlines.filter((d) => d.isCompleted).length})
            </button>
          </div>
        </div>

        {/* LIST OF DEADLINES */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-2 sm:p-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-zinc-600">No deadlines match your filter</p>
              <p className="text-xs text-zinc-400 mt-1">
                Try clearing your search or change the active tab.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const { deadline, urgency, relativeStatus, countdownText, exactDateTimeText } = item;
              const isOverdue = urgency === 'OVERDUE' && !deadline.isCompleted;
              const isCritical =
                (urgency === 'URGENT' || urgency === 'DUE_NOW') && !deadline.isCompleted;

              return (
                <div
                  key={deadline.id}
                  className={`p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    deadline.isCompleted
                      ? 'bg-zinc-50 opacity-60'
                      : isOverdue
                      ? 'bg-rose-50/40 border border-rose-100'
                      : isCritical
                      ? 'bg-[#FFF1EE]/40 border border-[#FFB2A1]/50'
                      : 'hover:bg-zinc-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(deadline)}
                      title={deadline.isCompleted ? 'Mark as active' : 'Mark as completed'}
                      className={`mt-1 w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ${
                        deadline.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-zinc-300 hover:border-black bg-white'
                      }`}
                    >
                      {deadline.isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold text-sm ${
                            deadline.isCompleted ? 'line-through text-zinc-400' : 'text-zinc-950'
                          }`}
                        >
                          {deadline.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
                          {deadline.type}
                        </span>
                        {deadline.clientName && (
                          <span className="text-xs text-zinc-500 font-medium">
                            · {deadline.clientName}
                          </span>
                        )}
                      </div>

                      {/* Exact Date & Time */}
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600 flex-wrap">
                        <span className="text-zinc-400 font-medium">Due:</span>
                        <span className="font-mono font-bold text-zinc-800">
                          {exactDateTimeText}
                        </span>
                        {deadline.assignedTo && (
                          <span className="text-zinc-400 text-[11px]">
                            • Assigned: {deadline.assignedTo}
                          </span>
                        )}
                      </div>

                      {deadline.description && (
                        <p className="mt-1 text-xs text-zinc-500 line-clamp-1">
                          {deadline.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Relative Badge & Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pl-8 sm:pl-0">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                        deadline.isCompleted
                          ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isCritical
                          ? 'bg-[#FFF1EE] text-[#FF5738] border-[#FFB2A1]'
                          : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                      }`}
                    >
                      {deadline.isCompleted
                        ? 'Completed'
                        : isOverdue
                        ? '• Overdue'
                        : `• ${relativeStatus || countdownText}`}
                    </span>

                    {/* Quick navigation link */}
                    {deadline.type === 'project' && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateTab('projects');
                        }}
                        title="View in Projects"
                        className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    {(deadline.type === 'local-work' || deadline.type === 'order') && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateTab('local-works');
                        }}
                        title="View in Local Works"
                        className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    {deadline.type === 'invoice' && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateTab('invoice');
                        }}
                        title="View in Invoices"
                        className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => handleStartEdit(deadline)}
                      title="Edit Deadline"
                      className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteDeadline(deadline.id)}
                      title="Delete Deadline"
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Current Local Time: <strong className="font-mono text-black">{currentTime.toLocaleTimeString()}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
