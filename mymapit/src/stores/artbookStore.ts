import { create } from 'zustand'
import type { Keyword, StoryNode } from './types'

type State = {
  storyNodes: StoryNode[]
  keywords: Keyword[]
  setArtbookData: (storyNodes: StoryNode[], keywords: Keyword[]) => void
  patchStoryNode: (id: string, patch: Partial<Pick<StoryNode, 'tension' | 'relaxation' | 'emotionExtras'>>) => void
  resetArtbook: () => void
}

export const useArtbookStore = create<State>((set) => ({
  storyNodes: [],
  keywords: [],

  setArtbookData: (storyNodes, keywords) => set({ storyNodes, keywords }),

  patchStoryNode: (id, patch) =>
    set((s) => ({
      storyNodes: s.storyNodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),

  resetArtbook: () => set({ storyNodes: [], keywords: [] }),
}))
