type Row = { icon: string; text: string }

const ROWS: Row[] = [
  { icon: '@', text: '단일 @ — 캐릭터·세계관·장소 등 7종 컬러 띠지' },
  { icon: '@@', text: '이중 @@ — AI 인포 페이지 (월 한도, PRO 혜택)' },
  { icon: '◎', text: 'Snap — 같은 메모·연결맵에서 관계 한눈에' },
  { icon: '▣', text: '아트북 — 세계관 / 캐릭터 / 서사 정리' },
]

type Props = { onStart: () => void }

export function Step05Start({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center pb-4">
      <span className="animate-ab-pulse-soft mt-4 text-5xl text-[#C4614A]" aria-hidden>
        ✦
      </span>
      <h2 className="mt-6 max-w-[min(100%,20rem)] text-center font-title-italic text-2xl font-semibold leading-snug text-white">
        이제 네 세계관을 펼쳐봐
      </h2>
      <ul className="mt-6 w-full max-w-[300px] space-y-3 text-left text-sm text-white/75">
        {ROWS.map((r) => (
          <li key={r.text} className="flex gap-3 border-b border-white/10 pb-3 last:border-0">
            <span className="w-8 shrink-0 text-center font-mono text-[#C4614A]">{r.icon}</span>
            <span className="leading-snug">{r.text}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="mt-10 w-full max-w-[280px] rounded-md py-3.5 text-sm font-semibold text-white"
        style={{ backgroundColor: '#C4614A' }}
      >
        ✦ 시작하기
      </button>
    </div>
  )
}
