'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all cursor-pointer select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.985]';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold shadow-xs',
      secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800',
      outline: 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 text-slate-700 shadow-2xs',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900',
      destructive: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold shadow-xs',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs min-h-[36px] rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-sm min-h-[42px] rounded-xl gap-2',
      lg: 'px-6 py-3.5 text-base min-h-[48px] rounded-xl gap-2.5 font-semibold',
      icon: 'p-2 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
