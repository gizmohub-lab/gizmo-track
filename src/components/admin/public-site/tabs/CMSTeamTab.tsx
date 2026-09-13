import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Copy,
  ArrowUp,
  ArrowDown,
  Search,
  User,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { PublicSiteTeamMember } from '../../../../types';

interface CMSTeamTabProps {
  teamMembers: PublicSiteTeamMember[];
  onAddMember: () => void;
  onEditMember: (member: PublicSiteTeamMember) => void;
  onDeleteMember: (memberId: string) => void;
  onDuplicateMember: (member: PublicSiteTeamMember) => void;
  onToggleVisibility: (memberId: string) => void;
  onToggleFeatured: (memberId: string) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
}

export const CMSTeamTab: React.FC<CMSTeamTabProps> = ({
  teamMembers,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onDuplicateMember,
  onToggleVisibility,
  onToggleFeatured,
  onReorder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'HIDDEN' | 'FEATURED'>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter((m) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = m.name?.toLowerCase().includes(q);
          const matchRole = m.role?.toLowerCase().includes(q);
          const matchBio = m.bio?.toLowerCase().includes(q);
          if (!matchName && !matchRole && !matchBio) return false;
        }

        if (statusFilter === 'PUBLISHED' && !m.isPublished) return false;
        if (statusFilter === 'HIDDEN' && m.isPublished) return false;
        if (statusFilter === 'FEATURED' && !m.isFeatured) return false;

        return true;
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [teamMembers, searchQuery, statusFilter]);

  const memberToDelete = teamMembers.find((m) => m.id === deleteConfirmId);

  return (
    <div className="space-y-5">
      {/* Header action bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Studio Team &amp; Creative Collective ({teamMembers.length})
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage designers, directors, and production craftspeople displayed on the public About page.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddMember}
            className="px-4 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Team Member</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-100">
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, skills..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#EE1D45]"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl self-stretch sm:self-auto overflow-x-auto">
            {(['ALL', 'PUBLISHED', 'HIDDEN', 'FEATURED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
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
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMembers.map((member, index) => {
          return (
            <div
              key={member.id}
              className={`rounded-2xl border transition-all duration-150 flex flex-col justify-between overflow-hidden relative group ${
                member.isPublished
                  ? 'bg-white border-zinc-200/90 shadow-2xs hover:shadow-md'
                  : 'bg-zinc-50 border-zinc-200 opacity-60'
              }`}
            >
              {/* Member Card Top Banner */}
              <div className="p-5 pb-3 flex items-start justify-between">
                <div className="relative">
                  {member.avatarUrl ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-zinc-200 group-hover:border-[#EE1D45] transition bg-zinc-900 shadow-2xs">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center font-black text-lg border border-zinc-200 group-hover:border-[#EE1D45] transition">
                      {member.name
                        ? member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : 'GZ'}
                    </div>
                  )}

                  {member.isFeatured && (
                    <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-amber-400 text-black shadow-xs" title="Key Leadership">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs text-zinc-400 font-bold">
                    #{member.displayOrder || index + 1}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      member.isPublished
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {member.isPublished ? 'Live' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Member Details */}
              <div className="px-5 pb-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-zinc-950 leading-snug">
                    {member.name}
                  </h4>
                  <span className="text-xs font-bold text-[#EE1D45] block">
                    {member.role}
                  </span>
                  <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed mt-2">
                    {member.bio}
                  </p>
                </div>

                {/* Contact Links */}
                {(member.whatsapp || member.email || member.portfolioUrl) && (
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 text-zinc-400">
                    {member.whatsapp && (
                      <span title={member.whatsapp} className="hover:text-emerald-600 transition">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {member.email && (
                      <span title={member.email} className="hover:text-zinc-900 transition">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {member.portfolioUrl && (
                      <span title={member.portfolioUrl} className="hover:text-[#EE1D45] transition">
                        <Globe className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 bg-zinc-50/60 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onReorder(index, 'up')}
                    className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === filteredMembers.length - 1}
                    onClick={() => onReorder(index, 'down')}
                    className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onToggleFeatured(member.id)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      member.isFeatured
                        ? 'bg-amber-50 border-amber-200 text-amber-500'
                        : 'border-zinc-200 text-zinc-400 hover:text-amber-500'
                    }`}
                    title={member.isFeatured ? 'Remove Leadership Badge' : 'Mark as Key Leadership'}
                  >
                    <Star className={`w-3.5 h-3.5 ${member.isFeatured ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleVisibility(member.id)}
                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                    title={member.isPublished ? 'Hide member' : 'Publish member'}
                  >
                    {member.isPublished ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateMember(member)}
                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                    title="Duplicate Member"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditMember(member)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(member.id)}
                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-zinc-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-zinc-950">Remove Team Member?</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-zinc-800">"{memberToDelete.name}"</span> ({memberToDelete.role}) from the public About collective?
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
                  onDeleteMember(memberToDelete.id);
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
