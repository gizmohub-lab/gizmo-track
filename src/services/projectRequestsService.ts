import {
  ProjectRequest,
  ProjectRequestStatus,
  ProjectRequestInternalStatus,
  ProjectRequestDisplayStatus,
  ProjectRequestActivity,
  Project,
  Client,
  ProjectDeliverable,
  ProjectFileAttachment,
  ClientNotification,
} from '../types';
import { safeLoadItem, safeSaveItem, PORTAL_STORAGE_KEYS } from './safeStorage';
import { registerVaultFile, getEntityVaultFiles } from './fileStorageVault';
import { formatExactDateTimeString } from '../utils/dateTimeUtils';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Standardizes status values to recommended internal keys:
 * pending_review | under_review | accepted | rejected | cancelled
 */
export function normalizeRequestStatus(status?: string): ProjectRequestInternalStatus {
  if (!status) return 'pending_review';
  const clean = String(status).toLowerCase().replace(/[\s-]+/g, '_').trim();
  if (clean === 'pending' || clean === 'pending_review' || clean === 'new') return 'pending_review';
  if (clean === 'under_review' || clean === 'in_review' || clean === 'reviewing') return 'under_review';
  if (clean === 'accepted' || clean === 'approved') return 'accepted';
  if (clean === 'rejected' || clean === 'declined') return 'rejected';
  if (clean === 'cancelled' || clean === 'canceled') return 'cancelled';
  return 'pending_review';
}

/**
 * Maps internal keys to user-facing display labels:
 * Pending Review | Under Review | Accepted | Rejected | Cancelled
 */
export function getRequestStatusDisplayLabel(status?: string): ProjectRequestDisplayStatus {
  const norm = normalizeRequestStatus(status);
  switch (norm) {
    case 'pending_review':
      return 'Pending Review';
    case 'under_review':
      return 'Under Review';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
  }
}

