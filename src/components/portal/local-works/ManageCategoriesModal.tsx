import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Check, RotateCcw } from 'lucide-react';
import { initialWorkCategories } from '../../../data/mockData';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSaveCategories: (categories: string[]) => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [list, setList] = useState<string[]>(categories);
  const [newCat, setNewCat] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCat.trim();
    if (!trimmed) return;
    if (list.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('This category already exists.');
      return;
    }
    const updated = [...list, trimmed];
    setList(updated);
    onSaveCategories(updated);
    setNewCat('');
  };

  const handleRemove = (catToRemove: string) => {
    if (list.length <= 1) {
      alert('At least one category must remain.');
      return;
    }
    const updated = list.filter((c) => c !== catToRemove);
    setList(updated);
    onSaveCategories(updated);
  };

  const handleResetDefaults = () => {
    setList(initialWorkCategories);
    onSaveCategories(initialWorkCategories);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#FF5738]" />
            <h2 className="text-base font-bold text-zinc-950">Manage Work Categories</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Add Category Input */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Wedding Album, Billboard, 3D Mockup"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF5738] outline-none text-zinc-900 text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF5738] hover:bg-[#ff4220] text-white rounded-xl font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Current Categories List */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {list.map((cat) => (
              <div
                key={cat}
                className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between hover:bg-zinc-100 transition"
              >
                <span className="font-bold text-zinc-900">{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(cat)}
                  className="p-1 text-zinc-400 hover:text-rose-600 rounded transition"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Defaults</span>
            </button>
            <span className="text-zinc-400 font-mono">{list.length} categories</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
