import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import { Invoice, PaymentRecord } from '../../types';
import { formatINR, getFormattedTimestamp } from '../../utils/formatters';

interface PaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onRecordPayment: (
    invoiceId: string,
    paymentAmount: number,
    paymentRecord: PaymentRecord
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoice,
  onClose,
  onRecordPayment,
}) => {
  if (!invoice) return null;

  const currentReceived = invoice.receivedAmount || 0;
  const grandTotal = invoice.grandTotal;
  const currentBalance = Math.max(0, grandTotal - currentReceived);

  const [paymentAmount, setPaymentAmount] = useState<number>(currentBalance);
  const [method, setMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque'>('UPI');
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const newTotalReceived = Math.min(
    grandTotal,
    Math.round((currentReceived + (Number(paymentAmount) || 0)) * 100) / 100
  );
  const newBalance = Math.max(
    0,
    Math.round((grandTotal - newTotalReceived) * 100) / 100
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const record: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date,
      amount: paymentAmount,
      method,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
    };

    onRecordPayment(invoice.id, paymentAmount, record);
    onClose();
  };

  return (
    <div
      id="payment-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Record Payment</h3>
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

        {/* Calculation Preview Banner (Section 14) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Invoice Total</span>
              <div className="font-extrabold font-mono text-slate-900 text-xs mt-0.5">
                {formatINR(grandTotal)}
              </div>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Already Recv</span>
              <div className="font-extrabold font-mono text-emerald-800 text-xs mt-0.5">
                {formatINR(currentReceived)}
              </div>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-700">Current Balance</span>
              <div className="font-extrabold font-mono text-rose-800 text-xs mt-0.5">
                {formatINR(currentBalance)}
              </div>
            </div>
          </div>

          {/* New Projected Balance */}
          <div className="mt-3 p-2.5 bg-violet-50 rounded-lg border border-violet-100 flex items-center justify-between font-semibold text-violet-900">
            <span>Projected Balance after payment:</span>
            <span className="font-bold font-mono text-violet-800 text-sm">
              {formatINR(newBalance)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Payment Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={currentBalance}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm text-slate-900 outline-none focus:border-violet-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setPaymentAmount(currentBalance)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold"
              >
                Full Balance
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none"
              >
                <option value="UPI">UPI (GPay/PhonePe)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Transaction / UPI Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. UPI/98458790172/294018"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received partial advance via PhonePe"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record &amp; Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
