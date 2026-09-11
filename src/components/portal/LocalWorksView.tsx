import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MessageCircle,
  FileSpreadsheet,
  Download,
  Tag,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  MoreVertical,
  Layers,
  ArrowUpDown,
  X,
  Copy,
  Edit2,
  Trash2,
  FileText,
  Flame,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Users,
  Settings,
  Grid,
  Video,
  FileImage,
  Sparkles,
  IndianRupee,
} from 'lucide-react';
import {
  LocalWork,
  Invoice,
  Client,
  LocalWorkStatus,
  LocalWorkPriority,
  PaymentStatus,
  LocalWorkPaymentRecord,
  CustomDesigner,
  DesignCategory,
  WorkTypeItem,
} from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  getStatusConfig,
  calculateWorkDeadline,
  buildWhatsAppUrl,
  generateNextWorkId,
  WORK_STATUSES,
  getWorkFinancials,
  getPaymentStatusBadgeStyle,
  calculateAmountToGet,
  calculatePaymentStatus,
} from '../../utils/localWorkUtils';
import {
  loadDesignCategories,
  saveDesignCategories,
  loadDesigners,
  saveDesigners,
  loadWorkTypes,
  saveWorkTypes,
  loadSmartDefaults,
  saveSmartDefaults,
  SmartDefaults,
} from '../../data/mockData';
import { NewLocalWorkModal } from './local-works/NewLocalWorkModal';
import { LocalWorkDetailModal } from './local-works/LocalWorkDetailModal';
import { QuickPaymentModal } from './local-works/QuickPaymentModal';
import { ImportWorksModal } from './local-works/ImportWorksModal';
import { ManageCategoriesModal } from './local-works/ManageCategoriesModal';
import { LocalWorksCalendarView } from './local-works/LocalWorksCalendarView';
import { WorkTypeBadge } from './local-works/WorkTypeBadge';
import { QuickAssignDropdown } from './local-works/QuickAssignDropdown';
import { DesignersDirectoryView } from './local-works/DesignersDirectoryView';
import { CategoriesManagementView } from './local-works/CategoriesManagementView';
import { LocalWorksSettingsView } from './local-works/LocalWorksSettingsView';

interface LocalWorksViewProps {
  localWorks: LocalWork[];
  invoices: Invoice[];
  clients: Client[];
  categories?: string[];
  designCategories?: DesignCategory[];
  onUpdateDesignCategories?: (categories: DesignCategory[]) => void;
  customDesigners?: CustomDesigner[];
  onUpdateCustomDesigners?: (designers: CustomDesigner[]) => void;
  workTypes?: WorkTypeItem[];
  onUpdateWorkTypes?: (workTypes: WorkTypeItem[]) => void;
  smartDefaults?: SmartDefaults;
  onUpdateSmartDefaults?: (defaults: SmartDefaults) => void;
  onAddLocalWork: (work: LocalWork) => void;
  onUpdateLocalWork: (work: LocalWork) => void;
  onDeleteLocalWork: (id: string) => void;
  onDuplicateLocalWork: (work: LocalWork) => void;
  onSaveCategories?: (categories: string[]) => void;
  onImportWorks: (works: LocalWork[]) => void;
  onCreateInvoiceForWork: (work: LocalWork) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const LocalWorksView: React.FC<LocalWorksViewProps> = ({
  localWorks,
  invoices,
  clients,
  categories: legacyCategories = [],
  designCategories: propDesignCategories,
  onUpdateDesignCategories,
  customDesigners: propCustomDesigners,
  onUpdateCustomDesigners,
  workTypes: propWorkTypes,
  onUpdateWorkTypes,
  smartDefaults: propSmartDefaults,
  onUpdateSmartDefaults,
  onAddLocalWork,
  onUpdateLocalWork,
  onDeleteLocalWork,
  onDuplicateLocalWork,
  onSaveCategories,
  onImportWorks,
  onCreateInvoiceForWork,
  onViewInvoice,
}) => {
  // Self-managed state if props not passed from parent
  const [localCategories, setLocalCategories] = useState<DesignCategory[]>(() =>
    propDesignCategories || loadDesignCategories()
  );
  const [localDesigners, setLocalDesigners] = useState<CustomDesigner[]>(() =>
    propCustomDesigners || loadDesigners()
  );
  const [localWorkTypes, setLocalWorkTypes] = useState<WorkTypeItem[]>(() =>
    propWorkTypes || loadWorkTypes()
  );
  const [localSmartDefaults, setLocalSmartDefaults] = useState<SmartDefaults>(() =>
    propSmartDefaults || loadSmartDefaults()
  );

  const activeCategories = propDesignCategories || localCategories || [];
  const activeDesigners = propCustomDesigners || localDesigners || [];
  const activeWorkTypes = propWorkTypes || localWorkTypes || [];
  const activeSmartDefaults = propSmartDefaults || localSmartDefaults;

  const handleUpdateCategories = (newCats: DesignCategory[]) => {
    if (onUpdateDesignCategories) {
      onUpdateDesignCategories(newCats);
    } else {
      setLocalCategories(newCats);
      saveDesignCategories(newCats);
    }
    if (onSaveCategories) {
      onSaveCategories(newCats.map((c) => c.name));
    }
  };

  const handleUpdateDesigners = (newDes: CustomDesigner[]) => {
    if (onUpdateCustomDesigners) {
      onUpdateCustomDesigners(newDes);
    } else {
      setLocalDesigners(newDes);
      saveDesigners(newDes);
    }
  };

  const handleUpdateWorkTypes = (newWts: WorkTypeItem[]) => {
    if (onUpdateWorkTypes) {
      onUpdateWorkTypes(newWts);
    } else {
      setLocalWorkTypes(newWts);
      saveWorkTypes(newWts);
    }
  };

  const handleUpdateSmartDefaults = (newDefs: SmartDefaults) => {
    if (onUpdateSmartDefaults) {
      onUpdateSmartDefaults(newDefs);
    } else {
      setLocalSmartDefaults(newDefs);
      saveSmartDefaults(newDefs);
    }
  };

  const handleAddDesignerDirect = (newDesigner: CustomDesigner) => {
    const updated = [...activeDesigners, newDesigner];
    handleUpdateDesigners(updated);
  };

  // Primary sub-navigation: 'works' | 'calendar' | 'categories' | 'designers' | 'settings'
  const [activeTab, setActiveTab] = useState<
    'works' | 'calendar' | 'categories' | 'designers' | 'settings'
  >('works');

  // Work Type quick filter: 'ALL' | 'Poster' | 'Motion' | 'Other'
  const [workTypeQuickFilter, setWorkTypeQuickFilter] = useState<string>('ALL');

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assignedFilter, setAssignedFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [quickFilter, setQuickFilter] = useState<string>('ALL'); // 'ALL', 'TODAY', 'DUE_TODAY', 'OVERDUE', 'URGENT', 'PENDING', 'IN_PROGRESS', 'PAYMENT_PENDING'

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentWork, setPaymentWork] = useState<LocalWork | null>(null);
  const [selectedWork, setSelectedWork] = useState<LocalWork | null>(null);
  const [editingWork, setEditingWork] = useState<LocalWork | null>(null);

