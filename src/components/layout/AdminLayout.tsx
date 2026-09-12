import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FolderKanban,
  Inbox,
  Users,
  Briefcase,
  Receipt,
  NotebookPen,
  Settings,
  Bell,
  RotateCcw,
  Check,
  CheckCheck,
  ExternalLink,
  MessageCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Clock,
  TriangleAlert,
  Calendar,
  Plus,
  Search,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { AppRoute, AdminNotification } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { GizmoLogoBadge } from '../common/GizmoLogoBadge';

interface AdminLayoutProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  children: React.ReactNode;
  pendingProjectRequestsCount?: number;
  pendingLocalWorksCount?: number;
  pendingInvoicesCount?: number;
  notesCount?: number;
  onLogout?: () => void;
  notifications?: AdminNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onOpenSettings?: () => void;
  onOpenResetModal?: () => void;
  onCreateInvoice?: () => void;
  onOpenQuickNote?: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onNotificationClick?: (notif: AdminNotification) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  onNavigate,
  children,
  pendingProjectRequestsCount = 0,
  pendingLocalWorksCount = 0,
  pendingInvoicesCount = 0,
  onLogout,
  notifications: propNotifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onOpenSettings,
  onOpenResetModal,
  onCreateInvoice,
  onOpenQuickNote,
  searchTerm = '',
  onSearchChange,
  onNotificationClick,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'read'>('all');
  const notificationRef = useRef<HTMLDivElement>(null);

  // Default rich notification items if none provided
  const [localNotifications, setLocalNotifications] = useState<AdminNotification[]>([
    {
      id: 'notif-1',
      title: 'Flex Hoarding Deadline',
      description: 'Grand Opening Flex for Apex Developers is due soon.',
      timestamp: '15 mins ago',
      read: false,
      type: 'urgent',
      targetRoute: 'admin-local-works',
    },
    {
      id: 'notif-2',
      title: 'Payment Received',
      description: 'Advance payment of ₹15,000 received for Ramadan Campaign.',
      timestamp: '1 hour ago',
      read: false,
      type: 'payment',
      targetRoute: 'admin-invoices',
    },
    {
      id: 'notif-3',
      title: 'New Project Request',
      description: 'Darul Hasaniyyah submitted a project request.',
      timestamp: '3 hours ago',
      read: false,
      type: 'project',
      targetRoute: 'admin-projects',
    },
  ]);

  const activeNotifications = propNotifications || localNotifications;
  const unreadCount = activeNotifications.filter((n) => !n.read && !n.isRead).length;

  // Track known notification IDs to only animate on genuinely NEW notifications
  const knownNotifIdsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(false);
  const [shouldAnimateBell, setShouldAnimateBell] = useState(false);

  useEffect(() => {
    const unreadNotifications = activeNotifications.filter((n) => !n.read && !n.isRead);

    if (!isMountedRef.current) {
      // First render / mount: record all initial notification IDs without animating
      unreadNotifications.forEach((n) => knownNotifIdsRef.current.add(n.id));
      isMountedRef.current = true;
      return;
    }

    // Check for any genuinely NEW unread notification that hasn't been seen before
    const hasNewUnreadNotif = unreadNotifications.some((n) => !knownNotifIdsRef.current.has(n.id));

    // Update the set of known IDs
    unreadNotifications.forEach((n) => knownNotifIdsRef.current.add(n.id));

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasNewUnreadNotif && !prefersReducedMotion) {
      setShouldAnimateBell(true);
      const timer = setTimeout(() => {
        setShouldAnimateBell(false);
      }, 500); // 500ms single pass animation
      return () => clearTimeout(timer);
    } else {
      setShouldAnimateBell(false);
    }
  }, [activeNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const handleMarkAsRead = (id: string) => {
    if (onMarkNotificationAsRead) {
      onMarkNotificationAsRead(id);
    } else {
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
      );
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllNotificationsAsRead) {
      onMarkAllNotificationsAsRead();
    } else {
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    }
  };

  const handleNotificationClick = (notif: AdminNotification) => {
    handleMarkAsRead(notif.id);
    if (onNotificationClick) {
      onNotificationClick(notif);
    } else if (notif.targetRoute) {
      onNavigate(notif.targetRoute);
    }
    setNotificationsOpen(false);
    setMobileDrawerOpen(false);
  };

  // Human-readable page titles
  const getBreadcrumbTitle = () => {
    switch (currentRoute) {
      case 'admin-dashboard':
      case 'admin':
        return 'Dashboard';
      case 'admin-project-requests':
        return 'Project Requests';
      case 'admin-projects':
        return 'Projects';
      case 'admin-clients':
        return 'People';
      case 'admin-local-works':
        return 'Local Works';
      case 'admin-notes':
        return 'Notes';
      case 'admin-invoices':
        return 'Invoices';
      case 'admin-invoices-create':
        return 'Create Invoice';
      case 'admin-settings':
        return 'Settings';
      default:
        return 'Gizmo Portal';
    }
  };

  // Navigation Items matching section 3 & 4 requirements
  const navItems = [
    {
      id: 'admin-dashboard' as AppRoute,
      label: 'Dashboard',
      icon: LayoutDashboard,
      matchRoutes: ['admin-dashboard', 'admin'],
    },
    {
      id: 'admin-project-requests' as AppRoute,
      label: 'Project Requests',
      icon: Inbox,
      badge: pendingProjectRequestsCount > 0 ? pendingProjectRequestsCount : undefined,
      isHighlightedBadge: true,
      matchRoutes: ['admin-project-requests'],
    },
    {
      id: 'admin-projects' as AppRoute,
      label: 'Projects',
      icon: FolderKanban,
      matchRoutes: ['admin-projects'],
    },
    {
      id: 'admin-clients' as AppRoute,
      label: 'People',
      icon: Users,
      matchRoutes: ['admin-clients'],
    },
    {
      id: 'admin-local-works' as AppRoute,
      label: 'Local Works',
      icon: Briefcase,
      badge: pendingLocalWorksCount > 0 ? pendingLocalWorksCount : undefined,
      matchRoutes: ['admin-local-works'],
    },
    {
      id: 'admin-notes' as AppRoute,
      label: 'Notes',
      icon: NotebookPen,
      matchRoutes: ['admin-notes'],
    },
    {
      id: 'admin-invoices' as AppRoute,
      label: 'Invoices',
      icon: Receipt,
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : undefined,
      matchRoutes: ['admin-invoices', 'admin-invoices-create'],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-950 flex font-sans antialiased">
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        id="director-desktop-sidebar"
        className={`hidden md:flex flex-col justify-between fixed inset-y-0 left-0 bg-white border-r border-zinc-200 z-30 select-none transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-4 border-b border-zinc-200 flex items-center justify-between">
            <div
              id="admin-sidebar-brand-btn"
              onClick={() => onNavigate('admin-dashboard')}
              className="cursor-pointer flex items-center gap-2.5 overflow-visible group"
            >
              <GizmoLogoBadge
                unreadCount={unreadCount}
                onBadgeClick={() => setNotificationsOpen(true)}
                size="md"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs group-hover:bg-zinc-800 transition-colors">
                  G
                </div>
              </GizmoLogoBadge>
              {!isCollapsed && (
                <span className="font-bold text-base tracking-tight text-zinc-950 whitespace-nowrap">
                  GIZMO
                </span>
              )}
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition hidden sm:block"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Main Navigation */}
          <div className="p-2 space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Menu
              </div>
            )}
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.matchRoutes.includes(currentRoute);

                return (
                  <button
                    key={item.id}
                    id={`sidebar-link-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.98] ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-950 font-bold border-l-2 border-[#FF5738]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105 group-hover:translate-x-0.5 ${
                          isActive ? 'text-[#FF5738]' : 'text-zinc-400 group-hover:text-zinc-800'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                          item.isHighlightedBadge
                            ? 'bg-[#FF5738] text-white shadow-xs'
                            : 'bg-zinc-200 text-zinc-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Section Footer */}
        <div className="p-2 border-t border-zinc-200 space-y-0.5 bg-zinc-50/50">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Settings &amp; System
            </div>
          )}

          {/* Settings */}
          <button
            id="sidebar-settings-link"
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              else onNavigate('admin-settings');
            }}
            title={isCollapsed ? 'Settings' : undefined}
            className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.98] ${
              currentRoute === 'admin-settings'
                ? 'bg-zinc-100 text-zinc-950 font-bold border-l-2 border-[#FF5738]'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <Settings
              className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-45 ${
                currentRoute === 'admin-settings' ? 'text-[#FF5738]' : 'text-zinc-400 group-hover:text-zinc-800'
              }`}
            />
            {!isCollapsed && <span>Settings</span>}
          </button>

          {/* Notifications */}
          <button
            id="sidebar-notifications-link"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title={isCollapsed ? 'Notifications' : undefined}
            className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition-all duration-150 active:scale-[0.98] ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={
                  shouldAnimateBell
                    ? { rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.15, 1] }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <Bell
                  className={`w-4 h-4 shrink-0 transition-colors duration-150 group-hover:scale-105 ${
                    unreadCount > 0 ? 'text-[#FF5738]' : 'text-zinc-400 group-hover:text-zinc-800'
                  }`}
                />
              </motion.div>
              {!isCollapsed && <span>Notifications</span>}
            </div>
            {!isCollapsed && unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-[#FF5738] text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Reset */}
          <button
            id="sidebar-reset-link"
            onClick={() => {
              if (onOpenResetModal) onOpenResetModal();
            }}
            title={isCollapsed ? 'Reset Data' : undefined}
            className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-all duration-150 active:scale-[0.98] ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <RotateCcw className="w-4 h-4 shrink-0 text-rose-500 transition-transform duration-300 group-hover:rotate-180" />
            {!isCollapsed && <span>Reset</span>}
          </button>

          {/* Profile Card */}
          <div
            className={`mt-2 p-2 rounded-lg bg-white border border-zinc-200 flex items-center justify-between ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shrink-0">
                G
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-950 truncate">Admin</div>
                  <div className="text-[10px] text-zinc-400 truncate">Gizmo Studio</div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                id="sidebar-logout-btn"
                onClick={() => {
                  if (onLogout) onLogout();
                  else onNavigate('home');
                }}
                title="Log Out / Return Home"
                className="p-1 text-zinc-400 hover:text-zinc-950 rounded transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN CENTER AREA WITH STICKY TOPBAR */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isCollapsed ? 'md:pl-16' : 'md:pl-60'
        }`}
      >
        {/* Sticky Top Header */}
        <header
          id="director-sticky-topbar"
          className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between gap-4"
        >
          {/* Left: Mobile Menu Toggle & Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="mobile-drawer-toggle"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 text-zinc-600 hover:text-zinc-950 rounded-lg hover:bg-zinc-100"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs min-w-0">
              <span className="font-extrabold text-base sm:text-lg text-zinc-950 tracking-tight truncate">
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          {/* Right: Search, Notifications 🔔, Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 focus:bg-white w-40 md:w-56 transition"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                id="btn-notification-center"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-lg border transition-all duration-150 relative active:scale-[0.98] ${
                  notificationsOpen
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-950'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
                title="Notifications"
              >
                <motion.div
                  animate={
                    shouldAnimateBell
                      ? { rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.15, 1] }
                      : { rotate: 0, scale: 1 }
                  }
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <Bell
                    className={`w-4 h-4 transition-colors duration-150 hover:scale-110 ${
                      unreadCount > 0 ? 'text-[#FF5738]' : ''
                    }`}
                  />
                </motion.div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5738] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    id="notifications-popover-menu"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-950">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#FF5738] text-white text-[10px] font-mono font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-bold text-[#FF5738] hover:underline flex items-center gap-1 active:scale-[0.98] transition-transform"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 text-xs">
                      {activeNotifications.length > 0 ? (
                        activeNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 transition-colors cursor-pointer hover:bg-zinc-50 flex items-start gap-2.5 ${
                              !notif.read && !notif.isRead ? 'bg-amber-50/30' : 'bg-white'
                            }`}
                          >
                            <Bell className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`truncate ${
                                    !notif.read && !notif.isRead ? 'font-bold text-zinc-950' : 'text-zinc-700'
                                  }`}
                                >
                                  {notif.title}
                                </span>
                                <span className="text-[10px] text-zinc-400 ml-2 shrink-0">
                                  {notif.timestamp || 'Just now'}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                                {notif.description || notif.message}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-zinc-400">
                          No notifications right now.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <PWAInstallButton />

            {/* Public Site Button */}
            <button
              id="topbar-public-site-btn"
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-[0.98] text-zinc-800 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </header>

        {/* Dynamic Center Work Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <motion.div
            key={currentRoute}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* 3. MOBILE DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="w-64 fixed inset-y-0 left-0 bg-white shadow-xl p-4 flex flex-col justify-between z-50">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div
                  id="admin-mobile-drawer-brand-btn"
                  onClick={() => {
                    onNavigate('admin-dashboard');
                    setMobileDrawerOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2.5 overflow-visible group"
                >
                  <GizmoLogoBadge
                    unreadCount={unreadCount}
                    onBadgeClick={() => {
                      setMobileDrawerOpen(false);
                      setNotificationsOpen(true);
                    }}
                    size="sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      G
                    </div>
                  </GizmoLogoBadge>
                  <span className="font-bold text-base text-zinc-950">GIZMO</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-zinc-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 mt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.matchRoutes.includes(currentRoute);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-zinc-100 text-zinc-950 font-bold border-l-2 border-[#FF5738]'
                          : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF5738]' : 'text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                            item.isHighlightedBadge
                              ? 'bg-[#FF5738] text-white shadow-xs'
                              : 'bg-zinc-200 text-zinc-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-1 pt-3 border-t border-zinc-200">
              <button
                onClick={() => {
                  if (onOpenSettings) onOpenSettings();
                  else onNavigate('admin-settings');
                  setMobileDrawerOpen(false);
                }}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-zinc-700 font-medium text-xs flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenResetModal) onOpenResetModal();
                  setMobileDrawerOpen(false);
                }}
                className="w-full px-3 py-2 rounded-lg border border-rose-200 text-rose-600 font-medium text-xs flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-rose-500" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

