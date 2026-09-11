import { AppRoute, Project, LocalWork, Invoice, ProjectDeliverable } from '../types';

export type NotificationCategory =
  | 'new_projects'
  | 'project_updates'
  | 'deliverable_assignments'
  | 'deadline_alerts'
  | 'overdue_alerts'
  | 'payments'
  | 'invoices'
  | 'local_works'
  | 'designer_updates';

export interface GizmoNotification {
  id: string;
  recipientId: string; // 'admin' | designerId | clientId | 'all'
  recipientRole?: 'admin' | 'designer' | 'client';
  category: NotificationCategory;
  type: 'urgent' | 'deadline' | 'payment' | 'project' | 'info' | 'invoice' | 'deliverable' | 'local_work' | 'client' | 'system';
  title: string;
  message: string;
  description: string; // Maintain backward compatibility with AdminNotification.description
  relatedEntityType: 'project' | 'deliverable' | 'local-work' | 'payment' | 'invoice' | 'client' | 'system';
  relatedEntityId?: string;
  subEntityId?: string;
  timestamp: string; // e.g. "Just now", "10 mins ago", or "11 Sep 2026 · 04:30 PM"
  createdAt: string; // ISO string
  readAt?: string | null;
  isRead: boolean; // Maintain backward compatibility with read
  read?: boolean; // Backward compatibility alias
  targetRoute?: AppRoute;
}

export interface NotificationSettings {
  enableBrowserNotifications: boolean;
  newProjects: boolean;
  projectUpdates: boolean;
  deliverableAssignments: boolean;
  deadlineAlerts: boolean;
  overdueAlerts: boolean;
  payments: boolean;
  invoices: boolean;
  localWorks: boolean;
  designerUpdates: boolean;
  userRole: 'admin' | 'designer' | 'client';
  currentUserId?: string;
}

const STORAGE_KEY_NOTIFICATIONS = 'gizmo_notifications_v3';
const STORAGE_KEY_SETTINGS = 'gizmo_notification_settings_v3';
const STORAGE_KEY_SENT_KEYS = 'gizmo_sent_notification_keys_v3';

export const defaultNotificationSettings: NotificationSettings = {
  enableBrowserNotifications: true,
  newProjects: true,
  projectUpdates: true,
  deliverableAssignments: true,
  deadlineAlerts: true,
  overdueAlerts: true,
  payments: true,
  invoices: true,
  localWorks: true,
  designerUpdates: true,
  userRole: 'admin',
};

// Initial default seed notifications
export const initialGizmoNotifications: GizmoNotification[] = [
  {
    id: 'notif-seed-1',
    recipientId: 'admin',
    recipientRole: 'admin',
    category: 'deadline_alerts',
    type: 'urgent',
    title: 'Urgent: Flex Hoarding Deadline',
    message: 'Grand Opening Flex for Apex Developers is due in 3 hours.',
    description: 'Grand Opening Flex for Apex Developers is due in 3 hours.',
    relatedEntityType: 'local-work',
    relatedEntityId: 'LW-0001',
    timestamp: '15 mins ago',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isRead: false,
    read: false,
    targetRoute: 'admin-local-works',
  },
  {
    id: 'notif-seed-2',
    recipientId: 'admin',
    recipientRole: 'admin',
    category: 'payments',
    type: 'payment',
    title: 'Payment Received: Darul Hasaniyyah',
    message: 'Advance payment of ₹15,000 received for Ramadan Campaign.',
    description: 'Advance payment of ₹15,000 received for Ramadan Campaign.',
    relatedEntityType: 'payment',
    relatedEntityId: 'PRJ-001',
    timestamp: '1 hour ago',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isRead: false,
    read: false,
    targetRoute: 'admin-projects',
  },
  {
    id: 'notif-seed-3',
    recipientId: 'admin',
    recipientRole: 'admin',
    category: 'project_updates',
    type: 'project',
    title: 'Revision Requested on Motion Reel',
    message: 'Client submitted 2 revisions on Instagram 3D Launch Teaser.',
    description: 'Client submitted 2 revisions on Instagram 3D Launch Teaser.',
    relatedEntityType: 'project',
    relatedEntityId: 'PRJ-002',
    timestamp: '3 hours ago',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    read: false,
    targetRoute: 'admin-projects',
  },
  {
    id: 'notif-seed-4',
    recipientId: 'admin',
    recipientRole: 'admin',
    category: 'local_works',
    type: 'info',
    title: 'Production Queue Review',
    message: '4 graphic works scheduled for print proofing today.',
    description: '4 graphic works scheduled for print proofing today.',
    relatedEntityType: 'system',
    timestamp: 'Today, 9:30 AM',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    read: true,
    targetRoute: 'admin-local-works',
  },
];

