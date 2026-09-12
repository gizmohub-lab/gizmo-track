import React, { useState } from 'react';
import {
  Bell,
  Check,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sparkles,
  Send,
} from 'lucide-react';
import {
  NotificationSettings,
  getNotificationPermissionState,
  requestBrowserNotificationPermission,
  sendOutsideBrowserNotification,
} from '../../utils/notificationSystem';

interface NotificationSettingsSectionProps {
  settings: NotificationSettings;
  onSaveSettings: (updated: NotificationSettings) => void;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [permissionState, setPermissionState] = useState(getNotificationPermissionState());
  const [testSent, setTestSent] = useState(false);

  const handleToggleCategory = (key: keyof NotificationSettings) => {
    const updated = {
      ...settings,
      [key]: !settings[key],
    };
    onSaveSettings(updated);
  };

  const handleRequestPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    setPermissionState(getNotificationPermissionState());
    if (granted) {
      onSaveSettings({ ...settings, enableBrowserNotifications: true });
    }
  };

  const handleSendTestNotification = async () => {
    setTestSent(true);
    const success = await sendOutsideBrowserNotification({
      title: 'Gizmo Design — Test Notification',
      body: 'External browser notifications are active! You will receive alerts even when Gizmo is closed.',
      targetRoute: 'admin-dashboard',
    });

    if (!success) {
      alert('Could not trigger browser notification. Please verify browser notification permissions.');
    }

    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div id="notification-settings-card" className="p-6 sm:p-8 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-zinc-950 tracking-tight">Notification System Settings</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-100 text-violet-800">
              REAL BROWSER NOTIFICATIONS
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Configure system alert categories, role filters, and outside-the-app browser notifications.
          </p>
        </div>

        {/* Permission Status Badge & Action */}
        <div className="flex items-center gap-2">
          {permissionState === 'granted' && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Browser Permissions Granted</span>
            </span>
          )}

          {permissionState === 'denied' && (
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Permission Denied in Browser</span>
            </span>
          )}

          {permissionState === 'default' && (
            <button
              onClick={handleRequestPermission}
              className="px-3.5 py-1.5 bg-[#EE1D45] hover:bg-[#D8143C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Request Browser Permission</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission Fallback Banner if Denied */}
      {permissionState === 'denied' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Browser notifications are disabled</div>
            <p className="text-rose-700 mt-0.5">
              Enable them in your browser settings to receive notifications outside Gizmo. In-app notifications will continue to work inside the header bell menu.
            </p>
          </div>
        </div>
      )}

      {/* Primary Toggle: Browser/Desktop Notifications */}
      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-[#EE1D45]" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-zinc-950">Browser / Desktop Notifications</div>
            <div className="text-xs text-zinc-500">
              Receive OS-level popups for deadlines, orders, and payments even when Gizmo tab is minimized.
            </div>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.enableBrowserNotifications}
            onChange={() => handleToggleCategory('enableBrowserNotifications')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EE1D45]" />
        </label>
      </div>

      {/* Notification Categories Grid */}
      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-zinc-400">
          Alert Categories &amp; Subscriptions
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1. New Projects */}
          <div className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-900">New Projects</div>
              <div className="text-[11px] text-zinc-500">Submitted requests and client proposals</div>
            </div>
            <input
              type="checkbox"
              checked={settings.newProjects}
              onChange={() => handleToggleCategory('newProjects')}
              className="w-4 h-4 accent-[#EE1D45] rounded cursor-pointer"
            />
          </div>

          {/* 2. Project Updates */}
          <div className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-900">Project Updates</div>
              <div className="text-[11px] text-zinc-500">Status changes and project milestones</div>
            </div>
            <input
              type="checkbox"
              checked={settings.projectUpdates}
              onChange={() => handleToggleCategory('projectUpdates')}
              className="w-4 h-4 accent-[#EE1D45] rounded cursor-pointer"
            />
          </div>

          {/* 3. Deliverable Assignments */}
          <div className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-900">Deliverable Assignments</div>
              <div className="text-[11px] text-zinc-500">Designer task assignments and handovers</div>
            </div>
            <input
              type="checkbox"
              checked={settings.deliverableAssignments}
              onChange={() => handleToggleCategory('deliverableAssignments')}
              className="w-4 h-4 accent-[#EE1D45] rounded cursor-pointer"
            />
          </div>

          {/* 4. Deadline Alerts */}
          <div className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-900">Deadline Alerts</div>
              <div className="text-[11px] text-zinc-500">48h, 24h, 1h, and due now alarms</div>
            </div>
            <input
              type="checkbox"
              checked={settings.deadlineAlerts}
              onChange={() => handleToggleCategory('deadlineAlerts')}
              className="w-4 h-4 accent-[#EE1D45] rounded cursor-pointer"
            />
          </div>

          {/* 5. Overdue Alerts */}
          <div className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-900">Overdue Alerts</div>
              <div className="text-[11px] text-zinc-500">Overdue projects, deliverables, and invoices</div>
            </div>
            <input
              type="checkbox"
              checked={settings.overdueAlerts}
              onChange={() => handleToggleCategory('overdueAlerts')}
              className="w-4 h-4 accent-[#EE1D45] rounded cursor-pointer"
            />
          </div>

          {/* 6. Payments */}
          <div className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-900">Payments</div>
              <div className="text-[11px] text-zinc-500">Client payments received &amp; designer payouts</div>
            </div>
            <input
              type="checkbox"
              checked={settings.payments}
              onChange={() => handleToggleCategory('payments')}
              className="w-4 h-4 accent-[#EE1D45] rounded cursor-pointer"
            />
          </div>

          {/* 7. Invoices */}
          <div className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-900">Invoices</div>
              <div className="text-[11px] text-zinc-500">New invoice creation, sent status, &amp; overdue</div>
            </div>
            <input
              type="checkbox"
              checked={settings.invoices}
              onChange={() => handleToggleCategory('invoices')}
              className="w-4 h-4 accent-[#EE1D45] rounded cursor-pointer"
            />
          </div>

          {/* 8. Local Works */}
          <div className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-900">Local Works</div>
              <div className="text-[11px] text-zinc-500">Production orders, print proofing, &amp; delivery</div>
            </div>
            <input
              type="checkbox"
              checked={settings.localWorks}
              onChange={() => handleToggleCategory('localWorks')}
              className="w-4 h-4 accent-[#EE1D45] rounded cursor-pointer"
            />
          </div>

          {/* 9. Designer Updates */}
          <div className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-zinc-900">Designer Updates</div>
              <div className="text-[11px] text-zinc-500">Revisions added &amp; designer fee settlements</div>
            </div>
            <input
              type="checkbox"
              checked={settings.designerUpdates}
              onChange={() => handleToggleCategory('designerUpdates')}
              className="w-4 h-4 accent-[#EE1D45] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Test Notification Action */}
      <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
        <div className="text-xs text-zinc-500 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-zinc-400" />
          <span>Test browser notifications on this device</span>
        </div>

        <button
          id="btn-test-browser-notif"
          onClick={handleSendTestNotification}
          disabled={permissionState !== 'granted'}
          className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{testSent ? 'Test Sent!' : 'Send Test Notification'}</span>
        </button>
      </div>
    </div>
  );
};
