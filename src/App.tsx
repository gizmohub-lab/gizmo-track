import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { AdminLayout } from './components/layout/AdminLayout';
import { HomeView } from './components/public/HomeView';
import { ServicesView } from './components/public/ServicesView';
import { WorkView } from './components/public/WorkView';
import { AboutView } from './components/public/AboutView';
import { MyProjectsView } from './components/public/MyProjectsView';
import { PublicFooter } from './components/public/PublicFooter';
import { StartProjectModal } from './components/public/StartProjectModal';
import { AdminLoginView } from './components/auth/AdminLoginView';
import { InvoiceDashboard } from './components/invoice/InvoiceDashboard';
import { InvoiceList } from './components/invoice/InvoiceList';
import { InvoiceForm } from './components/invoice/InvoiceForm';
import { InvoicePreviewModal } from './components/invoice/InvoicePreviewModal';
import { InvoiceSettingsModal } from './components/invoice/InvoiceSettingsModal';
import { PaymentModal } from './components/invoice/PaymentModal';
import { ShareModal } from './components/invoice/ShareModal';
import { ProductionDashboard } from './components/portal/ProductionDashboard';
import { ProjectsView } from './components/portal/ProjectsView';
import { ProjectRequestsView } from './components/portal/requests/ProjectRequestsView';
import { PeopleView } from './components/portal/PeopleView';
import { LocalWorksView } from './components/portal/LocalWorksView';
import { DeadlinesManagerModal } from './components/portal/DeadlinesManagerModal';
import { DeadlineDetailModal } from './components/portal/DeadlineDetailModal';
import { ProjectTypesSettingsModal } from './components/portal/projects/ProjectTypesSettingsModal';
import { NotificationPermissionBanner } from './components/notifications/NotificationPermissionBanner';
import { NotificationSettingsSection } from './components/notifications/NotificationSettingsSection';
import { NotesView } from './components/portal/notes/NotesView';
import { QuickNoteModal } from './components/portal/notes/QuickNoteModal';
import {
  loadProjectRequests,
  saveProjectRequests,
  subscribeToProjectRequests,
  normalizeRequestStatus,
  acceptProjectRequestWorkflow,
  rejectProjectRequestWorkflow,
  markProjectRequestUnderReviewWorkflow,
} from './services/projectRequestsService';
import {
  sumReceivedPayments,
  calculateAmountToGet,
  calculatePaymentStatus,
} from './utils/paymentUtils';
import {
  GizmoNotification,
  NotificationSettings,
  loadNotifications,
  saveNotifications,
  loadNotificationSettings,
  saveNotificationSettings,
  registerServiceWorker,
  checkAndDispatchDeadlineAlerts,
  dispatchGizmoNotification,
} from './utils/notificationSystem';
import {
  Invoice,
  Client,
  Project,
  LocalWork,
  InvoiceSettings,
  InvoiceStatus,
  PaymentRecord,
  DeadlineItem,
  AppRoute,
  AdminNotification,
  CustomDesigner,
  ProjectTypeItem,
  ProjectPriorityItem,
  ProjectStatusItem,
  DeliverableTypeItem,
  ProjectCustomFieldDef,
  ProjectTemplate,
  ResetOptions,
  Note,
  ProjectRequest,
} from './types';
import {
  loadInvoices,
  saveInvoices,
  loadClients,
  saveClients,
  loadProjects,
  saveProjects,
  loadLocalWorks,
  saveLocalWorks,
  loadSettings,
  saveSettings,
  loadDeadlines,
  saveDeadlines,
  loadCategories,
  saveCategories,
  loadDesigners,
  saveDesigners,
  loadNotes,
  saveNotes,
  loadNoteCategories,
  saveNoteCategories,
  initialClients,
  initialProjects,
  initialLocalWorks,
  initialInvoices,
  initialDeadlines,
  initialWorkCategories,
} from './data/mockData';
import { getFormattedTimestamp, formatINR } from './utils/formatters';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { convertLocalWorkToDeadlineItem, generateNextWorkId } from './utils/localWorkUtils';
import {
  loadProjectTypes,
  saveProjectTypes,
  loadProjectPriorities,
  saveProjectPriorities,
  loadProjectStatuses,
  saveProjectStatuses,
  loadDeliverableTypes,
  saveDeliverableTypes,
  loadProjectCustomFields,
  saveProjectCustomFields,
  loadProjectTemplates,
  saveProjectTemplates,
  convertProjectToDeadlineItem,
  normalizeProject,
  defaultProjectTypes,
  defaultProjectPriorities,
  defaultDeliverableTypes,
  defaultCustomFields,
  defaultProjectTemplates,
} from './utils/projectUtils';
import { ResetPortalModal } from './components/portal/projects/ResetPortalModal';
import { resolvePageTitle, setDocumentTitle } from './utils/pageTitle';

function getAppBasePath(): string {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;
  const knownSegments = ['/admin', '/services', '/work', '/about', '/my-projects'];
  for (const seg of knownSegments) {
    const idx = pathname.toLowerCase().indexOf(seg);
    if (idx > 0) {
      return pathname.substring(0, idx).replace(/\/$/, '');
    }
  }
  const clean = pathname.replace(/\/$/, '');
  const parts = clean.split('/').filter(Boolean);
  if (
    parts.length === 1 &&
    !['admin', 'services', 'work', 'about', 'my-projects'].includes(parts[0].toLowerCase())
  ) {
    return `/${parts[0]}`;
  }
  return '';
}

function pathToRoute(path: string): AppRoute {
  const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';
  if (cleanPath.includes('/admin/login')) return 'admin-login';
  if (cleanPath.includes('/admin/projects') || cleanPath.includes('/admin/orders')) return 'admin-projects';
  if (cleanPath.includes('/admin/clients') || cleanPath.includes('/admin/people')) return 'admin-clients';
  if (cleanPath.includes('/admin/local-works') || cleanPath.includes('/admin/works')) return 'admin-local-works';
  if (cleanPath.includes('/admin/notes') || cleanPath.includes('/admin/note')) return 'admin-notes';
  if (
    cleanPath.includes('/admin/invoices/create') ||
    cleanPath.includes('/admin/invoices/new') ||
    cleanPath.includes('/admin/invoice/create') ||
    cleanPath.includes('/admin/invoice/new')
  ) {
    return 'admin-invoices-create';
  }
  if (cleanPath.includes('/admin/invoices') || cleanPath.includes('/admin/invoice')) return 'admin-invoices';
  if (cleanPath.includes('/admin/settings')) return 'admin-settings';
  if (cleanPath.includes('/admin')) return 'admin-dashboard';
  if (cleanPath.includes('/services')) return 'services';
  if (cleanPath.includes('/work')) return 'work';
  if (cleanPath.includes('/about')) return 'about';
  if (cleanPath.includes('/my-projects') || cleanPath.includes('/projects-client')) return 'my-projects';
  return 'home';
}

function routeToPath(route: AppRoute): string {
  const basePath = getAppBasePath();
  let subPath = '/';
  switch (route) {
    case 'home':
      subPath = '/';
      break;
    case 'admin-login':
      subPath = '/admin/login';
      break;
    case 'services':
      subPath = '/services';
      break;
    case 'work':
      subPath = '/work';
      break;
    case 'about':
      subPath = '/about';
      break;
    case 'my-projects':
      subPath = '/my-projects';
      break;
    case 'admin':
    case 'admin-dashboard':
      subPath = '/admin/dashboard';
      break;
    case 'admin-projects':
      subPath = '/admin/projects';
      break;
    case 'admin-clients':
      subPath = '/admin/clients';
      break;
    case 'admin-local-works':
      subPath = '/admin/local-works';
      break;
    case 'admin-notes':
      subPath = '/admin/notes';
      break;
    case 'admin-invoices':
      subPath = '/admin/invoices';
      break;
    case 'admin-invoices-create':
      subPath = '/admin/invoices/create';
      break;
    case 'admin-settings':
      subPath = '/admin/settings';
      break;
    default:
      subPath = '/';
      break;
  }
  return basePath ? `${basePath}${subPath}` : subPath;
}

