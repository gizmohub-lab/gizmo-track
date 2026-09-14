import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, ShieldAlert, Loader2, CheckSquare, Square } from 'lucide-react';
import { ResetOptions } from '../../../types';

interface ResetPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (options: ResetOptions) => void;
}

export const ResetPortalModal: React.FC<ResetPortalModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  const [options, setOptions] = useState<ResetOptions>({
    projects: false,
    clients: false,
    localWorks: false,
    invoices: false,
    payments: false,
    deliverables: false,
    customOptions: false,
    dashboardData: false,
  });

  const [isResetting, setIsResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = async () => {
    setIsResetting(true);
    setErrorMsg(null);

    try {
      await onConfirmReset(options);
      setIsResetting(false);
      onClose();
    } catch (err: any) {
      setIsResetting(false);
      setErrorMsg(err?.message || 'Failed to process reset request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 relative overflow-hidden">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Production Safety Lock
            </span>
            <button
              onClick={onClose}
              disabled={isResetting}
              className="p-2 text-zinc-400 hover:text-zinc-950 rounded-xl hover:bg-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h3 className="text-xl font-black text-zinc-950 tracking-tight">Reset Application?</h3>
          <p className="text-xs text-zinc-600">
            This action can affect application data and settings. Your production data will not be changed without explicit confirmation.
          </p>
        </div>

        {/* Production Protection Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900 font-medium">
          <ShieldAlert className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-extrabold block text-emerald-950 mb-0.5">Production Data Protected</strong>
            Live Firestore records (projects, clients, invoices, payments, local works, deliverables) are fully protected. Destructive data resets are disabled in production mode.
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <button
            type="button"
            disabled={isResetting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isResetting}
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Confirm Reset</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
