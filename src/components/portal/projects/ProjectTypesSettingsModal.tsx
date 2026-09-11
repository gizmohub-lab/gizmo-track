import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  EyeOff,
  Eye,
  ArrowUp,
  ArrowDown,
  Sliders,
  CheckCircle2,
  FileText,
  AlertCircle,
  Tag,
  Flag,
  ListTodo,
  Check,
  FolderTree,
  Activity,
  Layers,
  Save,
} from 'lucide-react';
import {
  Project,
  ProjectTypeItem,
  ProjectPriorityItem,
  DeliverableTypeItem,
  ProjectStatusItem,
  ProjectCustomFieldDef,
  ProjectTemplate,
} from '../../../types';
import { defaultProjectStatuses } from '../../../utils/projectUtils';

interface ProjectTypesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: Project[];
  projectTypes: ProjectTypeItem[];
  onSaveProjectTypes: (types: ProjectTypeItem[]) => void;
  categories?: string[];
  onSaveCategories?: (categories: string[]) => void;
  priorities: ProjectPriorityItem[];
  onSavePriorities: (items: ProjectPriorityItem[]) => void;
  projectStatuses?: ProjectStatusItem[];
  onSaveProjectStatuses?: (items: ProjectStatusItem[]) => void;
  deliverableTypes: DeliverableTypeItem[];
  onSaveDeliverableTypes: (items: DeliverableTypeItem[]) => void;
  customFields: ProjectCustomFieldDef[];
  onSaveCustomFields: (fields: ProjectCustomFieldDef[]) => void;
  templates: ProjectTemplate[];
  onSaveTemplates: (templates: ProjectTemplate[]) => void;
}

type SettingsSubTab =
  | 'project-types'
  | 'categories'
  | 'priorities'
  | 'statuses'
  | 'deliverable-types'
  | 'custom-fields'
  | 'templates';

