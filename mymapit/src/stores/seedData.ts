import type { MentionKind } from '../constants/mentionKinds'
import type {
  AiInfoCard,
  Character,
  Keyword,
  Memo,
  MemoGroup,
  Project,
  StoryNode,
  WorldObject,
} from './types'

export const DEMO_PID = 'proj-1'

function escAttr(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function mentionSpan(kind: MentionKind, targetId: string, name: string, mentionId: string) {
  const safe = escAttr(name)
  return `<span class="ab-mention" contenteditable="false" data-mention-id="${mentionId}" data-kind="${kind}" data-target-id="${escAttr(targetId)}" data-target-name="${safe}">@${safe}</span>`
}

export const seedStory: StoryNode[] = [
  {
    id: 'sn-act1',
    projectId: DEMO_PID,
    type: 'act',
    title: '제1막 — 잿빛 도시',
    description: '주인공이 단편적 진실을 마주합니다.',
    tension: 4,
    parentId: null,
    order: 0,
    characterIds: ['ch-1', 'ch-2'],
  },
  {
    id: 'sn-sc1',
    projectId: DEMO_PID,
    type: 'scene',
    title: '지하 광장',
    description: '네온과 비가 섞인 밤.',
    tension: 6,
    parentId: 'sn-act1',
    order: 0,
    characterIds: ['ch-1'],
  },
  {
    id: 'sn-ev1',
    projectId: DEMO_PID,
    type: 'event',
    title: '첫 조우',
    description: '라이벌과의 짧은 대치.',
    tension: 8,
    parentId: 'sn-sc1',
    order: 0,
    characterIds: ['ch-1', 'ch-2'],
  },
]

export const seedChars: Character[] = [
  {
    id: 'ch-1',
    projectId: DEMO_PID,
    name: '아리아 노트',
    role: 'hero',
    personality: '말수 적고 관찰형. 책임감이 강함.',
    ability: '공간 읽기, 잔향 추적',
    likes: '낡은 LP, 비 오는 날',
    dislikes: '군중',
    tags: ['은둔형', '감각파'],
    colors: ['#2C2C2C', '#6B6560'],
    imageUri: null,
    quote: '진실은 소리 없이 스며든다.',
    voiceTone: { pitch: 62, emotion: 48, speed: 38 },
    relations: [{ targetId: 'ch-2', emotion: '긴장' }],
    values: [
      { theme: '희생', answer: '혼자 짊어지는 것과 함께 가는 것 사이.' },
      { theme: '정의', answer: '법보다 잔향을 믿는다.' },
    ],
    storyNodeIds: ['sn-act1', 'sn-sc1', 'sn-ev1'],
  },
  {
    id: 'ch-2',
    projectId: DEMO_PID,
    name: '카인 벨로스',
    role: 'villain',
    personality: '냉소적이나 원칙이 있다.',
    ability: '협상, 정보 거래',
    likes: '적막한 스카이라인',
    dislikes: '서사를 왜곡하는 자',
    tags: ['안티히어로', '도시의 그림자'],
    colors: ['#111110', '#9A9590'],
    imageUri: null,
    quote: '네가 찾는 답은 이미 값이 매겨졌어.',
    voiceTone: { pitch: 44, emotion: 72, speed: 55 },
    relations: [{ targetId: 'ch-1', emotion: '경외' }],
    values: [{ theme: '힘', answer: '약자에게 말을 건네는 것만으로도 충분하다.' }],
    storyNodeIds: ['sn-act1', 'sn-ev1'],
  },
]

export const seedKw: Keyword[] = [
  { id: 'kw-1', projectId: DEMO_PID, text: '네온', category: 'aesthetic' },
  { id: 'kw-2', projectId: DEMO_PID, text: '기억 상실', category: 'background' },
  { id: 'kw-3', projectId: DEMO_PID, text: '냉정', category: 'personality' },
]

export const seedWorldObjects: WorldObject[] = [
  {
    id: 'wo-1',
    projectId: DEMO_PID,
    name: '잊혀진 기록관',
    type: '장소',
    description: '도시 하층에 묻힌 자료 보관소. 잔향이 가장 짙게 남는다.',
    tags: ['비밀', '단서'],
  },
  {
    id: 'wo-2',
    projectId: DEMO_PID,
    name: '상층 네온 거리',
    type: '세계',
    description: '거대 기업과 광고판이 빛으로 층위를 나누는 거리.',
    tags: ['SF', '도시'],
  },
  {
    id: 'wo-3',
    projectId: DEMO_PID,
    name: '잔향 증폭기',
    type: '오브젝트',
    description: '잔향을 증폭해 읽는 휴대 장치.',
    tags: ['도구', '감각'],
  },
  {
    id: 'wo-4',
    projectId: DEMO_PID,
    name: '노웨어 재단',
    type: '세력',
    description: '기억 거래를 독점하려는 상층 결사.',
    tags: ['기업', '악역'],
  },
]

export const seedMemoGroups: MemoGroup[] = [
  {
    id: 'mg-1',
    projectId: DEMO_PID,
    name: '아이디어 스크랩',
    color: '#111110',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mg-2',
    projectId: DEMO_PID,
    name: '캐릭터 노트',
    color: '#6B6560',
    createdAt: new Date().toISOString(),
  },
]

export const seedMemos: Memo[] = [
  {
    id: 'memo-1',
    groupId: 'mg-1',
    title: '프롤로그 메모',
    content: `오늘 ${mentionSpan('character', 'ch-1', '아리아 노트', 'men-1')}는 ${mentionSpan('place', 'wo-1', '잊혀진 기록관', 'men-2')}에서 ${mentionSpan('object', 'wo-3', '잔향 증폭기', 'men-2b')}로 단서를 읽는다. ${mentionSpan('world', 'wo-2', '상층 네온 거리', 'men-3')}의 불빛, ${mentionSpan('event', 'sn-ev1', '첫 조우', 'men-3b')}, ${mentionSpan('faction', 'wo-4', '노웨어 재단', 'men-3c')}, ${mentionSpan('term', 'kw-1', '네온', 'men-3d')}.`,
    mentions: [
      { id: 'men-1', kind: 'character', targetId: 'ch-1', targetName: '아리아 노트' },
      { id: 'men-2', kind: 'place', targetId: 'wo-1', targetName: '잊혀진 기록관' },
      { id: 'men-2b', kind: 'object', targetId: 'wo-3', targetName: '잔향 증폭기' },
      { id: 'men-3', kind: 'world', targetId: 'wo-2', targetName: '상층 네온 거리' },
      { id: 'men-3b', kind: 'event', targetId: 'sn-ev1', targetName: '첫 조우' },
      { id: 'men-3c', kind: 'faction', targetId: 'wo-4', targetName: '노웨어 재단' },
      { id: 'men-3d', kind: 'term', targetId: 'kw-1', targetName: '네온' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'memo-2',
    groupId: 'mg-1',
    title: '대립 구도',
    content: `${mentionSpan('character', 'ch-1', '아리아 노트', 'men-4')}와 ${mentionSpan('character', 'ch-2', '카인 벨로스', 'men-5')}의 첫 대면.`,
    mentions: [
      { id: 'men-4', kind: 'character', targetId: 'ch-1', targetName: '아리아 노트' },
      { id: 'men-5', kind: 'character', targetId: 'ch-2', targetName: '카인 벨로스' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'memo-3',
    groupId: 'mg-2',
    title: '대사 스케치',
    content: '“진실은 소리 없이 스며든다.”',
    mentions: [],
    updatedAt: new Date().toISOString(),
  },
]

export const seedProject: Project = {
  id: DEMO_PID,
  name: '잿빛 아크 북',
  genre: 'SF 사이버펑크',
  mood: '다크 · 절망',
  protagonist: '안티히어로',
  theme: '진실과 비밀',
  scale: '단일 도시',
  createdAt: new Date().toISOString(),
}

export const seedAiCards: AiInfoCard[] = [
  {
    id: 'ai-demo-1',
    projectId: DEMO_PID,
    sourceText: '프롤로그 장면에서의 긴장',
    summary: '하층 기록관과 상층 네온의 대비 속에서 주인공이 첫 단서를 얻는 구도.',
    tension: 6,
    characters: ['아리아 노트', '카인 벨로스'],
    worldElements: ['잔향', '기억 거래'],
    places: ['잊혀진 기록관', '네온 거리'],
    objects: ['잔향 증폭기'],
    createdAt: new Date().toISOString(),
  },
]
