import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  User,
  Sparkles,
  Tag,
  CheckCircle2,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  FileText,
  AlertCircle,
  HelpCircle,
  Building,
  Phone,
  Bookmark,
} from 'lucide-react';
import {
  Project,
  Client,
  CustomDesigner,
  ProjectTypeItem,
  ProjectPriorityItem,
  DeliverableTypeItem,
  ProjectCustomFieldDef,
  ProjectTemplate,
  ProjectDeliverable,
} from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { QuickAddCustomModal } from './QuickAddCustomModal';
import { formatSystemTimestamp, generateNextProjectCode } from '../../../utils/projectUtils';

interface ProjectCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
  existingProjects: Project[];
  clients: Client[];
  onAddClient: (newClient: Client) => void;
  designers: CustomDesigner[];
  projectTypes: ProjectTypeItem[];
  onAddProjectType: (name: string, desc?: string) => void;
  priorities: ProjectPriorityItem[];
  onAddPriority: (name: string, desc?: string) => void;
  deliverableTypes: DeliverableTypeItem[];
  onAddDeliverableType: (name: string, desc?: string) => void;
  customFields: ProjectCustomFieldDef[];
  templates: ProjectTemplate[];
  onSaveProject: (project: Project) => void;
}

const PROJECT_NAME_SUGGESTIONS = [
  'Brand Identity & Packaging',
  'Eid Campaign',
  'Restaurant Branding',
  'Social Media Campaign',
  'Annual Report & Stationery',
  'Product Launch & Motion Graphics',
];

