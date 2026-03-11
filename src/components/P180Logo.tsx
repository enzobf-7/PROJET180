'use client'

interface P180LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZES = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
}

export default function P180Logo({ size = 'md' }: P180LogoProps) {
  return (
    <span
      className={`${SIZES[size]} font-bold tracking-[0.15em] text-white select-none`}
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      PROJET180
    </span>
  )
}
