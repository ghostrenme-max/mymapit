import type { CharacterRelationKind } from '../constants/characterRelationKinds'
import type { MentionKind } from '../constants/mentionKinds'
import type { StoryEmotionTag, TriggerEmotion } from '../constants/storyNarrative'

export type { CharacterRelationKind, MentionKind, StoryEmotionTag, TriggerEmotion }

export type Mention = {
  id: string
  type: MentionKind
  targetId: string
  targetName: string
}

/** 메모별·항목별 사이드 노트 (본문과 별도로 관계·비밀·상태만 적어 둠) */
export type MemoEntitySideNote = {
  relationship: string
  secret: string
  status: string
}

export type MemoWritingCheckItem = {
  id: string
  label: string
  done: boolean
}

/** 가져오기·일괄 @ 등 파괴적 편집 전 자동 저장·수동 복원용 */
export type MemoContentSnapshot = {
  id: string
  createdAt: string
  label: string
  title: string
  content: string
  mentions: Mention[]
  entitySideNotes?: Record<string, MemoEntitySideNote>
  writingChecklist?: MemoWritingCheckItem[]
}

export type MemoGroup = {
  id: string
  projectId: string
  name: string
  color: string
  createdAt: string
}

export type Memo = {
  id: string
  groupId: string
  title: string
  content: string
  mentions: Mention[]
  updatedAt: string
  /** targetId → 이 메모 맥락에서의 관계·비밀·현재 상태 */
  entitySideNotes?: Record<string, MemoEntitySideNote>
  contentSnapshots?: MemoContentSnapshot[]
  /** 집필 진행 체크 (본문과 독립) */
  writingChecklist?: MemoWritingCheckItem[]
}

export type WorldObject = {
  id: string
  projectId: string
  name: string
  type: string
  description: string
  tags: string[]
}

export type Project = {
  id: string
  name: string
  genre: string
  mood: string
  protagonist: string
  theme: string
  scale: string
  createdAt: string
  /** 세계관 컨셉 아트 (data URL 등) */
  conceptImageUri?: string | null
}

/** 서사 노드별 추가 감정 축 (1~20) */
export type StoryEmotionExtra = {
  id: string
  label: string
  value: number
}

export type StoryNode = {
  id: string
  projectId: string
  type: 'act' | 'scene' | 'event'
  title: string
  description: string
  /** 긴장 1~20 */
  tension: number
  /** 이완 1~20 (없으면 UI에서 10으로 표시) */
  relaxation?: number
  /** 사용자 정의 감정 축 */
  emotionExtras?: StoryEmotionExtra[]
  parentId: string | null
  order: number
  characterIds: string[]
  /** 감정 온도 태그 (단일) */
  emotionTag: StoryEmotionTag | null
  /** Event 분기 루트 여부 */
  isBranch: boolean
  /** 분기 선택지 설명 (자식 이벤트에 표시) */
  branchLabel: string | null
  /** 활성 분기 자식 이벤트 id */
  activeBranchId: string | null
  /** 이 노드를 태깅한 메모 id */
  linkedMemoIds: string[]
}

export type CharacterRelation = {
  targetId: string
  /** 악역·애증·동료 등 분류 */
  kind: CharacterRelationKind
  /** 한 줄 감정·상세 메모 */
  emotion: string
  /** 관계 트리거 매칭용 감정 축 (없으면 트리거의 from 검증 생략 후 적용) */
  narrativeEmotion?: TriggerEmotion
}

/** 이벤트 노드에서 관계 변화를 일으키는 트리거 */
export type RelationTrigger = {
  id: string
  eventNodeId: string
  characterAId: string
  characterBId: string
  fromEmotion: TriggerEmotion
  toEmotion: TriggerEmotion
  activated: boolean
}

export type RelationTimelineEntry = {
  storyNodeId: string
  change: string
}

export type CharacterValueEntry = {
  id: string
  theme: string
  answer: string
  /** 데모 샘플 — 삭제·수정 불가 */
  isSample?: boolean
}

export type Character = {
  id: string
  projectId: string
  name: string
  role: 'hero' | 'villain' | 'support' | 'monster'
  personality: string
  ability: string
  likes: string
  dislikes: string
  tags: string[]
  colors: string[]
  imageUri: string | null
  quote: string
  voiceTone: { pitch: number; emotion: number; speed: number }
  relations: CharacterRelation[]
  values: CharacterValueEntry[]
  storyNodeIds: string[]
  /** 이벤트 트리거 등으로 기록된 관계 변화 요약 */
  relationTimeline: RelationTimelineEntry[]
}

export type Keyword = {
  id: string
  projectId: string
  text: string
  category: 'personality' | 'ability' | 'background' | 'aesthetic' | 'origin'
}

export type QuestionAnswers = {
  genre: string
  mood: string
  protagonist: string
  theme: string
  scale: string
}
