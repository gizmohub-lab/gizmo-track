import { useState, useEffect } from 'react';
import {
  Project,
  LocalWork,
  ProjectDeliverable,
  AdminNotification,
  AppRoute,
  Invoice,
  InvoiceStatus,
} from '../types';

/**
 * Global single source of truth for current runtime Date.
 */
export function getNow(): Date {
  return new Date();
}

/**
 * Custom React Hook that ticks every `intervalMs` (default 1000ms)
 * to trigger live countdown updates across UI components.
 */
export function useLiveNow(intervalMs: number = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}

/**
 * Safely parse dateStr (YYYY-MM-DD or ISO) and timeStr (HH:mm) into a local Date object.
 */
export function parseDateTime(dateStr?: string, timeStr: string = '18:00'): Date | null {
  if (!dateStr) return null;

  try {
    if (dateStr.includes('T')) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;
    }

    const cleanDate = dateStr.split('T')[0];
    const dateParts = cleanDate.split('-').map(Number);
    if (dateParts.length < 3) return null;

    const [year, month, day] = dateParts;
    const timeParts = (timeStr || '18:00').split(':').map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch {
    return null;
  }
}

/**
 * Format readable date string (e.g. "11 Sep 2026")
 */
export function formatDisplayDate(dateInput?: string | Date): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? parseDateTime(dateInput) || new Date(dateInput) : dateInput;
  if (!d || isNaN(d.getTime())) return String(dateInput);

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format readable 12-hour time string (e.g. "05:00 PM")
 */