export const initialProjectRequests: ProjectRequest[] = [
  {
    id: 'req-1726090001',
    requestNumber: 'REQ-2026-001',
    clientName: 'Sayyid Munavvar Ali',
    companyName: 'Darul Hasaniyyah SNEC',
    email: 'darulhasaniyyah.snec@gmail.com',
    whatsapp: '+919845879017',
    services: ['Logo', 'Brand Identity', 'Poster'],
    projectTitle: 'Darul Hasaniyyah SNEC Arabic Calligraphy & Campus Identity',
    description:
      'Comprehensive institutional branding, Arabic calligraphy logotype, campus directional wayfinding graphics, letterheads, and official event banner templates for the upcoming convocation ceremony.',
    industry: 'Education',
    goals: [
      'Complete Rebrand & Identity Upgrade',
      'Elevate Visual Authority & Perception',
    ],
    targetAudience:
      'Scholars, international patrons, students, and academic institutions across Kerala and GCC',
    referenceLinks: 'https://hasaniyyah.edu.in/archive',
    customRequirements:
      'Gold foil compatibility required for certificate seals. Bilingual Arabic and English typography specifications.',
    timelineOption: '1-2-weeks',
    requestedDeadline: '2026-09-25',
    budgetRange: '₹50,00,000–₹1,00,000',
    attachments: [
      {
        id: 'att-snec-1',
        name: 'Darul_Hasaniyyah_Charter_Extract.pdf',
        size: '2.4 MB',
        type: 'application/pdf',
        category: 'Brief',
        uploadedAt: '2026-09-12T05:10:00.000Z',
      },
      {
        id: 'att-snec-2',
        name: 'Campus_Arch_Gate_Dimensions.jpg',
        size: '4.1 MB',
        type: 'image/jpeg',
        category: 'Design Reference',
        uploadedAt: '2026-09-12T05:12:00.000Z',
      },
    ],
    submittedAt: '2026-09-12T05:15:00.000Z',
    requestStatus: 'Pending Review',
    history: [
      {
        id: 'act-req-1',
        timestamp: '12 Sep 2026 · 10:45 AM',
        action: 'Client submitted project request via Start a Project portal',
        actor: 'Client',
      },
    ],
    createdAt: '2026-09-12T05:15:00.000Z',
    updatedAt: '2026-09-12T05:15:00.000Z',
  },
  {
    id: 'req-1726090002',
    requestNumber: 'REQ-2026-002',
    clientName: 'Er. Rajesh Kumar',
    companyName: 'Apex Developers Group',
    email: 'rajesh@apexdevelopers.in',
    whatsapp: '+919447123456',
    services: ['Video', '3D Motion', 'Printing'],
    projectTitle: 'Apex Prime Commercial Plaza Outdoor Launch Campaign',
    description:
      'Front-lit outdoor flex hoardings (60x20 ft) and 30-second 4K vertical motion graphic reel highlighting the grand luxury shopping atrium opening.',
    industry: 'Real Estate',
    goals: ['Drive Higher Conversion & Sales', 'Launch New Brand / Offering'],
    targetAudience:
      'High net-worth commercial retail investors and luxury retail franchises',
    timelineOption: '2-3-days',
    requestedDeadline: '2026-09-15',
    budgetRange: '₹1,00,000+',
    attachments: [
      {
        id: 'att-apex-1',
        name: 'Hoarding_Site_Photos_Highway.pdf',
        size: '8.2 MB',
        type: 'application/pdf',
        category: 'Brief',
        uploadedAt: '2026-09-12T07:20:00.000Z',
      },
    ],
    submittedAt: '2026-09-12T07:30:00.000Z',
    requestStatus: 'Under Review',
    reviewedAt: '2026-09-12T08:00:00.000Z',
    reviewedBy: 'Admin',
    history: [
      {
        id: 'act-req-2a',
        timestamp: '12 Sep 2026 · 01:00 PM',
        action: 'Client submitted project request via Start a Project portal',
        actor: 'Client',
      },
      {
        id: 'act-req-2b',
        timestamp: '12 Sep 2026 · 01:30 PM',
        action: 'Admin marked brief as Under Review & initiated print dimension check',
        actor: 'Admin',
      },
    ],
    createdAt: '2026-09-12T07:30:00.000Z',
    updatedAt: '2026-09-12T08:00:00.000Z',
  },
  {
    id: 'req-1726090003',
    requestNumber: 'REQ-2026-003',
    clientName: 'Nihal Rahman',
    companyName: 'Aura Artisan Roastery',
    email: 'nihal@auraroastery.com',
    whatsapp: '+919895012345',
    services: ['Packaging', 'Logo'],
    projectTitle: 'Aura Cold Brew Rigid Box & Biodegradable Pouch',
    description:
      'Eco-friendly craft packaging dielines with matte gold stamping and waterproof cold brew label system.',
    industry: 'Food & Beverage',
    goals: ['Launch New Brand / Offering'],
    targetAudience: 'Specialty coffee consumers and boutique cafes',
    timelineOption: '1-2-weeks',
    requestedDeadline: '2026-09-22',
    budgetRange: '₹25,000–₹50,000',
    attachments: [],
    submittedAt: '2026-09-11T09:00:00.000Z',
    requestStatus: 'Accepted',
    reviewedAt: '2026-09-11T10:00:00.000Z',
    reviewedBy: 'Admin',
    acceptedAt: '2026-09-11T11:00:00.000Z',
    acceptedBy: 'Admin',
    projectId: 'proj-104',
    projectCode: 'PRJ-104',
    history: [
      {
        id: 'act-req-3a',
        timestamp: '11 Sep 2026 · 02:30 PM',
        action: 'Client submitted project request via Start a Project portal',
        actor: 'Client',
      },
      {
        id: 'act-req-3b',
        timestamp: '11 Sep 2026 · 03:30 PM',
        action: 'Admin started review',
        actor: 'Admin',
      },
      {
        id: 'act-req-3c',
        timestamp: '11 Sep 2026 · 04:30 PM',
        action: 'Admin accepted request. Created Project PRJ-104',
        actor: 'Admin',
      },
    ],
    createdAt: '2026-09-11T09:00:00.000Z',
    updatedAt: '2026-09-11T11:00:00.000Z',
  },
];

export const initialClientNotifications: ClientNotification[] = [
  {
    id: 'c-notif-1',
    clientEmail: 'nihal@auraroastery.com',
    clientPhone: '+919895012345',
    title: '🎉 Project Request Accepted',
    message:
      'Gizmo has accepted your project request. Your project "Aura Cold Brew Rigid Box & Biodegradable Pouch" is now being processed by the Gizmo team.',
    type: 'accepted',
    requestId: 'req-1726090003',
    projectId: 'proj-104',
    projectCode: 'PRJ-104',
    timestamp: 'Yesterday',
    createdAt: '2026-09-11T11:00:00.000Z',
    isRead: false,
  },
];

