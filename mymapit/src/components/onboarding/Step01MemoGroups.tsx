import { useState } from 'react'

/** 뒤쪽 카드는 텍스트 없이 실루엣만 — 겹쳐도 글자가 섞이지 않음 */
function StackCardBack({ depth }: { depth: 1 | 2 }) {
  const shift = depth === 2 ? 22 : 11
  const rot = depth === 2 ? -5 : 4
  const scale = depth === 2 ? 0.9 : 0.94
  const op = depth === 2 ? 0.32 : 0.48
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-0 w-[min(232px,88vw)] rounded-md border border-white/18 bg-[#141312] px-3 py-3 shadow-md"
      style={{
        transform: `translate(-50%, ${shift}px) rotate(${rot}deg) scale(${scale})`,
        zIndex: depth === 2 ? 1 : 2,
        opacity: op,
      }}
      aria-hidden
    >
      <div className="h-2 w-12 rounded-sm bg-white/10" />
      <div className="mt-2 h-2 w-3/4 max-w-[140px] rounded-sm bg-white/8" />
      <div className="mt-1.5 h-2 w-1/2 max-w-[100px] rounded-sm bg-white/6" />
    </div>
  )
}

export function Step01MemoGroups() {
  const [name, setName] = useState('')
  const [cards, setCards] = useState<string[]>(['프롤로그', '설정 노트'])

  const add = () => {
    const t = name.trim()
    if (!t) return
    setCards((c) => [t, ...c].slice(0, 5))
    setName('')
  }

  const topLabel = cards[0] ?? '메모 그룹'

  return (
    <div className="flex flex-col items-center pb-2">
      <div className="relative mx-auto mt-2 h-[9.5rem] w-full max-w-[260px]">
        <StackCardBack depth={2} />
        <StackCardBack depth={1} />
        <div
          className="absolute left-1/2 top-0 z-[4] w-[min(240px,90vw)] rounded-md border border-white/25 bg-[#1e1d1c] px-3.5 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
          style={{
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/45">그룹</p>
          <p className="mt-1 line-clamp-2 break-keep font-title-italic text-lg leading-tight text-white">
            {topLabel}
          </p>
        </div>
      </div>

      <h2 className="mt-10 max-w-[min(100%,20rem)] text-center font-title-italic text-2xl font-semibold leading-snug text-white">
        세계관을 메모처럼 자유롭게 써
      </h2>
      <p className="mt-3 max-w-[min(100%,20rem)] text-center text-sm leading-relaxed text-white/55">
        아래에서 그룹 이름을 입력하고 + 를 눌러 체험해 보세요. 실제 앱에서는 홈에서 그룹을 만듭니다.
      </p>

      <div className="mt-6 flex w-full max-w-[280px] gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="그룹 이름"
          className="min-w-0 flex-1 rounded-md border border-white/20 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-md px-4 py-2.5 text-lg font-semibold text-white"
          style={{ backgroundColor: '#C4614A' }}
        >
          +
        </button>
      </div>

      {cards[0] && (
        <p className="mt-4 rounded-md border border-[#C4614A]/50 bg-[#C4614A]/15 px-3 py-2 text-center text-xs text-[#C4614A]">
          「{cards[0]}」 생성됨 — 스택 맨 위 카드가 갱신돼요
        </p>
      )}
    </div>
  )
}
