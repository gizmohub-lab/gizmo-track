import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Share2,
  Edit,
  Copy,
  CheckCircle,
  CreditCard,
  History,
  FileText,
} from 'lucide-react';
import { Invoice } from '../../types';
import { InvoiceDocument } from './InvoiceDocument';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onEdit: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  onMarkPaid: (invoiceId: string) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onShare: (invoice: Invoice) => void;
  onOpenProject?: (projectId: string) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  onClose,
  onEdit,
  onDuplicate,
  onMarkPaid,
  onRecordPayment,
  onShare,
  onOpenProject,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!invoice) return null;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateInvoicePDF(invoice);
    } catch (err) {
      console.error('PDF generation error', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="invoice-preview-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div
        id="invoice-preview-container"
        className="bg-slate-100 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden border border-slate-300"
      >
        {/* Top Control Bar */}
        <div className="no-print p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 font-mono text-base">
                  {invoice.invoiceNo}
                </span>
                <span className="text-xs text-slate-500 font-medium">· {invoice.billedTo.clientName}</span>
              </div>
              <p className="text-[11px] text-slate-400">Live Vector Document Preview</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
                showHistory
                  ? 'bg-violet-50 text-violet-700 border-violet-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({invoice.history?.length || 0})</span>
            </button>

            {invoice.status !== 'Paid' && (
              <>
                <button
                  onClick={() => onRecordPayment(invoice)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
                <button
                  onClick={() => onMarkPaid(invoice.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark as Paid</span>
                </button>
              </>
            )}

            <button
              onClick={() => onEdit(invoice)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onDuplicate(invoice)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={() => onShare(invoice)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-violet-700 border border-violet-200 hover:bg-violet-50 transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              id="btn-download-pdf"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-xs shadow-violet-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONNECTED PROJECT BANNER & BACK LINK */}
        {(invoice.projectId || invoice.projectTitle) && (
          <div className="no-print bg-violet-50/90 border-b border-violet-200 px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-violet-900 uppercase text-[10px] tracking-wider bg-violet-200/70 px-1.5 py-0.5 rounded">
                Connected Project
              </span>
              <span className="font-extrabold text-slate-900">
                {invoice.projectTitle || 'Project Details'}
              </span>
              {invoice.projectCode && (
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-violet-800 border border-violet-200 shadow-2xs">
                  {invoice.projectCode}
                </span>
              )}
              {invoice.invoiceStage && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                  Stage: {invoice.invoiceStage}
                </span>
              )}
            </div>

            {onOpenProject && invoice.projectId && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProject(invoice.projectId!);
                }}
                className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-2xs transition cursor-pointer shrink-0"
              >
                <span>Return to Project Workspace</span>
                <span className="text-[12px]">↗</span>
              </button>
            )}
          </div>
        )}

        {/* Content Area with optional History Sidebar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/60 flex flex-col md:flex-row gap-4 items-start justify-center">
          {/* The Primary Invoice Document Sheet */}
          <div className="w-full flex-1">
            <InvoiceDocument invoice={invoice} />
          </div>

          {/* Section 29: Invoice History Log */}
          {showHistory && (
            <div className="no-print w-full md:w-80 bg-white rounded-xl p-4 border border-slate-200 shadow-md shrink-0 self-stretch overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-600" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Invoice Audit Log
                  </h3>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {invoice.history && invoice.history.length > 0 ? (
                  invoice.history.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1"
                    >
                      <div className="font-bold text-slate-800">{h.action}</div>
                      {h.note && <div className="text-slate-600">{h.note}</div>}
                      <div className="text-[11px] text-slate-400 font-mono">{h.timestamp}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">No logged history.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
