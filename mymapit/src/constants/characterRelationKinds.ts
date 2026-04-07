/** 캐릭터 간 관계 유형 (아트북 캐릭터 탭에서 칩·묶음 표시) */
export type CharacterRelationKind =
  | 'enemy'
  | 'rival'
  | 'love_hate'
  | 'romance'
  | 'family'
  | 'friend'
  | 'ally'
  | 'mentor'
  | 'neutral'
  | 'other'

const KIND_SET = new Set<CharacterRelationKind>([
  'enemy',
  'rival',
  'love_hate',
  'romance',
  'family',
  'friend',
  'ally',
  'mentor',
  'neutral',
  'other',
])

export function isCharacterRelationKind(v: string | undefined): v is CharacterRelationKind {
  return v != null && KIND_SET.has(v as CharacterRelationKind)
}

export function coerceCharacterRelationKind(v: string | undefined): CharacterRelationKind {
  return isCharacterRelationKind(v) ? v : 'other'
}

/** 화면에 쓰는 표시 순서 (긴장·갈등 쪽을 위로) */
export const CHARACTER_RELATION_KIND_ORDER: CharacterRelationKind[] = [
  'enemy',
  'rival',
  'love_hate',
  'romance',
  'family',
  'friend',
  'ally',
  'mentor',
  'neutral',
  'other',
]

export function characterRelationKindMeta(kind: CharacterRelationKind): {
  label: string
  color: string
  bg: string
} {
  const m: Record<CharacterRelationKind, { label: string; color: string; bg: string }> = {
    enemy: { label: '악역·적대', color: '#8B2942', bg: 'rgba(139,41,66,0.14)' },
    rival: { label: '라이벌', color: '#B45309', bg: 'rgba(180,83,9,0.14)' },
    love_hate: { label: '애증', color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
    romance: { label: '연인·호감', color: '#BE185D', bg: 'rgba(190,24,93,0.12)' },
    family: { label: '가족', color: '#0D9488', bg: 'rgba(13,148,136,0.12)' },
    friend: { label: '친구', color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
    ally: { label: '동료·협력', color: '#2C4A6E', bg: 'rgba(44,74,110,0.12)' },
    mentor: { label: '스승·멘토', color: '#4F46E5', bg: 'rgba(79,70,229,0.12)' },
    neutral: { label: '중립', color: '#57534E', bg: 'rgba(87,83,78,0.12)' },
    other: { label: '기타', color: '#44403C', bg: 'rgba(68,64,60,0.1)' },
  }
  return m[kind]
}
