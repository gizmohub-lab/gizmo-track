import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  FolderKanban,
  Clock,
  TriangleAlert,
  IndianRupee,
  CreditCard,
  CheckCircle2,
  Search,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import { LocalWork, Invoice, DeadlineItem, ActiveTab, Project } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { getWorkFinancials } from '../../utils/localWorkUtils';
import { UpcomingDeadlinesCard } from './UpcomingDeadlinesCard';
import { AnimatedCountUp } from '../common/MotionComponents';
import { useLiveNow, getAllUnifiedDeadlines } from '../../utils/dateTimeUtils';

interface ProductionDashboardProps {
  localWorks: LocalWork[];
  invoices: Invoice[];
  deadlines: DeadlineItem[];
  projects?: Project[];
  onCreateWork: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenDeadlineDetails: (deadline: DeadlineItem) => void;
  onOpenAddDeadlineModal: () => void;
  onOpenViewAllModal: () => void;
  onToggleCompleteDeadline: (id: string) => void;
}

export const ProductionDashboard: React.FC<ProductionDashboardProps> = ({
  localWorks,
  invoices,
  deadlines,
  projects = [],
  onCreateWork,
  onNavigateTab,
  onOpenDeadlineDetails,
  onOpenAddDeadlineModal,
  onOpenViewAllModal,
  onToggleCompleteDeadline,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const now = useLiveNow(1000);

  // Financial & Stat Calculations
  const { totalValue, totalGot, totalToGet, activeCount, dueSoonCount, overdueCount } = useMemo(() => {
    let biz = 0;
    let got = 0;
    let toGet = 0;
    let active = 0;

    localWorks.forEach((w) => {
      const fin = getWorkFinancials(w);
      biz += fin.totalAmount;
      got += fin.amountGot;
      toGet += fin.amountToGet;
      if (w.status !== 'Completed') active++;
    });

    projects.forEach((p) => {
      const pTot = Number(p.totalAmount ?? p.budget ?? 0);
      const pGot = Number(p.amountGot ?? 0);
      const pToGet = Math.max(0, pTot - pGot);
      biz += pTot;
      got += pGot;
      toGet += pToGet;
      if (p.status !== 'Completed') active++;
    });

    const unified = getAllUnifiedDeadlines(projects, localWorks, now).filter((d) => !d.isCompleted);
    const dueSoon = unified.filter((d) => d.evaluation.statusType === 'DUE_SOON' || d.evaluation.statusType === 'DUE_NOW' || d.evaluation.statusType === 'DUE_TODAY').length;
    const overdue = unified.filter((d) => d.evaluation.isOverdue).length;

    return {
      totalValue: biz,
      totalGot: got,
      totalToGet: toGet,
      activeCount: active,
      dueSoonCount: dueSoon,
      overdueCount: overdue,
    };
  }, [localWorks, projects, deadlines, now]);

  const filteredWorks = useMemo(() => {
    return localWorks.filter((w) => {
      const matchesStatus = filterStatus === 'All' || w.status === filterStatus;
      const matchesSearch =
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.workId && w.workId.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [localWorks, filterStatus, searchTerm]);

  const totalProjectsCount = projects.length + localWorks.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            Dashboard
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Overview of studio projects, local works and pending financial receivables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('local-works')}
            className="px-3 py-1.5 text-xs font-semibold border border-zinc-200 bg-white rounded-lg flex items-center gap-1.5 hover:bg-zinc-50 transition"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" /> View All Works
          </button>
          <button
            onClick={onCreateWork}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#EE1D45] hover:bg-[#D8143C] text-white rounded-lg flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> + New Work Order
          </button>
        </div>
      </div>

      {/* 5. MINIMAL STAT CARDS WITH STAGGERED FADE + COUNT-UP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Projects */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.02 }}
          className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">Total Projects</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-zinc-950">
            <AnimatedCountUp value={totalProjectsCount} />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Projects &amp; Works</p>
        </motion.div>

        {/* Active */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.05 }}
          className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate">Active</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-zinc-950">
            <AnimatedCountUp value={activeCount} />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">In progress</p>
        </motion.div>

        {/* Due Soon */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.08 }}
          className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Clock className={`w-3.5 h-3.5 text-[#EE1D45] ${dueSoonCount > 0 ? 'animate-pulse' : ''}`} />
            <span className="truncate">Due Soon</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-zinc-950">
            <AnimatedCountUp value={dueSoonCount} />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Next 48 hours</p>
        </motion.div>

        {/* Overdue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.11 }}
          className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <TriangleAlert className={`w-3.5 h-3.5 text-rose-500 ${overdueCount > 0 ? 'animate-pulse' : ''}`} />
            <span className="truncate">Overdue</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-600">
            <AnimatedCountUp value={overdueCount} />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Past deadline</p>
        </motion.div>

        {/* Total Value */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.14 }}
          className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <IndianRupee className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">Total Value</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-zinc-950 truncate">
            <AnimatedCountUp value={totalValue} isCurrency />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Billed value</p>
        </motion.div>

        {/* To Get */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.17 }}
          className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">To Get</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-rose-600 truncate">
            <AnimatedCountUp value={totalToGet} isCurrency />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Pending balance</p>
        </motion.div>

        {/* Got */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.2 }}
          className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate">Got</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-700 truncate">
            <AnimatedCountUp value={totalGot} isCurrency />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Collected</p>
        </motion.div>
      </div>

      {/* 6. UPCOMING DEADLINES CARD */}
      <UpcomingDeadlinesCard
        deadlines={deadlines}
        projects={projects}
        localWorks={localWorks}
        onNavigateTab={onNavigateTab}
        onOpenDeadlineDetails={onOpenDeadlineDetails}
        onOpenAddDeadlineModal={onOpenAddDeadlineModal}
        onOpenViewAllModal={onOpenViewAllModal}
        onToggleCompleteDeadline={onToggleCompleteDeadline}
      />

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            placeholder="Search by title, work ID, client..."
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-400 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 bg-white"
          >
            <option value="All">All Production Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Designing">Designing</option>
            <option value="In Progress">In Progress</option>
            <option value="Printing">Printing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Recent Local Works Table */}
      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left p-3 text-[10px] font-bold uppercase text-zinc-400">
                Work Order
              </th>
              <th className="text-left p-3 text-[10px] font-bold uppercase text-zinc-400">Client</th>
              <th className="text-left p-3 text-[10px] font-bold uppercase text-zinc-400">Deadline</th>
              <th className="text-left p-3 text-[10px] font-bold uppercase text-zinc-400">Status</th>
              <th className="text-right p-3 text-[10px] font-bold uppercase text-zinc-400">
                Amount (Got / To Get)
              </th>
              <th className="text-center p-3 text-[10px] font-bold uppercase text-zinc-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredWorks.slice(0, 8).map((w) => {
              const fin = getWorkFinancials(w);
              return (
                <tr
                  key={w.id}
                  onClick={() => onNavigateTab('local-works')}
                  className="hover:bg-zinc-50/80 cursor-pointer transition"
                >
                  <td className="p-3">
                    <div className="font-semibold text-zinc-950">{w.title}</div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      #{w.workId || w.id.slice(0, 6)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-zinc-900">{w.clientName}</div>
                  </td>
                  <td className="p-3 font-mono text-zinc-600">
                    {formatDate(w.deadlineDate || w.date)}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-mono font-bold text-zinc-950">
                      {formatINR(fin.totalAmount)}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      <span className="text-emerald-600 font-semibold">Got: {formatINR(fin.amountGot)}</span> · <span className={fin.amountToGet > 0 ? 'text-rose-600 font-bold' : ''}>To Get: {formatINR(fin.amountToGet)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onNavigateTab('local-works')}
                      className="px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded transition"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
