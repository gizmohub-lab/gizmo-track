import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  User,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Project, CustomDesigner, DesignerPaymentRecord } from '../../../types';
import { formatINR } from '../../../utils/formatters';
import { formatSystemTimestamp } from '../../../utils/projectUtils';

interface PayDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDesignerId?: string;
  initialWorkId?: string;
  projects: Project[];
  localWorks?: any[];
  designers: CustomDesigner[];
  onSavePayment: (payment: {
    designerId: string;
    designerName: string;
    workType: 'Project' | 'Local Work' | 'Custom';
    workId: string;
    workTitle: string;
    amount: number;
    date: string;
    method: string;
    referenceNumber?: string;
    notes?: string;
  }) => void;
}

const PAYMENT_METHODS = ['UPI', 'Bank Transfer', 'GPay', 'PhonePe', 'Cash', 'Cheque', 'Other'];

export const PayDesignerModal: React.FC<PayDesignerModalProps> = ({
  isOpen,
  onClose,
  initialDesignerId,
  initialWorkId,
  projects,
  localWorks = [],
  designers,
  onSavePayment,
}) => {
  const [designerId, setDesignerId] = useState<string>('');
  const [workSelection, setWorkSelection] = useState<string>(''); // 'proj-xxx' or 'lw-xxx' or 'general'
  const [amount, setAmount] = useState<number | string>('');
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<string>('UPI');
  const [customMethod, setCustomMethod] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Sync initial selections on open
  useEffect(() => {
    if (isOpen) {
      if (initialDesignerId) {
        setDesignerId(initialDesignerId);
      } else if (designers.length > 0) {
        setDesignerId(designers[0].id);
      }

      if (initialWorkId) {
        setWorkSelection(initialWorkId);
      } else {
        setWorkSelection('');
      }

      setPaymentDate(new Date().toISOString().split('T')[0]);
      setMethod('UPI');
      setCustomMethod('');
      setReferenceNumber('');
      setNotes('');
    }
  }, [isOpen, initialDesignerId, initialWorkId, designers]);

  if (!isOpen) return null;

  const currentDesigner = designers.find((d) => d.id === designerId) || {
    id: designerId,
    name: 'Designer',
    type: 'External Designer',
    roleSpecialization: 'Design & Artwork',
  };

  // Find assigned projects and local works for this designer
  const designerProjects = projects.filter(
    (p) =>
      p.assignedDesignerId === designerId ||
      p.assignedDesignerName?.toLowerCase() === currentDesigner.name?.toLowerCase()
  );

  const designerLocalWorks = localWorks.filter(
    (lw) =>
      lw.designerId === designerId ||
      lw.designer?.toLowerCase() === currentDesigner.name?.toLowerCase()
  );

  // Selected work info
  let selectedProject: Project | undefined;
  let selectedLocalWork: any | undefined;
  let workTitle = 'General Payout / Milestone Advance';
  let workType: 'Project' | 'Local Work' | 'Custom' = 'Custom';
  let totalDue = 0;
  let previouslyPaid = 0;
  let remainingPending = 0;

  if (workSelection && workSelection !== 'general') {
    selectedProject = designerProjects.find((p) => p.id === workSelection);
    if (selectedProject) {
      workType = 'Project';
      workTitle = selectedProject.title;
      totalDue = selectedProject.designerFee !== undefined
        ? Number(selectedProject.designerFee)
        : Math.round((selectedProject.totalAmount || 0) * 0.3);
      previouslyPaid = Number(selectedProject.designerAmountPaid || 0);
      remainingPending = Math.max(0, totalDue - previouslyPaid);
    } else {
      selectedLocalWork = designerLocalWorks.find((lw) => lw.id === workSelection);
      if (selectedLocalWork) {
        workType = 'Local Work';
        workTitle = selectedLocalWork.title || selectedLocalWork.workTitle || 'Local Work';
        const lwTotal = Number(selectedLocalWork.amount || selectedLocalWork.total || 0);
        totalDue = Number(selectedLocalWork.designerFee || Math.round(lwTotal * 0.35));
        previouslyPaid = Number(selectedLocalWork.designerPaid || 0);
        remainingPending = Math.max(0, totalDue - previouslyPaid);
      }
    }
  }

  // Handle setting full pending amount
  const handleSetFullPending = () => {
    if (remainingPending > 0) {
      setAmount(remainingPending);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    const chosenMethod = method === 'Other' ? (customMethod.trim() || 'Other') : method;

    onSavePayment({
      designerId: currentDesigner.id || designerId,
      designerName: currentDesigner.name,
      workType,
      workId: workSelection || 'general',
      workTitle,
      amount: numAmount,
      date: paymentDate,
      method: chosenMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      id="pay-designer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="pay-designer-modal-container"
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Pay Designer</h2>
              <p className="text-xs text-zinc-400">Record milestone disbursement or project payout</p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-pay-designer-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Designer Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Designer <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="select-designer-for-payment"
                value={designerId}
                onChange={(e) => {
                  setDesignerId(e.target.value);
                  setWorkSelection('');
                  setAmount('');
                }}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 shadow-xs focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                required
              >
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.type || 'Designer'}{d.roleSpecialization ? ` · ${d.roleSpecialization}` : ''})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Work / Project Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Select Work / Project Reference
            </label>
            <select
              id="select-work-for-payment"
              value={workSelection}
              onChange={(e) => {
                const val = e.target.value;
                setWorkSelection(val);
                if (val && val !== 'general') {
                  const p = designerProjects.find((proj) => proj.id === val);
                  if (p) {
                    const fee = p.designerFee !== undefined ? Number(p.designerFee) : Math.round((p.totalAmount || 0) * 0.3);
                    const paid = Number(p.designerAmountPaid || 0);
                    const pend = Math.max(0, fee - paid);
                    setAmount(pend > 0 ? pend : '');
                  }
                }
              }}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">-- General Payout / Lump Sum Payment --</option>
              {designerProjects.length > 0 && (
                <optgroup label="Projects">
                  {designerProjects.map((p) => {
                    const fee = p.designerFee !== undefined ? Number(p.designerFee) : Math.round((p.totalAmount || 0) * 0.3);
                    const paid = Number(p.designerAmountPaid || 0);
                    const pend = Math.max(0, fee - paid);
                    return (
                      <option key={p.id} value={p.id}>
                        [Project] {p.title} (Pending: ₹{pend.toLocaleString('en-IN')})
                      </option>
                    );
                  })}
                </optgroup>
              )}
              {designerLocalWorks.length > 0 && (
                <optgroup label="Local Works">
                  {designerLocalWorks.map((lw) => {
                    const lwTot = Number(lw.amount || lw.total || 0);
                    const fee = Number(lw.designerFee || Math.round(lwTot * 0.35));
                    const paid = Number(lw.designerPaid || 0);
                    const pend = Math.max(0, fee - paid);
                    return (
                      <option key={lw.id} value={lw.id}>
                        [Local Work] {lw.title || lw.workTitle || 'Work'} (Pending: ₹{pend.toLocaleString('en-IN')})
                      </option>
                    );
                  })}
                </optgroup>
              )}
            </select>
          </div>

          {/* Work Summary Strip if a work is selected */}
          {workSelection && workSelection !== 'general' && (
            <div className="rounded-xl bg-orange-50/60 border border-orange-200/80 p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-zinc-900 block truncate max-w-[220px]">
                  {workTitle}
                </span>
                <span className="text-zinc-500">
                  Total Fee: {formatINR(totalDue)} · Paid: {formatINR(previouslyPaid)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block">Pending Fee</span>
                <span className="font-bold text-orange-700 text-sm">
                  {formatINR(remainingPending)}
                </span>
              </div>
            </div>
          )}

          {/* Amount to Pay */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Payment Amount (₹) <span className="text-rose-500">*</span>
              </label>
              {remainingPending > 0 && (
                <button
                  type="button"
                  id="btn-pay-full-pending-amount"
                  onClick={handleSetFullPending}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Pay Full Pending ({formatINR(remainingPending)})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                ₹
              </span>
              <input
                type="number"
                id="input-designer-payment-amount"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-xl border border-zinc-300 bg-white pl-8 pr-3.5 py-2.5 text-base font-bold text-zinc-900 shadow-xs focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>
          </div>

          {/* Date & Method Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Payment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="input-designer-payment-date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                id="select-designer-payment-method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom method if "Other" */}
          {method === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Custom Method Name
              </label>
              <input
                type="text"
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                placeholder="e.g. Crypto, Wire, Cash On Delivery"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 shadow-xs focus:border-orange-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Reference / UTR Number */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Reference / UTR / Transaction ID (Optional)
            </label>
            <input
              type="text"
              id="input-designer-payment-reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UPI/1234567890/HDFC or NEFT..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 shadow-xs focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Internal Note / Remarks (Optional)
            </label>
            <input
              type="text"
              id="input-designer-payment-note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Settlement for first draft milestone"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 shadow-xs focus:border-orange-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Strict Separation Notice */}
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-600 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong className="font-semibold text-zinc-900">Designer Payment Separated:</strong> This records money Gizmo pays out to the designer. It does not affect client receivables or invoice balances.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              id="btn-cancel-pay-designer"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-pay-designer"
              className="rounded-xl bg-zinc-900 hover:bg-black px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4 text-orange-400" />
              <span>Record Payment ({amount ? formatINR(Number(amount)) : '₹0'})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