/**
 * Load project requests with non-destructive fallback.
 */
export function loadProjectRequests(): ProjectRequest[] {
  const loaded = safeLoadItem<ProjectRequest[]>(
    PORTAL_STORAGE_KEYS.PROJECT_REQUESTS,
    initialProjectRequests
  );

  // Reconcile attachments with File Vault
  return loaded.map((req) => {
    const vaultFiles = getEntityVaultFiles('project-request', req.id);
    if (vaultFiles.length > 0) {
      const existingFileIds = new Set((req.attachments || []).map((a) => a.id));
      const missingFiles: ProjectFileAttachment[] = vaultFiles
        .filter((vf) => !existingFileIds.has(vf.fileId))
        .map((vf) => ({
          id: vf.fileId,
          name: vf.fileName,
          size: vf.fileSize,
          type: vf.fileType,
          category: vf.category,
          url: vf.url,
          uploadedAt: vf.uploadedAt,
          storagePath: vf.storagePath,
        }));
      if (missingFiles.length > 0) {
        req.attachments = [...(req.attachments || []), ...missingFiles];
      }
    }
    return req;
  });
}

/**
 * Write project request to persistent Firestore database.
 * Throws an error if Firestore write fails.
 */
export async function createProjectRequestInFirestore(
  request: ProjectRequest
): Promise<ProjectRequest> {
  const docId = request.id || `req-${Date.now()}`;
  const internalStatus = normalizeRequestStatus(request.requestStatus || (request as any).status);
  const displayStatus = getRequestStatusDisplayLabel(internalStatus);

  const docPayload = {
    id: docId,
    requestId: docId,
    requestNumber: request.requestNumber || `REQ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    clientId: request.clientId || '',
    clientName: request.clientName || '',
    companyName: request.companyName || '',
    email: request.email || '',
    whatsapp: request.whatsapp || '',
    projectTitle: request.projectTitle || '',
    services: request.services || [],
    description: request.description || '',
    requirements: request.customRequirements || request.requirements || '',
    customRequirements: request.customRequirements || request.requirements || '',
    industry: request.industry || '',
    goals: request.goals || [],
    targetAudience: request.targetAudience || '',
    referenceLinks: request.referenceLinks || '',
    timelineOption: request.timelineOption || 'standard',
    timeline: request.timelineOption || 'standard',
    requestedDeadline: request.requestedDeadline || '',
    budgetRange: request.budgetRange || '',
    budget: request.budgetRange || '',
    attachments: request.attachments || [],
    submittedAt: request.submittedAt || new Date().toISOString(),
    requestStatus: internalStatus, // Stored as normalized internal value e.g. "pending_review"
    status: internalStatus, // Dual storage for complete backward and forward compatibility
    displayStatus: displayStatus,
    history: request.history || [
      {
        id: `act-${Date.now()}`,
        timestamp: formatExactDateTimeString(new Date().toISOString()),
        action: 'Client submitted project request via Start a Project portal',
        actor: 'Client',
      },
    ],
    createdAt: request.createdAt || new Date().toISOString(),
    updatedAt: request.updatedAt || new Date().toISOString(),
  };

  // Log debug information as requested
  console.log('[REQUEST SUBMISSION]', {
    requestId: docPayload.requestId,
    clientId: docPayload.clientId,
    requestStatus: docPayload.requestStatus,
    collection: 'projectRequests',
  });

  try {
    const docRef = doc(db, 'projectRequests', docId);
    await setDoc(docRef, docPayload);

    // Also register files into File Storage Vault
    if (docPayload.attachments && docPayload.attachments.length > 0) {
      docPayload.attachments.forEach((att) => {
        registerVaultFile('project-request', docId, {
          id: att.id,
          name: att.name,
          size: att.size,
          type: att.type,
          category: att.category || 'Brief',
          url: att.url,
          uploadedAt: att.uploadedAt,
        });
      });
    }

    // Save to local cache as backup
    const current = loadProjectRequests();
    const existingIdx = current.findIndex((r) => r.id === docId);
    const fullObj: ProjectRequest = {
      ...request,
      ...docPayload,
      requestStatus: internalStatus,
    };
    if (existingIdx >= 0) {
      current[existingIdx] = fullObj;
    } else {
      current.unshift(fullObj);
    }
    saveProjectRequests(current);

    return fullObj;
  } catch (err) {
    console.error('Failed to write project request to Firestore:', err);
    throw err;
  }
}

/**
 * Real-time subscription to projectRequests collection in Firestore.
 */
export function subscribeToProjectRequests(
  callback: (requests: ProjectRequest[]) => void
): () => void {
  try {
    const reqCollection = collection(db, 'projectRequests');
    const q = query(reqCollection);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('[ADMIN REQUEST QUERY]', {
          collection: 'projectRequests',
          filters: 'all',
          resultsCount: snapshot.docs.length,
        });

        if (!snapshot.empty) {
          const remoteRequests: ProjectRequest[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            const normStatus = normalizeRequestStatus(data.requestStatus || data.status);
            return {
              id: docSnap.id,
              requestId: docSnap.id,
              requestNumber: data.requestNumber || 'REQ-UNKNOWN',
              clientId: data.clientId,
              clientName: data.clientName || 'Unknown Client',
              companyName: data.companyName,
              email: data.email || '',
              whatsapp: data.whatsapp || '',
              services: Array.isArray(data.services) ? data.services : [],
              projectTitle: data.projectTitle || 'Untitled Request',
              description: data.description || '',
              industry: data.industry,
              goals: Array.isArray(data.goals) ? data.goals : [],
              targetAudience: data.targetAudience,
              referenceLinks: data.referenceLinks,
              customRequirements: data.customRequirements || data.requirements,
              requirements: data.requirements || data.customRequirements,
              timelineOption: data.timelineOption || data.timeline || 'standard',
              timeline: data.timeline || data.timelineOption,
              requestedDeadline: data.requestedDeadline,
              budgetRange: data.budgetRange || data.budget || '',
              budget: data.budget || data.budgetRange,
              attachments: Array.isArray(data.attachments) ? data.attachments : [],
              submittedAt: data.submittedAt || data.createdAt || new Date().toISOString(),
              requestStatus: normStatus,
              status: normStatus,
              reviewedAt: data.reviewedAt,
              reviewedBy: data.reviewedBy,
              acceptedAt: data.acceptedAt,
              acceptedBy: data.acceptedBy,
              rejectionReason: data.rejectionReason,
              rejectedAt: data.rejectedAt,
              rejectedBy: data.rejectedBy,
              projectId: data.projectId,
              projectCode: data.projectCode,
              convertedProjectId: data.convertedProjectId || data.projectId,
              convertedProjectCode: data.convertedProjectCode || data.projectCode,
              history: Array.isArray(data.history) ? data.history : [],
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            };
          });

          // Merge with any existing local requests not yet in Firestore so existing data is preserved
          const remoteIds = new Set(remoteRequests.map((r) => r.id));
          const localOnlyRequests = loadProjectRequests().filter((r) => !remoteIds.has(r.id));
          const combinedRequests = [...remoteRequests, ...localOnlyRequests];

          // Sort descending by submittedAt so newest appears at top
          combinedRequests.sort((a, b) => {
            const timeA = new Date(a.submittedAt || a.createdAt || 0).getTime();
            const timeB = new Date(b.submittedAt || b.createdAt || 0).getTime();
            return timeB - timeA;
          });

          // Cache in local storage
          saveProjectRequests(combinedRequests);
          callback(combinedRequests);
        } else {
          // If Firestore collection is empty, load existing cached/initial requests
          const local = loadProjectRequests();
          local.sort((a, b) => {
            const timeA = new Date(a.submittedAt || a.createdAt || 0).getTime();
            const timeB = new Date(b.submittedAt || b.createdAt || 0).getTime();
            return timeB - timeA;
          });
          callback(local);
        }
      },
      (error) => {
        console.error('Error in subscribeToProjectRequests onSnapshot:', error);
        // Fallback to local storage
        const local = loadProjectRequests();
        callback(local);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to initialize subscribeToProjectRequests:', err);
    return () => {};
  }
}

/**
 * Updates a project request in Firestore.
 */
export async function updateProjectRequestInFirestore(
  requestId: string,
  updates: Partial<ProjectRequest>
): Promise<void> {
  try {
    const docRef = doc(db, 'projectRequests', requestId);
    const cleanUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.requestStatus) {
      const norm = normalizeRequestStatus(updates.requestStatus);
      cleanUpdates.requestStatus = norm;
      cleanUpdates.status = norm;
      cleanUpdates.displayStatus = getRequestStatusDisplayLabel(norm);
    }
    await setDoc(docRef, cleanUpdates, { merge: true });
  } catch (err) {
    console.error(`Failed to update projectRequest ${requestId} in Firestore:`, err);
  }
}

/**
 * Save project requests to local storage and sync attachments to vault.
 */
export function saveProjectRequests(requests: ProjectRequest[]): void {
  safeSaveItem(PORTAL_STORAGE_KEYS.PROJECT_REQUESTS, requests);

  // Register attachments in File Vault
  requests.forEach((req) => {
    if (req.attachments && req.attachments.length > 0) {
      req.attachments.forEach((att) => {
        registerVaultFile('project-request', req.id, {
          id: att.id,
          name: att.name,
          size: att.size,
          type: att.type,
          category: att.category || 'Brief',
          url: att.url,
          uploadedAt: att.uploadedAt,
        });
      });
    }
  });
}

/**
 * Load client notifications.
 */
export function loadClientNotifications(): ClientNotification[] {
  return safeLoadItem<ClientNotification[]>(
    PORTAL_STORAGE_KEYS.CLIENT_NOTIFICATIONS,
    initialClientNotifications
  );
}

/**
 * Save client notifications.
 */
export function saveClientNotifications(notifications: ClientNotification[]): void {
  safeSaveItem(PORTAL_STORAGE_KEYS.CLIENT_NOTIFICATIONS, notifications);
}

/**
 * Parse budget number estimate from string range.
 */
function parseEstimatedBudget(budgetRange: string): number {
  if (budgetRange.includes('₹1,00,000+')) return 100000;
  if (budgetRange.includes('₹50,000')) return 50000;
  if (budgetRange.includes('₹25,000')) return 25000;
  if (budgetRange.includes('₹10,000')) return 10000;
  if (budgetRange.includes('₹5,000')) return 5000;
  return 0;
}

/**
 * Normalizes a phone string for duplicate detection (e.g. +91 98458 79017 -> 9845879017).
 */
export function normalizePhoneForComparison(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // If starts with 91 and length 12, strip 91 country code for national match
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Checks existing clients to prevent creating duplicate clients.
 * Matches by email (case-insensitive) OR phone digits OR company/client name.
 */
export function findOrCreateClientRecord(
  request: ProjectRequest,
  existingClients: Client[]
): { client: Client; isNew: boolean; updatedClients: Client[] } {
  const reqEmail = (request.email || '').trim().toLowerCase();
  const reqPhone = normalizePhoneForComparison(request.whatsapp);
  const reqCompany = (request.companyName || '').trim().toLowerCase();
  const reqName = (request.clientName || '').trim().toLowerCase();

  // 1. Check existing clients
  const matched = existingClients.find((c) => {
    const cEmail = (c.email || '').trim().toLowerCase();
    const cPhone = normalizePhoneForComparison(c.whatsapp || c.phone);
    const cCompany = (c.company || '').trim().toLowerCase();
    const cName = (c.name || '').trim().toLowerCase();

    if (reqEmail && cEmail && reqEmail === cEmail) return true;
    if (reqPhone && cPhone && reqPhone === cPhone) return true;
    if (reqCompany && cCompany && reqCompany === cCompany) return true;
    if (reqName && cName && reqName === cName && (reqEmail || reqPhone)) return true;

    return false;
  });

  if (matched) {
    return { client: matched, isNew: false, updatedClients: existingClients };
  }

  // 2. Create one new client record
  const newClient: Client = {
    id: `client-${Date.now()}`,
    name: request.clientName.trim(),
    company: request.companyName?.trim() || undefined,
    email: request.email?.trim() || undefined,
    phone: request.whatsapp?.trim() || undefined,
    whatsapp: request.whatsapp?.trim() || undefined,
    createdAt: new Date().toISOString(),
    notes: `Created from Project Request ${request.requestNumber} (${request.projectTitle})`,
  };

  return {
    client: newClient,
    isNew: true,
    updatedClients: [newClient, ...existingClients],
  };
}

export interface AcceptProjectRequestResult {
  updatedRequest: ProjectRequest;
  newProject: Project;
  createdProject?: Project;
  client: Client;
  createdClient?: Client;
  notification: ClientNotification;
  updatedClients: Client[];
  isAlreadyAccepted: boolean;
}

/**
 * Accepts a project request idempotently.
 * Converts request to standard Project, links files, registers client, and dispatches client notification.
 */
export function acceptProjectRequestWorkflow({
  request,
  existingProjects,
  existingClients,
  adminUser = 'Admin',
  adminActorName,
  approvalOptions,
}: {
  request: ProjectRequest;
  existingProjects: Project[];
  existingClients: Client[];
  adminUser?: string;
  adminActorName?: string;
  approvalOptions?: {
    designerId?: string;
    designerName?: string;
    priority?: any;
    category?: string;
    customDeadline?: string;
    initialStatus?: any;
  };
}): AcceptProjectRequestResult {
  const actor = adminActorName || adminUser || 'Admin';
  const now = new Date();
  const nowIso = now.toISOString();
  const nowFormatted = formatExactDateTimeString(nowIso);

  // 1. Idempotency Check: if already accepted and project exists, return linked project
  const isAccepted = normalizeRequestStatus(request.requestStatus || (request as any).status) === 'accepted';
  if (isAccepted && request.projectId) {
    const existingProject = existingProjects.find((p) => p.id === request.projectId);
    if (existingProject) {
      const client =
        existingClients.find((c) => c.id === existingProject.clientId) ||
        existingClients[0];
      return {
        updatedRequest: request,
        newProject: existingProject,
        createdProject: undefined,
        client,
        createdClient: undefined,
        notification: {
          id: `cnotif-${Date.now()}`,
          clientEmail: request.email,
          clientPhone: request.whatsapp,
          title: '🎉 Project Request Accepted',
          message: `Your project "${request.projectTitle}" is currently in progress.`,
          type: 'accepted',
          requestId: request.id,
          projectId: existingProject.id,
          projectCode: existingProject.projectCode,
          timestamp: 'Just now',
          createdAt: nowIso,
          isRead: false,
        },
        updatedClients: existingClients,
        isAlreadyAccepted: true,
      };
    }
  }

  // 2. Link or create client
  const { client, isNew, updatedClients } = findOrCreateClientRecord(
    request,
    existingClients
  );

  // 3. Generate Project Code
  const projectCode = `PRJ-${String(existingProjects.length + 1).padStart(3, '0')}`;
  const projectId = `proj-${Date.now()}`;

  // 4. Construct Deliverables from requested services
  const deliverables: ProjectDeliverable[] = request.services.map((service, idx) => ({
    id: `deliv-${Date.now()}-${idx + 1}`,
    title: `${service} — Concept & Delivery`,
    type: 'Deliverable',
    isRequired: true,
    isCompleted: false,
    orderIndex: idx + 1,
    status: 'New',
    priority:
      approvalOptions?.priority ||
      (request.timelineOption === 'today' || request.timelineOption === 'tomorrow'
        ? 'Urgent'
        : 'Normal'),
  }));

  // 5. Build full description
  const fullDescription = [
    request.description,
    request.industry ? `Industry: ${request.industry}` : '',
    request.goals && request.goals.length > 0
      ? `Goals: ${request.goals.join(', ')}`
      : '',
    request.targetAudience ? `Target Audience: ${request.targetAudience}` : '',
    request.referenceLinks ? `Reference Links: ${request.referenceLinks}` : '',
    request.customRequirements
      ? `Client Requirements: ${request.customRequirements}`
      : '',
    `Budget Range: ${request.budgetRange}`,
    `Timeline: ${request.timelineOption}`,
    `Originating Request: ${request.requestNumber} (${request.id})`,
  ]
    .filter(Boolean)
    .join('\n\n');

  // 6. Transfer uploaded files to Project and register in File Storage Vault
  const transferredFiles: ProjectFileAttachment[] = (request.attachments || []).map(
    (att) => {
      const pFile: ProjectFileAttachment = {
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type,
        category: att.category || 'Brief',
        url: att.url,
        uploadedAt: att.uploadedAt,
        storagePath: `/projects/${projectId}/files/${att.id}`,
      };

      // Register with new project in persistent vault while keeping original references
      registerVaultFile('project', projectId, {
        id: pFile.id,
        name: pFile.name,
        size: pFile.size,
        type: pFile.type,
        category: pFile.category,
        url: pFile.url,
        uploadedAt: pFile.uploadedAt,
      });

      return pFile;
    }
  );

  const budgetEstimate = parseEstimatedBudget(request.budgetRange);
  const targetDueDate =
    approvalOptions?.customDeadline ||
    request.requestedDeadline ||
    new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 7. Create real Gizmo Project (fully featured)
  const newProject: Project = {
    id: projectId,
    projectCode,
    title: request.projectTitle.trim(),
    clientId: client.id,
    clientName: client.name,
    clientBrand: client.company || request.companyName || undefined,
    clientPhone: request.whatsapp || client.phone,
    projectType: request.services[0] || 'Branding',
    category: approvalOptions?.category || 'Design',
    priority:
      approvalOptions?.priority ||
      (request.timelineOption === 'today' || request.timelineOption === 'tomorrow'
        ? 'Urgent'
        : 'Normal'),
    hasDeadline: request.timelineOption !== 'flexible',
    deadlineDate: targetDueDate,
    deadlineTime: '18:00',
    dueDate: targetDueDate,
    budget: budgetEstimate,
    totalAmount: budgetEstimate,
    amountGot: 0,
    amountToGet: budgetEstimate,
    paymentStatus: 'Not Paid',
    payments: [],
    status: approvalOptions?.initialStatus || 'New',
    description: fullDescription,
    deliverables,
    revisions: [],
    files: transferredFiles,
    requestId: request.id,
    assignedDesignerId: approvalOptions?.designerId,
    assignedDesignerName: approvalOptions?.designerName,
    history: [
      {
        id: `hist-${Date.now()}-1`,
        timestamp: nowFormatted,
        action: `Project created from client request ${request.requestNumber} accepted by ${actor}.`,
      },
    ],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 8. Update request status to Accepted
  const updatedHistory: ProjectRequestActivity[] = [
    ...(request.history || []),
    {
      id: `act-${Date.now()}`,
      timestamp: nowFormatted,
      action: `${actor} accepted project request. Created official Project ${projectCode} (${newProject.title}).`,
      actor: 'Admin',
      note: `Assigned Project Code ${projectCode}`,
    },
  ];

  const updatedRequest: ProjectRequest = {
    ...request,
    clientId: client.id,
    requestStatus: 'accepted',
    status: 'accepted',
    acceptedAt: nowIso,
    acceptedBy: actor,
    reviewedAt: request.reviewedAt || nowIso,
    reviewedBy: request.reviewedBy || actor,
    projectId: newProject.id,
    projectCode: newProject.projectCode,
    convertedProjectId: newProject.id,
    convertedProjectCode: newProject.projectCode,
    history: updatedHistory,
    updatedAt: nowIso,
  };

  // Sync to Firestore asynchronously
  try {
    updateProjectRequestInFirestore(request.id, {
      requestStatus: 'accepted',
      status: 'accepted',
      acceptedAt: nowIso,
      acceptedBy: actor,
      reviewedAt: updatedRequest.reviewedAt,
      reviewedBy: updatedRequest.reviewedBy,
      projectId: newProject.id,
      projectCode: newProject.projectCode,
      convertedProjectId: newProject.id,
      convertedProjectCode: newProject.projectCode,
      history: updatedHistory,
    }).catch((e) => console.error('Error updating project request in Firestore:', e));

    setDoc(doc(db, 'projects', newProject.id), newProject).catch((e) =>
      console.error('Error saving accepted project to Firestore:', e)
    );

    if (isNew) {
      setDoc(doc(db, 'clients', client.id), client).catch((e) =>
        console.error('Error saving client to Firestore:', e)
      );
    }
  } catch (syncErr) {
    console.warn('Firestore sync failed during accept workflow:', syncErr);
  }

  // 9. Create Client Notification
  const clientNotification: ClientNotification = {
    id: `cnotif-${Date.now()}`,
    clientId: client.id,
    clientEmail: request.email,
    clientPhone: request.whatsapp,
    title: '🎉 Project Request Accepted',
    message: `Gizmo has accepted your project request. Your project "${request.projectTitle}" is now being processed by the Gizmo team.`,
    type: 'accepted',
    requestId: request.id,
    projectId: newProject.id,
    projectCode: newProject.projectCode,
    timestamp: 'Just now',
    createdAt: nowIso,
    isRead: false,
  };

  return {
    updatedRequest,
    newProject,
    createdProject: newProject,
    client,
    createdClient: isNew ? client : undefined,
    notification: clientNotification,
    updatedClients,
    isAlreadyAccepted: false,
  };
}

/**
 * Rejects a project request with an optional reason.
 */
export function rejectProjectRequestWorkflow({
  request,
  reason,
  adminUser = 'Admin',
  adminActorName,
}: {
  request: ProjectRequest;
  reason?: string;
  adminUser?: string;
  adminActorName?: string;
}): ProjectRequest {
  const actor = adminActorName || adminUser || 'Admin';
  const now = new Date();
  const nowIso = now.toISOString();
  const nowFormatted = formatExactDateTimeString(nowIso);

  const cleanReason = reason?.trim() || 'Timeline does not currently fit our production schedule.';

  const updatedHistory: ProjectRequestActivity[] = [
    ...(request.history || []),
    {
      id: `act-${Date.now()}`,
      timestamp: nowFormatted,
      action: `${actor} rejected project request.`,
      actor: 'Admin',
      note: cleanReason,
    },
  ];

  const updatedRequest: ProjectRequest = {
    ...request,
    requestStatus: 'rejected',
    status: 'rejected',
    rejectedAt: nowIso,
    rejectedBy: actor,
    rejectionReason: cleanReason,
    history: updatedHistory,
    updatedAt: nowIso,
  };

  updateProjectRequestInFirestore(request.id, {
    requestStatus: 'rejected',
    status: 'rejected',
    rejectedAt: nowIso,
    rejectedBy: actor,
    rejectionReason: cleanReason,
    history: updatedHistory,
  }).catch((err) => console.error('Error rejecting project request in Firestore:', err));

  const notification: ClientNotification = {
    id: `cnotif-${Date.now()}`,
    clientId: request.clientId,
    clientEmail: request.email,
    clientPhone: request.whatsapp,
    title: 'Project Request Update',
    message: `Your Gizmo project request for "${request.projectTitle}" was not accepted at this time: ${cleanReason}`,
    type: 'rejected',
    requestId: request.id,
    timestamp: 'Just now',
    createdAt: nowIso,
    isRead: false,
  };

  return updatedRequest;
}

/**
 * Marks request as Under Review.
 */
export function markProjectRequestUnderReviewWorkflow(
  param1: ProjectRequest | { request: ProjectRequest; adminUser?: string; adminActorName?: string },
  param2?: string
): ProjectRequest {
  const request = 'request' in param1 ? param1.request : param1;
  const actor =
    typeof param1 === 'object' && 'adminActorName' in param1
      ? param1.adminActorName || param1.adminUser || 'Admin'
      : param2 || 'Admin';

  const now = new Date();
  const nowIso = now.toISOString();
  const nowFormatted = formatExactDateTimeString(nowIso);

  const updatedHistory: ProjectRequestActivity[] = [
    ...(request.history || []),
    {
      id: `act-${Date.now()}`,
      timestamp: nowFormatted,
      action: `${actor} started technical & schedule review.`,
      actor: 'Admin',
    },
  ];

  const updatedRequest: ProjectRequest = {
    ...request,
    requestStatus: 'under_review',
    status: 'under_review',
    reviewedAt: nowIso,
    reviewedBy: actor,
    history: updatedHistory,
    updatedAt: nowIso,
  };

  updateProjectRequestInFirestore(request.id, {
    requestStatus: 'under_review',
    status: 'under_review',
    reviewedAt: nowIso,
    reviewedBy: actor,
    history: updatedHistory,
  }).catch((err) => console.error('Error marking project request under review in Firestore:', err));

  return updatedRequest;
}
