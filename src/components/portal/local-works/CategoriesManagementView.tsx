import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Search,
  Layers,
  ShieldAlert,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { DesignCategory, LocalWork } from '../../../types';

interface CategoriesManagementViewProps {
  categories?: DesignCategory[];
  localWorks?: LocalWork[];
  works?: LocalWork[];
  onAddCategory?: (category: DesignCategory) => void;
  onUpdateCategory?: (category: DesignCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onReorderCategories?: (newOrder: DesignCategory[]) => void;
  onUpdateCategories?: (categories: DesignCategory[]) => void;
  onSelectCategoryForFilter?: (categoryName: string) => void;
  onBackToWorks?: () => void;
}

export const CategoriesManagementView: React.FC<CategoriesManagementViewProps> = ({
  categories: propCategories = [],
  localWorks: propLocalWorks,
  works: propWorks,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onUpdateCategories,
  onSelectCategoryForFilter,
  onBackToWorks,
}) => {
  const categories = propCategories || [];
  const localWorks = propLocalWorks || propWorks || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // Statistics
  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const disabledCount = categories.filter((c) => !c.isActive).length;

  const getWorkCount = (catName: string) => {
    return localWorks.filter((w) => w.category === catName).length;
  };

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('A category with this name already exists.');
      return;
    }

    const newCategory: DesignCategory = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      description: newCatDesc.trim() || undefined,
      isActive: true,
      displayOrder: categories.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (onAddCategory) {
      onAddCategory(newCategory);
    } else if (onUpdateCategories) {
      onUpdateCategories([...categories, newCategory]);
    }
    setNewCatName('');
    setNewCatDesc('');
    setShowAddForm(false);
  };

  const handleStartEdit = (cat: DesignCategory) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
  };

  const handleSaveEdit = (cat: DesignCategory) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    const updated = {
      ...cat,
      name: trimmed,
      description: editDesc.trim() || undefined,
    };

    if (onUpdateCategory) {
      onUpdateCategory(updated);
    } else if (onUpdateCategories) {
      onUpdateCategories(categories.map((c) => (c.id === cat.id ? updated : c)));
    }
    setEditingCatId(null);
  };

  const handleToggleActive = (cat: DesignCategory) => {
    const updated = {
      ...cat,
      isActive: !cat.isActive,
    };

    if (onUpdateCategory) {
      onUpdateCategory(updated);
    } else if (onUpdateCategories) {
      onUpdateCategories(categories.map((c) => (c.id === cat.id ? updated : c)));
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;

    const list = [...categories];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    // re-assign display orders
    const updated = list.map((c, i) => ({ ...c, displayOrder: i + 1 }));
    if (onReorderCategories) {
      onReorderCategories(updated);
    } else if (onUpdateCategories) {
      onUpdateCategories(updated);
    }
  };

  const handleDeleteClick = (cat: DesignCategory) => {
    const workCount = getWorkCount(cat.name);
    if (workCount > 0) {
      setDeleteWarning(
        `Safety Protection: Cannot delete "${cat.name}" because ${workCount} local work orders are using this category. Please disable it instead so existing records remain intact.`
      );
      return;
    }
    if (window.confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
      if (onDeleteCategory) {
        onDeleteCategory(cat.id);
      } else if (onUpdateCategories) {
        onUpdateCategories(categories.filter((c) => c.id !== cat.id));
      }
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
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
          <div className="w-10 h-10 rounded-xl bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-zinc-950 tracking-tight">Work Categories</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-bold">
                {totalCount} total
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Manage design work classifications. Disabled categories cannot be selected for new works.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Delete Safety Alert */}
      {deleteWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Protected Category Rule</p>
              <p className="text-amber-800 mt-0.5">{deleteWarning}</p>
            </div>
          </div>
          <button
            onClick={() => setDeleteWarning(null)}
            className="text-amber-700 hover:text-amber-950 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Inline Add Category Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateCategory}
          className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row items-end gap-3 text-xs animate-in fade-in"
        >
          <div className="flex-1 w-full sm:w-auto">
            <label className="block font-bold text-zinc-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Brochure, 3D Mockup, Packaging"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#EE1D45] outline-none bg-white"
              autoFocus
            />
          </div>

          <div className="flex-1 w-full sm:w-auto">
            <label className="block font-bold text-zinc-700 mb-1">Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. Print and digital trifold or catalog layouts"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#EE1D45] outline-none bg-white"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-xs"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-[10px] font-mono font-bold uppercase text-zinc-400">Total Categories</p>
          <p className="text-xl font-black text-zinc-950 mt-0.5">{totalCount}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-[10px] font-mono font-bold uppercase text-zinc-400">Active</p>
          <p className="text-xl font-black text-emerald-600 mt-0.5">{activeCount}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-[10px] font-mono font-bold uppercase text-zinc-400">Disabled</p>
          <p className="text-xl font-black text-zinc-400 mt-0.5">{disabledCount}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-[10px] font-mono font-bold uppercase text-zinc-400">Works Tracked</p>
          <p className="text-xl font-black text-[#EE1D45] mt-0.5">{localWorks.length}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 focus:border-[#EE1D45] outline-none"
          />
        </div>
        <span className="text-xs text-zinc-400 font-mono">Use arrows to adjust dropdown display order</span>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50/80 border-b border-zinc-200 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-3 px-3 text-center w-16">Order</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Works</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredCategories.map((cat, index) => {
                const workCount = getWorkCount(cat.name);
                const isEditing = editingCatId === cat.id;

                return (
                  <tr key={cat.id} className="hover:bg-zinc-50/70 transition group">
                    {/* Reorder Buttons */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'up')}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-800 disabled:opacity-20 hover:bg-zinc-200/60"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === categories.length - 1}
                          onClick={() => handleMove(index, 'down')}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-800 disabled:opacity-20 hover:bg-zinc-200/60"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Name and Description */}
                    <td className="py-2.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 rounded border border-[#EE1D45] text-xs font-bold text-zinc-900 outline-none"
                            autoFocus
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="px-2 py-1 rounded border border-zinc-200 text-xs text-zinc-600 outline-none flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-1 text-zinc-400 hover:bg-zinc-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-zinc-900 flex items-center gap-2">
                            <span>{cat.name}</span>
                            {!cat.isActive && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-500 font-normal">
                                Disabled
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-[11px] text-zinc-500 mt-0.5">{cat.description}</p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200'
                        }`}
                        title={cat.isActive ? 'Click to Disable' : 'Click to Enable'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.isActive ? 'bg-emerald-500' : 'bg-zinc-400'
                          }`}
                        ></span>
                        <span>{cat.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Works Count */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectCategoryForFilter && onSelectCategoryForFilter(cat.name)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                          workCount > 0
                            ? 'bg-zinc-100 text-zinc-900 hover:bg-[#EE1D45]/10 hover:text-[#EE1D45]'
                            : 'text-zinc-400'
                        }`}
                        title="Click to view works with this category"
                      >
                        <Layers className="w-3 h-3 text-zinc-400" />
                        <span>{workCount}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="px-2 py-1 text-[11px] font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                            cat.isActive
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {cat.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cat)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title={workCount > 0 ? 'Protected: Work orders attached' : 'Delete Category'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
