import { isMentionKind, legacyDatasetTypeToKind } from '../constants/mentionKinds'
import { normalizeMemoMentions } from '../lib/normalizeMemoMention'
import type { MentionKind } from '../constants/mentionKinds'
import type { Mention } from '../stores/types'

/** 저장된 mentions가 비어 있을 때 HTML 본문에서 .ab-mention 스팬을 읽습니다. */
export function parseMentionsFromMemoHtml(html: string): Mention[] {
  if (typeof document === 'undefined') return []
  const wrap = document.createElement('div')
  wrap.innerHTML = html
  const spans = wrap.querySelectorAll<HTMLElement>('.ab-mention')
  const out: Mention[] = []
  spans.forEach((span, i) => {
    const rawKind = span.dataset.kind
    const type: MentionKind | null = isMentionKind(rawKind)
      ? rawKind
      : legacyDatasetTypeToKind(span.dataset.type)
    const targetId = span.dataset.targetId ?? ''
    const targetName = span.dataset.targetName ?? ''
    const id = span.dataset.mentionId ?? `parsed-${i}`
    if (type && targetId && targetName) out.push({ id, type, targetId, targetName })
  })
  return out
}

export function effectiveMemoMentions(content: string, stored: Mention[]): Mention[] {
  if (stored.length > 0) return normalizeMemoMentions(stored)
  return parseMentionsFromMemoHtml(content)
}
