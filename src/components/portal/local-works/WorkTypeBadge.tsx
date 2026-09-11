import React from 'react';
import { Sparkles, Video, FileImage, Tag } from 'lucide-react';

interface WorkTypeBadgeProps {
  workType?: string;
  otherDetail?: string;
  className?: string;
  showIcon?: boolean;
}

export const WorkTypeBadge: React.FC<WorkTypeBadgeProps> = ({
  workType = 'Poster',
  otherDetail,
  className = '',
  showIcon = true,
}) => {
  const normalized = (workType || 'Poster').toLowerCase().trim();

  if (normalized === 'poster') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap ${className}`}
        title="Poster — Static graphic/design"
      >
        {showIcon && <FileImage className="w-3 h-3 text-blue-600 shrink-0" />}
        <span>Poster</span>
      </span>
    );
  }

  if (normalized === 'motion') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap ${className}`}
        title="Motion — Animated/motion-design"
      >
        {showIcon && <Video className="w-3 h-3 text-purple-600 shrink-0" />}
        <span>Motion</span>
      </span>
    );
  }

  if (normalized === 'other') {
    const label = otherDetail ? `Other: ${otherDetail}` : 'Other';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 whitespace-nowrap max-w-[160px] truncate ${className}`}
        title={otherDetail ? `Other Work Type: ${otherDetail}` : 'Other Work Type'}
      >
        {showIcon && <Tag className="w-3 h-3 text-zinc-500 shrink-0" />}
        <span className="truncate">{label}</span>
      </span>
    );
  }

  // Custom Work Types
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap ${className}`}
      title={`Work Type: ${workType}`}
    >
      {showIcon && <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />}
      <span>{workType}</span>
    </span>
  );
};
