import { LocalWork, LocalWorkStatus, LocalWorkPriority, PaymentStatus, DeadlineItem } from '../types';
import { parseDeadlineDate } from './deadlineUtils';
import {
  calculatePaymentStatus,
  calculateAmountToGet,
  getPaymentStatusBadgeStyle,
  sumReceivedPayments,
} from './paymentUtils';

export interface WorkStatusConfig {
  id: LocalWorkStatus;
  label: string;
  symbol: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  description: string;
}

export const WORK_STATUSES: WorkStatusConfig[] = [
  {
    id: 'New',
    label: 'New',
    symbol: '○',
    badgeBg: 'bg-zinc-100',
    textColor: 'text-zinc-800',
    borderColor: 'border-zinc-300',
    description: 'Fresh order received, unassigned',
  },
  {
    id: 'Assigned',
    label: 'Assigned',
    symbol: '◔',
    badgeBg: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    description: 'Design allocated to team member',
  },
  {
    id: 'In Progress',
    label: 'In Progress',
    symbol: '◑',
    badgeBg: 'bg-[#FFF1EE]',
    textColor: 'text-[#FF5738]',
    borderColor: 'border-[#FFB2A1]',
    description: 'Active design & layout underway',
  },
  {
    id: 'Waiting for Client',
    label: 'Waiting for Client',
    symbol: '◒',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    description: 'Awaiting client feedback or copy',
  },
  {
    id: 'Revision',
    label: 'Revision',
    symbol: '◓',
    badgeBg: 'bg-violet-50',
    textColor: 'text-violet-800',
    borderColor: 'border-violet-200',
    description: 'Client modification requested',
  },
  {
    id: 'Ready',
    label: 'Ready',
    symbol: '●',
    badgeBg: 'bg-teal-50',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-200',
    description: 'Design approved, ready for print/export',
  },
  {
    id: 'Completed',
    label: 'Completed',
    symbol: '✓',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    description: 'Delivered and closed',
  },
  {
    id: 'Cancelled',
    label: 'Cancelled',
    symbol: '×',
    badgeBg: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    description: 'Cancelled order',
  },
];

export function getStatusConfig(status?: string): WorkStatusConfig {
  const found = WORK_STATUSES.find((s) => s.id === status);
  if (found) return found;
  if (status === 'Delivered') return WORK_STATUSES.find((s) => s.id === 'Completed')!;
  if (status === 'Invoiced') return WORK_STATUSES.find((s) => s.id === 'Completed')!;
  return WORK_STATUSES[0]; // New default
}

export function generateNextWorkId(existingWorks: LocalWork[]): string {
  let highestNum = 0;
  for (const work of existingWorks) {
    const code = work.workId || work.id;
    const match = code.match(/LW-(\d+)/i) || code.match(/lw-(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highestNum) {
        highestNum = num;
      }
    }
  }
  const next = highestNum + 1;
  return `LW-${String(next).padStart(4, '0')}`;
}

export interface DeadlineCalculationResult {
  relativeText: string;
  urgency: 'OVERDUE' | 'DUE_NOW' | 'URGENT' | 'APPROACHING' | 'NORMAL';
  badgeClass: string;
  exactFormatted: string;
  diffMinutes: number;
}

