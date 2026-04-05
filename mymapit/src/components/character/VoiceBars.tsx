type Props = {
  pitch: number
  emotion: number
  speed: number
}

export function VoiceBars({ pitch, emotion, speed }: Props) {
  const rows = [
    { label: '음역대', v: pitch },
    { label: '감정 표현', v: emotion },
    { label: '말 속도', v: speed },
  ]
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-0.5 flex justify-between text-[10px] text-ab-sub">
            <span>{r.label}</span>
            <span className="tabular-nums text-ab-text">{r.v}</span>
          </div>
          <div className="flex h-6 items-end gap-0.5">
            {Array.from({ length: 12 }).map((_, i) => {
              const h = 8 + (i / 11) * 16
              const on = (i / 11) * 100 <= r.v
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-[1px] ${on ? 'bg-ab-text' : 'bg-ab-muted'}`}
                  style={{ height: `${h}px` }}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
