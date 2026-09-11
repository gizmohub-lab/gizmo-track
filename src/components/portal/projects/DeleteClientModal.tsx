import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, ShieldAlert, Loader2, Archive } from 'lucide-react';
import { Client, Project, Invoice } from '../../../types';

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  projects: Project[];
  invoices: Invoice[];
  onConfirmDelete: (clientId: string) => Promise<void> | void;
  isAdmin?: boolean;
}

export const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
  isOpen,
  onClose,
  client,
  projects,
  invoices,
  onConfirmDelete,
  isAdmin = true,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!isOpen || !client || !isAdmin) return null;

  // Find linked records
  const linkedProjects = projects.filter(
    (p) =>
      p.clientId === client.id ||
      p.clientName?.toLowerCase() === client.name.toLowerCase() ||
      (client.company && p.clientName?.toLowerCase() === client.company.toLowerCase())
  );

  const linkedInvoices = invoices.filter(
    (inv) =>
      inv.billedTo.clientName?.toLowerCase() === client.name.toLowerCase() ||
      (client.company && inv.billedTo.company?.toLowerCase() === client.company.toLowerCase())
  );

  const handleDelete = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm permanent deletion.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onConfirmDelete(client.id);
      setIsDeleting(false);
      setConfirmText('');
      onClose();
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteError(err?.message || 'Failed to delete client. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 relative overflow-hidden">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Admin Security Action
            </span>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-2 text-zinc-400 hover:text-zinc-950 rounded-xl hover:bg-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h3 className="text-xl font-black text-zinc-950 tracking-tight">Delete Client?</h3>
          <p className="text-xs text-zinc-600">
            You are about to remove client <strong className="text-zinc-950">"{client.name}"</strong>
            {client.company ? ` (${client.company})` : ''} from the client directory.
          </p>
        </div>

        {/* Client Summary & Linked Records Box */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mb-6 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 font-semibold">Contact Email</span>
            <span className="font-bold text-zinc-900">{client.email || 'None'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 font-semibold">Phone / WA</span>
            <span className="font-bold text-zinc-900">{client.phone || 'None'}</span>
          </div>
          <div className="pt-2 border-t border-zinc-200 grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-white border border-zinc-200 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Projects</span>
              <span className="text-sm font-black text-zinc-900">{linkedProjects.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-zinc-200 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Invoices</span>
              <span className="text-sm font-black text-zinc-900">{linkedInvoices.length}</span>
            </div>
          </div>

          {(linkedProjects.length > 0 || linkedInvoices.length > 0) && (
            <div className="pt-2 border-t border-zinc-200 text-xs text-amber-800 font-semibold flex items-start gap-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Warning: This client has {linkedProjects.length} active/past project(s) and {linkedInvoices.length} invoice(s). Deleting the client will remove their directory profile. Financial history and linked records will be preserved or archived accordingly.
              </span>
            </div>
          )}
        </div>

        {/* Confirmation Input */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-extrabold text-zinc-900 block">
            Type <span className="text-rose-600 font-mono font-black">DELETE</span> to confirm removal:
          </label>
          <input
            type="text"
            disabled={isDeleting}
            placeholder="Type DELETE here"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (deleteError) setDeleteError(null);
            }}
            className="w-full px-4 py-3 text-xs font-bold rounded-xl border border-zinc-300 outline-none focus:border-rose-600 transition tracking-widest text-center uppercase"
          />
        </div>

        {deleteError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-between">
            <span>{deleteError}</span>
            <button
              onClick={handleDelete}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] transition font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting || confirmText.trim().toUpperCase() !== 'DELETE'}
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting Client...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Client</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
