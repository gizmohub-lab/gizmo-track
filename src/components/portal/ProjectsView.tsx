import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  ArrowUpRight,
  FileText,
  Calendar,
  Layers,
  X,
  CheckCircle2,
  Sliders,
  Search,
  Filter,
  LayoutGrid,
  List,
  DollarSign,
  Clock,
  User,
  Building,
  Tag,
  Flag,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Receipt,
  Check,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Users,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Info,
  MoreVertical,
  RotateCcw,
} from 'lucide-react';
import {
  Project,
  Invoice,
  Client,
  CustomDesigner,
  ProjectTypeItem,
  ProjectPriorityItem,
  ProjectStatusItem,
  DeliverableTypeItem,
  ProjectCustomFieldDef,
  ProjectTemplate,
  InvoiceSettings,
  DesignerPaymentRecord,
  Note,
  AppRoute,
} from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import {
  getProjectProgress,
  getProjectFinancials,
  getProjectDeadlineStatus,
  formatSystemTimestamp,
  generateNextProjectCode,
  getProjectsControlCenterSummary,
  getDesignerWorkloadAndPayments,
  getClientHubSummary,
  DesignerWorkloadItem,
} from '../../utils/projectUtils';
import { ProjectCreateEditModal } from './projects/ProjectCreateEditModal';
import { ProjectWorkspaceModal } from './projects/ProjectWorkspaceModal';
import { DeleteProjectModal } from './projects/DeleteProjectModal';
import { ProjectTypesSettingsModal } from './projects/ProjectTypesSettingsModal';
import { PayDesignerModal } from './projects/PayDesignerModal';
import { DesignerWorkspaceModal } from './projects/DesignerWorkspaceModal';
import { DesignerWorkloadView } from './projects/DesignerWorkloadView';
import { ClientWorkspaceModal } from './projects/ClientWorkspaceModal';
import { ClientsHubView } from './projects/ClientsHubView';

