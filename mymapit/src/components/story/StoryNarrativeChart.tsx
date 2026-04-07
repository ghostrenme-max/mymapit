import { STORY_EMOTION_TAG_META, type StoryEmotionTag } from '../../constants/storyNarrative'
import { smoothCurveThroughPoints } from '../../lib/smoothPath'
import { STORY_METRIC_MAX } from '../../lib/storyMetrics'

const LIGHT_GRAY = '#D4D4D4'
const LIGHT_GRAY_STROKE = '#C4C4C4'

type Props = {
  tensionValues: number[]
  relaxationValues: number[]
  emotionTags: (StoryEmotionTag | null)[]
  width?: number
  height?: number
}

/** 긴장·이완: 밝은 회색 / (긴장+이완)/2: 진한색 부드러운 곡선 + 감정 태그 점 */
export function StoryNarrativeChart({
  tensionValues,
  relaxationValues,
  emotionTags,
  width = 340,
  height = 140,
}: Props) {
  const max = STORY_METRIC_MAX
  const pad = 10
  const w = width - pad * 2
  const h = height - pad * 2

  const toPoints = (values: number[]) =>
    values.map((v, i) => {
      const x = pad + (w * i) / Math.max(1, values.length - 1)
      const y = pad + h - (h * Math.min(max, Math.max(1, v))) / max
      return { x, y }
    })

  const toPolylinePath = (values: number[]) => {
    if (values.length === 0) return ''
    const pts = toPoints(values)
    return `M ${pts.map((p) => `${p.x},${p.y}`).join(' L ')}`
  }

  const avgValues = tensionValues.map((t, i) => {
    const r = relaxationValues[i] ?? t
    return Math.round((t + r) / 2)
  })
  const avgPoints = toPoints(avgValues)
  const avgSmoothPath = smoothCurveThroughPoints(avgPoints)

  const empty = tensionValues.length === 0

  if (empty) {
    return (
      <div className="flex h-[140px] items-center justify-center text-xs text-ab-sub">이 막에 노드가 없습니다.</div>
    )
  }

  const dT = toPolylinePath(tensionValues)
  const dR = relaxationValues.length ? toPolylinePath(relaxationValues) : ''

  return (
    <div className="mx-auto block w-full max-w-full">
      <svg
        width={width}
        height={height}
        className="mx-auto block"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="긴장·이완·평균 곡선"
      >
        {dR ? (
          <path
            d={dR}
            fill="none"
            stroke={LIGHT_GRAY_STROKE}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {dT ? (
          <path
            d={dT}
            fill="none"
            stroke={LIGHT_GRAY}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {avgSmoothPath ? (
          <path
            d={avgSmoothPath}
            fill="none"
            stroke="var(--color-ab-text)"
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {avgPoints.map((pt, i) => {
          const tag = emotionTags[i]
          const fill = tag ? STORY_EMOTION_TAG_META[tag].color : 'var(--color-ab-text)'
          return (
            <circle
              key={`n-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={tag ? 4 : 2.5}
              fill={fill}
              className={tag ? '' : undefined}
            />
          )
        })}
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-ab-sub">
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-4 rounded-full bg-[#D4D4D4]" aria-hidden />
          긴장
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-4 rounded-full bg-[#C4C4C4]" aria-hidden />
          이완
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-4 rounded-full bg-ab-text" aria-hidden />
          평균 (부드러운 곡선)
        </span>
      </div>
    </div>
  )
}
