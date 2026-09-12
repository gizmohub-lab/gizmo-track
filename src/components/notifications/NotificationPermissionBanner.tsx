import React, { useState, useEffect } from 'react';
import { Bell, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  getNotificationPermissionState,
  requestBrowserNotificationPermission,
  saveNotificationSettings,
  loadNotificationSettings,
} from '../../utils/notificationSystem';

interface NotificationPermissionBannerProps {
  onPermissionGranted?: () => void;
  onDismiss?: () => void;
}

export const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({
  onPermissionGranted,
  onDismiss,
}) => {
  const [permissionState, setPermissionState] = useState(getNotificationPermissionState());
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('gizmo_notif_banner_dismissed') === 'true';
  });
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    setPermissionState(getNotificationPermissionState());
  }, []);

  if (dismissed || permissionState === 'granted' || permissionState === 'unsupported') {
    return null;
  }

  const handleEnableNotifications = async () => {
    setIsEnabling(true);
    const granted = await requestBrowserNotificationPermission();
    setIsEnabling(false);

    if (granted) {
      setPermissionState('granted');
      const settings = loadNotificationSettings();
      settings.enableBrowserNotifications = true;
      saveNotificationSettings(settings);

      if (onPermissionGranted) onPermissionGranted();
    } else {
      setPermissionState(getNotificationPermissionState());
    }
  };

  const handleNotNow = () => {
    setDismissed(true);
    localStorage.setItem('gizmo_notif_banner_dismissed', 'true');
    if (onDismiss) onDismiss();
  };

  return (
    <div
      id="notification-permission-banner"
      className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 text-white shadow-xl relative overflow-hidden my-4 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#EE1D45]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EE1D45] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0 transition-transform duration-200 group-hover:scale-110">
            <Bell className="w-5 h-5 text-white animate-bell-swing" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-tight">Enable Gizmo Notifications</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EE1D45]/20 text-[#EE1D45] border border-[#EE1D45]/30">
                RECOMMENDED
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
              Get notified about deadlines, new projects, payments and important updates even when you&apos;re not viewing Gizmo.
            </p>

            {permissionState === 'denied' && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 mt-2 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-800/50">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Browser notifications are blocked. Enable them in browser settings.</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
          <button
            id="btn-notif-banner-enable"
            onClick={handleEnableNotifications}
            disabled={isEnabling || permissionState === 'denied'}
            className="px-4 py-2 bg-[#EE1D45] hover:bg-[#D8143C] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isEnabling ? 'Enabling...' : 'Enable Notifications'}</span>
          </button>

          <button
            id="btn-notif-banner-not-now"
            onClick={handleNotNow}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition whitespace-nowrap"
          >
            Not Now
          </button>

          <button
            onClick={handleNotNow}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
