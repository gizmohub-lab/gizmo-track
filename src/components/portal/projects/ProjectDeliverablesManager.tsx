import React, { useState, useMemo } from 'react';
import {
  Check,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Receipt,
  RotateCcw,
  Paperclip,
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Circle,
  MoreVertical,
  X,
  Archive,
  Eye,
  FileText,
  Upload,
  Download,
  DollarSign,
  ChevronDown,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import {
  Project,
  ProjectDeliverable,
  ProjectDeliverableRevision,
  ProjectFileAttachment,
  CustomDesigner,
  DeliverableTypeItem,
  ProjectPriorityItem,
  ProjectStatusItem,
} from '../../../types';
import { formatINR } from '../../../utils/formatters';
import {
  getProjectProgress,
  getDeliverableDeadlineStatus,
  formatSystemTimestamp,
} from '../../../utils/projectUtils';
import { registerVaultFile, removeVaultFile } from '../../../services/fileStorageVault';
import { AddCustomDesignerModal } from '../local-works/AddCustomDesignerModal';

interface ProjectDeliverablesManagerProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onOpenCreateInvoice?: (deliverables: ProjectDeliverable[]) => void;
  onSaveAsTemplate?: (project: Project) => void;
  deliverableTypes?: DeliverableTypeItem[];
  onAddDeliverableType?: (name: string, desc?: string) => void;
  designers?: CustomDesigner[];
  onUpdateDesigners?: (designers: CustomDesigner[]) => void;
}

