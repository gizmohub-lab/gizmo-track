import React, { useState } from 'react';
import { Plus, NotebookPen, Search, Pin, Edit3, Trash2, CheckSquare } from 'lucide-react';
import { Note, Project, Client, AppRoute } from '../../../types';
import { NoteCard } from './NoteCard';
import { NoteEditorPane } from './NoteEditorPane';
import { getNow, formatExactDateTimeString } from '../../../utils/dateTimeUtils';

interface EmbeddedNotesSectionProps {
  notes: Note[];
  projectId?: string;
  projectTitle?: string;
  clientId?: string;
  clientName?: string;
  categories: string[];
  projects?: Project[];
  clients?: Client[];
  onSaveNote: (note: Partial<Note> & { id: string }) => void;
  onDeleteNote: (note: Note) => void;
  onTogglePin: (id: string, e?: React.MouseEvent) => void;
  onToggleCheckItem?: (noteId: string, itemId: string, completed: boolean) => void;
  onNavigateRoute?: (route: AppRoute, targetId?: string) => void;
}

export const EmbeddedNotesSection: React.FC<EmbeddedNotesSectionProps> = ({
  notes = [],
  projectId,
  projectTitle,
  clientId,
  clientName,
  categories = [],
  projects = [],
  clients = [],
  onSaveNote,
  onDeleteNote,
  onTogglePin,
  onToggleCheckItem,
  onNavigateRoute,
}) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter notes linked to this project or client
  const filteredNotes = notes.filter((n) => {
    if (projectId && n.projectId !== projectId) return false;
    if (clientId && n.clientId !== clientId) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchContent = n.content?.toLowerCase().includes(q);
      return matchTitle || matchContent;
    }
    return true;
  });

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
      category: projectId ? 'Project' : clientId ? 'Client' : 'Personal',
      projectId: projectId || undefined,
      projectTitle: projectTitle || undefined,
      clientId: clientId || undefined,
      clientName: clientName || undefined,
      createdAt: formattedTimestamp,
      updatedAt: formattedTimestamp,
    };

    onSaveNote(newNote);
    setSelectedNote(newNote);
    setIsEditing(true);
  };

  return (
    <div className="space-y-4">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div>
          <h3 className="font-display font-black text-base text-zinc-950 flex items-center gap-2">
            <NotebookPen className="w-4 h-4 text-[#FF5738]" />
            <span>Notes ({filteredNotes.length})</span>
          </h3>
          <p className="text-xs text-zinc-500">
            {projectId
              ? `Notes linked to project: ${projectTitle}`
              : clientId
              ? `Notes linked to client: ${clientName}`
              : 'Entity Notes'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNewNote}
          className="px-3.5 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#FF5738]" />
          <span>+ Add Note</span>
        </button>
      </div>

      {/* EDITOR OR LIST VIEW */}
      {isEditing && selectedNote ? (
        <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm min-h-[420px]">
          <NoteEditorPane
            note={selectedNote}
            categories={categories}
            projects={projects}
            clients={clients}
            onSaveNote={(updated) => {
              onSaveNote(updated);
              setSelectedNote((prev) => (prev ? { ...prev, ...updated } : null));
            }}
            onDeleteNote={(noteToDelete) => {
              onDeleteNote(noteToDelete);
              setIsEditing(false);
              setSelectedNote(null);
            }}
            onBack={() => {
              setIsEditing(false);
              setSelectedNote(null);
            }}
            onNavigateRoute={onNavigateRoute}
            isEmbedded
          />
        </div>
      ) : (
        <div>
          {/* SEARCH BAR */}
          {notes.length > 0 && (
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search entity notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:border-black"
              />
            </div>
          )}

          {/* LIST GRID */}
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onSelect={(n) => {
                    setSelectedNote(n);
                    setIsEditing(true);
                  }}
                  onTogglePin={onTogglePin}
                  onToggleCheckItem={onToggleCheckItem}
                  onDeleteNote={onDeleteNote}
                  onNavigateRoute={onNavigateRoute}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <NotebookPen className="w-5 h-5" />
              </div>
              <p className="font-display font-bold text-sm text-zinc-800">No notes found</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                No notes have been attached to this record yet. Click "+ Add Note" to create one.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
