import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MentionKind } from '../constants/mentionKinds'

type Pos = { x: number; y: number }

/** 연결맵 탭용 — 메모 공출현 이웃 (좌표 레이아웃과 별도, persist 제외) */
export type SnapNeighborDTO = {
  id: string
  targetId: string
  weight: number
  kind: MentionKind
  label: string
}

type LinkBundle = {
  signature: string
  neighbors: Record<string, SnapNeighborDTO[]>
}

type State = {
  layouts: Record<string, Record<string, Pos>>
  linkBundles: Record<string, LinkBundle>
  setLayout: (projectId: string, positions: Record<string, Pos>) => void
  setNodePosition: (projectId: string, nodeKey: string, pos: Pos) => void
  clearProjectLayout: (projectId: string) => void
  /** 그래프 시그니처와 함께 이웃 맵 동기화 (연결맵 칩 UI 데이터 소스) */
  syncSnapLinks: (projectId: string, signature: string, neighbors: Record<string, SnapNeighborDTO[]>) => void
}

export const useSnapMapStore = create<State>()(
  persist(
    (set) => ({
      layouts: {},
      linkBundles: {},

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

      syncSnapLinks: (projectId, signature, neighbors) =>
        set((s) => ({
          linkBundles: {
            ...s.linkBundles,
            [projectId]: { signature, neighbors },
          },
        })),
    }),
    {
      name: 'mymapit-snap-map',
      partialize: (s) => ({ layouts: s.layouts }),
    },
  ),
)
