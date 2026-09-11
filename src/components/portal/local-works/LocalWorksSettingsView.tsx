import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Sliders,
  Check,
  RotateCcw,
} from 'lucide-react';
import { WorkTypeItem, DesignCategory, CustomDesigner } from '../../../types';
import { SmartDefaults } from '../../../data/mockData';

interface LocalWorksSettingsViewProps {
  workTypes: WorkTypeItem[];
  categories: DesignCategory[];
  designers: CustomDesigner[];
  smartDefaults: SmartDefaults;
  onUpdateWorkTypes: (workTypes: WorkTypeItem[]) => void;
  onUpdateSmartDefaults: (defaults: SmartDefaults) => void;
  onBackToWorks?: () => void;
}

export const LocalWorksSettingsView: React.FC<LocalWorksSettingsViewProps> = ({
  workTypes,
  categories,
  designers,
  smartDefaults,
  onUpdateWorkTypes,
  onUpdateSmartDefaults,
  onBackToWorks,
}) => {
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [showAddType, setShowAddType] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Smart defaults local state
  const [defaultWorkType, setDefaultWorkType] = useState(smartDefaults.lastWorkType || 'Poster');
  const [defaultCategory, setDefaultCategory] = useState(smartDefaults.lastCategory || 'Poster');
  const [defaultDesigner, setDefaultDesigner] = useState(smartDefaults.defaultDesigner || '');

  const handleAddWorkType = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTypeName.trim();
    if (!trimmed) return;

    if (workTypes.some((wt) => wt.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('This Work Type already exists.');
      return;
    }

    const newItem: WorkTypeItem = {
      id: `wt-${Date.now()}`,
      name: trimmed,
      description: newTypeDesc.trim() || undefined,
      isActive: true,
      isSystem: false,
    };

    onUpdateWorkTypes([...workTypes, newItem]);
    setNewTypeName('');
    setNewTypeDesc('');
    setShowAddType(false);
  };

  const handleToggleWorkType = (id: string) => {
    onUpdateWorkTypes(
      workTypes.map((wt) => (wt.id === id ? { ...wt, isActive: !wt.isActive } : wt))
    );
  };

  const handleDeleteCustomType = (id: string) => {
    onUpdateWorkTypes(workTypes.filter((wt) => wt.id !== id));
  };

  const handleSaveDefaults = () => {
    onUpdateSmartDefaults({
      lastWorkType: defaultWorkType,
      lastCategory: defaultCategory,
      defaultDesigner: defaultDesigner || undefined,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-zinc-200">
        <div className="flex items-center gap-3">
          {onBackToWorks && (
            <button
              onClick={onBackToWorks}
              className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition"
              title="Back to All Works"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-[#FF5738]/10 text-[#FF5738] flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-950 tracking-tight">Local Works Settings</h1>
            <p className="text-xs text-zinc-500">
              Configure Work Types, defaults, and automated workflow options
            </p>
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings and smart defaults saved successfully!</span>
        </div>
      )}

      {/* 1. Smart Defaults Configuration Card */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
          <Sliders className="w-4 h-4 text-[#FF5738]" />
          <div>
            <h2 className="text-sm font-bold text-zinc-950">New Work Smart Defaults</h2>
            <p className="text-[11px] text-zinc-500">
              Configure what pre-fills automatically when opening the "New Local Work" modal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Default Work Type */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">Default Work Type</label>
            <select
              value={defaultWorkType}
              onChange={(e) => setDefaultWorkType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] bg-white text-zinc-900 font-medium"
            >
              <option value="Poster">Poster (Static Graphic)</option>
              <option value="Motion">Motion (Animation)</option>
              <option value="Other">Other</option>
              {workTypes
                .filter((wt) => !wt.isSystem && wt.isActive)
                .map((wt) => (
                  <option key={wt.id} value={wt.name}>
                    {wt.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Default Category */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">Default Design Category</label>
            <select
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] bg-white text-zinc-900 font-medium"
            >
              {categories
                .filter((c) => c.isActive)
                .map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Default Assigned Designer */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">Default Designer Assignment</label>
            <select
              value={defaultDesigner}
              onChange={(e) => setDefaultDesigner(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] bg-white text-zinc-900 font-medium"
            >
              <option value="">None (Unassigned by default)</option>
              {designers
                .filter((d) => d.isActive)
                .map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.type === 'Portal Staff' ? 'Staff' : 'External'})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveDefaults}
            className="px-4 py-2 bg-[#FF5738] hover:bg-[#ff4220] text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Save Smart Defaults
          </button>
        </div>
      </div>

      {/* 2. Work Types System Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#FF5738]" />
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Work Types Architecture</h2>
              <p className="text-[11px] text-zinc-500">
                First-level categorization (Poster, Motion, Other). Kept clean &amp; distinct from Design Categories.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddType(!showAddType)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF5738]" />
            <span>Add Work Type</span>
          </button>
        </div>

        {showAddType && (
          <form
            onSubmit={handleAddWorkType}
            className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-end gap-3 text-xs"
          >
            <div className="flex-1 w-full sm:w-auto">
              <label className="block font-bold text-zinc-700 mb-1">Work Type Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. 3D CGI, Branding Suite"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white"
              />
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label className="block font-bold text-zinc-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Optional description"
                value={newTypeDesc}
                onChange={(e) => setNewTypeDesc(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddType(false)}
                className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-zinc-950 text-white font-bold rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-zinc-100">
          {workTypes.map((wt) => (
            <div
              key={wt.id}
              className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50/50 px-2 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    wt.isActive ? 'bg-emerald-500' : 'bg-zinc-300'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-900">{wt.name}</span>
                    {wt.isSystem && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-500 font-mono uppercase">
                        System Default
                      </span>
                    )}
                  </div>
                  {wt.description && (
                    <p className="text-[11px] text-zinc-500 mt-0.5">{wt.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleWorkType(wt.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                    wt.isActive
                      ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {wt.isActive ? 'Disable' : 'Enable'}
                </button>
                {!wt.isSystem && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomType(wt.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Work Type"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
