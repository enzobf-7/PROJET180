'use client'

interface GlcLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const SIZES = {
  sm: { container: 32, font: 13 },
  md: { container: 44, font: 18 },
  lg: { container: 60, font: 24 },
  xl: { container: 120, font: 32 },
}

export default function GlcLogo({ size = 'md', showText = false }: GlcLogoProps) {
  const { container, font } = SIZES[size]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/logo.jpg"
        alt="GLC"
        width={container}
        height={container}
        style={{
          borderRadius: size === 'xl' ? 16 : 8,
          flexShrink: 0,
          display: 'block',
        }}
      />
      {showText && (
        <span
          style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 700,
            fontSize: font * 0.9,
            color: '#F2F2F5',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Gentleman Létal Club
        </span>
      )}
    </div>
  )
}