export function formatDisplayTime(timeStr?: string, dateObj?: Date): string {
  if (dateObj && !isNaN(dateObj.getTime())) {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${period}`;
}

/**
 * Format full exact date time string (e.g. "11 Sep 2026 · 05:00 PM")
 */
export function formatExactDateTimeString(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return '';
  const parsed = parseDateTime(dateStr, timeStr);
  if (!parsed) return dateStr;
  return `${formatDisplayDate(parsed)} · ${formatDisplayTime(timeStr, parsed)}`;
}

export type DynamicDeadlineStatusType =
  | 'COMPLETED'
  | 'OVERDUE'
  | 'DUE_NOW'
  | 'DUE_SOON'
  | 'DUE_TODAY'
  | 'DUE_TOMORROW'
  | 'UPCOMING';

export interface DynamicDeadlineEvaluation {
  statusType: DynamicDeadlineStatusType;
  badgeLabel: string;
  countdownText: string;
  exactDateTimeText: string;
  targetDate: Date | null;
  diffMs: number;
  diffDays: number;
  diffHours: number;
  diffMin: number;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueTomorrow: boolean;
  isDueSoon: boolean;
  badgeClass: string;
}

/**
 * Evaluates any deadline (project, deliverable, local work) against the given time `now`.
 */
export function evaluateDeadlineDynamic(
  dateStr?: string,
  timeStr: string = '18:00',
  isCompleted: boolean = false,
  now: Date = new Date()
): DynamicDeadlineEvaluation {
  if (isCompleted) {
    const targetDate = parseDateTime(dateStr, timeStr);
    return {
      statusType: 'COMPLETED',
      badgeLabel: 'Completed',
      countdownText: 'Completed',
      exactDateTimeText: formatExactDateTimeString(dateStr, timeStr),
      targetDate,
      diffMs: 0,
      diffDays: 0,
      diffHours: 0,
      diffMin: 0,
      isOverdue: false,
      isDueToday: false,
      isDueTomorrow: false,
      isDueSoon: false,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }

  const targetDate = parseDateTime(dateStr, timeStr);
  if (!targetDate) {
    return {
      statusType: 'UPCOMING',
      badgeLabel: 'No Deadline',
      countdownText: 'No Deadline',
      exactDateTimeText: 'No Deadline',
      targetDate: null,
      diffMs: Infinity,
      diffDays: Infinity,
      diffHours: Infinity,
      diffMin: Infinity,
      isOverdue: false,
      isDueToday: false,
      isDueTomorrow: false,
      isDueSoon: false,
      badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    };
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  const absMin = Math.abs(diffMin);
  const absHours = Math.abs(diffHours);
  const absDays = Math.abs(diffDays);

  const exactDateTimeText = formatExactDateTimeString(dateStr, timeStr);

  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const dayDifference = Math.round((targetDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  let statusType: DynamicDeadlineStatusType = 'UPCOMING';
  let badgeLabel = '';
  let countdownText = '';
  let badgeClass = 'bg-blue-50 text-blue-800 border-blue-200';

  if (diffMs < -60 * 1000) {
    // Overdue by more than 1 minute
    statusType = 'OVERDUE';
    badgeLabel = 'Overdue';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';

    if (absDays >= 1) {
      const remHours = absHours % 24;
      countdownText = remHours > 0 ? `Overdue by ${absDays}d ${remHours}h` : `Overdue by ${absDays}d`;
    } else if (absHours >= 1) {
      const remMin = absMin % 60;
      countdownText = remMin > 0 ? `Overdue by ${absHours}h ${remMin}m` : `Overdue by ${absHours}h`;
    } else {
      countdownText = `Overdue by ${absMin}m`;
    }
  } else if (diffMs >= -60 * 1000 && diffMs <= 5 * 60 * 1000) {
    // Due Now
    statusType = 'DUE_NOW';
    badgeLabel = 'Due Now';
    countdownText = 'Due now';
    badgeClass = 'bg-[#FFF1EE] text-[#FF5738] border-[#FFB2A1] font-bold';
  } else if (diffHours < 3) {
    // Due Soon
    statusType = 'DUE_SOON';
    badgeLabel = 'Due Soon';
    badgeClass = 'bg-[#FFF1EE] text-[#FF5738] border-[#FFB2A1]';

    if (diffMin < 60) {
      countdownText = `Due in ${diffMin}m`;
    } else {
      const remMin = diffMin % 60;
      countdownText = `Due in ${String(diffHours).padStart(2, '0')}h ${String(remMin).padStart(2, '0')}m`;
    }
  } else if (dayDifference === 0) {
    // Due Today
    statusType = 'DUE_TODAY';
    badgeLabel = 'Due Today';
    badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
    const remMin = diffMin % 60;
    countdownText = `Due in ${String(diffHours).padStart(2, '0')}h ${String(remMin).padStart(2, '0')}m`;
  } else if (dayDifference === 1) {
    // Due Tomorrow
    statusType = 'DUE_TOMORROW';
    badgeLabel = 'Due Tomorrow';
    badgeClass = 'bg-amber-50/80 text-amber-700 border-amber-200';
    const remHours = diffHours % 24;
    const remMin = diffMin % 60;
    if (diffHours < 24) {
      countdownText = `Due in ${String(diffHours).padStart(2, '0')}h ${String(remMin).padStart(2, '0')}m`;
    } else {
      countdownText = `Due in 01d ${String(remHours).padStart(2, '0')}h`;
    }
  } else {
    // Upcoming
    statusType = 'UPCOMING';
    badgeLabel = 'Upcoming';
    badgeClass = 'bg-zinc-100 text-zinc-700 border-zinc-200';
    const remHours = diffHours % 24;
    const remMin = diffMin % 60;
    countdownText = `Due in ${String(diffDays).padStart(2, '0')}d ${String(remHours).padStart(2, '0')}h ${String(remMin).padStart(2, '0')}m`;
  }

  return {
    statusType,
    badgeLabel,
    countdownText,
    exactDateTimeText,
    targetDate,
    diffMs,
    diffDays,
    diffHours,
    diffMin,
    isOverdue: statusType === 'OVERDUE',
    isDueToday: statusType === 'DUE_TODAY' || dayDifference === 0,
    isDueTomorrow: statusType === 'DUE_TOMORROW' || dayDifference === 1,
    isDueSoon: statusType === 'DUE_SOON' || statusType === 'DUE_NOW',
    badgeClass,
  };
}

export interface UnifiedDeadlineRecord {
  id: string;
  sourceType: 'Project' | 'Deliverable' | 'LocalWork';
  sourceId: string;
  title: string;
  subtitle: string;
  clientName?: string;
  assignedDesignerName?: string;
  deadlineDate?: string;
  deadlineTime?: string;
  isCompleted: boolean;
  workflowStatus: string;
  priority: string;
  amount?: number;
  targetRoute?: AppRoute;
  evaluation: DynamicDeadlineEvaluation;
}

/**
 * Gathers and dynamically sorts all deadlines from Projects, Deliverables and Local Works.
 * Strict Urgency Hierarchy:
 * 1. Overdue
 * 2. Due now
 * 3. Due within 1 hour
 * 4. Due today
 * 5. Due tomorrow
 * 6. Upcoming
 * 7. Completed (at bottom)
 */
export function getAllUnifiedDeadlines(
  projects: Project[] = [],
  localWorks: LocalWork[] = [],
  now: Date = new Date()
): UnifiedDeadlineRecord[] {
  const items: UnifiedDeadlineRecord[] = [];

  // 1. Projects
  projects.forEach((prj) => {
    if (prj.hasDeadline && prj.deadlineDate) {
      const isCompleted = prj.status === 'Completed' || prj.status === 'Cancelled';
      const evaluation = evaluateDeadlineDynamic(prj.deadlineDate, prj.deadlineTime || '18:00', isCompleted, now);
      items.push({
        id: `prj-dl-${prj.id}`,
        sourceType: 'Project',
        sourceId: prj.id,
        title: prj.title,
        subtitle: `Project (${prj.projectType || prj.category || 'Design'})`,
        clientName: prj.clientName,
        assignedDesignerName: prj.assignedDesignerName,
        deadlineDate: prj.deadlineDate,
        deadlineTime: prj.deadlineTime,
        isCompleted,
        workflowStatus: prj.status,
        priority: prj.priority,
        amount: prj.totalAmount,
        targetRoute: 'admin-projects',
        evaluation,
      });
    }

    // 2. Deliverables inside Projects
    if (prj.deliverables) {
      prj.deliverables.forEach((del) => {
        if (del.hasDeadline && del.deadlineDate) {
          const isCompleted = del.isCompleted || del.status === 'Completed';
          const evaluation = evaluateDeadlineDynamic(del.deadlineDate, del.deadlineTime || '18:00', isCompleted, now);
          items.push({
            id: `del-dl-${prj.id}-${del.id}`,
            sourceType: 'Deliverable',
            sourceId: del.id,
            title: `${prj.title} — ${del.title}`,
            subtitle: `Deliverable (${del.type})`,
            clientName: prj.clientName,
            assignedDesignerName: del.assignedDesignerName || prj.assignedDesignerName,
            deadlineDate: del.deadlineDate,
            deadlineTime: del.deadlineTime,
            isCompleted,
            workflowStatus: del.status || (del.isCompleted ? 'Completed' : 'In Progress'),
            priority: del.priority || prj.priority,
            amount: del.amount,
            targetRoute: 'admin-projects',
            evaluation,
          });
        }
      });
    }
  });

  // 3. Local Works
  localWorks.forEach((work) => {
    if (work.deadlineDate || work.date) {
      const isCompleted = work.status === 'Completed' || work.status === 'Cancelled' || work.status === 'Delivered';
      const deadlineDate = work.deadlineDate || work.date;
      const evaluation = evaluateDeadlineDynamic(deadlineDate, work.deadlineTime || '18:00', isCompleted, now);
      items.push({
        id: `lw-dl-${work.id}`,
        sourceType: 'LocalWork',
        sourceId: work.id,
        title: work.title || work.clientName,
        subtitle: `Local Work (${work.workType || 'Flex / Print'})`,
        clientName: work.clientName,
        assignedDesignerName: work.assignedTo,
        deadlineDate,
        deadlineTime: work.deadlineTime,
        isCompleted,
        workflowStatus: work.status,
        priority: work.priority || 'Normal',
        amount: work.totalAmount || work.amount,
        targetRoute: 'admin-local-works',
        evaluation,
      });
    }
  });

  return items.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }

    const urgencyRank = (evalResult: DynamicDeadlineEvaluation) => {
      switch (evalResult.statusType) {
        case 'OVERDUE': return 1;
        case 'DUE_NOW': return 2;
        case 'DUE_SOON': return 3;
        case 'DUE_TODAY': return 4;
        case 'DUE_TOMORROW': return 5;
        case 'UPCOMING': return 6;
        case 'COMPLETED': return 7;
        default: return 8;
      }
    };

    const rankA = urgencyRank(a.evaluation);
    const rankB = urgencyRank(b.evaluation);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    return a.evaluation.diffMs - b.evaluation.diffMs;
  });
}

/**
 * Generates dynamic system notifications based on actual deadline thresholds.
 */
export function generateDateBasedNotifications(
  projects: Project[] = [],
  localWorks: LocalWork[] = [],
  now: Date = new Date()
): AdminNotification[] {
  const notifications: AdminNotification[] = [];
  const deadlines = getAllUnifiedDeadlines(projects, localWorks, now);

  deadlines.forEach((item) => {
    if (item.isCompleted) return;

    const evalRes = item.evaluation;
    const hoursRemaining = evalRes.diffHours;
    const minRemaining = evalRes.diffMin;

    if (evalRes.isOverdue) {
      notifications.push({
        id: `notif-overdue-${item.id}`,
        title: `OVERDUE: ${item.title}`,
        description: `Deadline was ${evalRes.exactDateTimeText}. ${evalRes.countdownText}.`,
        timestamp: evalRes.countdownText,
        read: false,
        type: 'urgent',
        targetRoute: item.targetRoute,
      });
    } else if (evalRes.statusType === 'DUE_NOW') {
      notifications.push({
        id: `notif-duenow-${item.id}`,
        title: `DUE NOW: ${item.title}`,
        description: `Deadline is right now (${evalRes.exactDateTimeText}).`,
        timestamp: 'Due now',
        read: false,
        type: 'urgent',
        targetRoute: item.targetRoute,
      });
    } else if (hoursRemaining <= 1) {
      notifications.push({
        id: `notif-1h-${item.id}`,
        title: `Deadline in 1 Hour: ${item.title}`,
        description: `Due in ${minRemaining} minutes (${evalRes.exactDateTimeText}).`,
        timestamp: `${minRemaining}m remaining`,
        read: false,
        type: 'urgent',
        targetRoute: item.targetRoute,
      });
    } else if (hoursRemaining <= 24) {
      notifications.push({
        id: `notif-24h-${item.id}`,
        title: `Deadline Tomorrow: ${item.title}`,
        description: `Due in ${hoursRemaining} hours (${evalRes.exactDateTimeText}).`,
        timestamp: `${hoursRemaining}h remaining`,
        read: false,
        type: 'project',
        targetRoute: item.targetRoute,
      });
    } else if (hoursRemaining <= 48) {
      notifications.push({
        id: `notif-48h-${item.id}`,
        title: `Deadline Approaching: ${item.title}`,
        description: `Due in ${Math.round(hoursRemaining / 24)} days (${evalRes.exactDateTimeText}).`,
        timestamp: `${Math.round(hoursRemaining / 24)}d remaining`,
        read: false,
        type: 'project',
        targetRoute: item.targetRoute,
      });
    }
  });

  return notifications;
}

/**
 * Calculates dynamic invoice status based on payment total and due date.
 * Fully paid invoices return 'Paid' regardless of whether due date has passed.
 */
export function evaluateInvoiceStatusDynamic(
  totalAmount: number,
  receivedAmount: number,
  dueDateStr?: string,
  currentStatus: string = 'Pending',
  now: Date = new Date()
): InvoiceStatus {
  if (currentStatus === 'Draft') return 'Draft';
  if (currentStatus === 'Cancelled') return 'Cancelled';

  const total = Math.max(0, Math.round((Number(totalAmount) || 0) * 100) / 100);
  const received = Math.max(0, Math.round((Number(receivedAmount) || 0) * 100) / 100);

  if (total > 0 && received >= total) {
    return 'Paid';
  }

  if (dueDateStr) {
    const due = parseDateTime(dueDateStr, '23:59');
    if (due && now.getTime() > due.getTime()) {
      return 'Overdue';
    }
  }

  if (received > 0 && received < total) {
    return 'Partially Paid';
  }

  return 'Pending';
}
