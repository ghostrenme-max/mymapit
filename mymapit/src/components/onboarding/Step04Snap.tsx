import { useMemo, useState } from 'react'

type SnapNode = { id: string; label: string; links: string[] }

const NODES: SnapNode[] = [
  { id: 'a', label: '@레이나', links: ['b', 'e', 'f'] },
  { id: 'b', label: '서사-각성', links: ['a', 'c', 'f'] },
  { id: 'c', label: '@봉인석', links: ['b', 'd'] },
  { id: 'd', label: '@북부설원', links: ['c', 'e'] },
  { id: 'e', label: '@카엔', links: ['a', 'd'] },
  { id: 'f', label: '@에테르균열', links: ['a', 'b'] },
]

export function Step04Snap() {
  const [active, setActive] = useState<string>('a')

  const linked = useMemo(() => {
    const n = NODES.find((x) => x.id === active)
    return n?.links ?? []
  }, [active])

  const linkedLabels = useMemo(() => {
    return linked
      .map((id) => NODES.find((x) => x.id === id)?.label)
      .filter(Boolean) as string[]
  }, [linked])

  return (
    <div className="flex flex-col items-center pb-2">
      <h2 className="mt-2 max-w-[min(100%,20rem)] text-center font-title-italic text-2xl font-semibold leading-snug text-white">
        하나를 누르면 연관된
        <br />
        모든 것이 당겨져
      </h2>
      <p className="mt-3 max-w-[min(100%,20rem)] text-center text-sm leading-relaxed text-white/55">
        노드를 탭하면 Snap처럼 연결된 항목이 밝아지고, 아래에 순서대로 모여요.
      </p>

      <div className="mt-6 flex w-full max-w-[340px] flex-wrap justify-center gap-2">
        {NODES.map((n) => {
          const on = n.id === active
          const isLinked = linked.includes(n.id)
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setActive(n.id)}
              className="rounded-full border px-3 py-2 text-[11px] font-semibold transition-transform duration-200"
              style={{
                borderColor: on ? '#C4614A' : 'rgba(255,255,255,0.2)',
                backgroundColor: on ? 'rgba(196,97,74,0.25)' : 'rgba(255,255,255,0.06)',
                color: on ? '#fff' : isLinked ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)',
                transform: on ? 'scale(1.06)' : isLinked ? 'scale(1.02)' : 'scale(1)',
                opacity: isLinked || on ? 1 : 0.55,
              }}
            >
              {n.label}
            </button>
          )
        })}
      </div>

      <div className="mt-8 w-full max-w-[340px] rounded-md border border-white/15 bg-black/30 px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#C4614A]">Snap 결과</p>
        <div className="mt-2 flex min-h-[2.5rem] flex-wrap gap-1.5">
          {linkedLabels.map((label, i) => (
            <span
              key={label}
              className="rounded-[2px] bg-white/10 px-2.5 py-1 text-[11px] text-white/90"
              style={{
                animation: 'ab-pop 0.5s ease-out both',
                animationDelay: `${i * 0.12}s`,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
