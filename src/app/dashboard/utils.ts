// XP gagné par habitude selon le streak actuel
export function getXpDelta(streak: number): number {
  if (streak >= 30) return 30   // ×3
  if (streak >= 14) return 20   // ×2
  if (streak >= 7)  return 15   // ×1.5
  return 10                      // ×1
}
