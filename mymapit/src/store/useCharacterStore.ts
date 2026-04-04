import { create } from 'zustand'
import type { Character, Relation } from '../types/models'
import { DEMO_PROJECT_ID } from './useProjectStore'

const seedCharacters: Character[] = [
  {
    id: 'char-lyra',
    projectId: DEMO_PROJECT_ID,
    name: 'Lyra Vale',
    role: 'hero',
    personality: '호기심 많고 직설적. 책임감이 강함.',
    ability: '고대 언어 해독, 공간 감지',
    likes: '별빛, 낡은 지도',
    dislikes: '거짓 약속',
    tags: ['관찰자', '불굴'],
    silhouetteTags: ['날렵한 실루엣', '망토'],
    colors: ['#2563EB', '#7C3AED'],
    imageUri: null,
    relations: [
      {
        targetCharacterId: 'char-kai',
        emotion: 'trust',
        note: '오랜 라이벌이자 유일한 동료 후보',
        timeline: [
          { storyNodeId: 'evt-1-2', change: '그림자 속에서 다시 마주침' },
          { storyNodeId: 'evt-2-1', change: '맹약을 맺으며 신뢰 재정의' },
        ],
      },
      {
        targetCharacterId: 'char-mira',
        emotion: 'admire',
        note: '중재자로서의 지혜',
        timeline: [{ storyNodeId: 'evt-2-1', change: '정원에서 조언' }],
      },
    ],
    storyNodeIds: ['act-1', 'scene-1-1', 'evt-1-1', 'evt-1-2', 'act-2', 'scene-2-1', 'evt-2-1'],
    keywordIds: ['kw-curious', 'kw-stars'],
  },
  {
    id: 'char-kai',
    projectId: DEMO_PROJECT_ID,
    name: 'Kai Noct',
    role: 'villain',
    personality: '냉정, 풍자를 즐김. 내면엔 상처.',
    ability: '그림자 복제, 협상',
    likes: '적막한 밤',
    dislikes: '노출',
    tags: ['안티히어로', '가면'],
    silhouetteTags: ['각진 어깨', '짧은 머리'],
    colors: ['#17140F', '#D94F1E'],
    imageUri: null,
    relations: [
      {
        targetCharacterId: 'char-lyra',
        emotion: 'love',
        note: '인정하기 싫은 끌림',
        timeline: [{ storyNodeId: 'evt-2-1', change: '감정 고백 대신 도발' }],
      },
    ],
    storyNodeIds: ['act-1', 'evt-1-2', 'act-2', 'evt-2-1'],
    keywordIds: ['kw-shadow', 'kw-urban'],
  },
  {
    id: 'char-mira',
    projectId: DEMO_PROJECT_ID,
    name: 'Mira Sol',
    role: 'support',
    personality: '차분하고 통찰력 있음.',
    ability: '감정 완충, 별 점성',
    likes: '허브차',
    dislikes: '극단',
    tags: ['조언자'],
    silhouetteTags: ['둥근 실루엣', '긴 로브'],
    colors: ['#16A34A', '#F3F1EE'],
    imageUri: null,
    relations: [
      {
        targetCharacterId: 'char-lyra',
        emotion: 'trust',
        note: '멘토 겸 친우',
        timeline: [],
      },
    ],
    storyNodeIds: ['act-2', 'scene-2-1', 'evt-2-1'],
    keywordIds: ['kw-garden'],
  },
]

type CharacterState = {
  characters: Character[]
  charactersForProject: (projectId: string) => Character[]
  addCharacter: (c: Omit<Character, 'id'>) => Character
  updateCharacter: (id: string, patch: Partial<Character>) => void
  setRelation: (characterId: string, relation: Relation) => void
  upsertRelationTimeline: (
    characterId: string,
    targetId: string,
    entry: Relation['timeline'][number],
  ) => void
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: seedCharacters,
  charactersForProject: (projectId) => get().characters.filter((c) => c.projectId === projectId),
  addCharacter: (c) => {
    const full: Character = { ...c, id: `char-${crypto.randomUUID()}` }
    set((s) => ({ characters: [...s.characters, full] }))
    return full
  },
  updateCharacter: (id, patch) =>
    set((s) => ({
      characters: s.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
  setRelation: (characterId, relation) =>
    set((s) => ({
      characters: s.characters.map((c) => {
        if (c.id !== characterId) return c
        const others = c.relations.filter((r) => r.targetCharacterId !== relation.targetCharacterId)
        return { ...c, relations: [...others, relation] }
      }),
    })),
  upsertRelationTimeline: (characterId, targetId, entry) =>
    set((s) => ({
      characters: s.characters.map((c) => {
        if (c.id !== characterId) return c
        return {
          ...c,
          relations: c.relations.map((r) => {
            if (r.targetCharacterId !== targetId) return r
            const has = r.timeline.some((t) => t.storyNodeId === entry.storyNodeId)
            const timeline = has
              ? r.timeline.map((t) =>
                  t.storyNodeId === entry.storyNodeId ? entry : t,
                )
              : [...r.timeline, entry]
            return { ...r, timeline }
          }),
        }
      }),
    })),
}))

export const ROLE_LABEL: Record<Character['role'], string> = {
  hero: '히어로',
  villain: '빌런',
  support: '서포트',
  monster: '몬스터',
}

export const EMOTION_LABEL: Record<Relation['emotion'], string> = {
  hate: '증오',
  love: '사랑',
  fear: '두려움',
  admire: '동경',
  trust: '신뢰',
}

/** UI용 아바타 이모지 (데이터 모델 외 표시) */
export function characterEmoji(c: Character): string {
  const map: Record<string, string> = {
    'char-lyra': '🌟',
    'char-kai': '🌑',
    'char-mira': '🌿',
  }
  return map[c.id] ?? '🎭'
}
