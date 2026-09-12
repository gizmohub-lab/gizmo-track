import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  MoreVertical,
  CheckSquare,
  Square,
  Calendar,
  Clock,
  ExternalLink,
  FolderKanban,
  User,
  Trash2,
  Archive,
  Edit3,
  Tag,
  Receipt,
  Briefcase,
  Bell,
} from 'lucide-react';
import { Note, NoteColor, AppRoute } from '../../../types';
import { formatDisplayDate, formatDisplayTime } from '../../../utils/dateTimeUtils';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  onSelect: (note: Note) => void;
  onTogglePin: (id: string, e?: React.MouseEvent) => void;
  onToggleCheckItem?: (noteId: string, itemId: string, completed: boolean) => void;
  onDeleteNote: (note: Note) => void;
  onArchiveNote?: (id: string) => void;
  onNavigateRoute?: (route: AppRoute, targetId?: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected = false,
  onSelect,
  onTogglePin,
  onToggleCheckItem,
  onDeleteNote,
  onArchiveNote,
  onNavigateRoute,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subtle background color mappings matching requirement 15
  const colorClasses: Record<NoteColor, string> = {
    default: 'bg-white border-zinc-200 hover:border-zinc-400',
    warm: 'bg-amber-50/40 border-amber-200/80 hover:border-amber-400',
    soft: 'bg-sky-50/40 border-sky-200/80 hover:border-sky-400',
    accent: 'bg-rose-50/40 border-rose-200/80 hover:border-rose-400',
  };

  const activeColorClass = colorClasses[note.color || 'default'];

  // Checklist items completion count
  const completedCount = note.checklistItems?.filter((i) => i.completed).length || 0;
  const totalChecklist = note.checklistItems?.length || 0;

  return (
    <div
      onClick={() => onSelect(note)}
      className={`group relative p-4 rounded-xl border transition-all duration-150 cursor-pointer shadow-2xs select-none ${activeColorClass} ${
        isSelected ? 'ring-2 ring-black border-black bg-zinc-50/50' : ''
      }`}
    >
      {/* CARD HEADER: Category / Pin / Actions Menu */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {note.category && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
              {note.category}
            </span>
          )}

          {note.isPinned && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Pin className="w-2.5 h-2.5 fill-amber-700" />
              Pinned
            </span>
          )}
        </div>

        {/* Action Menu (⋮) */}
        <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
            title="Note Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-30 w-40 bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 text-xs font-medium text-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onSelect(note);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-50 flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Open / Edit</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  setMenuOpen(false);
                  onTogglePin(note.id, e);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-50 flex items-center gap-2"
              >
                <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'text-amber-600' : 'text-zinc-500'}`} />
                <span>{note.isPinned ? 'Unpin Note' : 'Pin Note'}</span>
              </button>

              {onArchiveNote && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onArchiveNote(note.id);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-zinc-50 flex items-center gap-2"
                >
                  <Archive className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{note.isArchived ? 'Unarchive' : 'Archive'}</span>
                </button>
              )}

              <div className="my-1 border-t border-zinc-100" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteNote(note);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NOTE TITLE */}
      <h3 className="font-display font-bold text-sm sm:text-base text-zinc-950 group-hover:text-[#EE1D45] transition-colors line-clamp-1 mb-1">
        {note.title || 'Untitled Note'}
      </h3>

      {/* CONTENT PREVIEW OR CHECKLIST PREVIEW */}
      {note.isChecklist && note.checklistItems && note.checklistItems.length > 0 ? (
        <div className="space-y-1 my-2">
          {note.checklistItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleCheckItem) {
                  onToggleCheckItem(note.id, item.id, !item.completed);
                }
              }}
              className="flex items-center gap-2 text-xs text-zinc-700 hover:text-black transition cursor-pointer"
            >
              {item.completed ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Square className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
              <span className={`line-clamp-1 ${item.completed ? 'line-through text-zinc-400' : ''}`}>
                {item.text}
              </span>
            </div>
          ))}

          {totalChecklist > 3 && (
            <p className="text-[11px] font-medium text-zinc-400 pt-0.5">
              +{totalChecklist - 3} more items ({completedCount}/{totalChecklist} done)
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-2 whitespace-pre-wrap">
          {note.content || 'No content...'}
        </p>
      )}

      {/* LINKED ENTITY BADGE */}
      {(note.projectTitle || note.clientName || note.localWorkTitle || note.invoiceNumber) && (
        <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center gap-2 text-[11px] font-medium text-zinc-700 flex-wrap">
          {note.projectTitle && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              <FolderKanban className="w-3 h-3 text-[#EE1D45]" />
              <span className="truncate max-w-[150px]">{note.projectTitle}</span>
            </span>
          )}

          {note.clientName && !note.projectTitle && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              <User className="w-3 h-3 text-blue-600" />
              <span className="truncate max-w-[150px]">{note.clientName}</span>
            </span>
          )}

          {note.localWorkTitle && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              <Briefcase className="w-3 h-3 text-amber-600" />
              <span className="truncate max-w-[150px]">{note.localWorkTitle}</span>
            </span>
          )}

          {note.invoiceNumber && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              <Receipt className="w-3 h-3 text-purple-600" />
              <span>{note.invoiceNumber}</span>
            </span>
          )}
        </div>
      )}

      {/* CARD FOOTER: REMINDER & LAST EDITED TIMESTAMP */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <span>{note.updatedAt || note.createdAt}</span>

        {note.reminderDate && (
          <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            <Bell className="w-3 h-3" />
            <span>
              {formatDisplayDate(note.reminderDate)} {note.reminderTime ? `· ${formatDisplayTime(note.reminderTime)}` : ''}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};
