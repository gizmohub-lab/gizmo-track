import React from 'react';
import {
  Plus,
  Palette,
  FolderKanban,
  Sparkles,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ArrowUp,
  ArrowDown,
  Star,
  ExternalLink,
} from 'lucide-react';
import { Project, PublicSiteWorkItem } from '../../../../types';

interface CMSWorkTabProps {
  workItems: PublicSiteWorkItem[];
  projects?: Project[];
  onAddWork: () => void;
  onEditWork: (workItem: PublicSiteWorkItem) => void;
  onDeleteWork: (workId: string) => void;
  onDuplicateWork: (workItem: PublicSiteWorkItem) => void;
  onToggleVisibility: (workId: string) => void;
  onToggleFeatured: (workId: string) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
}

export const CMSWorkTab: React.FC<CMSWorkTabProps> = ({
  workItems,
  projects = [],
  onAddWork,
  onEditWork,
  onDeleteWork,
  onDuplicateWork,
  onToggleVisibility,
  onToggleFeatured,
  onReorder,
}) => {
  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Public Portfolio &amp; Case Studies ({workItems.length})
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Curate showcase works, feature client projects from Director CRM, and organize categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddWork}
            className="px-4 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Showcase Work</span>
          </button>
        </div>
      </div>

      {/* Work Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workItems.map((item, index) => {
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-150 flex flex-col justify-between overflow-hidden ${
                item.isVisible
                  ? 'bg-white border-zinc-200/90 shadow-2xs'
                  : 'bg-zinc-50 border-zinc-200 opacity-60'
              }`}
            >
              {/* Header preview card with gradient */}
              <div
                className="h-32 p-4 flex flex-col justify-between relative text-white"
                style={{
                  background: `linear-gradient(135deg, ${item.gradientFrom || '#18181b'}, ${
                    item.gradientTo || '#09090b'
                  })`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-white uppercase tracking-wider">
                    {item.category}
                  </span>
                  {item.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#EE1D45] text-white shadow-2xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Curated</span>
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {item.year || '2026'} · {item.clientName}
                  </span>
                  <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">
                    {item.title}
                  </h4>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  {item.badgeText && (
                    <span className="text-[10px] font-bold text-[#EE1D45] uppercase tracking-wider block mb-1">
                      {item.badgeText}
                    </span>
                  )}
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-2">
                    {item.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded bg-zinc-100 text-[10px] font-medium text-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] text-zinc-400">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onReorder(index, 'up')}
                      className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === workItems.length - 1}
                      onClick={() => onReorder(index, 'down')}
                      className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(item.id)}
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                      title={item.isVisible ? 'Hide' : 'Show'}
                    >
                      {item.isVisible ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateWork(item)}
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditWork(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${item.title}" from portfolio?`)) {
                          onDeleteWork(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
