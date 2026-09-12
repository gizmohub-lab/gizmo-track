import React, { useState } from 'react';
import { X, Plus, Trash2, Settings, Tag } from 'lucide-react';

interface NotesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
}

export const NotesSettingsModal: React.FC<NotesSettingsModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  if (!isOpen) return null;

  const [newCatName, setNewCatName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-black rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black">
              <Settings className="w-4 h-4 text-[#FF5738]" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-zinc-950">Notes Settings</h3>
              <p className="text-[11px] text-zinc-500">Manage categories and note preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4">
          <div>
            <h4 className="font-display font-bold text-sm text-zinc-900 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#FF5738]" />
              <span>Note Categories</span>
            </h4>

            {/* Add Custom Category Form */}
            <form onSubmit={handleAdd} className="flex items-center gap-2 mb-3">
              <input
                type="text"
                placeholder="New Category Name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:border-black"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800"
                >
                  <span>{cat}</span>
                  {!['Personal', 'Project', 'Client', 'Ideas', 'Reminder', 'Other'].includes(cat) && (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat)}
                      className="text-zinc-400 hover:text-rose-600 transition p-1"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-zinc-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
