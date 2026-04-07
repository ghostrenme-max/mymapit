import { create } from 'zustand'
import type { Character, WorldObject } from './types'

export type CharacterPatch = Partial<
  Pick<
    Character,
    | 'relations'
    | 'imageUri'
    | 'quote'
    | 'personality'
    | 'ability'
    | 'likes'
    | 'dislikes'
    | 'voiceTone'
    | 'colors'
    | 'values'
  >
>

type State = {
  characters: Character[]
  worldObjects: WorldObject[]
  setMentionEntities: (characters: Character[], worldObjects: WorldObject[]) => void
  patchCharacter: (id: string, patch: CharacterPatch) => void
  addWorldObject: (o: WorldObject) => void
  removeWorldObject: (id: string) => void
  resetMention: () => void
}

export const useMentionStore = create<State>((set) => ({
  characters: [],
  worldObjects: [],

  setMentionEntities: (characters, worldObjects) => set({ characters, worldObjects }),

  patchCharacter: (id, patch) =>
    set((s) => ({
      characters: s.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  addWorldObject: (o) => set((s) => ({ worldObjects: [...s.worldObjects, o] })),

  removeWorldObject: (id) =>
    set((s) => ({ worldObjects: s.worldObjects.filter((x) => x.id !== id) })),

  resetMention: () => set({ characters: [], worldObjects: [] }),
}))
