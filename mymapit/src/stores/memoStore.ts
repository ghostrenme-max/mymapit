import { create } from 'zustand'
import { normalizeMemoMentions } from '../lib/normalizeMemoMention'
import {
  detachMemoFromAllStoryNodes,
  rebuildAllStoryNodeMemoLinks,
  syncStoryNodeLinksForMemo,
} from '../lib/storyNodeMemoLinks'
import { scheduleSyncAfterMemoMutation } from '../lib/syncArtbookFromMemos'
import type { Memo, MemoContentSnapshot, MemoGroup } from './types'

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

type MemoPatch = Partial<
  Pick<Memo, 'title' | 'content' | 'mentions' | 'entitySideNotes' | 'contentSnapshots' | 'writingChecklist'>
>

type State = {
  memoGroups: MemoGroup[]
  memos: Memo[]
  addMemoGroup: (projectId: string, name: string, color?: string) => MemoGroup | null
  addMemo: (groupId: string, title?: string) => Memo
  updateMemo: (id: string, patch: MemoPatch) => void
  pushMemoContentSnapshot: (
    memoId: string,
    snap: Omit<MemoContentSnapshot, 'id' | 'createdAt'> & { label: string },
  ) => void
  deleteMemoContentSnapshot: (memoId: string, snapshotId: string) => void
  deleteMemo: (id: string) => void
  deleteMemoGroup: (id: string) => void
  setMemoState: (groups: MemoGroup[], memos: Memo[]) => void
  resetMemos: () => void
}

const SNAPSHOT_CAP = 15

export const useMemoStore = create<State>((set, get) => ({
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
    scheduleSyncAfterMemoMutation(undefined, projectId)
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
    scheduleSyncAfterMemoMutation(groupId)
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
              ...(patch.mentions != null ? { mentions: normalizeMemoMentions(patch.mentions) } : {}),
            }
          : m,
      ),
    }))
    const m = get().memos.find((x) => x.id === id)
    if (m) {
      syncStoryNodeLinksForMemo(id)
      scheduleSyncAfterMemoMutation(m.groupId)
    }
  },

  pushMemoContentSnapshot: (memoId, snap) => {
    const m = get().memos.find((x) => x.id === memoId)
    if (!m) return
    const full: MemoContentSnapshot = {
      id: newId('snap'),
      createdAt: new Date().toISOString(),
      ...snap,
    }
    const prev = m.contentSnapshots ?? []
    const next = [full, ...prev].slice(0, SNAPSHOT_CAP)
    set((s) => ({
      memos: s.memos.map((x) => (x.id === memoId ? { ...x, contentSnapshots: next } : x)),
    }))
    scheduleSyncAfterMemoMutation(m.groupId)
  },

  deleteMemoContentSnapshot: (memoId, snapshotId) => {
    const m = get().memos.find((x) => x.id === memoId)
    if (!m) return
    const prev = m.contentSnapshots ?? []
    const next = prev.filter((x) => x.id !== snapshotId)
    set((s) => ({
      memos: s.memos.map((x) => (x.id === memoId ? { ...x, contentSnapshots: next } : x)),
    }))
    scheduleSyncAfterMemoMutation(m.groupId)
  },

  deleteMemo: (id) => {
    const m = get().memos.find((x) => x.id === id)
    const gid = m?.groupId
    detachMemoFromAllStoryNodes(id)
    set((s) => ({ memos: s.memos.filter((x) => x.id !== id) }))
    if (gid) scheduleSyncAfterMemoMutation(gid)
  },

  deleteMemoGroup: (id) => {
    const g = get().memoGroups.find((x) => x.id === id)
    const pid = g?.projectId
    const toRemove = get().memos.filter((m) => m.groupId === id)
    for (const m of toRemove) detachMemoFromAllStoryNodes(m.id)
    set((s) => ({
      memoGroups: s.memoGroups.filter((x) => x.id !== id),
      memos: s.memos.filter((m) => m.groupId !== id),
    }))
    if (pid) scheduleSyncAfterMemoMutation(undefined, pid)
  },

  setMemoState: (memoGroups, memos) => {
    const normalized = memos.map((m) => ({
      ...m,
      mentions: normalizeMemoMentions(m.mentions),
      contentSnapshots: m.contentSnapshots?.map((snap) => ({
        ...snap,
        mentions: normalizeMemoMentions(snap.mentions),
      })),
    }))
    set({ memoGroups, memos: normalized })
    queueMicrotask(() => rebuildAllStoryNodeMemoLinks())
  },

  resetMemos: () => set({ memoGroups: [], memos: [] }),
}))
