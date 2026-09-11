import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  User,
  Briefcase,
  FileText,
  DollarSign,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Building,
  MapPin,
  Plus,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { Client, Project, Invoice } from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { getProjectFinancials } from '../../../utils/projectUtils';
import { DeleteProjectModal } from './DeleteProjectModal';

interface ClientWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  projects: Project[];
  invoices: Invoice[];
  onOpenProjectWorkspace?: (projectId: string) => void;
  onCreateProjectForClient?: (client: Client) => void;
  onCreateInvoiceForClient?: (client: Client) => void;
  onEditClient?: (client: Client) => void;
  onDeleteProject?: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
}

export const ClientWorkspaceModal: React.FC<ClientWorkspaceModalProps> = ({
  isOpen,
  onClose,
  client,
  projects = [],
  invoices = [],
  onOpenProjectWorkspace,
  onCreateProjectForClient,
  onCreateInvoiceForClient,
  onEditClient,
  onDeleteProject,
  onEditProject,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'invoices' | 'payments'>('projects');
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.project-action-menu-container')) {
        setActiveMenuProjectId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !client) return null;

  // Filter projects and invoices belonging to this client
  const clientProjects = projects.filter(
    (p) => p.clientId === client.id || (p.clientName && p.clientName.trim().toLowerCase() === client.name.trim().toLowerCase())
  );

  const clientInvoices = invoices.filter(
    (inv) =>
      (inv.billedTo && inv.billedTo.clientName && inv.billedTo.clientName.trim().toLowerCase() === client.name.trim().toLowerCase()) ||
      clientProjects.some((p) => p.id === inv.projectId)
  );

  // Compute Client Financials
  let totalProjectValue = 0;
  let totalGot = 0;
  let totalToGet = 0;
  let activeProjectsCount = 0;
  let completedProjectsCount = 0;

  clientProjects.forEach((p) => {
    const fin = getProjectFinancials(p, clientInvoices);
    totalProjectValue += fin.totalAmount;
    totalGot += fin.amountGot;
    totalToGet += fin.amountToGet;

    if (p.status === 'Completed') {
      completedProjectsCount += 1;
    } else if (p.status !== 'Cancelled') {
      activeProjectsCount += 1;
    }
  });

  const whatsappNumber = client.whatsapp || client.phone?.replace(/[^0-9]/g, '');

  return (
    <div
      id="modal-client-workspace"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 bg-zinc-900 px-6 py-5 text-white gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xl font-black">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">{client.name}</h2>
                {client.company && (
                  <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300 border border-zinc-700">
                    {client.company}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3.5 mt-1.5 text-xs text-zinc-400">
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="hover:text-zinc-200 flex items-center gap-1 text-zinc-300">
                    <Phone className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{client.phone}</span>
                  </a>
                )}
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {client.email && (
                  <a href={`mailto:${client.email}`} className="hover:text-zinc-200 flex items-center gap-1 text-zinc-300">
                    <Mail className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{client.email}</span>
                  </a>
                )}
                {client.city && (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    <span>
                      {client.city}
                      {client.state ? `, ${client.state}` : ''}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onCreateProjectForClient && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateProjectForClient(client);
                }}
                className="rounded-xl bg-orange-600 hover:bg-orange-500 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>+ Project</span>
              </button>
            )}

            {onCreateInvoiceForClient && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateInvoiceForClient(client);
                }}
                className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Receipt className="h-4 w-4 text-orange-400" />
                <span>+ Invoice</span>
              </button>
            )}

            {onEditClient && (
              <button
                type="button"
                onClick={() => onEditClient(client)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 text-xs transition-colors"
                title="Edit Client"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 1. Summary Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-5 bg-zinc-50/70 border-b border-zinc-200/80">
          <div className="rounded-xl bg-white border border-zinc-200/80 p-3 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total Projects
            </span>
            <div className="text-xl font-black text-zinc-900 mt-0.5">
              {clientProjects.length}
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              {activeProjectsCount} active · {completedProjectsCount} completed
            </span>
          </div>

          <div className="rounded-xl bg-white border border-zinc-200/80 p-3 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total Value
            </span>
            <div className="text-xl font-black font-mono text-zinc-900 mt-0.5">
              {formatINR(totalProjectValue)}
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">All project scopes</span>
          </div>

          <div className="rounded-xl bg-white border border-emerald-200/80 bg-emerald-50/20 p-3 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Amount Received
            </span>
            <div className="text-xl font-black font-mono text-emerald-700 mt-0.5">
              {formatINR(totalGot)}
            </div>
            <span className="text-[10px] text-emerald-600/70 block mt-0.5">Collected revenue</span>
          </div>

          <div className="rounded-xl bg-white border border-rose-200/80 bg-rose-50/20 p-3 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
              Balance To Get
            </span>
            <div className="text-xl font-black font-mono text-rose-700 mt-0.5">
              {formatINR(totalToGet)}
            </div>
            <span className="text-[10px] text-rose-600/70 block mt-0.5">Outstanding balance</span>
          </div>

          <div className="rounded-xl bg-white border border-zinc-200/80 p-3 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Invoices Issued
            </span>
            <div className="text-xl font-black text-zinc-900 mt-0.5">
              {clientInvoices.length}
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Tax invoices &amp; bills</span>
          </div>
        </div>

        {/* 2. Sub Tabs Navigation */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-zinc-100 bg-white">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`rounded-lg px-3.5 py-1.5 font-bold transition-colors ${
                activeTab === 'projects'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Projects ({clientProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`rounded-lg px-3.5 py-1.5 font-bold transition-colors ${
                activeTab === 'invoices'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Invoices ({clientInvoices.length})
            </button>
          </div>
        </div>

        {/* 3. Main Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'projects' ? (
            clientProjects.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl text-zinc-400">
                No projects created for this client yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                      <th className="py-2.5 px-3.5">Project</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Designer</th>
                      <th className="py-2.5 px-3">Deadline</th>
                      <th className="py-2.5 px-3 text-right">Value</th>
                      <th className="py-2.5 px-3 text-right">Got</th>
                      <th className="py-2.5 px-3 text-right">To Get</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                    {clientProjects.map((p) => {
                      const fin = getProjectFinancials(p, clientInvoices);
                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3 px-3.5">
                            <span className="font-bold text-zinc-900 block line-clamp-1">{p.title}</span>
                            <span className="text-[10px] font-mono text-zinc-400">{p.projectCode}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-zinc-700 font-semibold">
                            {p.assignedDesignerName || 'Unassigned'}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-zinc-600">
                            {p.deadlineDate || p.dueDate || 'No deadline'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                            {formatINR(fin.totalAmount)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                            {formatINR(fin.amountGot)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                            {formatINR(fin.amountToGet)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 relative project-action-menu-container">
                              {onOpenProjectWorkspace && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onOpenProjectWorkspace(p.id);
                                  }}
                                  className="rounded-lg bg-zinc-900 hover:bg-black text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition"
                                >
                                  Open
                                </button>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => setActiveMenuProjectId(activeMenuProjectId === p.id ? null : p.id)}
                                className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                                title="Project Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuProjectId === p.id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuProjectId(null);
                                      onClose();
                                      if (onOpenProjectWorkspace) onOpenProjectWorkspace(p.id);
                                    }}
                                    className="w-full px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>Open Workspace</span>
                                  </button>

                                  {onEditProject && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuProjectId(null);
                                        onClose();
                                        onEditProject(p);
                                      }}
                                      className="w-full px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                                      <span>Edit Project</span>
                                    </button>
                                  )}

                                  <div className="my-1 border-t border-zinc-100" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuProjectId(null);
                                      setProjectToDelete(p);
                                      setShowDeleteModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Delete Project</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* INVOICES TAB */
            clientInvoices.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl text-zinc-400">
                No invoices created for this client yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                      <th className="py-2.5 px-3.5">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3 text-right">Grand Total</th>
                      <th className="py-2.5 px-3 text-right">Balance Due</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                    {clientInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-3.5 font-bold font-mono text-zinc-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-600">{inv.issueDate}</td>
                        <td className="py-3 px-3 font-mono text-zinc-600">{inv.dueDate || '—'}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                          {formatINR(inv.grandTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                          {formatINR(inv.balanceDue || 0)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : inv.status === 'Partially Paid'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* DELETE PROJECT MODAL */}
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProjectToDelete(null);
          }}
          project={projectToDelete}
          isAdmin={true}
          onConfirmDelete={(projectId) => {
            if (onDeleteProject) {
              onDeleteProject(projectId);
            }
            setShowDeleteModal(false);
            setProjectToDelete(null);
          }}
        />

        {/* Footer */}
        <div className="border-t border-zinc-100 px-6 py-3.5 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <div>Client Workspace · {client.name}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
