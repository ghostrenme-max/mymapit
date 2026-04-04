import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { StoryNode } from '../../types/models'
import { flattenStoryTree } from '../../store/useStoryStore'

/** ResponsiveContainer는 초기 레이아웃에서 너비 0이 되면 런타임 오류로 전체 트리가 내려갈 수 있어 고정 크기 사용 */
const CHART_W = 342
const CHART_H = 144

type Props = {
  projectId: string
  nodes: StoryNode[]
}

export function TensionLineChart({ projectId, nodes }: Props) {
  const flat = flattenStoryTree(
    projectId,
    nodes.filter((n) => n.projectId === projectId),
  )
  const data = flat.map(({ node }, i) => ({
    i: i + 1,
    label: node.title.slice(0, 8),
    tension: node.tension,
  }))

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-m-muted bg-m-muted/40 py-8 text-center text-xs text-m-sub">
        노드를 추가하면 긴장 곡선이 표시됩니다.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-m-muted bg-m-card p-3">
      <h3 className="mb-2 text-xs font-semibold text-m-text">전체 긴장–이완 곡선</h3>
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <LineChart
          width={CHART_W}
          height={CHART_H}
          data={data}
          margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F1EE" />
          <XAxis dataKey="i" tick={{ fontSize: 10, fill: '#9A9590' }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9A9590' }} width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #F3F1EE',
              fontSize: 12,
            }}
            formatter={(v) => [`${v ?? ''}`, '긴장도']}
            labelFormatter={(_label, payload) => {
              const pl = payload?.[0]?.payload as { label?: string } | undefined
              return pl?.label ?? ''
            }}
          />
          <Line
            type="monotone"
            dataKey="tension"
            stroke="#D94F1E"
            strokeWidth={2}
            dot={{ r: 3, fill: '#2563EB' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </div>
    </div>
  )
}
