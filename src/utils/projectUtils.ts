import {
  Project,
  ProjectDeliverable,
  ProjectTypeItem,
  ProjectPriorityItem,
  DeliverableTypeItem,
  ProjectStatusItem,
  ProjectCustomFieldDef,
  ProjectTemplate,
  DeadlineItem,
  PaymentStatus,
  Invoice,
  Client,
} from '../types';
import { calculatePaymentStatus, calculateAmountToGet, sumReceivedPayments } from './paymentUtils';
import { safeLoadItem, safeSaveItem } from '../services/safeStorage';
import { buildStoragePath } from '../services/fileStorageVault';

export const PROJECT_STORAGE_KEYS = {
  PROJECT_TYPES: 'gizmo_project_types_v2',
  PROJECT_PRIORITIES: 'gizmo_project_priorities_v2',
  DELIVERABLE_TYPES: 'gizmo_deliverable_types_v2',
  PROJECT_STATUSES: 'gizmo_project_statuses_v2',
  CUSTOM_FIELDS: 'gizmo_project_custom_fields_v2',
  TEMPLATES: 'gizmo_project_templates_v2',
};

// 1. DEFAULT PROJECT TYPES
export const defaultProjectTypes: ProjectTypeItem[] = [
  { id: 'pt-branding', name: 'Branding', description: 'Brand Identity, logos, guidelines & assets', isActive: true, displayOrder: 1, isSystem: true },
  { id: 'pt-motion', name: 'Motion', description: 'Reels, animated posters, video graphics', isActive: true, displayOrder: 2, isSystem: true },
  { id: 'pt-poster', name: 'Poster', description: 'Social media, event, promotional graphics', isActive: true, displayOrder: 3, isSystem: true },
  { id: 'pt-print', name: 'Print', description: 'Stationery, packaging, brochures, billboards', isActive: true, displayOrder: 4, isSystem: true },
  { id: 'pt-website', name: 'Website', description: 'UI/UX mockups, landing pages, web assets', isActive: true, displayOrder: 5 },
  { id: 'pt-logo', name: 'Logo', description: 'Primary marks, logotypes, monograms', isActive: true, displayOrder: 6 },
  { id: 'pt-video', name: 'Video', description: 'Video editing, motion cuts, teasers', isActive: true, displayOrder: 7 },
  { id: 'pt-social-media', name: 'Social Media', description: 'Monthly content packages, carousels, stories', isActive: true, displayOrder: 8 },
  { id: 'pt-invitation', name: 'Invitation', description: 'Weddings, VIP events, corporate cards', isActive: true, displayOrder: 9 },
  { id: 'pt-photography', name: 'Photography', description: 'Shoot planning, retouching & color grading', isActive: true, displayOrder: 10 },
  { id: 'pt-packaging', name: 'Packaging', description: 'Box dielines, pouch design, label sticker wraps', isActive: true, displayOrder: 11 },
  { id: 'pt-uiux', name: 'UI/UX', description: 'App and mobile interfaces, wireframes & prototypes', isActive: true, displayOrder: 12 },
  { id: 'pt-other', name: 'Other', description: 'Custom or bespoke creative briefs', isActive: true, displayOrder: 13, isSystem: true },
];

