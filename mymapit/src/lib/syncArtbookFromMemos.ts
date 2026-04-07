import { emptyStoryNodeMeta } from './storyNodeDefaults'
import { clampStoryMetric } from './storyMetrics'
import { stripMemoHtml } from '../utils/memoHtml'
import { DEMO_PID } from '../stores/seedData'
import { useArtbookStore } from '../stores/artbookStore'
import { useMemoStore } from '../stores/memoStore'
import { useMentionStore } from '../stores/mentionStore'
import type { Character, Keyword, MentionKind, StoryNode, WorldObject } from '../stores/types'

export const INFO_PLACEHOLDER = '정보 미정'

function kindToWorldType(kind: MentionKind | string): string {
  switch (kind) {
    case 'world':
      return '세계'
    case 'object':
      return '오브젝트'
    case 'place':
      return '장소'
    case 'event':
      return '사건'
    case 'faction':
      return '세력'
    case 'storyNode':
      return '서사'
    case 'term':
      return '용어'
    default:
      return '기타'
  }
}

function memoPlainText(html: string) {
  if (typeof document === 'undefined') return ''
  const t = stripMemoHtml(html)
  return t || ''
}

function createStubCharacter(projectId: string, id: string, name: string): Character {
  return {
    id,
    projectId,
    name: name.trim() || INFO_PLACEHOLDER,
    role: 'hero',
    personality: INFO_PLACEHOLDER,
    ability: INFO_PLACEHOLDER,
    likes: INFO_PLACEHOLDER,
    dislikes: INFO_PLACEHOLDER,
    tags: ['메모 연동'],
    colors: ['#111110', '#D8D4CF'],
    imageUri: null,
    quote: INFO_PLACEHOLDER,
    voiceTone: { pitch: 50, emotion: 50, speed: 50 },
    relations: [],
    relationTimeline: [],
    values: [{ id: `val-${crypto.randomUUID().slice(0, 12)}`, theme: '서사', answer: INFO_PLACEHOLDER }],
    storyNodeIds: [],
  }
}

function createStubWorldObject(projectId: string, id: string, name: string, type: string): WorldObject {
  return {
    id,
    projectId,
    name: name.trim() || INFO_PLACEHOLDER,
    type,
    description: INFO_PLACEHOLDER,
    tags: ['메모 연동'],
  }
}

/**
 * 메모 그룹·메모를 기준으로 서사 트리(막→씬→이벤트)와 멘션 엔티티를 맞춥니다.
 * 데모 시드(`DEMO_PID`)는 잿빛 아크 북 샘플을 유지하기 위해 건너뜁니다.
 */