export const ProjectTypesSettingsModal: React.FC<ProjectTypesSettingsModalProps> = ({
  isOpen,
  onClose,
  projects = [],
  projectTypes,
  onSaveProjectTypes,
  categories = [],
  onSaveCategories,
  priorities,
  onSavePriorities,
  projectStatuses = defaultProjectStatuses,
  onSaveProjectStatuses,
  deliverableTypes,
  onSaveDeliverableTypes,
  customFields,
  onSaveCustomFields,
  templates,
  onSaveTemplates,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsSubTab>('project-types');

  // Toast State
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Delete Target Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: 'Project Type' | 'Category' | 'Priority' | 'Project Status' | 'Deliverable Type' | 'Custom Field' | 'Template';
    usageCount: number;
  } | null>(null);

  // 1. PROJECT TYPES STATE
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [editTypeDesc, setEditTypeDesc] = useState('');

  // 2. DESIGN WORK CATEGORIES STATE
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  // 3. PRIORITIES STATE
  const [newPriName, setNewPriName] = useState('');
  const [newPriDesc, setNewPriDesc] = useState('');
  const [newPriColor, setNewPriColor] = useState('text-violet-700 bg-violet-50 border-violet-200');
  const [editingPriId, setEditingPriId] = useState<string | null>(null);
  const [editPriName, setEditPriName] = useState('');
  const [editPriDesc, setEditPriDesc] = useState('');
  const [editPriColor, setEditPriColor] = useState('');

  // 4. PROJECT STATUSES STATE
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusDesc, setNewStatusDesc] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('text-blue-700 bg-blue-50 border-blue-200');
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editStatusName, setEditStatusName] = useState('');
  const [editStatusDesc, setEditStatusDesc] = useState('');
  const [editStatusColor, setEditStatusColor] = useState('');

  // 5. DELIVERABLE TYPES STATE
  const [newDelTypeName, setNewDelTypeName] = useState('');
  const [newDelTypeDesc, setNewDelTypeDesc] = useState('');
  const [editingDelTypeId, setEditingDelTypeId] = useState<string | null>(null);
  const [editDelTypeName, setEditDelTypeName] = useState('');
  const [editDelTypeDesc, setEditDelTypeDesc] = useState('');

  // 6. CUSTOM FIELDS STATE
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'dropdown' | 'date' | 'boolean'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // 7. TEMPLATE STATE
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateType, setNewTemplateType] = useState('Branding');
  const [newTemplateDeliverables, setNewTemplateDeliverables] = useState<
    Array<{ title: string; type: string; description?: string; isRequired: boolean; orderIndex: number }>
  >([
    { title: 'Concept Design & Initial Proof', type: 'Milestone', isRequired: true, orderIndex: 1 },
    { title: 'Client Review & Feedback', type: 'Review', isRequired: true, orderIndex: 2 },
    { title: 'Final Design & Artwork', type: 'Deliverable', isRequired: true, orderIndex: 3 },
    { title: 'Source Files Handover', type: 'Handover', isRequired: true, orderIndex: 4 },
  ]);

  if (!isOpen) return null;

  // ==========================================
  // HANDLERS: PROJECT TYPES
  // ==========================================
  const handleAddProjectType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const item: ProjectTypeItem = {
      id: `pt-${Date.now()}`,
      name: newTypeName.trim(),
      description: newTypeDesc.trim() || undefined,
      isActive: true,
      displayOrder: projectTypes.length + 1,
    };
    const updated = [...projectTypes, item];
    onSaveProjectTypes(updated);

    // Sync categories array
    if (onSaveCategories) {
      const catNames = Array.from(new Set([...categories, item.name]));
      onSaveCategories(catNames);
    }

    setNewTypeName('');
    setNewTypeDesc('');
    showToast(`Added Project Type "${item.name}"`);
  };

  const handleToggleTypeStatus = (id: string) => {
    const updated = projectTypes.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t));
    onSaveProjectTypes(updated);
    const target = projectTypes.find((t) => t.id === id);
    showToast(`${target?.isActive ? 'Deactivated' : 'Activated'} "${target?.name}"`);
  };

  const handleStartEditType = (t: ProjectTypeItem) => {
    setEditingTypeId(t.id);
    setEditTypeName(t.name);
    setEditTypeDesc(t.description || '');
  };

  const handleSaveEditType = (id: string) => {
    if (!editTypeName.trim()) return;
    const updated = projectTypes.map((t) =>
      t.id === id ? { ...t, name: editTypeName.trim(), description: editTypeDesc.trim() || undefined } : t
    );
    onSaveProjectTypes(updated);
    setEditingTypeId(null);
    showToast(`Updated Project Type "${editTypeName.trim()}"`);
  };

  const handleRequestDeleteType = (t: ProjectTypeItem) => {
    const count = projects.filter(
      (p) =>
        (p.projectType && p.projectType.toLowerCase() === t.name.toLowerCase()) ||
        (p.category && p.category.toLowerCase() === t.name.toLowerCase())
    ).length;
    setDeleteTarget({
      id: t.id,
      name: t.name,
      type: 'Project Type',
      usageCount: count,
    });
  };

  const handleMoveType = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= projectTypes.length) return;
    const copy = [...projectTypes];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    const updated = copy.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    onSaveProjectTypes(updated);
  };

  // ==========================================
  // HANDLERS: DESIGN WORK CATEGORIES
  // ==========================================
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newName = newCatName.trim();
    const item: ProjectTypeItem = {
      id: `pt-cat-${Date.now()}`,
      name: newName,
      description: newCatDesc.trim() || undefined,
      isActive: true,
      displayOrder: projectTypes.length + 1,
    };
    onSaveProjectTypes([...projectTypes, item]);
    if (onSaveCategories) {
      onSaveCategories(Array.from(new Set([...categories, newName])));
    }
    setNewCatName('');
    setNewCatDesc('');
    showToast(`Added Category "${newName}"`);
  };

  // ==========================================
  // HANDLERS: PRIORITIES
  // ==========================================
  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriName.trim()) return;
    const item: ProjectPriorityItem = {
      id: `pri-${Date.now()}`,
      name: newPriName.trim(),
      description: newPriDesc.trim() || undefined,
      displayOrder: priorities.length + 1,
      isActive: true,
      color: newPriColor,
    };
    onSavePriorities([...priorities, item]);
    setNewPriName('');
    setNewPriDesc('');
    showToast(`Added Priority "${item.name}"`);
  };

  const handleTogglePriority = (id: string) => {
    const updated = priorities.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
    onSavePriorities(updated);
    const target = priorities.find((p) => p.id === id);
    showToast(`${target?.isActive ? 'Deactivated' : 'Activated'} "${target?.name}"`);
  };

  const handleStartEditPriority = (p: ProjectPriorityItem) => {
    setEditingPriId(p.id);
    setEditPriName(p.name);
    setEditPriDesc(p.description || '');
    setEditPriColor(p.color || 'text-violet-700 bg-violet-50 border-violet-200');
  };

  const handleSaveEditPriority = (id: string) => {
    if (!editPriName.trim()) return;
    const updated = priorities.map((p) =>
      p.id === id
        ? {
            ...p,
            name: editPriName.trim(),
            description: editPriDesc.trim() || undefined,
            color: editPriColor,
          }
        : p
    );
    onSavePriorities(updated);
    setEditingPriId(null);
    showToast(`Updated Priority "${editPriName.trim()}"`);
  };

  const handleRequestDeletePriority = (p: ProjectPriorityItem) => {
    const count = projects.filter((proj) => proj.priority?.toLowerCase() === p.name.toLowerCase()).length;
    setDeleteTarget({
      id: p.id,
      name: p.name,
      type: 'Priority',
      usageCount: count,
    });
  };

  // ==========================================
  // HANDLERS: PROJECT STATUSES
  // ==========================================
  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) return;
    const item: ProjectStatusItem = {
      id: `st-${Date.now()}`,
      name: newStatusName.trim(),
      description: newStatusDesc.trim() || undefined,
      displayOrder: (projectStatuses?.length || 0) + 1,
      isActive: true,
      color: newStatusColor,
    };
    if (onSaveProjectStatuses) {
      onSaveProjectStatuses([...(projectStatuses || []), item]);
    }
    setNewStatusName('');
    setNewStatusDesc('');
    showToast(`Added Status "${item.name}"`);
  };

  const handleToggleStatus = (id: string) => {
    if (!onSaveProjectStatuses) return;
    const updated = (projectStatuses || []).map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    onSaveProjectStatuses(updated);
    const target = projectStatuses?.find((s) => s.id === id);
    showToast(`${target?.isActive ? 'Deactivated' : 'Activated'} "${target?.name}"`);
  };

  const handleStartEditStatus = (s: ProjectStatusItem) => {
    setEditingStatusId(s.id);
    setEditStatusName(s.name);
    setEditStatusDesc(s.description || '');
    setEditStatusColor(s.color || 'text-blue-700 bg-blue-50 border-blue-200');
  };

  const handleSaveEditStatus = (id: string) => {
    if (!editStatusName.trim() || !onSaveProjectStatuses) return;
    const updated = (projectStatuses || []).map((s) =>
      s.id === id
        ? {
            ...s,
            name: editStatusName.trim(),
            description: editStatusDesc.trim() || undefined,
            color: editStatusColor,
          }
        : s
    );
    onSaveProjectStatuses(updated);
    setEditingStatusId(null);
    showToast(`Updated Status "${editStatusName.trim()}"`);
  };

  const handleRequestDeleteStatus = (s: ProjectStatusItem) => {
    const count = projects.filter((proj) => proj.status?.toLowerCase() === s.name.toLowerCase()).length;
    setDeleteTarget({
      id: s.id,
      name: s.name,
      type: 'Project Status',
      usageCount: count,
    });
  };

  // ==========================================
  // HANDLERS: DELIVERABLE TYPES
  // ==========================================
  const handleAddDeliverableType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelTypeName.trim()) return;
    const item: DeliverableTypeItem = {
      id: `del-${Date.now()}`,
      name: newDelTypeName.trim(),
      description: newDelTypeDesc.trim() || undefined,
      isActive: true,
      displayOrder: deliverableTypes.length + 1,
    };
    onSaveDeliverableTypes([...deliverableTypes, item]);
    setNewDelTypeName('');
    setNewDelTypeDesc('');
    showToast(`Added Deliverable Type "${item.name}"`);
  };

  const handleToggleDeliverableType = (id: string) => {
    const updated = deliverableTypes.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d));
    onSaveDeliverableTypes(updated);
    const target = deliverableTypes.find((d) => d.id === id);
    showToast(`${target?.isActive ? 'Deactivated' : 'Activated'} "${target?.name}"`);
  };

  const handleStartEditDeliverableType = (d: DeliverableTypeItem) => {
    setEditingDelTypeId(d.id);
    setEditDelTypeName(d.name);
    setEditDelTypeDesc(d.description || '');
  };

  const handleSaveEditDeliverableType = (id: string) => {
    if (!editDelTypeName.trim()) return;
    const updated = deliverableTypes.map((d) =>
      d.id === id ? { ...d, name: editDelTypeName.trim(), description: editDelTypeDesc.trim() || undefined } : d
    );
    onSaveDeliverableTypes(updated);
    setEditingDelTypeId(null);
    showToast(`Updated Deliverable Type "${editDelTypeName.trim()}"`);
  };

  const handleRequestDeleteDeliverableType = (dt: DeliverableTypeItem) => {
    const count = projects.reduce(
      (sum, p) => sum + (p.deliverables?.filter((d) => d.type?.toLowerCase() === dt.name.toLowerCase()).length || 0),
      0
    );
    setDeleteTarget({
      id: dt.id,
      name: dt.name,
      type: 'Deliverable Type',
      usageCount: count,
    });
  };

  // ==========================================
  // HANDLERS: CUSTOM FIELDS
  // ==========================================
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const options =
      newFieldType === 'dropdown'
        ? newFieldOptions
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined;

    const item: ProjectCustomFieldDef = {
      id: `cf-${Date.now()}`,
      name: newFieldName.trim(),
      type: newFieldType,
      options,
      isRequired: newFieldRequired,
      isActive: true,
    };
    onSaveCustomFields([...customFields, item]);
    setNewFieldName('');
    setNewFieldOptions('');
    setNewFieldRequired(false);
    showToast(`Added Custom Field "${item.name}"`);
  };

  const handleToggleCustomField = (id: string) => {
    const updated = customFields.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f));
    onSaveCustomFields(updated);
    const target = customFields.find((f) => f.id === id);
    showToast(`${target?.isActive ? 'Deactivated' : 'Activated'} "${target?.name}"`);
  };

  const handleDeleteCustomField = (id: string) => {
    onSaveCustomFields(customFields.filter((f) => f.id !== id));
    showToast('Deleted Custom Field');
  };

  // ==========================================
  // HANDLERS: TEMPLATES
  // ==========================================
  const handleSaveNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    const tmpl: ProjectTemplate = {
      id: `tmpl-${Date.now()}`,
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim() || undefined,
      projectType: newTemplateType,
      deliverables: newTemplateDeliverables,
    };
    onSaveTemplates([...templates, tmpl]);
    setIsCreatingTemplate(false);
    setNewTemplateName('');
    setNewTemplateDesc('');
    showToast(`Saved Template "${tmpl.name}"`);
  };

  const handleDeleteTemplate = (id: string) => {
    onSaveTemplates(templates.filter((t) => t.id !== id));
    showToast('Deleted Template');
  };

  // ==========================================
  // DELETE TARGET EXECUTORS
  // ==========================================
  const handleExecuteDeleteAnyway = () => {
    if (!deleteTarget) return;
    const { id, name, type } = deleteTarget;

    if (type === 'Project Type' || type === 'Category') {
      onSaveProjectTypes(projectTypes.filter((t) => t.id !== id));
      if (onSaveCategories) {
        onSaveCategories(categories.filter((c) => c.toLowerCase() !== name.toLowerCase()));
      }
    } else if (type === 'Priority') {
      onSavePriorities(priorities.filter((p) => p.id !== id));
    } else if (type === 'Project Status') {
      if (onSaveProjectStatuses) {
        onSaveProjectStatuses((projectStatuses || []).filter((s) => s.id !== id));
      }
    } else if (type === 'Deliverable Type') {
      onSaveDeliverableTypes(deliverableTypes.filter((d) => d.id !== id));
    }

    showToast(`Deleted ${type} "${name}"`);
    setDeleteTarget(null);
  };

  const handleExecuteDeactivateInstead = () => {
    if (!deleteTarget) return;
    const { id, name, type } = deleteTarget;

    if (type === 'Project Type' || type === 'Category') {
      onSaveProjectTypes(projectTypes.map((t) => (t.id === id ? { ...t, isActive: false } : t)));
    } else if (type === 'Priority') {
      onSavePriorities(priorities.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
    } else if (type === 'Project Status') {
      if (onSaveProjectStatuses) {
        onSaveProjectStatuses((projectStatuses || []).map((s) => (s.id === id ? { ...s, isActive: false } : s)));
      }
    } else if (type === 'Deliverable Type') {
      onSaveDeliverableTypes(deliverableTypes.map((d) => (d.id === id ? { ...d, isActive: false } : d)));
    }

    showToast(`Deactivated ${type} "${name}"`);
    setDeleteTarget(null);
  };

  // Global Save All
  const handleSaveAll = () => {
    onSaveProjectTypes(projectTypes);
    onSavePriorities(priorities);
    onSaveDeliverableTypes(deliverableTypes);
    onSaveCustomFields(customFields);
    onSaveTemplates(templates);
    if (onSaveProjectStatuses && projectStatuses) {
      onSaveProjectStatuses(projectStatuses);
    }
    showToast('✓ All Project Settings saved successfully!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs relative">
        {/* Toast Notification Banner */}
        {toast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-950 text-emerald-100 border border-emerald-500/50 rounded-xl font-bold shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.text}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Project Settings &amp; Configuration
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Configure Project Types, Categories, Priorities, Statuses, Deliverables &amp; Templates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto py-1.5 shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('project-types')}
            className={`px-3 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'project-types'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Project Types</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
              {projectTypes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('priorities')}
            className={`px-3 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'priorities'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Priorities</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
              {priorities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('statuses')}
            className={`px-3 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'statuses'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Statuses</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
              {(projectStatuses || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('deliverable-types')}
            className={`px-3 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'deliverable-types'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Deliverables</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
              {deliverableTypes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custom-fields')}
            className={`px-3 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'custom-fields'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Fields</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
              {customFields.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Templates</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
              {templates.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: PROJECT TYPES */}
          {activeTab === 'project-types' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-violet-50/80 p-3 px-4 rounded-xl border border-violet-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-violet-700 shrink-0" />
                  <p className="text-[11px] text-violet-900 font-medium">
                    New Project Types appear immediately during Project Creation. Use <strong>[Disable]</strong> to keep existing project history intact.
                  </p>
                </div>
              </div>

              {/* Add New Form */}
              <form
                onSubmit={handleAddProjectType}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-600" />
                  <span>+ Add New Project Type</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Type Name * (e.g. Brochure, UI/UX, Motion)
                    </label>
                    <input
                      type="text"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="e.g. Brochure"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newTypeDesc}
                      onChange={(e) => setNewTypeDesc(e.target.value)}
                      placeholder="e.g. Trifold corporate brochures, product catalogs"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!newTypeName.trim()}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Project Type</span>
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Configured Project Types ({projectTypes.length})
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {projectTypes.map((t, idx) => (
                    <div
                      key={t.id}
                      className={`p-3 px-4 flex items-center justify-between gap-3 transition ${
                        t.isActive ? 'hover:bg-slate-50' : 'bg-slate-50/50 opacity-60'
                      }`}
                    >
                      {editingTypeId === t.id ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editTypeName}
                            onChange={(e) => setEditTypeName(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-violet-400 rounded-lg font-bold"
                          />
                          <input
                            type="text"
                            value={editTypeDesc}
                            onChange={(e) => setEditTypeDesc(e.target.value)}
                            placeholder="Description"
                            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-6 text-center font-mono font-bold text-slate-400 text-[10px]">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-xs">{t.name}</span>
                              {t.isActive ? (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                                  Disabled
                                </span>
                              )}
                            </div>
                            {t.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {editingTypeId === t.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEditType(t.id)}
                              className="px-2.5 py-1 bg-violet-600 text-white font-bold rounded-lg text-[11px]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTypeId(null)}
                              className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleMoveType(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveType(idx, 'down')}
                              disabled={idx === projectTypes.length - 1}
                              title="Move Down"
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartEditType(t)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleTypeStatus(t.id)}
                              className={`px-2 py-1 font-bold rounded-lg text-[11px] flex items-center gap-1 transition ${
                                t.isActive
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {t.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{t.isActive ? 'Disable' : 'Enable'}</span>
                            </button>
                            <button
                              onClick={() => handleRequestDeleteType(t)}
                              title="Delete Project Type"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESIGN WORK CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <form
                onSubmit={handleAddCategory}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-600" />
                  <span>+ Add Design Work Category</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Motion Graphics, Packaging, Outdoor"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="e.g. Animation and video assets"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!newCatName.trim()}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Category</span>
                  </button>
                </div>
              </form>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {projectTypes.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">{cat.name}</span>
                        {cat.isActive ? (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active Category
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                            Disabled
                          </span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleTypeStatus(cat.id)}
                        className={`px-2.5 py-1 font-bold rounded-lg text-[11px] transition ${
                          cat.isActive
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {cat.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleRequestDeleteType(cat)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRIORITIES */}
          {activeTab === 'priorities' && (
            <div className="space-y-4">
              <form
                onSubmit={handleAddPriority}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-600" />
                  <span>+ Add Priority Level</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Priority Name * (e.g. Low, Normal, High, Urgent, Rush, VIP)
                    </label>
                    <input
                      type="text"
                      value={newPriName}
                      onChange={(e) => setNewPriName(e.target.value)}
                      placeholder="e.g. Rush Campaign"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newPriDesc}
                      onChange={(e) => setNewPriDesc(e.target.value)}
                      placeholder="e.g. Expedited 24-hour turnaround"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!newPriName.trim()}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Priority</span>
                  </button>
                </div>
              </form>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {priorities.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    {editingPriId === p.id ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editPriName}
                          onChange={(e) => setEditPriName(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-violet-400 rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          value={editPriDesc}
                          onChange={(e) => setEditPriDesc(e.target.value)}
                          placeholder="Description"
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{p.name}</span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${p.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                          >
                            Badge
                          </span>
                          {p.isActive ? (
                            <span className="text-[9px] text-emerald-600 font-bold">Active</span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-bold">Disabled</span>
                          )}
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {editingPriId === p.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEditPriority(p.id)}
                            className="px-2.5 py-1 bg-violet-600 text-white font-bold rounded-lg text-[11px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPriId(null)}
                            className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEditPriority(p)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleTogglePriority(p.id)}
                            className={`px-2.5 py-1 font-bold rounded-lg text-[11px] transition ${
                              p.isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {p.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleRequestDeletePriority(p)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT STATUSES */}
          {activeTab === 'statuses' && (
            <div className="space-y-4">
              <form
                onSubmit={handleAddStatus}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-600" />
                  <span>+ Add Custom Project Status</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Name * (e.g. New, In Progress, Waiting for Client, Revision, Ready, Completed, Cancelled)
                    </label>
                    <input
                      type="text"
                      value={newStatusName}
                      onChange={(e) => setNewStatusName(e.target.value)}
                      placeholder="e.g. Printing Proofing"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newStatusDesc}
                      onChange={(e) => setNewStatusDesc(e.target.value)}
                      placeholder="e.g. Physical sample submitted to client for approval"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!newStatusName.trim()}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Status</span>
                  </button>
                </div>
              </form>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {(projectStatuses || []).map((st) => (
                  <div
                    key={st.id}
                    className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    {editingStatusId === st.id ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editStatusName}
                          onChange={(e) => setEditStatusName(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-violet-400 rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          value={editStatusDesc}
                          onChange={(e) => setEditStatusDesc(e.target.value)}
                          placeholder="Description"
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{st.name}</span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${st.color || 'bg-blue-50 text-blue-700 border-blue-200'}`}
                          >
                            Badge Preview
                          </span>
                          {st.isActive ? (
                            <span className="text-[9px] text-emerald-600 font-bold">Active</span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-bold">Disabled</span>
                          )}
                        </div>
                        {st.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{st.description}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {editingStatusId === st.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEditStatus(st.id)}
                            className="px-2.5 py-1 bg-violet-600 text-white font-bold rounded-lg text-[11px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStatusId(null)}
                            className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEditStatus(st)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(st.id)}
                            className={`px-2.5 py-1 font-bold rounded-lg text-[11px] transition ${
                              st.isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {st.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleRequestDeleteStatus(st)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DELIVERABLE TYPES */}
          {activeTab === 'deliverable-types' && (
            <div className="space-y-4">
              <form
                onSubmit={handleAddDeliverableType}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-600" />
                  <span>+ Add Deliverable Type</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Type Name * (e.g. Milestone, Review, Approval, Handover, Social Media Pack)
                    </label>
                    <input
                      type="text"
                      value={newDelTypeName}
                      onChange={(e) => setNewDelTypeName(e.target.value)}
                      placeholder="e.g. Social Media Pack"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newDelTypeDesc}
                      onChange={(e) => setNewDelTypeDesc(e.target.value)}
                      placeholder="e.g. Social media templates, carousels & reels"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!newDelTypeName.trim()}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Deliverable Type</span>
                  </button>
                </div>
              </form>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {deliverableTypes.map((dt) => (
                  <div
                    key={dt.id}
                    className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    {editingDelTypeId === dt.id ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editDelTypeName}
                          onChange={(e) => setEditDelTypeName(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-violet-400 rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          value={editDelTypeDesc}
                          onChange={(e) => setEditDelTypeDesc(e.target.value)}
                          placeholder="Description"
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{dt.name}</span>
                          {dt.isActive ? (
                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-bold bg-zinc-100 px-2 py-0.2 rounded-full border border-zinc-200">
                              Disabled
                            </span>
                          )}
                        </div>
                        {dt.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{dt.description}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {editingDelTypeId === dt.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEditDeliverableType(dt.id)}
                            className="px-2.5 py-1 bg-violet-600 text-white font-bold rounded-lg text-[11px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingDelTypeId(null)}
                            className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEditDeliverableType(dt)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleDeliverableType(dt.id)}
                            className={`px-2.5 py-1 font-bold rounded-lg text-[11px] transition ${
                              dt.isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {dt.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleRequestDeleteDeliverableType(dt)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOM FIELDS */}
          {activeTab === 'custom-fields' && (
            <div className="space-y-4">
              <form
                onSubmit={handleAddCustomField}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-600" />
                  <span>+ Define New Custom Field</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g. Printing Paper GSM"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Data Type
                    </label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Numeric Value</option>
                      <option value="dropdown">Dropdown List</option>
                      <option value="date">Date Picker</option>
                      <option value="boolean">Yes / No Toggle</option>
                    </select>
                  </div>
                  {newFieldType === 'dropdown' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Dropdown Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                        placeholder="e.g. 170 GSM, 250 GSM, 300 GSM"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500 font-bold"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="rounded text-violet-600"
                    />
                    <span>Make required field on Project Creation</span>
                  </label>
                  <button
                    type="submit"
                    disabled={!newFieldName.trim()}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Field</span>
                  </button>
                </div>
              </form>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {customFields.map((cf) => (
                  <div
                    key={cf.id}
                    className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">{cf.name}</span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {cf.type}
                        </span>
                        {cf.isRequired && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Required
                          </span>
                        )}
                      </div>
                      {cf.options && cf.options.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Options: {cf.options.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleCustomField(cf.id)}
                        className={`px-2.5 py-1 font-bold rounded-lg text-[11px] transition ${
                          cf.isActive
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {cf.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteCustomField(cf.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 text-[11px] font-medium">
                  Pre-configured deliverables packages for fast project setup.
                </p>
                <button
                  onClick={() => setIsCreatingTemplate(true)}
                  className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Template</span>
                </button>
              </div>

              {isCreatingTemplate && (
                <form
                  onSubmit={handleSaveNewTemplate}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                >
                  <h4 className="font-extrabold text-slate-800 text-xs">New Project Template</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Template Name *"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      required
                    />
                    <input
                      type="text"
                      value={newTemplateDesc}
                      onChange={(e) => setNewTemplateDesc(e.target.value)}
                      placeholder="Description"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTemplate(false)}
                      className="px-3.5 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTemplateName.trim()}
                      className="px-4 py-1.5 bg-violet-600 text-white font-bold rounded-xl"
                    >
                      Save Template
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.2 text-[9px] font-extrabold bg-violet-50 text-violet-700 rounded-full border border-violet-200 uppercase">
                          {tmpl.projectType}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-xs mt-1">{tmpl.name}</h4>
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(tmpl.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {tmpl.description && (
                      <p className="text-[11px] text-slate-500 leading-snug">{tmpl.description}</p>
                    )}
                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-600 font-semibold">
                      {tmpl.deliverables.length} Deliverables Configured
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved automatically &amp; synced across all modules</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save All Changes</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-xs transition"
            >
              Done &amp; Close
            </button>
          </div>
        </div>

        {/* DELETE CONFIRMATION & WARNING MODAL */}
        {deleteTarget && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    deleteTarget.usageCount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {deleteTarget.usageCount > 0 ? 'Option Currently In Use' : `Delete ${deleteTarget.type}?`}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {deleteTarget.usageCount > 0
                      ? `This ${deleteTarget.type} "${deleteTarget.name}" is currently assigned to ${deleteTarget.usageCount} project(s) or deliverable(s).`
                      : `Are you sure you want to permanently delete "${deleteTarget.name}"?`}
                  </p>
                  {deleteTarget.usageCount > 0 && (
                    <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 mt-3 text-[11px] text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <span>💡 Recommended Action: Deactivate Instead</span>
                      </div>
                      <p className="text-amber-800">
                        Deactivating hides this option from new project selections while keeping existing project history 100% intact.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                {deleteTarget.usageCount > 0 && (
                  <button
                    type="button"
                    onClick={handleExecuteDeactivateInstead}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                  >
                    Deactivate Instead
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExecuteDeleteAnyway}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                >
                  {deleteTarget.usageCount > 0 ? 'Delete Anyway' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
