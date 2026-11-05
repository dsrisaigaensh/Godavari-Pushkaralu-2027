import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'saffron';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg',
    md: 'px-3.5 py-2 text-sm rounded-lg',
    lg: 'px-5 py-2.5 text-base rounded-xl',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-brand to-[#911A1E] text-white hover:from-brand-hover hover:to-brand shadow-sm border border-transparent focus:ring-brand/30 font-semibold',
    saffron:
      'bg-gradient-to-r from-saffron to-[#F59E0B] text-white hover:from-saffron-hover hover:to-amberGold shadow-sm border border-transparent focus:ring-saffron/30 font-semibold',
    secondary:
      'bg-white text-textPrimary hover:bg-surfaceWarm border border-borderLight shadow-subtle focus:ring-saffron/20 font-medium',
    outline:
      'bg-transparent text-brand border border-brand/30 hover:bg-brand-light focus:ring-brand/20 font-medium',
    danger:
      'bg-govError text-white hover:bg-red-800 shadow-sm border border-transparent focus:ring-govError-light font-medium',
    ghost:
      'bg-transparent text-textSecondary hover:text-textPrimary hover:bg-surfaceWarm focus:ring-saffron/20',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
