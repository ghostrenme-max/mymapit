import { create } from 'zustand'
import type { ConceptResult, Keyword } from '../types/models'
import { DEMO_PROJECT_ID } from './useProjectStore'

const seedKeywords: Keyword[] = [
  {
    id: 'kw-curious',
    projectId: DEMO_PROJECT_ID,
    text: '호기심',
    category: 'personality',
    characterIds: ['char-lyra'],
  },
  {
    id: 'kw-curious-deep',
    projectId: DEMO_PROJECT_ID,
    text: '호기심 많은',
    category: 'personality',
    characterIds: [],
  },
  {
    id: 'kw-stars',
    projectId: DEMO_PROJECT_ID,
    text: '별빛',
    category: 'aesthetic',
    characterIds: ['char-lyra'],
  },
  {
    id: 'kw-shadow',
    projectId: DEMO_PROJECT_ID,
    text: '그림자',
    category: 'ability',
    characterIds: ['char-kai'],
  },
  {
    id: 'kw-shadow-2',
    projectId: DEMO_PROJECT_ID,
    text: '그림자 속',
    category: 'background',
    characterIds: [],
  },
  {
    id: 'kw-urban',
    projectId: DEMO_PROJECT_ID,
    text: '도시',
    category: 'origin',
    characterIds: ['char-kai'],
  },
  {
    id: 'kw-garden',
    projectId: DEMO_PROJECT_ID,
    text: '정원',
    category: 'aesthetic',
    characterIds: ['char-mira'],
  },
  {
    id: 'kw-runes',
    projectId: DEMO_PROJECT_ID,
    text: '룬 문자',
    category: 'background',
    characterIds: [],
  },
  {
    id: 'kw-runes2',
    projectId: DEMO_PROJECT_ID,
    text: '룬',
    category: 'background',
    characterIds: [],
  },
]

type KeywordState = {
  keywords: Keyword[]
  slotKeywordIds: string[]
  conceptResult: ConceptResult
  keywordsForProject: (projectId: string) => Keyword[]
  toggleSlotKeyword: (id: string) => void
  clearSlots: () => void
  addKeyword: (k: Omit<Keyword, 'id'>) => Keyword
  updateKeyword: (id: string, patch: Partial<Keyword>) => void
  setConceptResult: (r: ConceptResult) => void
  generateConceptFromSlots: () => void
}

function similarityKey(text: string) {
  const t = text.replace(/\s+/g, '')
  if (t.length <= 2) return t
  return t.slice(0, 3)
}

export const CATEGORY_LABEL: Record<Keyword['category'], string> = {
  personality: '성격',
  ability: '능력',
  background: '배경',
  aesthetic: '미학',
  origin: '출신',
}

export const useKeywordStore = create<KeywordState>((set, get) => ({
  keywords: seedKeywords,
  slotKeywordIds: ['kw-curious', 'kw-stars', 'kw-shadow'],
  conceptResult: null,
  keywordsForProject: (projectId) => get().keywords.filter((k) => k.projectId === projectId),
  toggleSlotKeyword: (id) =>
    set((s) => {
      const has = s.slotKeywordIds.includes(id)
      if (has) return { slotKeywordIds: s.slotKeywordIds.filter((x) => x !== id) }
      if (s.slotKeywordIds.length >= 5) return {}
      return { slotKeywordIds: [...s.slotKeywordIds, id] }
    }),
  clearSlots: () => set({ slotKeywordIds: [] }),
  addKeyword: (k) => {
    const full: Keyword = { ...k, id: `kw-${crypto.randomUUID()}` }
    set((s) => ({ keywords: [...s.keywords, full] }))
    return full
  },
  updateKeyword: (id, patch) =>
    set((s) => ({
      keywords: s.keywords.map((k) => (k.id === id ? { ...k, ...patch } : k)),
    })),
  setConceptResult: (conceptResult) => set({ conceptResult }),
  generateConceptFromSlots: () => {
    const slots = get().slotKeywordIds
      .map((sid) => get().keywords.find((k) => k.id === sid))
      .filter(Boolean) as Keyword[]
    const palette = ['#2563EB', '#7C3AED', '#D94F1E', '#16A34A']
    const name =
      slots.length > 0
        ? `${slots[0]!.text}의 수호자`
        : '무제 캐릭터'
    const description =
      slots.length > 0
        ? `${slots.map((s) => s.text).join(', ')} 키워드를 중심으로 한 장면에서, 감정의 기복이 큰 인물. 서사 노드와 연결하면 긴장 곡선이 자연스럽게 이어집니다.`
        : '키워드를 선택해 컨셉을 생성하세요.'
    set({
      conceptResult: {
        name,
        description,
        silhouette: '긴 코트 · 날카로운 실루엣 · 손에 작은 빛',
        colors: palette.slice(0, 3),
      },
    })
  },
}))

export function groupSimilarKeywords(keywords: Keyword[]) {
  const map = new Map<string, Keyword[]>()
  for (const k of keywords) {
    const key = `${k.category}:${similarityKey(k.text)}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(k)
  }
  return [...map.entries()]
    .filter(([, arr]) => arr.length > 1)
    .map(([key, arr]) => ({ key, keywords: arr }))
}
