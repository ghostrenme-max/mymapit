import { STORY_METRIC_MAX } from '../../lib/storyMetrics'

type Props = {
  tensionValues: number[]
  relaxationValues: number[]
  width?: number
  height?: number
}

/** 긴장·이완 곡선 (이중 폴리라인, 1~20 스케일) */
export function TensionCurveSvg({ tensionValues, relaxationValues, width = 320, height = 120 }: Props) {
  const max = STORY_METRIC_MAX
  const pad = 8
  const w = width - pad * 2
  const h = height - pad * 2

  const toPath = (values: number[]) => {
    if (values.length === 0) return ''
    const pts = values.map((v, i) => {
      const x = pad + (w * i) / Math.max(1, values.length - 1)
      const y = pad + h - (h * Math.min(max, Math.max(1, v))) / max
      return `${x},${y}`
    })
    return `M ${pts.join(' L ')}`
  }

  const empty = tensionValues.length === 0 && relaxationValues.length === 0

  if (empty) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-ab-sub">
        노드가 없습니다.
      </div>
    )
  }

  const dT = toPath(tensionValues)
  const dR = relaxationValues.length ? toPath(relaxationValues) : ''

  return (
    <div className="mx-auto block w-full max-w-full">
      <svg
        width={width}
        height={height}
        className="mx-auto block text-ab-text"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="긴장·이완 곡선"
      >
        {dR ? (
          <path
            d={dR}
            fill="none"
            stroke="var(--color-ab-sub)"
            strokeWidth={2}
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        ) : null}
        {dT ? (
          <path
            d={dT}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {tensionValues.map((v, i) => {
          const x = pad + (w * i) / Math.max(1, tensionValues.length - 1)
          const y = pad + h - (h * Math.min(max, Math.max(1, v))) / max
          return <circle key={`t-${i}`} cx={x} cy={y} r={3} className="fill-ab-text" />
        })}
        {relaxationValues.map((v, i) => {
          const x = pad + (w * i) / Math.max(1, Math.max(1, relaxationValues.length - 1))
          const y = pad + h - (h * Math.min(max, Math.max(1, v))) / max
          return <circle key={`r-${i}`} cx={x} cy={y} r={2.5} className="fill-ab-sub" />
        })}
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-3 text-[10px] text-ab-sub">
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-4 rounded-full bg-ab-text" aria-hidden />
          긴장
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-4 rounded-full border border-dashed border-ab-sub bg-transparent" aria-hidden />
          이완
        </span>
      </div>
    </div>
  )
}
