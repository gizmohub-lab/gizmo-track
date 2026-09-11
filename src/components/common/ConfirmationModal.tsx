import React from 'react';
import { AlertTriangle, Trash2, Archive, X, Info } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onArchive?: () => void;
  title: string;
  description?: string;
  itemName?: string;
  itemType?: string;
  warningText?: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  archiveLabel?: string;
  relatedInfo?: string[];
  isProcessing?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onArchive,
  title,
  description,
  itemName,
  itemType,
  warningText = 'This action cannot be undone.',
  confirmLabel = 'Delete Permanently',
  confirmVariant = 'danger',
  archiveLabel = 'Archive Instead',
  relatedInfo,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirmation-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        id="confirmation-modal-card"
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between p-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                confirmVariant === 'danger'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
                {itemType && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold uppercase">
                    {itemType}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Please confirm your action below</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Item Callout */}
          {itemName && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Selected Item
              </span>
              <p className="font-bold text-slate-900 text-sm mt-0.5 break-words">{itemName}</p>
            </div>
          )}

          {/* Description */}
          {description && <p className="text-slate-600 leading-relaxed">{description}</p>}

          {/* Related Info Warnings */}
          {relatedInfo && relatedInfo.length > 0 && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Impact on Related Records:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800/90 pl-1">
                {relatedInfo.map((info, idx) => (
                  <li key={idx}>{info}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Irreversible Warning */}
          {warningText && (
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{warningText}</span>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Cancel
          </button>

          {onArchive && (
            <button
              type="button"
              onClick={onArchive}
              disabled={isProcessing}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{archiveLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
