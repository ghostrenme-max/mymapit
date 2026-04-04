import { create } from 'zustand'
import type { StoryNode } from '../types/models'
import { DEMO_PROJECT_ID } from './useProjectStore'

const seedNodes: StoryNode[] = [
  {
    id: 'act-1',
    projectId: DEMO_PROJECT_ID,
    type: 'act',
    title: '제1막 — 관문 열리다',
    description: '주인공이 오래된 관문을 발견하고 첫 충돌이 일어납니다.',
    tension: 4,
    parentId: null,
    order: 0,
    characterIds: ['char-lyra', 'char-kai'],
  },
  {
    id: 'scene-1-1',
    projectId: DEMO_PROJECT_ID,
    type: 'scene',
    title: '폐허 도서관',
    description: '먼지 쌓인 석판과 빛나는 문양.',
    tension: 5,
    parentId: 'act-1',
    order: 0,
    characterIds: ['char-lyra'],
  },
  {
    id: 'evt-1-1',
    projectId: DEMO_PROJECT_ID,
    type: 'event',
    title: '석판 해독',
    description: 'Lyra가 관문 언어를 읽기 시작합니다.',
    tension: 6,
    parentId: 'scene-1-1',
    order: 0,
    characterIds: ['char-lyra'],
  },
  {
    id: 'evt-1-2',
    projectId: DEMO_PROJECT_ID,
    type: 'event',
    title: '그림자 출현',
    description: 'Kai의 실루엣이 유리 너머로 비칩니다.',
    tension: 8,
    parentId: 'scene-1-1',
    order: 1,
    characterIds: ['char-lyra', 'char-kai'],
  },
  {
    id: 'act-2',
    projectId: DEMO_PROJECT_ID,
    type: 'act',
    title: '제2막 — 맹약',
    description: '신뢰와 배신 사이에서 선택이 갈립니다.',
    tension: 7,
    parentId: null,
    order: 1,
    characterIds: ['char-lyra', 'char-kai', 'char-mira'],
  },
  {
    id: 'scene-2-1',
    projectId: DEMO_PROJECT_ID,
    type: 'scene',
    title: '별무리 정원',
    description: 'Mira가 중재를 제안하는 장소.',
    tension: 5,
    parentId: 'act-2',
    order: 0,
    characterIds: ['char-mira', 'char-lyra'],
  },
  {
    id: 'evt-2-1',
    projectId: DEMO_PROJECT_ID,
    type: 'event',
    title: '맹약의 밤',
    description: '세 사람의 감정선이 교차합니다.',
    tension: 9,
    parentId: 'scene-2-1',
    order: 0,
    characterIds: ['char-lyra', 'char-kai', 'char-mira'],
  },
]

type StoryState = {
  nodes: StoryNode[]
  typeFilter: 'all' | StoryNode['type']
  setTypeFilter: (f: StoryState['typeFilter']) => void
  nodesForProject: (projectId: string) => StoryNode[]
  addNode: (partial: Omit<StoryNode, 'id' | 'order'> & { parentId: string | null }) => void
  updateNode: (id: string, patch: Partial<StoryNode>) => void
  reorderAmongSiblings: (projectId: string, activeId: string, overId: string) => void
}

function siblingsOf(
  nodes: StoryNode[],
  projectId: string,
  parentId: string | null,
) {
  return nodes
    .filter((n) => n.projectId === projectId && n.parentId === parentId)
    .sort((a, b) => a.order - b.order)
}

export const useStoryStore = create<StoryState>((set, get) => ({
  nodes: seedNodes,
  typeFilter: 'all',
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  nodesForProject: (projectId) => get().nodes.filter((n) => n.projectId === projectId),
  addNode: (partial) => {
    const sibs = siblingsOf(get().nodes, partial.projectId, partial.parentId)
    const order = sibs.length
    const node: StoryNode = {
      ...partial,
      id: `node-${crypto.randomUUID()}`,
      order,
    }
    set((st) => ({ nodes: [...st.nodes, node] }))
  },
  updateNode: (id, patch) =>
    set((st) => ({
      nodes: st.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),
  reorderAmongSiblings: (projectId, activeId, overId) => {
    if (activeId === overId) return
    set((st) => {
      const active = st.nodes.find((n) => n.id === activeId)
      const over = st.nodes.find((n) => n.id === overId)
      if (!active || !over || active.parentId !== over.parentId) return st
      if (active.projectId !== projectId || over.projectId !== projectId) return st
      const parentId = active.parentId
      const ordered = siblingsOf(st.nodes, projectId, parentId)
      const from = ordered.findIndex((n) => n.id === activeId)
      const to = ordered.findIndex((n) => n.id === overId)
      if (from < 0 || to < 0) return st
      const next = [...ordered]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      const orderMap = new Map(next.map((n, i) => [n.id, i]))
      return {
        nodes: st.nodes.map((n) =>
          orderMap.has(n.id) ? { ...n, order: orderMap.get(n.id)! } : n,
        ),
      }
    })
  },
}))

export function flattenStoryTree(projectId: string, nodes: StoryNode[]) {
  const byParent = new Map<string | null, StoryNode[]>()
  for (const n of nodes.filter((x) => x.projectId === projectId)) {
    const k = n.parentId
    if (!byParent.has(k)) byParent.set(k, [])
    byParent.get(k)!.push(n)
  }
  for (const arr of byParent.values()) arr.sort((a, b) => a.order - b.order)

  const out: { node: StoryNode; depth: number }[] = []
  const walk = (parentId: string | null, depth: number) => {
    const kids = byParent.get(parentId) ?? []
    for (const node of kids) {
      out.push({ node, depth })
      walk(node.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}