interface ProjectsViewProps {
  projects: Project[];
  invoices: Invoice[];
  clients: Client[];
  designers: CustomDesigner[];
  onUpdateDesigners?: (designers: CustomDesigner[]) => void;
  settings?: InvoiceSettings;
  localWorks?: any[];
  projectTypes: ProjectTypeItem[];
  onSaveProjectTypes: (types: ProjectTypeItem[]) => void;
  categories?: string[];
  onSaveCategories?: (categories: string[]) => void;
  priorities: ProjectPriorityItem[];
  onSavePriorities: (items: ProjectPriorityItem[]) => void;
  projectStatuses?: ProjectStatusItem[];
  onSaveProjectStatuses?: (statuses: ProjectStatusItem[]) => void;
  deliverableTypes: DeliverableTypeItem[];
  onSaveDeliverableTypes: (items: DeliverableTypeItem[]) => void;
  customFields: ProjectCustomFieldDef[];
  onSaveCustomFields: (fields: ProjectCustomFieldDef[]) => void;
  templates: ProjectTemplate[];
  onSaveTemplates: (templates: ProjectTemplate[]) => void;
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateInvoiceForProject: (project: Project) => void;
  onCreateInvoice?: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onSaveInvoiceDirectly?: (invoice: Invoice, openPreview?: boolean) => void;
  onOpenInFullEditor?: (invoice: Invoice) => void;
  onRecordInvoicePayment?: (invoice: Invoice) => void;
  onRecordDesignerPayment?: (payment: {
    designerId: string;
    designerName: string;
    workType: 'Project' | 'Local Work' | 'Custom';
    workId: string;
    workTitle: string;
    amount: number;
    date: string;
    method: string;
    referenceNumber?: string;
    notes?: string;
  }) => void;
  onAddClient: (client: Client) => void;
  onOpenAddClientModal?: () => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onOpenDesignerModal?: () => void;
  onEditDesignerProfile?: (designer: CustomDesigner) => void;
  initialActiveProjectId?: string | null;
  onClearInitialActiveProject?: () => void;
  notes?: Note[];
  noteCategories?: string[];
  onSaveNote?: (note: Partial<Note> & { id: string }) => void;
  onDeleteNote?: (note: Note) => void;
  onTogglePinNote?: (id: string, e?: React.MouseEvent) => void;
  onToggleCheckItemNote?: (noteId: string, itemId: string, completed: boolean) => void;
  onNavigateRoute?: (route: AppRoute, targetId?: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  invoices,
  clients,
  designers,
  onUpdateDesigners,
  settings,
  localWorks = [],
  projectTypes,
  onSaveProjectTypes,
  categories,
  onSaveCategories,
  priorities,
  onSavePriorities,
  projectStatuses,
  onSaveProjectStatuses,
  notes = [],
  noteCategories = [],
  onSaveNote,
  onDeleteNote,
  onTogglePinNote,
  onToggleCheckItemNote,
  onNavigateRoute,
  deliverableTypes,
  onSaveDeliverableTypes,
  customFields,
  onSaveCustomFields,
  templates,
  onSaveTemplates,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onCreateInvoiceForProject,
  onCreateInvoice,
  onViewInvoice,
  onSaveInvoiceDirectly,
  onOpenInFullEditor,
  onRecordInvoicePayment,
  onRecordDesignerPayment,
  onAddClient,
  onOpenAddClientModal,
  onEditClient,
  onDeleteClient,
  onOpenDesignerModal,
  onEditDesignerProfile,
  initialActiveProjectId,
  onClearInitialActiveProject,
}) => {
  // Navigation Sub-View State: 'overview' | 'designers-workload' | 'clients'
  const [subView, setSubView] = useState<'overview' | 'designers-workload' | 'clients'>('overview');

  // Modal Visibility States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [prefilledClientForProject, setPrefilledClientForProject] = useState<Client | null>(null);
  const [activeWorkspaceProject, setActiveWorkspaceProject] = useState<Project | null>(() => {
    if (initialActiveProjectId) {
      return projects.find((p) => p.id === initialActiveProjectId) || null;
    }
    return null;
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Project completion & reopen states
  const [projectToComplete, setProjectToComplete] = useState<Project | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeliverableIncompleteModal, setShowDeliverableIncompleteModal] = useState(false);
  const [projectToReopen, setProjectToReopen] = useState<Project | null>(null);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [activeDropdownProjectId, setActiveDropdownProjectId] = useState<string | null>(null);

  const handleExecuteMarkComplete = (project: Project, forceAnyway: boolean = false) => {
    const progress = getProjectProgress(project);
    const hasIncomplete = progress.totalCompleted < progress.totalDeliverables;

    if (hasIncomplete && !forceAnyway) {
      setProjectToComplete(project);
      setShowDeliverableIncompleteModal(true);
      return;
    }

    const nowIso = formatSystemTimestamp();
    const updated: Project = {
      ...project,
      status: 'Completed',
      completedAt: nowIso,
      completedBy: 'Admin',
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          action: 'Project Completed by Admin',
          note: `Marked completed. Deliverables: ${progress.totalCompleted}/${progress.totalDeliverables}`,
        },
        ...(project.history || []),
      ],
    };
    onUpdateProject(updated);
    setToastMessage(`Project "${project.title}" marked as completed.`);
    setTimeout(() => setToastMessage(null), 4000);
    setProjectToComplete(null);
    setShowCompleteModal(false);
    setShowDeliverableIncompleteModal(false);
  };

  const handleExecuteReopenProject = (project: Project) => {
    const nowIso = formatSystemTimestamp();
    const updated: Project = {
      ...project,
      status: 'In Progress',
      reopenedAt: nowIso,
      reopenedBy: 'Admin',
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          action: 'Project Reopened by Admin',
          note: 'Status restored to In Progress',
        },
        ...(project.history || []),
      ],
    };
    onUpdateProject(updated);
    setToastMessage(`Project "${project.title}" reopened.`);
    setTimeout(() => setToastMessage(null), 4000);
    setProjectToReopen(null);
    setShowReopenModal(false);
  };

  // Pay Designer Modal & Details Modal
  const [showPayDesignerModal, setShowPayDesignerModal] = useState(false);
  const [payModalDesignerId, setPayModalDesignerId] = useState<string | undefined>(undefined);
  const [payModalWorkId, setPayModalWorkId] = useState<string | undefined>(undefined);

  // Dedicated Workspace Modals
  const [selectedDesignerForWorkspace, setSelectedDesignerForWorkspace] = useState<DesignerWorkloadItem | null>(null);
  const [selectedClientForWorkspace, setSelectedClientForWorkspace] = useState<Client | null>(null);

  // View switch & filter states for overview
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDesigner, setFilterDesigner] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');

  // Sync initialActiveProjectId if it changes
  React.useEffect(() => {
    if (initialActiveProjectId) {
      const match = projects.find((p) => p.id === initialActiveProjectId);
      if (match) {
        setActiveWorkspaceProject(match);
      }
      if (onClearInitialActiveProject) {
        onClearInitialActiveProject();
      }
    }
  }, [initialActiveProjectId, projects, onClearInitialActiveProject]);

  // Derived Metrics
  const summary = useMemo(() => {
    return getProjectsControlCenterSummary(projects);
  }, [projects]);

  const designerWorkloadList = useMemo(() => {
    return getDesignerWorkloadAndPayments(projects, localWorks, designers);
  }, [projects, localWorks, designers]);

  const clientHubSummary = useMemo(() => {
    return getClientHubSummary(clients, projects, invoices);
  }, [clients, projects, invoices]);

  // Upcoming deadlines list
  const upcomingDeadlines = useMemo(() => {
    return projects
      .filter((p) => p.hasDeadline && p.deadlineDate && p.status !== 'Completed')
      .map((p) => {
        const deadlineStatus = getProjectDeadlineStatus(p);
        const progress = getProjectProgress(p);
        return {
          project: p,
          deadlineStatus,
          progress,
        };
      })
      .sort((a, b) => {
        const dateA = a.project.deadlineDate || '9999-99-99';
        const dateB = b.project.deadlineDate || '9999-99-99';
        return dateA.localeCompare(dateB);
      })
      .slice(0, 4);
  }, [projects]);

  // Filtered projects for the overview table/grid
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCode = (p.projectCode || '').toLowerCase().includes(q);
        const matchesClient = (p.clientName || '').toLowerCase().includes(q);
        const matchesDesigner = (p.assignedDesignerName || '').toLowerCase().includes(q);
        const matchesType = (p.projectType || p.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesClient && !matchesDesigner && !matchesType) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all') {
        const pType = p.projectType || p.category || '';
        if (pType !== filterType) return false;
      }

      // Status filter
      if (filterStatus !== 'all') {
        if (p.status !== filterStatus) return false;
      }

      // Priority filter
      if (filterPriority !== 'all') {
        if (p.priority !== filterPriority) return false;
      }

      // Designer filter
      if (filterDesigner !== 'all') {
        if (p.assignedDesignerId !== filterDesigner && p.assignedDesignerName !== filterDesigner) {
          return false;
        }
      }

      // Payment Status filter
      if (filterPaymentStatus !== 'all') {
        const fin = getProjectFinancials(p);
        if (fin.paymentStatus !== filterPaymentStatus) return false;
      }

      return true;
    });
  }, [projects, searchQuery, filterType, filterStatus, filterPriority, filterDesigner, filterPaymentStatus]);

  // Handle designer payment action
  const handleOpenPayDesigner = (designerId?: string, workId?: string) => {
    setPayModalDesignerId(designerId);
    setPayModalWorkId(workId);
    setShowPayDesignerModal(true);
  };

  const handleSaveDesignerPayment = (payment: {
    designerId: string;
    designerName: string;
    workType: 'Project' | 'Local Work' | 'Custom';
    workId: string;
    workTitle: string;
    amount: number;
    date: string;
    method: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    if (onRecordDesignerPayment) {
      onRecordDesignerPayment(payment);
    } else {
      // Fallback update directly to project state if internal
      if (payment.workType === 'Project' && payment.workId) {
        const targetProj = projects.find((p) => p.id === payment.workId);
        if (targetProj) {
          const currentPaid = Number(targetProj.designerAmountPaid || 0);
          const newPaid = currentPaid + payment.amount;
          const fee = Number(targetProj.designerFee || Math.round((targetProj.totalAmount || 0) * 0.3));
          const newPending = Math.max(0, fee - newPaid);
          const newStatus = newPending === 0 && fee > 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Not Paid';

          const updatedProject: Project = {
            ...targetProj,
            designerAmountPaid: newPaid,
            designerAmountPending: newPending,
            designerPaymentStatus: newStatus as any,
            designerPayments: [
              ...(targetProj.designerPayments || []),
              {
                id: `despay-${Date.now()}`,
                designerId: payment.designerId,
                designerName: payment.designerName,
                workType: 'Project',
                workId: targetProj.id,
                workTitle: targetProj.title,
                date: payment.date,
                amount: payment.amount,
                method: payment.method,
                referenceNumber: payment.referenceNumber,
                notes: payment.notes,
                recordedAt: formatSystemTimestamp(),
              },
            ],
            history: [
              ...(targetProj.history || []),
              {
                id: `hist-${Date.now()}`,
                timestamp: formatSystemTimestamp(),
                action: `Paid Designer ₹${payment.amount.toLocaleString('en-IN')}`,
                note: `Disbursed to ${payment.designerName} via ${payment.method}${payment.referenceNumber ? ` (Ref: ${payment.referenceNumber})` : ''}`,
              },
            ],
          };

          onUpdateProject(updatedProject);
        }
      }
    }
  };

  const handleAddProjectType = (name: string, description?: string) => {
    const newItem: ProjectTypeItem = {
      id: `pt-${Date.now()}`,
      name,
      description,
      isActive: true,
      displayOrder: projectTypes.length + 1,
    };
    onSaveProjectTypes([...projectTypes, newItem]);
  };

  // Client Shortcut Handlers
  const handleCreateProjectForClient = (client: Client) => {
    setPrefilledClientForProject(client);
    setProjectToEdit(null);
    setShowCreateModal(true);
  };

  const handleCreateInvoiceForClient = (client: Client) => {
    const clientProjects = projects.filter(
      (p) => p.clientId === client.id || (p.clientName && p.clientName.trim().toLowerCase() === client.name.trim().toLowerCase())
    );
    if (clientProjects.length > 0) {
      onCreateInvoiceForProject(clientProjects[0]);
    } else if (onCreateInvoice) {
      onCreateInvoice();
    }
  };

  return (
    <div id="project-control-center-root" className="min-h-screen bg-zinc-50/50 pb-16 text-zinc-900">
      {/* RENDER SUB-VIEWS IF ACTIVE */}
      {subView === 'designers-workload' ? (
        <div className="mx-auto max-w-7xl px-6 pt-6 sm:px-8">
          <DesignerWorkloadView
            designerItems={designerWorkloadList}
            allProjects={projects}
            allLocalWorks={localWorks}
            allDesigners={designers}
            onBackToOverview={() => setSubView('overview')}
            onOpenDesignerWorkspace={(item) => setSelectedDesignerForWorkspace(item)}
            onOpenPayModal={(dId) => handleOpenPayDesigner(dId)}
            onOpenDesignerModal={onOpenDesignerModal}
            onUpdateDesigner={(updated) => {
              if (onUpdateDesigners) {
                onUpdateDesigners(designers.map((d) => (d.id === updated.id ? updated : d)));
              }
            }}
            onDeleteDesigner={(designerId) => {
              if (onUpdateDesigners) {
                onUpdateDesigners(designers.filter((d) => d.id !== designerId));
              }
            }}
            onUpdateDesigners={onUpdateDesigners}
          />
        </div>
      ) : subView === 'clients' ? (
        <div className="mx-auto max-w-7xl px-6 pt-6 sm:px-8">
          <ClientsHubView
            clients={clients}
            projects={projects}
            invoices={invoices}
            onBackToOverview={() => setSubView('overview')}
            onOpenClientWorkspace={(c) => setSelectedClientForWorkspace(c)}
            onCreateProjectForClient={handleCreateProjectForClient}
            onCreateInvoiceForClient={handleCreateInvoiceForClient}
            onOpenAddClientModal={onOpenAddClientModal}
            onAddClient={onAddClient}
            onEditClient={onEditClient}
            onDeleteClient={onDeleteClient}
          />
        </div>
      ) : (
        /* MAIN PROJECTS CONTROL CENTER OVERVIEW */
        <>
          {/* 1. HEADER */}
          <div className="border-b border-zinc-200/80 bg-white px-6 py-6 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-2xs">
                      <FolderKanban className="h-4 w-4" />
                    </span>
                    <h1 className="text-xl font-black tracking-tight text-zinc-900 sm:text-2xl">
                      PROJECTS
                    </h1>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 border border-zinc-200">
                      Control Center
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 max-w-2xl">
                    Manage projects, designers, deliverables, deadlines and payments.
                  </p>
                </div>

                {/* Top Right Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    id="btn-projects-pay-designer"
                    onClick={() => handleOpenPayDesigner()}
                    className="rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-800 px-3.5 py-2 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <DollarSign className="h-3.5 w-3.5 text-orange-600" />
                    <span>Pay Designer</span>
                  </button>

                  <button
                    type="button"
                    id="btn-projects-create-invoice"
                    onClick={() => {
                      if (onCreateInvoice) {
                        onCreateInvoice();
                      } else if (projects.length > 0) {
                        onCreateInvoiceForProject(projects[0]);
                      }
                    }}
                    className="rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 px-3.5 py-2 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <Receipt className="h-3.5 w-3.5 text-zinc-600" />
                    <span>+ Create Invoice</span>
                  </button>

                  <button
                    type="button"
                    id="btn-projects-create-project"
                    onClick={() => {
                      setPrefilledClientForProject(null);
                      setProjectToEdit(null);
                      setShowCreateModal(true);
                    }}
                    className="rounded-xl bg-zinc-900 hover:bg-black text-white px-4 py-2 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4 text-orange-400" />
                    <span>+ Create Project</span>
                  </button>

                  <button
                    type="button"
                    id="btn-projects-settings"
                    onClick={() => setShowSettingsModal(true)}
                    title="Configure Project Types, Priorities & Fields"
                    className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-2xs"
                  >
                    <Sliders className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 pt-6 sm:px-8 space-y-6">
            {/* 2. SUMMARY CARDS */}
            <div id="projects-summary-cards" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* TOTAL PROJECTS */}
              <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Total Projects
                </div>
                <div className="text-xl font-extrabold text-zinc-900 mt-1">
                  {summary.totalProjects}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {summary.completedProjects} Completed
                </div>
              </div>

              {/* ACTIVE */}
              <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
                <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  Active
                </div>
                <div className="text-xl font-extrabold text-blue-700 mt-1">
                  {summary.activeProjects}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  In progress
                </div>
              </div>

              {/* DUE SOON */}
              <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
                <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
                  Due Soon
                </div>
                <div className="text-xl font-extrabold text-amber-700 mt-1">
                  {summary.dueSoonProjects}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Approaching deadline
                </div>
              </div>

              {/* OVERDUE */}
              <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
                <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
                  Overdue
                </div>
                <div className="text-xl font-extrabold text-rose-700 mt-1">
                  {summary.overdueProjects}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Needs attention
                </div>
              </div>

              {/* TOTAL VALUE */}
              <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 shadow-2xs">
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Total Value
                </div>
                <div className="text-base font-extrabold text-zinc-900 mt-1 truncate">
                  {formatINR(summary.totalValue)}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Client pipeline
                </div>
              </div>

              {/* TO GET */}
              <div className="rounded-xl bg-white border border-rose-200/60 p-3.5 bg-rose-50/20 shadow-2xs">
                <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                  To Get (Client)
                </div>
                <div className="text-base font-extrabold text-rose-700 mt-1 truncate">
                  {formatINR(summary.amountToGet)}
                </div>
                <div className="text-[10px] text-rose-600/70 mt-0.5">
                  Pending receivable
                </div>
              </div>

              {/* GOT */}
              <div className="rounded-xl bg-white border border-emerald-200/60 p-3.5 bg-emerald-50/20 shadow-2xs">
                <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                  Got (Client)
                </div>
                <div className="text-base font-extrabold text-emerald-700 mt-1 truncate">
                  {formatINR(summary.amountGot)}
                </div>
                <div className="text-[10px] text-emerald-600/70 mt-0.5">
                  Collected funds
                </div>
              </div>
            </div>

            {/* 3. TWO DEDICATED NAVIGATION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CARD 1: DESIGNERS WORKLOAD */}
              <div
                id="nav-card-designers-workload"
                onClick={() => setSubView('designers-workload')}
                className="group relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-orange-300 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute right-0 top-0 h-28 w-28 bg-orange-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20 shadow-2xs group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-zinc-900 tracking-tight flex items-center gap-2">
                          <span>DESIGNERS WORKLOAD</span>
                          <span className="rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5">
                            {designerWorkloadList.length} Staff &amp; Freelancers
                          </span>
                        </h2>
                        <p className="text-xs text-zinc-500">
                          Workload distribution, assigned works and designer payments
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Live Stats Row */}
                  <div className="grid grid-cols-4 gap-2 mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Designers
                      </span>
                      <span className="text-sm font-extrabold text-zinc-900 mt-0.5 block">
                        {designerWorkloadList.length}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Active Works
                      </span>
                      <span className="text-sm font-extrabold text-zinc-900 mt-0.5 block">
                        {summary.activeProjects}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                        Pending
                      </span>
                      <span className="text-sm font-extrabold text-blue-700 mt-0.5 block">
                        {designerWorkloadList.reduce((sum, d) => sum + d.pendingWorksCount, 0)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                        Pending Pay
                      </span>
                      <span className="text-sm font-extrabold font-mono text-rose-700 mt-0.5 block truncate">
                        {formatINR(summary.designerPendingToPay)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">
                    Strictly isolated designer fees vs client invoices
                  </span>
                  <span className="font-bold text-orange-600 group-hover:underline flex items-center gap-1">
                    <span>View Designers Workload</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* CARD 2: CLIENTS */}
              <div
                id="nav-card-clients"
                onClick={() => setSubView('clients')}
                className="group relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute right-0 top-0 h-28 w-28 bg-blue-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-zinc-900 tracking-tight flex items-center gap-2">
                          <span>CLIENTS</span>
                          <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                            {clientHubSummary.totalClients} Accounts
                          </span>
                        </h2>
                        <p className="text-xs text-zinc-500">
                          Client accounts, project pipelines, invoices &amp; receivables
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Live Stats Row */}
                  <div className="grid grid-cols-4 gap-2 mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Clients
                      </span>
                      <span className="text-sm font-extrabold text-zinc-900 mt-0.5 block">
                        {clientHubSummary.totalClients}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Active Projs
                      </span>
                      <span className="text-sm font-extrabold text-zinc-900 mt-0.5 block">
                        {clientHubSummary.activeClientsCount}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                        Got (Client)
                      </span>
                      <span className="text-sm font-extrabold font-mono text-emerald-700 mt-0.5 block truncate">
                        {formatINR(clientHubSummary.totalAmountGot)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                        To Get
                      </span>
                      <span className="text-sm font-extrabold font-mono text-rose-700 mt-0.5 block truncate">
                        {formatINR(clientHubSummary.totalAmountToGet)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">
                    Direct WhatsApp links, project history and tax bills
                  </span>
                  <span className="font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                    <span>View Clients Hub</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* 4. UPCOMING PROJECT DEADLINES (If any pending) */}
            {upcomingDeadlines.length > 0 && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Upcoming Project Deadlines</span>
                  </h2>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Next critical delivery milestones
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {upcomingDeadlines.map(({ project, deadlineStatus, progress }) => (
                    <div
                      key={project.id}
                      onClick={() => setActiveWorkspaceProject(project)}
                      className="rounded-xl border border-zinc-200/80 p-3.5 hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer bg-zinc-50/40 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-zinc-400">
                              {project.projectCode || 'PROJ'}
                            </span>
                            <h3 className="font-bold text-zinc-900 text-xs line-clamp-1">
                              {project.title}
                            </h3>
                            <p className="text-[11px] text-zinc-500">{project.clientName}</p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              deadlineStatus.status === 'overdue'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : deadlineStatus.status === 'due-soon'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {deadlineStatus.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-zinc-600 mb-1.5">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-zinc-400" />
                            <span>{project.customDisplayName || project.assignedDesignerName}</span>
                          </span>
                          <span className="font-bold text-zinc-900">
                            {progress.percentage}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className={`h-full transition-all ${
                              progress.percentage === 100
                                ? 'bg-emerald-500'
                                : deadlineStatus.status === 'overdue'
                                ? 'bg-rose-500'
                                : 'bg-orange-500'
                            }`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. MAIN PROJECTS TABLE & SEARCH/FILTER CONTROL BAR */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                    Recent &amp; Active Projects
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Track client deliverables, invoice payments and production milestones.
                  </p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    id="input-projects-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects by name, code, client or designer..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Status Filter */}
                  <select
                    id="select-filter-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-2xs outline-none focus:border-zinc-400"
                  >
                    <option value="all">All Statuses ({projects.length})</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>

                  {/* Designer Filter */}
                  <select
                    id="select-filter-designer"
                    value={filterDesigner}
                    onChange={(e) => setFilterDesigner(e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-2xs outline-none focus:border-zinc-400"
                  >
                    <option value="all">All Designers</option>
                    {designers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  {/* Project Type Filter */}
                  <select
                    id="select-filter-type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-2xs outline-none focus:border-zinc-400"
                  >
                    <option value="all">All Types</option>
                    {projectTypes.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  {/* Client Payment Filter */}
                  <select
                    id="select-filter-payment"
                    value={filterPaymentStatus}
                    onChange={(e) => setFilterPaymentStatus(e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-2xs outline-none focus:border-zinc-400"
                  >
                    <option value="all">Client Payment: All</option>
                    <option value="Paid">Client Paid</option>
                    <option value="Partially Paid">Client Partial</option>
                    <option value="Not Paid">Client Not Paid</option>
                  </select>

                  {/* View Switch */}
                  <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`rounded-lg p-1.5 transition-colors ${
                        viewMode === 'table' ? 'bg-white shadow-2xs text-zinc-900' : 'text-zinc-500'
                      }`}
                      title="Table View"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`rounded-lg p-1.5 transition-colors ${
                        viewMode === 'grid' ? 'bg-white shadow-2xs text-zinc-900' : 'text-zinc-500'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Project List / Table */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl">
                  <FolderKanban className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-zinc-700">No projects found</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    {searchQuery || filterStatus !== 'all' || filterDesigner !== 'all'
                      ? 'Try adjusting your search filters to find what you are looking for.'
                      : 'Get started by creating your first project in the workspace.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPrefilledClientForProject(null);
                      setProjectToEdit(null);
                      setShowCreateModal(true);
                    }}
                    className="mt-4 rounded-xl bg-zinc-900 hover:bg-black text-white px-4 py-2 text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4 text-orange-400" />
                    <span>Create New Project</span>
                  </button>
                </div>
              ) : viewMode === 'table' ? (
                <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                        <th className="py-3 px-3.5">Project</th>
                        <th className="py-3 px-3">Client</th>
                        <th className="py-3 px-3">Designer</th>
                        <th className="py-3 px-3">Deadline</th>
                        <th className="py-3 px-3">Progress</th>
                        <th className="py-3 px-3 text-right">Client Total</th>
                        <th className="py-3 px-3 text-right">Client Got</th>
                        <th className="py-3 px-3 text-right">Client To Get</th>
                        <th className="py-3 px-3 text-right">Designer Fee</th>
                        <th className="py-3 px-3 text-right">Designer Paid</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                      {filteredProjects.map((project) => {
                        const fin = getProjectFinancials(project);
                        const progress = getProjectProgress(project);
                        const deadlineStatus = getProjectDeadlineStatus(project);
                        const desFee = project.designerFee !== undefined ? Number(project.designerFee) : Math.round((project.totalAmount || 0) * 0.3);
                        const desPaid = Number(project.designerAmountPaid || 0);

                        return (
                          <tr
                            key={project.id}
                            className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                            onClick={() => setActiveWorkspaceProject(project)}
                          >
                            {/* Project Name & Code */}
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-zinc-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                      {project.title}
                                    </span>
                                    {project.projectCode && (
                                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                                        {project.projectCode}
                                      </span>
                                    )}
                                  </div>
                                  <span className="inline-block mt-0.5 rounded-sm bg-zinc-100 px-1.5 py-0.2 text-[10px] font-semibold text-zinc-600">
                                    {project.projectType || project.category || 'General'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Client */}
                            <td className="py-3 px-3">
                              <span className="font-semibold text-zinc-800 block line-clamp-1">
                                {project.clientName}
                              </span>
                              {project.clientBrand && (
                                <span className="text-[10px] text-zinc-400 block line-clamp-1">
                                  {project.clientBrand}
                                </span>
                              )}
                            </td>

                            {/* Designer */}
                            <td className="py-3 px-3">
                              <span className="font-medium text-zinc-800 block line-clamp-1">
                                {project.customDisplayName || project.assignedDesignerName}
                              </span>
                            </td>

                            {/* Deadline */}
                            <td className="py-3 px-3">
                              {project.hasDeadline && project.deadlineDate ? (
                                <div>
                                  <span className="text-[11px] font-mono text-zinc-700 block">
                                    {project.deadlineDate}
                                  </span>
                                  <span
                                    className={`inline-block text-[9px] font-bold uppercase ${
                                      deadlineStatus.urgency === 'OVERDUE'
                                        ? 'text-rose-600'
                                        : deadlineStatus.urgency === 'APPROACHING' || deadlineStatus.urgency === 'DUE_NOW' || deadlineStatus.urgency === 'URGENT'
                                        ? 'text-amber-600'
                                        : 'text-zinc-400'
                                    }`}
                                  >
                                    {deadlineStatus.label}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-zinc-400 font-medium">No Deadline</span>
                              )}
                            </td>

                            {/* Progress */}
                            <td className="py-3 px-3">
                              <div className="w-24">
                                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-700 mb-1">
                                  <span>{progress.totalCompleted}/{progress.totalDeliverables}</span>
                                  <span>{progress.percent}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      progress.percent === 100 ? 'bg-emerald-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${progress.percent}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Client Total */}
                            <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                              {formatINR(fin.totalAmount)}
                            </td>

                            {/* Client Got */}
                            <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                              {formatINR(fin.amountGot)}
                            </td>

                            {/* Client To Get */}
                            <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                              {formatINR(fin.amountToGet)}
                            </td>

                            {/* Designer Fee */}
                            <td className="py-3 px-3 text-right font-mono font-semibold text-zinc-700">
                              {formatINR(desFee)}
                            </td>

                            {/* Designer Paid */}
                            <td className="py-3 px-3 text-right font-mono font-semibold text-orange-700">
                              {formatINR(desPaid)}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  project.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : project.status === 'Review'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : project.status === 'On Hold'
                                    ? 'bg-zinc-100 text-zinc-600'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {project.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setActiveWorkspaceProject(project)}
                                  className="rounded-lg bg-zinc-900 hover:bg-black text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition-colors"
                                >
                                  Open
                                </button>

                                {/* Actions Dropdown (⋮) */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownProjectId(activeDropdownProjectId === project.id ? null : project.id);
                                    }}
                                    title="Actions"
                                    className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 p-1.5 text-[11px] transition-colors flex items-center justify-center"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </button>

                                  {activeDropdownProjectId === project.id && (
                                    <div className="absolute right-0 mt-1 w-48 rounded-2xl bg-white border border-zinc-200 shadow-xl z-50 py-1.5 text-left text-xs font-medium text-zinc-700 animate-in fade-in duration-100">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveDropdownProjectId(null);
                                          setActiveWorkspaceProject(project);
                                        }}
                                        className="w-full px-3.5 py-2 hover:bg-zinc-50 flex items-center gap-2 text-zinc-800 font-semibold"
                                      >
                                        <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Open Project</span>
                                      </button>

                                      {project.status === 'Completed' ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveDropdownProjectId(null);
                                            setProjectToReopen(project);
                                            setShowReopenModal(true);
                                          }}
                                          className="w-full px-3.5 py-2 hover:bg-blue-50 text-blue-700 flex items-center gap-2 font-bold"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                                          <span>Reopen Project</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveDropdownProjectId(null);
                                            const progress = getProjectProgress(project);
                                            if (progress.totalCompleted < progress.totalDeliverables) {
                                              setProjectToComplete(project);
                                              setShowDeliverableIncompleteModal(true);
                                            } else {
                                              setProjectToComplete(project);
                                              setShowCompleteModal(true);
                                            }
                                          }}
                                          className="w-full px-3.5 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 font-bold"
                                        >
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Mark Complete ✓</span>
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveDropdownProjectId(null);
                                          onCreateInvoiceForProject(project);
                                        }}
                                        className="w-full px-3.5 py-2 hover:bg-zinc-50 flex items-center gap-2"
                                      >
                                        <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Create Invoice</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveDropdownProjectId(null);
                                          setPrefilledClientForProject(null);
                                          setProjectToEdit(project);
                                          setShowCreateModal(true);
                                        }}
                                        className="w-full px-3.5 py-2 hover:bg-zinc-50 flex items-center gap-2"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Edit Project</span>
                                      </button>

                                      <div className="my-1 border-t border-zinc-100" />

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveDropdownProjectId(null);
                                          if (window.confirm(`Delete project "${project.title}"?`)) {
                                            onDeleteProject(project.id);
                                          }
                                        }}
                                        className="w-full px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                        <span>Delete / Archive</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Grid View Mode */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => {
                    const fin = getProjectFinancials(project);
                    const progress = getProjectProgress(project);
                    const deadlineStatus = getProjectDeadlineStatus(project);
                    const desFee = project.designerFee !== undefined ? Number(project.designerFee) : Math.round((project.totalAmount || 0) * 0.3);
                    const desPaid = Number(project.designerAmountPaid || 0);

                    return (
                      <div
                        key={project.id}
                        onClick={() => setActiveWorkspaceProject(project)}
                        className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-2xs hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold text-zinc-400">
                                  {project.projectCode || 'PROJ'}
                                </span>
                                <span className="rounded-sm bg-zinc-100 px-1.5 py-0.2 text-[9px] font-bold text-zinc-600">
                                  {project.projectType || project.category || 'General'}
                                </span>
                              </div>
                              <h3 className="font-bold text-zinc-900 text-sm mt-1 line-clamp-1 hover:text-orange-600 transition-colors">
                                {project.title}
                              </h3>
                              <p className="text-xs text-zinc-500">{project.clientName}</p>
                            </div>

                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                project.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : project.status === 'Review'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>

                          {/* Financial Badges */}
                          <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 bg-zinc-50 rounded-lg text-center">
                            <div>
                              <div className="text-[9px] font-bold text-zinc-400 uppercase">Total</div>
                              <div className="text-xs font-mono font-bold text-zinc-800">
                                {formatINR(fin.totalAmount)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-emerald-600 uppercase">Got</div>
                              <div className="text-xs font-mono font-bold text-emerald-600">
                                {formatINR(fin.amountGot)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-rose-600 uppercase">To Get</div>
                              <div className="text-xs font-mono font-bold text-rose-600">
                                {formatINR(fin.amountToGet)}
                              </div>
                            </div>
                          </div>

                          {/* Designer strip */}
                          <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                            <span className="flex items-center gap-1 text-[11px]">
                              <User className="h-3 w-3 text-zinc-400" />
                              <span>{project.customDisplayName || project.assignedDesignerName}</span>
                            </span>
                            <span className="text-[11px] font-semibold text-orange-800">
                              Fee: {formatINR(desFee)} (Paid: {formatINR(desPaid)})
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-2.5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600 mb-1">
                              <span>Deliverables: {progress.totalCompleted}/{progress.totalDeliverables}</span>
                              <span>{progress.percent}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                              <div
                                className={`h-full ${
                                  progress.percent === 100 ? 'bg-emerald-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${progress.percent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {project.hasDeadline && project.deadlineDate ? `Due: ${project.deadlineDate}` : 'No deadline'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onCreateInvoiceForProject(project)}
                              className="rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2.5 py-1 text-xs font-semibold"
                            >
                              Invoice
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveWorkspaceProject(project)}
                              className="rounded-lg bg-zinc-900 hover:bg-black text-white px-3 py-1 text-xs font-bold"
                            >
                              Workspace
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ALL MODALS */}
      {/* 1. Project Create/Edit Modal */}
      {showCreateModal && (
        <ProjectCreateEditModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setProjectToEdit(null);
            setPrefilledClientForProject(null);
          }}
          projectToEdit={projectToEdit}
          existingProjects={projects}
          clients={clients}
          designers={designers}
          onUpdateDesigners={onUpdateDesigners}
          projectTypes={projectTypes}
          priorities={priorities}
          deliverableTypes={deliverableTypes}
          customFields={customFields}
          templates={templates}
          onSaveProject={(newOrUpdated) => {
            if (projectToEdit) {
              onUpdateProject(newOrUpdated);
            } else {
              onAddProject(newOrUpdated);
            }
            setShowCreateModal(false);
            setProjectToEdit(null);
            setPrefilledClientForProject(null);
          }}
          onAddClient={onAddClient}
          onAddProjectType={handleAddProjectType}
          onAddPriority={(name, level) => {
            onSavePriorities([...priorities, { id: `pri-${Date.now()}`, name, level, isActive: true }]);
          }}
          onAddDeliverableType={(name) => {
            onSaveDeliverableTypes([...deliverableTypes, { id: `dt-${Date.now()}`, name, isActive: true }]);
          }}
        />
      )}

      {/* 2. Project Workspace Modal */}
      {activeWorkspaceProject && (
        <ProjectWorkspaceModal
          isOpen={!!activeWorkspaceProject}
          onClose={() => setActiveWorkspaceProject(null)}
          project={activeWorkspaceProject}
          allProjects={projects}
          invoices={invoices}
          clients={clients}
          designers={designers}
          onUpdateDesigners={onUpdateDesigners}
          deliverableTypes={deliverableTypes}
          onAddDeliverableType={(name, desc) => {
            onSaveDeliverableTypes([
              ...deliverableTypes,
              { id: `dt-${Date.now()}`, name, description: desc, isActive: true },
            ]);
          }}
          customFields={customFields}
          settings={settings}
          notes={notes}
          noteCategories={noteCategories}
          onSaveNote={onSaveNote}
          onDeleteNote={onDeleteNote}
          onTogglePinNote={onTogglePinNote}
          onToggleCheckItemNote={onToggleCheckItemNote}
          onNavigateRoute={onNavigateRoute}
          onUpdateProject={(updated) => {
            onUpdateProject(updated);
            setActiveWorkspaceProject(updated);
          }}
          onDuplicateProject={(proj) => {
            const duplicated: Project = {
              ...proj,
              id: `proj-${Date.now()}`,
              projectCode: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
              name: `${proj.name} (Copy)`,
              title: `${proj.title} (Copy)`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            onAddProject(duplicated);
            setActiveWorkspaceProject(duplicated);
            setToastMessage('Project duplicated successfully!');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onSaveAsTemplate={(proj) => {
            const newTpl: ProjectTemplate = {
              id: `tpl-${Date.now()}`,
              name: `${proj.name} Template`,
              description: `Template generated from project ${proj.name}`,
              projectType: proj.projectType || 'General',
              deliverables: (proj.deliverables || []).map((d, index) => ({
                title: d.title,
                type: d.type || 'Deliverable',
                description: d.description,
                isRequired: d.isRequired ?? false,
                orderIndex: index + 1,
              })),
            };
            onSaveTemplates([...templates, newTpl]);
            setToastMessage('Project saved as template!');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onEditProjectDetails={(proj) => {
            setProjectToEdit(proj);
            setShowCreateModal(true);
          }}
          onGenerateInvoice={(proj) => {
            onCreateInvoiceForProject?.(proj);
          }}
          onCreateInvoiceForProject={onCreateInvoiceForProject}
          onViewInvoice={onViewInvoice}
          onSaveInvoiceDirectly={onSaveInvoiceDirectly}
          onOpenInFullEditor={onOpenInFullEditor}
          onRecordInvoicePayment={onRecordInvoicePayment}
          onDeleteProject={(projectId) => {
            onDeleteProject(projectId);
            setActiveWorkspaceProject(null);
            setToastMessage('Project deleted successfully.');
            setTimeout(() => setToastMessage(null), 4000);
          }}
          onEditProjectSettings={(proj) => {
            setProjectToEdit(proj);
            setShowCreateModal(true);
          }}
        />
      )}

      {/* DELETE PROJECT MODAL */}
      {showDeleteModal && projectToDelete && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProjectToDelete(null);
          }}
          project={projectToDelete}
          isAdmin={true}
          onConfirmDelete={(projectId) => {
            onDeleteProject(projectId);
            setActiveWorkspaceProject(null);
            setToastMessage(`Project "${projectToDelete.title}" deleted successfully.`);
            setTimeout(() => setToastMessage(null), 4000);
          }}
        />
      )}

      {/* MARK COMPLETE MODAL */}
      {showCompleteModal && projectToComplete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-zinc-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-zinc-950">Mark Project as Completed?</h3>
              <p className="text-xs text-zinc-500">
                This will mark the project as completed. Existing deliverables, payments and files will remain unchanged.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Project:</span>
                <span className="font-bold text-zinc-900">{projectToComplete.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Client:</span>
                <span className="font-semibold text-zinc-900">{projectToComplete.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Project Code:</span>
                <span className="font-mono font-bold text-zinc-900">{projectToComplete.projectCode || 'PROJ'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setProjectToComplete(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteMarkComplete(projectToComplete, true)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERABLE INCOMPLETE MODAL */}
      {showDeliverableIncompleteModal && projectToComplete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-zinc-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-zinc-950">Some required deliverables are still incomplete.</h3>
              <p className="text-xs text-zinc-500 font-medium">
                Completed: {getProjectProgress(projectToComplete).totalCompleted} / {getProjectProgress(projectToComplete).totalDeliverables} deliverables
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs text-center text-zinc-600">
              You can review the deliverables in the workspace or proceed to mark the project completed anyway.
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  const p = projectToComplete;
                  setShowDeliverableIncompleteModal(false);
                  setProjectToComplete(null);
                  setActiveWorkspaceProject(p);
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
              >
                Review Deliverables
              </button>
              <button
                onClick={() => {
                  setShowDeliverableIncompleteModal(false);
                  setShowCompleteModal(true);
                }}
                className="w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition"
              >
                Mark Project Completed Anyway
              </button>
              <button
                onClick={() => {
                  setShowDeliverableIncompleteModal(false);
                  setProjectToComplete(null);
                }}
                className="w-full py-2 rounded-xl text-zinc-500 hover:text-zinc-800 text-xs font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REOPEN PROJECT MODAL */}
      {showReopenModal && projectToReopen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-zinc-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-zinc-950">Reopen this project?</h3>
              <p className="text-xs text-zinc-500">
                This will restore the project status to In Progress. Activity history and timestamps will be preserved.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Project:</span>
                <span className="font-bold text-zinc-900">{projectToReopen.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Client:</span>
                <span className="font-semibold text-zinc-900">{projectToReopen.clientName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowReopenModal(false);
                  setProjectToReopen(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteReopenProject(projectToReopen)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reopen Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 border border-zinc-700 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Project Types & Settings Modal */}
      {showSettingsModal && (
        <ProjectTypesSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          projects={projects}
          projectTypes={projectTypes}
          onSaveProjectTypes={onSaveProjectTypes}
          categories={categories}
          onSaveCategories={onSaveCategories}
          priorities={priorities}
          onSavePriorities={onSavePriorities}
          projectStatuses={projectStatuses}
          onSaveProjectStatuses={onSaveProjectStatuses}
          deliverableTypes={deliverableTypes}
          onSaveDeliverableTypes={onSaveDeliverableTypes}
          customFields={customFields}
          onSaveCustomFields={onSaveCustomFields}
          templates={templates}
          onSaveTemplates={onSaveTemplates}
        />
      )}

      {/* 4. Pay Designer Modal */}
      {showPayDesignerModal && (
        <PayDesignerModal
          isOpen={showPayDesignerModal}
          onClose={() => {
            setShowPayDesignerModal(false);
            setPayModalDesignerId(undefined);
            setPayModalWorkId(undefined);
          }}
          initialDesignerId={payModalDesignerId}
          initialWorkId={payModalWorkId}
          projects={projects}
          localWorks={localWorks}
          designers={designers}
          onUpdateDesigners={onUpdateDesigners}
          onSavePayment={handleSaveDesignerPayment}
        />
      )}

      {/* 5. Designer Workspace Modal */}
      {selectedDesignerForWorkspace && (
        <DesignerWorkspaceModal
          isOpen={!!selectedDesignerForWorkspace}
          onClose={() => setSelectedDesignerForWorkspace(null)}
          designerItem={selectedDesignerForWorkspace}
          allProjects={projects}
          allLocalWorks={localWorks}
          allDesigners={designers}
          onOpenPayModal={(dId, wId) => {
            handleOpenPayDesigner(dId, wId);
          }}
          onOpenProjectWorkspace={(pId) => {
            const match = projects.find((p) => p.id === pId);
            if (match) {
              setActiveWorkspaceProject(match);
            }
          }}
          onUpdateProject={onUpdateProject}
          onEditDesignerProfile={onEditDesignerProfile}
        />
      )}

      {/* 6. Client Workspace Modal */}
      {selectedClientForWorkspace && (
        <ClientWorkspaceModal
          isOpen={!!selectedClientForWorkspace}
          onClose={() => setSelectedClientForWorkspace(null)}
          client={selectedClientForWorkspace}
          projects={projects}
          invoices={invoices}
          notes={notes}
          noteCategories={noteCategories}
          onSaveNote={onSaveNote}
          onDeleteNote={onDeleteNote}
          onTogglePinNote={onTogglePinNote}
          onToggleCheckItemNote={onToggleCheckItemNote}
          onNavigateRoute={onNavigateRoute}
          onOpenProjectWorkspace={(pId) => {
            const match = projects.find((p) => p.id === pId);
            if (match) {
              setActiveWorkspaceProject(match);
            }
          }}
          onCreateProjectForClient={handleCreateProjectForClient}
          onCreateInvoiceForClient={handleCreateInvoiceForClient}
          onEditClient={onEditClient}
          onDeleteProject={(projectId) => {
            onDeleteProject(projectId);
            setToastMessage('Project deleted successfully.');
            setTimeout(() => setToastMessage(null), 4000);
          }}
          onEditProject={(proj) => {
            setProjectToEdit(proj);
            setShowCreateModal(true);
          }}
        />
      )}
    </div>
  );
};

