import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { ArtFrame } from '../common/ArtFrame'
import { SectionCard } from '../common/SectionCard'
import { TajiTag } from '../common/TajiTag'
import { VoiceBars } from '../character/VoiceBars'
import { useMentionStore } from '../../stores/mentionStore'
import { useProjectStore } from '../../stores/projectStore'

export function CharacterTab() {
  const pid = useProjectStore((s) => s.currentProjectId)
  const chars = useMentionStore(
    useShallow((s) => (pid ? s.characters.filter((c) => c.projectId === pid) : [])),
  )
  const [ix, setIx] = useState(0)
  const [openV, setOpenV] = useState<number | null>(0)
  const c = chars[ix]

  if (!c) {
    return (
      <div className="px-4 py-10 text-center text-sm text-ab-sub">캐릭터가 없습니다. 세계관을 먼저 만들어 주세요.</div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-3 pb-4 pt-2">
      {chars.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {chars.map((ch, i) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setIx(i)}
              className={`shrink-0 rounded-sm border px-3 py-1.5 text-xs ${
                i === ix ? 'border-ab-text bg-ab-text text-ab-card' : 'border-ab-border bg-ab-card'
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-ab-sub">CHAPTER 02</p>
      <h2 className="font-title-italic text-2xl font-semibold">{c.name}</h2>
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
            const name = chars.find((x) => x.id === r.targetId)?.name ?? r.targetId
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
    </div>
  )
}
