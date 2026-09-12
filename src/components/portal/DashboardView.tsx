import React from 'react';
import {
  FolderKanban,
  Users,
  Briefcase,
  FileText,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Invoice, Project, LocalWork, Client, DeadlineItem, ActiveTab } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { UpcomingDeadlinesCard } from './UpcomingDeadlinesCard';

interface DashboardViewProps {
  invoices: Invoice[];
  projects: Project[];
  localWorks: LocalWork[];
  clients: Client[];
  deadlines?: DeadlineItem[];
  onNavigateTab: (tab: ActiveTab) => void;
  onCreateInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onOpenDeadlineDetails?: (deadline: DeadlineItem) => void;
  onOpenAddDeadlineModal?: () => void;
  onOpenViewAllModal?: () => void;
  onToggleCompleteDeadline?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  projects,
  localWorks,
  clients,
  deadlines = [],
  onNavigateTab,
  onCreateInvoice,
  onViewInvoice,
  onOpenDeadlineDetails = () => {},
  onOpenAddDeadlineModal = () => {},
  onOpenViewAllModal = () => {},
  onToggleCompleteDeadline = () => {},
}) => {
  const finalizedInvoices = invoices.filter((i) => i.status !== 'Draft' && i.status !== 'Cancelled');
  const totalBilled = finalizedInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalCollected = finalizedInvoices.reduce((s, i) => s + (i.receivedAmount || 0), 0);
  const pendingCollection = finalizedInvoices.reduce(
    (s, i) => (i.status === 'Paid' ? s : s + (i.balanceAmount || 0)),
    0
  );

  return (
    <div id="dashboard-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Studio Header Banner - Minimal SaaS Clean style */}
      <div className="p-6 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-2xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5738]/20 text-[#FF5738] uppercase tracking-wider border border-[#FF5738]/30">
                Gizmo Design Studio
              </span>
              <span className="text-xs text-zinc-400 font-mono">Live Operations</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Studio Financials &amp; Work Management
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Unified control panel for client invoices, branding projects, fast print works, and receivables.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('invoice')}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg border border-zinc-700 transition flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Invoicing Hub</span>
            </button>

            <button
              onClick={onCreateInvoice}
              className="px-3.5 py-2 bg-[#FF5738] hover:bg-[#ff4220] active:scale-98 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD DEADLINE HIGHLIGHT CARD */}
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

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1 font-semibold uppercase tracking-wider">
            <span>Total Invoiced</span>
            <TrendingUp className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-extrabold text-zinc-950 font-mono">
            {formatINR(totalBilled)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">{finalizedInvoices.length} billed orders</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1 font-semibold uppercase tracking-wider">
            <span>Collected (Paid)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-xl font-extrabold text-emerald-700 font-mono">
            {formatINR(totalCollected)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">UPI &amp; Bank settlements</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1 font-semibold uppercase tracking-wider">
            <span>Active Projects</span>
            <FolderKanban className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-extrabold text-zinc-950 font-mono">
            {projects.length}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Corporate &amp; institutional</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1 font-semibold uppercase tracking-wider">
            <span>Pending Receivables</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-rose-600 font-mono">
            {formatINR(pendingCollection)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Awaiting client payment</p>
        </div>
      </div>

      {/* Two Column Section: Recent Invoices & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (Cols 1-2): Recent Invoices Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Recent Invoices
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('invoice')}
              className="text-xs text-zinc-600 hover:text-zinc-950 font-bold flex items-center gap-1 transition"
            >
              <span>View All Invoices</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-100">
                  <th className="pb-2">Invoice</th>
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.slice(0, 5).map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onViewInvoice(inv)}
                    className="hover:bg-zinc-50 cursor-pointer transition"
                  >
                    <td className="py-2.5 font-mono font-bold text-zinc-900">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-2.5 font-medium text-zinc-900">
                      {inv.billedTo.clientName}
                    </td>
                    <td className="py-2.5 text-zinc-500 font-mono">{formatDate(inv.invoiceDate)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-zinc-950">
                      {formatINR(inv.grandTotal)}
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inv.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (Col 3): Fast Local Works & People Shortcuts */}
        <div className="space-y-4">
          {/* Local Works Summary */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Local Works
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('local-works')}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-bold transition"
              >
                View →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {localWorks.slice(0, 3).map((lw) => (
                <div
                  key={lw.id}
                  className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">{lw.title}</p>
                    <p className="text-[10px] text-zinc-400">{lw.clientName}</p>
                  </div>
                  <span className="font-mono font-bold text-zinc-950">
                    {formatINR(lw.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Client Roster */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Clients / People
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('people')}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-bold transition"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {clients.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-semibold text-zinc-900">{c.name}</p>
                    <p className="text-[10px] text-zinc-400">{c.city || 'India'}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono font-medium">
                    {c.phone || 'No phone'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