export function calculateWorkDeadline(
  deadlineDate?: string,
  deadlineTime: string = '18:00',
  now: Date = new Date()
): DeadlineCalculationResult {
  if (!deadlineDate) {
    return {
      relativeText: 'No deadline set',
      urgency: 'NORMAL',
      badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      exactFormatted: 'Open schedule',
      diffMinutes: 999999,
    };
  }

  const target = parseDeadlineDate(deadlineDate, deadlineTime);
  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Exact presentation: e.g. "09 Sep 2026 · 04:30 PM"
  const [year, month, day] = deadlineDate.split('-').map(Number);
  const [h, m] = deadlineTime.split(':').map(Number);
  const monthShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ][(month || 1) - 1];
  const period = (h || 0) >= 12 ? 'PM' : 'AM';
  const displayH = (h || 0) % 12 === 0 ? 12 : (h || 0) % 12;
  const exactFormatted = `${String(day).padStart(2, '0')} ${monthShort} ${year} · ${String(displayH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${period}`;

  // Calendar comparison
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDateOnly = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const calendarDayDiff = Math.round((targetDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffMinutes < -1) {
    // Overdue
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);
    let relativeText = 'Overdue';
    if (absDays >= 1) {
      relativeText = `Overdue by ${absDays}d`;
    } else if (absHours >= 1) {
      relativeText = `Overdue by ${absHours}h`;
    } else {
      relativeText = `Overdue by ${Math.abs(diffMinutes)}m`;
    }
    return {
      relativeText,
      urgency: 'OVERDUE',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      exactFormatted,
      diffMinutes,
    };
  }

  if (diffMinutes <= 10) {
    return {
      relativeText: 'Due now',
      urgency: 'DUE_NOW',
      badgeClass: 'bg-[#FFF1EE] text-[#FF5738] border-[#FFB2A1] font-bold animate-pulse',
      exactFormatted,
      diffMinutes,
    };
  }

  if (diffMinutes < 60) {
    return {
      relativeText: `Due in ${diffMinutes}m`,
      urgency: 'URGENT',
      badgeClass: 'bg-[#FFF1EE] text-[#FF5738] border-[#FFB2A1] font-bold',
      exactFormatted,
      diffMinutes,
    };
  }

  if (diffHours < 4) {
    const minsRem = diffMinutes % 60;
    return {
      relativeText: `Due in ${diffHours}h ${minsRem > 0 ? `${minsRem}m` : ''}`,
      urgency: 'URGENT',
      badgeClass: 'bg-[#FFF1EE] text-[#FF5738] border-[#FFB2A1] font-semibold',
      exactFormatted,
      diffMinutes,
    };
  }

  if (calendarDayDiff === 0) {
    return {
      relativeText: `Due today (${diffHours}h left)`,
      urgency: 'APPROACHING',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
      exactFormatted,
      diffMinutes,
    };
  }

  if (calendarDayDiff === 1) {
    return {
      relativeText: 'Due tomorrow',
      urgency: 'NORMAL',
      badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      exactFormatted,
      diffMinutes,
    };
  }

  return {
    relativeText: `Due in ${calendarDayDiff} days`,
    urgency: 'NORMAL',
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    exactFormatted,
    diffMinutes,
  };
}

export function buildWhatsAppUrl(phoneOrWhatsApp?: string, message?: string): string | null {
  if (!phoneOrWhatsApp) return null;
  const clean = phoneOrWhatsApp.replace(/[^\d]/g, '');
  if (!clean || clean.length < 7) return null;
  // If Indian number without country code
  const standardNumber = clean.length === 10 ? `91${clean}` : clean;
  const encodedMsg = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${standardNumber}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
}

/**
 * Maps a LocalWork to a DeadlineItem so it seamlessly shows up
 * in the Dashboard Upcoming Deadlines Alarm Card.
 */
export function convertLocalWorkToDeadlineItem(work: LocalWork): DeadlineItem {
  return {
    id: `dl-${work.id}`,
    title: `${work.workId || work.id}: ${work.title}`,
    type: 'local-work',
    referenceId: work.id,
    deadlineDate: work.deadlineDate || work.date,
    deadlineTime: work.deadlineTime || '18:00',
    priority: work.priority === 'Urgent' ? 'Urgent' : 'Normal',
    status: work.status,
    clientName: work.clientName,
    description: work.notes || `${work.workType} for ${work.clientName}`,
    assignedTo: work.assignedTo || 'Unassigned',
    isCompleted: work.status === 'Completed' || work.status === 'Cancelled',
  };
}

export { calculatePaymentStatus, calculateAmountToGet, getPaymentStatusBadgeStyle, sumReceivedPayments } from './paymentUtils';

export function getWorkFinancials(work: Partial<LocalWork>): {
  totalAmount: number;
  amountGot: number;
  amountToGet: number;
  paymentStatus: PaymentStatus;
} {
  const totalAmount = Math.max(0, Number(work.totalAmount ?? work.amount ?? 0));
  
  let amountGot: number;
  if (Array.isArray(work.paymentRecords) && work.paymentRecords.length > 0) {
    // If payment records exist, calculate SUM of received payments
    amountGot = sumReceivedPayments(work.paymentRecords);
  } else if (work.amountGot !== undefined && !isNaN(Number(work.amountGot))) {
    amountGot = Number(work.amountGot);
  } else {
    if (work.paymentStatus === 'Paid' || (work.paymentStatus as string) === 'PAID') {
      amountGot = totalAmount;
    } else if (work.paymentStatus === 'Partially Paid') {
      amountGot = Math.round(totalAmount / 2);
    } else {
      amountGot = 0;
    }
  }

  amountGot = Math.max(0, Math.round(amountGot * 100) / 100);
  const amountToGet = calculateAmountToGet(totalAmount, amountGot);
  const paymentStatus = calculatePaymentStatus(totalAmount, amountGot);

  return {
    totalAmount,
    amountGot,
    amountToGet,
    paymentStatus,
  };
}

