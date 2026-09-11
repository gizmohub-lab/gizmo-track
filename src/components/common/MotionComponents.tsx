import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

/* 1. Animated Count-Up Number */
interface AnimatedCountUpProps {
  value: number;
  isCurrency?: boolean;
  duration?: number; // in ms
  prefix?: string;
  className?: string;
}

export const AnimatedCountUp: React.FC<AnimatedCountUpProps> = ({
  value,
  isCurrency = false,
  duration = 600,
  prefix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easedProgress * value);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = isCurrency
    ? formatINR(displayValue)
    : `${prefix}${displayValue.toLocaleString('en-IN')}`;

  return <span className={className}>{formatted}</span>;
};

/* 2. Reusable Save/Delete Success Toast Notification */
export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-zinc-950 text-white rounded-xl shadow-xl border border-zinc-800 text-xs font-semibold"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* 3. Skeleton Loading State Components */
interface SkeletonCardProps {
  count?: number;
  type?: 'card' | 'row' | 'stat';
}

export const SkeletonLoader: React.FC<SkeletonCardProps> = ({
  count = 3,
  type = 'card',
}) => {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs space-y-2 skeleton-pulse"
          >
            <div className="h-3 w-16 bg-zinc-200 rounded" />
            <div className="h-6 w-20 bg-zinc-300 rounded" />
            <div className="h-2 w-12 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'row') {
    return (
      <div className="space-y-2">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between skeleton-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-200" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-zinc-200 rounded" />
                <div className="h-2.5 w-20 bg-zinc-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-16 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="p-4 bg-white border border-zinc-200 rounded-2xl space-y-3 skeleton-pulse"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-zinc-200 rounded" />
            <div className="h-5 w-16 bg-zinc-100 rounded-full" />
          </div>
          <div className="h-3 w-40 bg-zinc-100 rounded" />
          <div className="pt-2 flex justify-between items-center border-t border-zinc-100">
            <div className="h-3 w-20 bg-zinc-200 rounded" />
            <div className="h-7 w-20 bg-zinc-900/10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

/* 4. Smooth Checkmark for Deliverables ○ -> ✓ */
interface CheckmarkBoxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
}

export const DeliverableCheckbox: React.FC<CheckmarkBoxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      disabled={disabled}
      className="group flex items-center gap-2 select-none text-left focus:outline-none"
    >
      <motion.div
        whileTap={{ scale: 0.9 }}
        animate={{
          backgroundColor: checked ? '#10b981' : '#ffffff',
          borderColor: checked ? '#10b981' : '#d4d4d8',
        }}
        transition={{ duration: 0.15 }}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-zinc-300 group-hover:border-zinc-500'
        }`}
      >
        <AnimatePresence mode="wait">
          {checked ? (
            <motion.div
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </motion.div>
          ) : (
            <span key="empty" className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-zinc-300 transition-colors" />
          )}
        </AnimatePresence>
      </motion.div>
      {label && (
        <span
          className={`text-xs font-semibold transition-colors ${
            checked ? 'line-through text-zinc-400 font-normal' : 'text-zinc-900'
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
};
