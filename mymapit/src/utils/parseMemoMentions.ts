import { isMentionKind, legacyDatasetTypeToKind } from '../constants/mentionKinds'
import type { MentionKind, Mention } from '../stores/types'

/** 저장된 mentions가 비어 있을 때 HTML 본문에서 .ab-mention 스팬을 읽습니다. */
export function parseMentionsFromMemoHtml(html: string): Mention[] {
  if (typeof document === 'undefined') return []
  const wrap = document.createElement('div')
  wrap.innerHTML = html
  const spans = wrap.querySelectorAll<HTMLElement>('.ab-mention')
  const out: Mention[] = []
  spans.forEach((span, i) => {
    const rawKind = span.dataset.kind
    const kind: MentionKind | null = isMentionKind(rawKind)
      ? rawKind
      : legacyDatasetTypeToKind(span.dataset.type)
    const targetId = span.dataset.targetId ?? ''
    const targetName = span.dataset.targetName ?? ''
    const id = span.dataset.mentionId ?? `parsed-${i}`
    if (kind && targetId && targetName) out.push({ id, kind, targetId, targetName })
  })
  return out
}

export function effectiveMemoMentions(content: string, stored: Mention[]): Mention[] {
  if (stored.length > 0) return stored
  return parseMentionsFromMemoHtml(content)
}
