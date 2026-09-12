import React, { useState } from 'react';
import { X, CheckSquare, Square, Save, NotebookPen, FolderKanban, User } from 'lucide-react';
import { Note, Project, Client } from '../../../types';
import { getNow, formatExactDateTimeString } from '../../../utils/dateTimeUtils';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  projects?: Project[];
  clients?: Client[];
  defaultProjectId?: string;
  defaultClientId?: string;
  onSaveQuickNote: (newNote: Note) => void;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  isOpen,
  onClose,
  categories = [],
  projects = [],
  clients = [],
  defaultProjectId = '',
  defaultClientId = '',
  onSaveQuickNote,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [isChecklist, setIsChecklist] = useState(false);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [clientId, setClientId] = useState(defaultClientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const selectedPrj = projects.find((p) => p.id === projectId);
    const selectedClient = clients.find((c) => c.id === clientId);

    const now = getNow();
    const formattedTimestamp = formatExactDateTimeString(
      now.toISOString().split('T')[0],
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: title.trim() || 'Quick Note',
      content,
      isChecklist,
      checklistItems: isChecklist && content.trim() ? content.split('\n').map((line, idx) => ({
        id: `item-${idx}`,
        text: line.trim(),
        completed: false,
      })) : [],
      isPinned: false,
      color: 'default',
      category,
      projectId: projectId || undefined,
      projectTitle: selectedPrj?.title || undefined,
      clientId: clientId || undefined,
      clientName: selectedClient?.name || undefined,
      createdAt: formattedTimestamp,
      updatedAt: formattedTimestamp,
    };

    onSaveQuickNote(newNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-black rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black">
              <NotebookPen className="w-4 h-4 text-[#EE1D45]" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-zinc-950">Quick Note</h3>
              <p className="text-[11px] text-zinc-500">Capture a fast idea without leaving your page</p>
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

        {/* MODAL FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Note Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-display font-bold text-zinc-950 placeholder-zinc-400 bg-transparent outline-none border-b border-zinc-200 focus:border-black pb-2 transition"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Category selection */}
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none font-medium text-zinc-800"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Checklist Mode toggle */}
            <div className="shrink-0 self-end">
              <button
                type="button"
                onClick={() => setIsChecklist(!isChecklist)}
                className={`p-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
                  isChecklist ? 'bg-black text-white border-black' : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Checklist</span>
              </button>
            </div>
          </div>

          {/* Note Content Input */}
          <div>
            <textarea
              placeholder={
                isChecklist
                  ? 'Enter checklist items (one per line)...'
                  : 'Type note details here...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-36 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 outline-none focus:border-black resize-none"
            />
          </div>

          {/* Link Project / Client */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Link Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium"
              >
                <option value="">-- None --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Link Client (Optional)
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full p-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium"
              >
                <option value="">-- None --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-100 text-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#EE1D45]" />
              <span>Save Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
