import React from 'react';
import { X, Check, Rocket, AlertTriangle, RotateCcw, Clock, ShieldCheck } from 'lucide-react';
import { PublicSiteMeta } from '../../../types';

interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  onDiscardDraft: () => void;
  meta: PublicSiteMeta;
}

export const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  onDiscardDraft,
  meta,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EE1D45]/10 text-[#EE1D45] flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950">
                Publish Public Site Changes
              </h2>
              <p className="text-xs text-zinc-500">
                Deploy your draft revisions to the live Gizmo Public Website.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span>Current Live Version:</span>
              <span className="font-mono font-bold text-zinc-900">
                v{meta.publishedVersion || 1}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Last Published:</span>
              <span className="font-medium text-zinc-900">
                {meta.lastPublishedAt
                  ? new Date(meta.lastPublishedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Initial Baseline'}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Published By:</span>
              <span className="font-medium text-zinc-900 truncate max-w-[200px]">
                {meta.lastPublishedBy || 'Admin'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Safe &amp; Non-Destructive</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Publishing updates the public website content cache instantly. All existing client records, projects, invoices, and storage files remain 100% protected and untouched.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onPublish();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] active:bg-[#B80D30] text-white text-xs font-bold shadow-md shadow-[#EE1D45]/25 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Rocket className="w-4 h-4" />
              <span>Confirm &amp; Publish Changes to Live Site</span>
            </button>

            {meta.hasUnpublishedChanges && (
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to discard your uncommitted draft changes? This will revert your draft to match the live published website.'
                    )
                  ) {
                    onDiscardDraft();
                    onClose();
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard Draft Changes &amp; Revert to Live</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
