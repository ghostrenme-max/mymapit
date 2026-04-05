import type { MentionKind } from '../constants/mentionKinds'

export type { MentionKind }

export type Mention = {
  id: string
  kind: MentionKind
  targetId: string
  targetName: string
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
}

export type StoryNode = {
  id: string
  projectId: string
  type: 'act' | 'scene' | 'event'
  title: string
  description: string
  tension: number
  parentId: string | null
  order: number
  characterIds: string[]
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
  relations: { targetId: string; emotion: string }[]
  values: { theme: string; answer: string }[]
  storyNodeIds: string[]
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

/** @@ AI가 생성해 아트북 서사에 쌓이는 인포 카드 */
export type AiInfoCard = {
  id: string
  projectId: string
  sourceText: string
  summary: string
  tension: number
  characters: string[]
  worldElements: string[]
  places: string[]
  objects: string[]
  /** 인포 시트 텍스트를 바탕으로 한 세계관·캐릭터 키워드 제안 */
  suggestedKeywords: string[]
  createdAt: string
}
