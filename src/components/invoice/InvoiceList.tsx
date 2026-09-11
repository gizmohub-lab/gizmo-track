import React, { useState, useMemo } from 'react';
import {
  Eye,
  Edit2,
  Copy,
  Download,
  Printer,
  Share2,
  Trash2,
  MoreVertical,
  CheckCircle,
  CreditCard,
  Search,
  Filter,
  ArrowUpDown,
  X,
  Plus,
  FileText,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

interface InvoiceListProps {
  invoices: Invoice[];
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  onView?: (invoice: Invoice) => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onDuplicate?: (invoice: Invoice) => void;
  onDelete?: (invoiceId: string) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  onShare?: (invoice: Invoice) => void;
  onShareInvoice?: (invoice: Invoice) => void;
  onRecordPayment?: (invoice: Invoice) => void;
  onMarkPaid?: (invoiceId: string) => void;
  onCreateInvoice?: () => void;
  onDownloadPdf?: (invoice: Invoice) => void;
  onOpenSettings?: () => void;
  onOpenProject?: (projectId: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  searchTerm: propSearchTerm,
  onSearchChange: propOnSearchChange,
  statusFilter: propStatusFilter,
  onStatusFilterChange: propOnStatusFilterChange,
  onView,
  onViewInvoice,
  onEdit,
  onEditInvoice,
  onDuplicate,
  onDelete,
  onDeleteInvoice,
  onShare,
  onShareInvoice,
  onRecordPayment,
  onMarkPaid,
  onCreateInvoice,
  onDownloadPdf,
  onOpenSettings,
  onOpenProject,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [localStatus, setLocalStatus] = useState('All');

  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : localSearch;
  const onSearchChange = propOnSearchChange || setLocalSearch;
  const statusFilter = propStatusFilter !== undefined ? propStatusFilter : localStatus;
  const onStatusFilterChange = propOnStatusFilterChange || setLocalStatus;

  const handleView = onView || onViewInvoice || (() => {});
  const handleEdit = onEdit || onEditInvoice || (() => {});
  const handleDelete = onDelete || onDeleteInvoice || (() => {});
  const handleShare = onShare || onShareInvoice || (() => {});
  // Action dropdown state
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  
  // Secondary filters (Date, Client, Amount, Project)
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [amountRange, setAmountRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [showFiltersBar, setShowFiltersBar] = useState<boolean>(false);

  // Filter options from data
  const clientsList = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.billedTo.clientName) set.add(inv.billedTo.clientName);
    });
    return Array.from(set);
  }, [invoices]);

  const projectsList = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.projectTitle) set.add(inv.projectTitle);
    });
    return Array.from(set);
  }, [invoices]);

  // Filtering logic
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        // Status filter
        if (statusFilter !== 'All' && inv.status !== statusFilter) {
          return false;
        }

        // Client filter
        if (selectedClient !== 'All' && inv.billedTo.clientName !== selectedClient) {
          return false;
        }

        // Project filter
        if (selectedProject !== 'All' && inv.projectTitle !== selectedProject) {
          return false;
        }

        // Amount filter
        if (amountRange !== 'All') {
          const amt = inv.grandTotal;
          if (amountRange === 'under-5k' && amt >= 5000) return false;
          if (amountRange === '5k-20k' && (amt < 5000 || amt > 20000)) return false;
          if (amountRange === 'above-20k' && amt <= 20000) return false;
        }

        // Search query: Invoice Number, Client, Phone, Project, Local Work
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchNo = inv.invoiceNo.toLowerCase().includes(query);
          const matchClient = inv.billedTo.clientName.toLowerCase().includes(query);
          const matchCompany = (inv.billedTo.company || '').toLowerCase().includes(query);
          const matchPhone = (inv.billedTo.phone || '').includes(query);
          const matchProj = (inv.projectTitle || '').toLowerCase().includes(query);
          const matchLw = (inv.localWorkTitle || '').toLowerCase().includes(query);

          if (!matchNo && !matchClient && !matchCompany && !matchPhone && !matchProj && !matchLw) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.grandTotal - a.grandTotal;
        }
        if (sortBy === 'amount-asc') {
          return a.grandTotal - b.grandTotal;
        }
        return 0;
      });
  }, [invoices, statusFilter, selectedClient, selectedProject, amountRange, searchTerm, sortBy]);

  const statusTabs: (InvoiceStatus | 'All')[] = [
    'All',
    'Draft',
    'Pending',
    'Partially Paid',
    'Paid',
    'Overdue',
    'Cancelled',
  ];

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Partially Paid':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Overdue':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Pending':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-500 border-gray-200 line-through';
      case 'Sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleDownloadPdf = async (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await generateInvoicePDF(inv);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    onView(inv);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div id="invoice-list-module" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* 1. Search & Status Filter Tabs */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-900 focus:bg-white text-slate-800 transition w-44 sm:w-56"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {statusTabs.map((st) => {
              const isActive = statusFilter === st;
              const count =
                st === 'All'
                  ? invoices.length
                  : invoices.filter((i) => i.status === st).length;

              return (
                <button
                  key={st}
                  id={`filter-tab-${st.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onStatusFilterChange(st)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Toggle & Sorting */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFiltersBar(!showFiltersBar)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
              showFiltersBar
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Secondary Filters Bar (Client, Project, Amount) */}
      {showFiltersBar && (
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3 text-xs">
          {/* Client Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Client:</span>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium outline-none"
            >
              <option value="All">All Clients</option>
              {clientsList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Project:</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium outline-none"
            >
              <option value="All">All Projects</option>
              {projectsList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Range Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Amount:</span>
            <select
              value={amountRange}
              onChange={(e) => setAmountRange(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium outline-none"
            >
              <option value="All">All Amounts</option>
              <option value="under-5k">Under ₹5,000</option>
              <option value="5k-20k">₹5,000 – ₹20,000</option>
              <option value="above-20k">Above ₹20,000</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedClient !== 'All' || selectedProject !== 'All' || amountRange !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedClient('All');
                setSelectedProject('All');
                setAmountRange('All');
                onSearchChange('');
              }}
              className="ml-auto text-violet-700 hover:text-violet-900 font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Search Bar for mobile/tablet */}
      <div className="p-3 bg-slate-50/50 border-b border-slate-100 md:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, client, phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none"
          />
        </div>
      </div>

      {/* 4. Table view matching Section 3 */}
      <div className="overflow-x-auto">
        <table id="invoices-table" className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold text-[11px] sm:text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="py-3.5 px-4 font-mono">Invoice No</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Invoice Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  id={`invoice-row-${inv.invoiceNo}`}
                  onClick={() => onView(inv)}
                  className="hover:bg-violet-50/40 transition duration-100 cursor-pointer group"
                >
                  {/* Invoice No */}
                  <td className="py-3.5 px-4 font-bold font-mono text-violet-700">
                    <span className="bg-violet-50 group-hover:bg-violet-100 px-2 py-1 rounded border border-violet-200/60">
                      {inv.invoiceNo}
                    </span>
                  </td>

                  {/* Client */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-violet-900">
                      {inv.billedTo.clientName}
                    </div>
                    {inv.billedTo.company && inv.billedTo.company !== inv.billedTo.clientName && (
                      <div className="text-[11px] text-slate-500">{inv.billedTo.company}</div>
                    )}
                    {inv.projectTitle && (
                      <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5 flex items-center gap-1 flex-wrap">
                        <span className="text-slate-400">Project:</span>
                        {onOpenProject && inv.projectId ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenProject(inv.projectId!);
                            }}
                            className="text-violet-700 hover:text-violet-900 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                            title="Open Project Workspace"
                          >
                            <span className="truncate">{inv.projectTitle}</span>
                            {inv.projectCode && (
                              <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-violet-100 text-violet-800 font-bold">
                                ({inv.projectCode})
                              </span>
                            )}
                          </button>
                        ) : (
                          <span>
                            {inv.projectTitle} {inv.projectCode ? `(${inv.projectCode})` : ''}
                          </span>
                        )}
                        {inv.invoiceStage && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                            {inv.invoiceStage}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Invoice Date */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {formatDate(inv.invoiceDate)}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatDate(inv.dueDate)}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 font-mono text-sm">
                    {formatINR(inv.grandTotal)}
                    {inv.status === 'Partially Paid' && (
                      <div className="text-[10px] font-normal text-rose-600 font-sans">
                        Bal: {formatINR(inv.balanceAmount)}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {/* View Action */}
                      <button
                        title="View Invoice"
                        onClick={() => handleView(inv)}
                        className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-100 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Action */}
                      <button
                        title="Edit Invoice"
                        onClick={() => handleEdit(inv)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Download PDF Action */}
                      <button
                        title="Download PDF"
                        onClick={(e) => handleDownloadPdf(inv, e)}
                        className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-100 rounded-lg transition hidden sm:inline-flex"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Print Action */}
                      <button
                        title="Print Invoice"
                        onClick={(e) => handlePrint(inv, e)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition hidden sm:inline-flex"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Share Action */}
                      <button
                        title="Share via WhatsApp or Email"
                        onClick={() => handleShare(inv)}
                        className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-100 rounded-lg transition hidden md:inline-flex"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* More Menu Dropdown for Duplicate, Delete, Payment */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenActionId(openActionId === inv.id ? null : inv.id)
                          }
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openActionId === inv.id && (
                          <div
                            className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                            onMouseLeave={() => setOpenActionId(null)}
                          >
                            <button
                              onClick={() => {
                                handleView(inv);
                                setOpenActionId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Invoice</span>
                            </button>

                            <button
                              onClick={() => {
                                handleEdit(inv);
                                setOpenActionId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => {
                                onDuplicate(inv);
                                setOpenActionId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Duplicate Invoice</span>
                            </button>

                            <button
                              onClick={(e) => {
                                handleDownloadPdf(inv, e);
                                setOpenActionId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-500" />
                              <span>Download PDF</span>
                            </button>

                            <button
                              onClick={() => {
                                handleShare(inv);
                                setOpenActionId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Share</span>
                            </button>

                            {inv.status !== 'Paid' && (
                              <>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button
                                  onClick={() => {
                                    onRecordPayment(inv);
                                    setOpenActionId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-2"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Record Payment</span>
                                </button>
                                <button
                                  onClick={() => {
                                    onMarkPaid(inv.id);
                                    setOpenActionId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-2"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Mark as Paid</span>
                                </button>
                              </>
                            )}

                            <div className="h-px bg-slate-100 my-1"></div>
                            <button
                              onClick={() => {
                                handleDelete(inv.id);
                                setOpenActionId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-500">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">No invoices yet</h3>
                    <p className="text-xs text-slate-500">
                      Create your first invoice to start tracking billing.
                    </p>
                    <button
                      onClick={onCreateInvoice}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create Invoice</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-semibold text-slate-700 text-sm">No matching invoices found</p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search query or status filter to see other records.
                    </p>
                    <button
                      onClick={onCreateInvoice}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition mt-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Create Invoice</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filteredInvoices.length}</strong> of{' '}
          <strong className="text-slate-800">{invoices.length}</strong> invoices
        </span>
        <span className="font-medium text-violet-700">
          Total Filtered Value: {formatINR(filteredInvoices.reduce((s, i) => s + i.grandTotal, 0))}
        </span>
      </div>
    </div>
  );
};
