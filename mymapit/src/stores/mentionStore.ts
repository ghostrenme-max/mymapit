import { create } from 'zustand'
import type { Character, WorldObject } from './types'

type State = {
  characters: Character[]
  worldObjects: WorldObject[]
  setMentionEntities: (characters: Character[], worldObjects: WorldObject[]) => void
  resetMention: () => void
}

export const useMentionStore = create<State>((set) => ({
  characters: [],
  worldObjects: [],

  setMentionEntities: (characters, worldObjects) => set({ characters, worldObjects }),

  resetMention: () => set({ characters: [], worldObjects: [] }),
}))
