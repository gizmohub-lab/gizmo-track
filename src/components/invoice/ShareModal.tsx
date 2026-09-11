import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Mail,
  MessageCircle,
  Download,
} from 'lucide-react';
import { Invoice } from '../../types';
import { formatINR, formatDate, getUpiPaymentUri } from '../../utils/formatters';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

interface ShareModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ invoice, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  const upiId = invoice.paymentDetails?.upiId || '9845879017-2@ybl';
  const upiUri = getUpiPaymentUri({
    upiId,
    accountName: invoice.paymentDetails?.accountName || 'GIZMO DESIGN',
    amount: invoice.balanceAmount > 0 ? invoice.balanceAmount : invoice.grandTotal,
    invoiceNo: invoice.invoiceNo,
  });

  // Construct message summary suitable for WhatsApp / SMS / Email
  const shareMessage = `*INVOICE: ${invoice.invoiceNo}*
*GIZMO DESIGN* — Creative & Design Studio
--------------------------------
*Client:* ${invoice.billedTo.clientName}
*Date:* ${formatDate(invoice.invoiceDate)}
*Due Date:* ${formatDate(invoice.dueDate)}

*Items:*
${invoice.items.map((it, i) => `${i + 1}. ${it.description} (${it.quantity} x ${formatINR(it.rate)}) = ${formatINR(it.amount)}`).join('\n')}

*Total (INR):* ${formatINR(invoice.grandTotal, true)}
*Received:* ${formatINR(invoice.receivedAmount, true)}
*Balance Due:* ${formatINR(invoice.balanceAmount, true)}
*Status:* ${invoice.status}

*Pay via UPI:*
UPI ID: ${upiId}
Direct UPI Link: ${upiUri}

For enquiries, email gizmo.hub.in@gmail.com or call +91 98458 79017.
Thank you for your business!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareMessage);
    const phone = invoice.billedTo.phone ? invoice.billedTo.phone.replace(/[^0-9]/g, '') : '';
    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(
      `Invoice ${invoice.invoiceNo} from GIZMO DESIGN - ${invoice.billedTo.clientName}`
    );
    const body = encodeURIComponent(shareMessage);
    const emailTo = invoice.billedTo.email || '';
    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  const handleDownloadPdf = async () => {
    await generateInvoicePDF(invoice);
  };

  return (
    <div
      id="share-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Share Invoice</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {invoice.invoiceNo} · {invoice.billedTo.clientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Quick Channels Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsApp}
              className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Share via WhatsApp</span>
            </button>

            <button
              onClick={handleEmail}
              className="p-3.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-800 font-bold transition flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4 text-violet-600" />
              <span>Draft Email</span>
            </button>
          </div>

          {/* Formatted Text Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">Preformatted Message Text</label>
              <button
                onClick={handleCopy}
                className="text-violet-700 hover:text-violet-900 font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={shareMessage}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 select-all outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
