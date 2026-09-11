export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'Issued'
  | 'Pending'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

export type TaxType = 'CGST_SGST' | 'IGST';

export interface Client {
  id: string;
  name: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  gstin?: string;
  avatar?: string;
  notes?: string;
  createdAt: string;
}

export interface ProjectDeliverableRevision {
  id: string;
  revisionNo: number;
  date: string;
  note: string;
  designerName?: string;
  deliverableId?: string;
  createdAt: string;
}
export type ProjectRevision = ProjectDeliverableRevision;

export interface ProjectFileAttachment {
  id: string;
  name: string;
  url?: string;
  size?: string;
  type?: string;
  category?: string; // 'Brief' | 'Design Reference' | 'Asset' | 'Draft' | 'Final Handover' | 'Source File' | 'Other'
  deliverableId?: string; // Optional linkage to an individual deliverable
  uploadedAt: string;
}
export type ProjectFile = ProjectFileAttachment;

export interface ProjectDeliverable {
  id: string;
  title: string;
  type: string; // 'Deliverable' | 'Milestone' | 'Review' | 'Approval' | 'Payment' | 'Handover' | 'Revision' | 'Internal Task' | custom
  description?: string;
  isRequired: boolean; // Required vs Optional
  isCompleted: boolean; // ○ vs ✓
  completedAt?: string; // Auto system timestamp e.g. "11 Sep 2026 · 01:15 PM"
  completedBy?: string; // e.g. "Admin"
  reopenedAt?: string;
  reopenedBy?: string;
  hasDeadline?: boolean; // false = No Deadline
  deadlineDate?: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:mm
  assignedDesignerId?: string;
  assignedDesignerName?: string;
  customDisplayName?: string;
  priority?: string; // 'Low' | 'Normal' | 'High' | 'Urgent' | custom
  status?: string; // 'New' | 'In Progress' | 'Waiting for Client' | 'Revision' | 'Ready' | 'Completed' | 'Cancelled' | custom
  orderIndex: number;
  amount?: number; // Optional deliverable specific pricing (Client Amount)
  designerFee?: number; // Optional deliverable specific designer fee
  revisions?: ProjectDeliverableRevision[];
  attachments?: ProjectFileAttachment[];
  isArchived?: boolean;
}

export interface ProjectPaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string; // 'UPI' | 'Cash' | 'Bank Transfer' | 'GPay' | 'PhonePe' | 'Card' | 'Cheque' | custom
  status?: 'Received' | 'Pending' | 'Failed' | 'Cancelled' | string;
  reference?: string;
  referenceNumber?: string;
  note?: string;
  notes?: string;
  receivedBy?: string;
  recordedAt: string;
}

export interface DesignerPaymentRecord {
  id: string;
  designerId: string;
  designerName: string;
  workType: 'Project' | 'Local Work' | 'Custom';
  workId: string;
  workTitle: string;
  date: string;
  amount: number;
  method: string; // 'UPI' | 'Bank Transfer' | 'Cash' | 'GPay' | 'PhonePe' | custom
  reference?: string;
  referenceNumber?: string;
  notes?: string;
  recordedAt: string;
}

export type DesignerPaymentStatus = 'Not Paid' | 'Partially Paid' | 'Paid';

export interface ProjectHistoryItem {
  id: string;
  timestamp: string;
  action: string;
  note?: string;
}

export interface ProjectCustomFieldDef {
  id: string;
  name: string;
  type: 'text' | 'number' | 'dropdown' | 'date' | 'boolean';
  options?: string[];
  isRequired: boolean;
  isActive: boolean;
  defaultValue?: any;
}

export interface ProjectTypeItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  isSystem?: boolean;
}

export interface ProjectPriorityItem {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  color?: string;
}

export interface DeliverableTypeItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ProjectStatusItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  color?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  projectType: string;
  deliverables: Array<{
    title: string;
    type: string;
    description?: string;
    isRequired: boolean;
    orderIndex: number;
  }>;
  customFieldDefaults?: Record<string, any>;
}

export interface Project {
  id: string;
  projectCode?: string; // e.g. "PRJ-001"
  title: string;
  clientId: string;
  clientName: string;
  clientBrand?: string;
  clientPhone?: string;
  projectType: string; // 'Branding' | 'Motion' | 'Poster' | 'Print' | 'Website' | 'Logo' | 'Video' | 'Social Media' | 'Invitation' | 'Photography' | 'Packaging' | 'UI/UX' | 'Other' | custom
  category: string; // maintained for backward compatibility

