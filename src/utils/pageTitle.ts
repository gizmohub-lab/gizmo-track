import { useEffect } from 'react';
import { AppRoute } from '../types';

export interface PageTitleContext {
  route: AppRoute;
  projectName?: string | null;
  clientName?: string | null;
  isStartProjectOpen?: boolean;
  activeSection?: string | null; // e.g. 'designers', 'calendar'
}

const BRAND_NAME = 'Gizmo Design';

// Central title resolver following the exact user specification
export function resolvePageTitle(context: PageTitleContext): string {
  // 1. Highest priority: Start a Project modal
  if (context.isStartProjectOpen) {
    return `${BRAND_NAME} — Start a Project`;
  }

  // 2. Specific dynamic project details view
  if (context.route === 'admin-projects' && context.projectName) {
    return `${BRAND_NAME} — ${context.projectName}`;
  }

  // 3. Client workspace with specific client name
  if (context.route === 'my-projects') {
    if (context.clientName) {
      return `${BRAND_NAME} — ${context.clientName}`;
    }
    return `${BRAND_NAME} — Client Workspace`;
  }

  // 4. Designers directory within Local Works
  if (context.route === 'admin-local-works' && context.activeSection === 'designers') {
    return `${BRAND_NAME} — Designers`;
  }

  // 5. Admin & Portal Routes
  switch (context.route) {
    case 'admin-dashboard':
      return `${BRAND_NAME} — Dashboard`;
    case 'admin':
    case 'admin-login':
      return `${BRAND_NAME} — Admin`;
    case 'admin-projects':
      return `${BRAND_NAME} — Projects`;
    case 'admin-clients':
      return `${BRAND_NAME} — Clients`;
    case 'admin-local-works':
      return `${BRAND_NAME} — Local Works`;
    case 'admin-notes':
      return `${BRAND_NAME} — Notes`;
    case 'admin-invoices':
    case 'admin-invoices-create':
      return `${BRAND_NAME} — Invoices`;
    case 'admin-settings':
      return `${BRAND_NAME} — Settings`;

    // 6. Public Website
    case 'home':
    case 'services':
    case 'work':
    case 'about':
    default:
      return BRAND_NAME;
  }
}

// Global listener store for dynamic title overrides from sub-components
type TitleListener = (title: string) => void;
const listeners = new Set<TitleListener>();
let currentTitle = BRAND_NAME;

export function setDocumentTitle(title: string) {
  currentTitle = title;
  if (typeof document !== 'undefined') {
    document.title = title;
  }
  listeners.forEach((fn) => fn(title));
}

export function subscribeToTitle(listener: TitleListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Custom hook to set sub-section titles (e.g. Designers tab) and clean up on unmount
export function useSubSectionTitle(subSectionName: string | null) {
  useEffect(() => {
    if (!subSectionName) return;
    const previousTitle = document.title;
    setDocumentTitle(`${BRAND_NAME} — ${subSectionName}`);
    return () => {
      if (previousTitle) {
        setDocumentTitle(previousTitle);
      }
    };
  }, [subSectionName]);
}
