import React, { useState, useMemo } from 'react';
import {
  X,
  DollarSign,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  History,
  ArrowRight,
  Info,
  ShieldCheck,
  Receipt,
  Percent,
} from 'lucide-react';
import { Project, DesignerPaymentRecord, DesignerPaymentStatus } from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { formatSystemTimestamp } from '../../../utils/projectUtils';

interface EditDesignerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: string;
  workType: 'Project' | 'Local Work' | 'Custom';
  workTitle: string;
  clientName?: string;
  totalWorkAmount?: number;
  designerId: string;
  designerName: string;
  initialFee?: number;
  initialPaid?: number;
  initialPaymentStructure?: 'Fixed Amount' | 'Percentage' | 'Per Deliverable' | 'Custom';
  initialPercentage?: number;
  payments?: DesignerPaymentRecord[];
  onSave: (payload: {
    workId: string;
    workType: 'Project' | 'Local Work' | 'Custom';
    designerFee: number;
    designerAmountPaid: number;
    designerAmountPending: number;
    designerPaymentStatus: DesignerPaymentStatus;
    designerPaymentStructure: 'Fixed Amount' | 'Percentage' | 'Per Deliverable' | 'Custom';
    designerPercentage?: number;
    payments: DesignerPaymentRecord[];
    historyNote?: string;
  }) => void;
}