export const ProjectDeliverablesManager: React.FC<ProjectDeliverablesManagerProps> = ({
  project,
  onUpdateProject,
  onOpenCreateInvoice,
  onSaveAsTemplate,
  deliverableTypes = [],
  onAddDeliverableType,
  designers = [],
  onUpdateDesigners,
}) => {
  // Form visibility
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Selection for bulk invoicing & actions
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Active sub-modals
  const [assigningDeliverable, setAssigningDeliverable] = useState<ProjectDeliverable | null>(null);
  const [editingDeliverable, setEditingDeliverable] = useState<ProjectDeliverable | null>(null);
  const [revisionDeliverable, setRevisionDeliverable] = useState<ProjectDeliverable | null>(null);
  const [filesDeliverable, setFilesDeliverable] = useState<ProjectDeliverable | null>(null);
  const [quickDesignerDeliverable, setQuickDesignerDeliverable] = useState<ProjectDeliverable | null>(null);
  const [quickDeadlineDeliverable, setQuickDeadlineDeliverable] = useState<ProjectDeliverable | null>(null);
  const [deleteConfirmDeliverable, setDeleteConfirmDeliverable] = useState<ProjectDeliverable | null>(null);

  // Bulk action modals
  const [showBulkDesignerModal, setShowBulkDesignerModal] = useState(false);
  const [showBulkDeadlineModal, setShowBulkDeadlineModal] = useState(false);

  // Custom addition popups
  const [showAddDesignerModal, setShowAddDesignerModal] = useState(false);
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');
  const [showCustomPriorityInput, setShowCustomPriorityInput] = useState(false);
  const [customPriorityName, setCustomPriorityName] = useState('');
  const [showCustomStatusInput, setShowCustomStatusInput] = useState(false);
  const [customStatusName, setCustomStatusName] = useState('');

  // Add Deliverable Form State
  const defaultDesignerId = project.assignedDesignerId || (designers.length > 0 ? designers[0].id : '');
  const defaultDesignerName =
    project.customDisplayName ||
    project.assignedDesignerName ||
    (designers.find((d) => d.id === defaultDesignerId)?.name || 'Aryan Sen');

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('Deliverable');
  const [formDescription, setFormDescription] = useState('');
  const [formDesignerId, setFormDesignerId] = useState(defaultDesignerId);
  const [formDesignerName, setFormDesignerName] = useState(defaultDesignerName);
  const [formCustomDisplayName, setFormCustomDisplayName] = useState('');
  const [formHasDeadline, setFormHasDeadline] = useState(true);
  const [formDeadlineDate, setFormDeadlineDate] = useState(() => {
    if (project.deadlineDate) return project.deadlineDate;
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [formDeadlineTime, setFormDeadlineTime] = useState('18:00');
  const [formPriority, setFormPriority] = useState('Normal');
  const [formStatus, setFormStatus] = useState('New');
  const [formClientAmount, setFormClientAmount] = useState('');
  const [formDesignerFee, setFormDesignerFee] = useState('');
  const [formIsRequired, setFormIsRequired] = useState(true);

  // Helper for logging history
  const logHistory = (action: string, note?: string) => {
    return [
      {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: formatSystemTimestamp(),
        action,
        note,
      },
      ...(project.history || []),
    ];
  };

  // Deliverables list (active vs archived)
  const deliverables = useMemo(() => {
    const list = project.deliverables || [];
    return showArchived ? list : list.filter((d) => !d.isArchived);
  }, [project.deliverables, showArchived]);

  const archivedCount = useMemo(() => {
    return (project.deliverables || []).filter((d) => d.isArchived).length;
  }, [project.deliverables]);

  const progress = getProjectProgress(project);

  // Selected deliverables array
  const selectedDeliverablesList = useMemo(() => {
    return (project.deliverables || []).filter((d) => selectedIds[d.id]);
  }, [project.deliverables, selectedIds]);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Select all / deselect all
  const handleSelectAll = () => {
    if (selectedDeliverablesList.length === deliverables.length) {
      setSelectedIds({});
    } else {
      const map: Record<string, boolean> = {};
      deliverables.forEach((d) => {
        map[d.id] = true;
      });
      setSelectedIds(map);
    }
  };

  // --------------------------------------------------------------------------
  // ONE-BY-ONE COMPLETION / REOPEN
  // --------------------------------------------------------------------------
  const handleToggleCompletion = (deliverableId: string) => {
    const currentItem = (project.deliverables || []).find((d) => d.id === deliverableId);
    if (!currentItem) return;

    const willBeCompleted = !currentItem.isCompleted;

    const updatedDeliverables = (project.deliverables || []).map((d) => {
      if (d.id === deliverableId) {
        if (willBeCompleted) {
          return {
            ...d,
            isCompleted: true,
            status: 'Completed',
            completedAt: formatSystemTimestamp(),
            completedBy: 'Admin',
          };
        } else {
          return {
            ...d,
            isCompleted: false,
            status: d.status === 'Completed' ? 'In Progress' : d.status,
            reopenedAt: formatSystemTimestamp(),
            reopenedBy: 'Admin',
          };
        }
      }
      return d;
    });

    const actionText = willBeCompleted
      ? `"${currentItem.title}" marked Completed by Admin`
      : `"${currentItem.title}" reopened (marked Incomplete) by Admin`;

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      history: logHistory(actionText),
    });
  };

  // --------------------------------------------------------------------------
  // ADD DELIVERABLE SUBMISSION
  // --------------------------------------------------------------------------
  const handleAddDeliverableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    // Resolve designer name
    let finalDesignerName = formDesignerName;
    if (formDesignerId === 'unassigned') {
      finalDesignerName = 'Unassigned';
    } else if (formDesignerId) {
      const matched = designers.find((d) => d.id === formDesignerId);
      if (matched) finalDesignerName = matched.name;
    }

    const newDeliverable: ProjectDeliverable = {
      id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: formTitle.trim(),
      type: formType,
      description: formDescription.trim() || undefined,
      isRequired: formIsRequired,
      isCompleted: false,
      hasDeadline: formHasDeadline,
      deadlineDate: formHasDeadline ? formDeadlineDate || undefined : undefined,
      deadlineTime: formHasDeadline && formDeadlineDate ? formDeadlineTime || '18:00' : undefined,
      assignedDesignerId: formDesignerId === 'unassigned' ? undefined : formDesignerId,
      assignedDesignerName: finalDesignerName,
      customDisplayName: formCustomDisplayName.trim() || undefined,
      priority: formPriority,
      status: formStatus || 'New',
      orderIndex: (project.deliverables?.length || 0) + 1,
      amount: formClientAmount ? parseFloat(formClientAmount) : undefined,
      designerFee: formDesignerFee ? parseFloat(formDesignerFee) : undefined,
      revisions: [],
      attachments: [],
    };

    const actionLog = `Added deliverable: "${newDeliverable.title}" (${newDeliverable.type} · ${finalDesignerName}${newDeliverable.amount ? ` · ${formatINR(newDeliverable.amount)}` : ''})`;

    onUpdateProject({
      ...project,
      deliverables: [...(project.deliverables || []), newDeliverable],
      history: logHistory(actionLog),
    });

    // Reset Form
    setFormTitle('');
    setFormDescription('');
    setFormClientAmount('');
    setFormDesignerFee('');
    setFormCustomDisplayName('');
    setShowAddForm(false);
  };

  // --------------------------------------------------------------------------
  // EDIT DELIVERABLE SUBMISSION
  // --------------------------------------------------------------------------
  const handleSaveEditedDeliverable = (updatedDel: ProjectDeliverable) => {
    const updatedDeliverables = (project.deliverables || []).map((d) =>
      d.id === updatedDel.id ? updatedDel : d
    );

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      history: logHistory(`Deliverable edited: "${updatedDel.title}"`),
    });
    setEditingDeliverable(null);
  };

  // --------------------------------------------------------------------------
  // DELETE / ARCHIVE DELIVERABLE
  // --------------------------------------------------------------------------
  const handleArchiveDeliverable = (delId: string) => {
    const target = (project.deliverables || []).find((d) => d.id === delId);
    if (!target) return;

    const nextArchivedState = !target.isArchived;
    const updatedDeliverables = (project.deliverables || []).map((d) =>
      d.id === delId ? { ...d, isArchived: nextArchivedState } : d
    );

    const logText = nextArchivedState
      ? `Archived deliverable: "${target.title}"`
      : `Restored archived deliverable: "${target.title}"`;

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      history: logHistory(logText),
    });
  };

  const handlePermanentDeleteDeliverable = (delId: string) => {
    const target = (project.deliverables || []).find((d) => d.id === delId);
    const updatedDeliverables = (project.deliverables || []).filter((d) => d.id !== delId);

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      history: logHistory(`Deleted deliverable: "${target?.title || 'Item'}"`),
    });
    setDeleteConfirmDeliverable(null);
  };

  // --------------------------------------------------------------------------
  // REORDER DELIVERABLES
  // --------------------------------------------------------------------------
  const handleMoveDeliverable = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const currentList = [...deliverables];
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    const temp = currentList[index];
    currentList[index] = currentList[targetIdx];
    currentList[targetIdx] = temp;

    const reordered = currentList.map((d, i) => ({ ...d, orderIndex: i + 1 }));

    // If there were archived items not in current view, merge them
    const otherItems = (project.deliverables || []).filter(
      (d) => !currentList.some((c) => c.id === d.id)
    );

    onUpdateProject({
      ...project,
      deliverables: [...reordered, ...otherItems],
    });
  };

  // --------------------------------------------------------------------------
  // REVISIONS HANDLERS
  // --------------------------------------------------------------------------
  const handleAddRevisionToDeliverable = (
    deliverableId: string,
    revisionNote: string,
    designerName?: string
  ) => {
    const target = (project.deliverables || []).find((d) => d.id === deliverableId);
    if (!target || !revisionNote.trim()) return;

    const currentRevs = target.revisions || [];
    const newRevNo = currentRevs.length + 1;

    const newRevision: ProjectDeliverableRevision = {
      id: `rev-${Date.now()}`,
      revisionNo: newRevNo,
      date: new Date().toISOString().split('T')[0],
      note: revisionNote.trim(),
      designerName: designerName || target.customDisplayName || target.assignedDesignerName || 'Designer',
      deliverableId,
      createdAt: formatSystemTimestamp(),
    };

    const updatedDeliverables = (project.deliverables || []).map((d) => {
      if (d.id === deliverableId) {
        return {
          ...d,
          status: 'Revision',
          revisions: [...(d.revisions || []), newRevision],
        };
      }
      return d;
    });

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      history: logHistory(
        `Added Revision #${newRevNo} to "${target.title}": "${revisionNote.trim()}"`
      ),
    });

    setRevisionDeliverable(null);
  };

  // --------------------------------------------------------------------------
  // FILE ATTACHMENT HANDLERS
  // --------------------------------------------------------------------------
  const handleAttachFileToDeliverable = (
    deliverableId: string,
    fileObj: { name: string; size?: string; category?: string; url?: string }
  ) => {
    const target = (project.deliverables || []).find((d) => d.id === deliverableId);
    if (!target || !fileObj.name.trim()) return;

    const fileId = `file-${Date.now()}`;
    const vaultAsset = registerVaultFile('project', project.id, {
      id: fileId,
      name: fileObj.name.trim(),
      size: fileObj.size || '1.8 MB',
      category: fileObj.category || 'Draft',
      url: fileObj.url || undefined,
      subEntityId: deliverableId,
      uploadedAt: formatSystemTimestamp(),
    });

    const newFile: ProjectFileAttachment = {
      id: fileId,
      name: fileObj.name.trim(),
      size: fileObj.size || '1.8 MB',
      category: fileObj.category || 'Draft',
      url: fileObj.url || undefined,
      deliverableId,
      uploadedAt: formatSystemTimestamp(),
      storagePath: vaultAsset.storagePath,
    };

    const updatedDeliverables = (project.deliverables || []).map((d) => {
      if (d.id === deliverableId) {
        return {
          ...d,
          attachments: [...(d.attachments || []), newFile],
        };
      }
      return d;
    });

    // Also link to project overall files list
    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      files: [...(project.files || []), newFile],
      history: logHistory(`File attached to "${target.title}": "${fileObj.name.trim()}"`),
    });

    setFilesDeliverable(null);
  };

  const handleDeleteDeliverableAttachment = (deliverableId: string, fileId: string, storagePath?: string) => {
    removeVaultFile(storagePath || fileId);
    const updatedDeliverables = (project.deliverables || []).map((d) => {
      if (d.id === deliverableId) {
        return {
          ...d,
          attachments: (d.attachments || []).filter((a) => a.id !== fileId),
        };
      }
      return d;
    });
    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      files: (project.files || []).filter((f) => f.id !== fileId),
    });
    setFilesDeliverable((prev) => {
      if (!prev || prev.id !== deliverableId) return prev;
      return {
        ...prev,
        attachments: (prev.attachments || []).filter((a) => a.id !== fileId),
      };
    });
  };

  // --------------------------------------------------------------------------
  // BULK ACTIONS
  // --------------------------------------------------------------------------
  const handleApplyBulkDesigner = (designerId: string, customName?: string) => {
    let name = 'Unassigned';
    if (designerId !== 'unassigned') {
      const match = designers.find((d) => d.id === designerId);
      if (match) name = match.name;
    }

    const updatedDeliverables = (project.deliverables || []).map((d) => {
      if (selectedIds[d.id]) {
        return {
          ...d,
          assignedDesignerId: designerId === 'unassigned' ? undefined : designerId,
          assignedDesignerName: name,
          customDisplayName: customName || undefined,
        };
      }
      return d;
    });

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      history: logHistory(`Bulk assigned ${selectedDeliverablesList.length} deliverables to ${customName || name}`),
    });

    setShowBulkDesignerModal(false);
    setSelectedIds({});
  };

  const handleApplyBulkDeadline = (date: string, time: string) => {
    const updatedDeliverables = (project.deliverables || []).map((d) => {
      if (selectedIds[d.id]) {
        return {
          ...d,
          hasDeadline: Boolean(date),
          deadlineDate: date || undefined,
          deadlineTime: date ? time || '18:00' : undefined,
        };
      }
      return d;
    });

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      history: logHistory(`Bulk updated deadline for ${selectedDeliverablesList.length} deliverables to ${date}`),
    });

    setShowBulkDeadlineModal(false);
    setSelectedIds({});
  };

  const handleBulkArchive = () => {
    const count = selectedDeliverablesList.length;
    const updatedDeliverables = (project.deliverables || []).map((d) => {
      if (selectedIds[d.id]) {
        return {
          ...d,
          isArchived: true,
        };
      }
      return d;
    });

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
      history: logHistory(`Bulk archived ${count} deliverables`),
    });

    setSelectedIds({});
  };

  // --------------------------------------------------------------------------
  // CREATE INVOICE FROM SELECTED
  // --------------------------------------------------------------------------
  const handleCreateInvoiceFromSelected = () => {
    if (onOpenCreateInvoice) {
      onOpenCreateInvoice(selectedDeliverablesList);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & PROGRESS SUMMARY STRIP */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-600" />
                <span>Deliverables &amp; Milestones</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-50 text-violet-700 border border-violet-200">
                {deliverables.length} total
              </span>
              {archivedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowArchived(!showArchived)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  {showArchived ? 'Hide Archived' : `${archivedCount} Archived`}
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Click circle (○) to complete (✓) one deliverable at a time. System records exact completion time automatically.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {onSaveAsTemplate && (
              <button
                type="button"
                onClick={() => onSaveAsTemplate(project)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 text-xs cursor-pointer"
                title="Save this deliverable structure as a reusable template"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>Save Template</span>
              </button>
            )}

            {/* [ + ADD DELIVERABLE ] Button (Prominent) */}
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-4 py-2 font-black rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer active:scale-95 ${
                showAddForm
                  ? 'bg-slate-800 text-white hover:bg-slate-900'
                  : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30'
              }`}
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[3]" />}
              <span>{showAddForm ? 'Close Form' : '+ ADD DELIVERABLE'}</span>
            </button>
          </div>
        </div>

        {/* 2. PROGRESS BAR & ONE-BY-ONE METRICS */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900">
                {progress.completedRequired} / {progress.totalRequired} required completed
              </span>
              <span className="font-extrabold text-violet-600">({progress.percent}%)</span>
              {progress.totalDeliverables > progress.totalRequired && (
                <span className="text-[11px] text-slate-400 font-medium">
                  • {progress.totalCompleted - progress.completedRequired} optional completed
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Total items: {progress.totalCompleted}/{progress.totalDeliverables}
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                progress.isAllRequiredCompleted
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : 'bg-violet-600 shadow-sm shadow-violet-600/50'
              }`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          {/* 3. ALL REQUIRED DELIVERABLES COMPLETED BANNER */}
          {progress.isAllRequiredCompleted && deliverables.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-emerald-900 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">
                  All {progress.totalRequired} required deliverables completed! Ready for client sign-off.
                </span>
              </div>
              {project.status !== 'Completed' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Mark this entire project as COMPLETED now?')) {
                      onUpdateProject({
                        ...project,
                        status: 'Completed',
                        history: logHistory('Marked Project Completed after all deliverables finished'),
                      });
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-lg shadow-xs transition flex items-center gap-1 text-[11px] shrink-0 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Project Completed</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. ADD DELIVERABLE COMPACT FORM (Section 2) */}
      {showAddForm && (
        <form
          onSubmit={handleAddDeliverableSubmit}
          className="bg-violet-50/70 border-2 border-violet-300/80 rounded-2xl p-4 sm:p-5 shadow-md space-y-3.5 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-violet-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-violet-600 text-white rounded-lg">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                  Add New Deliverable / Milestone
                </h4>
                <p className="text-[10px] text-slate-500">
                  Fill in the details below to add work item with designer and deadline tracking.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            {/* Field: Deliverable Name * */}
            <div className="sm:col-span-6 space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">
                Deliverable Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Logo Concept Design & Initial Proofs"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
              />
            </div>

            {/* Field: Type (+ Custom Type) */}
            <div className="sm:col-span-3 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-slate-800 text-[11px]">Type</label>
                <button
                  type="button"
                  onClick={() => setShowCustomTypeInput(!showCustomTypeInput)}
                  className="text-[10px] font-bold text-violet-700 hover:underline cursor-pointer"
                >
                  + Custom Type
                </button>
              </div>

              {showCustomTypeInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customTypeName}
                    onChange={(e) => setCustomTypeName(e.target.value)}
                    placeholder="Custom type name"
                    className="w-full px-2 py-1.5 bg-white border border-violet-400 rounded-lg text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customTypeName.trim()) {
                        setFormType(customTypeName.trim());
                        if (onAddDeliverableType) onAddDeliverableType(customTypeName.trim());
                        setShowCustomTypeInput(false);
                        setCustomTypeName('');
                      }
                    }}
                    className="px-2 py-1.5 bg-violet-600 text-white rounded-lg font-bold text-[10px]"
                  >
                    Set
                  </button>
                </div>
              ) : (
                <select
                  value={formType}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setShowCustomTypeInput(true);
                    } else {
                      setFormType(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600 cursor-pointer"
                >
                  <option value="Deliverable">Deliverable</option>
                  <option value="Milestone">Milestone</option>
                  <option value="Revision">Revision</option>
                  <option value="Review">Review</option>
                  <option value="Approval">Approval</option>
                  <option value="Handover">Handover</option>
                  <option value="Custom">Custom</option>
                  {deliverableTypes
                    .filter((t) => !['Deliverable', 'Milestone', 'Revision', 'Review', 'Approval', 'Handover', 'Custom'].includes(t.name))
                    .map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  <option value="__custom__">+ Custom Type...</option>
                </select>
              )}
            </div>

            {/* Field: Priority (+ Custom Priority) */}
            <div className="sm:col-span-3 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-slate-800 text-[11px]">Priority</label>
                <button
                  type="button"
                  onClick={() => setShowCustomPriorityInput(!showCustomPriorityInput)}
                  className="text-[10px] font-bold text-violet-700 hover:underline cursor-pointer"
                >
                  + Custom
                </button>
              </div>

              {showCustomPriorityInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customPriorityName}
                    onChange={(e) => setCustomPriorityName(e.target.value)}
                    placeholder="Priority"
                    className="w-full px-2 py-1.5 bg-white border border-violet-400 rounded-lg text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customPriorityName.trim()) {
                        setFormPriority(customPriorityName.trim());
                        setShowCustomPriorityInput(false);
                        setCustomPriorityName('');
                      }
                    }}
                    className="px-2 py-1.5 bg-violet-600 text-white rounded-lg font-bold text-[10px]"
                  >
                    Set
                  </button>
                </div>
              ) : (
                <select
                  value={formPriority}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setShowCustomPriorityInput(true);
                    } else {
                      setFormPriority(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600 cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                  <option value="__custom__">+ Custom Priority...</option>
                </select>
              )}
            </div>

            {/* Field: Assigned Designer */}
            <div className="sm:col-span-6 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-slate-800 text-[11px]">ASSIGN DESIGNER</label>
                <button
                  type="button"
                  onClick={() => setShowAddDesignerModal(true)}
                  className="text-[10px] font-bold text-violet-700 hover:text-violet-900 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Designer</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={formDesignerId}
                  onChange={(e) => {
                    if (e.target.value === '__add_designer__') {
                      setShowAddDesignerModal(true);
                    } else {
                      setFormDesignerId(e.target.value);
                      const match = designers.find((d) => d.id === e.target.value);
                      if (match) setFormDesignerName(match.name);
                      if (e.target.value === 'unassigned') setFormDesignerName('Unassigned');
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600 cursor-pointer"
                >
                  <option value="unassigned">Select Designer / Unassigned</option>
                  {designers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.type ? `(${d.type})` : d.role ? `(${d.role})` : ''}
                    </option>
                  ))}
                  <option value="unassigned">Unassigned</option>
                  <option value="__add_designer__">+ Add Designer...</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowAddDesignerModal(true)}
                  className="px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 font-extrabold rounded-xl transition flex items-center gap-1 text-xs cursor-pointer border border-violet-200 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Designer</span>
                </button>
              </div>
              
              <div className="pt-1">
                <input
                  type="text"
                  value={formCustomDisplayName}
                  onChange={(e) => setFormCustomDisplayName(e.target.value)}
                  placeholder="Custom Designer Display Name (Optional)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-violet-600"
                />
              </div>
            </div>

            {/* Field: Deadline (Date, Time, No Deadline) */}
            <div className="sm:col-span-6 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-slate-800 text-[11px]">Deadline</label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formHasDeadline}
                    onChange={(e) => setFormHasDeadline(!e.target.checked)}
                    className="rounded text-violet-600 w-3 h-3"
                  />
                  <span>No Deadline</span>
                </label>
              </div>

              {formHasDeadline ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={formDeadlineDate}
                    onChange={(e) => setFormDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
                  />
                  <input
                    type="time"
                    value={formDeadlineTime}
                    onChange={(e) => setFormDeadlineTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
                  />
                </div>
              ) : (
                <div className="px-3 py-2 bg-slate-100 rounded-xl text-slate-400 font-medium italic text-[11px]">
                  Excluded from deadline alarms and schedules
                </div>
              )}
            </div>

            {/* Field: Description (Optional notes) */}
            <div className="sm:col-span-12 space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">
                Description / Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Specific requirements, aspect ratio, vector files needed, or client guidelines..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none focus:border-violet-600 resize-none"
              />
            </div>

            {/* Field: Client Amount & Designer Fee */}
            <div className="sm:col-span-3 space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">
                Client Amount ₹ (Optional)
              </label>
              <input
                type="number"
                value={formClientAmount}
                onChange={(e) => setFormClientAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">
                Designer Fee ₹ (Optional)
              </label>
              <input
                type="number"
                value={formDesignerFee}
                onChange={(e) => setFormDesignerFee(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
              />
            </div>

            {/* Field: Status */}
            <div className="sm:col-span-3 space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">Initial Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600 cursor-pointer"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Client">Waiting for Client</option>
                <option value="Revision">Revision</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Field: Required (Yes / No) */}
            <div className="sm:col-span-3 space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={formIsRequired}
                  onChange={(e) => setFormIsRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                />
                <span className="font-black text-slate-800 text-[11px]">
                  Required for 100%
                </span>
              </label>
            </div>
          </div>

          {/* Form action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-violet-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formTitle.trim()}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deliverable</span>
            </button>
          </div>
        </form>
      )}

      {/* 5. BULK SELECTION ACTIONS STRIP */}
      {selectedDeliverablesList.length > 0 && (
        <div className="bg-violet-900 text-white p-3 px-4 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-700 text-white font-black flex items-center justify-center text-xs">
              {selectedDeliverablesList.length}
            </span>
            <span className="font-extrabold">Deliverables Selected</span>
            <button
              type="button"
              onClick={() => setSelectedIds({})}
              className="text-[11px] text-violet-300 hover:text-white underline ml-2 cursor-pointer"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Create Invoice from selected */}
            {onOpenCreateInvoice && (
              <button
                type="button"
                onClick={handleCreateInvoiceFromSelected}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black rounded-xl shadow-xs transition flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>+ CREATE INVOICE FROM SELECTED</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowBulkDesignerModal(true)}
              className="px-3 py-1.5 bg-violet-800 hover:bg-violet-700 text-white font-bold rounded-xl transition flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Change Designer</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkDeadlineModal(true)}
              className="px-3 py-1.5 bg-violet-800 hover:bg-violet-700 text-white font-bold rounded-xl transition flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Change Deadline</span>
            </button>

            <button
              type="button"
              onClick={handleBulkArchive}
              className="px-3 py-1.5 bg-violet-800 hover:bg-violet-700 text-rose-200 hover:text-rose-100 font-bold rounded-xl transition flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. DELIVERABLE LIST (Section 3) */}
      {deliverables.length === 0 ? (
        // EMPTY STATE (Section 24)
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm">No deliverables yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Add individual works and milestones to track project progress, designer assignments, deadlines, and billings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-xs transition inline-flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ ADD DELIVERABLE</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Select all bar */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 font-semibold">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-800">
              <input
                type="checkbox"
                checked={deliverables.length > 0 && selectedDeliverablesList.length === deliverables.length}
                onChange={handleSelectAll}
                className="w-3.5 h-3.5 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span>Select All ({deliverables.length})</span>
            </label>
            <span>Reorder or click ○ to mark individual completion</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {deliverables.map((del, idx) => {
              const delDeadline = getDeliverableDeadlineStatus(del);
              const designerDisplayName =
                del.customDisplayName ||
                del.assignedDesignerName ||
                project.customDisplayName ||
                project.assignedDesignerName ||
                'Unassigned';

              const isChecked = Boolean(selectedIds[del.id]);

              return (
                <div
                  key={del.id}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    del.isCompleted
                      ? 'bg-slate-50/70 hover:bg-slate-50'
                      : isChecked
                      ? 'bg-violet-50/40 hover:bg-violet-50/60'
                      : 'hover:bg-slate-50/40'
                  }`}
                >
                  {/* Left: Checkbox + ONE-BY-ONE Completion Button + Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox for bulk invoicing */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(del.id)}
                      className="mt-1 w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer shrink-0"
                      title="Select for invoice / bulk action"
                    />

                    {/* ONE-BY-ONE COMPLETION CONTROL (○ -> ✓) */}
                    <button
                      type="button"
                      onClick={() => handleToggleCompletion(del.id)}
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0 cursor-pointer shadow-2xs ${
                        del.isCompleted
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700 scale-100'
                          : 'border-2 border-slate-300 text-transparent hover:border-violet-500 hover:bg-violet-50 hover:text-violet-400'
                      }`}
                      title={del.isCompleted ? 'Click to Mark Incomplete (Reopen)' : 'Click to Mark Completed'}
                    >
                      <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform duration-150 ${del.isCompleted ? 'text-white scale-100' : 'scale-75'}`} />
                    </button>

                    {/* Content */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-black text-xs sm:text-sm tracking-tight transition-all duration-200 ${
                            del.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {del.title}
                        </span>

                        {/* Type Badge */}
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-violet-100 text-violet-800 border border-violet-200">
                          {del.type || 'Deliverable'}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                            del.status === 'Completed' || del.isCompleted
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : del.status === 'Revision'
                              ? 'bg-orange-50 text-orange-800 border-orange-300'
                              : del.status === 'Waiting for Client'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {del.isCompleted ? 'Completed' : del.status || 'In Progress'}
                        </span>

                        {/* Priority Badge */}
                        {del.priority && del.priority !== 'Normal' && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                              del.priority === 'Urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : del.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {del.priority}
                          </span>
                        )}

                        {/* Required / Optional Badge (Section 15) */}
                        {del.isRequired ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Required
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-100 text-zinc-500">
                            Optional
                          </span>
                        )}

                        {/* Client Amount Tag */}
                        {del.amount !== undefined && del.amount > 0 && (
                          <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Client: {formatINR(del.amount)}
                          </span>
                        )}

                        {/* Designer Fee Tag */}
                        {del.designerFee !== undefined && del.designerFee > 0 && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                            Fee: {formatINR(del.designerFee)}
                          </span>
                        )}
                      </div>

                      {/* Description if present */}
                      {del.description && (
                        <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                          {del.description}
                        </p>
                      )}

                      {/* Metadata Row: Designer · Deadline · Completion Info · Revisions · Files */}
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-500 flex-wrap">
                        {/* Designer */}
                        <button
                          type="button"
                          onClick={() => setAssigningDeliverable(del)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-100 transition cursor-pointer text-slate-700 font-semibold"
                          title="Click to Assign / Change Designer"
                        >
                          <User className="w-3.5 h-3.5 text-violet-600" />
                          <span>
                            Assigned: <span className="font-bold text-slate-900">{designerDisplayName}</span>
                          </span>
                        </button>

                        <span className="text-slate-300">•</span>

                        {/* Deadline */}
                        {del.deadlineDate ? (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold border flex items-center gap-1 ${delDeadline.badgeClass}`}
                          >
                            <Calendar className="w-2.5 h-2.5" />
                            <span>
                              Due: {del.deadlineDate} {del.deadlineTime || ''} ({delDeadline.label})
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">No deadline</span>
                        )}

                        {/* Completion details (Section 6) */}
                        {del.isCompleted && del.completedAt && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>
                                Completed: {del.completedAt}{' '}
                                {del.completedBy ? `by ${del.completedBy}` : ''}
                              </span>
                            </span>
                          </>
                        )}

                        {/* Revisions Count Badge */}
                        {(del.revisions?.length || 0) > 0 && (
                          <>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => setRevisionDeliverable(del)}
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 transition flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>{del.revisions?.length} Revision{(del.revisions?.length || 0) > 1 ? 's' : ''}</span>
                            </button>
                          </>
                        )}

                        {/* Attachments Count Badge */}
                        {(del.attachments?.length || 0) > 0 && (
                          <>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => setFilesDeliverable(del)}
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Paperclip className="w-2.5 h-2.5" />
                              <span>{del.attachments?.length} File{(del.attachments?.length || 0) > 1 ? 's' : ''}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Actions & Reorder Controls */}
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    {/* Reorder Up / Down */}
                    <button
                      type="button"
                      onClick={() => handleMoveDeliverable(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDeliverable(idx, 'down')}
                      disabled={idx === deliverables.length - 1}
                      title="Move Down"
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* + Revision Shortcut */}
                    <button
                      type="button"
                      onClick={() => setRevisionDeliverable(del)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] transition cursor-pointer"
                      title="Log Revision note"
                    >
                      + Revision
                    </button>

                    {/* + File Shortcut */}
                    <button
                      type="button"
                      onClick={() => setFilesDeliverable(del)}
                      className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition cursor-pointer"
                      title="Attach file to deliverable"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>

                    {/* Assign Designer Shortcut */}
                    <button
                      type="button"
                      onClick={() => setAssigningDeliverable(del)}
                      className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1 border border-violet-200"
                      title="Assign Designer"
                    >
                      <User className="w-3 h-3" />
                      <span>{del.assignedDesignerId ? 'Assign' : 'Assign Designer'}</span>
                    </button>

                    {/* Edit Shortcut */}
                    <button
                      type="button"
                      onClick={() => setEditingDeliverable(del)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Edit deliverable"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Deliverable Menu (⋮) */}
                    <div className="relative group">
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu on hover/focus */}
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 hidden group-hover:block group-focus-within:block z-30 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleCompletion(del.id)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
                        >
                          {del.isCompleted ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                              <span>Mark as Incomplete</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mark as Completed</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingDeliverable(del)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit Deliverable</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAssigningDeliverable(del)}
                          className="w-full text-left px-3 py-1.5 hover:bg-violet-50 text-violet-700 font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-violet-600" />
                          <span>{del.assignedDesignerId ? 'Change Designer' : 'Assign Designer'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuickDeadlineDeliverable(del)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Change Deadline</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRevisionDeliverable(del)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                          <span>Add Revision</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFilesDeliverable(del)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-violet-500" />
                          <span>Attached Files</span>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          type="button"
                          onClick={() => handleArchiveDeliverable(del.id)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5 text-slate-400" />
                          <span>{del.isArchived ? 'Restore Deliverable' : 'Archive Deliverable'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmDeliverable(del)}
                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Delete Deliverable</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL 0: ASSIGN DESIGNER MODAL */}
      {/* ------------------------------------------------------------------ */}
      {assigningDeliverable && (
        <AssignDeliverableDesignerModal
          deliverable={assigningDeliverable}
          designers={designers}
          onUpdateDesigners={onUpdateDesigners}
          onClose={() => setAssigningDeliverable(null)}
          onSave={(updated) => {
            handleSaveEditedDeliverable(updated);
            setAssigningDeliverable(null);
          }}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL 1: EDIT DELIVERABLE (Section 8) */}
      {/* ------------------------------------------------------------------ */}
      {editingDeliverable && (
        <EditDeliverableModal
          deliverable={editingDeliverable}
          deliverableTypes={deliverableTypes}
          designers={designers}
          onClose={() => setEditingDeliverable(null)}
          onSave={handleSaveEditedDeliverable}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL 2: REVISION TRACKING (Section 17) */}
      {/* ------------------------------------------------------------------ */}
      {revisionDeliverable && (
        <DeliverableRevisionModal
          deliverable={revisionDeliverable}
          onClose={() => setRevisionDeliverable(null)}
          onAddRevision={(note, designer) =>
            handleAddRevisionToDeliverable(revisionDeliverable.id, note, designer)
          }
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL 3: FILES PER DELIVERABLE (Section 18) */}
      {/* ------------------------------------------------------------------ */}
      {filesDeliverable && (
        <DeliverableFilesModal
          deliverable={filesDeliverable}
          onClose={() => setFilesDeliverable(null)}
          onAttachFile={(fileObj) =>
            handleAttachFileToDeliverable(filesDeliverable.id, fileObj)
          }
          onDeleteFile={(fileId, storagePath) =>
            handleDeleteDeliverableAttachment(filesDeliverable.id, fileId, storagePath)
          }
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL 4: QUICK CHANGE DESIGNER */}
      {/* ------------------------------------------------------------------ */}
      {quickDesignerDeliverable && (
        <QuickChangeDesignerModal
          deliverable={quickDesignerDeliverable}
          designers={designers}
          onClose={() => setQuickDesignerDeliverable(null)}
          onSave={(designerId, customName) => {
            let name = 'Unassigned';
            if (designerId !== 'unassigned') {
              const match = designers.find((d) => d.id === designerId);
              if (match) name = match.name;
            }
            const updated = {
              ...quickDesignerDeliverable,
              assignedDesignerId: designerId === 'unassigned' ? undefined : designerId,
              assignedDesignerName: name,
              customDisplayName: customName || undefined,
            };
            handleSaveEditedDeliverable(updated);
            setQuickDesignerDeliverable(null);
          }}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL 5: QUICK CHANGE DEADLINE */}
      {/* ------------------------------------------------------------------ */}
      {quickDeadlineDeliverable && (
        <QuickChangeDeadlineModal
          deliverable={quickDeadlineDeliverable}
          onClose={() => setQuickDeadlineDeliverable(null)}
          onSave={(date, time) => {
            const updated = {
              ...quickDeadlineDeliverable,
              hasDeadline: Boolean(date),
              deadlineDate: date || undefined,
              deadlineTime: date ? time || '18:00' : undefined,
            };
            handleSaveEditedDeliverable(updated);
            setQuickDeadlineDeliverable(null);
          }}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL 6: DELETE CONFIRMATION (Section 9) */}
      {/* ------------------------------------------------------------------ */}
      {deleteConfirmDeliverable && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Delete Deliverable?</h4>
                <p className="text-slate-500 text-[11px]">
                  "{deleteConfirmDeliverable.title}"
                </p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px]">
              If this deliverable has important revision notes, payment records, or files, consider archiving it instead. Existing project timeline logs will remain safe.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmDeliverable(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleArchiveDeliverable(deleteConfirmDeliverable.id);
                  setDeleteConfirmDeliverable(null);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
              >
                Archive Instead
              </button>
              <button
                type="button"
                onClick={() => handlePermanentDeleteDeliverable(deleteConfirmDeliverable.id)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL 7: BULK DESIGNER MODAL */}
      {/* ------------------------------------------------------------------ */}
      {showBulkDesignerModal && (
        <BulkDesignerModal
          count={selectedDeliverablesList.length}
          designers={designers}
          onClose={() => setShowBulkDesignerModal(false)}
          onApply={handleApplyBulkDesigner}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL 8: BULK DEADLINE MODAL */}
      {/* ------------------------------------------------------------------ */}
      {showBulkDeadlineModal && (
        <BulkDeadlineModal
          count={selectedDeliverablesList.length}
          onClose={() => setShowBulkDeadlineModal(false)}
          onApply={handleApplyBulkDeadline}
        />
      )}

      {/* SUB-MODAL 9: ADD DESIGNER MODAL */}
      {showAddDesignerModal && (
        <AddCustomDesignerModal
          isOpen={showAddDesignerModal}
          onClose={() => setShowAddDesignerModal(false)}
          onAddDesigner={(newD) => {
            if (onUpdateDesigners) {
              onUpdateDesigners([...designers, newD]);
            }
            setFormDesignerId(newD.id);
            setFormDesignerName(newD.name);
            setShowAddDesignerModal(false);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================

// ============================================================================
// SUB-COMPONENT: ASSIGN DESIGNER MODAL
// ============================================================================
interface AssignDeliverableDesignerModalProps {
  deliverable: ProjectDeliverable;
  designers: CustomDesigner[];
  onUpdateDesigners?: (designers: CustomDesigner[]) => void;
  onClose: () => void;
  onSave: (updated: ProjectDeliverable) => void;
}

const AssignDeliverableDesignerModal: React.FC<AssignDeliverableDesignerModalProps> = ({
  deliverable,
  designers,
  onUpdateDesigners,
  onClose,
  onSave,
}) => {
  const [designerId, setDesignerId] = useState(deliverable.assignedDesignerId || 'unassigned');
  const [designerName, setDesignerName] = useState(deliverable.assignedDesignerName || 'Unassigned');
  const [customDisplayName, setCustomDisplayName] = useState(deliverable.customDisplayName || '');
  const [designerFee, setDesignerFee] = useState(deliverable.designerFee !== undefined ? String(deliverable.designerFee) : '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesignerName, setNewDesignerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalName = designerName;
    if (designerId === 'unassigned') finalName = 'Unassigned';
    else {
      const match = designers.find((d) => d.id === designerId);
      if (match) finalName = match.name;
    }
    const updated: ProjectDeliverable = {
      ...deliverable,
      assignedDesignerId: designerId === 'unassigned' ? undefined : designerId,
      assignedDesignerName: finalName,
      customDisplayName: customDisplayName.trim() || undefined,
      designerFee: designerFee ? parseFloat(designerFee) : undefined,
    };
    onSave(updated);
  };

  const handleAddDesigner = () => {
    if (!newDesignerName.trim() || !onUpdateDesigners) return;
    const newD: CustomDesigner = {
      id: 'des-' + Date.now().toString(36),
      name: newDesignerName.trim(),
      type: 'External Designer',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onUpdateDesigners([...designers, newD]);
    setDesignerId(newD.id);
    setDesignerName(newD.name);
    setNewDesignerName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
        <div className="p-4 px-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-600 text-white rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Assign Designer</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
             <span className="font-bold text-slate-700">Deliverable: {deliverable.title}</span>
             <span className="text-slate-500 text-[11px]">{deliverable.type || 'Deliverable'}</span>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Select Designer</label>
            <div className="flex items-center gap-2">
              <select
                value={designerId}
                onChange={(e) => {
                  setDesignerId(e.target.value);
                  const match = designers.find((d) => d.id === e.target.value);
                  if (match) setDesignerName(match.name);
                  if (e.target.value === 'unassigned') setDesignerName('Unassigned');
                  if (e.target.value === 'other_custom') setDesignerName('Custom Designer');
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600 cursor-pointer"
              >
                <option value="unassigned">Unassigned (Remove Assignment)</option>
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.role ? `(${d.role})` : ''}
                  </option>
                ))}
                <option value="other_custom">Other / Custom</option>
              </select>
            </div>
            {onUpdateDesigners && (
               <div className="pt-1 text-right">
                  <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="text-[10px] font-bold text-violet-600 hover:text-violet-800 transition">
                    + Add Designer
                  </button>
               </div>
            )}
          </div>

          {showAddForm && (
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl space-y-2">
              <label className="font-bold text-violet-900 text-[10px]">New Designer Name</label>
              <div className="flex gap-2">
                 <input type="text" value={newDesignerName} onChange={(e) => setNewDesignerName(e.target.value)} className="flex-1 px-3 py-1.5 border border-violet-200 rounded-lg outline-none focus:border-violet-500 font-medium" placeholder="E.g. Ali..." />
                 <button type="button" onClick={handleAddDesigner} className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition">Add</button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Custom Display Name (Optional)</label>
            <input
              type="text"
              value={customDisplayName}
              onChange={(e) => setCustomDisplayName(e.target.value)}
              placeholder="e.g. Lead Illustrator"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-violet-600"
            />
          </div>
          
          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Designer Fee ₹ (Optional)</label>
            <input
              type="number"
              value={designerFee}
              onChange={(e) => setDesignerFee(e.target.value)}
              placeholder="₹"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 transition cursor-pointer"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// SUB-COMPONENT: EDIT DELIVERABLE MODAL
// ============================================================================
interface EditDeliverableModalProps {
  deliverable: ProjectDeliverable;
  deliverableTypes?: DeliverableTypeItem[];
  designers?: CustomDesigner[];
  onUpdateDesigners?: (designers: CustomDesigner[]) => void;
  onClose: () => void;
  onSave: (updated: ProjectDeliverable) => void;
}

const EditDeliverableModal: React.FC<EditDeliverableModalProps> = ({
  deliverable,
  deliverableTypes = [],
  designers = [],
  onUpdateDesigners,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(deliverable.title);
  const [type, setType] = useState(deliverable.type || 'Deliverable');
  const [description, setDescription] = useState(deliverable.description || '');
  const [designerId, setDesignerId] = useState(deliverable.assignedDesignerId || 'unassigned');
  const [designerName, setDesignerName] = useState(deliverable.assignedDesignerName || 'Unassigned');
  const [customDisplayName, setCustomDisplayName] = useState(deliverable.customDisplayName || '');
  const [hasDeadline, setHasDeadline] = useState(deliverable.hasDeadline !== false && Boolean(deliverable.deadlineDate));
  const [deadlineDate, setDeadlineDate] = useState(deliverable.deadlineDate || '');
  const [deadlineTime, setDeadlineTime] = useState(deliverable.deadlineTime || '18:00');
  const [priority, setPriority] = useState(deliverable.priority || 'Normal');
  const [status, setStatus] = useState(deliverable.status || (deliverable.isCompleted ? 'Completed' : 'In Progress'));
  const [amount, setAmount] = useState(deliverable.amount !== undefined ? String(deliverable.amount) : '');
  const [designerFee, setDesignerFee] = useState(deliverable.designerFee !== undefined ? String(deliverable.designerFee) : '');
  const [isRequired, setIsRequired] = useState(deliverable.isRequired !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalName = designerName;
    if (designerId === 'unassigned') finalName = 'Unassigned';
    else {
      const match = designers.find((d) => d.id === designerId);
      if (match) finalName = match.name;
    }

    const updated: ProjectDeliverable = {
      ...deliverable,
      title: title.trim(),
      type,
      description: description.trim() || undefined,
      assignedDesignerId: designerId === 'unassigned' ? undefined : designerId,
      assignedDesignerName: finalName,
      customDisplayName: customDisplayName.trim() || undefined,
      hasDeadline,
      deadlineDate: hasDeadline ? deadlineDate || undefined : undefined,
      deadlineTime: hasDeadline && deadlineDate ? deadlineTime || '18:00' : undefined,
      priority,
      status,
      isCompleted: status === 'Completed' ? true : deliverable.isCompleted,
      amount: amount ? parseFloat(amount) : undefined,
      designerFee: designerFee ? parseFloat(designerFee) : undefined,
      isRequired,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-600 text-white rounded-lg">
              <Edit2 className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Edit Deliverable</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1">
          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">
              Deliverable Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
              >
                <option value="Deliverable">Deliverable</option>
                <option value="Milestone">Milestone</option>
                <option value="Revision">Revision</option>
                <option value="Review">Review</option>
                <option value="Approval">Approval</option>
                <option value="Handover">Handover</option>
                <option value="Custom">Custom</option>
                {deliverableTypes.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">Assigned Designer</label>
              <select
                value={designerId}
                onChange={(e) => {
                  setDesignerId(e.target.value);
                  const match = designers.find((d) => d.id === e.target.value);
                  if (match) setDesignerName(match.name);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
              >
                <option value="unassigned">Unassigned</option>
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">Custom Display Name</label>
              <input
                type="text"
                value={customDisplayName}
                onChange={(e) => setCustomDisplayName(e.target.value)}
                placeholder="e.g. Lead Illustrator"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-violet-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 text-[11px]">Deadline Schedule</label>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hasDeadline}
                  onChange={(e) => setHasDeadline(!e.target.checked)}
                  className="rounded text-violet-600 w-3 h-3"
                />
                <span>No Deadline</span>
              </label>
            </div>

            {hasDeadline && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
                />
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Client">Waiting for Client</option>
                <option value="Revision">Revision</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">Client Amount ₹</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">Designer Fee ₹</label>
              <input
                type="number"
                value={designerFee}
                onChange={(e) => setDesignerFee(e.target.value)}
                placeholder="₹"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-violet-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none focus:border-violet-600 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
            />
            <span className="font-bold text-slate-800 text-[11px]">
              Required deliverable (Counts toward 100% completion progress)
            </span>
          </label>

          {/* History info banner */}
          {deliverable.isCompleted && deliverable.completedAt && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px]">
              <strong>Completed:</strong> {deliverable.completedAt}{' '}
              {deliverable.completedBy ? `by ${deliverable.completedBy}` : ''}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: DELIVERABLE REVISION MODAL
// ============================================================================
interface DeliverableRevisionModalProps {
  deliverable: ProjectDeliverable;
  onClose: () => void;
  onAddRevision: (note: string, designer?: string) => void;
}

const DeliverableRevisionModal: React.FC<DeliverableRevisionModalProps> = ({
  deliverable,
  onClose,
  onAddRevision,
}) => {
  const [note, setNote] = useState('');
  const [designer, setDesigner] = useState(
    deliverable.customDisplayName || deliverable.assignedDesignerName || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onAddRevision(note.trim(), designer.trim() || undefined);
  };

  const nextRevNumber = (deliverable.revisions?.length || 0) + 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        <div className="p-4 px-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500 text-white rounded-lg">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                Revision Tracking · {deliverable.title}
              </h3>
              <p className="text-[10px] text-slate-500">
                Record feedback, change requests, and designer iteration history.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Previous Revisions */}
          <div className="space-y-2">
            <h4 className="font-black text-slate-900 text-xs">
              Previous Revisions ({(deliverable.revisions || []).length})
            </h4>
            {(deliverable.revisions || []).length === 0 ? (
              <p className="text-slate-400 italic text-[11px] p-3 bg-slate-50 rounded-xl text-center">
                No revisions logged yet for this deliverable.
              </p>
            ) : (
              <div className="space-y-2">
                {(deliverable.revisions || []).map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 bg-orange-50/50 border border-orange-200 rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black text-orange-950">
                        Revision #{rev.revisionNo}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {rev.createdAt || rev.date}
                      </span>
                    </div>
                    <p className="text-slate-800 text-xs leading-relaxed">{rev.note}</p>
                    {rev.designerName && (
                      <p className="text-[10px] text-slate-500">
                        Handled by: <strong className="text-slate-700">{rev.designerName}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Revision Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-orange-600" />
                <span>Log Revision #{nextRevNumber}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {new Date().toLocaleDateString('en-IN')}
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">
                Revision Note / Client Feedback <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Client requested a bolder serif font and darker blue primary color for the logo..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">
                Assigned Designer
              </label>
              <input
                type="text"
                value={designer}
                onChange={(e) => setDesigner(e.target.value)}
                placeholder="Designer Name"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!note.trim()}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xs transition"
              >
                Save Revision #{nextRevNumber}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: DELIVERABLE FILES MODAL
// ============================================================================
interface DeliverableFilesModalProps {
  deliverable: ProjectDeliverable;
  onClose: () => void;
  onAttachFile: (fileObj: { name: string; size?: string; category?: string; url?: string }) => void;
  onDeleteFile?: (fileId: string, storagePath?: string) => void;
}

const DeliverableFilesModal: React.FC<DeliverableFilesModalProps> = ({
  deliverable,
  onClose,
  onAttachFile,
  onDeleteFile,
}) => {
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileCategory, setFileCategory] = useState('Draft');
  const [fileUrl, setFileUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    onAttachFile({
      name: fileName.trim(),
      size: fileSize.trim() || '1.5 MB',
      category: fileCategory,
      url: fileUrl.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        <div className="p-4 px-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-600 text-white rounded-lg">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                Deliverable Files · {deliverable.title}
              </h3>
              <p className="text-[10px] text-slate-500">
                Directly attach vector assets, proofs, mockups, or source files to this work item.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Attached Files List */}
          <div className="space-y-2">
            <h4 className="font-black text-slate-900 text-xs">
              Attached Files ({(deliverable.attachments || []).length})
            </h4>
            {(deliverable.attachments || []).length === 0 ? (
              <p className="text-slate-400 italic text-[11px] p-3 bg-slate-50 rounded-xl text-center">
                No files attached directly to this deliverable yet.
              </p>
            ) : (
              <div className="space-y-2">
                {(deliverable.attachments || []).map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{file.size || '1.0 MB'}</span>
                          <span>•</span>
                          <span className="text-violet-700 font-semibold">{file.category || 'Asset'}</span>
                          <span>•</span>
                          <span>{file.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-slate-100"
                          title="Open file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {onDeleteFile && (
                        <button
                          type="button"
                          onClick={() => onDeleteFile(file.id, file.storagePath)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attach New File Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-violet-50/50 rounded-2xl border border-violet-200 space-y-3">
            <h4 className="font-black text-violet-950 text-xs flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-violet-600" />
              <span>Attach New File</span>
            </h4>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">
                File Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. logo-concept-v2.ai"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 text-[11px]">Category</label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="Draft">Draft Artwork</option>
                  <option value="Final Handover">Final Handover</option>
                  <option value="Source File">Source Vector / AI</option>
                  <option value="Design Reference">Design Reference</option>
                  <option value="Asset">Asset / Export</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 text-[11px]">Size</label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="e.g. 4.8 MB"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-800 text-[11px]">
                Cloud URL / Link (Optional)
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 text-[11px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!fileName.trim()}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xs"
              >
                Attach File
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: QUICK CHANGE DESIGNER MODAL
// ============================================================================
const QuickChangeDesignerModal: React.FC<{
  deliverable: ProjectDeliverable;
  designers: CustomDesigner[];
  onUpdateDesigners?: (designers: CustomDesigner[]) => void;
  onClose: () => void;
  onSave: (designerId: string, customName?: string) => void;
}> = ({ deliverable, designers, onClose, onSave }) => {
  const [designerId, setDesignerId] = useState(deliverable.assignedDesignerId || 'unassigned');
  const [customName, setCustomName] = useState(deliverable.customDisplayName || '');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="font-black text-slate-900 text-sm">Change Designer</h4>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Select Designer</label>
            <select
              value={designerId}
              onChange={(e) => setDesignerId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
            >
              <option value="unassigned">Unassigned</option>
              {designers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.role ? `(${d.role})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">
              Custom Display Name (Optional)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Senior Visualist"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(designerId, customName)}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-xs"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: QUICK CHANGE DEADLINE MODAL
// ============================================================================
const QuickChangeDeadlineModal: React.FC<{
  deliverable: ProjectDeliverable;
  onClose: () => void;
  onSave: (date: string, time: string) => void;
}> = ({ deliverable, onClose, onSave }) => {
  const [date, setDate] = useState(deliverable.deadlineDate || '');
  const [time, setTime] = useState(deliverable.deadlineTime || '18:00');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="font-black text-slate-900 text-sm">Change Deliverable Deadline</h4>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Due Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Due Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onSave('', '')}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 underline"
          >
            Clear Deadline
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(date, time)}
              className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-xs"
            >
              Set Deadline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: BULK DESIGNER MODAL
// ============================================================================
const BulkDesignerModal: React.FC<{
  count: number;
  designers: CustomDesigner[];
  onUpdateDesigners?: (designers: CustomDesigner[]) => void;
  onClose: () => void;
  onApply: (designerId: string, customName?: string) => void;
}> = ({ count, designers, onClose, onApply }) => {
  const [designerId, setDesignerId] = useState(designers.length > 0 ? designers[0].id : 'unassigned');
  const [customName, setCustomName] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="font-black text-slate-900 text-sm">
            Assign Designer to {count} Deliverables
          </h4>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Select Designer</label>
            <select
              value={designerId}
              onChange={(e) => setDesignerId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
            >
              <option value="unassigned">Unassigned</option>
              {designers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">
              Custom Display Name (Optional)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Design Team Alpha"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply(designerId, customName)}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-xs"
          >
            Apply to All Selected
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: BULK DEADLINE MODAL
// ============================================================================
const BulkDeadlineModal: React.FC<{
  count: number;
  onClose: () => void;
  onApply: (date: string, time: string) => void;
}> = ({ count, onClose, onApply }) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="font-black text-slate-900 text-sm">
            Set Deadline for {count} Deliverables
          </h4>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Due Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-800 text-[11px]">Due Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply(date, time)}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-xs"
          >
            Apply to All Selected
          </button>
        </div>
      </div>
    </div>
  );
};
