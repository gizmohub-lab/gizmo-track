import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  DollarSign,
  User,
  Building,
  Tag,
  Flag,
  FileText,
  Paperclip,
  RotateCcw,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Check,
  Receipt,
  Download,
  Upload,
  Layers,
  History,
  Info,
  BookmarkCheck,
  MessageSquare,
  NotebookPen,
} from 'lucide-react';
import {
  Project,
  ProjectDeliverable,
  ProjectPaymentRecord,
  ProjectRevision,
  ProjectFile,
  Client,
  CustomDesigner,
  ProjectTypeItem,
  ProjectPriorityItem,
  DeliverableTypeItem,
  ProjectCustomFieldDef,
  Invoice,
  InvoiceSettings,
} from '../../../types';
import { formatINR } from '../../../utils/formatters';
import {
  getProjectProgress,
  getProjectFinancials,
  getProjectDeadlineStatus,
  formatSystemTimestamp,
} from '../../../utils/projectUtils';
import {
  calculatePaymentStatus,
  calculateAmountToGet,
  sumReceivedPayments,
  getPaymentStatusBadgeStyle,
} from '../../../utils/paymentUtils';
import { generateInvoicePDF } from '../../../utils/pdfGenerator';
import { registerVaultFile, removeVaultFile } from '../../../services/fileStorageVault';
import { QuickAddCustomModal } from './QuickAddCustomModal';
import { ProjectCreateInvoiceModal, InvoiceCreationMode } from './ProjectCreateInvoiceModal';
import { ProjectDeliverablesManager } from './ProjectDeliverablesManager';
import { DeleteProjectModal } from './DeleteProjectModal';
import { EmbeddedNotesSection } from '../notes/EmbeddedNotesSection';
import { Note, AppRoute } from '../../../types';
import { useSubSectionTitle } from '../../../utils/pageTitle';

interface ProjectWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  invoices?: Invoice[];
  clients?: Client[];
  settings?: InvoiceSettings;
  notes?: Note[];
  noteCategories?: string[];
  onSaveNote?: (note: Partial<Note> & { id: string }) => void;
  onDeleteNote?: (note: Note) => void;
  onTogglePinNote?: (id: string, e?: React.MouseEvent) => void;
  onToggleCheckItemNote?: (noteId: string, itemId: string, completed: boolean) => void;
  onNavigateRoute?: (route: AppRoute, targetId?: string) => void;
  onUpdateProject: (updatedProject: Project) => void;
  onDuplicateProject: (project: Project) => void;
  onSaveAsTemplate: (project: Project) => void;
  onEditProjectDetails: (project: Project) => void;
  onGenerateInvoice: (project: Project) => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onSaveInvoiceDirectly?: (invoice: Invoice, openPreview?: boolean) => void;
  onOpenInFullEditor?: (invoice: Invoice) => void;
  onRecordInvoicePayment?: (invoice: Invoice) => void;
  deliverableTypes?: DeliverableTypeItem[];
  onAddDeliverableType?: (name: string, desc?: string) => void;
  customFields?: ProjectCustomFieldDef[];
  designers?: CustomDesigner[];
  onUpdateDesigners?: (designers: CustomDesigner[]) => void;
  onDeleteProject?: (projectId: string) => void;
  allProjects?: Project[];
  onCreateInvoiceForProject?: any;
  onEditProjectSettings?: (proj: Project) => void;
}

type WorkspaceTab =
  | 'overview'
  | 'deliverables'
  | 'schedule'
  | 'files'
  | 'revisions'
  | 'payment'
  | 'invoices'
  | 'notes'
  | 'activity';

