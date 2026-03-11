'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface P180InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const P180Input = forwardRef<HTMLInputElement, P180InputProps>(
  function P180Input({ label, error, className = '', id, ...props }, ref) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-p180-muted uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-4 py-3 bg-p180-bg border rounded-xl text-p180-text placeholder:text-p180-muted/40',
            'focus:outline-none transition-all duration-200 text-sm',
            error
              ? 'border-[#DC2626] focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(58,134,255,0.15)]'
              : 'border-p180-border focus:border-p180-accent focus:shadow-[0_0_0_3px_rgba(58,134,255,0.12)]',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#ff6b6b] mt-0.5">{error}</p>
        )}
      </div>
    )
  }
)
