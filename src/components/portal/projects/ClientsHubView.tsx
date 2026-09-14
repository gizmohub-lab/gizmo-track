import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  DollarSign,
  User,
  Phone,
  Mail,
  MessageCircle,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  Receipt,
  Building,
  MapPin,
  ExternalLink,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Client, Project, Invoice } from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { getClientHubSummary, ClientHubSummaryItem } from '../../../utils/projectUtils';
import { DeleteClientModal } from './DeleteClientModal';

interface ClientsHubViewProps {
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  onBackToOverview: () => void;
  onOpenClientWorkspace: (client: Client) => void;
  onCreateProjectForClient: (client: Client) => void;
  onCreateInvoiceForClient: (client: Client) => void;
  onOpenAddClientModal?: () => void;
  onAddClient?: (client: Client) => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const ClientsHubView: React.FC<ClientsHubViewProps> = ({
  clients,
  projects,
  invoices,
  onBackToOverview,
  onOpenClientWorkspace,
  onCreateProjectForClient,
  onCreateInvoiceForClient,
  onOpenAddClientModal,
  onAddClient,
  onEditClient,
  onDeleteClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeMenuClientId, setActiveMenuClientId] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Client Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  const [newClientType, setNewClientType] = useState('');
  const [newReference, setNewReference] = useState('');

  // Duplicate warning states
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState<Client | null>(null);
  const [pendingNewClient, setPendingNewClient] = useState<Client | null>(null);

  const handleSaveNewClient = (e: React.FormEvent, bypassDuplicate: boolean = false) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const qName = newName.trim().toLowerCase();
    const qEmail = newEmail.trim().toLowerCase();
    const qPhone = newPhone.trim().replace(/\s+/g, '');
    const qWhatsapp = newWhatsapp.trim().replace(/\s+/g, '');

    const existingMatch = !bypassDuplicate ? clients.find((c) => {
      if (qEmail && c.email && c.email.toLowerCase() === qEmail) return true;
      if (qPhone && c.phone && c.phone.replace(/\s+/g, '') === qPhone) return true;
      if (qWhatsapp && c.whatsapp && c.whatsapp.replace(/\s+/g, '') === qWhatsapp) return true;
      if (qName && c.name.toLowerCase() === qName) return true;
      if (newCompany.trim() && c.company && c.company.toLowerCase() === newCompany.trim().toLowerCase()) return true;
      return false;
    }) : null;

    const clientObj: Client = {
      id: `client-${Date.now()}`,
      name: newName.trim(),
      company: newCompany.trim() || undefined,
      whatsapp: newWhatsapp.trim() || undefined,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      city: newCity.trim() || undefined,
      address: newAddress.trim() || undefined,
      website: newWebsite.trim() || undefined,
      notes: newNotes.trim() || undefined,
      status: newStatus,
      clientType: newClientType.trim() || undefined,
      reference: newReference.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    if (existingMatch && !bypassDuplicate) {
      setDuplicateMatch(existingMatch);
      setPendingNewClient(clientObj);
      setShowDuplicateModal(true);
      return;
    }

    if (onAddClient) {
      onAddClient(clientObj);
    }
    setShowAddClientModal(false);
    setShowDuplicateModal(false);
    setDuplicateMatch(null);
    setPendingNewClient(null);

    // Reset form
    setNewName('');
    setNewCompany('');
    setNewWhatsapp('');
    setNewPhone('');
    setNewEmail('');
    setNewCity('');
    setNewAddress('');
    setNewWebsite('');
    setNewNotes('');
    setNewStatus('Active');
    setNewClientType('');
    setNewReference('');

    setToastMessage('Client created successfully.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.client-action-menu-container')) {
        setActiveMenuClientId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Client Hub Metrics & Items
  const summary = useMemo(() => {
    return getClientHubSummary(clients, projects, invoices);
  }, [clients, projects, invoices]);

  // Filter Items
  const filteredItems = useMemo(() => {
    return summary.items.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.client.name.toLowerCase().includes(q);
        const matchCompany = (item.client.company || '').toLowerCase().includes(q);
        const matchPhone = (item.client.phone || '').includes(q);
        const matchEmail = (item.client.email || '').toLowerCase().includes(q);
        const matchCity = (item.client.city || '').toLowerCase().includes(q);
        if (!matchName && !matchCompany && !matchPhone && !matchEmail && !matchCity) return false;
      }
      return true;
    });
  }, [summary.items, statusFilter, searchQuery]);

  return (
    <div id="clients-hub-subview" className="space-y-6">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-1">
            <button
              type="button"
              onClick={onBackToOverview}
              className="hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Projects Control Center</span>
            </button>
            <span>/</span>
            <span className="text-zinc-900 font-bold">Clients Hub</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Clients Hub</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage client accounts, project pipelines, billed invoices and accounts receivable.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (onOpenAddClientModal) {
                onOpenAddClientModal();
              } else {
                setShowAddClientModal(true);
              }
            }}
            className="rounded-full bg-[#EE1D45] hover:bg-[#d4193e] text-white px-4 py-2 text-xs font-extrabold shadow-sm transition-all duration-150 transform hover:scale-[1.02] flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>+ Add Client</span>
          </button>

          <button
            type="button"
            onClick={onBackToOverview}
            className="rounded-xl bg-zinc-900 hover:bg-black text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects Overview</span>
          </button>
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Total Clients
          </span>
          <div className="text-xl font-black text-zinc-900 mt-1">
            {summary.totalClients}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-0.5">
            {summary.activeClientsCount} active
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Total Projects
          </span>
          <div className="text-xl font-black text-zinc-900 mt-1">
            {summary.totalProjectsCount}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-0.5">
            {summary.completedProjectsCount} completed
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Total Project Value
          </span>
          <div className="text-xl font-black font-mono text-zinc-900 mt-1">
            {formatINR(summary.totalProjectValue)}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Gross booked pipeline</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Total Received (Got)
          </span>
          <div className="text-xl font-black font-mono text-emerald-700 mt-1">
            {formatINR(summary.totalAmountGot)}
          </div>
          <span className="text-[11px] text-emerald-600 block mt-0.5">Collected revenue</span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
            Outstanding (To Get)
          </span>
          <div className="text-xl font-black font-mono text-rose-700 mt-1">
            {formatINR(summary.totalAmountToGet)}
          </div>
          <span className="text-[11px] text-rose-600 block mt-0.5">Pending client payments</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Pending Accounts
          </span>
          <div className="text-xl font-black text-zinc-900 mt-1">
            {summary.totalPendingPayments}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Clients with due balances</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            id="input-search-clients-hub"
            placeholder="Search client by name, company, city, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 outline-none focus:border-zinc-400 shadow-2xs"
          >
            <option value="all">All Client Statuses</option>
            <option value="Active">Active Projects</option>
            <option value="Pending Payment">Pending Payment</option>
            <option value="Completed">Completed</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* 4. Clients Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 text-xs">
            No clients match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-3">Company / Location</th>
                  <th className="py-3.5 px-3 text-center">Projects</th>
                  <th className="py-3.5 px-3 text-center">Invoices</th>
                  <th className="py-3.5 px-3 text-right">Total Value</th>
                  <th className="py-3.5 px-3 text-right">Got</th>
                  <th className="py-3.5 px-3 text-right">To Get</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {filteredItems.map((item) => {
                  const c = item.client;
                  const waNumber = c.whatsapp || c.phone?.replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-zinc-50/70 transition-colors group cursor-pointer"
                      onClick={() => onOpenClientWorkspace(c)}
                    >
                      {/* Client Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 font-bold border border-orange-500/20 shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 group-hover:text-orange-600 transition-colors text-sm block">
                              {c.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                              {c.phone && <span>{c.phone}</span>}
                              {waNumber && (
                                <a
                                  href={`https://wa.me/${waNumber}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-emerald-500 hover:text-emerald-600 font-semibold"
                                >
                                  WA
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company & Location */}
                      <td className="py-3.5 px-3">
                        {c.company && (
                          <span className="font-semibold text-zinc-800 block line-clamp-1">
                            {c.company}
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-400 block">
                          {c.city ? `${c.city}${c.state ? `, ${c.state}` : ''}` : 'No location specified'}
                        </span>
                      </td>

                      {/* Projects */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-900">
                          {item.projectsCount}
                        </span>
                        {item.activeProjectsCount > 0 && (
                          <span className="text-[10px] text-blue-600 block mt-0.5 font-semibold">
                            {item.activeProjectsCount} active
                          </span>
                        )}
                      </td>

                      {/* Invoices */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-900">
                          {item.invoicesCount}
                        </span>
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-900">
                        {formatINR(item.totalProjectValue)}
                      </td>

                      {/* Got */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">
                        {formatINR(item.amountGot)}
                      </td>

                      {/* To Get */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                        {formatINR(item.amountToGet)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            item.status === 'Active'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.status === 'Pending Payment'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : item.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 relative client-action-menu-container">
                          <button
                            type="button"
                            title="Open Client Workspace"
                            onClick={() => onOpenClientWorkspace(c)}
                            className="rounded-lg bg-zinc-900 hover:bg-black text-white px-2.5 py-1.5 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Workspace</span>
                          </button>

                          <button
                            type="button"
                            title="Create Project for Client"
                            onClick={() => onCreateProjectForClient(c)}
                            className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 p-1.5 text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Create Invoice for Client"
                            onClick={() => onCreateInvoiceForClient(c)}
                            className="rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 p-1.5 text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Client Actions"
                            onClick={() => setActiveMenuClientId(activeMenuClientId === c.id ? null : c.id)}
                            className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 p-1.5 text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>

                          {activeMenuClientId === c.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuClientId(null);
                                  onOpenClientWorkspace(c);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Open Workspace</span>
                              </button>

                              {onEditClient && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuClientId(null);
                                    onEditClient(c);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>Edit Client</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuClientId(null);
                                  onCreateProjectForClient(c);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                              >
                                <Plus className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Add Project</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuClientId(null);
                                  onCreateInvoiceForClient(c);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                              >
                                <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Create Invoice</span>
                              </button>

                              <div className="my-1 border-t border-zinc-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuClientId(null);
                                  setClientToDelete(c);
                                  setShowDeleteModal(true);
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete Client</span>
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
        )}
      </div>

      {/* ADD CLIENT MODAL */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-zinc-950">Add New Client</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Register a new client account for projects and invoicing.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-xs transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => handleSaveNewClient(e, false)} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Company / Brand</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Apex Studio"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">Stored separately from Gizmo official line.</span>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Mumbai, India"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Billing / Physical Address</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Street address, building, suite"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Website / Social Handle</label>
                  <input
                    type="text"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    placeholder="https://clientbrand.com or @handle"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Account Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Lead">Lead / Prospect</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Client Type (Optional)</label>
                  <input
                    type="text"
                    value={newClientType}
                    onChange={(e) => setNewClientType(e.target.value)}
                    placeholder="e.g. Direct Brand, Agency Partner"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Reference / Source (Optional)</label>
                  <input
                    type="text"
                    value={newReference}
                    onChange={(e) => setNewReference(e.target.value)}
                    placeholder="e.g. Referral, Google Search, Instagram"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Internal Notes</label>
                  <textarea
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Add project scope preferences, billing terms or notes..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#EE1D45] hover:bg-[#d4193e] text-white font-extrabold shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DUPLICATE WARNING MODAL */}
      {showDuplicateModal && duplicateMatch && pendingNewClient && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-zinc-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-zinc-950">Possible existing client found.</h3>
              <p className="text-xs text-zinc-500 font-medium">
                A client with similar contact details or name already exists in the system.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-semibold">Existing Client:</span>
                <span className="font-extrabold text-zinc-900">{duplicateMatch.name}</span>
              </div>
              {duplicateMatch.company && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-semibold">Company:</span>
                  <span className="font-semibold text-zinc-900">{duplicateMatch.company}</span>
                </div>
              )}
              {duplicateMatch.phone && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-semibold">Phone / WhatsApp:</span>
                  <span className="font-mono text-zinc-900">{duplicateMatch.phone || duplicateMatch.whatsapp}</span>
                </div>
              )}
              {duplicateMatch.email && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-semibold">Email:</span>
                  <span className="text-zinc-900">{duplicateMatch.email}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false);
                  setShowAddClientModal(false);
                  onOpenClientWorkspace(duplicateMatch);
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Existing Client</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setShowDuplicateModal(false);
                  if (pendingNewClient) {
                    if (onAddClient) {
                      onAddClient(pendingNewClient);
                    }
                    setShowAddClientModal(false);
                    setDuplicateMatch(null);
                    setPendingNewClient(null);
                    setToastMessage('Client created successfully.');
                    setTimeout(() => setToastMessage(null), 4000);
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition"
              >
                Continue Creating
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false);
                  setDuplicateMatch(null);
                  setPendingNewClient(null);
                }}
                className="w-full py-2 text-zinc-500 hover:text-zinc-800 text-xs font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CLIENT MODAL */}
      <DeleteClientModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setClientToDelete(null);
        }}
        client={clientToDelete}
        projects={projects}
        invoices={invoices}
        isAdmin={true}
        onConfirmDelete={(clientId) => {
          if (onDeleteClient) {
            onDeleteClient(clientId);
          }
          setShowDeleteModal(false);
          setClientToDelete(null);
          setToastMessage('Client deleted successfully.');
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* TOAST BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 border border-zinc-700 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