export const ProjectCreateEditModal: React.FC<ProjectCreateEditModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  existingProjects,
  clients,
  onAddClient,
  designers,
  projectTypes,
  onAddProjectType,
  priorities,
  onAddPriority,
  deliverableTypes,
  onAddDeliverableType,
  customFields,
  templates,
  onSaveProject,
}) => {
  // Primary Fields
  const [clientId, setClientId] = useState('');
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [customClientName, setCustomClientName] = useState('');
  const [customClientBrand, setCustomClientBrand] = useState('');
  const [customClientPhone, setCustomClientPhone] = useState('');

  // Inline Add New Client State
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [inlineClientName, setInlineClientName] = useState('');
  const [inlineClientCompany, setInlineClientCompany] = useState('');
  const [inlineClientPhone, setInlineClientPhone] = useState('');

  // Project Info
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState('Branding');
  const [assignedDesignerId, setAssignedDesignerId] = useState('des-ahmed');
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [priority, setPriority] = useState('Normal');

  // Dates & Schedule
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [hasDeadline, setHasDeadline] = useState(true);
  const [deadlineDate, setDeadlineDate] = useState('2026-09-30');
  const [deadlineTime, setDeadlineTime] = useState('18:00');

  // Payment Tracking (Client Payment)
  const [totalAmount, setTotalAmount] = useState<number>(15000);
  const [amountGot, setAmountGot] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Designer Payment Tracking (Gizmo to Designer Money)
  const [designerPaymentStructure, setDesignerPaymentStructure] = useState<'Fixed Amount' | 'Percentage' | 'Per Deliverable' | 'Custom'>('Fixed Amount');
  const [designerFee, setDesignerFee] = useState<number>(4500);
  const [designerPercentage, setDesignerPercentage] = useState<number>(30);
  const [designerAmountPaid, setDesignerAmountPaid] = useState<number>(0);

  // Secondary Expandable Sections
  const [showDeliverablesSection, setShowDeliverablesSection] = useState(true);
  const [showCustomFieldsSection, setShowCustomFieldsSection] = useState(false);
  const [showNotesSection, setShowNotesSection] = useState(false);

  // Deliverables & Milestones
  const [deliverables, setDeliverables] = useState<
    Array<{
      id: string;
      title: string;
      type: string;
      description?: string;
      isRequired: boolean;
      deadlineDate?: string;
      deadlineTime?: string;
      assignedDesignerName?: string;
      orderIndex: number;
    }>
  >([
    { id: 'del-1', title: 'Concept Design & Initial Proof', type: 'Milestone', isRequired: true, orderIndex: 1 },
    { id: 'del-2', title: 'Client Review & Feedback', type: 'Review', isRequired: true, orderIndex: 2 },
    { id: 'del-3', title: 'Final Design & Artwork Production', type: 'Deliverable', isRequired: true, orderIndex: 3 },
    { id: 'del-4', title: 'Source Files Handover', type: 'Handover', isRequired: true, orderIndex: 4 },
  ]);

  // Deliverable inline adder
  const [newDelTitle, setNewDelTitle] = useState('');
  const [newDelType, setNewDelType] = useState('Deliverable');
  const [newDelRequired, setNewDelRequired] = useState(true);
  const [newDelDate, setNewDelDate] = useState('');

  // Custom Field Values
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Notes
  const [description, setDescription] = useState('');

  // Quick Add Custom Popups
  const [quickAddType, setQuickAddType] = useState<'projectType' | 'priority' | 'delType' | 'paymentMethod' | null>(null);

  // Populate data if editing
  useEffect(() => {
    if (projectToEdit) {
      setClientId(projectToEdit.clientId || '');
      setIsCustomClient(false);
      setTitle(projectToEdit.title || '');
      setProjectType(projectToEdit.projectType || projectToEdit.category || 'Branding');
      
      const existingId = projectToEdit.assignedDesignerId;
      const existingCustomName = projectToEdit.customDisplayName || projectToEdit.assignedDesignerName || '';
      const isKnownDesigner = designers.some((d) => d.id === existingId);

      if (existingId === 'unassigned') {
        setAssignedDesignerId('unassigned');
        setCustomDisplayName('');
      } else if (existingId === 'other_custom' || (!isKnownDesigner && existingId && existingId !== 'unassigned') || (existingCustomName && !isKnownDesigner)) {
        setAssignedDesignerId('other_custom');
        setCustomDisplayName(existingCustomName);
      } else if (isKnownDesigner) {
        setAssignedDesignerId(existingId);
        setCustomDisplayName(projectToEdit.customDisplayName || '');
      } else {
        setAssignedDesignerId('unassigned');
        setCustomDisplayName('');
      }

      setCustomDisplayName(projectToEdit.customDisplayName || '');
      setPriority(projectToEdit.priority || 'Normal');
      setStartDate(projectToEdit.startDate || projectToEdit.createdAt.split('T')[0]);
      setHasDeadline(projectToEdit.hasDeadline !== false);
      setDeadlineDate(projectToEdit.deadlineDate || projectToEdit.dueDate || '2026-09-30');
      setDeadlineTime(projectToEdit.deadlineTime || '18:00');
      setTotalAmount(projectToEdit.totalAmount ?? projectToEdit.budget ?? 0);
      setAmountGot(projectToEdit.amountGot ?? 0);
      setDesignerPaymentStructure(projectToEdit.designerPaymentStructure || 'Fixed Amount');
      setDesignerFee(projectToEdit.designerFee !== undefined ? Number(projectToEdit.designerFee) : Math.round((projectToEdit.totalAmount ?? 0) * 0.3));
      setDesignerPercentage(projectToEdit.designerPercentage || 30);
      setDesignerAmountPaid(projectToEdit.designerAmountPaid ?? 0);
      setDescription(projectToEdit.description || '');
      setDeliverables(
        (projectToEdit.deliverables || []).map((d, i) => ({
          id: d.id || `del-${i}`,
          title: d.title,
          type: d.type,
          description: d.description,
          isRequired: d.isRequired,
          deadlineDate: d.deadlineDate,
          deadlineTime: d.deadlineTime,
          assignedDesignerName: d.assignedDesignerName,
          orderIndex: d.orderIndex || i + 1,
        }))
      );
      setCustomFieldValues(projectToEdit.customFieldValues || {});
    } else {
      // Default reset for new project
      if (clients.length > 0) setClientId(clients[0].id);
      setTitle('');
      setProjectType('Branding');
      setAssignedDesignerId('des-ahmed');
      setCustomDisplayName('');
      setPriority('Normal');
      setStartDate(new Date().toISOString().split('T')[0]);
      setHasDeadline(true);
      setDeadlineDate('2026-09-30');
      setDeadlineTime('18:00');
      setTotalAmount(15000);
      setAmountGot(5000);
      setDescription('');
      setCustomFieldValues({});
    }
  }, [projectToEdit, clients]);

  if (!isOpen) return null;

  // Auto calculate amount to get
  const calculatedToGet = Math.max(0, Number(totalAmount || 0) - Number(amountGot || 0));
  const calculatedStatus =
    amountGot >= totalAmount && totalAmount > 0 ? 'Paid' : amountGot > 0 ? 'Partially Paid' : 'Not Paid';

  // Handle Quick Inline Client Creation
  const handleCreateInlineClient = () => {
    if (!inlineClientName.trim()) return;
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: inlineClientName.trim(),
      company: inlineClientCompany.trim() || undefined,
      phone: inlineClientPhone.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    onAddClient(newClient);
    setClientId(newClient.id);
    setShowNewClientForm(false);
    setInlineClientName('');
    setInlineClientCompany('');
    setInlineClientPhone('');
  };

  // Handle Loading a Template
  const handleLoadTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;
    setProjectType(tmpl.projectType);
    setDeliverables(
      tmpl.deliverables.map((d, idx) => ({
        id: `del-tmpl-${Date.now()}-${idx}`,
        title: d.title,
        type: d.type,
        description: d.description,
        isRequired: d.isRequired,
        orderIndex: idx + 1,
      }))
    );
  };

  // Add Deliverable
  const handleAddDeliverable = () => {
    if (!newDelTitle.trim()) return;
    setDeliverables([
      ...deliverables,
      {
        id: `del-${Date.now()}`,
        title: newDelTitle.trim(),
        type: newDelType,
        isRequired: newDelRequired,
        deadlineDate: newDelDate || undefined,
        orderIndex: deliverables.length + 1,
      },
    ]);
    setNewDelTitle('');
    setNewDelDate('');
  };

  const handleRemoveDeliverable = (delId: string) => {
    setDeliverables(deliverables.filter((d) => d.id !== delId));
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let selectedClientName = 'Selected Client';
    let selectedClientBrand = '';
    let selectedClientPhone = '';

    if (isCustomClient) {
      selectedClientName = customClientName.trim() || 'Custom Client';
      selectedClientBrand = customClientBrand.trim() || selectedClientName;
      selectedClientPhone = customClientPhone.trim();
    } else {
      const c = clients.find((client) => client.id === clientId);
      if (c) {
        selectedClientName = c.name;
        selectedClientBrand = c.company || c.name;
        selectedClientPhone = c.phone || '';
      }
    }

    // Find assigned designer name & custom name resolution
    let finalAssignedDesignerId: string | undefined = assignedDesignerId;
    let assignedDesignerName = 'Unassigned';
    let finalCustomDisplayName: string | undefined = customDisplayName.trim() || undefined;

    if (assignedDesignerId === 'unassigned') {
      finalAssignedDesignerId = undefined;
      assignedDesignerName = 'Unassigned';
      finalCustomDisplayName = undefined;
    } else if (assignedDesignerId === 'other_custom') {
      finalAssignedDesignerId = 'other_custom';
      assignedDesignerName = customDisplayName.trim() || 'Custom Designer';
      finalCustomDisplayName = customDisplayName.trim() || undefined;
    } else {
      const des = designers.find((d) => d.id === assignedDesignerId);
      finalAssignedDesignerId = assignedDesignerId;
      assignedDesignerName = des?.name || 'Designer';
      finalCustomDisplayName = customDisplayName.trim() || undefined;
    }

    const projectDeliverables: ProjectDeliverable[] = deliverables.map((d, idx) => {
      // Preserve completion status if editing
      const existingDel = projectToEdit?.deliverables?.find((ed) => ed.id === d.id);
      return {
        id: d.id || `del-${Date.now()}-${idx}`,
        title: d.title,
        type: d.type,
        description: d.description,
        isRequired: d.isRequired,
        isCompleted: existingDel ? existingDel.isCompleted : false,
        completedAt: existingDel?.completedAt,
        reopenedAt: existingDel?.reopenedAt,
        deadlineDate: d.deadlineDate,
        deadlineTime: d.deadlineTime || '18:00',
        assignedDesignerName: d.assignedDesignerName || (customDisplayName.trim() || assignedDesignerName),
        orderIndex: idx + 1,
      };
    });

    const numTotal = Number(totalAmount) || 0;
    const numGot = Number(amountGot) || 0;
    const numToGet = Math.max(0, numTotal - numGot);

    const projectPayload: Project = {
      id: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
      projectCode: projectToEdit?.projectCode || generateNextProjectCode(existingProjects),
      title: title.trim(),
      clientId: isCustomClient ? `custom-client-${Date.now()}` : clientId,
      clientName: selectedClientName,
      clientBrand: selectedClientBrand,
      clientPhone: selectedClientPhone,
      projectType,
      category: projectType, // backward compat
      assignedDesignerId: finalAssignedDesignerId,
      assignedDesignerName,
      customDisplayName: finalCustomDisplayName,
      priority,
      startDate,
      hasDeadline,
      deadlineDate: hasDeadline ? deadlineDate : undefined,
      deadlineTime: hasDeadline ? deadlineTime : undefined,
      dueDate: hasDeadline ? deadlineDate : '',
      budget: numTotal,
      totalAmount: numTotal,
      amountGot: numGot,
      amountToGet: numToGet,
      paymentStatus: calculatedStatus as any,
      payments: projectToEdit?.payments || (numGot > 0 ? [
        {
          id: `pay-${Date.now()}`,
          date: startDate,
          amount: numGot,
          method: paymentMethod,
          note: 'Initial payment recorded during project creation',
          recordedAt: formatSystemTimestamp(),
        },
      ] : []),
      designerPaymentStructure,
      designerFee: Number(designerFee) || Math.round(numTotal * 0.3),
      designerPercentage: Number(designerPercentage) || 30,
      designerAmountPaid: Number(designerAmountPaid) || 0,
      designerAmountPending: Math.max(0, (Number(designerFee) || Math.round(numTotal * 0.3)) - (Number(designerAmountPaid) || 0)),
      designerPaymentStatus: (Number(designerAmountPaid) >= (Number(designerFee) || Math.round(numTotal * 0.3)) && (Number(designerFee) || 0) > 0) ? 'Paid' : (Number(designerAmountPaid) > 0 ? 'Partially Paid' : 'Not Paid'),
      designerPayments: projectToEdit?.designerPayments || (Number(designerAmountPaid) > 0 ? [
        {
          id: `despay-${Date.now()}`,
          designerId: assignedDesignerId,
          designerName: assignedDesignerName,
          workType: 'Project',
          workId: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
          workTitle: title.trim(),
          date: startDate,
          amount: Number(designerAmountPaid),
          method: 'UPI',
          notes: 'Advance disbursement',
          recordedAt: formatSystemTimestamp(),
        }
      ] : []),
      status: projectToEdit?.status || 'In Progress',
      description,
      deliverables: projectDeliverables,
      revisions: projectToEdit?.revisions || [],
      files: projectToEdit?.files || [],
      customFieldValues,
      history: projectToEdit?.history || [
        {
          id: `hist-${Date.now()}`,
          timestamp: formatSystemTimestamp(),
          action: 'Project created in Gizmo Workspace',
          note: `Budget ₹${numTotal.toLocaleString('en-IN')} · Designer: ${customDisplayName.trim() || assignedDesignerName}`,
        },
      ],
      createdAt: projectToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveProject(projectPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {projectToEdit ? 'Edit Project Workspace' : 'Create Project Workspace'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Configure client, designer assignment, deadline schedule, and deliverable milestones.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="project-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* SECTION 1: CLIENT & BRAND * */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Building className="w-4 h-4 text-violet-600" />
                <span>CLIENT &amp; BRAND *</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomClient(!isCustomClient)}
                  className="text-[11px] font-bold text-violet-700 hover:underline"
                >
                  {isCustomClient ? '← Choose Existing Client' : '+ Custom Client Information'}
                </button>
                {!isCustomClient && (
                  <button
                    type="button"
                    onClick={() => setShowNewClientForm(!showNewClientForm)}
                    className="px-2.5 py-1 bg-violet-100 hover:bg-violet-200 text-violet-800 font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Client</span>
                  </button>
                )}
              </div>
            </div>

            {/* If regular client selection */}
            {!isCustomClient && !showNewClientForm && (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold text-slate-900 shadow-xs"
                required
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Quick New Client Inline Form */}
            {showNewClientForm && (
              <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-900 text-xs">Quick Add New Client</span>
                  <button
                    type="button"
                    onClick={() => setShowNewClientForm(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={inlineClientName}
                    onChange={(e) => setInlineClientName(e.target.value)}
                    placeholder="Client Name *"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    required
                  />
                  <input
                    type="text"
                    value={inlineClientCompany}
                    onChange={(e) => setInlineClientCompany(e.target.value)}
                    placeholder="Company / Brand"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                  <input
                    type="text"
                    value={inlineClientPhone}
                    onChange={(e) => setInlineClientPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateInlineClient}
                    className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg"
                  >
                    Add Client
                  </button>
                </div>
              </div>
            )}

            {/* Custom Client Info Fields */}
            {isCustomClient && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in">
                <input
                  type="text"
                  value={customClientName}
                  onChange={(e) => setCustomClientName(e.target.value)}
                  placeholder="Custom Client Name *"
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  required
                />
                <input
                  type="text"
                  value={customClientBrand}
                  onChange={(e) => setCustomClientBrand(e.target.value)}
                  placeholder="Brand / Organization"
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  value={customClientPhone}
                  onChange={(e) => setCustomClientPhone(e.target.value)}
                  placeholder="Contact Phone"
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* SECTION 2: PROJECT NAME * */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-800">
                PROJECT NAME * <span className="text-slate-400 font-normal">(Always editable)</span>
              </label>
              <span className="text-[10px] text-slate-400">e.g. Brand Identity &amp; Packaging</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Brand Identity &amp; Packaging"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-extrabold text-slate-900 text-sm shadow-xs"
              required
            />
            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Suggestions:</span>
              {PROJECT_NAME_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTitle(sug)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 hover:bg-violet-100 hover:text-violet-800 text-slate-600 transition"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: PROJECT TYPE & PRIORITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PROJECT TYPE */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800">PROJECT TYPE</label>
                <button
                  type="button"
                  onClick={() => setQuickAddType('projectType')}
                  className="text-[11px] font-bold text-violet-700 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Custom Project Type</span>
                </button>
              </div>
              <select
                value={projectType}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setQuickAddType('projectType');
                  } else {
                    setProjectType(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold text-slate-900"
              >
                {projectTypes
                  .filter((t) => t.isActive)
                  .map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                <option value="__custom__">+ Custom Project Type...</option>
              </select>
            </div>

            {/* PRIORITY */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800">PRIORITY</label>
                <button
                  type="button"
                  onClick={() => setQuickAddType('priority')}
                  className="text-[11px] font-bold text-violet-700 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Custom Priority</span>
                </button>
              </div>
              <select
                value={priority}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setQuickAddType('priority');
                  } else {
                    setPriority(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold text-slate-900"
              >
                {priorities
                  .filter((p) => p.isActive)
                  .map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                <option value="__custom__">+ Custom Priority...</option>
              </select>
            </div>
          </div>

          {/* SECTION 4: ASSIGNED DESIGNER & CUSTOM DISPLAY NAME (THIS PROJECT ONLY) */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assigned Designer */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">ASSIGNED DESIGNER</label>
                <select
                  value={assignedDesignerId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__add_designer__') {
                      setAssignedDesignerId('other_custom');
                    } else {
                      setAssignedDesignerId(val);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                >
                  <optgroup label="Portal Staff">
                    {designers
                      .filter((d) => d.type === 'Portal Staff')
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (Portal Staff)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="External Designers">
                    {designers
                      .filter((d) => d.type === 'External Designer')
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (External)
                        </option>
                      ))}
                  </optgroup>
                  <option value="unassigned">Unassigned</option>
                  <option value="other_custom">Other / Custom</option>
                  <option value="__add_designer__">+ Add Designer...</option>
                </select>
              </div>

              {/* Custom Display Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {assignedDesignerId === 'other_custom' ? 'CUSTOM DESIGNER NAME' : 'CUSTOM DISPLAY NAME (Optional)'}
                </label>
                <input
                  type="text"
                  value={customDisplayName}
                  onChange={(e) => setCustomDisplayName(e.target.value)}
                  placeholder={assignedDesignerId === 'other_custom' ? 'Enter designer name' : 'e.g. Ahmed Designs'}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold text-slate-900"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * Stored separately for this project only. Original designer profile is untouched. If left blank, the designer&apos;s standard profile name is used.
            </p>
          </div>

          {/* SECTION 5: DATES & DEADLINE SCHEDULE */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-violet-600" />
                <span>START DATE &amp; DEADLINE SCHEDULE</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={!hasDeadline}
                  onChange={(e) => setHasDeadline(!e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
                />
                <span className="font-bold text-slate-700 text-[11px]">No Deadline</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold"
                />
              </div>

              {hasDeadline ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deadline Date *</label>
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                      required={hasDeadline}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deadline Time</label>
                    <input
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 flex items-center p-3 bg-zinc-100 rounded-xl text-slate-500 text-[11px]">
                  <span>Project has no fixed deadline. Will not trigger dashboard alarm alerts.</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 6: PROJECT PAYMENT TRACKING */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>PROJECT PAYMENT TRACKING</span>
              </label>
              <span
                className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                  calculatedStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : calculatedStatus === 'Partially Paid'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {calculatedStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Amount (₹) *</label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  placeholder="25000"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-extrabold text-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Got (₹)</label>
                <input
                  type="number"
                  value={amountGot}
                  onChange={(e) => setAmountGot(Number(e.target.value))}
                  placeholder="10000"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-extrabold text-emerald-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Amount To Get (₹) <span className="text-slate-400 font-normal">[Auto]</span>
                </label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-extrabold text-slate-900">
                  {formatINR(calculatedToGet)}
                </div>
              </div>
            </div>

            {amountGot > 0 && (
              <div className="flex items-center gap-3 pt-1">
                <label className="text-[11px] font-bold text-slate-600">Initial Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold"
                >
                  <option value="UPI">UPI (GPay, PhonePe)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            )}
          </div>

          {/* SECTION 6B: DESIGNER PAYMENT (SEPARATED FROM CLIENT MONEY) */}
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-zinc-900 text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-orange-600" />
                <span>DESIGNER PAYMENT TRACKING</span>
              </label>
              <span className="text-[10px] font-semibold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full">
                Gizmo to Designer (Separate)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Structure</label>
                <select
                  value={designerPaymentStructure}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setDesignerPaymentStructure(val);
                    if (val === 'Percentage') {
                      setDesignerFee(Math.round((totalAmount || 0) * (designerPercentage / 100)));
                    }
                  }}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="Fixed Amount">Fixed Fee</option>
                  <option value="Percentage">Percentage of Total</option>
                  <option value="Per Deliverable">Per Deliverable</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {designerPaymentStructure === 'Percentage' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Percentage (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={designerPercentage}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setDesignerPercentage(p);
                      setDesignerFee(Math.round((totalAmount || 0) * (p / 100)));
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              ) : null}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designer Fee (₹)</label>
                <input
                  type="number"
                  value={designerFee}
                  onChange={(e) => setDesignerFee(Number(e.target.value))}
                  placeholder="4500"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-extrabold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Paid to Designer (₹)</label>
                <input
                  type="number"
                  value={designerAmountPaid}
                  onChange={(e) => setDesignerAmountPaid(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-extrabold text-emerald-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pending to Pay (₹)
                </label>
                <div className="px-3 py-2 bg-white border border-orange-200 rounded-xl font-mono font-extrabold text-orange-700">
                  {formatINR(Math.max(0, designerFee - designerAmountPaid))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7: DELIVERABLES & MILESTONES (EXPANDABLE) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div
              onClick={() => setShowDeliverablesSection(!showDeliverablesSection)}
              className="p-3.5 px-5 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-600" />
                <span className="font-extrabold text-slate-900 text-xs">
                  DELIVERABLES &amp; MILESTONES ({deliverables.length})
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Independent completion tracking &amp; milestones
                </span>
              </div>
              <div className="flex items-center gap-2">
                {templates.length > 0 && (
                  <select
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      if (e.target.value) handleLoadTemplate(e.target.value);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                  >
                    <option value="">Load from Template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
                {showDeliverablesSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {showDeliverablesSection && (
              <div className="p-4 space-y-3">
                {/* Deliverables list */}
                <div className="space-y-2">
                  {deliverables.map((del, idx) => (
                    <div
                      key={del.id}
                      className="p-2.5 px-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-4 text-center font-mono font-bold text-slate-400 text-[10px]">
                          ○
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-900">{del.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-100 text-violet-800">
                              {del.type}
                            </span>
                            {del.isRequired ? (
                              <span className="text-[9px] font-bold text-slate-600">Required</span>
                            ) : (
                              <span className="text-[9px] font-medium text-slate-400">Optional</span>
                            )}
                            {del.deadlineDate && (
                              <span className="text-[9px] text-slate-500 font-mono">
                                Due: {del.deadlineDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(del.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Deliverable Form Area (Section 14) */}
                <div className="p-3 bg-violet-50/40 rounded-xl border border-violet-200/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-violet-900 text-[11px]">+ Add Deliverable Item</span>
                    <button
                      type="button"
                      onClick={() => setQuickAddType('delType')}
                      className="text-[10px] font-bold text-violet-700 hover:underline"
                    >
                      + Custom Type
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newDelTitle}
                      onChange={(e) => setNewDelTitle(e.target.value)}
                      placeholder="Deliverable Title *"
                      className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                    <select
                      value={newDelType}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setQuickAddType('delType');
                        } else {
                          setNewDelType(e.target.value);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    >
                      {deliverableTypes
                        .filter((dt) => dt.isActive)
                        .map((dt) => (
                          <option key={dt.id} value={dt.name}>
                            {dt.name}
                          </option>
                        ))}
                      <option value="__custom__">+ Custom Type...</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddDeliverable}
                      disabled={!newDelTitle.trim()}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 8: ADMIN CUSTOM FIELDS (EXPANDABLE) */}
          {customFields.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div
                onClick={() => setShowCustomFieldsSection(!showCustomFieldsSection)}
                className="p-3.5 px-5 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-violet-600" />
                  <span className="font-extrabold text-slate-900 text-xs">
                    CUSTOM FIELDS ({customFields.filter((cf) => cf.isActive).length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Printing Size, Color Format, Quantity, Language, Platform
                  </span>
                </div>
                {showCustomFieldsSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {showCustomFieldsSection && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {customFields
                    .filter((cf) => cf.isActive)
                    .map((cf) => {
                      const val = customFieldValues[cf.id] ?? '';
                      return (
                        <div key={cf.id}>
                          <label className="block font-bold text-slate-700 mb-1">
                            {cf.name} {cf.isRequired && <span className="text-red-500">*</span>}
                          </label>
                          {cf.type === 'dropdown' && cf.options ? (
                            <select
                              value={val}
                              onChange={(e) =>
                                setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                              required={cf.isRequired}
                            >
                              <option value="">-- Choose {cf.name} --</option>
                              {cf.options.map((opt, idx) => (
                                <option key={idx} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : cf.type === 'number' ? (
                            <input
                              type="number"
                              value={val}
                              onChange={(e) =>
                                setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })
                              }
                              placeholder={`Enter ${cf.name}`}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                              required={cf.isRequired}
                            />
                          ) : cf.type === 'boolean' ? (
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                              <input
                                type="checkbox"
                                checked={Boolean(val)}
                                onChange={(e) =>
                                  setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.checked })
                                }
                                className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                              />
                              <span className="font-bold text-slate-700">Enabled</span>
                            </label>
                          ) : (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) =>
                                setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })
                              }
                              placeholder={`Enter ${cf.name}`}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                              required={cf.isRequired}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 9: NOTES & SCOPE DESCRIPTION (EXPANDABLE) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div
              onClick={() => setShowNotesSection(!showNotesSection)}
              className="p-3.5 px-5 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-600" />
                <span className="font-extrabold text-slate-900 text-xs">SCOPE OF WORK &amp; NOTES</span>
              </div>
              {showNotesSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {showNotesSection && (
              <div className="p-4">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed creative brief, client preferences, or printing specs..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 resize-none"
                />
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="project-form"
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{projectToEdit ? 'Update Project' : 'Save Project'}</span>
          </button>
        </div>

        {/* Quick Add Custom Options Popups */}
        <QuickAddCustomModal
          isOpen={quickAddType === 'projectType'}
          onClose={() => setQuickAddType(null)}
          title="Add Custom Project Type"
          placeholder="e.g. Website, Photography, Social Media"
          descriptionHelp="This project type will be saved and selectable across Gizmo Portal."
          onAdd={(name, desc) => {
            onAddProjectType(name, desc);
            setProjectType(name);
          }}
        />

        <QuickAddCustomModal
          isOpen={quickAddType === 'priority'}
          onClose={() => setQuickAddType(null)}
          title="Add Custom Priority"
          placeholder="e.g. Client Critical, Rush, VIP"
          onAdd={(name, desc) => {
            onAddPriority(name, desc);
            setPriority(name);
          }}
        />

        <QuickAddCustomModal
          isOpen={quickAddType === 'delType'}
          onClose={() => setQuickAddType(null)}
          title="Add Custom Deliverable Type"
          placeholder="e.g. Approval, Payment, Handover, Revision"
          onAdd={(name, desc) => {
            onAddDeliverableType(name, desc);
            setNewDelType(name);
          }}
        />
      </div>
    </div>
  );
};