// Helper: load notifications from localStorage
export function loadNotifications(): GizmoNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) return initialGizmoNotifications;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => ({
        ...item,
        message: item.message || item.description || '',
        description: item.description || item.message || '',
        isRead: item.isRead ?? item.read ?? false,
        read: item.read ?? item.isRead ?? false,
      }));
    }
    return initialGizmoNotifications;
  } catch (err) {
    console.error('Failed to load notifications:', err);
    return initialGizmoNotifications;
  }
}

// Helper: save notifications to localStorage
export function saveNotifications(notifications: GizmoNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

// Helper: load notification settings
export function loadNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return defaultNotificationSettings;
    return { ...defaultNotificationSettings, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load notification settings:', err);
    return defaultNotificationSettings;
  }
}

// Helper: save notification settings
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save notification settings:', err);
  }
}

// Helper: load sent notification keys (duplicate prevention)
export function loadSentNotificationKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SENT_KEYS);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    return new Set<string>();
  }
}

// Helper: record a sent notification key
export function markNotificationKeySent(key: string): void {
  try {
    const sent = loadSentNotificationKeys();
    sent.add(key);
    localStorage.setItem(STORAGE_KEY_SENT_KEYS, JSON.stringify(Array.from(sent)));
  } catch (err) {
    console.error('Failed to save sent notification key:', err);
  }
}

// Check browser notification permission status
export function getNotificationPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return registration;
  } catch (err) {
    console.warn('Service Worker registration skipped or failed:', err);
    return null;
  }
}

// Request browser notification permission
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Ensure SW is registered
      await registerServiceWorker();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

// Trigger outside-the-app browser notification using SW or Notification API
export async function sendOutsideBrowserNotification(options: {
  title: string;
  body: string;
  tag?: string;
  targetRoute?: AppRoute;
  relatedEntityId?: string;
  subEntityId?: string;
  notificationId?: string;
}): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const notificationData = {
    targetRoute: options.targetRoute || 'admin-dashboard',
    relatedEntityId: options.relatedEntityId || '',
    subEntityId: options.subEntityId || '',
    id: options.notificationId || `notif-${Date.now()}`,
  };

  try {
    // Try Service Worker registration showNotification first
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(options.title, {
          body: options.body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: options.tag || `gizmo-${Date.now()}`,
          data: notificationData,
          renotify: true,
          vibrate: [100, 50, 100],
        } as any);
        return true;
      }
    }

    // Fallback to standard Notification instance
    const notif = new Notification(options.title, {
      body: options.body,
      icon: '/pwa-192x192.png',
      tag: options.tag || `gizmo-${Date.now()}`,
      data: notificationData,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
      if (options.targetRoute && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('route', options.targetRoute);
        if (options.relatedEntityId) {
          url.searchParams.set('targetId', options.relatedEntityId);
        }
        window.history.pushState({}, '', url.toString());
        window.dispatchEvent(new CustomEvent('gizmo_navigate', { detail: notificationData }));
      }
    };

    return true;
  } catch (err) {
    console.error('Failed to trigger browser notification:', err);
    return false;
  }
}

