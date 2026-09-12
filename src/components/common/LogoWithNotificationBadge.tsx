import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GizmoLogo } from './GizmoLogo';

export interface LogoWithNotificationBadgeProps {
  /**
   * Dynamic count of unread notifications.
   * If 0 or less, the badge will be completely hidden.
   */
  unreadCount: number;
  /**
   * Size preset for the logo and badge.
   * - 'sm': 32px logo, compact badge
   * - 'md': 36px logo, standard badge
   * - 'lg': 44px logo, large badge
   * - 'xl': 56px logo, extra large badge
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Optional click handler for when user clicks directly on the notification badge.
   */
  onBadgeClick?: (e: React.MouseEvent) => void;
  /**
   * Optional custom logo element. If omitted, uses the official <GizmoLogo />.
   */
  children?: React.ReactNode;
  /**
   * Additional container CSS classes.
   */
  className?: string;
}

/**
 * Format notification badge count:
 * - 0 or negative -> null (hidden)
 * - 1..99 -> exact count string
 * - 100+ -> '99+'
 */
export function formatBadgeCount(count: number): string | null {
  if (!count || count <= 0) return null;
  if (count > 99) return '99+';
  return String(count);
}

/**
 * LogoWithNotificationBadge
 *
 * Renders an absolute-positioned red notification badge over the top-right
 * corner of the application logo, displaying the dynamic count of unread
 * notifications, and automatically hiding when the count is zero.
 */
export const LogoWithNotificationBadge: React.FC<LogoWithNotificationBadgeProps> = ({
  unreadCount,
  size = 'md',
  onBadgeClick,
  children,
  className = '',
}) => {
  const displayCount = formatBadgeCount(unreadCount);

  // Size styling configuration
  const config = {
    sm: {
      logoSize: 'sm' as const,
      badgePosition: '-top-1.5 -right-1.5',
      badgeSize: 'min-w-[18px] h-[18px] text-[9px] px-1',
      borderWidth: 'border-2',
    },
    md: {
      logoSize: 'md' as const,
      badgePosition: '-top-1.5 -right-1.5 sm:-top-2 sm:-right-2',
      badgeSize: 'min-w-[20px] h-[20px] sm:min-w-[22px] sm:h-[22px] text-[10px] sm:text-[11px] px-1 sm:px-1.5',
      borderWidth: 'border-2',
    },
    lg: {
      logoSize: 'lg' as const,
      badgePosition: '-top-2 -right-2',
      badgeSize: 'min-w-[24px] h-[24px] text-xs px-1.5',
      borderWidth: 'border-2',
    },
    xl: {
      logoSize: 'xl' as const,
      badgePosition: '-top-2.5 -right-2.5',
      badgeSize: 'min-w-[28px] h-[28px] text-xs font-bold px-2',
      borderWidth: 'border-[2.5px]',
    },
  }[size];

  const accessibleLabel =
    unreadCount === 1 ? '1 unread notification' : `${unreadCount} unread notifications`;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Application Logo (or custom children) */}
      {children || <GizmoLogo size={config.logoSize} />}

      {/* Absolute-positioned Red Notification Badge */}
      <AnimatePresence>
        {displayCount !== null && (
          <motion.span
            key={`logo-notification-badge-${displayCount}`}
            role={onBadgeClick ? 'button' : 'status'}
            tabIndex={onBadgeClick ? 0 : undefined}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 24,
            }}
            onClick={(e) => {
              if (onBadgeClick) {
                e.preventDefault();
                e.stopPropagation();
                onBadgeClick(e);
              }
            }}
            onKeyDown={(e) => {
              if (onBadgeClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                e.stopPropagation();
                onBadgeClick(e as unknown as React.MouseEvent);
              }
            }}
            title={accessibleLabel}
            aria-label={accessibleLabel}
            className={`absolute ${config.badgePosition} ${config.badgeSize} ${config.borderWidth} z-20 rounded-full bg-[#EE1D45] text-white font-mono font-black leading-none flex items-center justify-center border-white shadow-md select-none pointer-events-auto transition-transform active:scale-95 ${
              onBadgeClick ? 'cursor-pointer hover:scale-110 hover:brightness-105' : 'cursor-default'
            }`}
          >
            <span>{displayCount}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogoWithNotificationBadge;
