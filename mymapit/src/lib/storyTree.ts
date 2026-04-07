import type { StoryNode } from '../stores/types'

export function flattenTree(projectId: string, nodes: StoryNode[]) {
  const list = nodes.filter((n) => n.projectId === projectId)
  const byParent = new Map<string | null, StoryNode[]>()
  for (const n of list) {
    const k = n.parentId
    if (!byParent.has(k)) byParent.set(k, [])
    byParent.get(k)!.push(n)
  }
  for (const arr of byParent.values()) arr.sort((a, b) => a.order - b.order)
  const out: { n: StoryNode; depth: number }[] = []
  const walk = (parentId: string | null, depth: number) => {
    for (const n of byParent.get(parentId) ?? []) {
      out.push({ n, depth })
      walk(n.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}

/** 특정 막(Act) 루트 아래만 깊이 순으로 펼침 — 막 노드 depth 0 */
export function flattenActSubtree(actId: string, projectId: string, nodes: StoryNode[]) {
  const list = nodes.filter((n) => n.projectId === projectId)
  const act = list.find((n) => n.id === actId && n.type === 'act')
  if (!act) return []

  const byParent = new Map<string | null, StoryNode[]>()
  for (const n of list) {
    const k = n.parentId
    if (!byParent.has(k)) byParent.set(k, [])
    byParent.get(k)!.push(n)
  }
  for (const arr of byParent.values()) arr.sort((a, b) => a.order - b.order)

  const out: { n: StoryNode; depth: number }[] = [{ n: act, depth: 0 }]
  const walk = (parentId: string, depth: number) => {
    for (const n of byParent.get(parentId) ?? []) {
      out.push({ n, depth })
      walk(n.id, depth + 1)
    }
  }
  walk(actId, 1)
  return out
}

export function listActs(projectId: string, nodes: StoryNode[]) {
  return nodes
    .filter((n) => n.projectId === projectId && n.type === 'act' && n.parentId === null)
    .sort((a, b) => a.order - b.order)
}

export function orderedStoryNodes(projectId: string, nodes: StoryNode[]): StoryNode[] {
  return flattenTree(projectId, nodes).map(({ n }) => n)
}
