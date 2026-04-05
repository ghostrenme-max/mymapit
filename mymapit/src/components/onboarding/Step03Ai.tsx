import { useCallback, useRef, useState } from 'react'
import { detectDoubleAtTrigger } from '../../lib/doubleAtTrigger'
import type { AiExtractDraft } from '../../lib/mockAiExtract'
import { AiInfoBottomSheet } from '../memo/AiInfoBottomSheet'

const ONBOARDING_DRAFT: AiExtractDraft = {
  summary: '체험용 AI 요약: 장면의 긴장과 인물 관계가 압축적으로 드러납니다.',
  tension: 7,
  characters: ['레이나', '카엔'],
  worldElements: ['에테르', '봉인'],
  places: ['북부 설원'],
  objects: ['봉인석'],
  suggestedKeywords: ['각성', '잔향', '균열', '설원', '봉인', '서사', '갈등', '성장', '미스터리', '동료'],
}

export function Step03Ai() {
  const [text, setText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [sheet, setSheet] = useState(false)
  const lockRef = useRef(false)
  const firedRef = useRef(false)

  const tryRun = useCallback(
    (value: string, caret: number) => {
      if (analyzing || sheet || lockRef.current || firedRef.current) return
      const before = value.slice(0, caret).replace(/\r\n/g, '\n')
      if (!detectDoubleAtTrigger(before)) return

      firedRef.current = true
      lockRef.current = true
      const trig = detectDoubleAtTrigger(before)!
      const cleaned = before.slice(0, trig.start) + value.slice(caret)

      setAnalyzing(true)
      window.setTimeout(() => {
        setText(cleaned)
        setAnalyzing(false)
        setSheet(true)
        lockRef.current = false
      }, 1800)
    },
    [analyzing, sheet],
  )

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    const caret = e.target.selectionStart ?? v.length
    setText(v)
    tryRun(v, caret)
  }

  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget
    if (e.key === 'Enter') {
      window.queueMicrotask(() => tryRun(t.value, t.selectionStart ?? t.value.length))
    }
  }

  return (
    <div className="relative flex flex-col items-center pb-2">
      <h2 className="mt-2 max-w-[min(100%,20rem)] text-center font-title-italic text-2xl font-semibold leading-snug text-white">
        @@로 AI가 텍스트를 정리해줘
      </h2>
      <p className="mt-3 max-w-[min(100%,20rem)] text-center text-sm leading-relaxed text-white/55">
        @@ 뒤에 문장을 쓰고 엔터를 치거나, 20자 이상 이어 쓰면 분석 인디케이터가 돌아가요. (체험은 한도를 쓰지 않아요)
      </p>

      <div className="relative mt-5 w-full max-w-[320px]">
        <textarea
          value={text}
          onChange={onChange}
          onKeyUp={onKeyUp}
          rows={5}
          placeholder="예: @@ 북부 설원에서 각성이 일어났다"
          className="min-h-[120px] w-full resize-none rounded-md border border-white/15 bg-black/25 px-3 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-white/35"
          spellCheck={false}
        />
        {analyzing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-black/55">
            <div className="flex gap-1.5 rounded-md border border-white/20 bg-[#1a1918] px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 animate-bounce rounded-full bg-[#C4614A]"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AiInfoBottomSheet
        open={sheet}
        draft={ONBOARDING_DRAFT}
        sourceText="@@ 체험 본문 — 에테르가 요동치는 밤."
        onClose={() => {
          setSheet(false)
          firedRef.current = false
        }}
        onSaveToArtbook={() => {
          setSheet(false)
          firedRef.current = false
        }}
      />
    </div>
  )
}
