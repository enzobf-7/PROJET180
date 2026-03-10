'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface GlcButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const VARIANTS = {
  primary:
    'bg-glc-accent hover:bg-glc-accent-hover text-white font-semibold hover:shadow-[0_0_24px_rgba(139,26,26,0.45)] active:scale-[0.98]',
  ghost:
    'border border-glc-border text-glc-muted hover:border-glc-accent/60 hover:text-glc-text bg-transparent',
  danger:
    'bg-[rgba(139,26,26,0.15)] border border-[rgba(139,26,26,0.35)] text-[#ff6b6b] hover:bg-[rgba(139,26,26,0.25)]',
}

const SIZES = {
  sm: 'py-2 px-3 text-xs rounded-lg',
  md: 'py-3 px-4 text-sm rounded-xl',
  lg: 'py-3.5 px-6 text-sm rounded-xl',
}

export const GlcButton = forwardRef<HTMLButtonElement, GlcButtonProps>(
  function GlcButton(
    {
      variant = 'primary',
      size = 'lg',
      loading = false,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          VARIANTS[variant],
          SIZES[size],
          fullWidth ? 'w-full' : '',
          'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