  // Designer Assignment & Custom Display Name
  assignedDesignerId?: string; // Portal Staff, External Designer, Custom Designer, Unassigned
  assignedDesignerName?: string;
  customDisplayName?: string; // "Custom Display Name (This Project Only)" - e.g. Ahmed Designs

  priority: string; // 'Low' | 'Normal' | 'High' | 'Urgent' | 'Client Critical' | 'Rush' | 'VIP' | 'Internal' | custom

  // Dates & Schedule
  startDate?: string; // YYYY-MM-DD
  hasDeadline: boolean; // false = "No Deadline" (excluded from deadline alarms)
  deadlineDate?: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:mm
  dueDate: string; // backward compat (= deadlineDate || '')

  // Client Payment Tracking
  budget: number; // backward compat (= totalAmount)
  totalAmount: number; // Total Billed Amount (Client Money)
  amountGot: number; // Received from client
  amountToGet: number; // Auto calculated: totalAmount - amountGot
  invoicedAmount?: number; // Total amount invoiced through official invoices
  invoicesCount?: number;
  paymentStatus: PaymentStatus; // 'Not Paid' | 'Partially Paid' | 'Paid' | 'Overpaid'
  payments: ProjectPaymentRecord[];

  // Designer Payment Tracking (Gizmo to Designer Money - Strictly Separated)
  designerPaymentStructure?: 'Fixed Amount' | 'Percentage' | 'Per Deliverable' | 'Custom';
  designerFee?: number; // Total amount assigned/payable to designer
  designerPercentage?: number; // Optional percentage of project total (e.g. 25%)
  designerAmountPaid?: number; // Amount already paid to designer
  designerAmountPending?: number; // Amount still payable to designer: designerFee - designerAmountPaid
  designerPaymentStatus?: DesignerPaymentStatus; // 'Not Paid' | 'Partially Paid' | 'Paid'
  designerPayments?: DesignerPaymentRecord[];

  status: string; // 'New' | 'In Progress' | 'Waiting for Client' | 'Revision' | 'Ready' | 'Completed' | 'Cancelled' | custom
  description?: string;

  // Deliverables & Milestones
  deliverables: ProjectDeliverable[];

  // Revisions & Files
  revisions: ProjectDeliverableRevision[];
  files: ProjectFileAttachment[];

  // Custom Fields (Admin controlled)
  customFieldValues?: Record<string, any>;

  // Activity History & Internal Notes
  history: ProjectHistoryItem[];
  internalNotes?: string;

  createdAt: string;
  updatedAt?: string;
}

export type LocalWorkStatus =
  | 'New'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for Client'
  | 'Revision'
  | 'Ready'
  | 'Completed'
  | 'Cancelled'
  | 'Pending'
  | 'Delivered'
  | 'Invoiced';

export type LocalWorkPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type PaymentStatus =
  | 'Not Paid'
  | 'Partially Paid'
  | 'Paid'
  | 'Overpaid'
  | 'Pending'
  | 'Not Applicable';

export interface LocalWorkPaymentRecord {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  method?: 'UPI' | 'Cash' | 'Bank Transfer' | 'GPay' | 'PhonePe' | 'Card' | 'Other';
  note?: string;
  reference?: string;
  recordedAt?: string;
}

export interface LocalWorkAttachment {
  id: string;
  name: string;
  type: string;
  size?: string;
  category?: 'Design reference' | 'Client image' | 'Brief' | 'Final design' | 'Other';
  url?: string;
  uploadedAt: string;
}

export interface LocalWorkRevision {
  revisionNo: number;
  date: string;
  note?: string;
}

export interface LocalWorkHistoryItem {
  id: string;
  timestamp: string;
  action: string;
  note?: string;
}

export type DesignerType = 'Portal Staff' | 'External Designer';