export default function App() {
  // Navigation State with Zero-Refresh Browser History Sync
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      return pathToRoute(window.location.pathname);
    }
    return 'home';
  });

  const [showStartProjectModal, setShowStartProjectModal] = useState(false);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');

  // Live Notifications State for Director CRM
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() =>
    loadNotificationSettings()
  );
  const [gizmoNotifications, setGizmoNotifications] = useState<GizmoNotification[]>(() =>
    loadNotifications()
  );

  // Core Data States with localStorage persistence
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadInvoices());
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [localWorks, setLocalWorks] = useState<LocalWork[]>(() => loadLocalWorks());
  const [categories, setCategories] = useState<string[]>(() => loadCategories());
  const [settings, setSettings] = useState<InvoiceSettings>(() => loadSettings());
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(() => loadDeadlines());

  // Project Customization Configuration States
  const [designers, setDesigners] = useState<CustomDesigner[]>(() => loadDesigners());
  const [projectTypes, setProjectTypes] = useState<ProjectTypeItem[]>(() => loadProjectTypes());
  const [projectPriorities, setProjectPriorities] = useState<ProjectPriorityItem[]>(() =>
    loadProjectPriorities()
  );
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatusItem[]>(() =>
    loadProjectStatuses()
  );
  const [deliverableTypes, setDeliverableTypes] = useState<DeliverableTypeItem[]>(() =>
    loadDeliverableTypes()
  );
  const [projectCustomFields, setProjectCustomFields] = useState<ProjectCustomFieldDef[]>(() =>
    loadProjectCustomFields()
  );
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>(() =>
    loadProjectTemplates()
  );

  // Project Requests Workflow States (synced in real-time with Firestore)
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>(() =>
    loadProjectRequests()
  );

  useEffect(() => {
    const unsubscribe = subscribeToProjectRequests((remoteRequests) => {
      setProjectRequests(remoteRequests);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Guarantee official Gizmo logo favicon is applied to browser tab
  useEffect(() => {
    const updateFavicon = () => {
      const link: HTMLLinkElement =
        document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/svg+xml';
      link.rel = 'shortcut icon';
      link.href = `/icon.svg?v=gizmo-02`;
      if (!document.head.contains(link)) {
        document.head.appendChild(link);
      }
    };
    updateFavicon();
  }, []);

  useEffect(() => {
    saveProjectRequests(projectRequests);
  }, [projectRequests]);

  const pendingProjectRequestsCount = projectRequests.filter((r) => {
    const norm = normalizeRequestStatus(r.requestStatus || (r as any).status);
    return norm === 'pending_review';
  }).length;

  // Notes System States
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [noteCategories, setNoteCategories] = useState<string[]>(() => loadNoteCategories());
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);

  // Sync Notes to Local Storage
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Sync Note Categories to Local Storage
  useEffect(() => {
    saveNoteCategories(noteCategories);
  }, [noteCategories]);

  // Notes Handlers
  const handleSaveNote = (updatedNote: Partial<Note> & { id: string }) => {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === updatedNote.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...updatedNote, updatedAt: new Date().toISOString() };
        return next;
      } else {
        return [updatedNote as Note, ...prev];
      }
    });
  };

  const handleDeleteNote = (noteToDelete: Note) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
  };

  const handleTogglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleToggleCheckItemNote = (noteId: string, itemId: string, completed: boolean) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId || !n.checklistItems) return n;
        const updatedChecklist = n.checklistItems.map((item) =>
          item.id === itemId ? { ...item, completed } : item
        );
        return { ...n, checklistItems: updatedChecklist };
      })
    );
  };

  const handleAddNoteCategory = (categoryName: string) => {
    if (!categoryName.trim() || noteCategories.includes(categoryName.trim())) return;
    setNoteCategories((prev) => [...prev, categoryName.trim()]);
  };

  const handleDeleteNoteCategory = (categoryName: string) => {
    setNoteCategories((prev) => prev.filter((c) => c !== categoryName));
  };

  // Deadline Modals State
  const [showDeadlinesModal, setShowDeadlinesModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<DeadlineItem | null>(null);
  const [showDeadlineDetailModal, setShowDeadlineDetailModal] = useState(false);

  // Invoicing Views & Modals State
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(() => {
    if (typeof window !== 'undefined') {
      return pathToRoute(window.location.pathname) === 'admin-invoices-create';
    }
    return false;
  });
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [shareInvoice, setShareInvoice] = useState<Invoice | null>(null);
  const [activeProjectIdForWorkspace, setActiveProjectIdForWorkspace] = useState<string | null>(null);
  const [activeProjectRequestId, setActiveProjectRequestId] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProjectSettingsModal, setShowProjectSettingsModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToastMessage, setResetToastMessage] = useState<string | null>(null);

  const handleConfirmReset = (options: ResetOptions) => {
    if (options.projects) {
      setProjects(initialProjects.map((p, idx) => normalizeProject(p, idx)));
    }
    if (options.clients) {
      setClients(initialClients);
    }
    if (options.localWorks) {
      setLocalWorks(initialLocalWorks);
    }
    if (options.invoices) {
      setInvoices(initialInvoices);
    }
    if (options.payments) {
      setInvoices((prev) =>
        prev.map((inv) => ({
          ...inv,
          status: 'Pending',
          paidAmount: 0,
          balanceAmount: inv.totalAmount,
          history: [],
        }))
      );
      setLocalWorks((prev) =>
        prev.map((w) => ({
          ...w,
          amountGot: 0,
          amountToGet: w.totalAmount || w.amount || 0,
          paymentStatus: 'Not Paid',
          paymentRecords: [],
        }))
      );
    }
    if (options.deliverables) {
      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          deliverables: p.deliverables?.map((d) => ({ ...d, status: 'pending' })) || [],
        }))
      );
    }
    if (options.customOptions) {
      setCategories(initialWorkCategories);
      setProjectTypes(defaultProjectTypes);
      setProjectPriorities(defaultProjectPriorities);
      setDeliverableTypes(defaultDeliverableTypes);
      setProjectCustomFields(defaultCustomFields);
      setProjectTemplates(defaultProjectTemplates);
    }
    if (options.dashboardData) {
      setGizmoNotifications([
        {
          id: 'notif-res-' + Date.now(),
          recipientId: 'admin',
          category: 'project_updates',
          type: 'info',
          title: 'System Reset Completed',
          message: 'Selected portal records were successfully reset to default state.',
          description: 'Selected portal records were successfully reset to default state.',
          relatedEntityType: 'system',
          timestamp: 'Just now',
          createdAt: new Date().toISOString(),
          isRead: false,
          read: false,
          targetRoute: 'admin-dashboard',
        },
      ]);
      setDeadlines(initialDeadlines);
    }

    setShowResetModal(false);
    setResetToastMessage('Reset completed successfully.');
    setTimeout(() => setResetToastMessage(null), 4000);
  };

  // Notification Persistence & Service Worker Lifecycle
  useEffect(() => {
    saveNotifications(gizmoNotifications);
  }, [gizmoNotifications]);

  useEffect(() => {
    saveNotificationSettings(notificationSettings);
  }, [notificationSettings]);

  useEffect(() => {
    // Register Service Worker
    registerServiceWorker();

    // Listen for custom navigation events triggered from notification clicks
    const handleGizmoNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.targetRoute) {
        navigate(customEvent.detail.targetRoute as AppRoute);
      }
    };

    // Listen for SW postMessages when clicking outside-app notifications
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GIZMO_NOTIFICATION_CLICK' && event.data.payload) {
        const { targetRoute, notificationId } = event.data.payload;
        if (notificationId) {
          handleMarkNotificationAsRead(notificationId);
        }
        if (targetRoute) {
          navigate(targetRoute as AppRoute);
        }
      }
    };

    window.addEventListener('gizmo_navigate', handleGizmoNavigate);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      window.removeEventListener('gizmo_navigate', handleGizmoNavigate);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, []);

  // Automated Deadline Monitoring Alarm System (runs every 60 seconds)
  useEffect(() => {
    const runDeadlineCheck = () => {
      checkAndDispatchDeadlineAlerts(
        projects,
        localWorks,
        invoices,
        notificationSettings,
        gizmoNotifications,
        (updated) => {
          setGizmoNotifications(updated);
        }
      );
    };

    runDeadlineCheck();
    const interval = setInterval(runDeadlineCheck, 60000);
    return () => clearInterval(interval);
  }, [projects, localWorks, invoices, notificationSettings]);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveLocalWorks(localWorks);
  }, [localWorks]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveDeadlines(deadlines);
  }, [deadlines]);

  useEffect(() => {
    saveDesigners(designers);
  }, [designers]);

  useEffect(() => {
    saveProjectTypes(projectTypes);
  }, [projectTypes]);

  useEffect(() => {
    saveProjectPriorities(projectPriorities);
  }, [projectPriorities]);

  useEffect(() => {
    saveProjectStatuses(projectStatuses);
  }, [projectStatuses]);

  useEffect(() => {
    saveDeliverableTypes(deliverableTypes);
  }, [deliverableTypes]);

  useEffect(() => {
    saveProjectCustomFields(projectCustomFields);
  }, [projectCustomFields]);

  useEffect(() => {
    saveProjectTemplates(projectTemplates);
  }, [projectTemplates]);

  // Synchronize LocalWorks & Projects to Deadlines so the Dashboard Upcoming Deadlines highlight card / alarm displays them
  useEffect(() => {
    setDeadlines((prevDeadlines) => {
      let changed = false;
      let nextDeadlines = [...prevDeadlines];

      // 1. Sync LocalWorks
      localWorks.forEach((work) => {
        const existingIdx = nextDeadlines.findIndex(
          (d) => d.referenceId === work.id || d.id === `dl-${work.id}`
        );
        const converted = convertLocalWorkToDeadlineItem(work);

        if (existingIdx !== -1) {
          const curr = nextDeadlines[existingIdx];
          if (
            curr.title !== converted.title ||
            curr.deadlineDate !== converted.deadlineDate ||
            curr.deadlineTime !== converted.deadlineTime ||
            curr.isCompleted !== converted.isCompleted ||
            curr.priority !== converted.priority ||
            curr.status !== converted.status
          ) {
            nextDeadlines[existingIdx] = {
              ...curr,
              ...converted,
            };
            changed = true;
          }
        } else {
          nextDeadlines.unshift(converted);
          changed = true;
        }
      });

      // 2. Sync Projects (Respect hasDeadline: true / false)
      projects.forEach((proj) => {
        const existingIdx = nextDeadlines.findIndex(
          (d) => d.referenceId === proj.id || d.id === `dl-proj-${proj.id}`
        );

        if (!proj.hasDeadline || !proj.deadlineDate) {
          // If project has no deadline, exclude from alarms / remove if previously there
          if (existingIdx !== -1) {
            nextDeadlines.splice(existingIdx, 1);
            changed = true;
          }
        } else {
          const converted = convertProjectToDeadlineItem(proj);
          if (converted) {
            if (existingIdx !== -1) {
              const curr = nextDeadlines[existingIdx];
              if (
                curr.title !== converted.title ||
                curr.deadlineDate !== converted.deadlineDate ||
                curr.deadlineTime !== converted.deadlineTime ||
                curr.isCompleted !== converted.isCompleted ||
                curr.priority !== converted.priority ||
                curr.status !== converted.status
              ) {
                nextDeadlines[existingIdx] = {
                  ...curr,
                  ...converted,
                };
                changed = true;
              }
            } else {
              nextDeadlines.push(converted);
              changed = true;
            }
          }
        }
      });

      return changed ? nextDeadlines : prevDeadlines;
    });
  }, [localWorks, projects]);

  // Project CRUD Handlers
  const handleAddProject = (newProj: Project) => {
    setProjects((prev) => [newProj, ...prev]);
    dispatchGizmoNotification(
      {
        recipientId: 'admin',
        recipientRole: 'admin',
        category: 'new_projects',
        type: 'project',
        title: 'New Project Added',
        message: `Project "${newProj.title}" created for ${newProj.clientName}.`,
        description: `Project "${newProj.title}" created for ${newProj.clientName}.`,
        relatedEntityType: 'project',
        relatedEntityId: newProj.id,
        targetRoute: 'admin-projects',
      },
      notificationSettings,
      gizmoNotifications,
      setGizmoNotifications
    );
  };

  const handleUpdateProject = (updatedProj: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
    dispatchGizmoNotification(
      {
        recipientId: 'admin',
        recipientRole: 'admin',
        category: 'project_updates',
        type: 'project',
        title: 'Project Updated',
        message: `Project "${updatedProj.title}" updated (Status: ${updatedProj.status}).`,
        description: `Project "${updatedProj.title}" updated (Status: ${updatedProj.status}).`,
        relatedEntityType: 'project',
        relatedEntityId: updatedProj.id,
        targetRoute: 'admin-projects',
      },
      notificationSettings,
      gizmoNotifications,
      setGizmoNotifications
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeadlines((prev) => prev.filter((d) => d.referenceId !== id && d.id !== `dl-proj-${id}`));
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  // Project Requests Workflow Handlers
  const handleAcceptProjectRequest = (
    requestId: string,
    approvalOptions: {
      designerId?: string;
      designerName?: string;
      priority?: any;
      category?: string;
      customDeadline?: string;
      initialStatus?: any;
    }
  ) => {
    const targetReq = projectRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const result = acceptProjectRequestWorkflow({
      request: targetReq,
      existingProjects: projects,
      existingClients: clients,
      approvalOptions,
      adminActorName: 'Creative Director (Admin)',
    });

    setProjectRequests((prev) =>
      prev.map((r) => (r.id === requestId ? result.updatedRequest : r))
    );

    if (result.createdProject) {
      setProjects((prev) => [result.createdProject!, ...prev]);
    }

    if (result.createdClient) {
      setClients((prev) => [result.createdClient!, ...prev]);
    }

    dispatchGizmoNotification(
      {
        recipientId: 'admin',
        recipientRole: 'admin',
        category: 'new_projects',
        type: 'project',
        title: 'Project Request Accepted',
        message: `Accepted request for "${result.updatedRequest.projectTitle}". Production code: ${
          result.createdProject?.projectCode || ''
        }`,
        description: `Commission request ${result.updatedRequest.requestNumber} for ${result.updatedRequest.clientName} converted into active project.`,
        relatedEntityType: 'project',
        relatedEntityId: result.createdProject?.id,
        targetRoute: 'admin-projects',
      },
      notificationSettings,
      gizmoNotifications,
      setGizmoNotifications
    );
  };

  const handleRejectProjectRequest = (requestId: string, reason?: string) => {
    const targetReq = projectRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const updated = rejectProjectRequestWorkflow({
      request: targetReq,
      reason,
      adminActorName: 'Creative Director (Admin)',
    });

    setProjectRequests((prev) =>
      prev.map((r) => (r.id === requestId ? updated : r))
    );

    dispatchGizmoNotification(
      {
        recipientId: 'admin',
        recipientRole: 'admin',
        category: 'project_updates',
        type: 'urgent',
        title: 'Project Request Declined',
        message: `Request ${targetReq.requestNumber} from ${targetReq.clientName} was declined.`,
        description: reason || 'Declined by Creative Director',
        relatedEntityType: 'project',
        relatedEntityId: targetReq.id,
        targetRoute: 'admin-project-requests',
      },
      notificationSettings,
      gizmoNotifications,
      setGizmoNotifications
    );
  };

  const handleMarkProjectRequestUnderReview = (requestId: string) => {
    const targetReq = projectRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const updated = markProjectRequestUnderReviewWorkflow(targetReq, 'Creative Director (Admin)');
    setProjectRequests((prev) =>
      prev.map((r) => (r.id === requestId ? updated : r))
    );
  };

  // Local Works CRUD Handlers
  const handleAddLocalWork = (newWork: LocalWork) => {
    setLocalWorks((prev) => [newWork, ...prev]);
    dispatchGizmoNotification(
      {
        recipientId: 'admin',
        recipientRole: 'admin',
        category: 'local_works',
        type: 'local_work',
        title: 'New Local Work Order',
        message: `Local Work "${newWork.title}" added for ${newWork.clientName}.`,
        description: `Local Work "${newWork.title}" added for ${newWork.clientName}.`,
        relatedEntityType: 'local-work',
        relatedEntityId: newWork.id,
        targetRoute: 'admin-local-works',
      },
      notificationSettings,
      gizmoNotifications,
      setGizmoNotifications
    );
  };

  const handleUpdateLocalWork = (updatedWork: LocalWork) => {
    setLocalWorks((prev) => prev.map((w) => (w.id === updatedWork.id ? updatedWork : w)));
  };

  const handleDeleteLocalWork = (id: string) => {
    setLocalWorks((prev) => prev.filter((w) => w.id !== id));
    setDeadlines((prev) => prev.filter((d) => d.referenceId !== id && d.id !== `dl-${id}`));
  };

  const handleDuplicateLocalWork = (work: LocalWork) => {
    const nextId = generateNextWorkId(localWorks);
    const duplicated: LocalWork = {
      ...work,
      id: `lw-${Date.now()}`,
      workId: nextId,
      title: `${work.title} (Copy)`,
      status: 'New',
      revisionCount: 0,
      revisions: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: `10 Sep 2026 · 11:35 AM`,
          action: `Duplicated from ${work.workId || work.id}`,
        },
      ],
    };
    setLocalWorks((prev) => [duplicated, ...prev]);
  };

  const handleImportWorks = (newWorks: LocalWork[]) => {
    setLocalWorks((prev) => [...newWorks, ...prev]);
  };

  const handleSaveCategories = (newCategories: string[]) => {
    setCategories(newCategories);
  };

  const pendingLocalWorksCount = localWorks.filter(
    (w) => w.status !== 'Completed' && w.status !== 'Cancelled'
  ).length;

  // Navigation & History Sync Engine
  const navigate = (route: AppRoute, replace = false) => {
    setCurrentRoute(route);
    if (route === 'admin-invoices-create') {
      setIsCreatingInvoice(true);
    } else if (route !== 'admin-invoices') {
      setIsCreatingInvoice(false);
      setEditingInvoice(null);
    }
    const targetPath = routeToPath(route);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ route }, '', targetPath);
      } else {
        window.history.pushState({ route }, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const route = pathToRoute(window.location.pathname);
      setCurrentRoute(route);
      if (route === 'admin-invoices-create') {
        setIsCreatingInvoice(true);
      } else if (route === 'admin-invoices') {
        setIsCreatingInvoice(false);
        setEditingInvoice(null);
      } else {
        setIsCreatingInvoice(false);
        setEditingInvoice(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Centralized dynamic browser tab title management
  useEffect(() => {
    const activeProject = activeProjectIdForWorkspace
      ? projects.find((p) => p.id === activeProjectIdForWorkspace)
      : null;

    const title = resolvePageTitle({
      route: currentRoute,
      projectName: activeProject?.name || null,
      isStartProjectOpen: showStartProjectModal,
    });
    setDocumentTitle(title);
  }, [currentRoute, showStartProjectModal, activeProjectIdForWorkspace, projects]);

  const handleMarkNotificationAsRead = (id: string) => {
    setGizmoNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true, readAt: new Date().toISOString() } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setGizmoNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, read: true, readAt: new Date().toISOString() }))
    );
  };

  // Deadline Operations
  const handleAddDeadline = (newDl: DeadlineItem) => {
    setDeadlines([newDl, ...deadlines]);
  };

  const handleUpdateDeadline = (updated: DeadlineItem) => {
    setDeadlines(deadlines.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleDeleteDeadline = (id: string) => {
    setDeadlines(deadlines.filter((d) => d.id !== id));
  };

  const handleToggleCompleteDeadline = (id: string) => {
    setDeadlines(
      deadlines.map((d) =>
        d.id === id ? { ...d, isCompleted: !d.isCompleted } : d
      )
    );
  };

  const handleOpenDeadlineDetails = (deadline: DeadlineItem) => {
    setSelectedDeadline(deadline);
    setShowDeadlineDetailModal(true);
  };

  const handleStartEditFromDetail = (deadline: DeadlineItem) => {
    setShowDeadlineDetailModal(false);
    setShowDeadlinesModal(true);
  };

  // Invoice Actions
  const handleStartCreateInvoice = () => {
    setEditingInvoice(null);
    setIsCreatingInvoice(true);
    navigate('admin-invoices-create');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsCreatingInvoice(true);
    setPreviewInvoice(null);
    navigate('admin-invoices-create');
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const duplicated: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      receivedAmount: 0,
      balanceAmount: invoice.grandTotal,
      payments: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: getFormattedTimestamp(),
          action: 'Invoice Duplicated',
          note: `Duplicated from ${invoice.invoiceNo || 'Draft'}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingInvoice(duplicated);
    setIsCreatingInvoice(true);
    setPreviewInvoice(null);
    navigate('admin-invoices-create');
  };

  const handleSaveInvoice = (invoicePayload: Invoice, isDraft: boolean) => {
    if (editingInvoice) {
      // Update existing
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoicePayload.id ? invoicePayload : inv))
      );
    } else {
      // Create new
      setInvoices((prev) => [invoicePayload, ...prev]);
    }
    setIsCreatingInvoice(false);
    setEditingInvoice(null);
    navigate('admin-invoices');
    // Show newly created invoice in preview modal
    setPreviewInvoice(invoicePayload);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
      if (previewInvoice?.id === invoiceId) {
        setPreviewInvoice(null);
      }
    }
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    const targetInvoice = invoices.find((i) => i.id === invoiceId);

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const updated: Invoice = {
            ...inv,
            status: 'Paid',
            receivedAmount: inv.grandTotal,
            balanceAmount: 0,
            history: [
              ...inv.history,
              {
                id: `hist-${Date.now()}`,
                timestamp: getFormattedTimestamp(),
                action: 'Marked as Fully Paid',
                note: `Settled in full: ${formatINR(inv.grandTotal)}`,
              },
            ],
            updatedAt: new Date().toISOString(),
          };
          if (previewInvoice?.id === invoiceId) {
            setPreviewInvoice(updated);
          }
          return updated;
        }
        return inv;
      })
    );

    if (targetInvoice?.projectId) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === targetInvoice.projectId) {
            const tot = Number(p.totalAmount ?? p.budget ?? 0);
            return {
              ...p,
              amountGot: tot,
              amountToGet: 0,
              paymentStatus: 'Paid',
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
    }

    if (targetInvoice?.localWorkId) {
      setLocalWorks((prev) =>
        prev.map((lw) => {
          if (lw.id === targetInvoice.localWorkId) {
            const tot = Number(lw.totalAmount ?? lw.amount ?? 0);
            return {
              ...lw,
              amountGot: tot,
              amountToGet: 0,
              paymentStatus: 'Paid',
            };
          }
          return lw;
        })
      );
    }
  };

  const handleRecordPayment = (
    invoiceId: string,
    amount: number,
    record: PaymentRecord
  ) => {
    const targetInvoice = invoices.find((i) => i.id === invoiceId);

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newReceived = (inv.receivedAmount || 0) + amount;
          const newBalance = Math.max(0, inv.grandTotal - newReceived);
          let newStatus: InvoiceStatus = inv.status;

          if (newBalance <= 0) {
            newStatus = 'Paid';
          } else if (newReceived > 0) {
            newStatus = 'Partially Paid';
          }

          const updated: Invoice = {
            ...inv,
            receivedAmount: newReceived,
            balanceAmount: newBalance,
            status: newStatus,
            payments: [...(inv.payments || []), record],
            history: [
              ...inv.history,
              {
                id: `hist-${Date.now()}`,
                timestamp: getFormattedTimestamp(),
                action: `Payment recorded (${record.method})`,
                note: `Received: ${formatINR(amount)} via ${record.method}${
                  record.reference ? ` (Ref: ${record.reference})` : ''
                }`,
              },
            ],
            updatedAt: new Date().toISOString(),
          };
          if (previewInvoice?.id === invoiceId) {
            setPreviewInvoice(updated);
          }
          return updated;
        }
        return inv;
      })
    );

    if (targetInvoice?.projectId) {
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id === targetInvoice.projectId) {
            const newPayments = [
              ...(proj.payments || []),
              {
                id: record.id || `pay-${Date.now()}`,
                date: record.date || new Date().toISOString().split('T')[0],
                amount: amount,
                method: record.method || 'Bank Transfer',
                status: 'Received',
                reference: record.reference,
                note: record.note || 'Payment recorded via Invoice',
                recordedAt: getFormattedTimestamp(),
              },
            ];
            const numTotal = Number(proj.totalAmount ?? proj.budget ?? 0);
            const newGot = sumReceivedPayments(newPayments);
            const newToGet = calculateAmountToGet(numTotal, newGot);
            const newPayStatus = calculatePaymentStatus(numTotal, newGot);
            return {
              ...proj,
              amountGot: newGot,
              amountToGet: newToGet,
              paymentStatus: newPayStatus,
              payments: newPayments,
              updatedAt: new Date().toISOString(),
            };
          }
          return proj;
        })
      );
    }

    if (targetInvoice?.localWorkId) {
      setLocalWorks((prev) =>
        prev.map((lw) => {
          if (lw.id === targetInvoice.localWorkId) {
            const lwTotal = Number(lw.totalAmount ?? lw.amount ?? 0);
            const newGot = (Number(lw.amountGot) || 0) + amount;
            const newToGet = Math.max(0, lwTotal - newGot);
            const newPayStatus = calculatePaymentStatus(lwTotal, newGot);
            const newRecords = [
              ...(lw.paymentRecords || []),
              {
                id: record.id || `pr-${Date.now()}`,
                amount: amount,
                date: record.date || new Date().toISOString().split('T')[0],
                method: record.method || 'UPI',
                reference: record.reference,
                note: record.note || 'Payment recorded via Invoice',
              },
            ];
            return {
              ...lw,
              amountGot: newGot,
              amountToGet: newToGet,
              paymentStatus: newPayStatus,
              paymentRecords: newRecords,
            };
          }
          return lw;
        })
      );
    }
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    await generateInvoicePDF(invoice);
  };

  const handleRecordDesignerPayment = (payment: {
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
  }) => {
    if (payment.workType === 'Project' && payment.workId) {
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id === payment.workId) {
            const currentPaid = Number(proj.designerAmountPaid || 0);
            const newPaid = currentPaid + payment.amount;
            const fee = Number(proj.designerFee !== undefined ? proj.designerFee : Math.round((proj.totalAmount || 0) * 0.3));
            const newPending = Math.max(0, fee - newPaid);
            const newStatus = newPending === 0 && fee > 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Not Paid';
            return {
              ...proj,
              designerAmountPaid: newPaid,
              designerAmountPending: newPending,
              designerPaymentStatus: newStatus as any,
              designerPayments: [
                ...(proj.designerPayments || []),
                {
                  id: `despay-${Date.now()}`,
                  designerId: payment.designerId,
                  designerName: payment.designerName,
                  workType: 'Project',
                  workId: proj.id,
                  workTitle: proj.title,
                  date: payment.date,
                  amount: payment.amount,
                  method: payment.method,
                  referenceNumber: payment.referenceNumber,
                  notes: payment.notes,
                  recordedAt: getFormattedTimestamp(),
                },
              ],
              history: [
                ...(proj.history || []),
                {
                  id: `hist-${Date.now()}`,
                  timestamp: getFormattedTimestamp(),
                  action: `Paid Designer ₹${payment.amount.toLocaleString('en-IN')}`,
                  note: `Disbursed to ${payment.designerName} via ${payment.method}${payment.referenceNumber ? ` (Ref: ${payment.referenceNumber})` : ''}`,
                },
              ],
            };
          }
          return proj;
        })
      );
    } else if (payment.workType === 'Local Work' && payment.workId) {
      setLocalWorks((prev) =>
        prev.map((lw) => {
          if (lw.id === payment.workId) {
            const currentPaid = Number(lw.designerPaid || 0);
            const newPaid = currentPaid + payment.amount;
            const lwTot = Number(lw.amount || lw.total || 0);
            const fee = Number(lw.designerFee || Math.round(lwTot * 0.35));
            const newPending = Math.max(0, fee - newPaid);
            const newStatus = newPending === 0 && fee > 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Pending';
            return {
              ...lw,
              designerPaid: newPaid,
              designerPending: newPending,
              designerPaymentStatus: newStatus,
            };
          }
          return lw;
        })
      );
    }
  };

  // Cross-Navigation Shortcuts
  const handleCreateInvoiceForProject = (project: Project) => {
    const clientObj = clients.find((c) => c.id === project.clientId);
    const projectAmount = Number(project.totalAmount ?? project.budget ?? 0);
    const amountGot = Number(project.amountGot ?? 0);
    const balance = Math.max(0, projectAmount - amountGot);
    const dueDate =
      project.deadlineDate || project.dueDate || new Date().toISOString().split('T')[0];

    const prefilledInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: balance <= 0 ? 'Paid' : amountGot > 0 ? 'Partially Paid' : 'Pending',
      billedBy: { ...settings.businessProfile },
      billedTo: {
        clientName: project.clientName,
        company: clientObj?.company || undefined,
        address: clientObj?.address || undefined,
        city: clientObj?.city || undefined,
        state: clientObj?.state || undefined,
        country: clientObj?.country || 'India',
        pinCode: clientObj?.pinCode || undefined,
        phone: clientObj?.phone || undefined,
        email: clientObj?.email || undefined,
        gstin: clientObj?.gstin || undefined,
      },
      supplyInfo: {
        countryOfSupply: 'India',
        placeOfSupply: 'Other Territory (97)',
      },
      taxType: settings.defaultTaxType,
      items: [
        {
          id: `item-${Date.now()}-1`,
          description: `${project.title.toUpperCase()}${
            project.projectType ? ` [${project.projectType.toUpperCase()}]` : ''
          }`,
          gstRate: settings.defaultGstRate || 0,
          quantity: 1,
          rate: projectAmount,
          amount: projectAmount,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: projectAmount,
        },
      ],
      subtotal: projectAmount,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      taxTotal: 0,
      grandTotal: projectAmount,
      receivedAmount: amountGot,
      balanceAmount: balance,
      payments: (project.payments || []).map((p) => ({
        id: p.id,
        date: p.date,
        amount: p.amount,
        method: (['UPI', 'Cash', 'Bank Transfer', 'Cheque'].includes(p.method)
          ? p.method
          : 'Bank Transfer') as any,
        reference: p.reference || p.referenceNumber,
        notes: p.note || p.notes,
      })),
      projectId: project.id,
      projectTitle: project.title,
      paymentDetails: { ...settings.paymentConfig },
      notes: `Invoice for project: ${project.title} (${project.projectCode || 'Custom Project'})`,
      footerNote: settings.disclaimer,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingInvoice(prefilledInvoice);
    setIsCreatingInvoice(true);
    navigate('admin-invoices-create');
  };

  const handleCreateInvoiceForClient = (client: Client) => {
    const prefilledInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      billedBy: { ...settings.businessProfile },
      billedTo: {
        clientName: client.name,
        company: client.company || undefined,
        address: client.address || undefined,
        city: client.city || undefined,
        state: client.state || undefined,
        country: client.country || 'India',
        pinCode: client.pinCode || undefined,
        phone: client.phone || undefined,
        email: client.email || undefined,
        gstin: client.gstin || undefined,
      },
      supplyInfo: {
        countryOfSupply: 'India',
        placeOfSupply: 'Other Territory (97)',
      },
      taxType: settings.defaultTaxType,
      items: [
        {
          id: `item-${Date.now()}-1`,
          description: 'CREATIVE DESIGN SERVICES',
          gstRate: settings.defaultGstRate || 0,
          quantity: 1,
          rate: 3500,
          amount: 3500,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 3500,
        },
      ],
      subtotal: 3500,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      taxTotal: 0,
      grandTotal: 3500,
      receivedAmount: 0,
      balanceAmount: 3500,
      payments: [],
      paymentDetails: { ...settings.paymentConfig },
      notes: 'Thank you for your business with GIZMO DESIGN!',
      footerNote: settings.disclaimer,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingInvoice(prefilledInvoice);
    setIsCreatingInvoice(true);
    navigate('admin-invoices-create');
  };

  const handleCreateInvoiceForLocalWork = (work: LocalWork) => {
    const clientObj = clients.find(
      (c) => c.name.toLowerCase() === work.clientName.toLowerCase()
    );

    const prefilledInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      billedBy: { ...settings.businessProfile },
      billedTo: {
        clientName: work.clientName,
        company: clientObj?.company || undefined,
        address: clientObj?.address || undefined,
        city: clientObj?.city || undefined,
        state: clientObj?.state || undefined,
        country: clientObj?.country || 'India',
        pinCode: clientObj?.pinCode || undefined,
        phone: clientObj?.phone || undefined,
        email: clientObj?.email || undefined,
        gstin: clientObj?.gstin || undefined,
      },
      supplyInfo: {
        countryOfSupply: 'India',
        placeOfSupply: 'Other Territory (97)',
      },
      taxType: settings.defaultTaxType,
      items: [
        {
          id: `item-${Date.now()}-1`,
          description: work.title.toUpperCase(),
          gstRate: 0,
          quantity: 1,
          rate: work.amount,
          amount: work.amount,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: work.amount,
        },
      ],
      subtotal: work.amount,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      taxTotal: 0,
      grandTotal: work.amount,
      receivedAmount: 0,
      balanceAmount: work.amount,
      payments: [],
      localWorkId: work.id,
      localWorkTitle: work.title,
      paymentDetails: { ...settings.paymentConfig },
      notes: `Local Work Order: ${work.title}`,
      footerNote: settings.disclaimer,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingInvoice(prefilledInvoice);
    setIsCreatingInvoice(true);
    navigate('admin-invoices-create');
  };

  const isAdminRoute = currentRoute.startsWith('admin');
  const isAdminLogin = currentRoute === 'admin-login';

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gizmo_admin_auth') === 'true';
    }
    return false;
  });

  // If user tries to access any admin route (except admin-login) while not logged in, redirect to admin-login
  useEffect(() => {
    if (isAdminRoute && !isAdminLogin && !isAdminAuthenticated) {
      navigate('admin-login', true);
    }
  }, [currentRoute, isAdminAuthenticated]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans antialiased selection:bg-[#EE1D45] selection:text-white">
      {isAdminLogin ? (
        <AdminLoginView
          onLoginSuccess={(targetRoute?: AppRoute) => {
            setIsAdminAuthenticated(true);
            navigate(targetRoute && targetRoute !== 'admin-login' ? targetRoute : 'admin-dashboard');
          }}
          onNavigate={navigate}
          attemptedRoute={currentRoute}
        />
      ) : isAdminRoute && isAdminAuthenticated ? (
        /* ========================================================================= */
        /* TIER 2: ADMIN / DIRECTOR CRM SHELL (`AdminLayout`)                        */
        /* ========================================================================= */
        <AdminLayout
          currentRoute={currentRoute}
          onNavigate={navigate}
          pendingProjectRequestsCount={pendingProjectRequestsCount}
          pendingLocalWorksCount={pendingLocalWorksCount}
          pendingInvoicesCount={
            invoices.filter((i) => i.status === 'Pending' || i.status === 'Draft').length
          }
          notifications={gizmoNotifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onLogout={() => {
            localStorage.removeItem('gizmo_admin_auth');
            localStorage.removeItem('gizmo_admin_remember');
            setIsAdminAuthenticated(false);
            navigate('admin-login', true);
          }}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenResetModal={() => setShowResetModal(true)}
          onCreateInvoice={handleStartCreateInvoice}
          onOpenQuickNote={() => setIsQuickNoteOpen(true)}
          searchTerm={invoiceSearchTerm}
          onSearchChange={setInvoiceSearchTerm}
          onNotificationClick={(notif) => {
            if (notif.relatedEntityType === 'project_request' || notif.targetRoute === 'admin-project-requests') {
              setActiveProjectRequestId(notif.relatedEntityId || notif.targetId || null);
              navigate('admin-project-requests');
            } else if (notif.relatedEntityType === 'project' || notif.targetRoute === 'admin-projects') {
              setActiveProjectIdForWorkspace(notif.relatedEntityId || notif.targetId || null);
              navigate('admin-projects');
            } else if (notif.targetRoute) {
              navigate(notif.targetRoute as AppRoute);
            }
          }}
        >
          {/* Global Notification Permission Banner for Browser Notifications */}
          <NotificationPermissionBanner />

          {/* TAB 1: DASHBOARD */}
          {currentRoute === 'admin-dashboard' && (
            <ProductionDashboard
              localWorks={localWorks}
              invoices={invoices}
              deadlines={deadlines}
              projects={projects}
              onCreateWork={() => navigate('admin-local-works')}
              onNavigateTab={(tab) => {
                if (tab === 'dashboard') navigate('admin-dashboard');
                else if (tab === 'projects') navigate('admin-projects');
                else if (tab === 'people') navigate('admin-clients');
                else if (tab === 'local-works') navigate('admin-local-works');
                else if (tab === 'invoice') navigate('admin-invoices');
              }}
              onOpenDeadlineDetails={handleOpenDeadlineDetails}
              onOpenAddDeadlineModal={() => setShowDeadlinesModal(true)}
              onOpenViewAllModal={() => setShowDeadlinesModal(true)}
              onToggleCompleteDeadline={handleToggleCompleteDeadline}
            />
          )}

          {/* TAB 2: PROJECTS */}
          {currentRoute === 'admin-projects' && (
            <ProjectsView
              projects={projects}
              invoices={invoices}
              clients={clients}
              designers={designers}
              onUpdateDesigners={(newDes) => {
                setDesigners(newDes);
                saveDesigners(newDes);
              }}
              settings={settings}
              localWorks={localWorks}
              projectTypes={projectTypes}
              onSaveProjectTypes={setProjectTypes}
              categories={categories}
              onSaveCategories={setCategories}
              priorities={projectPriorities}
              onSavePriorities={setProjectPriorities}
              projectStatuses={projectStatuses}
              onSaveProjectStatuses={setProjectStatuses}
              deliverableTypes={deliverableTypes}
              onSaveDeliverableTypes={setDeliverableTypes}
              customFields={projectCustomFields}
              onSaveCustomFields={setProjectCustomFields}
              templates={projectTemplates}
              onSaveTemplates={setProjectTemplates}
              notes={notes}
              noteCategories={noteCategories}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onTogglePinNote={handleTogglePinNote}
              onToggleCheckItemNote={handleToggleCheckItemNote}
              onNavigateRoute={navigate}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onCreateInvoiceForProject={handleCreateInvoiceForProject}
              onCreateInvoice={() => {
                setEditingInvoice(null);
                setIsCreatingInvoice(true);
                navigate('admin-invoices-create');
              }}
              onRecordDesignerPayment={handleRecordDesignerPayment}
              onViewInvoice={(inv) => setPreviewInvoice(inv)}
              onSaveInvoiceDirectly={(inv, openPreview) => {
                setInvoices((prev) => {
                  const exists = prev.some((i) => i.id === inv.id);
                  if (exists) {
                    return prev.map((i) => (i.id === inv.id ? inv : i));
                  }
                  return [inv, ...prev];
                });
                if (openPreview) {
                  setPreviewInvoice(inv);
                }
              }}
              onOpenInFullEditor={(draftInv) => {
                setEditingInvoice(draftInv);
                setIsCreatingInvoice(true);
                navigate('admin-invoices-create');
              }}
              onRecordInvoicePayment={(inv) => setPaymentInvoice(inv)}
              onAddClient={(newClient) => setClients((prev) => [newClient, ...prev])}
              onEditClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              initialActiveProjectId={activeProjectIdForWorkspace}
              onClearInitialActiveProject={() => setActiveProjectIdForWorkspace(null)}
            />
          )}

          {/* TAB 2.5: PROJECT REQUESTS INBOX & REVIEW */}
          {currentRoute === 'admin-project-requests' && (
            <ProjectRequestsView
              requests={projectRequests}
              projects={projects}
              clients={clients}
              onAcceptRequest={(req) => handleAcceptProjectRequest(req.id, {})}
              onRejectRequest={(req, reason) => handleRejectProjectRequest(req.id, reason)}
              onMarkUnderReview={(req) => handleMarkProjectRequestUnderReview(req.id)}
              onOpenProjectWorkspace={(projId) => {
                setActiveProjectIdForWorkspace(projId);
                navigate('admin-projects');
              }}
              initialSelectedRequestId={activeProjectRequestId}
              onClearSelectedRequest={() => setActiveProjectRequestId(null)}
            />
          )}

          {/* TAB 3: CLIENTS / PEOPLE */}
          {currentRoute === 'admin-clients' && (
            <PeopleView
              clients={clients}
              projects={projects}
              invoices={invoices}
              onAddClient={(client) => setClients([client, ...clients])}
              onCreateInvoiceForClient={handleCreateInvoiceForClient}
              onViewInvoice={(inv) => setPreviewInvoice(inv)}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {/* TAB 4: LOCAL WORKS */}
          {currentRoute === 'admin-local-works' && (
            <LocalWorksView
              localWorks={localWorks}
              invoices={invoices}
              clients={clients}
              categories={categories}
              customDesigners={designers}
              onUpdateCustomDesigners={(newDes) => {
                setDesigners(newDes);
                saveDesigners(newDes);
              }}
              onAddLocalWork={handleAddLocalWork}
              onUpdateLocalWork={handleUpdateLocalWork}
              onDeleteLocalWork={handleDeleteLocalWork}
              onDuplicateLocalWork={handleDuplicateLocalWork}
              onSaveCategories={handleSaveCategories}
              onImportWorks={handleImportWorks}
              onCreateInvoiceForWork={handleCreateInvoiceForLocalWork}
              onViewInvoice={(inv) => setPreviewInvoice(inv)}
            />
          )}

          {/* TAB 4.5: NOTES */}
          {currentRoute === 'admin-notes' && (
            <NotesView
              notes={notes}
              categories={noteCategories}
              projects={projects}
              clients={clients}
              localWorks={localWorks}
              invoices={invoices}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleTogglePinNote}
              onToggleCheckItem={handleToggleCheckItemNote}
              onAddCategory={handleAddNoteCategory}
              onDeleteCategory={handleDeleteNoteCategory}
              onNavigateRoute={navigate}
              onOpenQuickNote={() => setIsQuickNoteOpen(true)}
            />
          )}

          {/* TAB 5: INVOICES WORKSPACE */}
          {(currentRoute === 'admin-invoices' || currentRoute === 'admin-invoices-create') && (
            <>
              {isCreatingInvoice || currentRoute === 'admin-invoices-create' ? (
                <InvoiceForm
                  initialInvoice={editingInvoice}
                  existingInvoices={invoices}
                  clients={clients}
                  projects={projects}
                  localWorks={localWorks}
                  settings={settings}
                  onSave={handleSaveInvoice}
                  onCancel={() => {
                    setIsCreatingInvoice(false);
                    setEditingInvoice(null);
                    navigate('admin-invoices');
                  }}
                  onOpenSettings={() => setShowSettingsModal(true)}
                  onAddNewClient={(newClient) => setClients([newClient, ...clients])}
                  onOpenProjectWorkspace={(projId) => {
                    setIsCreatingInvoice(false);
                    setEditingInvoice(null);
                    setActiveProjectIdForWorkspace(projId);
                    navigate('admin-projects');
                  }}
                  onViewInvoice={(inv) => setPreviewInvoice(inv)}
                  onShareInvoice={(inv) => setShareInvoice(inv)}
                />
              ) : (
                <div className="space-y-6 max-w-6xl mx-auto pb-12">
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        INVOICES
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        Manage invoices, payments and billing.
                      </p>
                    </div>

                    <button
                      id="btn-create-invoice-top"
                      onClick={handleStartCreateInvoice}
                      className="bg-slate-950 hover:bg-slate-800 active:bg-black text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create Invoice</span>
                    </button>
                  </div>

                  <InvoiceDashboard invoices={invoices} />
                  <InvoiceList
                    invoices={invoices}
                    onCreateInvoice={handleStartCreateInvoice}
                    onViewInvoice={(inv) => setPreviewInvoice(inv)}
                    onEditInvoice={handleEditInvoice}
                    onDuplicate={(inv) => handleDuplicateInvoice(inv)}
                    onRecordPayment={(inv) => setPaymentInvoice(inv)}
                    onShareInvoice={(inv) => setShareInvoice(inv)}
                    onDownloadPdf={handleDownloadPdf}
                    onDeleteInvoice={handleDeleteInvoice}
                    onOpenSettings={() => setShowSettingsModal(true)}
                    onOpenProject={(projId) => {
                      setActiveProjectIdForWorkspace(projId);
                      navigate('admin-projects');
                    }}
                    searchTerm={invoiceSearchTerm}
                    onSearchChange={setInvoiceSearchTerm}
                  />
                </div>
              )}
            </>
          )}

          {/* TAB 6: ADMIN SETTINGS SUMMARY */}
          {currentRoute === 'admin-settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Card 1: Studio Configuration */}
              <div className="p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
                  <div>
                    <h2 className="text-xl font-black text-zinc-950 tracking-tight">Studio Configuration &amp; Operations</h2>
                    <p className="text-xs text-zinc-500 mt-1">Manage corporate entity, GSTIN registration, UPI payment accounts, and invoice terms.</p>
                  </div>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="px-4 py-2.5 bg-[#EE1D45] hover:bg-[#D8143C] text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Edit Studio Settings
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Business Entity</span>
                    <div className="font-black text-base text-zinc-900">{settings.businessProfile.name}</div>
                    <div className="text-zinc-600 leading-relaxed">{settings.businessProfile.address}</div>
                    <div className="font-mono text-zinc-500 pt-1">GSTIN: {settings.businessProfile.gstin}</div>
                    <div className="text-zinc-500">Phone: {settings.businessProfile.phone}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">UPI &amp; Digital Banking</span>
                    <div className="font-black text-base text-zinc-900">{settings.paymentConfig.upiId}</div>
                    <div className="text-zinc-600">Bank: {settings.paymentConfig.bankName}</div>
                    <div className="font-mono text-zinc-500">A/C: {settings.paymentConfig.accountNumber}</div>
                    <div className="font-mono text-zinc-500">IFSC: {settings.paymentConfig.ifsc}</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Projects & Deliverables Configuration */}
              <div className="p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
                  <div>
                    <h2 className="text-xl font-black text-zinc-950 tracking-tight">Project &amp; Deliverables Settings</h2>
                    <p className="text-xs text-zinc-500 mt-1">Configure Project Types, Categories, Priorities, Statuses, Deliverable Items, and Reusable Templates.</p>
                  </div>
                  <button
                    onClick={() => setShowProjectSettingsModal(true)}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Manage Project Settings
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-100 space-y-1">
                    <div className="font-bold text-violet-900 text-[11px]">Project Types</div>
                    <div className="font-mono font-black text-lg text-violet-700">{projectTypes.length}</div>
                    <div className="text-[10px] text-slate-500">Configured types</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1">
                    <div className="font-bold text-amber-900 text-[11px]">Priorities</div>
                    <div className="font-mono font-black text-lg text-amber-700">{projectPriorities.length}</div>
                    <div className="text-[10px] text-slate-500">Priority levels</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                    <div className="font-bold text-blue-900 text-[11px]">Deliverables</div>
                    <div className="font-mono font-black text-lg text-blue-700">{deliverableTypes.length}</div>
                    <div className="text-[10px] text-slate-500">Deliverable types</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-900 text-[11px]">Templates</div>
                    <div className="font-mono font-black text-lg text-emerald-700">{projectTemplates.length}</div>
                    <div className="text-[10px] text-slate-500">Reusable packages</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Notification System Settings */}
              <NotificationSettingsSection
                settings={notificationSettings}
                onSaveSettings={setNotificationSettings}
              />
            </div>
          )}
        </AdminLayout>
      ) : (
        /* ========================================================================= */
        /* TIER 1: PUBLIC CLIENT PORTAL TIER (`Navbar` + Views + `PublicFooter`)     */
        /* ========================================================================= */
        <div className="min-h-screen flex flex-col bg-white text-zinc-900">
          <Navbar
            currentRoute={currentRoute}
            onNavigate={navigate}
            activeProjectsCount={projects.filter((p) => p.status !== 'Completed').length || 3}
            onOpenStartProject={() => setShowStartProjectModal(true)}
            unreadNotificationsCount={gizmoNotifications.filter((n) => !n.read && !n.isRead).length}
            onOpenNotifications={() => navigate('admin-dashboard')}
          />

          <main className="flex-1 pt-16 sm:pt-20">
            {currentRoute === 'home' && (
              <HomeView
                onNavigate={navigate}
                onOpenStartProject={() => setShowStartProjectModal(true)}
                activeProjectsCount={projects.filter((p) => p.status !== 'Completed').length || 3}
              />
            )}

            {currentRoute === 'services' && (
              <ServicesView
                onNavigate={navigate}
                onOpenStartProject={() => setShowStartProjectModal(true)}
              />
            )}

            {currentRoute === 'work' && (
              <WorkView
                onNavigate={navigate}
                onOpenStartProject={() => setShowStartProjectModal(true)}
              />
            )}

            {currentRoute === 'about' && (
              <AboutView
                onNavigate={navigate}
                onOpenStartProject={() => setShowStartProjectModal(true)}
              />
            )}

            {currentRoute === 'my-projects' && (
              <MyProjectsView
                projects={projects}
                requests={projectRequests}
                onNavigate={navigate}
                onOpenStartProject={() => setShowStartProjectModal(true)}
              />
            )}
          </main>

          <PublicFooter
            onNavigate={navigate}
            onOpenStartProject={() => setShowStartProjectModal(true)}
          />
        </div>
      )}

      {/* ========================================================================= */
      /* GLOBAL UNIFIED MODALS                                                      */
      /* ========================================================================= */}
      <InvoicePreviewModal
        invoice={previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        onEdit={(inv) => handleEditInvoice(inv)}
        onDuplicate={(inv) => handleDuplicateInvoice(inv)}
        onRecordPayment={(inv) => setPaymentInvoice(inv)}
        onShare={(inv) => setShareInvoice(inv)}
        onMarkPaid={handleMarkAsPaid}
        onOpenProject={(projId) => {
          setActiveProjectIdForWorkspace(projId);
          setPreviewInvoice(null);
          navigate('admin-projects');
        }}
      />

      {showSettingsModal && (
        <InvoiceSettingsModal
          settings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
          onClose={() => setShowSettingsModal(false)}
          onOpenResetModal={() => {
            setShowSettingsModal(false);
            setShowResetModal(true);
          }}
        />
      )}

      <PaymentModal
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onRecordPayment={handleRecordPayment}
      />

      <ShareModal
        invoice={shareInvoice}
        onClose={() => setShareInvoice(null)}
      />

      <DeadlinesManagerModal
        isOpen={showDeadlinesModal}
        onClose={() => setShowDeadlinesModal(false)}
        deadlines={deadlines}
        clients={clients}
        onAddDeadline={handleAddDeadline}
        onUpdateDeadline={handleUpdateDeadline}
        onDeleteDeadline={handleDeleteDeadline}
        onNavigateTab={(tab) => {
          if (tab === 'dashboard') navigate('admin-dashboard');
          else if (tab === 'projects') navigate('admin-projects');
          else if (tab === 'people') navigate('admin-clients');
          else if (tab === 'local-works') navigate('admin-local-works');
          else if (tab === 'invoice') navigate('admin-invoices');
        }}
      />

      <DeadlineDetailModal
        deadline={selectedDeadline}
        isOpen={showDeadlineDetailModal}
        onClose={() => {
          setShowDeadlineDetailModal(false);
          setSelectedDeadline(null);
        }}
        onEdit={(dl) => handleStartEditFromDetail(dl)}
        onToggleComplete={handleToggleCompleteDeadline}
        onNavigateTab={(tab) => {
          if (tab === 'dashboard') navigate('admin-dashboard');
          else if (tab === 'projects') navigate('admin-projects');
          else if (tab === 'people') navigate('admin-clients');
          else if (tab === 'local-works') navigate('admin-local-works');
          else if (tab === 'invoice') navigate('admin-invoices');
        }}
      />

      <StartProjectModal
        isOpen={showStartProjectModal}
        onClose={() => setShowStartProjectModal(false)}
        clients={clients}
        projects={projects}
        onAddProjectRequest={(req) => {
          setProjectRequests((prev) => [req, ...prev]);
        }}
        onAddClient={(newClient) => setClients([newClient, ...clients])}
        onNavigateToClientPortal={() => navigate('my-projects')}
        onAddNotification={(notif) => {
          const gizmoNotif: GizmoNotification = {
            id: notif.id || `notif-${Date.now()}`,
            recipientId: 'admin',
            category: 'new_projects',
            type: 'project',
            title: notif.title || 'New Project Proposal',
            message: notif.description || notif.message || 'New project request submitted.',
            description: notif.description || notif.message || 'New project request submitted.',
            relatedEntityType: 'project',
            timestamp: notif.timestamp || 'Just now',
            createdAt: new Date().toISOString(),
            isRead: false,
            read: false,
            targetRoute: (notif.route || notif.targetRoute || 'admin-project-requests') as AppRoute,
          };
          setGizmoNotifications((prev) => [gizmoNotif, ...prev]);
        }}
      />

      {showProjectSettingsModal && (
        <ProjectTypesSettingsModal
          isOpen={showProjectSettingsModal}
          onClose={() => setShowProjectSettingsModal(false)}
          projects={projects}
          projectTypes={projectTypes}
          onSaveProjectTypes={setProjectTypes}
          categories={categories}
          onSaveCategories={setCategories}
          priorities={projectPriorities}
          onSavePriorities={setProjectPriorities}
          projectStatuses={projectStatuses}
          onSaveProjectStatuses={setProjectStatuses}
          deliverableTypes={deliverableTypes}
          onSaveDeliverableTypes={setDeliverableTypes}
          customFields={projectCustomFields}
          onSaveCustomFields={setProjectCustomFields}
          templates={projectTemplates}
          onSaveTemplates={setProjectTemplates}
        />
      )}

      {/* QUICK NOTE MODAL */}
      <QuickNoteModal
        isOpen={isQuickNoteOpen}
        onClose={() => setIsQuickNoteOpen(false)}
        categories={noteCategories}
        projects={projects}
        clients={clients}
        onSaveQuickNote={handleSaveNote}
      />

      {/* RESET PORTAL MODAL */}
      <ResetPortalModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirmReset={handleConfirmReset}
      />

      {/* TOAST NOTIFICATION BANNER */}
      {resetToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 border border-zinc-700 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{resetToastMessage}</span>
        </div>
      )}
    </div>
  );
}
