import React from 'react';

export interface GizmoLogoProps {
  /** Size class or pixel dimension */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  alt?: string;
}

/**
 * Official Gizmo Mascot Logo Component
 *
 * Renders the official GIZMO ICON mascot with crimson squircle background.
 */
export const GizmoLogo: React.FC<GizmoLogoProps> = ({
  size = 'md',
  className = '',
  alt = 'Gizmo Design',
}) => {
  const sizeMap: Record<string, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
    '2xl': 'w-20 h-20',
    custom: '',
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative shrink-0 select-none overflow-hidden rounded-[22%] shadow-xs transition-transform duration-200 ${selectedSize} ${className}`}
    >
      <img
        src="/icon.svg"
        alt={alt}
        className="w-full h-full object-contain block pointer-events-none"
        loading="eager"
        decoding="sync"
      />
    </div>
  );
};
