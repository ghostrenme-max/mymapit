import type { Mention, MentionKind } from '../stores/types'

/** 레거시 `kind` → `type` 마이그레이션 */
export function normalizeMemoMention(m: Mention & { kind?: MentionKind }): Mention {
  const type = m.type ?? m.kind
  if (!type) {
    return { id: m.id, type: 'term', targetId: m.targetId, targetName: m.targetName }
  }
  return { id: m.id, type, targetId: m.targetId, targetName: m.targetName }
}

export function normalizeMemoMentions(list: Mention[]): Mention[] {
  return list.map(normalizeMemoMention)
}
