import { useArtbookStore } from '../stores/artbookStore'
import { useMemoStore } from '../stores/memoStore'
import type { Memo } from '../stores/types'
import { normalizeMemoMentions } from './normalizeMemoMention'

function storyTargetIdsFromMemo(memo: Memo, storyNodeIds: Set<string>): Set<string> {
  const list = normalizeMemoMentions(memo.mentions)
  const out = new Set<string>()
  for (const men of list) {
    if (men.type === 'storyNode' && storyNodeIds.has(men.targetId)) out.add(men.targetId)
    // 레거시: data-kind=event + 서사 노드 id
    if (men.type === 'event' && storyNodeIds.has(men.targetId)) out.add(men.targetId)
  }
  return out
}

/** 메모 본문 멘션과 StoryNode.linkedMemoIds 동기화 */
export function syncStoryNodeLinksForMemo(memoId: string) {
  const memo = useMemoStore.getState().memos.find((m) => m.id === memoId)
  const allNodes = useArtbookStore.getState().storyNodes
  const snIds = new Set(allNodes.map((n) => n.id))
  const nextTargets = memo ? storyTargetIdsFromMemo(memo, snIds) : new Set<string>()

  useArtbookStore.setState((s) => ({
    storyNodes: s.storyNodes.map((n) => {
      const had = n.linkedMemoIds.includes(memoId)
      const should = nextTargets.has(n.id)
      if (should && !had) return { ...n, linkedMemoIds: [...n.linkedMemoIds, memoId] }
      if (!should && had) return { ...n, linkedMemoIds: n.linkedMemoIds.filter((x) => x !== memoId) }
      return n
    }),
  }))
}

export function detachMemoFromAllStoryNodes(memoId: string) {
  useArtbookStore.setState((s) => ({
    storyNodes: s.storyNodes.map((n) => ({
      ...n,
      linkedMemoIds: n.linkedMemoIds.filter((x) => x !== memoId),
    })),
  }))
}

export function rebuildAllStoryNodeMemoLinks() {
  useArtbookStore.setState((s) => ({
    storyNodes: s.storyNodes.map((n) => ({ ...n, linkedMemoIds: [] })),
  }))
  for (const m of useMemoStore.getState().memos) {
    syncStoryNodeLinksForMemo(m.id)
  }
}
