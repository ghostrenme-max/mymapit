import { create } from 'zustand'
import type { Memo, MemoGroup } from './types'

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

type State = {
  memoGroups: MemoGroup[]
  memos: Memo[]
  addMemoGroup: (projectId: string, name: string, color?: string) => MemoGroup | null
  addMemo: (groupId: string, title?: string) => Memo
  updateMemo: (id: string, patch: Partial<Pick<Memo, 'title' | 'content' | 'mentions'>>) => void
  deleteMemo: (id: string) => void
  deleteMemoGroup: (id: string) => void
  setMemoState: (groups: MemoGroup[], memos: Memo[]) => void
  resetMemos: () => void
}

export const useMemoStore = create<State>((set) => ({
  memoGroups: [],
  memos: [],

  addMemoGroup: (projectId, name, color = '#111110') => {
    const g: MemoGroup = {
      id: newId('mg'),
      projectId,
      name,
      color,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ memoGroups: [...s.memoGroups, g] }))
    return g
  },

  addMemo: (groupId, title = '') => {
    const m: Memo = {
      id: newId('memo'),
      groupId,
      title,
      content: '',
      mentions: [],
      updatedAt: new Date().toISOString(),
    }
    set((s) => ({ memos: [...s.memos, m] }))
    return m
  },

  updateMemo: (id, patch) => {
    set((s) => ({
      memos: s.memos.map((m) =>
        m.id === id
          ? {
              ...m,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : m,
      ),
    }))
  },

  deleteMemo: (id) => set((s) => ({ memos: s.memos.filter((m) => m.id !== id) })),

  deleteMemoGroup: (id) =>
    set((s) => ({
      memoGroups: s.memoGroups.filter((g) => g.id !== id),
      memos: s.memos.filter((m) => m.groupId !== id),
    })),

  setMemoState: (memoGroups, memos) => set({ memoGroups, memos }),

  resetMemos: () => set({ memoGroups: [], memos: [] }),
}))