  const todayStr = '2026-09-10';

  // 1. KPI Summary Counts
  const totalCount = localWorks.length;
  const pendingCount = localWorks.filter((w) => w.status !== 'Completed' && w.status !== 'Cancelled').length;
  const inProgressCount = localWorks.filter((w) => w.status === 'In Progress').length;
  const todaysWorksCount = localWorks.filter(
    (w) => w.deadlineDate === todayStr || w.date === todayStr || w.receivedDate === todayStr
  ).length;
  const completedCount = localWorks.filter((w) => w.status === 'Completed').length;
  const paymentPendingCount = localWorks.filter(
    (w) => {
      const fin = getWorkFinancials(w);
      return fin.amountToGet > 0 && w.status !== 'Cancelled';
    }
  ).length;

  // Financial Summaries: TO GET / GOT / TOTAL BUSINESS
  const financialSummaries = useMemo(() => {
    let totalBusiness = 0;
    let totalGot = 0;
    let totalToGet = 0;
    let toGetCount = 0;
    let paidCount = 0;
    let partiallyPaidCount = 0;
    let notPaidCount = 0;
    let overpaidCount = 0;

    localWorks.forEach((w) => {
      const fin = getWorkFinancials(w);
      totalBusiness += fin.totalAmount;
      totalGot += fin.amountGot;
      totalToGet += fin.amountToGet;
      if (fin.amountToGet > 0) toGetCount++;
      if (fin.paymentStatus === 'Paid') paidCount++;
      else if (fin.paymentStatus === 'Partially Paid') partiallyPaidCount++;
      else if (fin.paymentStatus === 'Not Paid') notPaidCount++;
      else if (fin.paymentStatus === 'Overpaid') overpaidCount++;
    });

    return {
      totalBusiness,
      totalGot,
      totalToGet,
      toGetCount,
      paidCount,
      partiallyPaidCount,
      notPaidCount,
      overpaidCount,
    };
  }, [localWorks]);

  // Work Type counts for quick filter buttons
  const posterCount = localWorks.filter((w) => (w.workType || 'Poster') === 'Poster').length;
  const motionCount = localWorks.filter((w) => w.workType === 'Motion').length;
  const otherCount = localWorks.filter((w) => w.workType === 'Other').length;

  // 2. Weekly Workload Calculation
  const weekDates = [
    { label: 'Mon', dateStr: '2026-09-07' },
    { label: 'Tue', dateStr: '2026-09-08' },
    { label: 'Wed', dateStr: '2026-09-09' },
    { label: 'Thu', dateStr: '2026-09-10' }, // Today
    { label: 'Fri', dateStr: '2026-09-11' },
    { label: 'Sat', dateStr: '2026-09-12' },
    { label: 'Sun', dateStr: '2026-09-13' },
  ];

  const weeklyWorkload = weekDates.map((d) => {
    const count = localWorks.filter((w) => (w.deadlineDate || w.date) === d.dateStr).length;
    return {
      ...d,
      count,
      isToday: d.dateStr === todayStr,
    };
  });