// 2. DEFAULT PRIORITIES
export const defaultProjectPriorities: ProjectPriorityItem[] = [
  { id: 'pri-low', name: 'Low', description: 'Standard turnaround, low urgency', displayOrder: 1, isActive: true, color: 'text-slate-600 bg-slate-100 border-slate-200' },
  { id: 'pri-normal', name: 'Normal', description: 'Default priority for routine client briefs', displayOrder: 2, isActive: true, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'pri-high', name: 'High', description: 'Priority client work, expedited timeline', displayOrder: 3, isActive: true, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'pri-urgent', name: 'Urgent', description: 'Immediate design and press delivery', displayOrder: 4, isActive: true, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { id: 'pri-rush', name: 'Rush', description: 'Same-day turnaround requested by client', displayOrder: 5, isActive: true, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'pri-client-critical', name: 'Client Critical', description: 'Major stakeholder campaign, VIP review', displayOrder: 6, isActive: true, color: 'text-red-800 bg-red-100 border-red-300' },
  { id: 'pri-vip', name: 'VIP', description: 'Key account priority service', displayOrder: 7, isActive: true, color: 'text-emerald-800 bg-emerald-100 border-emerald-300' },
  { id: 'pri-internal', name: 'Internal', description: 'Studio internal branding and showcase', displayOrder: 8, isActive: true, color: 'text-zinc-700 bg-zinc-100 border-zinc-300' },
];

// 3. DEFAULT DELIVERABLE TYPES
export const defaultDeliverableTypes: DeliverableTypeItem[] = [
  { id: 'del-deliverable', name: 'Deliverable', description: 'Primary creative output for client handover', isActive: true, displayOrder: 1 },
  { id: 'del-milestone', name: 'Milestone', description: 'Key phase gate requiring milestone sign-off', isActive: true, displayOrder: 2 },
  { id: 'del-review', name: 'Review', description: 'Client feedback and presentation checkpoint', isActive: true, displayOrder: 3 },
  { id: 'del-approval', name: 'Approval', description: 'Formal client sign-off on artwork / proof', isActive: true, displayOrder: 4 },
  { id: 'del-payment', name: 'Payment', description: 'Advance deposit or progress payment milestone', isActive: true, displayOrder: 5 },
  { id: 'del-handover', name: 'Handover', description: 'Final vector / open source files release', isActive: true, displayOrder: 6 },
  { id: 'del-revision', name: 'Revision', description: 'Incorporation of client correction round', isActive: true, displayOrder: 7 },
  { id: 'del-internal-task', name: 'Internal Task', description: 'Studio prep, printing coordination, proofing', isActive: true, displayOrder: 8 },
];

// 4. DEFAULT STATUSES
export const defaultProjectStatuses: ProjectStatusItem[] = [
  { id: 'st-new', name: 'New', description: 'Brief received, planning not yet started', isActive: true, displayOrder: 1, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'st-in-progress', name: 'In Progress', description: 'Active in production & creative drafting', isActive: true, displayOrder: 2, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { id: 'st-waiting', name: 'Waiting for Client', description: 'Sent for client feedback / proof review', isActive: true, displayOrder: 3, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'st-revision', name: 'Revision', description: 'Client requested changes and iterations', isActive: true, displayOrder: 4, color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { id: 'st-ready', name: 'Ready', description: 'Approved artworks ready for delivery / print', isActive: true, displayOrder: 5, color: 'text-teal-700 bg-teal-50 border-teal-200' },
  { id: 'st-completed', name: 'Completed', description: 'All deliverables handed over and settled', isActive: true, displayOrder: 6, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'st-cancelled', name: 'Cancelled', description: 'Project shelved or cancelled by client', isActive: true, displayOrder: 7, color: 'text-zinc-600 bg-zinc-100 border-zinc-200' },
];

// 5. DEFAULT CUSTOM FIELD DEFINITIONS
export const defaultCustomFields: ProjectCustomFieldDef[] = [
  { id: 'cf-client-ref', name: 'Client Reference', type: 'text', isRequired: false, isActive: true },
  { id: 'cf-print-size', name: 'Printing Size', type: 'text', isRequired: false, isActive: true },
  { id: 'cf-color-format', name: 'Color Format', type: 'dropdown', options: ['CMYK (Press Print)', 'RGB (Digital Screens)', 'Pantone / Spot', 'Grayscale'], isRequired: false, isActive: true },
  { id: 'cf-quantity', name: 'Quantity', type: 'number', isRequired: false, isActive: true },
  { id: 'cf-platform', name: 'Platform', type: 'dropdown', options: ['Instagram Feed (1:1 / 4:5)', 'Instagram Story / Reels (9:16)', 'YouTube 16:9', 'Print Outdoor', 'Multi-channel'], isRequired: false, isActive: true },
  { id: 'cf-language', name: 'Language', type: 'dropdown', options: ['English', 'Malayalam', 'Arabic', 'Hindi', 'Bilingual (Malayalam + English)', 'Arabic + English'], isRequired: false, isActive: true },
  { id: 'cf-source-format', name: 'Source Format', type: 'dropdown', options: ['Adobe Illustrator (.AI)', 'Photoshop (.PSD)', 'After Effects (.AEP)', 'Figma', 'Print Ready PDF (300 DPI)'], isRequired: false, isActive: true },
  { id: 'cf-instructions', name: 'Special Instructions', type: 'text', isRequired: false, isActive: true },
];

// 6. DEFAULT PROJECT TEMPLATES
export const defaultProjectTemplates: ProjectTemplate[] = [
  {
    id: 'tmpl-brand-identity',
    name: 'Brand Identity Package',
    description: 'Comprehensive branding lifecycle with logo, guidelines and stationery',
    projectType: 'Branding',
    deliverables: [
      { title: 'Brand Discovery & Moodboard', type: 'Milestone', description: 'Research, competitor benchmarking, visual direction', isRequired: true, orderIndex: 1 },
      { title: 'Logo Concept Design & Initial Proof', type: 'Deliverable', description: '3 primary visual mark concepts with typography & color palette', isRequired: true, orderIndex: 2 },
      { title: 'Client Review & Feedback', type: 'Review', description: 'First round client presentation and iteration notes', isRequired: true, orderIndex: 3 },
      { title: 'Brand Stationery & Collateral Kit', type: 'Deliverable', description: 'Business card, letterhead, official envelopes & seals', isRequired: true, orderIndex: 4 },
      { title: 'Final Logo Approval & Vector Master Handover', type: 'Handover', description: 'Master vector files (.AI, .EPS, .SVG, .PNG) & Brand Guide PDF', isRequired: true, orderIndex: 5 },
    ],
  },
  {
    id: 'tmpl-social-media',
    name: 'Social Media Campaign Package',
    description: 'Campaign bundle for festive, event, or monthly feed launch',
    projectType: 'Social Media',
    deliverables: [
      { title: 'Campaign Concept & Copywriting Review', type: 'Milestone', description: 'Campaign theme, headline copy and release schedule', isRequired: true, orderIndex: 1 },
      { title: 'Main Teaser / Announcement Poster', type: 'Deliverable', description: 'High-impact launch artwork in 1:1 and 9:16 aspect ratios', isRequired: true, orderIndex: 2 },
      { title: 'Carousel Infographic Set (5 Slides)', type: 'Deliverable', description: 'Multi-frame storytelling slides for Instagram feed', isRequired: true, orderIndex: 3 },
      { title: 'Short Promotional Motion Reel (15s)', type: 'Deliverable', description: 'Kinetic typography, animated logo & music sync', isRequired: false, orderIndex: 4 },
      { title: 'Final Handover & Scheduled Assets Release', type: 'Handover', description: 'High-resolution PNG/MP4 files packaged and uploaded', isRequired: true, orderIndex: 5 },
    ],
  },
  {
    id: 'tmpl-print-packaging',
    name: 'Print & Packaging Suite',
    description: 'Product packaging dielines, labels and outer box offset artwork',
    projectType: 'Packaging',
    deliverables: [
      { title: 'Dieline Setup & Technical Sizing Check', type: 'Milestone', description: 'Vendor dieline measurement, bleed margins & barcode space', isRequired: true, orderIndex: 1 },
      { title: 'Front Face & Nutritional / Legal Panel Layout', type: 'Deliverable', description: 'Packaging graphics layout with regulatory info', isRequired: true, orderIndex: 2 },
      { title: 'Client Proofing & 3D Box Mockup', type: 'Review', description: 'Realistic 3D presentation renders for client approval', isRequired: true, orderIndex: 3 },
      { title: 'Pre-Press Production Files (CMYK + Foil Layers)', type: 'Handover', description: 'Separated plate files with spot UV / foil stamping layers', isRequired: true, orderIndex: 4 },
    ],
  },
];

// Helper: Formatted system timestamp e.g. "11 Sep 2026 · 01:15 PM"
export function formatSystemTimestamp(d: Date = new Date()): string {
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');

  return `${day} ${month} ${year} · ${hoursStr}:${minutes} ${period}`;
}

export function formatDateOnly(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 7. FINANCIAL CALCULATOR FOR PROJECT
export function getProjectFinancials(
  p: Project,
  invoices: Invoice[] = []
): {
  totalAmount: number;
  totalInvoiced: number;
  amountGot: number;
  amountToGet: number;
  unbilledAmount: number;
  invoicedPaid: number;
  invoicedPending: number;
  paymentStatus: PaymentStatus;
  linkedInvoices: Invoice[];
} {
  const total = Number(p.totalAmount ?? p.budget ?? 0);

  // Filter linked invoices: match by projectId, or by projectTitle if projectId is not set
  const linkedInvoices = (invoices || []).filter(
    (inv) =>
      (inv.projectId && inv.projectId === p.id) ||
      (!inv.projectId && inv.projectTitle && p.title && inv.projectTitle.trim().toLowerCase() === p.title.trim().toLowerCase())
  );

  // Non-draft & non-cancelled invoices count toward official Invoiced value
  const activeInvoices = linkedInvoices.filter(
    (inv) => inv.status !== 'Draft' && inv.status !== 'Cancelled'
  );

  const totalInvoiced = activeInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
  const invoicedPaid = activeInvoices.reduce((sum, inv) => sum + Number(inv.receivedAmount || 0), 0);
  const invoicedPending = Math.max(0, totalInvoiced - invoicedPaid);

  // Direct payments recorded on project ledger (sums valid/received transactions)
  const hasPaymentRecords = Array.isArray(p.payments) && p.payments.length > 0;
  const directPayments = hasPaymentRecords ? sumReceivedPayments(p.payments) : 0;
  const explicitGot = Number(p.amountGot || 0);

  // If explicit payment transactions exist on the project ledger, they are the primary source of truth.
  // Otherwise, use whichever is highest between explicit amountGot and invoiced payments.
  let got = 0;
  if (hasPaymentRecords) {
    got = Math.max(directPayments, invoicedPaid);
  } else {
    got = Math.max(explicitGot, directPayments, invoicedPaid);
  }
  got = Math.round(got * 100) / 100;

  const toGet = calculateAmountToGet(total, got);
  const unbilledAmount = Math.max(0, Math.round((total - totalInvoiced) * 100) / 100);
  const status: PaymentStatus = calculatePaymentStatus(total, got);

  return {
    totalAmount: total,
    totalInvoiced,
    amountGot: got,
    amountToGet: toGet,
    unbilledAmount,
    invoicedPaid,
    invoicedPending,
    paymentStatus: status,
    linkedInvoices,
  };
}

// 8. PROGRESS CALCULATOR
export function getProjectProgress(p: Project): {
  completedRequired: number;
  totalRequired: number;
  totalCompleted: number;
  totalDeliverables: number;
  percent: number;
  isAllRequiredCompleted: boolean;
} {
  const deliverables = p.deliverables || [];
  const totalDeliverables = deliverables.length;
  const totalCompleted = deliverables.filter((d) => d.isCompleted).length;

  const requiredDeliverables = deliverables.filter((d) => d.isRequired);
  const totalRequired = requiredDeliverables.length;
  const completedRequired = requiredDeliverables.filter((d) => d.isCompleted).length;

  let percent = 0;
  if (totalRequired > 0) {
    percent = Math.round((completedRequired / totalRequired) * 100);
  } else if (totalDeliverables > 0) {
    percent = Math.round((totalCompleted / totalDeliverables) * 100);
  } else {
    percent = p.status === 'Completed' ? 100 : 0;
  }

  const isAllRequiredCompleted = totalRequired > 0 ? completedRequired === totalRequired : totalCompleted === totalDeliverables && totalDeliverables > 0;

  return {
    completedRequired,
    totalRequired,
    totalCompleted,
    totalDeliverables,
    percent,
    isAllRequiredCompleted,
  };
}

// 9. DEADLINE STATUS EVALUATOR
export function getProjectDeadlineStatus(p: Project, now: Date = new Date()): {
  status: 'No Deadline' | 'Completed' | 'Overdue' | 'Due Now' | 'Urgent' | 'Due Today' | 'Due Tomorrow' | 'Due Soon' | 'Upcoming';
  urgency: 'NORMAL' | 'APPROACHING' | 'URGENT' | 'DUE_NOW' | 'OVERDUE';
  label: string;
  badgeStyle: { bg: string; text: string; border: string; dot: string };
  daysLeft: number;
} {
  if (p.status === 'Completed') {
    return {
      status: 'Completed',
      urgency: 'NORMAL',
      label: 'Completed',
      badgeStyle: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
      daysLeft: 999,
    };
  }

  if (!p.hasDeadline || !p.deadlineDate) {
    return {
      status: 'No Deadline',
      urgency: 'NORMAL',
      label: 'No Deadline',
      badgeStyle: { bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border-zinc-200', dot: 'bg-zinc-400' },
      daysLeft: 999,
    };
  }

  const [year, month, day] = p.deadlineDate.split('-').map(Number);
  const [hours, minutes] = (p.deadlineTime || '18:00').split(':').map(Number);
  const targetDate = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0);

  const diffMs = targetDate.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffHours = diffSec / 3600;

  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const dayDiff = Math.round((targetDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffMs < -60 * 1000) {
    return {
      status: 'Overdue',
      urgency: 'OVERDUE',
      label: dayDiff < 0 ? `Overdue by ${Math.abs(dayDiff)}d` : 'Overdue',
      badgeStyle: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-600' },
      daysLeft: dayDiff,
    };
  }

  if (diffMs >= 0 && diffMs <= 60 * 60 * 1000) {
    return {
      status: 'Due Now',
      urgency: 'DUE_NOW',
      label: 'Due Now (< 1h)',
      badgeStyle: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-400', dot: 'bg-rose-600' },
      daysLeft: 0,
    };
  }

  if (dayDiff === 0) {
    return {
      status: 'Due Today',
      urgency: 'URGENT',
      label: `Due Today · ${p.deadlineTime || '18:00'}`,
      badgeStyle: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
      daysLeft: 0,
    };
  }

  if (dayDiff === 1) {
    return {
      status: 'Due Tomorrow',
      urgency: 'APPROACHING',
      label: 'Due Tomorrow',
      badgeStyle: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
      daysLeft: 1,
    };
  }

  if (dayDiff <= 3) {
    return {
      status: 'Due Soon',
      urgency: 'APPROACHING',
      label: `Due in ${dayDiff} days`,
      badgeStyle: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' },
      daysLeft: dayDiff,
    };
  }

  return {
    status: 'Upcoming',
    urgency: 'NORMAL',
    label: `${dayDiff} days left`,
    badgeStyle: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
    daysLeft: dayDiff,
  };
}

// 10. DELIVERABLE DEADLINE EVALUATOR
export function getDeliverableDeadlineStatus(del: ProjectDeliverable, now: Date = new Date()) {
  if (del.isCompleted) {
    return {
      status: 'Completed',
      label: 'Completed',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }

  if (!del.deadlineDate) {
    return {
      status: 'No Deadline',
      label: 'No Deadline',
      badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    };
  }

  const [year, month, day] = del.deadlineDate.split('-').map(Number);
  const [hours, minutes] = (del.deadlineTime || '18:00').split(':').map(Number);
  const targetDate = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0);

  const diffMs = targetDate.getTime() - now.getTime();
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const dayDiff = Math.round((targetDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return {
      status: 'Overdue',
      label: dayDiff < 0 ? `Overdue ${Math.abs(dayDiff)}d` : 'Overdue',
      badgeClass: 'bg-red-50 text-red-800 border-red-300 font-bold',
    };
  }

  if (dayDiff === 0) {
    return {
      status: 'Due Today',
      label: `Due Today · ${del.deadlineTime || '18:00'}`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
    };
  }

  if (dayDiff === 1) {
    return {
      status: 'Due Tomorrow',
      label: 'Due Tomorrow',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-200 font-semibold',
    };
  }

  return {
    status: 'Upcoming',
    label: `${dayDiff}d left`,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  };
}

// 11. CONVERT PROJECT TO DEADLINE ITEM
export function convertProjectToDeadlineItem(p: Project): DeadlineItem | null {
  if (!p.hasDeadline || !p.deadlineDate) return null;

  const displayName = p.customDisplayName || p.assignedDesignerName || 'Unassigned';

  return {
    id: `dl-proj-${p.id}`,
    title: `Project: ${p.title}`,
    type: 'project',
    referenceId: p.id,
    deadlineDate: p.deadlineDate,
    deadlineTime: p.deadlineTime || '18:00',
    priority: p.priority === 'Urgent' || p.priority === 'Client Critical' || p.priority === 'Rush' ? 'Urgent' : 'Normal',
    status: p.status,
    clientName: p.clientName,
    description: `Assigned: ${displayName} · Type: ${p.projectType || 'Project'}`,
    assignedTo: displayName,
    isCompleted: p.status === 'Completed',
  };
}

// 12. CONVERT DELIVERABLE TO DEADLINE ITEM
export function convertDeliverableToDeadlineItem(p: Project, del: ProjectDeliverable): DeadlineItem | null {
  if (!del.deadlineDate || del.isCompleted) return null;

  const designer = del.assignedDesignerName || p.customDisplayName || p.assignedDesignerName || 'Designer';

  return {
    id: `dl-del-${p.id}-${del.id}`,
    title: `${p.title} → ${del.title}`,
    type: 'task',
    referenceId: p.id,
    deadlineDate: del.deadlineDate,
    deadlineTime: del.deadlineTime || '18:00',
    priority: del.isRequired ? 'Urgent' : 'Normal',
    status: del.type,
    clientName: p.clientName,
    description: `Deliverable: ${del.title} (${del.type}) · Designer: ${designer}`,
    assignedTo: designer,
    isCompleted: del.isCompleted,
  };
}

// 13. PROJECT CODE GENERATOR
export function generateNextProjectCode(existing: Project[]): string {
  let highest = 0;
  existing.forEach((p) => {
    if (p.projectCode && p.projectCode.startsWith('PRJ-')) {
      const num = parseInt(p.projectCode.replace('PRJ-', ''), 10);
      if (!isNaN(num) && num > highest) highest = num;
    }
  });
  return `PRJ-${String(highest + 1).padStart(4, '0')}`;
}

// 14. NORMALIZATION FUNCTION FOR PROJECTS
export function normalizeProject(raw: any, index: number = 0): Project {
  const id = raw.id || `proj-${Date.now()}-${index}`;
  const total = Number(raw.totalAmount ?? raw.budget ?? 0);
  let got = Number(raw.amountGot ?? 0);

  if (raw.status === 'Completed' && got === 0 && total > 0) {
    got = total;
  }

  const toGet = Math.max(0, total - got);
  const paymentStatus: PaymentStatus =
    raw.paymentStatus || (got >= total && total > 0 ? 'Paid' : got > 0 ? 'Partially Paid' : 'Not Paid');

  const payments = raw.payments || (got > 0 ? [
    {
      id: `pay-${id}-1`,
      date: raw.startDate || raw.dueDate || '2026-09-01',
      amount: got,
      method: 'UPI',
      note: 'Initial payment recorded',
      recordedAt: '01 Sep 2026 · 10:00 AM',
    },
  ] : []);

  // Preserve user's deliverables array if already defined (including empty list)
  let deliverables: ProjectDeliverable[] = raw.deliverables;
  if (!Array.isArray(deliverables)) {
    if (raw.status === 'Completed') {
      deliverables = [
        { id: `del-${id}-1`, title: 'Concept Design & Initial Proof', type: 'Milestone', isRequired: true, isCompleted: true, completedAt: '12 Aug 2026 · 02:00 PM', orderIndex: 1 },
        { id: `del-${id}-2`, title: 'Client Review & Feedback', type: 'Review', isRequired: true, isCompleted: true, completedAt: '15 Aug 2026 · 04:30 PM', orderIndex: 2 },
        { id: `del-${id}-3`, title: 'Final Artwork & Color Calibration', type: 'Deliverable', isRequired: true, isCompleted: true, completedAt: '18 Aug 2026 · 11:15 AM', orderIndex: 3 },
        { id: `del-${id}-4`, title: 'Vector Master Files Handover', type: 'Handover', isRequired: true, isCompleted: true, completedAt: '20 Aug 2026 · 05:00 PM', orderIndex: 4 },
      ];
    } else {
      deliverables = [
        { id: `del-${id}-1`, title: 'Concept Design & Initial Proof', type: 'Milestone', isRequired: true, isCompleted: true, completedAt: '05 Sep 2026 · 03:20 PM', orderIndex: 1 },
        { id: `del-${id}-2`, title: 'Client Review & Feedback', type: 'Review', isRequired: true, isCompleted: false, deadlineDate: '2026-09-12', deadlineTime: '17:00', orderIndex: 2 },
        { id: `del-${id}-3`, title: 'Final Artwork Production', type: 'Deliverable', isRequired: true, isCompleted: false, deadlineDate: '2026-09-18', deadlineTime: '18:00', orderIndex: 3 },
        { id: `del-${id}-4`, title: 'Source File Handover', type: 'Handover', isRequired: true, isCompleted: false, deadlineDate: '2026-09-25', deadlineTime: '18:00', orderIndex: 4 },
      ];
    }
  }

  const history = raw.history || [
    {
      id: `hist-${id}-init`,
      timestamp: formatSystemTimestamp(new Date(raw.createdAt || Date.now())),
      action: 'Project created in Gizmo Workspace',
      note: `Initialized with budget of ₹${total.toLocaleString('en-IN')}`,
    },
  ];

  const hasDeadline = raw.hasDeadline !== undefined ? Boolean(raw.hasDeadline) : Boolean(raw.dueDate || raw.deadlineDate);

  // Designer Payment Tracking (Strictly separated from Client Payment)
  const designerFee =
    raw.designerFee !== undefined
      ? Number(raw.designerFee)
      : Math.round(total * 0.3); // default ~30% fee if not explicitly set
  const designerAmountPaid =
    raw.designerAmountPaid !== undefined
      ? Number(raw.designerAmountPaid)
      : raw.status === 'Completed'
      ? designerFee
      : got > 0
      ? Math.round(designerFee * 0.5)
      : 0;
  const designerAmountPending = Math.max(0, designerFee - designerAmountPaid);
  const designerPaymentStatus =
    raw.designerPaymentStatus ||
    (designerAmountPaid >= designerFee && designerFee > 0
      ? 'Paid'
      : designerAmountPaid > 0
      ? 'Partially Paid'
      : 'Not Paid');

  const designerPayments =
    raw.designerPayments ||
    (designerAmountPaid > 0
      ? [
          {
            id: `despay-${id}-1`,
            designerId: raw.assignedDesignerId || 'des-ahmed',
            designerName: raw.assignedDesignerName || 'Ahmed',
            workType: 'Project',
            workId: id,
            workTitle: raw.title || 'Project Work',
            date: raw.startDate || '2026-09-01',
            amount: designerAmountPaid,
            method: 'UPI',
            referenceNumber: `TXN-DES-${id.slice(-4)}`,
            notes: 'Advance milestone disbursement',
            recordedAt: '01 Sep 2026 · 11:00 AM',
          },
        ]
      : []);

  return {
    id,
    projectCode: raw.projectCode || `PRJ-${String(index + 1).padStart(4, '0')}`,
    title: raw.title || 'Untitled Project',
    clientId: raw.clientId || 'client-1',
    clientName: raw.clientName || 'Selected Client',
    clientBrand: raw.clientBrand || raw.clientName || '',
    clientPhone: raw.clientPhone || '',
    projectType: raw.projectType || raw.category || 'Branding',
    category: raw.category || raw.projectType || 'Branding',
    assignedDesignerId: raw.assignedDesignerId || 'des-ahmed',
    assignedDesignerName: raw.assignedDesignerName || 'Ahmed',
    customDisplayName: raw.customDisplayName || '',
    priority: raw.priority || 'Normal',
    startDate: raw.startDate || raw.createdAt ? raw.createdAt.split('T')[0] : '2026-09-01',
    hasDeadline,
    deadlineDate: raw.deadlineDate || raw.dueDate || '2026-09-30',
    deadlineTime: raw.deadlineTime || '18:00',
    dueDate: raw.dueDate || raw.deadlineDate || '2026-09-30',
    budget: total,
    totalAmount: total,
    amountGot: got,
    amountToGet: toGet,
    paymentStatus,
    payments,
    designerPaymentStructure: raw.designerPaymentStructure || 'Fixed Amount',
    designerFee,
    designerPercentage: raw.designerPercentage || (total > 0 ? Math.round((designerFee / total) * 100) : 30),
    designerAmountPaid,
    designerAmountPending,
    designerPaymentStatus,
    designerPayments,
    status: raw.status || 'In Progress',
    description: raw.description || '',
    deliverables,
    revisions: raw.revisions || [],
    files: (raw.files || []).map((f: any) => ({
      ...f,
      storagePath: f.storagePath || buildStoragePath('project', id, f.id),
    })),
    customFieldValues: raw.customFieldValues || {},
    history,
    internalNotes: raw.internalNotes || '',
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

// 15. DESIGNER WORKLOAD & FINANCIAL REPORT GENERATOR
export interface DesignerWorkloadItem {
  designerId: string;
  designerName: string;
  displayName: string;
  type: string;
  roleSpecialization?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  isActive: boolean;
  projectsCount: number;
  localWorksCount: number;
  pendingWorksCount: number;
  completedWorksCount: number;
  revisionsCount: number;
  waitingClientCount: number;
  inProgressCount: number;
  totalEarnings: number; // Total Designer Fee
  amountPaid: number; // Gizmo Paid to Designer
  amountPending: number; // Gizmo Pending to Designer
  paymentStatus: 'Paid' | 'Partially Paid' | 'Not Paid';
  itemsBreakdown: {
    id: string;
    code?: string;
    title: string;
    type: 'Project' | 'Local Work';
    clientId?: string;
    clientName: string;
    status: string;
    priority?: string;
    category?: string;
    workType?: string;
    totalAmount: number;
    designerFee: number;
    designerPaid: number;
    designerPending: number;
    paymentStatus: string;
    deadline?: string;
    deadlineTime?: string;
    customDisplayName?: string;
    assignedDesignerId?: string;
    assignedDesignerName?: string;
    designerPayments?: any[];
    history?: any[];
    deliverables?: any[];
  }[];
}

export function getDesignerWorkloadAndPayments(
  projects: Project[] = [],
  localWorks: any[] = [],
  customDesigners: any[] = []
): DesignerWorkloadItem[] {
  const designerMap = new Map<string, DesignerWorkloadItem>();

  const getOrCreateDesignerItem = (desId?: string, desName?: string): DesignerWorkloadItem => {
    let matched = customDesigners.find(c => c.id === desId || (desName && c.name.toLowerCase() === desName.toLowerCase()));
    const finalId = desId || matched?.id || (desName ? `des-${desName.toLowerCase().replace(/\s+/g, '-')}` : 'des-unassigned');
    const finalName = matched?.name || desName || 'Unassigned';

    if (!designerMap.has(finalId)) {
      designerMap.set(finalId, {
        designerId: finalId,
        designerName: finalName,
        displayName: finalName,
        type: matched?.type || 'External Designer',
        roleSpecialization: matched?.roleSpecialization || 'Design & Artwork',
        phone: matched?.phone,
        whatsapp: matched?.whatsapp || matched?.phone?.replace(/[^0-9]/g, ''),
        email: matched?.email,
        isActive: matched?.isActive !== false,
        projectsCount: 0,
        localWorksCount: 0,
        pendingWorksCount: 0,
        completedWorksCount: 0,
        revisionsCount: 0,
        waitingClientCount: 0,
        inProgressCount: 0,
        totalEarnings: 0,
        amountPaid: 0,
        amountPending: 0,
        paymentStatus: 'Paid',
        itemsBreakdown: [],
      });
    }
    return designerMap.get(finalId)!;
  };

  // Initialize from known designers list
  customDesigners.forEach((d) => {
    if (!d || !d.name) return;
    getOrCreateDesignerItem(d.id, d.name);
  });

  // Process Projects & Deliverables
  projects.forEach((p) => {
    const deliverables = p.deliverables || [];

    // Group deliverables by assigned designer
    const delivsByDesigner = new Map<string, { desId: string; desName: string; items: ProjectDeliverable[] }>();

    if (deliverables.length > 0) {
      deliverables.forEach((del) => {
        const delDesId = del.assignedDesignerId || p.assignedDesignerId || 'unassigned';
        if (delDesId === 'unassigned') return;

        const matched = customDesigners.find(c => c.id === delDesId);
        const delDesName = del.assignedDesignerName || matched?.name || p.assignedDesignerName || 'Designer';

        if (!delivsByDesigner.has(delDesId)) {
          delivsByDesigner.set(delDesId, { desId: delDesId, desName: delDesName, items: [] });
        }
        delivsByDesigner.get(delDesId)!.items.push(del);
      });
    }

    if (delivsByDesigner.size === 0 && p.assignedDesignerId && p.assignedDesignerId !== 'unassigned') {
      delivsByDesigner.set(p.assignedDesignerId, {
        desId: p.assignedDesignerId,
        desName: p.assignedDesignerName || 'Ahmed',
        items: [],
      });
    }

    delivsByDesigner.forEach(({ desId, desName, items }) => {
      const item = getOrCreateDesignerItem(desId, desName);
      item.projectsCount += 1;

      if (items.length > 0) {
        const completedCount = items.filter((d) => d.isCompleted || d.status === 'Completed').length;
        const pendingCount = items.length - completedCount;
        item.completedWorksCount += completedCount;
        item.pendingWorksCount += pendingCount;
      } else {
        if (p.status === 'Completed') {
          item.completedWorksCount += 1;
        } else {
          item.pendingWorksCount += 1;
        }
      }

      if (p.status === 'Revision') item.revisionsCount += 1;
      else if (p.status === 'Waiting for Client') item.waitingClientCount += 1;
      else if (p.status === 'In Progress') item.inProgressCount += 1;

      let fee = 0;
      items.forEach((d) => {
        if (d.designerFee) fee += Number(d.designerFee);
      });
      if (fee === 0) {
        fee = p.designerFee !== undefined ? Number(p.designerFee) : Math.round((p.totalAmount || 0) * 0.3);
      }

      const paid = p.designerAmountPaid !== undefined ? Number(p.designerAmountPaid) : (p.status === 'Completed' ? fee : 0);
      const pending = Math.max(0, fee - paid);

      item.totalEarnings += fee;
      item.amountPaid += paid;
      item.amountPending += pending;

      item.itemsBreakdown.push({
        id: p.id,
        code: p.projectCode,
        title: p.title,
        type: 'Project',
        clientId: p.clientId,
        clientName: p.clientName || 'Client',
        status: p.status || 'In Progress',
        priority: p.priority || 'Normal',
        category: p.category || p.projectType || 'General',
        workType: p.projectType || 'Project',
        totalAmount: p.totalAmount || 0,
        designerFee: fee,
        designerPaid: paid,
        designerPending: pending,
        paymentStatus: p.designerPaymentStatus || (paid >= fee && fee > 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Not Paid'),
        deadline: p.deadlineDate || p.dueDate,
        deadlineTime: p.deadlineTime,
        customDisplayName: p.customDisplayName,
        assignedDesignerId: desId,
        assignedDesignerName: desName,
        designerPayments: p.designerPayments || [],
        history: p.history || [],
        deliverables: items.length > 0 ? items : deliverables,
      });
    });
  });

  // Process Local Works if any
  localWorks.forEach((lw) => {
    const desName = lw.designer || lw.designerName || lw.assignedTo;
    if (!desName) return;
    const key = (lw.designerId || desName).toLowerCase().trim();

    let item = designerMap.get(key);
    if (!item) {
      // Find matching item by name
      for (const val of designerMap.values()) {
        if (val.designerName.toLowerCase() === desName.toLowerCase()) {
          item = val;
          break;
        }
      }
    }

    if (!item) {
      item = {
        designerId: lw.designerId || `des-${Date.now()}`,
        designerName: desName,
        displayName: desName,
        type: 'Portal Staff',
        roleSpecialization: 'Local Works',
        isActive: true,
        projectsCount: 0,
        localWorksCount: 0,
        pendingWorksCount: 0,
        completedWorksCount: 0,
        revisionsCount: 0,
        waitingClientCount: 0,
        inProgressCount: 0,
        totalEarnings: 0,
        amountPaid: 0,
        amountPending: 0,
        paymentStatus: 'Paid',
        itemsBreakdown: [],
      };
      designerMap.set(key, item);
    }

    item.localWorksCount += 1;
    if (lw.status === 'Completed' || lw.status === 'Delivered') {
      item.completedWorksCount += 1;
    } else {
      item.pendingWorksCount += 1;
    }

    if (lw.status === 'Revision') {
      item.revisionsCount += 1;
    } else if (lw.status === 'Waiting for Client') {
      item.waitingClientCount += 1;
    } else if (lw.status === 'In Progress') {
      item.inProgressCount += 1;
    }

    const lwAmount = Number(lw.amount) || Number(lw.total) || 0;
    const lwDesignerFee = Number(lw.designerFee) || Math.round(lwAmount * 0.35);
    const lwDesignerPaid = Number(lw.designerPaid) || (lw.status === 'Completed' ? lwDesignerFee : 0);
    const lwDesignerPending = Math.max(0, lwDesignerFee - lwDesignerPaid);

    item.totalEarnings += lwDesignerFee;
    item.amountPaid += lwDesignerPaid;
    item.amountPending += lwDesignerPending;

    item.itemsBreakdown.push({
      id: lw.id,
      code: lw.workNumber || lw.code,
      title: lw.title || lw.workTitle || 'Local Work',
      type: 'Local Work',
      clientId: lw.clientId,
      clientName: lw.customerName || lw.clientName || 'Local Client',
      status: lw.status || 'In Progress',
      priority: lw.priority || 'Normal',
      category: lw.category || 'Local Design',
      workType: lw.workType || 'Local Work',
      totalAmount: lwAmount,
      designerFee: lwDesignerFee,
      designerPaid: lwDesignerPaid,
      designerPending: lwDesignerPending,
      paymentStatus: lwDesignerPaid >= lwDesignerFee && lwDesignerFee > 0 ? 'Paid' : lwDesignerPaid > 0 ? 'Partially Paid' : 'Not Paid',
      deadline: lw.deadline || lw.deadlineDate || lw.date,
      deadlineTime: lw.deadlineTime,
      customDisplayName: lw.customDisplayName,
      assignedDesignerId: lw.designerId || lw.assignedTo,
      assignedDesignerName: desName,
      designerPayments: lw.designerPayments || [],
      history: lw.history || [],
      deliverables: [],
    });
  });

  // Calculate final statuses and return sorted list
  const results = Array.from(designerMap.values()).map((item) => {
    let paymentStatus: 'Paid' | 'Partially Paid' | 'Not Paid' = 'Paid';
    if (item.amountPending > 0 && item.amountPaid > 0) {
      paymentStatus = 'Partially Paid';
    } else if (item.amountPending > 0 && item.amountPaid === 0 && item.totalEarnings > 0) {
      paymentStatus = 'Not Paid';
    } else {
      paymentStatus = 'Paid';
    }
    return {
      ...item,
      paymentStatus,
    };
  });

  // Sort by active workload (projects + pending works)
  return results.sort((a, b) => (b.projectsCount + b.pendingWorksCount) - (a.projectsCount + a.pendingWorksCount));
}

// 16. CLIENT HUB & FINANCIAL SUMMARY
export interface ClientHubSummaryItem {
  client: Client;
  projectsCount: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalProjectValue: number;
  amountGot: number;
  amountToGet: number;
  invoicesCount: number;
  totalInvoiced: number;
  pendingPaymentsCount: number;
  status: 'Active' | 'Completed' | 'Pending Payment' | 'Inactive';
  projects: Project[];
  invoices: Invoice[];
}

export function getClientHubSummary(
  clients: Client[] = [],
  projects: Project[] = [],
  invoices: Invoice[] = []
): {
  items: ClientHubSummaryItem[];
  totalClients: number;
  activeClientsCount: number;
  totalProjectsCount: number;
  completedProjectsCount: number;
  totalProjectValue: number;
  totalAmountGot: number;
  totalAmountToGet: number;
  totalPendingPayments: number;
} {
  const items: ClientHubSummaryItem[] = clients.map((c) => {
    const clientProjects = projects.filter(
      (p) => p.clientId === c.id || (p.clientName && p.clientName.trim().toLowerCase() === c.name.trim().toLowerCase())
    );

    const clientInvoices = invoices.filter(
      (inv) =>
        (inv.billedTo && inv.billedTo.clientName && inv.billedTo.clientName.trim().toLowerCase() === c.name.trim().toLowerCase()) ||
        clientProjects.some((p) => p.id === inv.projectId)
    );

    let clientTotalVal = 0;
    let clientGot = 0;
    let clientToGet = 0;
    let activeCount = 0;
    let completedCount = 0;

    clientProjects.forEach((p) => {
      const fin = getProjectFinancials(p, clientInvoices);
      clientTotalVal += fin.totalAmount;
      clientGot += fin.amountGot;
      clientToGet += fin.amountToGet;

      if (p.status === 'Completed') {
        completedCount += 1;
      } else if (p.status !== 'Cancelled') {
        activeCount += 1;
      }
    });

    const activeInvoices = clientInvoices.filter((inv) => inv.status !== 'Draft' && inv.status !== 'Cancelled');
    const totalInvoiced = activeInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
    const pendingInvoices = activeInvoices.filter((inv) => inv.status === 'Pending' || inv.status === 'Partially Paid' || inv.status === 'Overdue');
    const pendingPaymentsCount = pendingInvoices.length + (clientToGet > 0 ? 1 : 0);

    let status: 'Active' | 'Completed' | 'Pending Payment' | 'Inactive' = 'Inactive';
    if (clientToGet > 0 || pendingInvoices.length > 0) {
      status = 'Pending Payment';
    } else if (activeCount > 0) {
      status = 'Active';
    } else if (completedCount > 0) {
      status = 'Completed';
    }

    return {
      client: c,
      projectsCount: clientProjects.length,
      activeProjectsCount: activeCount,
      completedProjectsCount: completedCount,
      totalProjectValue: clientTotalVal,
      amountGot: clientGot,
      amountToGet: clientToGet,
      invoicesCount: clientInvoices.length,
      totalInvoiced,
      pendingPaymentsCount,
      status,
      projects: clientProjects,
      invoices: clientInvoices,
    };
  });

  const totalClients = clients.length;
  const activeClientsCount = items.filter((i) => i.activeProjectsCount > 0 || i.status === 'Active' || i.status === 'Pending Payment').length;
  const totalProjectsCount = projects.length;
  const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length;
  const totalProjectValue = items.reduce((sum, i) => sum + i.totalProjectValue, 0);
  const totalAmountGot = items.reduce((sum, i) => sum + i.amountGot, 0);
  const totalAmountToGet = items.reduce((sum, i) => sum + i.amountToGet, 0);
  const totalPendingPayments = items.reduce((sum, i) => sum + (i.amountToGet > 0 ? 1 : 0), 0);

  return {
    items,
    totalClients,
    activeClientsCount,
    totalProjectsCount,
    completedProjectsCount,
    totalProjectValue,
    totalAmountGot,
    totalAmountToGet,
    totalPendingPayments,
  };
}

// 16. PROJECTS CONTROL CENTER OVERALL SUMMARY
export function getProjectsControlCenterSummary(projects: Project[] = []) {
  const now = new Date();
  const totalProjects = projects.length;

  let activeProjects = 0;
  let dueSoonProjects = 0;
  let overdueProjects = 0;
  let totalValue = 0;
  let totalGot = 0;
  let totalToGet = 0;
  let designerTotalCost = 0;
  let designerTotalPaid = 0;
  let designerTotalPending = 0;

  let pendingWorksCount = 0;
  let completedWorksCount = 0;
  let revisionsCount = 0;
  let waitingClientCount = 0;

  projects.forEach((p) => {
    const isCompleted = p.status === 'Completed';
    const isCancelled = p.status === 'Cancelled';

    if (!isCompleted && !isCancelled) {
      activeProjects += 1;
    }

    if (p.status === 'Revision') revisionsCount += 1;
    if (p.status === 'Waiting for Client') waitingClientCount += 1;

    // Deliverables stats
    const deliverables = p.deliverables || [];
    const compDel = deliverables.filter((d) => d.isCompleted).length;
    completedWorksCount += compDel;
    pendingWorksCount += (deliverables.length - compDel);

    // Deadline check
    if (!isCompleted && !isCancelled && p.hasDeadline && p.deadlineDate) {
      const dStatus = getProjectDeadlineStatus(p, now);
      if (dStatus.status === 'Overdue') {
        overdueProjects += 1;
      } else if (
        dStatus.status === 'Due Today' ||
        dStatus.status === 'Due Tomorrow' ||
        dStatus.status === 'Due Soon' ||
        dStatus.status === 'Due Now'
      ) {
        dueSoonProjects += 1;
      }
    }

    // Client Financials
    const pTotal = Number(p.totalAmount) || Number(p.budget) || 0;
    const pGot = Number(p.amountGot) || 0;
    const pToGet = Math.max(0, pTotal - pGot);

    totalValue += pTotal;
    totalGot += pGot;
    totalToGet += pToGet;

    // Designer Financials
    const dFee = p.designerFee !== undefined ? Number(p.designerFee) : Math.round(pTotal * 0.3);
    const dPaid = p.designerAmountPaid !== undefined ? Number(p.designerAmountPaid) : (isCompleted ? dFee : 0);
    const dPending = Math.max(0, dFee - dPaid);

    designerTotalCost += dFee;
    designerTotalPaid += dPaid;
    designerTotalPending += dPending;
  });

  // Estimated Remaining (Operational metric: Client Got - Designer Paid)
  const estimatedRemaining = Math.max(0, totalGot - designerTotalPaid);

  return {
    totalProjects,
    activeProjects,
    dueSoonProjects,
    overdueProjects,
    totalValue,
    totalGot,
    totalToGet,
    designerTotalCost,
    designerTotalPaid,
    designerTotalPending,
    estimatedRemaining,
    workload: {
      activeProjects,
      pendingWorksCount,
      completedWorksCount,
      revisionsCount,
      waitingClientCount,
    },
  };
}

// 15. LOCAL STORAGE ACCESSORS FOR CONFIGURABLE LISTS
export function loadProjectTypes(): ProjectTypeItem[] {
  return safeLoadItem<ProjectTypeItem[]>(PROJECT_STORAGE_KEYS.PROJECT_TYPES, defaultProjectTypes);
}

export function saveProjectTypes(types: ProjectTypeItem[]): void {
  safeSaveItem(PROJECT_STORAGE_KEYS.PROJECT_TYPES, types);
}

export function loadProjectPriorities(): ProjectPriorityItem[] {
  return safeLoadItem<ProjectPriorityItem[]>(PROJECT_STORAGE_KEYS.PROJECT_PRIORITIES, defaultProjectPriorities);
}

export function saveProjectPriorities(items: ProjectPriorityItem[]): void {
  safeSaveItem(PROJECT_STORAGE_KEYS.PROJECT_PRIORITIES, items);
}

export function loadDeliverableTypes(): DeliverableTypeItem[] {
  return safeLoadItem<DeliverableTypeItem[]>(PROJECT_STORAGE_KEYS.DELIVERABLE_TYPES, defaultDeliverableTypes);
}

export function saveDeliverableTypes(items: DeliverableTypeItem[]): void {
  safeSaveItem(PROJECT_STORAGE_KEYS.DELIVERABLE_TYPES, items);
}

export function loadProjectStatuses(): ProjectStatusItem[] {
  return safeLoadItem<ProjectStatusItem[]>(PROJECT_STORAGE_KEYS.PROJECT_STATUSES, defaultProjectStatuses);
}

export function saveProjectStatuses(items: ProjectStatusItem[]): void {
  safeSaveItem(PROJECT_STORAGE_KEYS.PROJECT_STATUSES, items);
}

export function loadProjectCustomFields(): ProjectCustomFieldDef[] {
  return safeLoadItem<ProjectCustomFieldDef[]>(PROJECT_STORAGE_KEYS.CUSTOM_FIELDS, defaultCustomFields);
}

export function saveProjectCustomFields(items: ProjectCustomFieldDef[]): void {
  safeSaveItem(PROJECT_STORAGE_KEYS.CUSTOM_FIELDS, items);
}

export function loadProjectTemplates(): ProjectTemplate[] {
  return safeLoadItem<ProjectTemplate[]>(PROJECT_STORAGE_KEYS.TEMPLATES, defaultProjectTemplates);
}

export function saveProjectTemplates(items: ProjectTemplate[]): void {
  safeSaveItem(PROJECT_STORAGE_KEYS.TEMPLATES, items);
}
