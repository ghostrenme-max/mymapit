import type { QuestionAnswers } from './types'
import { useArtbookStore } from './artbookStore'
import { useMemoStore } from './memoStore'
import { useMentionStore } from './mentionStore'
import { useProjectStore } from './projectStore'
import {
  DEMO_PID,
  seedChars,
  seedKw,
  seedMemos,
  seedMemoGroups,
  seedProject,
  seedStory,
  seedWorldObjects,
} from './seedData'
import { useUserStore } from './userStore'

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function buildProjectName(a: QuestionAnswers) {
  return `${a.genre.split('/')[0]?.trim() ?? '세계'} 아트북`
}

export function loadDemoWorld() {
  useProjectStore.setState({
    projects: [seedProject],
    currentProjectId: DEMO_PID,
  })
  useMemoStore.getState().setMemoState(seedMemoGroups, seedMemos)
  useMentionStore.getState().setMentionEntities(seedChars, seedWorldObjects)
  useArtbookStore.getState().setArtbookData(seedStory, seedKw)
  useUserStore.setState({ onboardingCompleted: true })
}

export function clearWorldData() {
  useProjectStore.getState().resetProjects()
  useMemoStore.getState().resetMemos()
  useMentionStore.getState().resetMention()
  useArtbookStore.getState().resetArtbook()
  useUserStore.setState({ sidebarOpen: false })
}

export function resetToEmptyFlow() {
  clearWorldData()
  useUserStore.setState({
    onboardingCompleted: false,
    isPro: false,
    sidebarOpen: false,
  })
}

export function addEmptyProject(name: string) {
  const p = {
    id: newId('proj'),
    name: name.trim() || '새 프로젝트',
    genre: '',
    mood: '',
    protagonist: '',
    theme: '',
    scale: '',
    createdAt: new Date().toISOString(),
    conceptImageUri: null as string | null,
  }
  useProjectStore.getState().addProject(p)
  useMemoStore.getState().addMemoGroup(p.id, '기본 그룹')
  return p
}

export function addProjectFromAnswers(a: QuestionAnswers) {
  const p = {
    id: newId('proj'),
    name: buildProjectName(a),
    genre: a.genre,
    mood: a.mood,
    protagonist: a.protagonist,
    theme: a.theme,
    scale: a.scale,
    createdAt: new Date().toISOString(),
    conceptImageUri: null as string | null,
  }
  const n1 = {
    id: newId('sn'),
    projectId: p.id,
    type: 'act' as const,
    title: '제1막',
    description: `${a.genre} 톤의 도입부를 여기에 펼쳐보세요.`,
    tension: 10,
    relaxation: 10,
    emotionExtras: [] as { id: string; label: string; value: number }[],
    parentId: null,
    order: 0,
    characterIds: [] as string[],
  }
  const c1 = {
    id: newId('ch'),
    projectId: p.id,
    name: '주인공 (가칭)',
    role: 'hero' as const,
    personality: '',
    ability: '',
    likes: '',
    dislikes: '',
    tags: ['신규'],
    colors: ['#111110', '#D8D4CF'],
    imageUri: null,
    quote: '이야기는 이제 막 시작됐다.',
    voiceTone: { pitch: 50, emotion: 50, speed: 50 },
    relations: [],
    values: [
      {
        id: `val-${crypto.randomUUID().slice(0, 12)}`,
        theme: '출발점',
        answer: '질문 플로우에서 잡은 톤을 이어가 보세요.',
      },
    ],
    storyNodeIds: [n1.id],
  }
  n1.characterIds = [c1.id]
  const kws = [
    {
      id: newId('kw'),
      projectId: p.id,
      text: a.mood.split('/')[0]?.trim() ?? a.mood,
      category: 'aesthetic' as const,
    },
    {
      id: newId('kw'),
      projectId: p.id,
      text: a.theme.split('/')[0]?.trim() ?? a.theme,
      category: 'background' as const,
    },
  ]
  const wo = {
    id: newId('wo'),
    projectId: p.id,
    name: `${p.name} 배경`,
    type: '세계',
    description: `${a.scale} 스케일의 ${a.genre} 세계입니다.`,
    tags: [a.mood.split('·')[0]?.trim() ?? a.mood],
  }

  useProjectStore.getState().addProject(p)
  useArtbookStore.setState((s) => ({
    storyNodes: [...s.storyNodes, n1],
    keywords: [...s.keywords, ...kws],
  }))
  useMentionStore.setState((s) => ({
    characters: [...s.characters, c1],
    worldObjects: [...s.worldObjects, wo],
  }))
  useMemoStore.getState().addMemoGroup(p.id, '첫 메모 그룹')

  return p
}

/** 무료 그룹 한도 적용된 메모 그룹 추가 */
export function tryAddMemoGroup(projectId: string, name: string, color?: string) {
  const memo = useMemoStore.getState()
  const count = memo.memoGroups.filter((g) => g.projectId === projectId).length
  if (!useUserStore.getState().canAddMemoGroup(count)) {
    return null
  }
  return memo.addMemoGroup(projectId, name, color)
}
