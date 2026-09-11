import React, { useState, useEffect } from 'react';
import {
  X,
  IndianRupee,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  History,
  Plus,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { LocalWork, PaymentStatus, LocalWorkPaymentRecord } from '../../../types';
import { formatINR } from '../../../utils/formatters';
import {
  calculateAmountToGet,
  calculatePaymentStatus,
  getPaymentStatusBadgeStyle,
} from '../../../utils/localWorkUtils';

interface QuickPaymentModalProps {
  isOpen: boolean;
  work: LocalWork | null;
  onClose: () => void;
  onSavePayment: (
    workId: string,
    updatedTotal: number,
    updatedGot: number,
    newRecord?: LocalWorkPaymentRecord
  ) => void;
}

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({
  isOpen,
  work,
  onClose,
  onSavePayment,
}) => {
  if (!isOpen || !work) return null;

  const initialTotal = Math.max(0, Number(work.totalAmount ?? work.amount ?? 0));
  const initialGot = Math.max(0, Number(work.amountGot ?? 0));

  // Mode: 'add' (record new received amount) or 'adjust' (manually fix totals)
  const [activeMode, setActiveMode] = useState<'add' | 'adjust'>('add');

  // Fields for 'add' mode
  const [paymentToAdd, setPaymentToAdd] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<
    'UPI' | 'Cash' | 'Bank Transfer' | 'GPay' | 'PhonePe' | 'Card' | 'Other'
  >('UPI');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');

  // Fields for 'adjust' mode
  const [customTotal, setCustomTotal] = useState<number>(initialTotal);
  const [customGot, setCustomGot] = useState<number>(initialGot);

  // Sync state if work changes
  useEffect(() => {
    if (work) {
      const curTotal = Math.max(0, Number(work.totalAmount ?? work.amount ?? 0));
      const curGot = Math.max(0, Number(work.amountGot ?? 0));
      setCustomTotal(curTotal);
      setCustomGot(curGot);
      setPaymentToAdd('');
      setPaymentNote('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [work]);

  // Derived calculations for preview
  const currentRemaining = calculateAmountToGet(initialTotal, initialGot);

  const previewTotal = activeMode === 'add' ? initialTotal : Math.max(0, Number(customTotal) || 0);
  const additionalAmount = activeMode === 'add' ? Math.max(0, Number(paymentToAdd) || 0) : 0;
  const previewGot =
    activeMode === 'add'
      ? initialGot + additionalAmount
      : Math.max(0, Number(customGot) || 0);

  const previewToGet = calculateAmountToGet(previewTotal, previewGot);
  const previewStatus = calculatePaymentStatus(previewTotal, previewGot);
  const statusBadge = getPaymentStatusBadgeStyle(previewStatus);

  const handleQuickAdd = (amt: number) => {
    setPaymentToAdd(amt);
  };

  const handleQuickPayFull = () => {
    if (currentRemaining > 0) {
      setPaymentToAdd(currentRemaining);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode === 'add') {
      const addAmt = Number(paymentToAdd) || 0;
      if (addAmt <= 0) {
        // Nothing added, just close
        onClose();
        return;
      }
      const newGot = initialGot + addAmt;
      const newRecord: LocalWorkPaymentRecord = {
        id: `pay-${Date.now()}`,
        date: paymentDate || new Date().toISOString().split('T')[0],
        amount: addAmt,
        method: paymentMethod,
        note: paymentNote.trim() || undefined,
        recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onSavePayment(work.id, initialTotal, newGot, newRecord);
    } else {
      const safeTotal = Math.max(0, Number(customTotal) || 0);
      const safeGot = Math.max(0, Number(customGot) || 0);
      let newRecord: LocalWorkPaymentRecord | undefined;
      const diff = safeGot - initialGot;
      if (diff > 0) {
        newRecord = {
          id: `pay-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: diff,
          method: 'Other',
          note: 'Payment amount adjusted in ledger',
        };
      }
      onSavePayment(work.id, safeTotal, safeGot, newRecord);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                {work.workId || work.id}
              </span>
              <h2 className="text-base font-black text-zinc-950">Payment Tracking</h2>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-sm">
              {work.title} · <span className="font-semibold text-zinc-700">{work.clientName}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Top 3 Summary Cards: Total / Got / To Get */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Total Amount */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Total Amount
              </div>
              <div className="text-lg font-black text-zinc-950 mt-0.5">
                {formatINR(previewTotal)}
              </div>
              <div className="text-[10px] text-zinc-400">Total charged</div>
            </div>

            {/* Amount Got */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
              <div className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                Amount Got
              </div>
              <div className="text-lg font-black text-emerald-950 mt-0.5">
                {formatINR(previewGot)}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">Already received</div>
            </div>

            {/* Amount To Get */}
            <div
              className={`p-3 rounded-xl border text-center ${
                previewToGet > 0
                  ? 'bg-[#FFF1EE] border-[#FFB2A1] ring-1 ring-[#FF5738]/20'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  previewToGet > 0 ? 'text-[#FF5738]' : 'text-zinc-500'
                }`}
              >
                Amount To Get
              </div>
              <div
                className={`text-lg font-black mt-0.5 ${
                  previewToGet > 0 ? 'text-[#FF5738]' : 'text-zinc-950'
                }`}
              >
                {formatINR(previewToGet)}
              </div>
              <div className="text-[10px] text-zinc-500">Auto-calculated</div>
            </div>
          </div>

          {/* Current Status Indicator Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="text-xs">
              <span className="text-zinc-500 font-medium">Payment Status: </span>
              <span
                className={`inline-block ml-1.5 px-2.5 py-0.5 rounded-md text-xs font-black border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
              >
                {statusBadge.label}
              </span>
            </div>
            {currentRemaining > 0 && activeMode === 'add' && (
              <button
                type="button"
                onClick={handleQuickPayFull}
                className="text-xs font-bold text-[#FF5738] hover:text-[#ff4220] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mark Full Remaining ({formatINR(currentRemaining)})</span>
              </button>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveMode('add')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                activeMode === 'add'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Record Payment Received
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('adjust')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                activeMode === 'adjust'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Adjust Totals Directly
            </button>
          </div>

          {/* Mode 1: Record New Payment Form */}
          {activeMode === 'add' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Payment Amount Received (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 1000"
                    value={paymentToAdd}
                    onChange={(e) =>
                      setPaymentToAdd(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))
                    }
                    className="w-full pl-8 pr-3 py-2 bg-white border border-zinc-300 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FF5738] focus:ring-1 focus:ring-[#FF5738]"
                    autoFocus
                  />
                </div>

                {/* Quick Add Pills */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Quick Add:</span>
                  {[500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAdd(amt)}
                      className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold border border-zinc-200 transition"
                    >
                      +₹{amt}
                    </button>
                  ))}
                  {currentRemaining > 0 && (
                    <button
                      type="button"
                      onClick={handleQuickPayFull}
                      className="px-2 py-0.5 rounded-md bg-[#FF5738]/10 hover:bg-[#FF5738]/20 text-[#FF5738] text-[11px] font-bold border border-[#FF5738]/30 transition"
                    >
                      Full ₹{currentRemaining}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Method */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5738]"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5738]"
                  />
                </div>
              </div>

              {/* Note / Reference */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                  Note / Transaction Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via UPI / Advance 50% / Cash at studio"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-800 outline-none focus:border-[#FF5738]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!paymentToAdd || Number(paymentToAdd) <= 0}
                  className="px-5 py-2 bg-[#FF5738] hover:bg-[#ff4220] disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Payment</span>
                </button>
              </div>
            </form>
          ) : (
            /* Mode 2: Direct Adjust Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Total Amount */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Total Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-zinc-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={customTotal}
                      onChange={(e) => setCustomTotal(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#FF5738]"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400">Total charged</span>
                </div>

                {/* Amount Got */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Amount Got (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-zinc-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={customGot}
                      onChange={(e) => setCustomGot(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#FF5738]"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400">Received already</span>
                </div>
              </div>

              {/* Amount To Get: Calculated & Read-only */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-600">
                    Amount To Get (Calculated):
                  </span>
                  <span
                    className={`font-mono text-sm font-black ${
                      previewToGet > 0 ? 'text-[#FF5738]' : 'text-zinc-900'
                    }`}
                  >
                    {formatINR(previewToGet)}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Automatically calculated as <code>Total Amount - Amount Got</code>. Manual entry is
                  disabled.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF5738] hover:bg-[#ff4220] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Totals</span>
                </button>
              </div>
            </form>
          )}

          {/* Payment History / Records Section */}
          <div className="pt-4 border-t border-zinc-100 space-y-2.5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-bold text-zinc-900">
                Payment History ({work.paymentRecords?.length || 0})
              </h3>
            </div>

            {work.paymentRecords && work.paymentRecords.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {work.paymentRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 font-mono">
                          {formatINR(rec.amount)}
                        </span>
                        {rec.method && (
                          <span className="px-1.5 py-0.2 rounded bg-zinc-200 text-[10px] font-bold text-zinc-700">
                            {rec.method}
                          </span>
                        )}
                      </div>
                      {rec.note && (
                        <div className="text-[11px] text-zinc-500 mt-0.5">{rec.note}</div>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">{rec.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic bg-zinc-50/60 p-3 rounded-lg border border-dashed border-zinc-200 text-center">
                No individual payment transactions recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
