import { useArtbookStore } from '../stores/artbookStore'
import { useMentionStore } from '../stores/mentionStore'
import { useProjectStore } from '../stores/projectStore'

export type AiExtractDraft = {
  summary: string
  tension: number
  characters: string[]
  worldElements: string[]
  places: string[]
  objects: string[]
  suggestedKeywords: string[]
}

const KEYWORD_STOP = new Set([
  '그',
  '이',
  '저',
  '것',
  '수',
  '등',
  '한',
  '바',
  '에서',
  '으로',
  '있다',
  '없다',
  '선택',
  '구간',
  '바탕으로',
  '데모',
  '요약',
  '인해',
  '본문',
  '문장',
  '입력',
  '분석',
  'AI',
  '페이지',
  '자동',
  '만들어집니다',
  '내용이',
  '비어',
])

function tokenizeSheetText(s: string): string[] {
  return s
    .replace(/\s+/g, ' ')
    .split(/[\s,.!?…、·;:|[\](){}'"「」《》\-–—]+/)
    .map((t) => t.trim())
    .filter((t) => {
      if (t.length < 2 || t.length > 18) return false
      if (/^\d+$/.test(t)) return false
      return true
    })
}

const THEME_PAD = [
  '갈등',
  '성장',
  '관계',
  '세계관',
  '복선',
  '긴장',
  '서사',
  '분위기',
  '모티프',
  '상징',
  '서사적',
  '몰입',
]

type SheetFields = Pick<
  AiExtractDraft,
  'summary' | 'characters' | 'worldElements' | 'places' | 'objects'
>

/** 인포 시트에 보이는 문자열들을 모아 세계관·캐릭터에 어울리는 키워드 후보 ~10개 (데모 휴리스틱) */
function buildSuggestedKeywords(
  sheetSourceText: string,
  fields: SheetFields,
  projectId: string | null,
): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  const push = (raw: string) => {
    const w = raw.trim()
    if (!w || seen.has(w) || KEYWORD_STOP.has(w)) return
    seen.add(w)
    out.push(w)
  }

  for (const w of fields.characters) {
    push(w)
    if (out.length >= 10) return out
  }
  for (const w of fields.worldElements) {
    push(w)
    if (out.length >= 10) return out
  }
  for (const w of fields.places) {
    push(w)
    if (out.length >= 10) return out
  }
  for (const w of fields.objects) {
    push(w)
    if (out.length >= 10) return out
  }

  if (projectId) {
    const { characters } = useMentionStore.getState()
    for (const c of characters.filter((x) => x.projectId === projectId)) {
      if (!fields.characters.includes(c.name)) continue
      for (const t of c.tags) {
        push(t)
        if (out.length >= 10) return out
      }
    }

    const { keywords } = useArtbookStore.getState()
    for (const kw of keywords.filter((x) => x.projectId === projectId)) {
      push(kw.text)
      if (out.length >= 10) return out
    }
  }

  const project = projectId
    ? useProjectStore.getState().projects.find((p) => p.id === projectId)
    : undefined
  if (project) {
    for (const part of project.mood.split(/[·,，]/)) {
      const m = part.trim()
      if (m.length >= 2) {
        push(m)
        if (out.length >= 10) return out
      }
    }
    if (project.genre.trim().length >= 2) {
      push(project.genre.trim())
      if (out.length >= 10) return out
    }
    if (project.theme.trim().length >= 2) {
      push(project.theme.trim())
      if (out.length >= 10) return out
    }
  }

  const blob = [sheetSourceText, fields.summary].join(' ')
  for (const tok of tokenizeSheetText(blob)) {
    if (KEYWORD_STOP.has(tok)) continue
    push(tok)
    if (out.length >= 10) return out
  }

  for (const p of THEME_PAD) {
    push(p)
    if (out.length >= 10) return out
  }

  return out.slice(0, 10)
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

  const summary =
    slice.length > 0
      ? `선택 구간을 바탕으로 한 AI 요약(데모): “${slice.slice(0, 120)}${slice.length > 120 ? '…' : ''}”`
      : '본문이 비어 있어 요약할 내용이 없습니다. 문장을 입력한 뒤 @@ 로 분석해 보세요.'

  const fields: SheetFields = {
    summary,
    characters: names.slice(0, 4),
    worldElements: worlds.length ? worlds : ['세계 규칙', '분위기'],
    places: places.slice(0, 3),
    objects: objs.slice(0, 3),
  }

  const sheetSourceExcerpt = plainText.replace(/\s+/g, ' ').trim().slice(0, 500)
  const tension = Math.min(10, Math.max(1, Math.floor(slice.length / 40) + 3))

  return {
    summary,
    tension,
    characters: fields.characters,
    worldElements: fields.worldElements,
    places: fields.places,
    objects: fields.objects,
    suggestedKeywords: buildSuggestedKeywords(sheetSourceExcerpt, fields, pid),
  }
}
