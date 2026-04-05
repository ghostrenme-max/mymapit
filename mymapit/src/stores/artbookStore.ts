import { create } from 'zustand'
import type { AiInfoCard, Keyword, StoryNode } from './types'

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

type State = {
  storyNodes: StoryNode[]
  keywords: Keyword[]
  aiInfoCards: AiInfoCard[]
  setArtbookData: (storyNodes: StoryNode[], keywords: Keyword[], aiInfoCards?: AiInfoCard[]) => void
  addAiInfoCard: (card: Omit<AiInfoCard, 'id' | 'createdAt'>) => AiInfoCard
  resetArtbook: () => void
}

export const useArtbookStore = create<State>((set) => ({
  storyNodes: [],
  keywords: [],
  aiInfoCards: [],

  setArtbookData: (storyNodes, keywords, aiInfoCards = []) =>
    set({ storyNodes, keywords, aiInfoCards }),

  addAiInfoCard: (partial) => {
    const card: AiInfoCard = {
      ...partial,
      id: newId('aiinfo'),
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ aiInfoCards: [...s.aiInfoCards, card] }))
    return card
  },

  resetArtbook: () => set({ storyNodes: [], keywords: [], aiInfoCards: [] }),
}))
