import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Pin,
  Trash2,
  Save,
  CheckSquare,
  Square,
  Plus,
  X,
  Palette,
  Tag,
  Link as LinkIcon,
  Bell,
  Check,
  FolderKanban,
  User,
  Briefcase,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import { Note, NoteColor, NoteChecklistItem, Project, Client, LocalWork, Invoice, AppRoute } from '../../../types';
import { getNow, formatExactDateTimeString } from '../../../utils/dateTimeUtils';

interface NoteEditorPaneProps {
  note: Note | null;
  categories: string[];
  projects?: Project[];
  clients?: Client[];
  localWorks?: LocalWork[];
  invoices?: Invoice[];
  onSaveNote: (note: Partial<Note> & { id: string }) => void;
  onDeleteNote: (note: Note) => void;
  onBack?: () => void;
  onNavigateRoute?: (route: AppRoute, targetId?: string) => void;
  isEmbedded?: boolean;
}

export const NoteEditorPane: React.FC<NoteEditorPaneProps> = ({
  note,
  categories = [],
  projects = [],
  clients = [],
  localWorks = [],
  invoices = [],
  onSaveNote,
  onDeleteNote,
  onBack,
  onNavigateRoute,
  isEmbedded = false,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isChecklist, setIsChecklist] = useState(note?.isChecklist || false);
  const [checklistItems, setChecklistItems] = useState<NoteChecklistItem[]>(note?.checklistItems || []);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [color, setColor] = useState<NoteColor>(note?.color || 'default');
  const [category, setCategory] = useState(note?.category || 'Personal');
  
  // Linkages
  const [projectId, setProjectId] = useState(note?.projectId || '');
  const [clientId, setClientId] = useState(note?.clientId || '');
  const [localWorkId, setLocalWorkId] = useState(note?.localWorkId || '');
  const [invoiceId, setInvoiceId] = useState(note?.invoiceId || '');

  // Reminder
  const [reminderDate, setReminderDate] = useState(note?.reminderDate || '');
  const [reminderTime, setReminderTime] = useState(note?.reminderTime || '10:00');

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...'>('Saved');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLinkSelector, setShowLinkSelector] = useState(false);

  const isFirstRender = useRef(true);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync state when selected note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setIsChecklist(note.isChecklist || false);
      setChecklistItems(note.checklistItems || []);
      setIsPinned(note.isPinned || false);
      setColor(note.color || 'default');
      setCategory(note.category || 'Personal');
      setProjectId(note.projectId || '');
      setClientId(note.clientId || '');
      setLocalWorkId(note.localWorkId || '');
      setInvoiceId(note.invoiceId || '');
      setReminderDate(note.reminderDate || '');
      setReminderTime(note.reminderTime || '10:00');
      setSaveStatus('Saved');
    }
  }, [note?.id]);

  // Handle Autosave debounced by 600ms
  const triggerAutoSave = () => {
    if (!note?.id) return;
    setSaveStatus('Saving...');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      const selectedPrj = projects.find((p) => p.id === projectId);
      const selectedClient = clients.find((c) => c.id === clientId);
      const selectedWork = localWorks.find((w) => w.id === localWorkId);
      const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);

      const now = getNow();
      const formattedTimestamp = formatExactDateTimeString(
        now.toISOString().split('T')[0],
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );

      onSaveNote({
        id: note.id,
        title: title.trim() || 'Untitled Note',
        content,
        isChecklist,
        checklistItems,
        isPinned,
        color,
        category,
        projectId: projectId || undefined,
        projectTitle: selectedPrj?.title || undefined,
        clientId: clientId || undefined,
        clientName: selectedClient?.name || undefined,
        localWorkId: localWorkId || undefined,
        localWorkTitle: selectedWork?.title || selectedWork?.clientName || undefined,
        invoiceId: invoiceId || undefined,
        invoiceNumber: selectedInvoice?.invoiceNumber || undefined,
        reminderDate: reminderDate || undefined,
        reminderTime: reminderDate ? reminderTime || '10:00' : undefined,
        updatedAt: formattedTimestamp,
      });

      setSaveStatus('Saved');
    }, 600);
  };

  // Trigger autosave when fields change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    triggerAutoSave();
  }, [
    title,
    content,
    isChecklist,
    checklistItems,
    isPinned,
    color,
    category,
    projectId,
    clientId,
    localWorkId,
    invoiceId,
    reminderDate,
    reminderTime,
  ]);

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-50/50">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
          <Square className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-base text-zinc-800">Select a note to edit</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
          Choose a note from the left list or create a new note to start capturing ideas.
        </p>
      </div>
    );
  }

  // Checklist Helpers
  const handleAddCheckitem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem: NoteChecklistItem = {
      id: `check-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    setChecklistItems([...checklistItems, newItem]);
    setNewChecklistText('');
  };

  const handleToggleCheckitem = (itemId: string) => {
    setChecklistItems(
      checklistItems.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleRemoveCheckitem = (itemId: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== itemId));
  };

  const colorBgMap: Record<NoteColor, string> = {
    default: 'bg-white',
    warm: 'bg-amber-50/30',
    soft: 'bg-sky-50/30',
    accent: 'bg-rose-50/30',
  };

  return (
    <div className={`h-full flex flex-col ${colorBgMap[color]} transition-colors duration-200 relative`}>
      {/* EDITOR TOP TOOLBAR */}
      <div className="p-3 sm:px-5 border-b border-zinc-200 flex items-center justify-between gap-2 bg-white/80 backdrop-blur-xs sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg transition flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {/* Autosave Status */}
          <span
            className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded transition-all ${
              saveStatus === 'Saving...' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {saveStatus}
          </span>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Checklist Toggle */}
          <button
            type="button"
            onClick={() => setIsChecklist(!isChecklist)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
              isChecklist ? 'bg-black text-white border-black' : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
            title="Toggle Checklist Mode"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Checklist</span>
          </button>

          {/* Pin Toggle */}
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
              isPinned
                ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
            title={isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-800' : ''}`} />
            <span className="hidden sm:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
          </button>

          {/* Color Selector */}
          <div className="flex items-center gap-1 border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
            {(['default', 'warm', 'soft', 'accent'] as NoteColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-md transition ${
                  c === 'default'
                    ? 'bg-white border border-zinc-300'
                    : c === 'warm'
                    ? 'bg-amber-200'
                    : c === 'soft'
                    ? 'bg-sky-200'
                    : 'bg-rose-200'
                } ${color === c ? 'ring-2 ring-black scale-110' : 'opacity-70 hover:opacity-100'}`}
                title={`Theme: ${c}`}
              />
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2 py-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none font-medium text-zinc-800 focus:border-black"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* LINKED ENTITY BANNER */}
      <div className="px-5 pt-3 pb-1 border-b border-zinc-100 bg-white/40 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-700 font-medium">
          <span className="text-zinc-400 font-semibold flex items-center gap-1">
            <LinkIcon className="w-3.5 h-3.5" />
            Linked:
          </span>

          {projectId && (
            <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-900 font-bold">
              <FolderKanban className="w-3 h-3 text-[#EE1D45]" />
              <span className="truncate max-w-[160px]">
                {projects.find((p) => p.id === projectId)?.title || 'Linked Project'}
              </span>
              {onNavigateRoute && (
                <button
                  type="button"
                  onClick={() => onNavigateRoute('admin-projects', projectId)}
                  className="ml-1 text-[#EE1D45] hover:underline flex items-center gap-0.5 text-[10px]"
                >
                  [Open Project]
                </button>
              )}
            </div>
          )}

          {clientId && (
            <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-900 font-bold">
              <User className="w-3 h-3 text-blue-600" />
              <span className="truncate max-w-[160px]">
                {clients.find((c) => c.id === clientId)?.name || 'Linked Client'}
              </span>
              {onNavigateRoute && (
                <button
                  type="button"
                  onClick={() => onNavigateRoute('admin-clients', clientId)}
                  className="ml-1 text-blue-600 hover:underline flex items-center gap-0.5 text-[10px]"
                >
                  [Open Client]
                </button>
              )}
            </div>
          )}

          {localWorkId && (
            <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-900 font-bold">
              <Briefcase className="w-3 h-3 text-amber-600" />
              <span className="truncate max-w-[160px]">
                {localWorks.find((w) => w.id === localWorkId)?.title || 'Linked Local Work'}
              </span>
            </div>
          )}

          {!projectId && !clientId && !localWorkId && (
            <span className="text-zinc-400 text-xs italic">No entity linked</span>
          )}
        </div>

        {/* Edit Link Selector Toggle */}
        <button
          type="button"
          onClick={() => setShowLinkSelector(!showLinkSelector)}
          className="text-xs text-black font-bold hover:text-[#EE1D45] underline transition flex items-center gap-1"
        >
          {showLinkSelector ? 'Close Link Options' : '+ Link Project / Client'}
        </button>
      </div>

      {/* EXPANDABLE LINK SELECTOR PANEL */}
      {showLinkSelector && (
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 text-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Link Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none font-medium text-zinc-900"
            >
              <option value="">-- No Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.clientName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Link Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none font-medium text-zinc-900"
            >
              <option value="">-- No Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Link Local Work Order
            </label>
            <select
              value={localWorkId}
              onChange={(e) => setLocalWorkId(e.target.value)}
              className="w-full p-2 bg-white border border-zinc-200 rounded-lg outline-none font-medium text-zinc-900"
            >
              <option value="">-- No Local Work --</option>
              {localWorks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title || w.clientName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* REMINDER BAR */}
      <div className="px-5 py-2 border-b border-zinc-100 bg-white/30 flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-amber-700" />
          <span className="font-bold text-zinc-800">Set Reminder:</span>
          <input
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            className="px-2 py-1 bg-white border border-zinc-200 rounded-md outline-none text-xs font-mono"
          />
          {reminderDate && (
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-2 py-1 bg-white border border-zinc-200 rounded-md outline-none text-xs font-mono"
            />
          )}
        </div>

        {reminderDate && (
          <button
            type="button"
            onClick={() => {
              setReminderDate('');
              setReminderTime('10:00');
            }}
            className="text-[11px] text-rose-600 hover:underline font-bold"
          >
            Clear Reminder
          </button>
        )}
      </div>

      {/* MAIN NOTE BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Title Input */}
        <input
          type="text"
          placeholder="Note Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xl sm:text-2xl font-display font-black text-zinc-950 placeholder-zinc-300 bg-transparent outline-none tracking-tight border-b border-transparent focus:border-zinc-200 pb-2 transition"
        />

        {/* Content Mode: Text Area vs Checklist */}
        {isChecklist ? (
          <div className="space-y-3">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
              <span>Checklist Items</span>
              <span>
                {checklistItems.filter((i) => i.completed).length} / {checklistItems.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 p-2 bg-white/80 border border-zinc-200 rounded-lg group transition hover:border-zinc-300"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleCheckitem(item.id)}
                    className="text-zinc-500 hover:text-black transition shrink-0"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChecklistItems(
                        checklistItems.map((i) => (i.id === item.id ? { ...i, text: val } : i))
                      );
                    }}
                    className={`flex-1 bg-transparent text-sm text-zinc-900 outline-none font-medium ${
                      item.completed ? 'line-through text-zinc-400' : ''
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveCheckitem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Checklist Item Input */}
            <form onSubmit={handleAddCheckitem} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="+ Add checklist item..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                className="flex-1 p-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium outline-none focus:border-black"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-black text-white font-bold rounded-lg text-xs hover:bg-zinc-800 transition"
              >
                Add
              </button>
            </form>
          </div>
        ) : (
          <textarea
            placeholder="Start typing note content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-80 sm:h-96 text-sm text-zinc-900 placeholder-zinc-400 bg-transparent outline-none leading-relaxed resize-none font-sans"
          />
        )}
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-zinc-950">Delete this note?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                This action cannot be undone. The note will be permanently removed from persistent storage.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-100 text-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteNote(note);
                }}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
