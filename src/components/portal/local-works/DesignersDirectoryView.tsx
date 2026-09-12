import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  XCircle,
  Edit2,
  ExternalLink,
  Shield,
  Briefcase,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { CustomDesigner, LocalWork, DesignerType } from '../../../types';
import { AddCustomDesignerModal } from './AddCustomDesignerModal';

interface DesignersDirectoryViewProps {
  designers?: CustomDesigner[];
  localWorks?: LocalWork[];
  works?: LocalWork[];
  onAddDesigner?: (designer: CustomDesigner) => void;
  onUpdateDesigner?: (designer: CustomDesigner) => void;
  onDeleteDesigner?: (id: string) => void;
  onUpdateDesigners?: (designers: CustomDesigner[]) => void;
  onSelectDesignerForFilter?: (designerName: string) => void;
  onBackToWorks?: () => void;
}

export const DesignersDirectoryView: React.FC<DesignersDirectoryViewProps> = ({
  designers: propDesigners = [],
  localWorks: propLocalWorks,
  works: propWorks,
  onAddDesigner,
  onUpdateDesigner,
  onDeleteDesigner,
  onUpdateDesigners,
  onSelectDesignerForFilter,
  onBackToWorks,
}) => {
  const designers = propDesigners || [];
  const localWorks = propLocalWorks || propWorks || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | DesignerType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDesigner, setEditingDesigner] = useState<CustomDesigner | null>(null);

  // Statistics
  const totalCount = designers.length;
  const staffCount = designers.filter((d) => d.type === 'Portal Staff').length;
  const externalCount = designers.filter((d) => d.type === 'External Designer').length;
  const activeCount = designers.filter((d) => d.isActive).length;

  // Compute work counts per designer
  const getWorkCount = (designerName: string) => {
    return localWorks.filter(
      (w) => w.assignedTo === designerName || (w.supportingDesigners && w.supportingDesigners.includes(designerName))
    ).length;
  };

  const filteredDesigners = useMemo(() => {
    return designers.filter((d) => {
      if (typeFilter !== 'ALL' && d.type !== typeFilter) return false;
      if (statusFilter === 'ACTIVE' && !d.isActive) return false;
      if (statusFilter === 'INACTIVE' && d.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.name.toLowerCase().includes(q);
        const matchRole = d.roleSpecialization?.toLowerCase().includes(q);
        const matchContact = d.phone?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchContact) return false;
      }
      return true;
    });
  }, [designers, typeFilter, statusFilter, searchQuery]);

  const handleToggleActive = (designer: CustomDesigner) => {
    const updated = {
      ...designer,
      isActive: !designer.isActive,
    };
    if (onUpdateDesigner) {
      onUpdateDesigner(updated);
    } else if (onUpdateDesigners) {
      onUpdateDesigners(designers.map((d) => (d.id === designer.id ? updated : d)));
    }
  };

  const handleSaveEdit = (designer: CustomDesigner) => {
    if (onUpdateDesigner) {
      onUpdateDesigner(designer);
    } else if (onUpdateDesigners) {
      onUpdateDesigners(designers.map((d) => (d.id === designer.id ? designer : d)));
    }
    setEditingDesigner(null);
  };

  const handleCreateDesigner = (newD: CustomDesigner) => {
    if (onAddDesigner) {
      onAddDesigner(newD);
    } else if (onUpdateDesigners) {
      onUpdateDesigners([...designers, newD]);
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-zinc-200">
        <div className="flex items-center gap-3">
          {onBackToWorks && (
            <button
              onClick={onBackToWorks}
              className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition"
              title="Back to All Works"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-zinc-950 tracking-tight">Designer Directory</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-bold">
                {totalCount} registered
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Manage Portal Staff and External Designers for Local Works assignment
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Designer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-[10px] font-mono font-bold uppercase text-zinc-400">Total Designers</p>
          <p className="text-xl font-black text-zinc-950 mt-0.5">{totalCount}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-[10px] font-mono font-bold uppercase text-zinc-400">Portal Staff</p>
          <p className="text-xl font-black text-zinc-900 mt-0.5">{staffCount}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-[10px] font-mono font-bold uppercase text-zinc-400">External Partners</p>
          <p className="text-xl font-black text-[#EE1D45] mt-0.5">{externalCount}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
          <p className="text-[10px] font-mono font-bold uppercase text-zinc-400">Active Status</p>
          <p className="text-xl font-black text-emerald-600 mt-0.5">{activeCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search designers by name, role, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 focus:border-[#EE1D45] outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-50">
            {(['ALL', 'Portal Staff', 'External Designer'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  typeFilter === t
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-50">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  statusFilter === s
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {s === 'ALL' ? 'All' : s === 'ACTIVE' ? 'Active' : 'Disabled'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Designers Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50/80 border-b border-zinc-200 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-3 px-4">Designer</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Assigned Works</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredDesigners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-sm text-zinc-700">No designers found</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Try changing filters or add a new designer.</p>
                  </td>
                </tr>
              ) : (
                filteredDesigners.map((d) => {
                  const workCount = getWorkCount(d.name);
                  const isStaff = d.type === 'Portal Staff';

                  return (
                    <tr key={d.id} className="hover:bg-zinc-50/70 transition group">
                      {/* Designer Name & Specialization */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              isStaff
                                ? 'bg-zinc-950 text-white'
                                : 'bg-[#EE1D45]/10 text-[#EE1D45]'
                            }`}
                          >
                            {d.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                              <span>{d.name}</span>
                              {!d.isActive && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-100 text-zinc-500 font-normal">
                                  Disabled
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                              {d.roleSpecialization ? (
                                <span>{d.roleSpecialization}</span>
                              ) : (
                                <span className="italic text-zinc-400">General Design</span>
                              )}
                              {d.notes && (
                                <span className="text-zinc-400 text-[10px] truncate max-w-[180px]" title={d.notes}>
                                  · {d.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            isStaff
                              ? 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                              : 'bg-[#EE1D45]/10 text-[#EE1D45] border border-[#EE1D45]/20'
                          }`}
                        >
                          {isStaff ? '🏢 Portal Staff' : '🌐 External Partner'}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {d.phone ? (
                            <div className="flex items-center gap-1 text-zinc-700">
                              <Phone className="w-3 h-3 text-zinc-400" />
                              <span>{d.phone}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}

                          {d.whatsapp && (
                            <a
                              href={`https://wa.me/${d.whatsapp}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {d.email && (
                            <a
                              href={`mailto:${d.email}`}
                              className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 transition"
                              title={d.email}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(d)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                            d.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200'
                          }`}
                          title={d.isActive ? 'Click to Disable' : 'Click to Enable'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              d.isActive ? 'bg-emerald-500' : 'bg-zinc-400'
                            }`}
                          ></span>
                          <span>{d.isActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>

                      {/* Works Count */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectDesignerForFilter && onSelectDesignerForFilter(d.name)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition ${
                            workCount > 0
                              ? 'bg-zinc-100 text-zinc-900 hover:bg-[#EE1D45]/10 hover:text-[#EE1D45]'
                              : 'text-zinc-400'
                          }`}
                          title="Click to view all works by this designer"
                        >
                          <Layers className="w-3 h-3 text-zinc-400" />
                          <span>{workCount}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSelectDesignerForFilter && (
                            <button
                              onClick={() => onSelectDesignerForFilter(d.name)}
                              className="px-2 py-1 text-[11px] font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                              title="Filter Works"
                            >
                              View Works
                            </button>
                          )}
                          <button
                            onClick={() => setEditingDesigner(d)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
                            title="Edit Designer Info"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(d)}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                              d.isActive
                                ? 'text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={d.isActive ? 'Disable designer for new works' : 'Enable designer'}
                          >
                            {d.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Designer Modal */}
      <AddCustomDesignerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddDesigner={handleCreateDesigner}
      />

      {/* Edit Designer Modal */}
      {editingDesigner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-950">Edit Designer</h3>
              <button
                onClick={() => setEditingDesigner(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Designer Name</label>
                <input
                  type="text"
                  value={editingDesigner.name}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#EE1D45] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Portal Staff', 'External Designer'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditingDesigner({ ...editingDesigner, type: t })}
                      className={`py-1.5 px-3 rounded-lg font-bold border text-xs ${
                        editingDesigner.type === t
                          ? 'bg-[#EE1D45] text-white border-[#EE1D45]'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={editingDesigner.phone || ''}
                  onChange={(e) =>
                    setEditingDesigner({
                      ...editingDesigner,
                      phone: e.target.value,
                      whatsapp: e.target.value.replace(/[^\d]/g, ''),
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#EE1D45] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingDesigner.email || ''}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#EE1D45] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Role / Specialization</label>
                <input
                  type="text"
                  value={editingDesigner.roleSpecialization || ''}
                  onChange={(e) =>
                    setEditingDesigner({ ...editingDesigner, roleSpecialization: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#EE1D45] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingDesigner.notes || ''}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, notes: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 focus:border-[#EE1D45] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setEditingDesigner(null)}
                className="px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdit(editingDesigner)}
                className="px-4 py-1.5 bg-[#EE1D45] hover:bg-[#D8143C] text-white text-xs font-bold rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
