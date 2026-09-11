import { DeadlineItem, DeadlineUrgency } from '../types';

export interface EvaluatedDeadline {
  deadline: DeadlineItem;
  targetDate: Date;
  diffMs: number;
  diffSec: number;
  diffMin: number;
  diffHours: number;
  diffDays: number;
  urgency: DeadlineUrgency;
  relativeStatus: string;
  countdownText: string;
  exactDateTimeText: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Formats date and time into exact format required:
 * Example: "09 September 2026 · 04:30 PM"
 */
export function formatExactDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = (timeStr || '18:00').split(':').map(Number);

  const dayStr = String(day).padStart(2, '0');
  const monthName = MONTH_NAMES[(month || 1) - 1] || 'September';

  // 12-hour format calculation
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const timeFormatted = `${String(displayHours).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')} ${period}`;

  return `${dayStr} ${monthName} ${year} · ${timeFormatted}`;
}

/**
 * Parse date and time into local Date object safely
 */
export function parseDeadlineDate(dateStr: string, timeStr: string = '18:00'): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
}

/**
 * Evaluates a single deadline against current date/time
 */
export function evaluateDeadline(
  deadline: DeadlineItem,
  now: Date = new Date()
): EvaluatedDeadline {
  const targetDate = parseDeadlineDate(deadline.deadlineDate, deadline.deadlineTime);
  const diffMs = targetDate.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  const exactDateTimeText = formatExactDateTime(
    deadline.deadlineDate,
    deadline.deadlineTime
  );

  let urgency: DeadlineUrgency = 'NORMAL';
  let relativeStatus = '';
  let countdownText = '';

  // Check if calendar day is tomorrow
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const dayDifference = Math.round((targetDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffMs < -60 * 1000) {
    // OVERDUE: Passed by more than 1 minute
    urgency = 'OVERDUE';
    if (Math.abs(diffDays) >= 1) {
      relativeStatus = 'Overdue';
      countdownText = `Overdue by ${Math.abs(diffDays)}d`;
    } else if (Math.abs(diffHours) >= 1) {
      relativeStatus = 'Overdue';
      countdownText = `Overdue by ${Math.abs(diffHours)}h`;
    } else {
      relativeStatus = 'Overdue';
      countdownText = `Overdue by ${Math.abs(diffMin)}m`;
    }
  } else if (diffMs >= -60 * 1000 && diffMs <= 5 * 60 * 1000) {
    // DUE NOW: Within 5 minutes margin
    urgency = 'DUE_NOW';
    relativeStatus = 'Due now';
    countdownText = 'Due now';
  } else if (diffHours < 3) {
    // URGENT: 3 hours or less remaining
    urgency = 'URGENT';
    if (diffSec < 60) {
      relativeStatus = `Due in ${Math.max(1, diffSec)}s`;
      countdownText = `Due in ${Math.max(1, diffSec)}s`;
    } else if (diffMin < 60) {
      relativeStatus = `Due in ${diffMin}m`;
      countdownText = `Due in ${diffMin}m`;
    } else {
      const remMin = diffMin % 60;
      relativeStatus = `Due in ${diffHours}h ${remMin}m`;
      countdownText = `Due in ${String(diffHours).padStart(2, '0')}h ${String(remMin).padStart(2, '0')}m`;
    }
  } else if (diffHours <= 24) {
    // APPROACHING: 24 hours or less remaining
    urgency = 'APPROACHING';
    const remMin = diffMin % 60;
    countdownText = `Due in ${String(diffHours).padStart(2, '0')}h ${String(remMin).padStart(2, '0')}m`;
    if (dayDifference === 1 && diffHours >= 12) {
      relativeStatus = 'Due tomorrow';
    } else {
      relativeStatus = `Due in ${diffHours} hours`;
    }
  } else {
    // NORMAL: More than 24 hours remaining
    urgency = 'NORMAL';
    if (dayDifference === 1) {
      relativeStatus = 'Due tomorrow';
      countdownText = 'Due tomorrow';
    } else if (dayDifference === 0) {
      relativeStatus = `Due in ${diffHours}h`;
      countdownText = `Due in ${diffHours}h`;
    } else {
      relativeStatus = `Due in ${dayDifference} days`;
      countdownText = `Due in ${dayDifference} days`;
    }
  }

  // If priority was explicitly set to Urgent and not overdue, promote visual tier
  if (deadline.priority === 'Urgent' && urgency === 'NORMAL') {
    urgency = 'APPROACHING';
  }

  return {
    deadline,
    targetDate,
    diffMs,
    diffSec,
    diffMin,
    diffHours,
    diffDays,
    urgency,
    relativeStatus,
    countdownText,
    exactDateTimeText,
  };
}

/**
 * Sort deadlines according to prompt Requirement 6:
 * 1. Overdue / Due Now
 * 2. Most urgent upcoming deadline
 * 3. Later deadlines
 */
export function sortEvaluatedDeadlines(
  evaluatedList: EvaluatedDeadline[]
): EvaluatedDeadline[] {
  return [...evaluatedList].sort((a, b) => {
    // Uncompleted vs Completed
    if (a.deadline.isCompleted !== b.deadline.isCompleted) {
      return a.deadline.isCompleted ? 1 : -1;
    }

    // Both Overdue: show most critical (closest to now or oldest overdue)
    const aIsOverdue = a.urgency === 'OVERDUE';
    const bIsOverdue = b.urgency === 'OVERDUE';

    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;

    // Due now
    const aIsDueNow = a.urgency === 'DUE_NOW';
    const bIsDueNow = b.urgency === 'DUE_NOW';
    if (aIsDueNow && !bIsDueNow) return -1;
    if (!aIsDueNow && bIsDueNow) return 1;

    // Upcoming: smallest diffMs first (closest deadline)
    return a.diffMs - b.diffMs;
  });
}