export const EditDesignerPaymentModal: React.FC<EditDesignerPaymentModalProps> = ({
  isOpen,
  onClose,
  workId,
  workType,
  workTitle,
  clientName,
  totalWorkAmount = 0,
  designerId,
  designerName,
  initialFee,
  initialPaid = 0,
  initialPaymentStructure = 'Fixed Amount',
  initialPercentage = 30,
  payments = [],
  onSave,
}) => {
  // Determine starting fee
  const startingFee = initialFee !== undefined ? initialFee : Math.round(totalWorkAmount * (initialPercentage / 100));

  const [paymentStructure, setPaymentStructure] = useState<'Fixed Amount' | 'Percentage' | 'Per Deliverable' | 'Custom'>(
    initialPaymentStructure
  );
  const [designerPercentage, setDesignerPercentage] = useState<number>(initialPercentage || 30);
  const [designerFee, setDesignerFee] = useState<number>(startingFee);
  const [paymentList, setPaymentList] = useState<DesignerPaymentRecord[]>(payments || []);

  // Quick New Payment fields
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newPayAmount, setNewPayAmount] = useState<string>('');
  const [newPayDate, setNewPayDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newPayMethod, setNewPayMethod] = useState<string>('UPI');
  const [newPayRef, setNewPayRef] = useState<string>('');
  const [newPayNotes, setNewPayNotes] = useState<string>('');

  // Editing existing payment in history
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPayAmount, setEditPayAmount] = useState<string>('');
  const [editPayDate, setEditPayDate] = useState<string>('');
  const [editPayMethod, setEditPayMethod] = useState<string>('');
  const [editPayRef, setEditPayRef] = useState<string>('');
  const [editPayNotes, setEditPayNotes] = useState<string>('');

  // General Notes for ledger
  const [generalNote, setGeneralNote] = useState<string>('');

  if (!isOpen) return null;

  // Auto-calculated Paid sum from payment transactions ledger or manual fallback
  const totalPaid = useMemo(() => {
    if (paymentList.length > 0) {
      return paymentList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }
    return Number(initialPaid) || 0;
  }, [paymentList, initialPaid]);

  const totalPending = Math.max(0, designerFee - totalPaid);

  // Auto-calculated Status
  const autoStatus: DesignerPaymentStatus = useMemo(() => {
    if (designerFee <= 0 && totalPaid <= 0) return 'Paid';
    if (totalPaid >= designerFee && designerFee > 0) return 'Paid';
    if (totalPaid > 0 && totalPaid < designerFee) return 'Partially Paid';
    return 'Not Paid';
  }, [designerFee, totalPaid]);

  // Handle Percentage quick calculation
  const handlePercentageChange = (pct: number) => {
    setDesignerPercentage(pct);
    if (totalWorkAmount > 0) {
      const calculated = Math.round(totalWorkAmount * (pct / 100));
      setDesignerFee(calculated);
    }
  };

  // Add new payment to ledger
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newPayAmount);
    if (isNaN(amt) || amt <= 0) return;

    const newRecord: DesignerPaymentRecord = {
      id: `despay-${Date.now()}`,
      designerId,
      designerName,
      workType,
      workId,
      workTitle,
      date: newPayDate || new Date().toISOString().slice(0, 10),
      amount: amt,
      method: newPayMethod,
      referenceNumber: newPayRef.trim() || undefined,
      notes: newPayNotes.trim() || undefined,
      recordedAt: formatSystemTimestamp(),
    };

    setPaymentList([...paymentList, newRecord]);
    setNewPayAmount('');
    setNewPayRef('');
    setNewPayNotes('');
    setShowAddPaymentForm(false);
  };

  // Start editing a payment
  const handleStartEditPayment = (p: DesignerPaymentRecord) => {
    setEditingPaymentId(p.id);
    setEditPayAmount(String(p.amount));
    setEditPayDate(p.date);
    setEditPayMethod(p.method || 'UPI');
    setEditPayRef(p.referenceNumber || p.reference || '');
    setEditPayNotes(p.notes || '');
  };

  // Save edited payment
  const handleSaveEditPayment = (paymentId: string) => {
    const amt = parseFloat(editPayAmount);
    if (isNaN(amt) || amt <= 0) return;

    const oldRecord = paymentList.find((p) => p.id === paymentId);
    const oldAmt = oldRecord ? oldRecord.amount : 0;

    const updated = paymentList.map((p) => {
      if (p.id === paymentId) {
        return {
          ...p,
          amount: amt,
          date: editPayDate,
          method: editPayMethod,
          referenceNumber: editPayRef.trim() || undefined,
          notes: editPayNotes.trim() || undefined,
          recordedAt: formatSystemTimestamp(),
        };
      }
      return p;
    });

    setPaymentList(updated);
    setEditingPaymentId(null);
  };

  // Void / Delete a payment
  const handleVoidPayment = (paymentId: string) => {
    if (confirm('Are you sure you want to void/remove this payment record from the designer ledger?')) {
      setPaymentList(paymentList.filter((p) => p.id !== paymentId));
    }
  };

  // Final Submit
  const handleSaveAll = () => {
    onSave({
      workId,
      workType,
      designerFee,
      designerAmountPaid: totalPaid,
      designerAmountPending: totalPending,
      designerPaymentStatus: autoStatus,
      designerPaymentStructure: paymentStructure,
      designerPercentage: paymentStructure === 'Percentage' ? designerPercentage : undefined,
      payments: paymentList,
      historyNote: generalNote.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      id="modal-edit-designer-payment"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <DollarSign className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Edit Designer Payment
                </h2>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-700">
                  {workType}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                {designerName} · {workTitle} {clientName ? `(${clientName})` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. Live Financial Overview Snapshot */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Total Designer Fee
              </span>
              <div className="text-lg font-black font-mono text-zinc-900 mt-1">
                {formatINR(designerFee)}
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                {paymentStructure} arrangement
              </span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Total Paid to Designer
              </span>
              <div className="text-lg font-black font-mono text-emerald-700 mt-1">
                {formatINR(totalPaid)}
              </div>
              <span className="text-[10px] text-emerald-600 block mt-0.5">
                {paymentList.length} transaction(s)
              </span>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                Amount Pending
              </span>
              <div className="text-lg font-black font-mono text-rose-700 mt-1">
                {formatINR(totalPending)}
              </div>
              <span className="text-[10px] text-rose-600 block mt-0.5">
                Status: <strong className="uppercase">{autoStatus}</strong>
              </span>
            </div>
          </div>

          {/* 2. Payment Structure Configuration */}
          <div className="rounded-xl border border-zinc-200 p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-orange-500" />
                <span>Payment Structure &amp; Fee Setup</span>
              </label>
              {totalWorkAmount > 0 && (
                <span className="text-[11px] text-zinc-500">
                  Client Total: <strong className="text-zinc-900">{formatINR(totalWorkAmount)}</strong>
                </span>
              )}
            </div>

            {/* Type Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Fixed Amount', 'Percentage', 'Per Deliverable', 'Custom'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPaymentStructure(type)}
                  className={`rounded-lg py-2 px-2.5 text-center text-xs font-bold border transition-all ${
                    paymentStructure === type
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Conditional Sub-settings */}
            {paymentStructure === 'Percentage' && (
              <div className="rounded-lg bg-orange-50/60 border border-orange-200/80 p-3 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-orange-900">Project Share %:</span>
                <div className="flex items-center gap-1.5">
                  {[20, 25, 30, 35, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentageChange(pct)}
                      className={`rounded-md px-2 py-0.5 text-xs font-bold transition-all ${
                        designerPercentage === pct
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-orange-800 border border-orange-200 hover:bg-orange-100'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={designerPercentage}
                    onChange={(e) => handlePercentageChange(parseFloat(e.target.value) || 0)}
                    className="w-16 rounded-md border border-orange-300 bg-white px-2 py-1 text-xs font-bold text-zinc-900 outline-none"
                  />
                  <span className="text-zinc-600 font-bold">%</span>
                </div>
              </div>
            )}

            {/* Editable Fee Input */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                Total Designer Fee (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-zinc-400">₹</span>
                <input
                  type="number"
                  id="input-edit-designer-fee"
                  value={designerFee}
                  onChange={(e) => setDesignerFee(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-300 bg-white pl-8 pr-4 py-2 text-sm font-bold text-zinc-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all font-mono"
                  placeholder="0"
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                Amount pending will automatically calculate as Fee - Total Paid.
              </p>
            </div>
          </div>

          {/* 3. Payment History & Transaction Ledger */}
          <div className="rounded-xl border border-zinc-200 p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Payment Transactions Ledger</span>
                </h3>
                <p className="text-[10px] text-zinc-400">
                  Every disbursement is tracked. You can edit or void specific payments.
                </p>
              </div>

              {!showAddPaymentForm && (
                <button
                  type="button"
                  id="btn-add-designer-disbursement"
                  onClick={() => setShowAddPaymentForm(true)}
                  className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-all flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Record Payment</span>
                </button>
              )}
            </div>

            {/* New Payment Inline Form */}
            {showAddPaymentForm && (
              <form onSubmit={handleAddPayment} className="rounded-xl border border-orange-200 bg-orange-50/40 p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                  <span className="text-xs font-bold text-orange-900 flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Record Designer Disbursement
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddPaymentForm(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newPayAmount}
                      onChange={(e) => setNewPayAmount(e.target.value)}
                      placeholder={totalPending > 0 ? String(totalPending) : '0'}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-bold font-mono outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 mb-1">Payment Date *</label>
                    <input
                      type="date"
                      required
                      value={newPayDate}
                      onChange={(e) => setNewPayDate(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 mb-1">Payment Method</label>
                    <select
                      value={newPayMethod}
                      onChange={(e) => setNewPayMethod(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-orange-500"
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 mb-1">Ref / Transaction ID (Optional)</label>
                    <input
                      type="text"
                      value={newPayRef}
                      onChange={(e) => setNewPayRef(e.target.value)}
                      placeholder="e.g. UPI/12345678"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 mb-1">Notes (Optional)</label>
                    <input
                      type="text"
                      value={newPayNotes}
                      onChange={(e) => setNewPayNotes(e.target.value)}
                      placeholder="e.g. Advance paid for first draft"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddPaymentForm(false)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white px-4 py-1 text-xs font-bold shadow-2xs"
                  >
                    Add Disbursement
                  </button>
                </div>
              </form>
            )}

            {/* Payment List Table */}
            {paymentList.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">
                No payments recorded yet for this designer assignment.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3">Method</th>
                      <th className="py-2 px-3">Ref &amp; Note</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                    {paymentList.map((p) => {
                      const isEditing = editingPaymentId === p.id;
                      if (isEditing) {
                        return (
                          <tr key={p.id} className="bg-amber-50/50">
                            <td className="py-2 px-3">
                              <input
                                type="date"
                                value={editPayDate}
                                onChange={(e) => setEditPayDate(e.target.value)}
                                className="w-full rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                value={editPayAmount}
                                onChange={(e) => setEditPayAmount(e.target.value)}
                                className="w-24 rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs font-bold text-right font-mono"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={editPayMethod}
                                onChange={(e) => setEditPayMethod(e.target.value)}
                                className="rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs"
                              >
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank</option>
                                <option value="Cash">Cash</option>
                                <option value="Other">Other</option>
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Ref & Note"
                                value={editPayNotes || editPayRef}
                                onChange={(e) => {
                                  setEditPayNotes(e.target.value);
                                  setEditPayRef(e.target.value);
                                }}
                                className="w-full rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditPayment(p.id)}
                                  className="rounded bg-emerald-600 text-white px-2 py-0.5 text-[11px] font-bold"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPaymentId(null)}
                                  className="rounded bg-zinc-200 text-zinc-700 px-2 py-0.5 text-[11px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-2 px-3 text-zinc-600 font-mono text-[11px]">
                            {p.date}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                            {formatINR(p.amount)}
                          </td>
                          <td className="py-2 px-3 text-zinc-600">
                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                              {p.method || 'UPI'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-zinc-600">
                            {p.referenceNumber && (
                              <span className="text-[10px] font-mono text-zinc-400 block">
                                Ref: {p.referenceNumber}
                              </span>
                            )}
                            {p.notes && <span className="text-zinc-600 block line-clamp-1">{p.notes}</span>}
                            {!p.referenceNumber && !p.notes && <span className="text-zinc-300 italic">No notes</span>}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="Edit this transaction"
                                onClick={() => handleStartEditPayment(p)}
                                className="rounded p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                title="Void this transaction"
                                onClick={() => handleVoidPayment(p.id)}
                                className="rounded p-1 text-rose-500 hover:bg-rose-100 hover:text-rose-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
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

          {/* 4. Optional Reason / General Note */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
              Ledger Note / Change Reason (Optional)
            </label>
            <input
              type="text"
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              placeholder="e.g. Agreed fee revised after adding 2 extra deliverable revisions"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-6 py-3.5 bg-zinc-50 flex items-center justify-between text-xs">
          <span className="text-zinc-500 text-[11px]">
            Changes will automatically update designer payables and project history.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-edit-designer-payment"
              onClick={handleSaveAll}
              className="rounded-xl bg-zinc-900 hover:bg-black text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Save Payment Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
