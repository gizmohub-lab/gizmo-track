import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  FileText,
  Building,
  ArrowUpRight,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Client, Invoice } from '../../types';
import { formatINR } from '../../utils/formatters';
import { DeleteClientModal } from './projects/DeleteClientModal';

interface PeopleViewProps {
  clients: Client[];
  projects?: any[];
  invoices: Invoice[];
  onAddClient: (client: Client) => void;
  onCreateInvoiceForClient: (client: Client) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  clients,
  projects = [],
  invoices,
  onAddClient,
  onCreateInvoiceForClient,
  onViewInvoice,
  onDeleteClient,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [gstin, setGstin] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: name.trim(),
      company: company.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      pinCode: pinCode.trim() || undefined,
      country: 'India',
      gstin: gstin.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddClient(newClient);
    setShowModal(false);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('');
    setState('');
    setPinCode('');
    setGstin('');
  };

  return (
    <div id="people-view" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              People &amp; Client Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Registered organizations, contact persons, billing addresses, and historical invoice generation records.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Client</span>
        </button>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => {
          const clientInvoices = invoices.filter(
            (inv) =>
              inv.billedTo.clientName?.toLowerCase() === client.name?.toLowerCase() ||
              (client.company &&
                inv.billedTo.company?.toLowerCase() === client.company?.toLowerCase())
          );
          const totalBilled = clientInvoices.reduce((s, i) => s + i.grandTotal, 0);

          return (
            <div
              key={client.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-violet-300 transition duration-150 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-xs text-violet-700 font-semibold flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" />
                        <span>{client.company}</span>
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {clientInvoices.length} Inv
                  </span>
                </div>

                {/* Contact metadata */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {(client.city || client.address) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {client.address ? `${client.address}, ` : ''}
                        {client.city}
                        {client.pinCode ? ` - ${client.pinCode}` : ''}
                      </span>
                    </div>
                  )}
                  {client.gstin && (
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      GSTIN: {client.gstin}
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="p-3 bg-violet-50/50 border border-violet-100/60 rounded-xl mb-4 flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Total Billed</span>
                  <span className="font-mono font-bold text-violet-800 text-sm">
                    {formatINR(totalBilled)}
                  </span>
                </div>
              </div>

              <div>
                {clientInvoices.length > 0 && (
                  <div className="mb-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Recent Invoices:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {clientInvoices.slice(0, 3).map((inv) => (
                        <button
                          key={inv.id}
                          onClick={() => onViewInvoice(inv)}
                          className="px-2 py-0.5 rounded bg-violet-100 hover:bg-violet-200 text-violet-800 text-[11px] font-mono font-bold flex items-center gap-1 transition"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{inv.invoiceNo}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCreateInvoiceForClient(client)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-violet-50 text-slate-800 hover:text-violet-800 font-bold text-xs rounded-xl border border-slate-200 hover:border-violet-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      setClientToDelete(client);
                      setShowDeleteModal(true);
                    }}
                    title="Delete Client"
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Add Client to People
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DARUL HASANIYYAH SNEC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Darul Hasaniyyah Educational Council"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94471 28409"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@mail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Campus Road"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Malappuram"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Kerala"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">PIN</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="676505"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="32ABCDE1234F1Z5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-2 bg-slate-100 font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