export function syncArtbookFromMemos(projectId: string) {
  if (projectId === DEMO_PID) return

  const { memoGroups, memos } = useMemoStore.getState()
  const groups = memoGroups
    .filter((g) => g.projectId === projectId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const projectMemos = memos.filter((m) => {
    const g = memoGroups.find((x) => x.id === m.groupId)
    return g?.projectId === projectId
  })

  const nodes: StoryNode[] = []
  const storyIdsForChar = new Map<string, string[]>()

  const registerCharStory = (targetId: string, ids: string[]) => {
    if (!storyIdsForChar.has(targetId)) storyIdsForChar.set(targetId, [])
    const arr = storyIdsForChar.get(targetId)!
    for (const x of ids) {
      if (!arr.includes(x)) arr.push(x)
    }
  }

  groups.forEach((g, actIndex) => {
    const actId = `memo-act-${g.id}`
    const actMemos = memos.filter((m) => m.groupId === g.id).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))

    const actT = clampStoryMetric((4 + (actIndex % 5)) * 2)
    nodes.push({
      ...emptyStoryNodeMeta(),
      id: actId,
      projectId,
      type: 'act',
      title: `제${actIndex + 1}막 — ${g.name || INFO_PLACEHOLDER}`,
      description:
        actMemos.length > 0 ? `${actMemos.length}개의 메모에서 이어지는 장` : INFO_PLACEHOLDER,
      tension: actT,
      relaxation: clampStoryMetric(20 - actT + 4),
      emotionExtras: [],
      parentId: null,
      order: actIndex,
      characterIds: [],
    })

    const pushMemoBranch = (memo: (typeof memos)[0], memoIndex: number) => {
      const sceneId = `memo-scene-${memo.id}`
      const evId = `memo-ev-${memo.id}`
      const plain = memoPlainText(memo.content)
      const desc = plain.slice(0, 160) || INFO_PLACEHOLDER
      const title = (memo.title || '').trim() || INFO_PLACEHOLDER

      const memoCharIds = [...new Set(memo.mentions.filter((x) => x.type === 'character').map((x) => x.targetId))]
      const actIdRef = actId
      for (const ch of memo.mentions.filter((x) => x.type === 'character')) {
        registerCharStory(ch.targetId, [actIdRef, sceneId, evId])
      }

      const scT = clampStoryMetric((5 + (memoIndex % 4)) * 2)
      nodes.push({
        ...emptyStoryNodeMeta(),
        id: sceneId,
        projectId,
        type: 'scene',
        title,
        description: desc,
        tension: scT,
        relaxation: clampStoryMetric(18 - (memoIndex % 8)),
        emotionExtras: [],
        parentId: actId,
        order: memoIndex,
        characterIds: memoCharIds,
      })
      const evT = clampStoryMetric((6 + (memoIndex % 3)) * 2)
      nodes.push({
        ...emptyStoryNodeMeta(),
        id: evId,
        projectId,
        type: 'event',
        title: title === INFO_PLACEHOLDER ? INFO_PLACEHOLDER : `${title} · 장면`,
        description: desc,
        tension: evT,
        relaxation: clampStoryMetric(19 - (memoIndex % 10)),
        emotionExtras: [],
        parentId: sceneId,
        order: 0,
        characterIds: memoCharIds,
      })
    }

    if (actMemos.length === 0) {
      const sceneId = `memo-scene-empty-${g.id}`
      const evId = `memo-ev-empty-${g.id}`
      nodes.push({
        ...emptyStoryNodeMeta(),
        id: sceneId,
        projectId,
        type: 'scene',
        title: INFO_PLACEHOLDER,
        description: INFO_PLACEHOLDER,
        tension: 10,
        relaxation: 10,
        emotionExtras: [],
        parentId: actId,
        order: 0,
        characterIds: [],
      })
      nodes.push({
        ...emptyStoryNodeMeta(),
        id: evId,
        projectId,
        type: 'event',
        title: INFO_PLACEHOLDER,
        description: INFO_PLACEHOLDER,
        tension: 10,
        relaxation: 10,
        emotionExtras: [],
        parentId: sceneId,
        order: 0,
        characterIds: [],
      })
    } else {
      actMemos.forEach((memo, memoIndex) => pushMemoBranch(memo, memoIndex))
    }
  })

  if (groups.length === 0) {
    const actId = `memo-act-empty-${projectId}`
    const sceneId = `memo-scene-empty-proj-${projectId}`
    const evId = `memo-ev-empty-proj-${projectId}`
    nodes.push({
      ...emptyStoryNodeMeta(),
      id: actId,
      projectId,
      type: 'act',
      title: `제1막 — ${INFO_PLACEHOLDER}`,
      description: INFO_PLACEHOLDER,
      tension: 10,
      relaxation: 10,
      emotionExtras: [],
      parentId: null,
      order: 0,
      characterIds: [],
    })
    nodes.push({
      ...emptyStoryNodeMeta(),
      id: sceneId,
      projectId,
      type: 'scene',
      title: INFO_PLACEHOLDER,
      description: INFO_PLACEHOLDER,
      tension: 10,
      relaxation: 10,
      emotionExtras: [],
      parentId: actId,
      order: 0,
      characterIds: [],
    })
    nodes.push({
      ...emptyStoryNodeMeta(),
      id: evId,
      projectId,
      type: 'event',
      title: INFO_PLACEHOLDER,
      description: INFO_PLACEHOLDER,
      tension: 10,
      relaxation: 10,
      emotionExtras: [],
      parentId: sceneId,
      order: 0,
      characterIds: [],
    })
  }

  for (const g of groups) {
    const actId = `memo-act-${g.id}`
    const act = nodes.find((n) => n.id === actId)
    if (!act) continue
    const ids = new Set<string>()
    for (const n of nodes) {
      if (n.parentId === actId && n.type === 'scene') {
        n.characterIds.forEach((id) => ids.add(id))
        for (const ev of nodes) {
          if (ev.parentId === n.id && ev.type === 'event') ev.characterIds.forEach((id) => ids.add(id))
        }
      }
    }
    act.characterIds = [...ids]
  }

  const mentions = projectMemos.flatMap((m) => m.mentions)
  const mentionCharIds = new Set(mentions.filter((x) => x.type === 'character').map((x) => x.targetId))

  const { characters: allChars, worldObjects: allWo } = useMentionStore.getState()
  const existingChars = allChars.filter((c) => c.projectId === projectId)
  const existingWo = allWo.filter((o) => o.projectId === projectId)

  const newNodeIdSet = new Set(nodes.map((n) => n.id))

  const mergedChars: Character[] = existingChars.map((c) => {
    if (mentionCharIds.has(c.id)) {
      return {
        ...c,
        storyNodeIds: [...new Set(storyIdsForChar.get(c.id) ?? [])],
        relationTimeline: c.relationTimeline ?? [],
      }
    }
    return {
      ...c,
      storyNodeIds: c.storyNodeIds.filter((id) => newNodeIdSet.has(id)),
      relationTimeline: c.relationTimeline ?? [],
    }
  })

  const charIds = new Set(mergedChars.map((c) => c.id))
  for (const men of mentions) {
    if (men.type !== 'character') continue
    if (charIds.has(men.targetId)) continue
    const stub = createStubCharacter(projectId, men.targetId, men.targetName)
    stub.storyNodeIds = [...new Set(storyIdsForChar.get(men.targetId) ?? [])]
    stub.relationTimeline = []
    mergedChars.push(stub)
    charIds.add(men.targetId)
  }

  const mergedWoMap = new Map(existingWo.map((o) => [o.id, { ...o }]))
  for (const men of mentions) {
    if (men.type === 'character') continue
    if (men.type === 'storyNode') continue
    const typ = kindToWorldType(men.type)
    if (!mergedWoMap.has(men.targetId)) {
      mergedWoMap.set(
        men.targetId,
        createStubWorldObject(projectId, men.targetId, men.targetName, typ),
      )
    } else {
      const o = mergedWoMap.get(men.targetId)!
      if (men.targetName?.trim()) o.name = men.targetName.trim()
    }
  }
  const mergedWo = [...mergedWoMap.values()]

  const kwTexts = new Set<string>()
  for (const g of groups) {
    const n = g.name?.trim()
    if (n) kwTexts.add(n)
  }
  for (const m of projectMemos) {
    const t = m.title?.trim()
    if (t) kwTexts.add(t)
  }
  if (kwTexts.size === 0) kwTexts.add(INFO_PLACEHOLDER)

  const art = useArtbookStore.getState()
  const restKw = art.keywords.filter((k) => k.projectId !== projectId || !k.id.startsWith('memo-kw-'))
  const memoKw: Keyword[] = [...kwTexts].slice(0, 24).map((text, i) => ({
    id: `memo-kw-${projectId}-${i}`,
    projectId,
    text,
    category: i % 2 === 0 ? 'aesthetic' : 'background',
  }))

  useArtbookStore.setState((s) => ({
    storyNodes: [...s.storyNodes.filter((n) => n.projectId !== projectId), ...nodes],
    keywords: [...restKw, ...memoKw],
  }))

  useMentionStore.setState((s) => ({
    characters: [...s.characters.filter((c) => c.projectId !== projectId), ...mergedChars],
    worldObjects: [...s.worldObjects.filter((o) => o.projectId !== projectId), ...mergedWo],
  }))
}

function scheduleSyncForMemoGroupId(groupId: string) {
  const g = useMemoStore.getState().memoGroups.find((x) => x.id === groupId)
  if (g && g.projectId !== DEMO_PID) syncArtbookFromMemos(g.projectId)
}

export function scheduleSyncAfterMemoMutation(groupId: string | undefined, projectId?: string | null) {
  queueMicrotask(() => {
    if (groupId) {
      scheduleSyncForMemoGroupId(groupId)
      return
    }
    if (projectId && projectId !== DEMO_PID) syncArtbookFromMemos(projectId)
  })
}
