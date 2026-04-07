/** @멘션 종류별 라벨·텍스트 컬러·반투명 배경 (에디터·탭·띠지 공통) */
export type MentionKind =
  | 'character'
  | 'world'
  | 'object'
  | 'place'
  | 'event'
  | 'faction'
  | 'term'
  | 'storyNode'

export const MENTION_TAB_ROWS: {
  kind: MentionKind
  label: string
  /** 팔레트 이름 (테라코타, 딥 네이비 등) */
  hueName: string
  color: string
  bg: string
  /** 이 색이 상징하는 요약 */
  meaning: string
}[] = [
  {
    kind: 'character',
    label: '캐릭터',
    hueName: '테라코타',
    color: '#C4614A',
    bg: 'rgba(196,97,74,0.12)',
    meaning: '인물, 따뜻함',
  },
  {
    kind: 'world',
    label: '세계관',
    hueName: '딥 네이비',
    color: '#2C4A6E',
    bg: 'rgba(44,74,110,0.12)',
    meaning: '거대한 세계',
  },
  {
    kind: 'object',
    label: '오브젝트',
    hueName: '올리브',
    color: '#6B7A3A',
    bg: 'rgba(107,122,58,0.12)',
    meaning: '사물, 자연',
  },
  {
    kind: 'place',
    label: '장소',
    hueName: '스톤 블루',
    color: '#4A6B7A',
    bg: 'rgba(74,107,122,0.12)',
    meaning: '공간, 지형',
  },
  {
    kind: 'storyNode',
    label: '서사',
    hueName: '바이올렛',
    color: '#805AD5',
    bg: 'rgba(128,90,213,0.12)',
    meaning: '막·씬·이벤트',
  },
  {
    kind: 'faction',
    label: '세력',
    hueName: '퍼플 그레이',
    color: '#5C4A6B',
    bg: 'rgba(92,74,107,0.12)',
    meaning: '조직, 권력',
  },
  {
    kind: 'term',
    label: '용어',
    hueName: '다크 골드',
    color: '#7A6B3A',
    bg: 'rgba(122,107,58,0.12)',
    meaning: '개념, 지식',
  },
]

/** 탭에 안 올라가지만 HTML에 남을 수 있는 종류 */
const LEGACY_TAB_META: Record<'event', (typeof MENTION_TAB_ROWS)[number]> = {
  event: {
    kind: 'event',
    label: '사건(구)',
    hueName: '버건디',
    color: '#7A2C3A',
    bg: 'rgba(122,44,58,0.12)',
    meaning: '긴장, 역사',
  },
}

const KIND_SET = new Set<MentionKind>([
  ...MENTION_TAB_ROWS.map((r) => r.kind),
  'event',
])

export function isMentionKind(v: string | undefined): v is MentionKind {
  return !!v && KIND_SET.has(v as MentionKind)
}

/** 구버전 data-type → kind */
export function legacyDatasetTypeToKind(t: string | undefined): MentionKind | null {
  if (t === 'character' || t === 'world' || t === 'object') return t
  return null
}

export function mentionKindMeta(kind: MentionKind) {
  const row = MENTION_TAB_ROWS.find((r) => r.kind === kind)
  if (row) return row
  if (kind === 'event') return LEGACY_TAB_META.event
  return MENTION_TAB_ROWS[0]!
}

/** Act / Scene / Event 노드 멘션 칩 (본문 태그 색) */
export function storyNodeMentionChipMeta(nodeType: 'act' | 'scene' | 'event') {
  switch (nodeType) {
    case 'act':
      return { color: '#E53E3E', bg: 'rgba(229,62,62,0.14)' }
    case 'scene':
      return { color: '#3182CE', bg: 'rgba(49,130,206,0.14)' }
    case 'event':
      return { color: '#805AD5', bg: 'rgba(128,90,213,0.14)' }
    default:
      return { color: '#805AD5', bg: 'rgba(128,90,213,0.14)' }
  }
}
