import { useArtbookStore } from '../stores/artbookStore'
import { useMentionStore } from '../stores/mentionStore'
import type { Character, WorldObject } from '../stores/types'

const UNDEF = '정보 미정'

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`
}

export function addCharacterStub(projectId: string, name: string): { id: string; name: string } {
  const id = newId('ch')
  const c: Character = {
    id,
    projectId,
    name: name.trim() || UNDEF,
    role: 'hero',
    personality: UNDEF,
    ability: UNDEF,
    likes: UNDEF,
    dislikes: UNDEF,
    tags: ['가져오기'],
    colors: ['#111110', '#D8D4CF'],
    imageUri: null,
    quote: UNDEF,
    voiceTone: { pitch: 50, emotion: 50, speed: 50 },
    relations: [],
    values: [{ id: `val-${crypto.randomUUID().slice(0, 12)}`, theme: '서사', answer: UNDEF }],
    storyNodeIds: [],
  }
  useMentionStore.setState((s) => ({ characters: [...s.characters, c] }))
  return { id, name: c.name }
}

export function addWorldObjectStub(
  projectId: string,
  name: string,
  type: WorldObject['type'],
): { id: string; name: string } {
  const id = newId('wo')
  const o: WorldObject = {
    id,
    projectId,
    name: name.trim() || UNDEF,
    type,
    description: UNDEF,
    tags: ['가져오기'],
  }
  useMentionStore.setState((s) => ({ worldObjects: [...s.worldObjects, o] }))
  return { id, name: o.name }
}

export function addKeywordStub(projectId: string, text: string): { id: string; name: string } {
  const id = newId('kw')
  useArtbookStore.setState((s) => ({
    keywords: [
      ...s.keywords,
      {
        id,
        projectId,
        text: text.trim() || UNDEF,
        category: 'background',
      },
    ],
  }))
  return { id, name: text.trim() || UNDEF }
}
