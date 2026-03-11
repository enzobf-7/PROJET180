'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface GlcInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const GlcInput = forwardRef<HTMLInputElement, GlcInputProps>(
  function GlcInput({ label, error, className = '', id, ...props }, ref) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-glc-muted uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-4 py-3 bg-glc-bg border rounded-xl text-glc-text placeholder:text-glc-muted/40',
            'focus:outline-none transition-all duration-200 text-sm',
            error
              ? 'border-[#DC2626] focus:border-[#B91C1C] focus:shadow-[0_0_0_3px_rgba(58,134,255,0.15)]'
              : 'border-glc-border focus:border-glc-accent focus:shadow-[0_0_0_3px_rgba(58,134,255,0.12)]',
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
