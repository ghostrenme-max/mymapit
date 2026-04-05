import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Pos = { x: number; y: number }

type State = {
  /** projectId → nodeKey → 좌표 */
  layouts: Record<string, Record<string, Pos>>
  /** 그래프 서명이 바뀌었을 때 자동 재배치를 허용할지(수동 초기화 시 true) */
  setLayout: (projectId: string, positions: Record<string, Pos>) => void
  setNodePosition: (projectId: string, nodeKey: string, pos: Pos) => void
  clearProjectLayout: (projectId: string) => void
}

export const useSnapMapStore = create<State>()(
  persist(
    (set) => ({
      layouts: {},

      setLayout: (projectId, positions) =>
        set((s) => ({
          layouts: { ...s.layouts, [projectId]: { ...positions } },
        })),

      setNodePosition: (projectId, nodeKey, pos) =>
        set((s) => {
          const prev = s.layouts[projectId] ?? {}
          return {
            layouts: {
              ...s.layouts,
              [projectId]: { ...prev, [nodeKey]: pos },
            },
          }
        }),

      clearProjectLayout: (projectId) =>
        set((s) => {
          const { [projectId]: _, ...rest } = s.layouts
          return { layouts: rest }
        }),
    }),
    { name: 'mymapit-snap-map' },
  ),
)
