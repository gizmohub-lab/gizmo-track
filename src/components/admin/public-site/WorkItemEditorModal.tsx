import React, { useState } from 'react';
import { X, Check, Plus, Trash2, FolderKanban, Sparkles } from 'lucide-react';
import { Project, PublicSiteWorkItem } from '../../../types';

interface WorkItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItem: PublicSiteWorkItem | null;
  projects?: Project[];
  onSave: (savedWork: PublicSiteWorkItem) => void;
}

const GRADIENT_PRESETS = [
  { label: 'Dark Carbon', from: '#18181b', to: '#09090b' },
  { label: 'Deep Slate', from: '#0f172a', to: '#18181b' },
  { label: 'Warm Obsidian', from: '#1c1917', to: '#18181b' },
  { label: 'Gizmo Crimson', from: '#881337', to: '#09090b' },
  { label: 'Midnight Blue', from: '#1e1b4b', to: '#09090b' },
];

export const WorkItemEditorModal: React.FC<WorkItemEditorModalProps> = ({
  isOpen,
  onClose,
  workItem,
  projects = [],
  onSave,
}) => {
  const isEditing = Boolean(workItem);

  const [formData, setFormData] = useState<PublicSiteWorkItem>(() => {
    if (workItem) return { ...workItem, tags: [...workItem.tags] };
    return {
      id: `w-${Date.now()}`,
      title: '',
      clientName: '',
      category: 'Brand & Identity',
      desc: '',
      tags: ['Identity', 'Print'],
      year: new Date().getFullYear().toString(),
      gradientFrom: '#18181b',
      gradientTo: '#09090b',
      serviceKey: 'Brand Identity',
      badgeText: 'Curated Production',
      orderIndex: 1,
      isVisible: true,
      isFeatured: true,
    };
  });

  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleSelectFromProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    setFormData((prev) => ({
      ...prev,
      title: proj.title,
      clientName: proj.clientName,
      category: proj.projectType || proj.category || 'Brand & Identity',
      desc: proj.notes || `Production work for ${proj.clientName}`,
      linkedProjectId: proj.id,
      year: proj.startDate ? proj.startDate.split('-')[0] : '2026',
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));
    setNewTag('');
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a project title');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-950">
              {isEditing ? 'Edit Showcase Project' : 'Add Showcase Project'}
            </h2>
            <p className="text-xs text-zinc-500">
              Feature real client productions or custom showcase items on the public portfolio.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Quick link from existing production projects */}
          {projects.length > 0 && !isEditing && (
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-[#EE1D45]/20 space-y-2">
              <label className="text-xs font-bold text-[#EE1D45] flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4" />
                <span>Quick-Link From Existing CRM Project (Optional)</span>
              </label>
              <select
                onChange={(e) => handleSelectFromProject(e.target.value)}
                defaultValue=""
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-semibold focus:outline-none focus:border-[#EE1D45] bg-white"
              >
                <option value="" disabled>
                  -- Select a Project to Pre-fill --
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {p.clientName} ({p.projectType || 'Project'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Darul Hasaniyyah Visual Identity"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:border-[#EE1D45]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Client / Brand Name
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Darul Hasaniyyah Academy"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-[#EE1D45]"
              />
            </div>
          </div>

          {/* Category & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Portfolio Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-[#EE1D45]"
              >
                <option value="Brand & Identity">Brand &amp; Identity</option>
                <option value="Motion & Video">Motion &amp; Video</option>
                <option value="Large Format Flex & Print">Large Format Flex &amp; Print</option>
                <option value="Digital & Web">Digital &amp; Web</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Header Badge / Type Tag
              </label>
              <input
                type="text"
                value={formData.badgeText || ''}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="e.g. Institutional Visual Identity"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Case Study / Summary
            </label>
            <textarea
              rows={3}
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Detailed description of the deliverables, aesthetic execution, scale..."
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 block">
              Keywords &amp; Deliverable Tags
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g. Vector AI, 50ft Flex, 60 FPS"
                className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.tags.map((t, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-zinc-400 hover:text-rose-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient Card Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 block">
              Card Background Gradient
            </label>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENT_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      gradientFrom: p.from,
                      gradientTo: p.to,
                    })
                  }
                  className={`h-12 rounded-xl border-2 transition relative flex items-center justify-center cursor-pointer ${
                    formData.gradientFrom === p.from && formData.gradientTo === p.to
                      ? 'border-[#EE1D45] scale-105 shadow-sm'
                      : 'border-transparent'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                  }}
                  title={p.label}
                >
                  {formData.gradientFrom === p.from && formData.gradientTo === p.to && (
                    <Check className="w-4 h-4 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="w-4 h-4 rounded text-[#EE1D45] focus:ring-[#EE1D45] cursor-pointer"
              />
              <span className="text-xs font-bold text-zinc-800">
                Visible in Portfolio
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#EE1D45] focus:ring-[#EE1D45] cursor-pointer"
              />
              <span className="text-xs font-bold text-zinc-800">
                Feature on Homepage (Curated Work)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold shadow-md shadow-[#EE1D45]/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Add to Portfolio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