  // 3. Filtered works
  const filteredWorks = useMemo(() => {
    return localWorks.filter((w) => {
      // 1. Work Type Quick Filter (ALL | Poster | Motion | Other)
      if (workTypeQuickFilter !== 'ALL') {
        const currentType = w.workType || 'Poster';
        if (currentType !== workTypeQuickFilter) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = w.title?.toLowerCase().includes(q);
        const matchClient = w.clientName?.toLowerCase().includes(q);
        const matchId = (w.workId || w.id)?.toLowerCase().includes(q);
        const matchCat = (w.category || w.workType)?.toLowerCase().includes(q);
        const matchType = w.workType?.toLowerCase().includes(q);
        const matchOtherDetail = w.otherWorkTypeDetail?.toLowerCase().includes(q);
        const matchAssigned = w.assignedTo?.toLowerCase().includes(q);
        const matchSupporting = w.supportingDesigners?.some((sd) => sd.toLowerCase().includes(q));
        const matchNotes = w.notes?.toLowerCase().includes(q);
        if (
          !matchTitle &&
          !matchClient &&
          !matchId &&
          !matchCat &&
          !matchType &&
          !matchOtherDetail &&
          !matchAssigned &&
          !matchSupporting &&
          !matchNotes
        ) {
          return false;
        }
      }

      // 3. Status/Timeline Quick filter
      if (quickFilter === 'TODAY') {
        const isToday = w.deadlineDate === todayStr || w.date === todayStr || w.receivedDate === todayStr;
        if (!isToday) return false;
      } else if (quickFilter === 'DUE_TODAY') {
        if (w.deadlineDate !== todayStr) return false;
      } else if (quickFilter === 'OVERDUE') {
        const calc = calculateWorkDeadline(w.deadlineDate, w.deadlineTime);
        if (calc.urgency !== 'OVERDUE' || w.status === 'Completed' || w.status === 'Cancelled') return false;
      } else if (quickFilter === 'URGENT') {
        if (w.priority !== 'Urgent') return false;
      } else if (quickFilter === 'PENDING') {
        if (w.status === 'Completed' || w.status === 'Cancelled') return false;
      } else if (quickFilter === 'IN_PROGRESS') {
        if (w.status !== 'In Progress') return false;
      } else if (quickFilter === 'REVISION') {
        if (w.status !== 'Revision') return false;
      } else if (quickFilter === 'COMPLETED') {
        if (w.status !== 'Completed') return false;
      } else if (quickFilter === 'PAYMENT_PENDING' || quickFilter === 'TO_GET') {
        const fin = getWorkFinancials(w);
        if (fin.amountToGet <= 0) return false;
      }

      // 4. Dropdown filters
      if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && (w.category || w.workType) !== categoryFilter) return false;
      if (priorityFilter !== 'ALL' && w.priority !== priorityFilter) return false;
      if (assignedFilter !== 'ALL') {
        const isPrimary = w.assignedTo === assignedFilter;
        const isSupporting = w.supportingDesigners?.includes(assignedFilter);
        if (!isPrimary && !isSupporting) return false;
      }
      if (paymentFilter !== 'ALL') {
        const fin = getWorkFinancials(w);
        if (paymentFilter === 'TO_GET') {
          if (fin.amountToGet <= 0) return false;
        } else if (paymentFilter === 'Not Paid') {
          if (fin.paymentStatus !== 'Not Paid') return false;
        } else if (paymentFilter === 'Partially Paid') {
          if (fin.paymentStatus !== 'Partially Paid') return false;
        } else if (paymentFilter === 'Paid') {
          if (fin.paymentStatus !== 'Paid') return false;
        } else if (paymentFilter === 'Overpaid') {
          if (fin.paymentStatus !== 'Overpaid') return false;
        } else if (paymentFilter === 'Pending') {
          if (fin.paymentStatus !== 'Not Paid' && fin.paymentStatus !== 'Partially Paid') return false;
        } else if (fin.paymentStatus !== paymentFilter && w.paymentStatus !== paymentFilter) {
          return false;
        }
      }

      return true;
    });
  }, [
    localWorks,
    workTypeQuickFilter,
    searchQuery,
    quickFilter,
    statusFilter,
    categoryFilter,
    priorityFilter,
    assignedFilter,
    paymentFilter,
    todayStr,
  ]);

  // Handlers
  const handleOpenDetail = (work: LocalWork) => {
    setSelectedWork(work);
    setShowDetailModal(true);
  };

  const handleEditWork = (work: LocalWork) => {
    setEditingWork(work);
    setShowAddModal(true);
    setShowDetailModal(false);
  };

  const handleSaveWork = (work: LocalWork) => {
    if (editingWork) {
      onUpdateLocalWork(work);
    } else {
      onAddLocalWork(work);
    }
    setEditingWork(null);
  };

  const handleQuickAssignDesigner = (workId: string, designerName: string) => {
    const work = localWorks.find((w) => w.id === workId);
    if (!work) return;

    const updated: LocalWork = {
      ...work,
      assignedTo: designerName,
      history: [
        ...(work.history || []),
        {
          id: `hist-${Date.now()}`,
          timestamp: `10 Sep 2026 · 11:35 AM`,
          action: `Assigned to ${designerName}`,
        },
      ],
    };
    onUpdateLocalWork(updated);
    if (selectedWork?.id === work.id) {
      setSelectedWork(updated);
    }
  };

  const handleQuickStatusChange = (work: LocalWork, newStatus: LocalWorkStatus) => {
    const updated: LocalWork = {
      ...work,
      status: newStatus,
      history: [
        ...(work.history || []),
        {
          id: `hist-${Date.now()}`,
          timestamp: `10 Sep 2026 · 11:35 AM`,
          action: `Status changed to ${newStatus}`,
        },
      ],
    };
    onUpdateLocalWork(updated);
    if (selectedWork?.id === work.id) {
      setSelectedWork(updated);
    }
  };

  const handleQuickPriorityToggle = (work: LocalWork) => {
    const newPriority: LocalWorkPriority = work.priority === 'Urgent' ? 'Normal' : 'Urgent';
    const updated: LocalWork = {
      ...work,
      priority: newPriority,
    };
    onUpdateLocalWork(updated);
    if (selectedWork?.id === work.id) {
      setSelectedWork(updated);
    }
  };

  const handleAddRevision = (workId: string, note: string) => {
    const work = localWorks.find((w) => w.id === workId);
    if (!work) return;

    const nextRevNo = (work.revisionCount || 0) + 1;
    const updated: LocalWork = {
      ...work,
      revisionCount: nextRevNo,
      status: 'Revision',
      revisions: [
        ...(work.revisions || []),
        {
          revisionNo: nextRevNo,
          date: todayStr,
          note,
        },
      ],
      history: [
        ...(work.history || []),
        {
          id: `hist-${Date.now()}`,
          timestamp: `10 Sep 2026 · 11:35 AM`,
          action: `Revision ${nextRevNo} recorded`,
          note,
        },
      ],
    };
    onUpdateLocalWork(updated);
    setSelectedWork(updated);
  };

  const handleAddAttachment = (workId: string, attachment: any) => {
    const work = localWorks.find((w) => w.id === workId);
    if (!work) return;

    const updated: LocalWork = {
      ...work,
      attachments: [...(work.attachments || []), attachment],
      history: [
        ...(work.history || []),
        {
          id: `hist-${Date.now()}`,
          timestamp: `10 Sep 2026 · 11:35 AM`,
          action: `Attached ${attachment.name}`,
        },
      ],
    };
    onUpdateLocalWork(updated);
    setSelectedWork(updated);
  };

  const handleOpenPaymentModal = (work: LocalWork) => {
    setPaymentWork(work);
    setShowPaymentModal(true);
  };

  const handleSavePayment = (
    workId: string,
    newTotal: number,
    newGot: number,
    newRecord?: LocalWorkPaymentRecord
  ) => {
    const target = localWorks.find((w) => w.id === workId);
    if (!target) return;

    const toGet = calculateAmountToGet(newTotal, newGot);
    const payStatus = calculatePaymentStatus(newTotal, newGot);

    const updatedRecords = target.paymentRecords ? [...target.paymentRecords] : [];
    if (newRecord) {
      updatedRecords.unshift(newRecord);
    }

    const updatedHistory = target.history ? [...target.history] : [];
    if (newRecord) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updatedHistory.unshift({
        id: `hist-pay-${Date.now()}`,
        timestamp: `${dateStr} · ${timeStr}`,
        action: `Payment recorded (${formatINR(newRecord.amount)}) via ${newRecord.method || 'Manual'}`,
        note: newRecord.note || `Status updated to ${payStatus}`,
      });
    }

    const updatedWork: LocalWork = {
      ...target,
      totalAmount: newTotal,
      amount: newTotal,
      amountGot: newGot,
      amountToGet: toGet,
      paymentStatus: payStatus,
      paymentRecords: updatedRecords,
      history: updatedHistory,
    };

    onUpdateLocalWork(updatedWork);
    if (selectedWork?.id === workId) {
      setSelectedWork(updatedWork);
    }
    setShowPaymentModal(false);
    setPaymentWork(null);
  };

  const handleUpdatePaymentStatus = (workId: string, newPaymentStatus: PaymentStatus) => {
    const work = localWorks.find((w) => w.id === workId);
    if (!work) return;

    const total = work.totalAmount ?? work.amount ?? 0;
    let got = work.amountGot;
    if (newPaymentStatus === 'Paid') {
      got = total;
    } else if (newPaymentStatus === 'Not Paid') {
      got = 0;
    }
    const toGet = calculateAmountToGet(total, got || 0);

    const updated: LocalWork = {
      ...work,
      amountGot: got,
      amountToGet: toGet,
      paymentStatus: newPaymentStatus,
      history: [
        ...(work.history || []),
        {
          id: `hist-${Date.now()}`,
          timestamp: `10 Sep 2026 · 11:35 AM`,
          action: `Payment status updated to ${newPaymentStatus}`,
        },
      ],
    };
    onUpdateLocalWork(updated);
    setSelectedWork(updated);
  };

  const handleExportCSV = () => {
    if (filteredWorks.length === 0) {
      alert('No works to export.');
      return;
    }

    const headers = [
      'Work ID',
      'Title',
      'Client Name',
      'Work Type',
      'Category',
      'Assigned To',
      'Supporting Designers',
      'Received Date',
      'Deadline Date',
      'Deadline Time',
      'Status',
      'Priority',
      'Total Amount',
      'Amount Got',
      'Amount To Get',
      'Payment Status',
      'Phone',
      'Notes',
    ];

    const rows = filteredWorks.map((w) => {
      const fin = getWorkFinancials(w);
      return [
        `"${w.workId || w.id}"`,
        `"${(w.title || '').replace(/"/g, '""')}"`,
        `"${(w.clientName || '').replace(/"/g, '""')}"`,
        `"${w.workType || 'Poster'}"`,
        `"${w.category || w.workType || ''}"`,
        `"${w.assignedTo || ''}"`,
        `"${(w.supportingDesigners || []).join(', ')}"`,
        `"${w.receivedDate || w.date || ''}"`,
        `"${w.deadlineDate || ''}"`,
        `"${w.deadlineTime || ''}"`,
        `"${w.status || ''}"`,
        `"${w.priority || ''}"`,
        `"${fin.totalAmount}"`,
        `"${fin.amountGot}"`,
        `"${fin.amountToGet}"`,
        `"${fin.paymentStatus}"`,
        `"${w.clientPhone || ''}"`,
        `"${(w.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gizmo_Local_Works_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset all active filters
  const handleClearFilters = () => {
    setWorkTypeQuickFilter('ALL');
    setQuickFilter('ALL');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setAssignedFilter('ALL');
    setPaymentFilter('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters =
    workTypeQuickFilter !== 'ALL' ||
    quickFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    assignedFilter !== 'ALL' ||
    paymentFilter !== 'ALL' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. TOP HEADER & SUB-NAVIGATION BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        {/* Module Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5738]/10 text-[#FF5738] flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-zinc-950 tracking-tight">Local Works</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-zinc-100 text-zinc-700 border border-zinc-200 font-mono">
                {totalCount} Total
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Internal graphic, flex, motion &amp; printing production tracker
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Sub-Navigation Pills */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('works')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'works'
                  ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Works</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Categories</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-zinc-200/70 text-zinc-700 rounded-full font-mono pointer-events-none">
                {activeCategories.filter((c) => c?.isActive).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('designers')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'designers'
                  ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Designers</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-zinc-200/70 text-zinc-700 rounded-full font-mono pointer-events-none">
                {activeDesigners.filter((d) => d?.isActive).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-1.5 rounded-lg transition ${
                activeTab === 'settings'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Work Types & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action: New Local Work */}
          <button
            onClick={() => {
              setEditingWork(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-[#FF5738] hover:bg-[#ff4220] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Work</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-VIEW ROUTING */}
      {activeTab === 'categories' && (
        <CategoriesManagementView
          categories={activeCategories}
          localWorks={localWorks}
          works={localWorks}
          onUpdateCategories={handleUpdateCategories}
          onSelectCategoryForFilter={(catName) => {
            setCategoryFilter(catName);
            setActiveTab('works');
          }}
          onBackToWorks={() => setActiveTab('works')}
        />
      )}

      {activeTab === 'designers' && (
        <DesignersDirectoryView
          designers={activeDesigners}
          localWorks={localWorks}
          works={localWorks}
          onUpdateDesigners={handleUpdateDesigners}
          onSelectDesignerForFilter={(desName) => {
            setAssignedFilter(desName);
            setActiveTab('works');
          }}
          onBackToWorks={() => setActiveTab('works')}
        />
      )}

      {activeTab === 'settings' && (
        <LocalWorksSettingsView
          workTypes={activeWorkTypes}
          categories={activeCategories}
          designers={activeDesigners}
          smartDefaults={activeSmartDefaults}
          onUpdateWorkTypes={handleUpdateWorkTypes}
          onUpdateSmartDefaults={handleUpdateSmartDefaults}
          onBackToWorks={() => setActiveTab('works')}
        />
      )}

      {activeTab === 'calendar' && (
        <LocalWorksCalendarView
          works={localWorks}
          onSelectWork={handleOpenDetail}
          onAddWork={() => {
            setEditingWork(null);
            setShowAddModal(true);
          }}
        />
      )}

      {activeTab === 'works' && (
        <>
          {/* 3. PROMINENT FINANCIAL SUMMARY CARDS: TO GET & GOT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* TOTAL TO GET (How much money is TO GET) */}
            <div
              onClick={() => {
                if (paymentFilter === 'TO_GET') {
                  setPaymentFilter('ALL');
                } else {
                  setPaymentFilter('TO_GET');
                  setQuickFilter('ALL');
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
                paymentFilter === 'TO_GET'
                  ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/30'
                  : 'bg-white border-zinc-200 hover:border-rose-300 hover:bg-rose-50/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Total To Get
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                  {financialSummaries.toGetCount} Pending
                </span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-950 font-mono tracking-tight">
                {formatINR(financialSummaries.totalToGet)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-rose-100/70">
                <span className="text-zinc-500 text-[11px]">Money awaiting collection</span>
                <span className="text-[11px] font-bold text-rose-600 group-hover:underline">
                  {paymentFilter === 'TO_GET' ? 'Showing filtered ✓' : 'Filter To Get →'}
                </span>
              </div>
            </div>

            {/* TOTAL GOT (How much money is GOT) */}
            <div
              onClick={() => {
                if (paymentFilter === 'Paid') {
                  setPaymentFilter('ALL');
                } else {
                  setPaymentFilter('Paid');
                  setQuickFilter('ALL');
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
                paymentFilter === 'Paid'
                  ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/30'
                  : 'bg-white border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Total Got
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {financialSummaries.paidCount} Fully Paid
                </span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
                {formatINR(financialSummaries.totalGot)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-emerald-100/70">
                <span className="text-zinc-500 text-[11px]">Received via UPI, Cash & Bank</span>
                <span className="text-[11px] font-bold text-emerald-700 group-hover:underline">
                  {paymentFilter === 'Paid' ? 'Showing filtered ✓' : 'Filter Paid →'}
                </span>
              </div>
            </div>

            {/* TOTAL BUSINESS */}
            <div
              onClick={() => handleClearFilters()}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
                paymentFilter === 'ALL' && quickFilter === 'ALL'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    paymentFilter === 'ALL' && quickFilter === 'ALL'
                      ? 'text-zinc-300'
                      : 'text-zinc-500'
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  Total Business
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    paymentFilter === 'ALL' && quickFilter === 'ALL'
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {totalCount} Works
                </span>
              </div>
              <div
                className={`mt-2 text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  paymentFilter === 'ALL' && quickFilter === 'ALL'
                    ? 'text-white'
                    : 'text-zinc-950'
                }`}
              >
                {formatINR(financialSummaries.totalBusiness)}
              </div>
              <div
                className={`mt-2 flex items-center justify-between text-xs pt-2 border-t ${
                  paymentFilter === 'ALL' && quickFilter === 'ALL'
                    ? 'border-zinc-800 text-zinc-400'
                    : 'border-zinc-100 text-zinc-500'
                }`}
              >
                <span className="text-[11px]">Full billed value of all jobs</span>
                <span
                  className={`text-[11px] font-bold ${
                    paymentFilter === 'ALL' && quickFilter === 'ALL'
                      ? 'text-zinc-300'
                      : 'text-zinc-700'
                  } group-hover:underline`}
                >
                  View All →
                </span>
              </div>
            </div>
          </div>

          {/* 4. COMPACT OPERATIONAL SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Works */}
            <div
              onClick={() => handleClearFilters()}
              className="p-3.5 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition cursor-pointer shadow-2xs"
            >
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Works</div>
              <div className="text-2xl font-black text-zinc-950 mt-1">{totalCount}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">All tracked records</div>
            </div>

            {/* Pending */}
            <div
              onClick={() => setQuickFilter('PENDING')}
              className={`p-3.5 rounded-xl border transition cursor-pointer shadow-2xs ${
                quickFilter === 'PENDING'
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/30'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
                <span>Pending</span>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-amber-900 mt-1">{pendingCount}</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Awaiting completion</div>
            </div>

            {/* In Progress */}
            <div
              onClick={() => setQuickFilter('IN_PROGRESS')}
              className={`p-3.5 rounded-xl border transition cursor-pointer shadow-2xs ${
                quickFilter === 'IN_PROGRESS'
                  ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-300/30'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center justify-between">
                <span>In Progress</span>
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-blue-900 mt-1">{inProgressCount}</div>
              <div className="text-[10px] text-blue-600 mt-0.5">On design artboard</div>
            </div>

            {/* Today's Works */}
            <div
              onClick={() => setQuickFilter('TODAY')}
              className={`p-3.5 rounded-xl border transition cursor-pointer shadow-2xs ${
                quickFilter === 'TODAY'
                  ? 'bg-[#FF5738]/10 border-[#FF5738]/40 ring-2 ring-[#FF5738]/20'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="text-[11px] font-bold text-[#FF5738] uppercase tracking-wider flex items-center justify-between">
                <span>Today</span>
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-zinc-950 mt-1">{todaysWorksCount}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Received or due today</div>
            </div>

            {/* Completed */}
            <div
              onClick={() => setQuickFilter('COMPLETED')}
              className={`p-3.5 rounded-xl border transition cursor-pointer shadow-2xs ${
                quickFilter === 'COMPLETED'
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-300/30'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
                <span>Completed</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{completedCount}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Delivered / finished</div>
            </div>

            {/* Payment Pending */}
            <div
              onClick={() => {
                setPaymentFilter('TO_GET');
                setQuickFilter('ALL');
              }}
              className={`p-3.5 rounded-xl border transition cursor-pointer shadow-2xs ${
                paymentFilter === 'TO_GET' || quickFilter === 'PAYMENT_PENDING'
                  ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-300/30'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center justify-between">
                <span>To Get</span>
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-black text-rose-900 mt-1 font-mono">
                {formatINR(financialSummaries.totalToGet)}
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">
                {financialSummaries.toGetCount} jobs pending
              </div>
            </div>
          </div>

          {/* 4. WEEKLY WORKLOAD VISUAL STRIP */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-bold text-zinc-900">Current Week Production Load</span>
                <span className="text-[11px] text-zinc-400 font-mono">(07 Sep - 13 Sep 2026)</span>
              </div>
              <span className="text-[11px] font-medium text-zinc-500">
                Peak: Thursday (Today) · 4 deadlines
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weeklyWorkload.map((day) => (
                <div
                  key={day.dateStr}
                  onClick={() => {
                    setSearchQuery(day.dateStr);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    day.isToday
                      ? 'bg-[#FF5738]/10 border-[#FF5738]/40 shadow-xs'
                      : 'bg-zinc-50/70 border-zinc-200/80 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[10px] font-bold text-zinc-500">{day.label}</span>
                    {day.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5738]" />
                    )}
                  </div>
                  <div className="text-base font-black text-zinc-900 mt-0.5">{day.count}</div>
                  <div className="text-[9px] text-zinc-400 font-mono">
                    {day.dateStr.slice(8)} Sep
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. WORK TYPE PRIMARY QUICK FILTER STRIP */}
          <div className="bg-white p-3 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-zinc-900 uppercase tracking-wider pl-1">
                Work Type:
              </span>

              {/* All Works */}
              <button
                onClick={() => setWorkTypeQuickFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  workTypeQuickFilter === 'ALL'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <span>All Works</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-mono">
                  {totalCount}
                </span>
              </button>

              {/* Poster */}
              <button
                onClick={() => setWorkTypeQuickFilter('Poster')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  workTypeQuickFilter === 'Poster'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>Poster</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-200/70 text-blue-950 rounded-full font-mono">
                  {posterCount}
                </span>
              </button>

              {/* Motion */}
              <button
                onClick={() => setWorkTypeQuickFilter('Motion')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  workTypeQuickFilter === 'Motion'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Motion</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-200/70 text-purple-950 rounded-full font-mono">
                  {motionCount}
                </span>
              </button>

              {/* Other */}
              <button
                onClick={() => setWorkTypeQuickFilter('Other')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  workTypeQuickFilter === 'Other'
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-zinc-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Other</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-200 text-zinc-950 rounded-full font-mono">
                  {otherCount}
                </span>
              </button>
            </div>

            {/* Quick Actions (Import & Export CSV) */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Import Sheets</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* 6. SECONDARY FILTER TOOLBAR & SEARCH */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-3 shadow-2xs">
            {/* Search Input & Quick Status Chips */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by title, client, work ID (GZ-LW-101), category, designer, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#FF5738] focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status / Urgency Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs font-bold">
                {[
                  { id: 'ALL', label: 'All Works' },
                  { id: 'TO_GET', label: `To Get (${financialSummaries.toGetCount})` },
                  { id: 'DUE_TODAY', label: 'Due Today' },
                  { id: 'OVERDUE', label: 'Overdue' },
                  { id: 'URGENT', label: 'Urgent' },
                  { id: 'REVISION', label: 'Revisions' },
                ].map((chip) => {
                  const isActive =
                    chip.id === 'TO_GET'
                      ? paymentFilter === 'TO_GET'
                      : quickFilter === chip.id && paymentFilter === 'ALL';

                  return (
                    <button
                      key={chip.id}
                      onClick={() => {
                        if (chip.id === 'TO_GET') {
                          if (paymentFilter === 'TO_GET') {
                            setPaymentFilter('ALL');
                          } else {
                            setPaymentFilter('TO_GET');
                            setQuickFilter('ALL');
                          }
                        } else {
                          setQuickFilter(chip.id);
                          if (paymentFilter === 'TO_GET') setPaymentFilter('ALL');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? chip.id === 'TO_GET'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-zinc-900 text-white shadow-xs'
                          : chip.id === 'TO_GET'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropdown Filters: Category, Designer, Priority, Status, Payment */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-zinc-100 text-xs">
              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5738]"
                >
                  <option value="ALL">All Categories</option>
                  {activeCategories
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Designer Filter (Staff & External) */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  Assigned Designer
                </label>
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5738]"
                >
                  <option value="ALL">All Designers</option>
                  <optgroup label="Portal Staff">
                    {activeDesigners
                      .filter((d) => d.type === 'Portal Staff')
                      .map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} {!d.isActive ? '(Inactive)' : ''}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="External Partners">
                    {activeDesigners
                      .filter((d) => d.type === 'External Designer')
                      .map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} {!d.isActive ? '(Inactive)' : ''}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  Production Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5738]"
                >
                  <option value="ALL">All Statuses</option>
                  {WORK_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5738]"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="Urgent">🔥 Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5738]"
                >
                  <option value="ALL">All Payments</option>
                  <option value="TO_GET">🚨 To Get ({financialSummaries.toGetCount} Pending)</option>
                  <option value="Not Paid">🔴 Not Paid (₹0 Received)</option>
                  <option value="Partially Paid">🟡 Partially Paid</option>
                  <option value="Paid">🟢 Paid (Settled)</option>
                  <option value="Overpaid">🔵 Overpaid</option>
                </select>
              </div>
            </div>

            {/* Clear filters banner if active */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                <span className="text-zinc-500">
                  Showing <strong className="text-zinc-900">{filteredWorks.length}</strong> of{' '}
                  {localWorks.length} local works
                </span>
                <button
                  onClick={handleClearFilters}
                  className="text-[#FF5738] font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* 7. LOCAL WORKS DATA TABLE */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Work / ID</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Work Type</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Assigned Designer</th>
                    <th className="py-3 px-3">Deadline</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {filteredWorks.length > 0 ? (
                    filteredWorks.map((work) => {
                      const statusCfg = getStatusConfig(work.status);
                      const deadlineResult = calculateWorkDeadline(
                        work.deadlineDate,
                        work.deadlineTime
                      );
                      const clientWaUrl = buildWhatsAppUrl(
                        work.clientWhatsApp || work.clientPhone,
                        `Hello ${work.clientName}, regarding your work order *${work.title}* (${work.workId || work.id}) with Gizmo Design:`
                      );

                      return (
                        <tr
                          key={work.id}
                          className="hover:bg-zinc-50/80 transition group cursor-pointer"
                          onClick={() => handleOpenDetail(work)}
                        >
                          {/* Column 1: Work ID & Title */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-black text-zinc-600 px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 shrink-0">
                                {work.workId || work.id}
                              </span>
                              {work.priority === 'Urgent' && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickPriorityToggle(work);
                                  }}
                                  className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                                  title="Urgent Priority"
                                >
                                  <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-zinc-950 mt-1 max-w-xs truncate text-xs">
                              {work.title}
                            </div>
                            {work.revisionCount && work.revisionCount > 0 ? (
                              <div className="text-[10px] text-purple-700 font-bold flex items-center gap-1 mt-0.5">
                                <RotateCcw className="w-3 h-3" />
                                <span>{work.revisionCount} revision(s)</span>
                              </div>
                            ) : null}
                          </td>

                          {/* Column 2: Client */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-zinc-900 text-xs truncate max-w-[150px]">
                              {work.clientName}
                            </div>
                            {work.clientOrg && (
                              <div className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                                {work.clientOrg}
                              </div>
                            )}
                            {clientWaUrl && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="mt-0.5"
                              >
                                <a
                                  href={clientWaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold hover:underline"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            )}
                          </td>

                          {/* Column 3: Work Type (Badge) */}
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <WorkTypeBadge
                              workType={work.workType}
                              otherDetail={work.otherWorkTypeDetail}
                            />
                          </td>

                          {/* Column 4: Design Work Category */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md font-bold text-[11px] border border-zinc-200 whitespace-nowrap">
                              {work.category || work.workType || 'General'}
                            </span>
                          </td>

                          {/* Column 5: Assigned Designer with Inline QuickAssign Dropdown */}
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <QuickAssignDropdown
                              currentDesigner={work.assignedTo}
                              supportingDesigners={work.supportingDesigners}
                              designers={activeDesigners}
                              onAssign={(newDesigner) =>
                                handleQuickAssignDesigner(work.id, newDesigner)
                              }
                              onAddCustomDesigner={handleAddDesignerDirect}
                              compact={true}
                            />
                          </td>

                          {/* Column 6: Deadline Countdown */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${deadlineResult.badgeClass}`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{deadlineResult.relativeText}</span>
                            </span>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {work.deadlineDate} · {work.deadlineTime || '18:00'}
                            </div>
                          </td>

                          {/* Column 7: Production Status with Quick Status Selector */}
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={work.status}
                              onChange={(e) =>
                                handleQuickStatusChange(work, e.target.value as LocalWorkStatus)
                              }
                              className={`px-2 py-1 rounded-lg text-xs font-bold border transition outline-none cursor-pointer ${statusCfg.badgeBg} ${statusCfg.textColor} ${statusCfg.borderColor}`}
                            >
                              {WORK_STATUSES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.symbol} {s.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Column 8: Payment (Total, Got, To Get & Quick Status) */}
                          <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {(() => {
                              const fin = getWorkFinancials(work);
                              const badgeStyle = getPaymentStatusBadgeStyle(fin.paymentStatus);
                              return (
                                <div className="space-y-1 min-w-[130px]">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="font-mono text-xs font-black text-zinc-950">
                                      {formatINR(fin.totalAmount)}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                                    >
                                      {fin.paymentStatus}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                                    <span className="text-emerald-700 font-semibold" title="Amount Got">
                                      Got: {formatINR(fin.amountGot)}
                                    </span>
                                    <span className="text-zinc-300">·</span>
                                    <span
                                      className={`font-semibold ${
                                        fin.amountToGet > 0 ? 'text-rose-600 font-bold' : 'text-zinc-400'
                                      }`}
                                      title="Amount To Get"
                                    >
                                      To Get: {formatINR(fin.amountToGet)}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleOpenPaymentModal(work)}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 transition cursor-pointer"
                                  >
                                    <IndianRupee className="w-3 h-3 text-zinc-500" />
                                    <span>Record Payment</span>
                                  </button>
                                </div>
                              );
                            })()}
                          </td>

                          {/* Column 9: Actions */}
                          <td
                            className="py-3 px-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenPaymentModal(work)}
                                className="p-1.5 text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                title="Record Payment"
                              >
                                <IndianRupee className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDetail(work)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition"
                                title="View Details"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditWork(work)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition"
                                title="Edit Work"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDuplicateLocalWork(work)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition"
                                title="Duplicate Work"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onCreateInvoiceForWork(work)}
                                className="p-1.5 text-zinc-400 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition"
                                title="Generate Invoice"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete local work order "${work.title}"?`)) {
                                    onDeleteLocalWork(work.id);
                                  }
                                }}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Work"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-400">
                        <FolderKanban className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                        <p className="font-bold text-zinc-700 text-sm">No local works found</p>
                        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                          {hasActiveFilters
                            ? 'No works match the selected filters or search keyword. Try clearing some filters.'
                            : 'Get started by creating your first graphic or motion design work order.'}
                        </p>
                        {hasActiveFilters ? (
                          <button
                            onClick={handleClearFilters}
                            className="mt-3 px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition"
                          >
                            Reset Filters
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingWork(null);
                              setShowAddModal(true);
                            }}
                            className="mt-3 px-4 py-2 bg-[#FF5738] hover:bg-[#ff4220] text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create First Work</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL 1: NEW / EDIT LOCAL WORK MODAL */}
      <NewLocalWorkModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingWork(null);
        }}
        onSave={handleSaveWork}
        clients={clients}
        categories={activeCategories}
        designers={activeDesigners}
        workTypes={activeWorkTypes}
        existingWorks={localWorks}
        editingWork={editingWork}
        onOpenManageCategories={() => {
          setShowAddModal(false);
          setActiveTab('categories');
        }}
        onAddCustomDesigner={handleAddDesignerDirect}
      />

      {/* MODAL 2: LOCAL WORK DETAIL MODAL */}
      <LocalWorkDetailModal
        work={selectedWork}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedWork(null);
        }}
        onEdit={handleEditWork}
        onDuplicate={onDuplicateLocalWork}
        onDelete={(id) => {
          onDeleteLocalWork(id);
          setShowDetailModal(false);
        }}
        onUpdateStatus={(id, newStatus) => {
          const w = localWorks.find((item) => item.id === id);
          if (w) handleQuickStatusChange(w, newStatus);
        }}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
        onOpenPaymentModal={(work) => handleOpenPaymentModal(work)}
        onAddRevision={handleAddRevision}
        onAddAttachment={handleAddAttachment}
        onCreateInvoice={(work) => {
          setShowDetailModal(false);
          onCreateInvoiceForWork(work);
        }}
        designers={activeDesigners}
        onQuickAssignDesigner={handleQuickAssignDesigner}
        onAddCustomDesigner={handleAddDesignerDirect}
      />

      {/* MODAL 3: IMPORT GOOGLE SHEETS / EXCEL CSV MODAL */}
      <ImportWorksModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={onImportWorks}
        existingWorks={localWorks}
      />

      {/* MODAL 4: QUICK PAYMENT MODAL (TO GET / GOT TRACKING) */}
      {showPaymentModal && paymentWork && (
        <QuickPaymentModal
          isOpen={showPaymentModal}
          work={paymentWork}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentWork(null);
          }}
          onSavePayment={handleSavePayment}
        />
      )}
    </div>
  );
};
