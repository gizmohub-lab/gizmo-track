import React, { useState, useMemo } from 'react';
import {
  X,
  DollarSign,
  User,
  Phone,
  Mail,
  MessageCircle,
  Briefcase,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  Receipt,
  Calendar,
  Filter,
  Edit2,
  Trash2,
  Check,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  History,
  FolderKanban,
  MoreVertical,
  Flag,
  Share2,
} from 'lucide-react';
import { Project, CustomDesigner, DesignerPaymentRecord } from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { DesignerWorkloadItem } from '../../../utils/projectUtils';
import { EditDesignerPaymentModal } from './EditDesignerPaymentModal';
import { EditWorkItemModal } from './EditWorkItemModal';

interface DesignerWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  designerItem: DesignerWorkloadItem | null;
  allProjects: Project[];
  allLocalWorks?: any[];
  allDesigners: CustomDesigner[];
  onOpenPayModal: (designerId: string, workId?: string) => void;
  onOpenProjectWorkspace?: (projectId: string) => void;
  onUpdateProject?: (project: Project) => void;
  onUpdateLocalWork?: (work: any) => void;
  onRecordDesignerPayment?: (payment: any) => void;
  onEditDesignerProfile?: (designer: CustomDesigner) => void;
}

export const DesignerWorkspaceModal: React.FC<DesignerWorkspaceModalProps> = ({
  isOpen,
  onClose,
  designerItem,
  allProjects,
  allLocalWorks = [],
  allDesigners,
  onOpenPayModal,
  onOpenProjectWorkspace,
  onUpdateProject,
  onUpdateLocalWork,
  onRecordDesignerPayment,
  onEditDesignerProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'workload' | 'projects' | 'local-works' | 'payments' | 'activity'>('workload');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Project' | 'Local Work'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item for Edit Work Modal
  const [editingWorkItem, setEditingWorkItem] = useState<{
    id: string;
    type: 'Project' | 'Local Work' | 'Custom';
    title: string;
    clientName?: string;
    designerId?: string;
    designerName?: string;
    customDisplayName?: string;
    status: string;
    priority?: string;
    deadlineDate?: string;
    deadlineTime?: string;
    category?: string;
    workType?: string;
    notes?: string;
  } | null>(null);

  // Selected item for Edit Payment Modal
  const [editingPaymentItem, setEditingPaymentItem] = useState<{
    workId: string;
    workType: 'Project' | 'Local Work' | 'Custom';
    workTitle: string;
    clientName?: string;
    totalWorkAmount?: number;
    designerId: string;
    designerName: string;
    initialFee: number;
    initialPaid: number;
    payments?: DesignerPaymentRecord[];
  } | null>(null);

  if (!isOpen || !designerItem) return null;

  // Filtered breakdown items
  const filteredBreakdown = designerItem.itemsBreakdown.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'Pending') {
        if (item.status === 'Completed' || item.status === 'Delivered') return false;
      } else if (statusFilter === 'Completed') {
        if (item.status !== 'Completed' && item.status !== 'Delivered') return false;
      } else if (statusFilter === 'In Progress') {
        if (item.status !== 'In Progress') return false;
      } else if (statusFilter === 'Revision') {
        if (item.status !== 'Revision') return false;
      } else if (statusFilter === 'Payment Pending') {
        if (item.designerPending <= 0) return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchClient = item.clientName.toLowerCase().includes(q);
      const matchCode = (item.code || '').toLowerCase().includes(q);
      if (!matchTitle && !matchClient && !matchCode) return false;
    }
    return true;
  });

  // Calculate completion percentage for progress bar
  const totalWorksCount = designerItem.itemsBreakdown.length;
  const completedWorksCount = designerItem.completedWorksCount;
  const progressPercent = totalWorksCount > 0 ? Math.round((completedWorksCount / totalWorksCount) * 100) : 100;

  // Handle Quick Status toggle
  const handleQuickStatusChange = (item: any, newStatus: string) => {
    if (item.type === 'Project' && onUpdateProject) {
      const proj = allProjects.find((p) => p.id === item.id);
      if (proj) {
        const isNowCompleted = newStatus === 'Completed';
        const updated: Project = {
          ...proj,
          status: newStatus,
          history: [
            ...(proj.history || []),
            {
              id: `hist-${Date.now()}`,
              timestamp: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              action: `Status changed to "${newStatus}" by Admin`,
            },
          ],
        };
        onUpdateProject(updated);
      }
    } else if (item.type === 'Local Work' && onUpdateLocalWork) {
      const lw = allLocalWorks.find((w) => w.id === item.id);
      if (lw) {
        onUpdateLocalWork({
          ...lw,
          status: newStatus,
        });
      }
    }
  };

  // Handle Edit Work Save
  const handleSaveWorkEdit = (payload: any) => {
    if (payload.workType === 'Project' && onUpdateProject) {
      const proj = allProjects.find((p) => p.id === payload.workId);
      if (proj) {
        const updated: Project = {
          ...proj,
          assignedDesignerId: payload.assignedDesignerId,
          assignedDesignerName: payload.assignedDesignerName,
          customDisplayName: payload.customDisplayName,
          status: payload.status,
          priority: payload.priority || proj.priority,
          hasDeadline: payload.hasDeadline,
          deadlineDate: payload.deadlineDate,
          deadlineTime: payload.deadlineTime,
          dueDate: payload.deadlineDate || proj.dueDate,
          category: payload.category || proj.category,
          projectType: payload.projectType || proj.projectType,
          internalNotes: payload.notes !== undefined ? payload.notes : proj.internalNotes,
          history: [
            ...(proj.history || []),
            {
              id: `hist-${Date.now()}`,
              timestamp: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              action: payload.historyLog || 'Project details updated',
            },
          ],
        };
        onUpdateProject(updated);
      }
    } else if (payload.workType === 'Local Work' && onUpdateLocalWork) {
      const lw = allLocalWorks.find((w) => w.id === payload.workId);
      if (lw) {
        onUpdateLocalWork({
          ...lw,
          assignedTo: payload.assignedDesignerName,
          designer: payload.assignedDesignerName,
          designerId: payload.assignedDesignerId,
          customDisplayName: payload.customDisplayName,
          status: payload.status,
          priority: payload.priority,
          deadlineDate: payload.deadlineDate,
          deadlineTime: payload.deadlineTime,
          category: payload.category,
          workType: payload.projectType,
          notes: payload.notes,
        });
      }
    }
  };

  // Handle Edit Payment Save
  const handleSavePaymentEdit = (payload: any) => {
    if (payload.workType === 'Project' && onUpdateProject) {
      const proj = allProjects.find((p) => p.id === payload.workId);
      if (proj) {
        const updated: Project = {
          ...proj,
          designerFee: payload.designerFee,
          designerAmountPaid: payload.designerAmountPaid,
          designerAmountPending: payload.designerAmountPending,
          designerPaymentStatus: payload.designerPaymentStatus,
          designerPaymentStructure: payload.designerPaymentStructure,
          designerPercentage: payload.designerPercentage,
          designerPayments: payload.payments,
          history: [
            ...(proj.history || []),
            {
              id: `hist-${Date.now()}`,
              timestamp: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              action: payload.historyNote || `Designer payment updated (Fee: ₹${payload.designerFee}, Paid: ₹${payload.designerAmountPaid})`,
            },
          ],
        };
        onUpdateProject(updated);
      }
    } else if (payload.workType === 'Local Work' && onUpdateLocalWork) {
      const lw = allLocalWorks.find((w) => w.id === payload.workId);
      if (lw) {
        onUpdateLocalWork({
          ...lw,
          designerFee: payload.designerFee,
          designerPaid: payload.designerAmountPaid,
          designerPayments: payload.payments,
        });
      }
    }
  };

  return (
    <div
      id="designer-workspace-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="designer-workspace-modal-container"
        className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 bg-zinc-900 px-6 py-5 text-white gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xl font-black">
              {designerItem.designerName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  {designerItem.designerName}
                </h2>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300 border border-zinc-700">
                  {designerItem.type}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                    designerItem.paymentStatus === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : designerItem.paymentStatus === 'Partially Paid'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {designerItem.paymentStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3.5 mt-1.5 text-xs text-zinc-400">
                {designerItem.roleSpecialization && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{designerItem.roleSpecialization}</span>
                  </span>
                )}
                {designerItem.phone && (
                  <a
                    href={`tel:${designerItem.phone}`}
                    className="hover:text-zinc-200 flex items-center gap-1 text-zinc-300"
                  >
                    <Phone className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{designerItem.phone}</span>
                  </a>
                )}
                {designerItem.whatsapp && (
                  <a
                    href={`https://wa.me/${designerItem.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-workspace-pay-designer"
              onClick={() => onOpenPayModal(designerItem.designerId)}
              className="rounded-xl bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <DollarSign className="h-4 w-4" />
              <span>+ Pay Designer</span>
            </button>

            {onEditDesignerProfile && (
              <button
                type="button"
                onClick={() => {
                  const match = allDesigners.find((d) => d.id === designerItem.designerId);
                  if (match) onEditDesignerProfile(match);
                }}
                className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 text-xs font-semibold transition-colors"
                title="Edit Designer Profile"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 1. Summary Cards Row with Drill-Down Clicks */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 p-5 bg-zinc-50/70 border-b border-zinc-200/80">
          <div
            onClick={() => setActiveTab('payments')}
            className="rounded-xl bg-white border border-zinc-200/80 p-3 shadow-2xs cursor-pointer hover:border-zinc-300 transition-all group"
          >
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total Designer Fee
            </span>
            <div className="text-base font-extrabold font-mono text-zinc-900 mt-0.5 group-hover:text-orange-600 transition-colors">
              {formatINR(designerItem.totalEarnings)}
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Assigned earnings</span>
          </div>

          <div
            onClick={() => setActiveTab('payments')}
            className="rounded-xl bg-white border border-emerald-200/80 bg-emerald-50/20 p-3 shadow-2xs cursor-pointer hover:border-emerald-300 transition-all"
          >
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Paid to Designer
            </span>
            <div className="text-base font-extrabold font-mono text-emerald-700 mt-0.5">
              {formatINR(designerItem.amountPaid)}
            </div>
            <span className="text-[10px] text-emerald-600/70 block mt-0.5">Disbursed funds</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('workload');
              setStatusFilter('Payment Pending');
            }}
            className="rounded-xl bg-white border border-rose-200/80 bg-rose-50/20 p-3 shadow-2xs cursor-pointer hover:border-rose-300 transition-all group"
          >
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
              Pending Payout
            </span>
            <div className="text-base font-extrabold font-mono text-rose-700 mt-0.5 group-hover:scale-105 transition-transform origin-left">
              {formatINR(designerItem.amountPending)}
            </div>
            <span className="text-[10px] text-rose-600/70 block mt-0.5">Click to filter unpaid</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('projects');
              setTypeFilter('Project');
            }}
            className="rounded-xl bg-white border border-zinc-200/80 p-3 shadow-2xs cursor-pointer hover:border-zinc-300 transition-all"
          >
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Projects
            </span>
            <div className="text-base font-extrabold text-zinc-900 mt-0.5">
              {designerItem.projectsCount}
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Assigned client projects</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('local-works');
              setTypeFilter('Local Work');
            }}
            className="rounded-xl bg-white border border-zinc-200/80 p-3 shadow-2xs cursor-pointer hover:border-zinc-300 transition-all"
          >
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Local Works
            </span>
            <div className="text-base font-extrabold text-zinc-900 mt-0.5">
              {designerItem.localWorksCount}
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Assigned walk-in works</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('workload');
              setStatusFilter('Pending');
            }}
            className="rounded-xl bg-white border border-zinc-200/80 p-3 shadow-2xs cursor-pointer hover:border-zinc-300 transition-all"
          >
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              Pending Deliverables
            </span>
            <div className="text-base font-extrabold text-blue-700 mt-0.5">
              {designerItem.pendingWorksCount}
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">{completedWorksCount} completed</span>
          </div>
        </div>

        {/* 2. Interactive Workload & Progress Breakdown Bar */}
        <div className="px-6 py-3 bg-zinc-100/60 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider shrink-0">
              Workload Progress:
            </span>
            <div className="flex-1 max-w-xs h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-orange-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold font-mono text-zinc-900">{progressPercent}%</span>
          </div>

          {/* Interactive Breakdown Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              Total: {totalWorksCount}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Completed')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                statusFilter === 'Completed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Completed: {completedWorksCount}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('In Progress')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                statusFilter === 'In Progress'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              In Progress: {designerItem.inProgressCount || 0}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Revision')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                statusFilter === 'Revision'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              Revision: {designerItem.revisionsCount || 0}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Payment Pending')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                statusFilter === 'Payment Pending'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              Payment Pending: {designerItem.itemsBreakdown.filter((i) => i.designerPending > 0).length}
            </button>
          </div>
        </div>

        {/* 3. Sub Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-zinc-100 bg-white">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('workload');
                setTypeFilter('all');
              }}
              className={`rounded-lg px-3.5 py-1.5 font-bold transition-colors ${
                activeTab === 'workload'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              All Assigned Works ({designerItem.itemsBreakdown.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('projects');
                setTypeFilter('Project');
              }}
              className={`rounded-lg px-3.5 py-1.5 font-bold transition-colors ${
                activeTab === 'projects'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Projects ({designerItem.projectsCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('local-works');
                setTypeFilter('Local Work');
              }}
              className={`rounded-lg px-3.5 py-1.5 font-bold transition-colors ${
                activeTab === 'local-works'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Local Works ({designerItem.localWorksCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`rounded-lg px-3.5 py-1.5 font-bold transition-colors ${
                activeTab === 'payments'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Payments &amp; Ledger
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search works..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-zinc-50 pl-3 pr-7 py-1 text-xs outline-none focus:border-zinc-400 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Main Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'payments' ? (
            /* PAYMENTS & LEDGER VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                    Designer Compensation &amp; Financial Ledger
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Separate designer expenses vs client invoices. Click Edit Payment on any work item to adjust terms.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenPayModal(designerItem.designerId)}
                  className="rounded-xl bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-bold shadow-2xs flex items-center gap-1.5"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>+ Record Disbursement</span>
                </button>
              </div>

              {/* Table of Works with Direct Edit Payment Trigger */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                      <th className="py-2.5 px-3.5">Work / Project</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Client Total</th>
                      <th className="py-2.5 px-3 text-right">Designer Fee</th>
                      <th className="py-2.5 px-3 text-right">Paid</th>
                      <th className="py-2.5 px-3 text-right">Pending</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Payment Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                    {designerItem.itemsBreakdown.map((item) => (
                      <tr key={`${item.type}-${item.id}`} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-zinc-900 block line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-zinc-400">Client: {item.clientName}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-zinc-500">
                          {formatINR(item.totalAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                          {formatINR(item.designerFee)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                          {formatINR(item.designerPaid)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                          {formatINR(item.designerPending)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              item.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.paymentStatus === 'Partially Paid'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {item.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPaymentItem({
                                  workId: item.id,
                                  workType: item.type as any,
                                  workTitle: item.title,
                                  clientName: item.clientName,
                                  totalWorkAmount: item.totalAmount,
                                  designerId: designerItem.designerId,
                                  designerName: designerItem.designerName,
                                  initialFee: item.designerFee,
                                  initialPaid: item.designerPaid,
                                  payments: item.designerPayments || [],
                                });
                              }}
                              className="rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 px-2.5 py-1 text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit Payment</span>
                            </button>

                            {item.designerPending > 0 && (
                              <button
                                type="button"
                                onClick={() => onOpenPayModal(designerItem.designerId, item.id)}
                                className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition-colors"
                              >
                                Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ALL ASSIGNED WORKS / PROJECTS / LOCAL WORKS TABLE */
            <div className="space-y-3">
              {filteredBreakdown.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">
                  No assigned work items match the current filter.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                        <th className="py-2.5 px-3.5">Work / Title</th>
                        <th className="py-2.5 px-3">Source</th>
                        <th className="py-2.5 px-3">Client</th>
                        <th className="py-2.5 px-3">Deadline</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Designer Fee</th>
                        <th className="py-2.5 px-3 text-right">Paid / Pending</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                      {filteredBreakdown.map((item) => (
                        <tr key={`${item.type}-${item.id}`} className="hover:bg-zinc-50/70 transition-colors group">
                          {/* Title & Type */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title={item.status === 'Completed' ? 'Mark Incomplete' : 'Quick Mark Complete'}
                                onClick={() =>
                                  handleQuickStatusChange(
                                    item,
                                    item.status === 'Completed' ? 'In Progress' : 'Completed'
                                  )
                                }
                                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0 ${
                                  item.status === 'Completed'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent hover:text-emerald-600'
                                }`}
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </button>

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-zinc-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                    {item.title}
                                  </span>
                                  {item.code && (
                                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                                      {item.code}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-400 block">
                                  {item.category || item.workType || 'Design Work'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Source */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                item.type === 'Project'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>

                          {/* Client */}
                          <td className="py-3 px-3 text-zinc-700 font-semibold">
                            {item.clientName}
                          </td>

                          {/* Deadline */}
                          <td className="py-3 px-3">
                            {item.deadline ? (
                              <div>
                                <span className="text-zinc-800 font-mono text-[11px] block">
                                  {item.deadline}
                                </span>
                                {item.deadlineTime && (
                                  <span className="text-[10px] text-zinc-400 block">
                                    {item.deadlineTime}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-400">No deadline</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                item.status === 'Completed' || item.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.status === 'In Progress'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : item.status === 'Revision'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : item.status === 'Waiting for Client'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          {/* Fee */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                            {formatINR(item.designerFee)}
                          </td>

                          {/* Paid / Pending */}
                          <td className="py-3 px-3 text-right">
                            <span className="font-mono font-bold text-emerald-600 block">
                              {formatINR(item.designerPaid)}
                            </span>
                            {item.designerPending > 0 ? (
                              <span className="text-[10px] font-mono text-rose-600 block">
                                Pending: {formatINR(item.designerPending)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 block">Paid</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit Work Trigger */}
                              <button
                                type="button"
                                title="Edit Work Details"
                                onClick={() => {
                                  setEditingWorkItem({
                                    id: item.id,
                                    type: item.type as any,
                                    title: item.title,
                                    clientName: item.clientName,
                                    designerId: designerItem.designerId,
                                    designerName: designerItem.designerName,
                                    customDisplayName: item.customDisplayName,
                                    status: item.status,
                                    priority: item.priority || 'Normal',
                                    deadlineDate: item.deadline,
                                    deadlineTime: item.deadlineTime,
                                    category: item.category,
                                    workType: item.workType,
                                  });
                                }}
                                className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 px-2.5 py-1 text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <Edit2 className="h-3 w-3 text-zinc-500" />
                                <span>Edit</span>
                              </button>

                              {/* Edit Payment Trigger */}
                              <button
                                type="button"
                                title="Edit Designer Payment"
                                onClick={() => {
                                  setEditingPaymentItem({
                                    workId: item.id,
                                    workType: item.type as any,
                                    workTitle: item.title,
                                    clientName: item.clientName,
                                    totalWorkAmount: item.totalAmount,
                                    designerId: designerItem.designerId,
                                    designerName: designerItem.designerName,
                                    initialFee: item.designerFee,
                                    initialPaid: item.designerPaid,
                                    payments: item.designerPayments || [],
                                  });
                                }}
                                className="rounded-lg border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-800 px-2.5 py-1 text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <DollarSign className="h-3 w-3 text-orange-600" />
                                <span>Pay</span>
                              </button>

                              {/* Open Project Workspace if Project */}
                              {item.type === 'Project' && onOpenProjectWorkspace && (
                                <button
                                  type="button"
                                  title="Open Project Workspace"
                                  onClick={() => {
                                    onClose();
                                    onOpenProjectWorkspace(item.id);
                                  }}
                                  className="rounded-lg bg-zinc-900 hover:bg-black text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition-colors"
                                >
                                  Open
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-6 py-3.5 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <div>
            Showing {filteredBreakdown.length} assigned records for {designerItem.designerName}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            Close Workspace
          </button>
        </div>
      </div>

      {/* Sub-Modals */}
      {/* 1. Edit Work Modal */}
      {editingWorkItem && (
        <EditWorkItemModal
          isOpen={!!editingWorkItem}
          onClose={() => setEditingWorkItem(null)}
          workId={editingWorkItem.id}
          workType={editingWorkItem.type}
          title={editingWorkItem.title}
          clientName={editingWorkItem.clientName}
          initialDesignerId={editingWorkItem.designerId}
          initialDesignerName={editingWorkItem.designerName}
          initialCustomDisplayName={editingWorkItem.customDisplayName}
          initialStatus={editingWorkItem.status}
          initialPriority={editingWorkItem.priority}
          initialDeadlineDate={editingWorkItem.deadlineDate}
          initialDeadlineTime={editingWorkItem.deadlineTime}
          initialCategory={editingWorkItem.category}
          initialWorkType={editingWorkItem.workType}
          designers={allDesigners}
          onSave={handleSaveWorkEdit}
          onOpenEditPayment={() => {
            const match = designerItem.itemsBreakdown.find((i) => i.id === editingWorkItem.id);
            if (match) {
              setEditingPaymentItem({
                workId: match.id,
                workType: match.type as any,
                workTitle: match.title,
                clientName: match.clientName,
                totalWorkAmount: match.totalAmount,
                designerId: designerItem.designerId,
                designerName: designerItem.designerName,
                initialFee: match.designerFee,
                initialPaid: match.designerPaid,
                payments: match.designerPayments || [],
              });
            }
          }}
        />
      )}

      {/* 2. Edit Designer Payment Modal */}
      {editingPaymentItem && (
        <EditDesignerPaymentModal
          isOpen={!!editingPaymentItem}
          onClose={() => setEditingPaymentItem(null)}
          workId={editingPaymentItem.workId}
          workType={editingPaymentItem.workType}
          workTitle={editingPaymentItem.workTitle}
          clientName={editingPaymentItem.clientName}
          totalWorkAmount={editingPaymentItem.totalWorkAmount}
          designerId={editingPaymentItem.designerId}
          designerName={editingPaymentItem.designerName}
          initialFee={editingPaymentItem.initialFee}
          initialPaid={editingPaymentItem.initialPaid}
          payments={editingPaymentItem.payments}
          onSave={handleSavePaymentEdit}
        />
      )}
    </div>
  );
};