export interface CustomDesigner {
  id: string;
  name: string;
  type: DesignerType;
  phone?: string;
  whatsapp?: string;
  email?: string;
  roleSpecialization?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface DesignCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface WorkTypeItem {
  id: string;
  name: string; // 'Poster' | 'Motion' | 'Other' | custom
  description?: string;
  isActive: boolean;
  isSystemDefault?: boolean;
  isSystem?: boolean;
}

export type LocalWorksSubTab = 'all-works' | 'categories' | 'designers' | 'settings';

export interface LocalWork {
  id: string;
  workId?: string; // e.g. "LW-0001"
  title: string;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  clientWhatsApp?: string;
  clientOrg?: string;
  clientLocation?: string;
  workType: string; // 'Poster' | 'Motion' | 'Other' or custom
  otherWorkTypeDetail?: string; // when 'Other' selected: Admin entered detail
  category?: string; // Design Work Category, distinct from workType
  totalAmount?: number; // The full amount charged for the work
  amount: number; // Maintained for backward compatibility (= totalAmount)
  amountGot?: number; // The amount already received
  amountToGet?: number; // Automatically calculated: Total Amount - Amount Got
  paymentStatus?: PaymentStatus; // Automatically calculated: Not Paid, Partially Paid, Paid, Overpaid
  paymentRecords?: LocalWorkPaymentRecord[]; // Ledger of received payments
  status: LocalWorkStatus;
  priority?: LocalWorkPriority;
  assignedTo?: string; // Primary Designer
  supportingDesigners?: string[]; // Optional supporting designer(s)
  date: string; // Received date YYYY-MM-DD
  receivedDate?: string;
  deadlineDate?: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:mm or 04:30 PM
  notes?: string;
  description?: string;
  attachments?: LocalWorkAttachment[];
  revisionCount?: number;
  revisions?: LocalWorkRevision[];
  history?: LocalWorkHistoryItem[];
  invoiceId?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  gstRate: number; // e.g. 0, 5, 12, 18, 28
  quantity: number;
  rate: number;
  amount: number; // quantity * rate
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface InvoiceHistoryItem {
  id: string;
  timestamp: string;
  action: string;
  note?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque';
  reference?: string;
  note?: string;
}

export interface BusinessProfile {
  businessName: string;
  tagline?: string;
  logoUrl?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  phone: string;
  email: string;
  gstin?: string;
  pan?: string;
}

export interface PaymentConfig {
  upiId: string;
  accountName: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  instructions?: string;
}

export interface SupplyInfo {
  countryOfSupply: string;
  placeOfSupply: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string; // e.g. A00002
  invoiceDate: string; // YYYY-MM-DD or readable
  dueDate: string;
  status: InvoiceStatus;
  
  billedBy: BusinessProfile;
  billedTo: {
    clientName: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
    phone?: string;
    email?: string;
    gstin?: string;
  };
  
  supplyInfo: SupplyInfo;
  items: InvoiceItem[];
  
  taxType: TaxType;
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
  
  receivedAmount: number;
  balanceAmount: number;
  payments: PaymentRecord[];
  
  paymentDetails: PaymentConfig;
  
  projectId?: string;
  projectTitle?: string;
  projectCode?: string;
  invoiceStage?: 'Full' | 'Advance' | 'Partial' | 'Final' | 'Deliverables' | 'Custom' | string;
  localWorkId?: string;
  localWorkTitle?: string;
  
  notes?: string;
  footerNote?: string;
  history: InvoiceHistoryItem[];
  
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSettings {
  businessProfile: BusinessProfile;
  numberingPrefix: string;
  startingNumber: number;
  autoNumbering: boolean;
  paymentConfig: PaymentConfig;
  defaultGstRate: number;
  defaultTaxType: TaxType;
  footerText: string;
  disclaimer: string;
}

export type ActiveTab = 'dashboard' | 'projects' | 'people' | 'local-works' | 'invoice';

export type AppRoute =
  | 'home'
  | 'services'
  | 'work'
  | 'about'
  | 'my-projects'
  | 'admin'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-projects'
  | 'admin-clients'
  | 'admin-local-works'
  | 'admin-invoices'
  | 'admin-invoices-create'
  | 'admin-settings';

export interface ResetOptions {
  projects: boolean;
  clients: boolean;
  localWorks: boolean;
  invoices: boolean;
  payments: boolean;
  deliverables: boolean;
  customOptions: boolean;
  dashboardData: boolean;
}

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'urgent' | 'deadline' | 'payment' | 'project' | 'info';
  targetRoute?: AppRoute;
  targetId?: string;
}

export type DeadlineUrgency = 'NORMAL' | 'APPROACHING' | 'URGENT' | 'DUE_NOW' | 'OVERDUE';

export interface DeadlineItem {
  id: string;
  title: string;
  type: 'project' | 'local-work' | 'order' | 'task' | 'invoice' | 'custom';
  referenceId?: string;
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // HH:mm
  priority?: 'Normal' | 'Urgent';
  status?: string;
  relatedUrl?: string;
  clientName?: string;
  description?: string;
  assignedTo?: string;
  isCompleted?: boolean;
}
