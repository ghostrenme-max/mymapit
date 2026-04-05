import { useCallback, useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { ArtFrame } from '../common/ArtFrame'
import { SectionCard } from '../common/SectionCard'
import { TajiTag } from '../common/TajiTag'
import { VoiceBars } from '../character/VoiceBars'
import { useMentionStore } from '../../stores/mentionStore'
import { useProjectStore } from '../../stores/projectStore'
import type { Character } from '../../stores/types'

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

function CharacterDetail({ c, allChars }: { c: Character; allChars: Character[] }) {
  const [openV, setOpenV] = useState<number | null>(null)

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

      <ArtFrame>
        <p className="text-center text-xs text-ab-sub">캐릭터 컨셉 아트</p>
      </ArtFrame>

      <blockquote className="relative rounded-sm border border-ab-border bg-ab-muted/40 px-4 py-5">
        <span
          className="pointer-events-none absolute left-2 top-1 font-title-italic text-4xl leading-none text-ab-sub/50"
          aria-hidden
        >
          “
        </span>
        <p className="pl-4 text-center text-sm leading-relaxed text-ab-text">{c.quote}</p>
        <span
          className="pointer-events-none absolute bottom-0 right-3 font-title-italic text-4xl leading-none text-ab-sub/50"
          aria-hidden
        >
          ”
        </span>
      </blockquote>

      <SectionCard title="기본 설정">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-sm bg-ab-muted/60 p-2">
            <p className="text-[10px] text-ab-sub">성격</p>
            <p className="mt-1 text-ab-text">{c.personality || '—'}</p>
          </div>
          <div className="rounded-sm bg-ab-muted/60 p-2">
            <p className="text-[10px] text-ab-sub">능력</p>
            <p className="mt-1 text-ab-text">{c.ability || '—'}</p>
          </div>
          <div className="rounded-sm bg-ab-muted/60 p-2">
            <p className="text-[10px] text-ab-sub">좋아하는 것</p>
            <p className="mt-1 text-ab-text">{c.likes || '—'}</p>
          </div>
          <div className="rounded-sm bg-ab-muted/60 p-2">
            <p className="text-[10px] text-ab-sub">싫어하는 것</p>
            <p className="mt-1 text-ab-text">{c.dislikes || '—'}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="목소리 · 억양">
        <VoiceBars pitch={c.voiceTone.pitch} emotion={c.voiceTone.emotion} speed={c.voiceTone.speed} />
      </SectionCard>

      <SectionCard title="컬러 · 실루엣">
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
        <div className="space-y-1">
          {c.values.map((v, i) => (
            <div key={i} className="rounded-sm border border-ab-border">
              <button
                type="button"
                onClick={() => setOpenV(openV === i ? null : i)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
              >
                {v.theme}
                <span className="text-ab-sub">{openV === i ? '−' : '+'}</span>
              </button>
              {openV === i && <p className="border-t border-ab-border px-3 py-2 text-xs text-ab-sub">{v.answer}</p>}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="관계망">
        <ul className="space-y-2 text-sm">
          {c.relations.map((r, i) => {
            const name = allChars.find((x) => x.id === r.targetId)?.name ?? r.targetId
            return (
              <li key={i} className="flex items-center justify-between rounded-sm bg-ab-muted/50 px-2 py-2">
                <span>{name}</span>
                <TajiTag variant="black">{r.emotion}</TajiTag>
              </li>
            )
          })}
          {c.relations.length === 0 && <li className="text-xs text-ab-sub">관계가 없습니다.</li>}
        </ul>
      </SectionCard>
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
            className="fixed left-1/2 top-1/2 z-[90] w-[min(340px,calc(100vw-24px))] max-h-[min(72vh,480px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card shadow-xl"
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
