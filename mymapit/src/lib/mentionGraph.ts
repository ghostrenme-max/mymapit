import type { Memo, MemoGroup, Mention, MentionKind } from '../stores/types'
import { effectiveMemoMentions } from '../utils/parseMemoMentions'

export type GraphNode = {
  /** `${kind}:${targetId}` */
  id: string
  kind: MentionKind
  targetId: string
  label: string
  /** 등장한 서로 다른 메모 수 */
  memoCount: number
}

export type GraphEdge = {
  source: string
  target: string
  /** 같은 메모에 함께 등장한 횟수 */
  weight: number
  memoTitles: string[]
}

function nodeKey(m: Mention): string {
  return `${m.kind}:${m.targetId}`
}

export function buildMentionCooccurrenceGraph(
  projectId: string,
  memoGroups: MemoGroup[],
  memos: Memo[],
): { nodes: GraphNode[]; edges: GraphEdge[]; signature: string } {
  const groupIds = new Set(memoGroups.filter((g) => g.projectId === projectId).map((g) => g.id))
  const projectMemos = memos.filter((m) => groupIds.has(m.groupId))

  const nodeMap = new Map<string, GraphNode>()
  const edgeMap = new Map<string, { weight: number; titles: Set<string> }>()

  const addOrMergeNode = (m: Mention) => {
    const id = nodeKey(m)
    const prev = nodeMap.get(id)
    if (prev) {
      prev.memoCount += 1
      if (m.targetName && m.targetName !== prev.label) prev.label = m.targetName
    } else {
      nodeMap.set(id, {
        id,
        kind: m.kind,
        targetId: m.targetId,
        label: m.targetName,
        memoCount: 1,
      })
    }
  }

  const edgeKey = (a: string, b: string) => (a < b ? `${a}||${b}` : `${b}||${a}`)

  for (const memo of projectMemos) {
    const list = effectiveMemoMentions(memo.content, memo.mentions)
    const uniq = new Map<string, Mention>()
    for (const m of list) uniq.set(nodeKey(m), m)
    const keys = [...uniq.keys()]
    const title = memo.title.trim() || '(제목 없음)'

    for (const m of uniq.values()) addOrMergeNode(m)

    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const ek = edgeKey(keys[i]!, keys[j]!)
        const cur = edgeMap.get(ek) ?? { weight: 0, titles: new Set<string>() }
        cur.weight += 1
        cur.titles.add(title)
        edgeMap.set(ek, cur)
      }
    }
  }

  const nodes = [...nodeMap.values()].sort((a, b) => a.label.localeCompare(b.label, 'ko'))
  const edges: GraphEdge[] = []
  for (const [ek, v] of edgeMap) {
    const [a, b] = ek.split('||') as [string, string]
    edges.push({
      source: a,
      target: b,
      weight: v.weight,
      memoTitles: [...v.titles].slice(0, 8),
    })
  }
  edges.sort((a, b) => b.weight - a.weight)

  const signature = `${nodes.map((n) => n.id).sort().join('|')}#${edges.map((e) => `${e.source}-${e.target}:${e.weight}`).join('|')}`

  return { nodes, edges, signature }
}
