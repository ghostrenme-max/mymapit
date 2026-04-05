type Props = {
  values: number[]
  width?: number
  height?: number
}

/** 긴장–이완 곡선 (단순 SVG 라인) */
export function TensionCurveSvg({ values, width = 320, height = 120 }: Props) {
  if (values.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-ab-sub">
        노드가 없습니다.
      </div>
    )
  }
  const pad = 8
  const w = width - pad * 2
  const h = height - pad * 2
  const max = 10
  const pts = values.map((v, i) => {
    const x = pad + (w * i) / Math.max(1, values.length - 1)
    const y = pad + h - (h * Math.min(max, Math.max(0, v))) / max
    return `${x},${y}`
  })
  const d = `M ${pts.join(' L ')}`

  return (
    <svg
      width={width}
      height={height}
      className="mx-auto block text-ab-text"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="긴장 곡선"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => {
        const x = pad + (w * i) / Math.max(1, values.length - 1)
        const y = pad + h - (h * Math.min(max, Math.max(0, v))) / max
        return <circle key={i} cx={x} cy={y} r={3} className="fill-ab-sub" />
      })}
    </svg>
  )
}
