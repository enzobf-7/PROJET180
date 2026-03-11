'use client'

interface GlcLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

// Widths pour une image 1280×356 (ratio ~3.6:1)
const WIDTHS = {
  sm: 80,
  md: 140,
  lg: 180,
  xl: 240,
}

export default function GlcLogo({ size = 'md' }: GlcLogoProps) {
  const width = WIDTHS[size]

  return (
    <img
      src="/logo-projet180.png"
      alt="Projet180"
      width={width}
      style={{ height: 'auto', display: 'block', flexShrink: 0 }}
    />
  )
}