export const ProjectWorkspaceModal: React.FC<ProjectWorkspaceModalProps> = ({
  isOpen,
  onClose,
  project,
  invoices = [],
  clients = [],
  settings,
  notes = [],
  noteCategories = [],
  onSaveNote,
  onDeleteNote,
  onTogglePinNote,
  onToggleCheckItemNote,
  onNavigateRoute,
  onUpdateProject,
  onDuplicateProject,
  onSaveAsTemplate,
  onEditProjectDetails,
  onGenerateInvoice,
  onViewInvoice,
  onSaveInvoiceDirectly,
  onOpenInFullEditor,
  onRecordInvoicePayment,
  deliverableTypes = [],
  onAddDeliverableType,
  customFields = [],
  designers = [],
  onUpdateDesigners,
  onDeleteProject,
}) => {
  // Centralized dynamic browser tab title for Project Details
  useSubSectionTitle(isOpen && project ? project.name : null);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('deliverables');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Invoice creation modal state
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [createInvoiceMode, setCreateInvoiceMode] = useState<InvoiceCreationMode>('full');
  const [createInvoiceDeliverables, setCreateInvoiceDeliverables] = useState<ProjectDeliverable[]>([]);

  // Deliverables selection for batch invoicing
  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<Record<string, boolean>>({});

  // Add Deliverable inline state
  const [newDelTitle, setNewDelTitle] = useState('');
  const [newDelType, setNewDelType] = useState('Deliverable');
  const [newDelAmount, setNewDelAmount] = useState<string>('');
  const [newDelRequired, setNewDelRequired] = useState(true);
  const [newDelDeadlineDate, setNewDelDeadlineDate] = useState('');
  const [newDelDeadlineTime, setNewDelDeadlineTime] = useState('18:00');
  const [newDelAssignedDesigner, setNewDelAssignedDesigner] = useState('');

  // Record & Edit Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ProjectPaymentRecord | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState('UPI');
  const [payStatus, setPayStatus] = useState<'Received' | 'Pending' | 'Failed' | 'Cancelled'>('Received');
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payReceivedBy, setPayReceivedBy] = useState('Admin');

  // Add Revision Modal state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionDeliverableId, setRevisionDeliverableId] = useState<string>('overall');
  const [revisionNote, setRevisionNote] = useState('');

  // Add File Modal state
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState('Draft');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileUrl, setFileUrl] = useState('');

  // Quick Add Custom Type
  const [quickAddType, setQuickAddType] = useState<'delType' | null>(null);

  if (!isOpen) return null;

  const progress = getProjectProgress(project);
  const financials = getProjectFinancials(project, invoices);
  const deadlineStatus = getProjectDeadlineStatus(project);

  // Open Create Invoice modal
  const handleOpenCreateInvoice = (
    mode: InvoiceCreationMode = 'full',
    deliverablesToInvoice: ProjectDeliverable[] = []
  ) => {
    setCreateInvoiceMode(mode);
    setCreateInvoiceDeliverables(deliverablesToInvoice);
    setIsCreateInvoiceModalOpen(true);
  };

  // Save generated invoice from modal
  const handleSaveGeneratedInvoice = (invoicePayload: Invoice, openPreview = true) => {
    // Log in project timeline
    const stageName = invoicePayload.invoiceStage || (invoicePayload.items.length > 1 ? 'Deliverables' : 'Full');
    const updated = {
      ...project,
      history: logHistory(`Invoice ${invoicePayload.invoiceNo} created (${stageName}) — ${formatINR(invoicePayload.grandTotal)}`),
    };
    onUpdateProject(updated);

    if (onSaveInvoiceDirectly) {
      onSaveInvoiceDirectly(invoicePayload, openPreview);
    } else {
      onGenerateInvoice(project);
    }
  };

  // WhatsApp client helper
  const handleWhatsAppClient = () => {
    const clientPhone =
      project.clientPhone ||
      clients.find((c) => c.id === project.clientId)?.phone ||
      '';

    if (!clientPhone) {
      alert(`No phone number found for ${project.clientName}. You can add one in Edit Project Details.`);
      return;
    }

    const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${project.clientName}!\nHere is an update regarding your project:\n` +
      `• Project: ${project.title} (${project.projectCode || 'PRJ'})\n` +
      `• Status: ${project.status}\n` +
      `• Deliverables: ${progress.totalCompleted}/${progress.totalDeliverables} completed (${progress.percent}%)\n` +
      (financials.amountToGet > 0
        ? `• Payment Status: ${financials.paymentStatus} (Balance: ₹${financials.amountToGet.toLocaleString('en-IN')})\n`
        : `• Payment Status: Fully Settled\n`) +
      `Thank you!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Helper to append history
  const logHistory = (action: string, note?: string) => {
    const newHistory = [
      {
        id: `hist-${Date.now()}`,
        timestamp: formatSystemTimestamp(),
        action,
        note,
      },
      ...(project.history || []),
    ];
    return newHistory;
  };

  // Toggle Deliverable Completion (○ → ✓)
  const handleToggleDeliverableCompletion = (deliverableId: string) => {
    const updatedDeliverables = (project.deliverables || []).map((d) => {
      if (d.id === deliverableId) {
        const nextCompleted = !d.isCompleted;
        return {
          ...d,
          isCompleted: nextCompleted,
          completedAt: nextCompleted ? formatSystemTimestamp() : undefined,
          reopenedAt: !nextCompleted ? formatSystemTimestamp() : d.reopenedAt,
        };
      }
      return d;
    });

    const target = project.deliverables?.find((d) => d.id === deliverableId);
    const actionText = target?.isCompleted
      ? `Reopened deliverable: "${target?.title}"`
      : `Marked deliverable completed: "${target?.title}"`;

    const updated = {
      ...project,
      deliverables: updatedDeliverables,
      history: logHistory(actionText),
    };
    onUpdateProject(updated);
  };

  // Reorder Deliverables
  const handleMoveDeliverable = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const deliverables = [...(project.deliverables || [])];
    if (targetIdx < 0 || targetIdx >= deliverables.length) return;

    const temp = deliverables[index];
    deliverables[index] = deliverables[targetIdx];
    deliverables[targetIdx] = temp;

    const reordered = deliverables.map((d, i) => ({ ...d, orderIndex: i + 1 }));
    onUpdateProject({
      ...project,
      deliverables: reordered,
    });
  };

  // Add Deliverable
  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelTitle.trim()) return;

    const newDeliverable: ProjectDeliverable = {
      id: `del-${Date.now()}`,
      title: newDelTitle.trim(),
      type: newDelType,
      isRequired: newDelRequired,
      isCompleted: false,
      amount: newDelAmount ? parseFloat(newDelAmount) : undefined,
      deadlineDate: newDelDeadlineDate || undefined,
      deadlineTime: newDelDeadlineDate ? newDelDeadlineTime : undefined,
      assignedDesignerName: newDelAssignedDesigner || undefined,
      orderIndex: (project.deliverables?.length || 0) + 1,
    };

    const updated = {
      ...project,
      deliverables: [...(project.deliverables || []), newDeliverable],
      history: logHistory(`Added deliverable: "${newDelTitle.trim()}" (${newDelType}${newDelAmount ? ` - ${formatINR(parseFloat(newDelAmount))}` : ''})`),
    };

    onUpdateProject(updated);
    setNewDelTitle('');
    setNewDelAmount('');
    setNewDelDeadlineDate('');
    setNewDelAssignedDesigner('');
  };

  // Delete Deliverable
  const handleDeleteDeliverable = (delId: string) => {
    const target = project.deliverables?.find((d) => d.id === delId);
    const updated = {
      ...project,
      deliverables: (project.deliverables || []).filter((d) => d.id !== delId),
      history: logHistory(`Deleted deliverable: "${target?.title || 'Unknown'}"`),
    };
    onUpdateProject(updated);
  };

  // Quick Status Change
  const handleStatusChange = (newStatus: string) => {
    const updated = {
      ...project,
      status: newStatus,
      history: logHistory(`Status changed from "${project.status}" to "${newStatus}"`),
    };
    onUpdateProject(updated);
  };

  // Open Record Payment Modal
  const handleOpenRecordPayment = () => {
    setEditingPayment(null);
    setPayAmount(financials.amountToGet > 0 ? financials.amountToGet : 0);
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayMethod('UPI');
    setPayStatus('Received');
    setPayReference('');
    setPayNote('');
    setPayReceivedBy('Admin');
    setShowPaymentModal(true);
  };

  // Open Edit Payment Modal
  const handleOpenEditPayment = (payment: ProjectPaymentRecord) => {
    setEditingPayment(payment);
    setPayAmount(payment.amount);
    setPayDate(payment.date);
    setPayMethod(payment.method || 'UPI');
    setPayStatus((payment.status as any) || 'Received');
    setPayReference(payment.reference || payment.referenceNumber || '');
    setPayNote(payment.note || payment.notes || '');
    setPayReceivedBy(payment.receivedBy || 'Admin');
    setShowPaymentModal(true);
  };

  // Record / Edit Payment Submit
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(payAmount);
    if (numAmount <= 0) return;

    const existingPayments = project.payments || [];
    let updatedPayments: ProjectPaymentRecord[];

    if (editingPayment) {
      updatedPayments = existingPayments.map((p) =>
        p.id === editingPayment.id
          ? {
              ...p,
              date: payDate,
              amount: numAmount,
              method: payMethod,
              status: payStatus,
              reference: payReference.trim() || undefined,
              referenceNumber: payReference.trim() || undefined,
              note: payNote.trim() || undefined,
              notes: payNote.trim() || undefined,
              receivedBy: payReceivedBy.trim() || undefined,
            }
          : p
      );
    } else {
      const newPayment: ProjectPaymentRecord = {
        id: `pay-${Date.now()}`,
        date: payDate,
        amount: numAmount,
        method: payMethod,
        status: payStatus,
        reference: payReference.trim() || undefined,
        referenceNumber: payReference.trim() || undefined,
        note: payNote.trim() || undefined,
        notes: payNote.trim() || undefined,
        receivedBy: payReceivedBy.trim() || undefined,
        recordedAt: formatSystemTimestamp(),
      };
      updatedPayments = [...existingPayments, newPayment];
    }

    const numTotal = Number(project.totalAmount ?? project.budget ?? 0);
    const newGot = sumReceivedPayments(updatedPayments);
    const newToGet = calculateAmountToGet(numTotal, newGot);
    const newPayStatus = calculatePaymentStatus(numTotal, newGot);

    const actionText = editingPayment
      ? `Payment updated: ₹${numAmount.toLocaleString('en-IN')} (${payStatus}) via ${payMethod}`
      : `Payment recorded: ₹${numAmount.toLocaleString('en-IN')} (${payStatus}) via ${payMethod}`;

    const updated: Project = {
      ...project,
      amountGot: newGot,
      amountToGet: newToGet,
      paymentStatus: newPayStatus,
      payments: updatedPayments,
      history: logHistory(actionText, payNote.trim() || undefined),
    };

    onUpdateProject(updated);
    setShowPaymentModal(false);
    setEditingPayment(null);
    setPayAmount(0);
    setPayReference('');
    setPayNote('');
  };

  // Add Revision
  const handleAddRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote.trim()) return;

    const revCount = (project.revisions?.length || 0) + 1;
    const targetDel = project.deliverables?.find((d) => d.id === revisionDeliverableId);

    const newRev: ProjectRevision = {
      id: `rev-${Date.now()}`,
      deliverableId: revisionDeliverableId === 'overall' ? undefined : revisionDeliverableId,
      revisionNo: revCount,
      date: new Date().toISOString().split('T')[0],
      note: revisionNote.trim(),
      createdAt: formatSystemTimestamp(),
    };

    const updated = {
      ...project,
      revisions: [...(project.revisions || []), newRev],
      history: logHistory(
        `Revision #${revCount} logged: ${targetDel ? `[${targetDel.title}] ` : ''}${revisionNote.trim()}`
      ),
    };

    onUpdateProject(updated);
    setShowRevisionModal(false);
    setRevisionNote('');
  };

  // Add File
  const handleAddFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const fileId = `file-${Date.now()}`;
    const vaultAsset = registerVaultFile('project', project.id, {
      id: fileId,
      name: fileName.trim(),
      type: 'document',
      size: fileSize.trim() || '1.0 MB',
      url: fileUrl.trim() || undefined,
      category: fileCategory,
      uploadedAt: formatSystemTimestamp(),
    });

    const newFile: ProjectFile = {
      id: fileId,
      name: fileName.trim(),
      type: 'document',
      size: fileSize.trim() || '1.0 MB',
      url: fileUrl.trim() || undefined,
      category: fileCategory,
      uploadedAt: formatSystemTimestamp(),
      storagePath: vaultAsset.storagePath,
    };

    const updated = {
      ...project,
      files: [...(project.files || []), newFile],
      history: logHistory(`File attached: "${fileName.trim()}" (${fileCategory})`),
    };

    onUpdateProject(updated);
    setShowFileModal(false);
    setFileName('');
    setFileUrl('');
  };

  // Delete Payment record
  const handleDeletePayment = (paymentId: string) => {
    const remainingPayments = (project.payments || []).filter((p) => p.id !== paymentId);
    const numTotal = Number(project.totalAmount ?? project.budget ?? 0);
    const newGot = sumReceivedPayments(remainingPayments);
    const newToGet = calculateAmountToGet(numTotal, newGot);
    const newPayStatus = calculatePaymentStatus(numTotal, newGot);

    const updated: Project = {
      ...project,
      amountGot: newGot,
      amountToGet: newToGet,
      paymentStatus: newPayStatus,
      payments: remainingPayments,
      history: logHistory('Deleted payment entry from transaction ledger'),
    };
    onUpdateProject(updated);
  };

  // Designer representation
  const designerName = project.assignedDesignerName || 'Unassigned';
  const displayDesigner = project.customDisplayName ? (
    <span>
      <strong className="text-slate-900">{project.customDisplayName}</strong>{' '}
      <span className="text-[10px] text-slate-400 font-normal">
        (Original: {designerName})
      </span>
    </span>
  ) : (
    <strong className="text-slate-900">{designerName}</strong>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* TOP BAR / HEADER */}
        <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-white shadow-2xs">
                {project.projectCode || 'PRJ-WORK'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200">
                {project.projectType || project.category || 'General'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${deadlineStatus.badgeStyle.bg} ${deadlineStatus.badgeStyle.text} ${deadlineStatus.badgeStyle.border}`}
              >
                {project.priority || 'Normal'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                  project.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {project.status}
              </span>
            </div>

            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {project.title}
            </h1>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {project.clientName}
                {project.clientBrand && project.clientBrand !== project.clientName && (
                  <span className="text-slate-400 font-normal"> · {project.clientBrand}</span>
                )}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Designer: {displayDesigner}
              </span>
            </div>
          </div>

          {/* Quick Header Actions: WhatsApp Client | Revision ▾ | + Create Invoice */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* 1. WhatsApp Client */}
            <button
              onClick={handleWhatsAppClient}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl transition flex items-center gap-1.5 text-xs shadow-2xs cursor-pointer"
              title="Send WhatsApp update to client"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Client</span>
            </button>

            {/* 2. Revision dropdown / button */}
            <button
              onClick={() => {
                setRevisionDeliverableId('overall');
                setShowRevisionModal(true);
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 text-xs cursor-pointer"
              title="Log revision request"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Revision ▾</span>
            </button>

            {/* 3. + Create Invoice (Prominent action) */}
            <button
              onClick={() => handleOpenCreateInvoice('full')}
              className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-extrabold rounded-xl shadow-xs shadow-violet-600/30 transition flex items-center gap-1.5 text-xs cursor-pointer"
              title="Create Invoice directly for this project"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>+ Create Invoice</span>
            </button>

            {/* Status changer dropdown */}
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-extrabold text-slate-800 outline-none shadow-2xs cursor-pointer hover:border-slate-300 transition text-xs"
            >
              <option value="New">Status: New</option>
              <option value="In Progress">Status: In Progress</option>
              <option value="Waiting for Client">Status: Waiting for Client</option>
              <option value="Revision">Status: Revision</option>
              <option value="Ready">Status: Ready</option>
              <option value="Completed">Status: Completed</option>
              <option value="Cancelled">Status: Cancelled</option>
            </select>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs transition flex items-center gap-1 text-xs cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>+ Record Payment</span>
            </button>

            <button
              onClick={() => onDuplicateProject(project)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Duplicate Project"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSaveAsTemplate(project)}
              className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition cursor-pointer"
              title="Save as Reusable Template"
            >
              <BookmarkCheck className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEditProjectDetails(project)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Edit Project Configuration"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="Delete Project (Admin)"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition ml-1 cursor-pointer"
              title="Close Workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PROGRESS & DELIVERABLE STATUS BAR */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-slate-800">
                Deliverables &amp; Milestones Progress: {progress.totalCompleted} of{' '}
                {progress.totalDeliverables} completed ({progress.percent}%)
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                {progress.totalRequired} required · {progress.totalDeliverables - progress.totalRequired} optional
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  progress.isAllRequiredCompleted ? 'bg-emerald-500' : 'bg-violet-600'
                }`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>

          {progress.isAllRequiredCompleted && project.status !== 'Completed' && (
            <button
              onClick={() => handleStatusChange('Completed')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold rounded-xl text-[11px] transition flex items-center gap-1.5 shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Project Completed</span>
            </button>
          )}
        </div>

        {/* 7 WORKSPACE TABS */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto py-1.5">
          <button
            onClick={() => setActiveTab('deliverables')}
            className={`px-3 py-1.5 font-extrabold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'deliverables'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Deliverables</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {progress.totalCompleted}/{progress.totalDeliverables}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 font-extrabold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3 py-1.5 font-extrabold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'payment'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Payment Tracking</span>
            <span
              className={`ml-1 text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                financials.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {financials.paymentStatus}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 font-extrabold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Invoices</span>
            <span
              className={`ml-1 text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                financials.linkedInvoices.length > 0
                  ? 'bg-violet-100 text-violet-800'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {financials.linkedInvoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 font-extrabold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Deadline Schedule</span>
            <span className={`ml-1 text-[9px] px-1.5 py-0.2 rounded-full font-bold ${deadlineStatus.badgeStyle.bg} ${deadlineStatus.badgeStyle.text} border ${deadlineStatus.badgeStyle.border}`}>
              {deadlineStatus.label}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 font-extrabold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'files'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Files ({project.files?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-3 py-1.5 font-extrabold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'revisions'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revisions ({project.revisions?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 font-extrabold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <NotebookPen className="w-3.5 h-3.5" />
            <span>Notes ({notes.filter((n) => n.projectId === project.id).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 font-extrabold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'activity'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Activity Log</span>
          </button>
        </div>

        {/* WORKSPACE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB: DELIVERABLES (The Core Deliverable Engine) */}
          {activeTab === 'deliverables' && (
            <ProjectDeliverablesManager
              project={project}
              onUpdateProject={onUpdateProject}
              onOpenCreateInvoice={(selectedDels) =>
                handleOpenCreateInvoice('deliverables', selectedDels)
              }
              onSaveAsTemplate={onSaveAsTemplate}
              deliverableTypes={deliverableTypes}
              onAddDeliverableType={onAddDeliverableType}
              designers={designers}
              onUpdateDesigners={onUpdateDesigners}
            />
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Client Card */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>Client &amp; Brand</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-xs">{project.clientName}</div>
                  {project.clientBrand && (
                    <div className="text-[11px] text-violet-700 font-semibold">{project.clientBrand}</div>
                  )}
                  {project.clientPhone && (
                    <div className="text-[10px] text-slate-500">{project.clientPhone}</div>
                  )}
                </div>

                {/* Designer Card */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Assigned Designer</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-xs">{displayDesigner}</div>
                  <div className="text-[11px] text-slate-500">
                    Project Type: <strong className="text-slate-700">{project.projectType}</strong>
                  </div>
                </div>

                {/* Schedule Card */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Deadline &amp; Urgency</span>
                  </div>
                  {project.hasDeadline && project.deadlineDate ? (
                    <>
                      <div className="font-extrabold text-slate-900 text-xs">
                        {project.deadlineDate} {project.deadlineTime || ''}
                      </div>
                      <span className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-bold ${deadlineStatus.badgeStyle.bg} ${deadlineStatus.badgeStyle.text} border ${deadlineStatus.badgeStyle.border}`}>
                        {deadlineStatus.label}
                      </span>
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium italic">
                      No Deadline Set (decided later)
                    </div>
                  )}
                </div>

                {/* Financial Card */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                      <span>Payment Status</span>
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                        financials.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {financials.paymentStatus}
                    </span>
                  </div>
                  <div className="font-mono font-extrabold text-slate-900 text-xs">
                    {formatINR(financials.totalAmount)}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono">
                    <span className="text-emerald-700">Got: {formatINR(financials.amountGot)}</span>
                    <span className="text-amber-700">Due: {formatINR(financials.amountToGet)}</span>
                  </div>
                </div>
              </div>

              {/* Scope & Notes */}
              {project.description && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Scope of Work / Brief
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              {/* Custom Fields (Section 27) */}
              {project.customFieldValues && Object.keys(project.customFieldValues).length > 0 && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Custom Project Attributes
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(project.customFieldValues).map(([k, v]) => {
                      const def = customFields.find((cf) => cf.id === k);
                      return (
                        <div key={k} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block">
                            {def?.name || k}
                          </span>
                          <span className="font-extrabold text-slate-800 text-xs">
                            {String(v)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PAYMENT TRACKING (Section 8) */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs">Project Payment Ledger</h3>
                  <p className="text-[11px] text-slate-500">
                    Agreed Project Value, Total Invoiced, Received Payments (Got), and Outstanding Balance (To Get).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCreateInvoice('full')}
                    className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>+ Create Invoice</span>
                  </button>
                  <button
                    onClick={handleOpenRecordPayment}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>+ Record Payment</span>
                  </button>
                </div>
              </div>

              {/* 4 Financial KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Project Amount
                  </span>
                  <div className="font-mono font-black text-slate-900 text-base sm:text-lg">
                    {formatINR(financials.totalAmount)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400">Status:</span>
                    {(() => {
                      const badge = getPaymentStatusBadgeStyle(financials.paymentStatus);
                      return (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.2 text-[9px] font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-3.5 bg-violet-50/70 rounded-2xl border border-violet-100 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block">
                      Invoiced
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-violet-200 text-violet-800 font-bold">
                      {financials.linkedInvoices.length} inv
                    </span>
                  </div>
                  <div className="font-mono font-black text-violet-800 text-base sm:text-lg">
                    {formatINR(financials.totalInvoiced)}
                  </div>
                  <span className="text-[10px] text-violet-600 block">
                    {financials.unbilledAmount > 0
                      ? `${formatINR(financials.unbilledAmount)} unbilled`
                      : '100% billed'}
                  </span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Got (Received)
                  </span>
                  <div className="font-mono font-black text-emerald-700 text-base sm:text-lg">
                    {formatINR(financials.amountGot)}
                  </div>
                  <span className="text-[10px] text-emerald-600 block">
                    Payments collected
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    To Get (Balance)
                  </span>
                  <div className="font-mono font-black text-amber-700 text-base sm:text-lg">
                    {formatINR(financials.amountToGet)}
                  </div>
                  <span className="text-[10px] text-amber-600 block">
                    Outstanding to collect
                  </span>
                </div>
              </div>

              {/* Payments Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="p-3 px-4 bg-slate-50 border-b border-slate-200 font-extrabold text-slate-800 text-xs flex items-center justify-between">
                  <span>Payment Transactions ({project.payments?.length || 0})</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenCreateInvoice('full')}
                      className="text-violet-700 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>+ Create Invoice</span>
                    </button>
                    <button
                      onClick={handleOpenRecordPayment}
                      className="text-emerald-700 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Payment</span>
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {project.payments && project.payments.length > 0 ? (
                    project.payments.map((p) => {
                      const isPendingOrFailed = p.status && p.status !== 'Received';
                      return (
                        <div
                          key={p.id}
                          className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {p.date}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700">
                                {p.method || 'Payment'}
                              </span>
                              {p.status && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    p.status === 'Received'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : p.status === 'Pending'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {p.status}
                                </span>
                              )}
                              {(p.referenceNumber || p.reference) && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  Ref: {p.referenceNumber || p.reference}
                                </span>
                              )}
                              {p.receivedBy && (
                                <span className="text-[10px] text-slate-400">
                                  Recv by: {p.receivedBy}
                                </span>
                              )}
                            </div>
                            {(p.note || p.notes) && (
                              <p className="text-[11px] text-slate-500">{p.note || p.notes}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`font-mono font-extrabold text-sm ${
                                isPendingOrFailed ? 'text-slate-400 line-through' : 'text-emerald-700'
                              }`}
                            >
                              +{formatINR(p.amount)}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditPayment(p)}
                                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
                                title="Edit payment record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePayment(p.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-rose-50 transition"
                                title="Delete payment transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      No payments recorded yet. Click &quot;+ Record Payment&quot; above to log an advance or settlement.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: INVOICES (Section 2 & 5) */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-violet-600" />
                    <span>Project Invoices ({financials.linkedInvoices.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Directly linked invoices for {project.title}. All invoices update client billing records and financial ledgers.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenCreateInvoice('full')}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>+ Create Invoice</span>
                </button>
              </div>

              {/* Financial Invoicing Summary Banner */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Project Agreed Value</span>
                  <span className="font-mono font-black text-slate-900 text-sm sm:text-base">
                    {formatINR(financials.totalAmount)}
                  </span>
                </div>

                <div className="p-3 bg-violet-50/80 rounded-xl border border-violet-100">
                  <span className="text-[10px] font-bold text-violet-700 block uppercase">Total Invoiced</span>
                  <span className="font-mono font-black text-violet-800 text-sm sm:text-base">
                    {formatINR(financials.totalInvoiced)}
                  </span>
                  <span className="text-[9px] text-violet-600 block font-medium">
                    {financials.unbilledAmount > 0 ? `${formatINR(financials.unbilledAmount)} unbilled` : 'Fully billed'}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">Invoiced Paid</span>
                  <span className="font-mono font-black text-emerald-800 text-sm sm:text-base">
                    {formatINR(financials.invoicedPaid)}
                  </span>
                </div>

                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-700 block uppercase">Invoiced Pending</span>
                  <span className="font-mono font-black text-amber-800 text-sm sm:text-base">
                    {formatINR(financials.invoicedPending)}
                  </span>
                </div>
              </div>

              {/* Invoices List Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {financials.linkedInvoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">Invoice #</th>
                          <th className="py-3 px-4">Type / Stage</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                          <th className="py-3 px-4 text-right">Received</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {financials.linkedInvoices.map((inv) => (
                          <tr
                            key={inv.id}
                            onClick={() => onViewInvoice ? onViewInvoice(inv) : null}
                            className="hover:bg-violet-50/40 transition cursor-pointer group"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-violet-700">
                              <span className="bg-violet-50 group-hover:bg-violet-100 px-2 py-0.5 rounded border border-violet-200">
                                {inv.invoiceNo}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                                {inv.invoiceStage || (inv.items.length > 1 ? 'Deliverables' : 'Full Project')}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {inv.invoiceDate}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {inv.dueDate}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                              {formatINR(inv.grandTotal)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                              {formatINR(inv.receivedAmount || 0)}
                              {inv.balanceAmount > 0 && (
                                <span className="block text-[9px] text-amber-600 font-sans">
                                  Bal: {formatINR(inv.balanceAmount)}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                inv.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : inv.status === 'Partially Paid'
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : inv.status === 'Issued' || inv.status === 'Sent'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : inv.status === 'Draft'
                                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                                  : 'bg-violet-100 text-violet-800 border-violet-200'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onViewInvoice && onViewInvoice(inv)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700 transition cursor-pointer"
                                  title="View / Print Invoice"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={async () => {
                                    await generateInvoicePDF(inv);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                                  title="Download PDF"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                {inv.status !== 'Paid' && onRecordInvoicePayment && (
                                  <button
                                    onClick={() => onRecordInvoicePayment(inv)}
                                    className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 transition cursor-pointer"
                                    title="Record Payment for this Invoice"
                                  >
                                    + Pay
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">No Invoices Created Yet</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        Bill this project in full, invoice specific deliverables, or generate an advance deposit without leaving this workspace.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenCreateInvoice('full')}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl shadow-md shadow-violet-600/30 transition inline-flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>+ Create First Invoice</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: DEADLINE & SCHEDULE (Section 6 & 11) */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-violet-600" />
                    <span>Project Overall Schedule</span>
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${deadlineStatus.badgeStyle.bg} ${deadlineStatus.badgeStyle.text} border ${deadlineStatus.badgeStyle.border}`}>
                    {deadlineStatus.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Start Date</span>
                    <span className="font-mono font-bold text-slate-900">{project.startDate}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Deadline Date &amp; Time</span>
                    <span className="font-mono font-bold text-slate-900">
                      {project.hasDeadline && project.deadlineDate
                        ? `${project.deadlineDate} · ${project.deadlineTime || '18:00'}`
                        : 'No Deadline decided yet'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Dashboard Sync</span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {project.hasDeadline ? '✓ Active in Deadline Alarm' : 'Excluded (No Deadline)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestone timeline */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs p-4 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs">Milestone Deadlines Timeline</h4>
                <div className="space-y-2">
                  {(project.deliverables || []).map((d) => (
                    <div
                      key={d.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-slate-400 text-[10px]">
                          {d.isCompleted ? '✓' : '○'}
                        </span>
                        <div>
                          <span
                            className={`font-extrabold text-xs ${
                              d.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {d.title}
                          </span>
                          <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-100 text-violet-800">
                            {d.type}
                          </span>
                        </div>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600">
                        {d.deadlineDate ? `Due: ${d.deadlineDate}` : 'No date set'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FILES (Section 25) */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs">Project Files &amp; Assets</h3>
                  <p className="text-[11px] text-slate-500">
                    Briefs, vector source files, draft previews and final handovers.
                  </p>
                </div>
                <button
                  onClick={() => setShowFileModal(true)}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Attach File</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {project.files && project.files.length > 0 ? (
                  project.files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 text-xs truncate">
                            {file.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-700">
                              {file.category}
                            </span>
                            <span>{file.size}</span>
                            <span>• {file.uploadedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-400 font-medium rounded-lg text-[10px]">
                            Attached
                          </span>
                        )}
                        <button
                          onClick={() => {
                            removeVaultFile(file.storagePath || file.id);
                            const updated = {
                              ...project,
                              files: (project.files || []).filter((f) => f.id !== file.id),
                            };
                            onUpdateProject(updated);
                          }}
                          className="text-slate-300 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    No files attached yet. Click &quot;+ Attach File&quot; to link briefing documents or source assets.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: REVISIONS (Section 26) */}
          {activeTab === 'revisions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs">Revision Tracking Log</h3>
                  <p className="text-[11px] text-slate-500">
                    Document every client revision request, color adjustment, and change order.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRevisionDeliverableId('overall');
                    setShowRevisionModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>+ Add Revision</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {project.revisions && project.revisions.length > 0 ? (
                  project.revisions.map((rev) => {
                    const targetDel = project.deliverables?.find((d) => d.id === rev.deliverableId);
                    return (
                      <div
                        key={rev.id}
                        className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                              Revision #{rev.revisionNo}
                            </span>
                            {targetDel && (
                              <span className="font-bold text-slate-700 text-xs">
                                [{targetDel.title}]
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">{rev.createdAt}</span>
                        </div>
                        <p className="text-slate-800 text-xs font-medium pl-1">{rev.note}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    No revisions logged. Use &quot;+ Add Revision&quot; to keep an exact audit trail of client change requests.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: NOTES */}
          {activeTab === 'notes' && (
            <EmbeddedNotesSection
              notes={notes}
              projectId={project.id}
              projectTitle={project.title}
              categories={noteCategories}
              projects={[project]}
              clients={clients}
              onSaveNote={onSaveNote || (() => {})}
              onDeleteNote={onDeleteNote || (() => {})}
              onTogglePin={onTogglePinNote || (() => {})}
              onToggleCheckItem={onToggleCheckItemNote}
              onNavigateRoute={onNavigateRoute}
            />
          )}

          {/* TAB: ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs">System Activity &amp; Audit Trail</h3>
                <p className="text-[11px] text-slate-500">
                  Chronological record of status changes, payments, and deliverable milestones.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {project.history && project.history.length > 0 ? (
                  project.history.map((hist) => (
                    <div key={hist.id} className="p-3 px-4 flex items-start gap-3 hover:bg-slate-50">
                      <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs">{hist.action}</span>
                          <span className="text-[10px] font-mono text-slate-400">{hist.timestamp}</span>
                        </div>
                        {hist.note && <p className="text-[11px] text-slate-500">{hist.note}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400">No activity recorded yet.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* WORKSPACE FOOTER */}
        <div className="p-3.5 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Created: {project.createdAt.split('T')[0]}</span>
            <span>•</span>
            <span>Last Updated: {project.updatedAt ? project.updatedAt.split('T')[0] : 'Today'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition"
            >
              Close Workspace
            </button>
          </div>
        </div>

        {/* MODAL: RECORD / EDIT PAYMENT */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>{editingPayment ? 'Edit Payment Record' : 'Record Payment Received'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Amount (₹) *</label>
                    {!editingPayment && financials.amountToGet > 0 && (
                      <button
                        type="button"
                        onClick={() => setPayAmount(financials.amountToGet)}
                        className="text-[10px] text-emerald-700 font-bold hover:underline"
                      >
                        Fill Balance (₹{financials.amountToGet.toLocaleString('en-IN')})
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={payAmount || ''}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    placeholder={`Remaining: ${financials.amountToGet}`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-extrabold text-emerald-700 outline-none text-sm"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Method</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Cheque">Cheque</option>
                      <option value="GPay">GPay</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Paytm">Paytm</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                    <select
                      value={payStatus}
                      onChange={(e) => setPayStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    >
                      <option value="Received">Received</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Received By</label>
                    <input
                      type="text"
                      value={payReceivedBy}
                      onChange={(e) => setPayReceivedBy(e.target.value)}
                      placeholder="e.g. Admin / Accounts"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference / UTR</label>
                  <input
                    type="text"
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    placeholder="e.g. UTR 423984129"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="e.g. 50% advance / milestone payment"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    {editingPayment ? 'Save Changes' : 'Save Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD REVISION */}
        {showRevisionModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-violet-600" />
                  <span>Log Client Revision</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddRevisionSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Deliverable</label>
                  <select
                    value={revisionDeliverableId}
                    onChange={(e) => setRevisionDeliverableId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                  >
                    <option value="overall">Project Overall Scope</option>
                    {(project.deliverables || []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Revision Note *</label>
                  <textarea
                    rows={3}
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    placeholder="e.g. Client requested deeper green tone and 15% larger logo on back dieline."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium resize-none"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRevisionModal(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    Log Revision
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ATTACH FILE */}
        {showFileModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-violet-600" />
                  <span>Attach Project File</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddFileSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Name *</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. Box_Packaging_Artwork_v2.ai"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={fileCategory}
                      onChange={(e) => setFileCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    >
                      <option value="Design Reference">Design Reference</option>
                      <option value="Client Asset">Client Asset</option>
                      <option value="Brief">Brief</option>
                      <option value="Draft">Draft</option>
                      <option value="Final Handover">Final Handover</option>
                      <option value="Source File">Source File</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Approx Size</label>
                    <input
                      type="text"
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      placeholder="e.g. 4.2 MB"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">File URL / Drive Link (Optional)</label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFileModal(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    Attach File
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QUICK ADD CUSTOM DELIVERABLE TYPE */}
        <QuickAddCustomModal
          isOpen={quickAddType === 'delType'}
          onClose={() => setQuickAddType(null)}
          title="Add Custom Deliverable Type"
          placeholder="e.g. Presentation, Quality Audit, Production Check"
          onAdd={(name, desc) => {
            onAddDeliverableType(name, desc);
            setNewDelType(name);
          }}
        />

        {/* INTEGRATED PROJECT CREATE INVOICE MODAL */}
        <ProjectCreateInvoiceModal
          isOpen={isCreateInvoiceModalOpen}
          onClose={() => setIsCreateInvoiceModalOpen(false)}
          project={project}
          existingInvoices={invoices}
          clients={clients}
          settings={settings}
          initialMode={createInvoiceMode}
          selectedDeliverables={createInvoiceDeliverables}
          onGenerateAndSaveInvoice={handleSaveGeneratedInvoice}
          onOpenInFullEditor={(draftInv) => {
            setIsCreateInvoiceModalOpen(false);
            if (onOpenInFullEditor) {
              onOpenInFullEditor(draftInv);
            }
          }}
        />

        {/* DELETE PROJECT CONFIRMATION MODAL */}
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          project={project}
          isAdmin={true}
          onConfirmDelete={(projectId) => {
            if (onDeleteProject) {
              onDeleteProject(projectId);
            }
            setShowDeleteModal(false);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
