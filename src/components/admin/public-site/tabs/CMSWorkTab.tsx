import React, { useState, useMemo } from 'react';
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
  Search,
  Filter,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  Square,
  AlertTriangle,
  LayoutGrid,
  List,
  Check,
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
  onBulkUpdate?: (updatedItems: PublicSiteWorkItem[]) => void;
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
  onBulkUpdate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'HIDDEN' | 'FEATURED'>('ALL');
  const [sortBy, setSortBy] = useState<'ORDER' | 'YEAR_DESC' | 'YEAR_ASC' | 'TITLE_AZ'>('ORDER');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Compute category lists
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    workItems.forEach((w) => {
      if (w.category) cats.add(w.category);
    });
    return Array.from(cats);
  }, [workItems]);

  // Filtered & Sorted Work Items
  const filteredItems = useMemo(() => {
    let result = workItems.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesClient = item.clientName?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesDesc = item.desc?.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesClient && !matchesCategory && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      // Category
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // Status
      if (statusFilter === 'PUBLISHED' && !item.isVisible) return false;
      if (statusFilter === 'HIDDEN' && item.isVisible) return false;
      if (statusFilter === 'FEATURED' && !item.isFeatured) return false;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'YEAR_DESC') {
        return (b.year || '').localeCompare(a.year || '');
      }
      if (sortBy === 'YEAR_ASC') {
        return (a.year || '').localeCompare(b.year || '');
      }
      if (sortBy === 'TITLE_AZ') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    });

    return result;
  }, [workItems, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Stats calculation
  const totalCount = workItems.length;
  const publishedCount = workItems.filter((w) => w.isVisible).length;
  const featuredCount = workItems.filter((w) => w.isFeatured).length;
  const totalGalleryCount = workItems.reduce((acc, curr) => acc + (curr.workImages?.length || 0), 0);

  // Bulk actions handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((f) => f.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = (action: 'publish' | 'hide' | 'feature' | 'unfeature' | 'delete') => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      if (confirm(`Delete ${selectedIds.length} selected portfolio items?`)) {
        selectedIds.forEach((id) => onDeleteWork(id));
        setSelectedIds([]);
      }
      return;
    }

    if (onBulkUpdate) {
      const updated = workItems.map((item) => {
        if (!selectedIds.includes(item.id)) return item;
        if (action === 'publish') return { ...item, isVisible: true };
        if (action === 'hide') return { ...item, isVisible: false };
        if (action === 'feature') return { ...item, isFeatured: true };
        if (action === 'unfeature') return { ...item, isFeatured: false };
        return item;
      });
      onBulkUpdate(updated);
      setSelectedIds([]);
    }
  };

  const itemToDelete = workItems.find((w) => w.id === deleteConfirmId);

  return (
    <div className="space-y-5">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Portfolio Items
          </span>
          <div className="text-xl font-black text-zinc-950 mt-0.5">{totalCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Published Live
          </span>
          <div className="text-xl font-black text-emerald-600 mt-0.5">{publishedCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Homepage Featured
          </span>
          <div className="text-xl font-black text-amber-500 mt-0.5">{featuredCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Work Gallery Photos
          </span>
          <div className="text-xl font-black text-[#EE1D45] mt-0.5">{totalGalleryCount}</div>
        </div>
      </div>

      {/* Primary Action Bar & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Public Portfolio &amp; Case Studies ({filteredItems.length})
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Curate cover artworks, showcase multi-angle work photos, and highlight client case studies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddWork}
              className="px-4 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Portfolio Item</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-zinc-100 items-center">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, client, category, tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          {/* Status Tabs */}
          <div className="sm:col-span-4 flex items-center gap-1 overflow-x-auto bg-zinc-100 p-1 rounded-xl">
            {(['ALL', 'PUBLISHED', 'HIDDEN', 'FEATURED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {st === 'ALL'
                  ? 'All'
                  : st === 'PUBLISHED'
                  ? 'Published'
                  : st === 'HIDDEN'
                  ? 'Hidden'
                  : 'Featured'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:border-[#EE1D45] bg-white cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-1 flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bulk Action Bar (Visible when items selected) */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 rounded-xl bg-zinc-900 text-white flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold">
              <CheckSquare className="w-4 h-4 text-[#EE1D45]" />
              <span>{selectedIds.length} items selected</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleBulkAction('publish')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold cursor-pointer transition"
              >
                Publish
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction('hide')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold cursor-pointer transition"
              >
                Hide
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction('feature')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
              >
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Feature</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction('delete')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold cursor-pointer transition"
              >
                Delete Selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* GRID VIEW                                                               */}
      {/* ======================================================================= */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);
            const workImagesCount = item.workImages?.length || 0;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-150 flex flex-col justify-between overflow-hidden relative group ${
                  item.isVisible
                    ? 'bg-white border-zinc-200/90 shadow-2xs hover:shadow-md'
                    : 'bg-zinc-50 border-zinc-200 opacity-60'
                }`}
              >
                {/* Checkbox trigger in card */}
                <button
                  type="button"
                  onClick={() => handleToggleSelectOne(item.id)}
                  className="absolute top-3 left-3 z-20 p-1 rounded-lg bg-black/40 hover:bg-black/70 backdrop-blur-md text-white transition cursor-pointer"
                  title="Select Item"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#EE1D45]" />
                  ) : (
                    <Square className="w-4 h-4 text-white/80" />
                  )}
                </button>

                {/* Header preview container with Cover Image */}
                <div
                  className="h-44 p-4 flex flex-col justify-between relative text-white overflow-hidden"
                  style={{
                    background: item.imageUrl
                      ? '#09090b'
                      : `linear-gradient(135deg, ${item.gradientFrom || '#18181b'}, ${
                          item.gradientTo || '#09090b'
                        })`,
                  }}
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.coverImageAlt || item.title}
                      className={`absolute inset-0 w-full h-full group-hover:scale-105 transition duration-300 ${
                        item.coverImageFit === 'contain' ? 'object-contain p-2 bg-zinc-950' : 'object-cover'
                      }`}
                    />
                  )}

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Top badges */}
                  <div className="relative z-10 flex items-center justify-between gap-2 pl-8">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-white uppercase tracking-wider">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {item.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#EE1D45] text-white shadow-2xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Curated</span>
                        </span>
                      )}
                      {workImagesCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 backdrop-blur-md text-white border border-white/10">
                          <ImageIcon className="w-3 h-3" />
                          <span>+{workImagesCount}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom title & client info */}
                  <div className="relative z-10">
                    <span className="text-[11px] font-bold text-[#EE1D45] block truncate">
                      {item.clientName || 'Client Showcase'}
                    </span>
                    <h4 className="text-base font-bold text-white leading-snug line-clamp-1 mt-0.5">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-300 block mt-0.5">
                      {item.year || '2026'} · Order #{item.orderIndex || index + 1}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {item.desc || 'No description provided.'}
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
                        title="Move Up in Order"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === filteredItems.length - 1}
                        onClick={() => onReorder(index, 'down')}
                        className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 cursor-pointer"
                        title="Move Down in Order"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleFeatured(item.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          item.isFeatured
                            ? 'bg-amber-50 border-amber-200 text-amber-500'
                            : 'border-zinc-200 text-zinc-400 hover:text-amber-500'
                        }`}
                        title={item.isFeatured ? 'Remove from Homepage' : 'Feature on Homepage'}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleVisibility(item.id)}
                        className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                        title={item.isVisible ? 'Hide from public' : 'Publish to public'}
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
                        title="Duplicate Portfolio Item"
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
                        onClick={() => setDeleteConfirmId(item.id)}
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
      )}

      {/* ======================================================================= */}
      {/* TABLE / LIST VIEW                                                       */}
      {/* ======================================================================= */}
      {viewMode === 'TABLE' && (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="cursor-pointer"
                    >
                      {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#EE1D45]" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Gallery</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredItems.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-zinc-50/80 transition ${
                        isSelected ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(item.id)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#EE1D45]" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-900 shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full"
                                style={{
                                  background: `linear-gradient(135deg, ${
                                    item.gradientFrom || '#18181b'
                                  }, ${item.gradientTo || '#09090b'})`,
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block line-clamp-1">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {item.year || '2026'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-zinc-700">
                        {item.clientName || '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-600">
                        #{item.orderIndex || index + 1}
                      </td>

                      <td className="py-3 px-4 text-zinc-500 font-mono">
                        {(item.workImages?.length || 0) > 0 ? (
                          <span className="text-emerald-700 font-bold">
                            {item.workImages?.length} images
                          </span>
                        ) : (
                          <span className="text-zinc-400">Cover only</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.isVisible
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {item.isVisible ? 'Published' : 'Hidden'}
                          </span>
                          {item.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onToggleVisibility(item.id)}
                            className="p-1 rounded-md text-zinc-500 hover:text-zinc-950 cursor-pointer"
                            title="Toggle Visibility"
                          >
                            {item.isVisible ? (
                              <Eye className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditWork(item)}
                            className="p-1 rounded-md text-zinc-600 hover:text-zinc-950 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1 rounded-md text-zinc-400 hover:text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-zinc-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-zinc-950">Remove from Portfolio?</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-zinc-800">"{itemToDelete.title}"</span>? Associated live CRM projects and invoices will remain completely protected.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteWork(itemToDelete.id);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
