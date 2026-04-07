import { useCallback, useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import {
  CHARACTER_RELATION_KIND_ORDER,
  characterRelationKindMeta,
  coerceCharacterRelationKind,
  isCharacterRelationKind,
} from '../../constants/characterRelationKinds'
import { CharacterFieldEditBar, type CharacterEditMode } from '../character/CharacterFieldEditBar'
import { ConceptArtSlot } from '../common/ConceptArtSlot'
import { SectionCard } from '../common/SectionCard'
import { TajiTag } from '../common/TajiTag'
import { VoiceBars } from '../character/VoiceBars'
import { extractDominantHexColors } from '../../lib/extractDominantColors'
import { INFO_PLACEHOLDER } from '../../lib/syncArtbookFromMemos'
import { useMentionStore } from '../../stores/mentionStore'
import { useProjectStore } from '../../stores/projectStore'
import type { Character, CharacterRelation, CharacterValueEntry } from '../../stores/types'

/** 반시계 방향 호 + 화살표 — 초기화·한 명으로 복구 */
function RestoreArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function CharacterRelationSection({ c, allChars }: { c: Character; allChars: Character[] }) {
  const patchCharacter = useMentionStore((s) => s.patchCharacter)

  const grouped = useMemo(() => {
    const buckets = new Map<(typeof CHARACTER_RELATION_KIND_ORDER)[number], { rel: CharacterRelation; index: number }[]>()
    for (const k of CHARACTER_RELATION_KIND_ORDER) buckets.set(k, [])
    c.relations.forEach((raw, index) => {
      const k = coerceCharacterRelationKind(raw.kind)
      const rel: CharacterRelation = { ...raw, kind: k }
      const list = buckets.get(k)
      if (list) list.push({ rel, index })
    })
    return CHARACTER_RELATION_KIND_ORDER.map((kind) => ({
      kind,
      rows: buckets.get(kind) ?? [],
    })).filter((g) => g.rows.length > 0)
  }, [c.relations])

  const updateRelation = (index: number, next: CharacterRelation) => {
    const relations = c.relations.map((r, i) => (i === index ? next : r))
    patchCharacter(c.id, { relations })
  }

  return (
    <SectionCard title="관계망">
      <p className="mb-3 text-[11px] leading-snug text-ab-sub">
        악역·애증·동료·가족 등 유형별로 묶여 보입니다. 유형과 한 줄 메모는 여기서 바로 고칠 수 있어요.
      </p>
      {grouped.map(({ kind, rows }) => {
        const meta = characterRelationKindMeta(kind)
        return (
          <div key={kind} className="mb-5 border-b border-ab-border/70 pb-4 last:mb-0 last:border-b-0 last:pb-0">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-wide"
                style={{ color: meta.color, backgroundColor: meta.bg }}
              >
                {meta.label}
              </span>
              <span className="text-[10px] text-ab-sub">{rows.length}인</span>
            </div>
            <ul className="space-y-2.5">
              {rows.map(({ rel, index }) => {
                const name = allChars.find((x) => x.id === rel.targetId)?.name ?? rel.targetId
                const rk = coerceCharacterRelationKind(rel.kind)
                return (
                  <li
                    key={`${c.id}-${rel.targetId}-${index}`}
                    className="rounded-md border border-ab-border bg-ab-muted/30 p-3"
                  >
                    <p className="text-sm font-semibold text-ab-text">{name}</p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                      <select
                        value={rk}
                        onChange={(e) => {
                          const nk = isCharacterRelationKind(e.target.value) ? e.target.value : 'other'
                          updateRelation(index, { ...rel, kind: nk })
                        }}
                        aria-label={`${name}와의 관계 유형`}
                        className="w-full shrink-0 rounded-md border border-ab-border bg-ab-input px-2 py-2 text-xs text-ab-text sm:max-w-[140px]"
                      >
                        {CHARACTER_RELATION_KIND_ORDER.map((k) => (
                          <option key={k} value={k}>
                            {characterRelationKindMeta(k).label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={rel.emotion}
                        onChange={(e) => updateRelation(index, { ...rel, emotion: e.target.value })}
                        placeholder="감정·상세 메모 (한 줄)"
                        aria-label={`${name}와의 관계 메모`}
                        className="min-w-0 flex-1 rounded-md border border-ab-border bg-ab-input px-2 py-2 text-xs text-ab-text"
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
      {c.relations.length === 0 && <p className="text-xs text-ab-sub">관계가 없습니다.</p>}
    </SectionCard>
  )
}

function CharacterDetail({ c, allChars }: { c: Character; allChars: Character[] }) {
  const [openSampleId, setOpenSampleId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState<CharacterEditMode | null>(null)
  const patchCharacter = useMentionStore((s) => s.patchCharacter)

  const { sampleValues, customValues } = useMemo(() => {
    const sampleValues: CharacterValueEntry[] = []
    const customValues: CharacterValueEntry[] = []
    for (const v of c.values) {
      if (v.isSample) sampleValues.push(v)
      else customValues.push(v)
    }
    return { sampleValues, customValues }
  }, [c.values])

  const tapTarget =
    'w-full rounded-sm border border-ab-border border-dashed border-ab-border/80 bg-ab-muted/20 p-2 text-left transition-colors active:bg-ab-muted/50'

  return (
    <section className="flex flex-col gap-3 border-t border-ab-border pt-5 first:border-t-0 first:pt-0">
      <p className="text-[11px] text-ab-sub">CHAPTER 02</p>
      <h2 className="font-title-italic text-2xl font-semibold text-ab-text">{c.name}</h2>
      <div className="flex flex-wrap gap-2">
        {c.tags.slice(0, 4).map((t) => (
          <TajiTag key={t} variant="gray">
            {t}
          </TajiTag>
        ))}
      </div>

      <ConceptArtSlot
        imageUri={c.imageUri}
        onImageChange={async (uri) => {
          if (!uri) {
            patchCharacter(c.id, { imageUri: null })
            return
          }
          const cols = await extractDominantHexColors(uri, 2)
          const colors =
            cols.length >= 2 ? [cols[0]!, cols[1]!] : cols.length === 1 ? [cols[0]!, cols[0]!] : undefined
          patchCharacter(c.id, {
            imageUri: uri,
            ...(colors ? { colors } : {}),
          })
        }}
        emptyHint="캐릭터 컨셉 아트·삽화를 넣을 수 있어요. (기기에서 이미지 선택)"
        pickLabel="컨셉 아트 넣기"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => setEditOpen({ type: 'quote' })}
          className="relative w-full rounded-sm border border-ab-border bg-ab-muted/40 px-4 py-5 text-left active:bg-ab-muted/60"
        >
          <span
            className="pointer-events-none absolute left-2 top-1 font-title-italic text-4xl leading-none text-ab-sub/50"
            aria-hidden
          >
            “
          </span>
          <p className="pl-4 text-center text-sm leading-relaxed text-ab-text">{c.quote || INFO_PLACEHOLDER}</p>
          <span
            className="pointer-events-none absolute bottom-0 right-3 font-title-italic text-4xl leading-none text-ab-sub/50"
            aria-hidden
          >
            ”
          </span>
          <span className="mt-2 block text-center text-[10px] text-ab-sub">탭하여 대사 수정</span>
        </button>
      </div>

      <SectionCard title="기본 설정">
        <p className="mb-2 text-[10px] text-ab-sub">칸을 눌러 수정합니다.</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(
            [
              ['personality', '성격', c.personality],
              ['ability', '능력', c.ability],
              ['likes', '좋아하는 것', c.likes],
              ['dislikes', '싫어하는 것', c.dislikes],
            ] as const
          ).map(([field, label, val]) => (
            <button
              key={field}
              type="button"
              onClick={() => setEditOpen({ type: 'basic', field, label })}
              className={tapTarget}
            >
              <p className="text-[10px] text-ab-sub">{label}</p>
              <p className="mt-1 text-ab-text">{val || INFO_PLACEHOLDER}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="목소리 · 억양">
        <button
          type="button"
          onClick={() => setEditOpen({ type: 'voice' })}
          className={`${tapTarget} w-full`}
        >
          <VoiceBars pitch={c.voiceTone.pitch} emotion={c.voiceTone.emotion} speed={c.voiceTone.speed} />
          <span className="mt-2 block text-center text-[10px] text-ab-sub">탭하여 슬라이더로 조절</span>
        </button>
      </SectionCard>

      <SectionCard title="컬러 · 실루엣">
        <p className="mb-2 text-[10px] leading-snug text-ab-sub">
          컨셉 아트를 넣으면 화면에서 가장 많이 쓰인 색 2개를 자동으로 뽑아요.
        </p>
        <div className="flex flex-wrap gap-2">
          {c.colors.map((col) => (
            <span
              key={col}
              className="h-8 w-8 rounded-full border border-ab-border shadow-sm"
              style={{ backgroundColor: col }}
              title={col}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="가치관 질문">
        <p className="mb-2 text-[10px] leading-snug text-ab-sub">
          <span className="font-semibold text-ab-text">샘플</span> 카드는 데모용으로 고정되어 있어요. 아래 +로 질문을
          더할 수 있어요.
        </p>
        <div className="space-y-1">
          {sampleValues.map((v) => (
            <div key={v.id} className="rounded-sm border border-ab-border bg-ab-muted/20">
              <div className="flex items-center justify-between gap-2 border-b border-ab-border/60 px-2 py-1">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-ab-sub">샘플</span>
              </div>
              <button
                type="button"
                onClick={() => setOpenSampleId((id) => (id === v.id ? null : v.id))}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-ab-text"
              >
                {v.theme}
                <span className="text-ab-sub">{openSampleId === v.id ? '−' : '+'}</span>
              </button>
              {openSampleId === v.id && (
                <p className="border-t border-ab-border px-3 py-2 text-xs text-ab-sub">{v.answer || INFO_PLACEHOLDER}</p>
              )}
            </div>
          ))}
          {customValues.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setEditOpen({ type: 'value-edit', entry: v })}
              className="flex w-full flex-col items-stretch rounded-sm border border-ab-border bg-ab-card px-3 py-2 text-left active:bg-ab-muted/40"
            >
              <span className="text-sm font-medium text-ab-text">{v.theme}</span>
              <span className="mt-0.5 line-clamp-2 text-xs text-ab-sub">{v.answer || INFO_PLACEHOLDER}</span>
              <span className="mt-1 text-[10px] text-ab-point">탭하여 편집</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setEditOpen({ type: 'value-new' })}
          className="mt-3 w-full rounded-md border border-dashed border-ab-border py-2.5 text-xs font-medium text-ab-text hover:bg-ab-muted/40"
        >
          + 가치관 질문 추가
        </button>
      </SectionCard>

      <CharacterFieldEditBar
        open={editOpen}
        character={c}
        onClose={() => setEditOpen(null)}
        onApply={(patch) => patchCharacter(c.id, patch)}
        onDeleteValue={(id) => patchCharacter(c.id, { values: c.values.filter((x) => x.id !== id) })}
      />

      <CharacterRelationSection c={c} allChars={allChars} />
    </section>
  )
}

export function CharacterTab() {
  const pid = useProjectStore((s) => s.currentProjectId)
  const chars = useMentionStore(
    useShallow((s) => (pid ? s.characters.filter((c) => c.projectId === pid) : [])),
  )

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [lastSoloId, setLastSoloId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [draftIds, setDraftIds] = useState<Set<string>>(new Set())

  const charIdsKey = useMemo(() => chars.map((c) => c.id).join('|'), [chars])

  useEffect(() => {
    if (chars.length === 0) {
      setSelectedIds([])
      setLastSoloId(null)
      return
    }
    const idSet = new Set(chars.map((c) => c.id))
    setSelectedIds((prev) => {
      const valid = prev.filter((id) => idSet.has(id))
      if (valid.length > 0) return valid
      return [chars[0]!.id]
    })
    setLastSoloId((prev) => (prev && idSet.has(prev) ? prev : chars[0]!.id))
  }, [charIdsKey, chars])

  useEffect(() => {
    if (selectedIds.length === 1) {
      const id = selectedIds[0]!
      if (chars.some((c) => c.id === id)) setLastSoloId(id)
    }
  }, [selectedIds, chars])

  const visibleChars = useMemo(() => {
    const set = new Set(selectedIds)
    return chars.filter((c) => set.has(c.id))
  }, [chars, selectedIds])

  const openPicker = useCallback(() => {
    setDraftIds(new Set(selectedIds.length > 0 ? selectedIds : [chars[0]!.id]))
    setPickerOpen(true)
  }, [selectedIds, chars])

  const toggleDraft = useCallback((id: string) => {
    setDraftIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size <= 1) return next
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const confirmPicker = useCallback(() => {
    const order = chars.filter((c) => draftIds.has(c.id)).map((c) => c.id)
    if (order.length === 0) return
    setSelectedIds(order)
    setPickerOpen(false)
  }, [chars, draftIds])

  const resetToLastSolo = useCallback(() => {
    const fallback = chars[0]?.id
    const solo = lastSoloId && chars.some((c) => c.id === lastSoloId) ? lastSoloId : fallback
    if (solo) setSelectedIds([solo])
  }, [lastSoloId, chars])

  const nameButtonLabel = useMemo(() => {
    if (visibleChars.length === 0) return '캐릭터 선택'
    if (visibleChars.length === 1) return visibleChars[0]!.name
    const first = visibleChars[0]!.name
    return `${first} 외 ${visibleChars.length - 1}명`
  }, [visibleChars])

  if (!chars.length) {
    return (
      <div className="px-4 py-10 text-center text-sm text-ab-sub">캐릭터가 없습니다. 세계관을 먼저 만들어 주세요.</div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-3 pb-4 pt-2">
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={openPicker}
          className="min-w-0 flex-1 truncate rounded-sm border border-ab-border bg-ab-card px-3 py-2.5 text-left text-sm font-medium text-ab-text active:bg-ab-muted/60"
        >
          {nameButtonLabel}
        </button>
        <button
          type="button"
          onClick={resetToLastSolo}
          disabled={visibleChars.length <= 1}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-sm border border-ab-border bg-ab-card text-ab-text disabled:cursor-not-allowed disabled:opacity-35 active:bg-ab-muted/60"
          aria-label="선택 초기화: 최근에 본 캐릭터 한 명으로 복구"
          title="한 명으로 복구"
        >
          <RestoreArrowIcon className="h-5 w-5" />
        </button>
      </div>

      {visibleChars.map((c) => (
        <CharacterDetail key={c.id} c={c} allChars={chars} />
      ))}

      {pickerOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] bg-ab-text/40"
            aria-label="닫기"
            onClick={() => setPickerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="char-picker-title"
            className="fixed left-1/2 top-1/2 z-[90] w-[min(340px,calc(100vw-24px))] max-h-[min(72vh,480px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card"
          >
            <div className="border-b border-ab-border px-4 py-3">
              <h2 id="char-picker-title" className="font-title-italic text-lg font-semibold text-ab-text">
                캐릭터 선택
              </h2>
              <p className="mt-1 text-xs text-ab-sub">복수 선택 가능 · 최소 1명</p>
            </div>
            <ul className="max-h-[min(50vh,320px)] overflow-y-auto px-2 py-2">
              {chars.map((ch) => {
                const on = draftIds.has(ch.id)
                return (
                  <li key={ch.id} className="border-b border-ab-border/60 last:border-0">
                    <label className="flex cursor-pointer items-center gap-3 px-2 py-3 active:bg-ab-muted/50">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleDraft(ch.id)}
                        className="h-4 w-4 shrink-0 rounded border-ab-border accent-ab-text"
                      />
                      <span className="min-w-0 flex-1 text-sm font-medium text-ab-text">{ch.name}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <div className="flex gap-2 border-t border-ab-border p-3">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="flex-1 rounded-sm border border-ab-border py-2.5 text-sm text-ab-text"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmPicker}
                className="flex-1 rounded-sm bg-ab-text py-2.5 text-sm font-semibold text-ab-card"
              >
                확인
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
