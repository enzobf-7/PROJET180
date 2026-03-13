// ─── Dashboard Types ─────────────────────────────────────────────────────────

export interface Habit {
  id: string
  name: string
  category: 'habit' | 'mission'
}

export interface Gamification {
  xp_total: number
  current_streak: number
  longest_streak: number
  level: number
}

export interface LeaderboardEntry {
  rank: number
  clientId: string
  firstName: string
  xp: number
  streak: number
  isMe: boolean
}

export interface DashboardProps {
  jourX: number
  firstName: string
  gamification: Gamification
  habits: Habit[]
  completedHabitIds: string[]
  responses: Record<string, unknown>
  leaderboard: LeaderboardEntry[]
  onboardingDate: string | null
  whatsappLink: string | null
  weeklyXP: number
  initialTodos: Todo[]
  initialWins: Win[]
  weekNumber: number
}

export interface XPParticle {
  id: number
  delta: number
  multiplier: number
}

export interface Todo {
  id: string
  title: string
  is_system: boolean
  completed_date: string | null
}

export interface Win {
  id: string
  content: string
  created_at: string
}
