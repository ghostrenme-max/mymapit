export type Project = { id: string; name: string; createdAt: string }

export type StoryNode = {
  id: string
  projectId: string
  type: 'act' | 'scene' | 'event' | 'character'
  title: string
  description: string
  tension: number
  parentId: string | null
  order: number
  characterIds: string[]
}

export type Relation = {
  targetCharacterId: string
  emotion: 'hate' | 'love' | 'fear' | 'admire' | 'trust'
  note: string
  timeline: { storyNodeId: string; change: string }[]
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
  /** 시트 UI용 (선택) */
  silhouetteTags?: string[]
  colors: string[]
  imageUri: string | null
  relations: Relation[]
  storyNodeIds: string[]
  keywordIds: string[]
}

export type Keyword = {
  id: string
  projectId: string
  text: string
  category: 'personality' | 'ability' | 'background' | 'aesthetic' | 'origin'
  characterIds: string[]
}

export type ConceptResult = {
  name: string
  description: string
  silhouette: string
  colors: string[]
} | null
