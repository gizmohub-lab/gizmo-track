import React, { useState } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Palette,
  Video,
  Printer,
  Globe,
  Sparkles,
  Layers,
  Box,
  Camera,
  Film,
  Monitor,
} from 'lucide-react';
import { PublicSiteService } from '../../../types';

interface ServiceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: PublicSiteService | null;
  onSave: (savedService: PublicSiteService) => void;
}

const ICON_OPTIONS = [
  { name: 'Palette', icon: Palette, label: 'Design & Brand' },
  { name: 'Video', icon: Video, label: 'Video & Motion' },
  { name: 'Printer', icon: Printer, label: 'Flex & Print' },
  { name: 'Globe', icon: Globe, label: 'Web & Digital' },
  { name: 'Layers', icon: Layers, label: 'Packaging' },
  { name: 'Sparkles', icon: Sparkles, label: 'Creative Magic' },
  { name: 'Box', icon: Box, label: 'Merchandise' },
  { name: 'Camera', icon: Camera, label: 'Visual Capture' },
  { name: 'Film', icon: Film, label: 'Commercials' },
  { name: 'Monitor', icon: Monitor, label: 'UI/UX Interfaces' },
];

export const ServiceEditorModal: React.FC<ServiceEditorModalProps> = ({
  isOpen,
  onClose,
  service,
  onSave,
}) => {
  const isEditing = Boolean(service);

  const [formData, setFormData] = useState<PublicSiteService>(() => {
    if (service) return { ...service, deliverables: [...service.deliverables] };
    return {
      id: `srv-${Date.now()}`,
      title: '',
      category: 'Brand Systems',
      iconName: 'Palette',
      turnaround: '24–48 Hours',
      desc: '',
      deliverables: ['Vector Master Files', 'Brand Guidelines PDF'],
      bestFor: 'Startups, corporate rebrands, retail businesses',
      serviceKey: 'Brand Identity',
      startingPrice: 1999,
      orderIndex: 1,
      isVisible: true,
      isFeatured: true,
    };
  });

  const [newDeliverable, setNewDeliverable] = useState('');

  if (!isOpen) return null;

  const handleAddDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable.trim()],
    }));
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a service title');
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
              {isEditing ? 'Edit Service' : 'Add New Service'}
            </h2>
            <p className="text-xs text-zinc-500">
              Configure deliverables, turnaround times, and public visibility.
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
          {/* Title and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Service Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Brand & Visual Identity"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:border-[#EE1D45]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Category / Department
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Brand Systems, Motion & 3D"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-[#EE1D45]"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1.5">
              Service Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = formData.iconName === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setFormData({ ...formData, iconName: item.name })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 border-[#EE1D45] text-[#EE1D45] font-bold shadow-2xs'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] truncate max-w-full">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Comprehensive summary of what Gizmo provides under this discipline..."
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          {/* Turnaround & Best For */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Standard Turnaround
              </label>
              <input
                type="text"
                value={formData.turnaround}
                onChange={(e) => setFormData({ ...formData, turnaround: e.target.value })}
                placeholder="e.g. 24–48 Hours / 3–5 Days"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Starting Price (₹ Optional)
              </label>
              <input
                type="number"
                min="0"
                value={formData.startingPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startingPrice: Number(e.target.value) || undefined,
                  })
                }
                placeholder="e.g. 2999"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono focus:outline-none focus:border-[#EE1D45]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Best For (Audience)
            </label>
            <input
              type="text"
              value={formData.bestFor}
              onChange={(e) => setFormData({ ...formData, bestFor: e.target.value })}
              placeholder="e.g. Retail stores, corporate launches, event promotions"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          {/* Deliverables List Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 block">
              Deliverables Included (Chips)
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDeliverable();
                  }
                }}
                placeholder="e.g. 60 FPS 4K Video Files"
                className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-[#EE1D45]"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {formData.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(idx)}
                    className="text-zinc-400 hover:text-rose-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                Visible on Public Site
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
                Feature on Homepage Disciplines
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
              <span>{isEditing ? 'Save Changes' : 'Create Service'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
