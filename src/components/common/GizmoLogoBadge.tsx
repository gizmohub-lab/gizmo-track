import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface GizmoLogoBadgeProps {
  /**
   * Actual unread notification count.
   * If 0 or negative, badge is completely hidden.
   */
  unreadCount: number;
  /**
   * Optional click handler for when user clicks directly on the badge.
   * Automatically stops propagation so it doesn't conflict with logo navigation.
   */
  onBadgeClick?: (e: React.MouseEvent) => void;
  /**
   * Size preset for the badge container.
   * - sm: mobile drawer / compact header (~18-20px)
   * - md: standard sidebar / header logo (~20-24px)
   * - lg: large banner / hero logo (~24-28px)
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional class names for the outer relative wrapper.
   */
  className?: string;
  /**
   * Custom positioning classes if needed. Default: '-top-1.5 -right-1.5 sm:-top-2 sm:-right-2'
   */
  badgePositionClassName?: string;
  /**
   * Logo or icon element to wrap with the badge overlay.
   */
  children: React.ReactNode;
}

/**
 * Format notification badge count:
 * 0 -> null
 * 1..99 -> exact string
 * 100+ -> '99+'
 */
export function formatBadgeCount(count: number): string | null {
  if (!count || count <= 0) return null;
  if (count > 99) return '99+';
  return String(count);
}

/**
 * Gizmo App / Logo Notification Badge
 *
 * Adds a modern, mobile-style circular red notification number badge
 * overlapping the top-right corner of the Gizmo logo icon.
 *
 * - Number is dynamic based on real unread notifications
 * - 0 unread = completely hidden (no empty red circle)
 * - 100+ unread = 99+
 * - Subtle one-time scale appearance animation (0.8 -> 1)
 * - Accessible aria-labels and tooltips
 */
export const GizmoLogoBadge: React.FC<GizmoLogoBadgeProps> = ({
  unreadCount,
  onBadgeClick,
  size = 'md',
  className = '',
  badgePositionClassName = '-top-1.5 -right-1.5 sm:-top-2 sm:-right-2',
  children,
}) => {
  const displayCount = formatBadgeCount(unreadCount);
  const prevCountRef = useRef(unreadCount);

  useEffect(() => {
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Sizing styles
  const sizeClasses = {
    sm: 'min-w-[18px] h-[18px] text-[9px] px-1',
    md: 'min-w-[20px] h-[20px] sm:min-w-[22px] sm:h-[22px] text-[10px] sm:text-[11px] px-1 sm:px-1.5',
    lg: 'min-w-[24px] h-[24px] text-xs px-1.5',
  }[size];

  const accessibleLabel =
    unreadCount === 1 ? '1 unread notification' : `${unreadCount} unread notifications`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {children}

      <AnimatePresence>
        {displayCount !== null && (
          <motion.span
            key={`gizmo-badge-${displayCount}`}
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
            className={`absolute ${badgePositionClassName} ${sizeClasses} z-20 rounded-full bg-[#EE1D45] text-white font-mono font-black leading-none flex items-center justify-center border-2 border-white shadow-md select-none pointer-events-auto transition-transform active:scale-95 ${
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
