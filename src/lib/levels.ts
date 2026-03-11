export interface Level {
  name: string
  min: number
  max: number
}

export const LEVELS: Level[] = [
  { name: "L'Endormi",            min: 0,     max: 500    },
  { name: "L'Éveillé",            min: 500,   max: 1500   },
  { name: 'Le Bâtisseur',         min: 1500,  max: 3000   },
  { name: 'Le Souverain',         min: 3000,  max: 6000   },
  { name: 'Le Point de Bascule',  min: 6000,  max: 12000  },
  { name: 'Le 180',               min: 12000, max: Infinity },
]

export function getCurrentLevel(xp: number): Level {
  return LEVELS.find(l => xp >= l.min && xp < l.max) ?? LEVELS[LEVELS.length - 1]
}

export function getLevelProgress(xp: number): number {
  const lvl = getCurrentLevel(xp)
  if (lvl.max === Infinity) return 100
  return Math.round(((xp - lvl.min) / (lvl.max - lvl.min)) * 100)
}

export function getNextLevel(xp: number): { name: string; xpNeeded: number } | null {
  const lvl = getCurrentLevel(xp)
  if (lvl.max === Infinity) return null
  const idx = LEVELS.indexOf(lvl)
  return { name: LEVELS[idx + 1]?.name ?? '', xpNeeded: lvl.max - xp }
}

export function getLevelByXp(xp: number): number {
  const idx = LEVELS.findIndex(l => xp >= l.min && xp < l.max)
  return idx >= 0 ? idx + 1 : LEVELS.length
}

export function getLevelName(xp: number): string {
  return getCurrentLevel(xp).name
}
