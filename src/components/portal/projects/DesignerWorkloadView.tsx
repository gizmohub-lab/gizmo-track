import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  DollarSign,
  User,
  Phone,
  Mail,
  MessageCircle,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  MoreVertical,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { Project, CustomDesigner } from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { DesignerWorkloadItem } from '../../../utils/projectUtils';

interface DesignerWorkloadViewProps {
  designerItems: DesignerWorkloadItem[];
  allProjects: Project[];
  allLocalWorks?: any[];
  allDesigners: CustomDesigner[];
  onBackToOverview: () => void;
  onOpenDesignerWorkspace: (item: DesignerWorkloadItem) => void;
  onOpenPayModal: (designerId: string) => void;
  onOpenDesignerModal?: () => void;
}

export const DesignerWorkloadView: React.FC<DesignerWorkloadViewProps> = ({
  designerItems,
  allProjects,
  allLocalWorks = [],
  allDesigners,
  onBackToOverview,
  onOpenDesignerWorkspace,
  onOpenPayModal,
  onOpenDesignerModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Portal Staff' | 'External Designer'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'Paid' | 'Partially Paid' | 'Not Paid'>('all');

  // Compute Overall KPI metrics
  const totals = useMemo(() => {
    let totalEarnings = 0;
    let amountPaid = 0;
    let amountPending = 0;
    let totalProjects = 0;
    let totalPendingWorks = 0;
    let totalCompletedWorks = 0;

    designerItems.forEach((d) => {
      totalEarnings += d.totalEarnings;
      amountPaid += d.amountPaid;
      amountPending += d.amountPending;
      totalProjects += d.projectsCount;
      totalPendingWorks += d.pendingWorksCount;
      totalCompletedWorks += d.completedWorksCount;
    });

    return {
      totalEarnings,
      amountPaid,
      amountPending,
      totalProjects,
      totalPendingWorks,
      totalCompletedWorks,
      totalDesigners: designerItems.length,
      activeDesigners: designerItems.filter((d) => d.projectsCount > 0 || d.localWorksCount > 0).length,
    };
  }, [designerItems]);

  // Filter designers list
  const filteredDesigners = useMemo(() => {
    return designerItems.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (paymentFilter !== 'all' && item.paymentStatus !== paymentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.designerName.toLowerCase().includes(q);
        const matchRole = (item.roleSpecialization || '').toLowerCase().includes(q);
        const matchEmail = (item.email || '').toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchEmail) return false;
      }
      return true;
    });
  }, [designerItems, typeFilter, paymentFilter, searchQuery]);

  return (
    <div id="designer-workload-subview" className="space-y-6">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-1">
            <button
              type="button"
              onClick={onBackToOverview}
              className="hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Projects Control Center</span>
            </button>
            <span>/</span>
            <span className="text-zinc-900 font-bold">Designers Workload &amp; Payments</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Designers Workload &amp; Payments
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitor designer allocations, deliverable milestones, completed works and compensation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenDesignerModal && (
            <button
              type="button"
              id="btn-manage-designers-list"
              onClick={onOpenDesignerModal}
              className="rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-800 shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <User className="h-4 w-4 text-zinc-500" />
              <span>Manage Designers</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToOverview}
            className="rounded-xl bg-zinc-900 hover:bg-black text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects Overview</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Total Designers
          </span>
          <div className="text-xl font-black text-zinc-900 mt-1">
            {totals.totalDesigners}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-0.5">
            {totals.activeDesigners} with active works
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Active Projects
          </span>
          <div className="text-xl font-black text-zinc-900 mt-1">
            {totals.totalProjects}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Across all designers</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Pending Works
          </span>
          <div className="text-xl font-black text-blue-700 mt-1">
            {totals.totalPendingWorks}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-0.5">
            {totals.totalCompletedWorks} completed
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Total Designer Fee
          </span>
          <div className="text-xl font-black font-mono text-zinc-900 mt-1">
            {formatINR(totals.totalEarnings)}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Cost allocation</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Paid to Designers
          </span>
          <div className="text-xl font-black font-mono text-emerald-700 mt-1">
            {formatINR(totals.amountPaid)}
          </div>
          <span className="text-[11px] text-emerald-600 block mt-0.5">Disbursed funds</span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
            Pending Payout
          </span>
          <div className="text-xl font-black font-mono text-rose-700 mt-1">
            {formatINR(totals.amountPending)}
          </div>
          <span className="text-[11px] text-rose-600 block mt-0.5">Payable balance</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            id="input-search-designers-workload"
            placeholder="Search designer by name, role or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 outline-none focus:border-zinc-400 shadow-2xs"
          >
            <option value="all">All Designer Types</option>
            <option value="Portal Staff">Portal Staff</option>
            <option value="External Designer">External Designers</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 outline-none focus:border-zinc-400 shadow-2xs"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Not Paid">Not Paid</option>
          </select>
        </div>
      </div>

      {/* 4. Full Designers Workload Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        {filteredDesigners.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 text-xs">
            No designers match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                  <th className="py-3.5 px-4">Designer</th>
                  <th className="py-3.5 px-3">Type &amp; Role</th>
                  <th className="py-3.5 px-3 text-center">Projects</th>
                  <th className="py-3.5 px-3 text-center">Local Works</th>
                  <th className="py-3.5 px-3">Workload &amp; Progress</th>
                  <th className="py-3.5 px-3 text-right">Designer Fee</th>
                  <th className="py-3.5 px-3 text-right">Paid</th>
                  <th className="py-3.5 px-3 text-right">Pending</th>
                  <th className="py-3.5 px-3 text-center">Payment Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {filteredDesigners.map((item) => {
                  const totalWorks = item.itemsBreakdown.length;
                  const completedWorks = item.completedWorksCount;
                  const pct = totalWorks > 0 ? Math.round((completedWorks / totalWorks) * 100) : 100;

                  return (
                    <tr
                      key={item.designerId}
                      className="hover:bg-zinc-50/70 transition-colors group cursor-pointer"
                      onClick={() => onOpenDesignerWorkspace(item)}
                    >
                      {/* Designer Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 font-bold border border-orange-500/20 shrink-0">
                            {item.designerName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-900 group-hover:text-orange-600 transition-colors text-sm">
                                {item.designerName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                              {item.phone && <span>{item.phone}</span>}
                              {item.whatsapp && (
                                <a
                                  href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-emerald-500 hover:text-emerald-600 font-semibold"
                                >
                                  WA
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Role */}
                      <td className="py-3.5 px-3">
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 border border-zinc-200 block w-fit">
                          {item.type}
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-0.5">
                          {item.roleSpecialization || 'Visual Design'}
                        </span>
                      </td>

                      {/* Projects count */}
                      <td className="py-3.5 px-3 text-center font-bold text-zinc-900">
                        <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs">
                          {item.projectsCount}
                        </span>
                      </td>

                      {/* Local Works count */}
                      <td className="py-3.5 px-3 text-center font-bold text-zinc-900">
                        <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs">
                          {item.localWorksCount}
                        </span>
                      </td>

                      {/* Workload Progress Bar */}
                      <td className="py-3.5 px-3 min-w-[160px]">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                          <span>
                            {item.pendingWorksCount} pending · {completedWorks} done
                          </span>
                          <span className="font-bold text-zinc-800">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pct === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      {/* Designer Total Fee */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-900">
                        {formatINR(item.totalEarnings)}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">
                        {formatINR(item.amountPaid)}
                      </td>

                      {/* Pending */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                        {formatINR(item.amountPending)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            item.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.paymentStatus === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Open Designer Workspace"
                            onClick={() => onOpenDesignerWorkspace(item)}
                            className="rounded-lg bg-zinc-900 hover:bg-black text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Workspace</span>
                          </button>

                          {item.amountPending > 0 && (
                            <button
                              type="button"
                              title="Disburse Payment"
                              onClick={() => onOpenPayModal(item.designerId)}
                              className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                              <span>Pay</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
