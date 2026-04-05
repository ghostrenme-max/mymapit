import { useMentionStore } from '../stores/mentionStore'

export type AiExtractDraft = {
  summary: string
  tension: number
  characters: string[]
  worldElements: string[]
  places: string[]
  objects: string[]
}

/** 데모용: 본문 일부를 읽어 인포 페이지 초안 생성 */
export function mockAiExtract(plainText: string, projectId: string | null): AiExtractDraft {
  const slice = plainText.replace(/\s+/g, ' ').trim().slice(0, 400)
  const { characters, worldObjects } = useMentionStore.getState()
  const pid = projectId
  const names = pid ? characters.filter((c) => c.projectId === pid).map((c) => c.name) : []
  const places = pid
    ? worldObjects.filter((o) => o.projectId === pid && o.type === '장소').map((o) => o.name)
    : []
  const objs = pid
    ? worldObjects.filter((o) => o.projectId === pid && o.type === '오브젝트').map((o) => o.name)
    : []
  const worlds = pid
    ? worldObjects.filter((o) => o.projectId === pid && o.type === '세계').map((o) => o.name)
    : []

  return {
    summary:
      slice.length > 0
        ? `선택 구간을 바탕으로 한 AI 요약(데모): “${slice.slice(0, 120)}${slice.length > 120 ? '…' : ''}”`
        : '본문이 비어 있어 요약할 내용이 없습니다. 문장을 입력한 뒤 @@ 로 분석해 보세요.',
    tension: Math.min(10, Math.max(1, Math.floor(slice.length / 40) + 3)),
    characters: names.slice(0, 4),
    worldElements: worlds.length ? worlds : ['세계 규칙', '분위기'],
    places: places.slice(0, 3),
    objects: objs.slice(0, 3),
  }
}
