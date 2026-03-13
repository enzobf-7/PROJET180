'use client'

import { memo } from 'react'
import { C, D, M } from '@/lib/design-tokens'
import type { Todo } from '@/lib/types'

interface Props {
  todos: Todo[]
  todayDate: string
  onToggleTodo: (todoId: string, currentDate: string | null) => void
}

export const TodoCard = memo(function TodoCard({ todos, todayDate, onToggleTodo }: Props) {
  return (
    <div className="p180-fade p180-card" style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '18px 20px',
      animationDelay: '0.1s',
    }}>
      <div style={{ ...D, fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.text, marginBottom: 14 }}>
        To-do du jour
      </div>
      {todos.length === 0 ? (
        <div style={{ ...M, fontSize: '11px', color: C.muted, padding: '8px 0' }}>Aucune to-do</div>
      ) : (
        <>
          {todos.map(todo => {
            const isDone = todo.completed_date === todayDate
            return (
              <button key={todo.id} onClick={() => onToggleTodo(todo.id, todo.completed_date)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 0',
                transition: 'opacity 0.15s',
              }}>
                <div style={{
                  width: 18, height: 18, flexShrink: 0,
                  borderRadius: 4,
                  border: `2px solid ${isDone ? C.greenL : C.muted}`,
                  background: isDone ? C.greenL : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {isDone && <span style={{ color: 'white', fontSize: '11px', lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{
                  ...D, fontWeight: 600, fontSize: '13px',
                  color: isDone ? C.muted : C.text,
                  textDecoration: isDone ? 'line-through' : 'none',
                  textAlign: 'left',
                }}>
                  {todo.title}
                  {todo.is_system && <span style={{ ...M, fontSize: '8px', color: C.accent, marginLeft: 6 }}>SYSTÈME</span>}
                </span>
              </button>
            )
          })}
        </>
      )}
    </div>
  )
})
