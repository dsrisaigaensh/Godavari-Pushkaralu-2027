import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand' | 'saffron';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses: Record<BadgeVariant, string> = {
    brand: 'bg-[#FDF2F2] text-brand border border-[#FECACA]',
    saffron: 'bg-saffron-light text-saffron-dark border border-saffron-border',
    success: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    error: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
    info: 'bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]',
    neutral: 'bg-stone-100 text-stone-700 border border-stone-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium tracking-wide ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
