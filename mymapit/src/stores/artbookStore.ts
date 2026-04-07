import { create } from 'zustand'
import { TRIGGER_EMOTION_LABEL } from '../constants/storyNarrative'
import type { CharacterRelation, Keyword, RelationTrigger, StoryNode } from './types'
import { useMentionStore } from './mentionStore'
import { useToastStore } from './toastStore'

export type StoryNodePatch = Partial<
  Omit<StoryNode, 'id' | 'projectId' | 'type'> & { type?: StoryNode['type'] }
>

type State = {
  storyNodes: StoryNode[]
  keywords: Keyword[]
  relationTriggers: RelationTrigger[]
  setArtbookData: (storyNodes: StoryNode[], keywords: Keyword[], relationTriggers?: RelationTrigger[]) => void
  patchStoryNode: (id: string, patch: StoryNodePatch) => void
  setStoryNodeCharacterIds: (nodeId: string, characterIds: string[]) => void
  addRelationTrigger: (t: Omit<RelationTrigger, 'activated'> & { activated?: boolean }) => void
  patchRelationTrigger: (id: string, patch: Partial<Omit<RelationTrigger, 'id'>>) => void
  removeRelationTrigger: (id: string) => void
  activateEventTriggers: (eventNodeId: string) => void
  resetArtbook: () => void
}

export const useArtbookStore = create<State>((set, get) => ({
  storyNodes: [],
  keywords: [],
  relationTriggers: [],

  setArtbookData: (storyNodes, keywords, relationTriggers = []) =>
    set({ storyNodes, keywords, relationTriggers }),

  patchStoryNode: (id, patch) =>
    set((s) => ({
      storyNodes: s.storyNodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),

  setStoryNodeCharacterIds: (nodeId, nextIds) => {
    const node = get().storyNodes.find((n) => n.id === nodeId)
    if (!node) return
    const prev = node.characterIds
    if (prev.join('|') === nextIds.join('|')) return

    set((s) => ({
      storyNodes: s.storyNodes.map((n) => (n.id === nodeId ? { ...n, characterIds: nextIds } : n)),
    }))

    const ms = useMentionStore.getState()
    for (const id of prev) {
      if (!nextIds.includes(id)) {
        const c = ms.characters.find((x) => x.id === id)
        if (c) {
          ms.patchCharacter(id, { storyNodeIds: c.storyNodeIds.filter((x) => x !== nodeId) })
        }
      }
    }
    for (const id of nextIds) {
      if (!prev.includes(id)) {
        const c = ms.characters.find((x) => x.id === id)
        if (c && !c.storyNodeIds.includes(nodeId)) {
          ms.patchCharacter(id, { storyNodeIds: [...c.storyNodeIds, nodeId] })
        }
      }
    }
  },

  addRelationTrigger: (t) => {
    const row: RelationTrigger = {
      ...t,
      activated: t.activated ?? false,
    }
    set((s) => ({ relationTriggers: [...s.relationTriggers, row] }))
  },

  patchRelationTrigger: (id, patch) =>
    set((s) => ({
      relationTriggers: s.relationTriggers.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),

  removeRelationTrigger: (id) =>
    set((s) => ({ relationTriggers: s.relationTriggers.filter((x) => x.id !== id) })),

  activateEventTriggers: (eventNodeId) => {
    const { storyNodes, relationTriggers } = get()
    const eventNode = storyNodes.find((n) => n.id === eventNodeId && n.type === 'event')
    if (!eventNode) return

    const pending = relationTriggers.filter((t) => t.eventNodeId === eventNodeId && !t.activated)
    if (pending.length === 0) {
      useToastStore.getState().show('이 이벤트에 실행할 트리거가 없거나 이미 적용되었습니다.')
      return
    }

    const ms = useMentionStore.getState()
    const nameOf = (id: string) => ms.characters.find((c) => c.id === id)?.name ?? id

    for (const tr of pending) {
      const charA = ms.characters.find((c) => c.id === tr.characterAId)
      if (!charA) continue

      const relIndex = charA.relations.findIndex((r) => r.targetId === tr.characterBId)
      const rel = relIndex >= 0 ? charA.relations[relIndex]! : null
      if (rel?.narrativeEmotion != null && rel.narrativeEmotion !== tr.fromEmotion) {
        useToastStore
          .getState()
          .show(
            `트리거 건너뜀: ${charA.name}→${nameOf(tr.characterBId)} 관계가 ${TRIGGER_EMOTION_LABEL[tr.fromEmotion]}(이)가 아닙니다.`,
          )
        continue
      }

      const nextRel: CharacterRelation = rel
        ? {
            ...rel,
            narrativeEmotion: tr.toEmotion,
            emotion: TRIGGER_EMOTION_LABEL[tr.toEmotion],
          }
        : {
            targetId: tr.characterBId,
            kind: 'other',
            emotion: TRIGGER_EMOTION_LABEL[tr.toEmotion],
            narrativeEmotion: tr.toEmotion,
          }

      const newRels =
        relIndex >= 0
          ? charA.relations.map((r, i) => (i === relIndex ? nextRel : r))
          : [...charA.relations, nextRel]

      const summary = `「${eventNode.title}」 ${charA.name}→${nameOf(tr.characterBId)}: ${TRIGGER_EMOTION_LABEL[tr.fromEmotion]} → ${TRIGGER_EMOTION_LABEL[tr.toEmotion]}`
      const entry = { storyNodeId: eventNodeId, change: summary }

      const freshA = useMentionStore.getState().characters.find((c) => c.id === tr.characterAId)!
      const freshB = useMentionStore.getState().characters.find((c) => c.id === tr.characterBId)
      ms.patchCharacter(tr.characterAId, {
        relations: newRels,
        relationTimeline: [...(freshA.relationTimeline ?? []), entry],
      })
      if (freshB) {
        ms.patchCharacter(tr.characterBId, {
          relationTimeline: [...(freshB.relationTimeline ?? []), entry],
        })
      }

      set((s) => ({
        relationTriggers: s.relationTriggers.map((x) =>
          x.id === tr.id ? { ...x, activated: true } : x,
        ),
      }))

      useToastStore.getState().show(`⚡ ${summary}`)
    }
  },

  resetArtbook: () => set({ storyNodes: [], keywords: [], relationTriggers: [] }),
}))
