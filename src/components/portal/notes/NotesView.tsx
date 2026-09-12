import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  NotebookPen,
  Search,
  Plus,
  SlidersHorizontal,
  Pin,
  Tag,
  Settings,
  Sparkles,
  ListFilter,
  ArrowUpDown,
  FileText,
} from 'lucide-react';
import { Note, Project, Client, LocalWork, Invoice, AppRoute } from '../../../types';
import { NoteCard } from './NoteCard';
import { NoteEditorPane } from './NoteEditorPane';
import { NotesSettingsModal } from './NotesSettingsModal';
import { getNow, formatExactDateTimeString } from '../../../utils/dateTimeUtils';

interface NotesViewProps {
  notes: Note[];
  categories: string[];
  projects?: Project[];
  clients?: Client[];
  localWorks?: LocalWork[];
  invoices?: Invoice[];
  onSaveNote: (note: Partial<Note> & { id: string }) => void;
  onDeleteNote: (note: Note) => void;
  onTogglePin: (id: string, e?: React.MouseEvent) => void;
  onToggleCheckItem?: (noteId: string, itemId: string, completed: boolean) => void;
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onNavigateRoute?: (route: AppRoute, targetId?: string) => void;
  onOpenQuickNote?: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes = [],
  categories = [],
  projects = [],
  clients = [],
  localWorks = [],
  invoices = [],
  onSaveNote,
  onDeleteNote,
  onTogglePin,
  onToggleCheckItem,
  onAddCategory,
  onDeleteCategory,
  onNavigateRoute,
  onOpenQuickNote,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);

  // Filter & Sort Logic
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Archive filter (ignore archived notes in default view)
      if (n.isArchived) return false;

      // Category filter
      if (selectedCategory !== 'All' && n.category !== selectedCategory) {
        return false;
      }

      // Search filter across title & content
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = n.title?.toLowerCase().includes(q);
        const matchContent = n.content?.toLowerCase().includes(q);
        const matchCategory = n.category?.toLowerCase().includes(q);
        const matchProject = n.projectTitle?.toLowerCase().includes(q);
        const matchClient = n.clientName?.toLowerCase().includes(q);
        return matchTitle || matchContent || matchCategory || matchProject || matchClient;
      }

      return true;
    });
  }, [notes, selectedCategory, searchTerm]);

  // Separate Pinned and Unpinned notes
  const pinnedNotes = useMemo(() => {
    return filteredNotes.filter((n) => n.isPinned);
  }, [filteredNotes]);

  const unpinnedNotes = useMemo(() => {
    return filteredNotes.filter((n) => !n.isPinned);
  }, [filteredNotes]);

  // Apply Sorting
  const sortNotes = (list: Note[]) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'created') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      // default: updated
      return (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '');
    });
  };

  const sortedPinned = sortNotes(pinnedNotes);
  const sortedUnpinned = sortNotes(unpinnedNotes);

  // Selected note object
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Create New Note
  const handleCreateNewNote = () => {
    const now = getNow();
    const formattedTimestamp = formatExactDateTimeString(
      now.toISOString().split('T')[0],
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      content: '',
      isPinned: false,
      color: 'default',
      category: selectedCategory !== 'All' ? selectedCategory : 'Personal',
      createdAt: formattedTimestamp,
      updatedAt: formattedTimestamp,
    };

    onSaveNote(newNote);
    setSelectedNoteId(newNote.id);
    setMobileEditorOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black">
              <NotebookPen className="w-5 h-5 text-[#EE1D45]" />
            </div>
            <h1 className="font-display font-black text-2xl text-zinc-950 tracking-tight">Notes</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Capture ideas, reminders and important information.
          </p>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {onOpenQuickNote && (
            <button
              type="button"
              onClick={onOpenQuickNote}
              className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <NotebookPen className="w-4 h-4 text-[#EE1D45]" />
              <span>📝 Quick Note</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCreateNewNote}
            className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-[#EE1D45]" />
            <span>＋ New Note</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="p-2.5 border border-zinc-200 hover:border-zinc-400 bg-white rounded-xl text-zinc-700 hover:text-black transition"
            title="Notes Settings & Categories"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="🔍 Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-black font-medium transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-black"
              >
                Clear
              </button>
            )}
          </div>

          {/* SORT SELECTOR */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs font-medium text-zinc-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-semibold text-zinc-900"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Created Date</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-black text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            All Notes ({notes.length})
          </button>

          {categories.map((cat) => {
            const catCount = notes.filter((n) => n.category === cat && !n.isArchived).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-black text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <span>{cat}</span>
                {catCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      selectedCategory === cat ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-800'
                    }`}
                  >
                    {catCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DESKTOP & MOBILE TWO-PANE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* LEFT COLUMN: NOTES LIST (Visible always on Desktop, conditionally on Mobile) */}
        <div
          className={`lg:col-span-5 xl:col-span-4 space-y-5 ${
            mobileEditorOpen ? 'hidden lg:block' : 'block'
          }`}
        >
          {filteredNotes.length === 0 ? (
            /* EMPTY STATE (Section 18) */
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto text-2xl">
                📝
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-zinc-950">No notes yet</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Capture ideas, reminders and important information here.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateNewNote}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#EE1D45]" />
                <span>+ New Note</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PINNED SECTION */}
              {sortedPinned.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider px-1">
                    <Pin className="w-3.5 h-3.5 fill-amber-800" />
                    <span>Pinned ({sortedPinned.length})</span>
                  </div>

                  <div className="space-y-3">
                    {sortedPinned.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isSelected={selectedNoteId === note.id}
                        onSelect={(n) => {
                          setSelectedNoteId(n.id);
                          setMobileEditorOpen(true);
                        }}
                        onTogglePin={onTogglePin}
                        onToggleCheckItem={onToggleCheckItem}
                        onDeleteNote={onDeleteNote}
                        onNavigateRoute={onNavigateRoute}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ALL NOTES SECTION */}
              <div className="space-y-2.5">
                {sortedPinned.length > 0 && (
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
                    All Notes ({sortedUnpinned.length})
                  </div>
                )}

                <div className="space-y-3">
                  {sortedUnpinned.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNoteId === note.id}
                      onSelect={(n) => {
                        setSelectedNoteId(n.id);
                        setMobileEditorOpen(true);
                      }}
                      onTogglePin={onTogglePin}
                      onToggleCheckItem={onToggleCheckItem}
                      onDeleteNote={onDeleteNote}
                      onNavigateRoute={onNavigateRoute}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: NOTE EDITOR PANE */}
        <div
          className={`lg:col-span-7 xl:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs min-h-[580px] ${
            mobileEditorOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <NoteEditorPane
            note={activeNote}
            categories={categories}
            projects={projects}
            clients={clients}
            localWorks={localWorks}
            invoices={invoices}
            onSaveNote={onSaveNote}
            onDeleteNote={(n) => {
              onDeleteNote(n);
              setMobileEditorOpen(false);
              const remaining = notes.filter((x) => x.id !== n.id);
              setSelectedNoteId(remaining[0]?.id || null);
            }}
            onBack={() => setMobileEditorOpen(false)}
            onNavigateRoute={onNavigateRoute}
          />
        </div>
      </div>

      {/* NOTES SETTINGS MODAL */}
      <NotesSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        categories={categories}
        onAddCategory={onAddCategory}
        onDeleteCategory={onDeleteCategory}
      />
    </div>
  );
};