// Master Dispatcher for creating notifications
export function dispatchGizmoNotification(
  payload: Omit<GizmoNotification, 'id' | 'createdAt' | 'timestamp' | 'isRead' | 'read'>,
  currentSettings?: NotificationSettings,
  currentNotifications?: GizmoNotification[],
  onUpdateState?: (updated: GizmoNotification[]) => void
): GizmoNotification | null {
  const settings = currentSettings || loadNotificationSettings();

  // Category filter check
  if (payload.category && settings[payload.category] === false) {
    return null;
  }

  // Role filter check
  if (payload.recipientRole && payload.recipientRole !== settings.userRole && payload.recipientRole !== 'admin') {
    return null;
  }

  const now = new Date();
  const newNotif: GizmoNotification = {
    ...payload,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    description: payload.message || payload.description,
    createdAt: now.toISOString(),
    timestamp: 'Just now',
    isRead: false,
    read: false,
  };

  const existingList = currentNotifications || loadNotifications();
  const updatedList = [newNotif, ...existingList];
  saveNotifications(updatedList);

  if (onUpdateState) {
    onUpdateState(updatedList);
  }

  // Trigger outside browser notification if enabled
  if (settings.enableBrowserNotifications && getNotificationPermissionState() === 'granted') {
    sendOutsideBrowserNotification({
      title: payload.title.startsWith('Gizmo') ? payload.title : `Gizmo Design — ${payload.title}`,
      body: payload.message,
      tag: `${payload.relatedEntityType}-${payload.relatedEntityId || Date.now()}`,
      targetRoute: payload.targetRoute,
      relatedEntityId: payload.relatedEntityId,
      subEntityId: payload.subEntityId,
      notificationId: newNotif.id,
    });
  }

  return newNotif;
}

