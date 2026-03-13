'use client'

import Image from 'next/image'

interface P180LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const HEIGHTS: Record<string, number> = {
  sm: 20,
  md: 28,
  lg: 36,
  xl: 48,
}

export default function P180Logo({ size = 'md' }: P180LogoProps) {
  const h = HEIGHTS[size]
  // SVG viewBox is 600x80 → aspect ratio 7.5:1
  const w = Math.round(h * (600 / 80))

  return (
    <Image
      src="/logo-projet180.svg"
      alt="PROJET180"
      width={w}
      height={h}
      priority
      className="select-none"
      style={{ height: h, width: 'auto' }}
    />
  )
}
