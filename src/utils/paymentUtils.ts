import { PaymentStatus, ProjectPaymentRecord, LocalWorkPaymentRecord, PaymentRecord, DesignerPaymentRecord } from '../types';

/**
 * Centrally calculates the standard Payment Status based on Total Amount and Amount Got.
 * 
 * Rules:
 * - Amount Got = 0 (and Total > 0) => 'Not Paid'
 * - Amount Got > 0 and Amount Got < Total Amount => 'Partially Paid'
 * - Amount Got = Total Amount => 'Paid'
 * - Amount Got > Total Amount => 'Overpaid'
 * - Total Amount = 0 and Amount Got = 0 => 'Paid'
 */
export function calculatePaymentStatus(
  totalAmount: number,
  amountGot: number
): PaymentStatus {
  const total = Math.max(0, Math.round((Number(totalAmount) || 0) * 100) / 100);
  const got = Math.max(0, Math.round((Number(amountGot) || 0) * 100) / 100);

  if (total === 0 && got === 0) {
    return 'Paid';
  }
  if (got === 0) {
    return 'Not Paid';
  }
  if (got < total) {
    return 'Partially Paid';
  }
  if (got === total) {
    return 'Paid';
  }
  return 'Overpaid';
}

/**
 * Centrally calculates Amount To Get (Outstanding Balance):
 * Total Amount - Amount Got (floored at 0, no negative balances).
 */
export function calculateAmountToGet(
  totalAmount: number,
  amountGot: number
): number {
  const total = Math.max(0, Math.round((Number(totalAmount) || 0) * 100) / 100);
  const got = Math.max(0, Math.round((Number(amountGot) || 0) * 100) / 100);
  return Math.max(0, Math.round((total - got) * 100) / 100);
}

/**
 * Sums only received/successful payments from a list of records.
 * Payments marked 'Failed' or 'Cancelled' or 'Pending' are excluded from Amount Got.
 */
export function sumReceivedPayments(
  payments?: Array<{ amount?: number; status?: string }>
): number {
  if (!payments || payments.length === 0) return 0;
  const sum = payments.reduce((acc, p) => {
    // If status is not specified, default is 'Received'
    if (!p.status || p.status === 'Received' || p.status === 'Success' || p.status === 'Completed') {
      return acc + (Number(p.amount) || 0);
    }
    return acc;
  }, 0);
  return Math.max(0, Math.round(sum * 100) / 100);
}

/**
 * Universal styling for payment status badges
 */
export function getPaymentStatusBadgeStyle(status: PaymentStatus | string): {
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  label: string;
} {
  const normalized = (status || '').toLowerCase().trim();

  if (normalized === 'paid' || normalized === 'settled' || normalized === 'cleared') {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dotColor: 'bg-emerald-500',
      label: 'Paid',
    };
  }

  if (normalized === 'partially paid' || normalized === 'partial' || normalized === 'advance paid') {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dotColor: 'bg-amber-500',
      label: 'Partially Paid',
    };
  }

  if (normalized === 'overpaid' || normalized === 'excess') {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      dotColor: 'bg-purple-500',
      label: 'Overpaid',
    };
  }

  if (
    normalized === 'not paid' ||
    normalized === 'pending' ||
    normalized === 'pending payment' ||
    normalized === 'unpaid' ||
    normalized === 'due'
  ) {
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dotColor: 'bg-rose-500',
      label: 'Not Paid',
    };
  }

  return {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400',
    label: status || 'Not Paid',
  };
}