// Automated Deadline Monitoring System with Duplicate Prevention
export function checkAndDispatchDeadlineAlerts(
  projects: Project[],
  localWorks: LocalWork[],
  invoices: Invoice[],
  settings: NotificationSettings,
  notifications: GizmoNotification[],
  onUpdateNotifications: (updated: GizmoNotification[]) => void
): void {
  if (!settings.deadlineAlerts && !settings.overdueAlerts) return;

  const sentKeys = loadSentNotificationKeys();
  const now = Date.now();

  // Helper to process a deadline item
  const evaluateDeadlineItem = (
    title: string,
    entityType: 'project' | 'deliverable' | 'local-work' | 'invoice',
    entityId: string,
    subEntityId: string | undefined,
    deadlineIsoOrDate: string,
    timeStr: string | undefined,
    clientOrInfoName: string,
    targetRoute: AppRoute,
    isCompleted: boolean
  ) => {
    if (isCompleted || !deadlineIsoOrDate) return;

    let deadlineMs = 0;
    if (deadlineIsoOrDate.includes('T')) {
      deadlineMs = new Date(deadlineIsoOrDate).getTime();
    } else {
      const timePart = timeStr || '23:59';
      deadlineMs = new Date(`${deadlineIsoOrDate}T${timePart}:00`).getTime();
    }

    if (isNaN(deadlineMs) || deadlineMs <= 0) return;

    const diffMs = deadlineMs - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    let stageKey: string | null = null;
    let notifTitle = '';
    let notifMessage = '';
    let isOverdueCategory = false;
    let notifType: GizmoNotification['type'] = 'deadline';

    if (diffMs < 0) {
      // Overdue
      stageKey = 'overdue';
      notifTitle = 'Overdue Alert';
      notifMessage = `"${title}" (${clientOrInfoName}) is overdue. Deadline was ${new Date(deadlineMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
      isOverdueCategory = true;
      notifType = 'urgent';
    } else if (diffHours <= 0.1) {
      // Due now (within 6 minutes)
      stageKey = 'now';
      notifTitle = 'Deadline Now';
      notifMessage = `"${title}" is due right now.`;
      notifType = 'urgent';
    } else if (diffHours <= 1) {
      // 1 hour before
      stageKey = '1h';
      notifTitle = 'Deadline in 1 Hour';
      notifMessage = `"${title}" is due in 1 hour (${new Date(deadlineMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`;
    } else if (diffHours <= 24) {
      // 24 hours before
      stageKey = '24h';
      notifTitle = 'Deadline Tomorrow';
      notifMessage = `"${title}" is due tomorrow at ${new Date(deadlineMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    } else if (diffHours <= 48) {
      // 48 hours before
      stageKey = '48h';
      notifTitle = 'Upcoming Deadline';
      notifMessage = `"${title}" is due in 2 days.`;
    }

    if (!stageKey) return;

    // Category setting check
    if (isOverdueCategory && !settings.overdueAlerts) return;
    if (!isOverdueCategory && !settings.deadlineAlerts) return;

    const key = `deadline:${entityType}:${entityId}:${subEntityId || 'main'}:${stageKey}`;

    if (sentKeys.has(key)) return; // Skip duplicate!

    // Record key sent
    markNotificationKeySent(key);

    dispatchGizmoNotification(
      {
        recipientId: 'admin',
        recipientRole: 'admin',
        category: isOverdueCategory ? 'overdue_alerts' : 'deadline_alerts',
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        description: notifMessage,
        relatedEntityType: entityType,
        relatedEntityId: entityId,
        subEntityId: subEntityId,
        targetRoute: targetRoute,
      },
      settings,
      notifications,
      onUpdateNotifications
    );
  };

  // 1. Evaluate Projects & Deliverables
  projects.forEach((prj) => {
    if (prj.status === 'Completed' || prj.status === 'Cancelled') return;

    if (prj.hasDeadline && prj.deadlineDate) {
      evaluateDeadlineItem(
        prj.title,
        'project',
        prj.id,
        undefined,
        prj.deadlineDate,
        prj.deadlineTime,
        prj.clientName,
        'admin-projects',
        false
      );
    }

    // Deliverables
    if (prj.deliverables && prj.deliverables.length > 0) {
      prj.deliverables.forEach((deliv) => {
        if (deliv.hasDeadline && deliv.deadlineDate && !deliv.isCompleted) {
          evaluateDeadlineItem(
            `${deliv.title} (${prj.title})`,
            'deliverable',
            prj.id,
            deliv.id,
            deliv.deadlineDate,
            deliv.deadlineTime,
            prj.clientName,
            'admin-projects',
            false
          );
        }
      });
    }
  });

  // 2. Evaluate Local Works
  localWorks.forEach((lw) => {
    if (lw.status === 'Completed' || lw.status === 'Cancelled' || lw.status === 'Delivered') return;

    if (lw.deadlineDate) {
      evaluateDeadlineItem(
        lw.title,
        'local-work',
        lw.id,
        undefined,
        lw.deadlineDate,
        lw.deadlineTime,
        lw.clientName,
        'admin-local-works',
        false
      );
    }
  });

  // 3. Evaluate Invoices (Overdue invoices)
  invoices.forEach((inv) => {
    if (inv.status === 'Paid' || inv.status === 'Cancelled') return;

    if (inv.dueDate) {
      const dueMs = new Date(inv.dueDate).getTime();
      if (!isNaN(dueMs) && dueMs < now) {
        const key = `deadline:invoice:${inv.id}:overdue`;
        if (!sentKeys.has(key)) {
          markNotificationKeySent(key);
          dispatchGizmoNotification(
            {
              recipientId: 'admin',
              recipientRole: 'admin',
              category: 'invoices',
              type: 'urgent',
              title: 'Invoice Overdue',
              message: `Invoice ${inv.invoiceNo} (${inv.billedTo.clientName}) is overdue. Balance: ₹${inv.balanceAmount.toLocaleString('en-IN')}`,
              description: `Invoice ${inv.invoiceNo} (${inv.billedTo.clientName}) is overdue. Balance: ₹${inv.balanceAmount.toLocaleString('en-IN')}`,
              relatedEntityType: 'invoice',
              relatedEntityId: inv.id,
              targetRoute: 'admin-invoices',
            },
            settings,
            notifications,
            onUpdateNotifications
          );
        }
      }
    }
  });
}
