import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { MENTION_TAB_ROWS, mentionKindMeta } from '../../constants/mentionKinds'
import { runForceLayout, snapToGrid, SNAP_GRID, type Point } from '../../lib/forceLayout'
import { buildMentionCooccurrenceGraph } from '../../lib/mentionGraph'
import { useMemoStore } from '../../stores/memoStore'
import { useProjectStore } from '../../stores/projectStore'
import { useSnapMapStore } from '../../stores/snapMapStore'

const W = 360
const H = 440
const NODE_R = 22

function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number): Point {
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: clientX, y: clientY }
  const p = pt.matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}

export function SnapMapTab() {
  const pid = useProjectStore((s) => s.currentProjectId)
  const memoGroups = useMemoStore(useShallow((s) => s.memoGroups))
  const memos = useMemoStore(useShallow((s) => s.memos))

  const setLayout = useSnapMapStore((s) => s.setLayout)
  const clearProjectLayout = useSnapMapStore((s) => s.clearProjectLayout)

  const graph = useMemo(() => {
    if (!pid) return { nodes: [] as const, edges: [] as const, signature: '' }
    return buildMentionCooccurrenceGraph(pid, memoGroups, memos)
  }, [pid, memoGroups, memos])

  const graphRef = useRef(graph)
  graphRef.current = graph

  const [positions, setPositions] = useState<Record<string, Point>>({})
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [hoverEdge, setHoverEdge] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragRef = useRef<{ id: string } | null>(null)
  const lastSigRef = useRef('')

  useEffect(() => {
    const g = graphRef.current
    if (!pid || g.signature === '' || g.nodes.length === 0) {
      lastSigRef.current = ''
      setPositions({})
      return
    }
    if (lastSigRef.current === g.signature) return
    lastSigRef.current = g.signature
    const saved = useSnapMapStore.getState().layouts[pid] ?? {}
    const ids = g.nodes.map((n) => n.id)
    const next = runForceLayout(ids, g.edges, W, H, saved, 95)
    setPositions(next)
    setLayout(pid, next)
  }, [pid, graph.signature, setLayout])

  const persistPositions = useCallback(
    (next: Record<string, Point>) => {
      if (!pid) return
      setLayout(pid, next)
    },
    [pid, setLayout],
  )

  const endWindowDrag = useCallback(() => {
    const id = dragRef.current?.id
    dragRef.current = null
    if (!id || !pid) return
    setPositions((prev) => {
      const pos = prev[id]
      if (!pos) return prev
      const snapped = snapEnabled ? snapToGrid(pos) : pos
      const next = { ...prev, [id]: snapped }
      persistPositions(next)
      return next
    })
  }, [pid, persistPositions, snapEnabled])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current
      const svg = svgRef.current
      if (!d || !svg) return
      const p = clientToSvg(svg, e.clientX, e.clientY)
      const x = Math.max(NODE_R + 4, Math.min(W - NODE_R - 4, p.x))
      const y = Math.max(NODE_R + 4, Math.min(H - NODE_R - 4, p.y))
      const pt = snapEnabled ? snapToGrid({ x, y }) : { x, y }
      setPositions((prev) => ({ ...prev, [d.id]: pt }))
    }
    const onUp = () => endWindowDrag()
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [snapEnabled, endWindowDrag])

  const onPointerDownNode = useCallback((e: React.PointerEvent, nodeId: string) => {
    e.preventDefault()
    dragRef.current = { id: nodeId }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [])

  const autoArrange = useCallback(() => {
    if (!pid) return
    clearProjectLayout(pid)
    lastSigRef.current = ''
    const ids = graph.nodes.map((n) => n.id)
    const next = runForceLayout(ids, graph.edges, W, H, {}, 95)
    setPositions(next)
    setLayout(pid, next)
    lastSigRef.current = graph.signature
  }, [pid, clearProjectLayout, graph, setLayout])

  if (!pid) {
    return (
      <div className="px-4 py-10 text-center text-sm text-ab-sub">프로젝트를 선택한 뒤 연결맵을 열어 주세요.</div>
    )
  }

  if (graph.nodes.length === 0) {
    return (
      <div className="flex flex-col gap-3 px-4 py-8">
        <p className="text-center font-title-italic text-lg text-ab-text">아직 연결할 @멘션이 없어요</p>
        <p className="text-center text-sm leading-relaxed text-ab-sub">
          메모 본문에 <span className="text-ab-text">@캐릭터</span>·<span className="text-ab-text">@장소</span> 등을 넣고
          저장하면, 같은 메모에 함께 등장한 항목끼리 선으로 이어집니다.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-3 pb-6 pt-2">
      <div>
        <p className="text-[11px] text-ab-sub">Snap 연결맵</p>
        <h2 className="font-title-italic text-xl font-semibold text-ab-text">@ 공출현 관계</h2>
        <p className="mt-1 text-xs leading-relaxed text-ab-sub">
          한 메모 안에서 같이 쓰인 멘션은 곧 &quot;한 장면에서 동시에 등장&quot;한 설정으로 봅니다. 노드를 드래그하면{' '}
          {SNAP_GRID}px 격자에 맞춰 정렬됩니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={autoArrange}
          className="rounded-sm border border-ab-border bg-ab-card px-3 py-1.5 text-xs font-semibold text-ab-text"
        >
          자동 정렬
        </button>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ab-sub">
          <input
            type="checkbox"
            checked={snapEnabled}
            onChange={(e) => setSnapEnabled(e.target.checked)}
            className="rounded border-ab-border"
          />
          격자 스냅 ({SNAP_GRID}px)
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-ab-border pb-2">
        <span className="w-full text-[10px] font-semibold uppercase tracking-wide text-ab-sub">범례</span>
        {MENTION_TAB_ROWS.map((row) => (
          <span
            key={row.kind}
            className="rounded-[2px] px-2 py-0.5 text-[10px] font-medium"
            style={{ color: row.color, backgroundColor: row.bg }}
          >
            {row.label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-sm border border-ab-border bg-ab-card">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="touch-none select-none"
        >
          <defs>
            <pattern id="snapGrid" width={SNAP_GRID} height={SNAP_GRID} patternUnits="userSpaceOnUse">
              <path
                d={`M ${SNAP_GRID} 0 L 0 0 0 ${SNAP_GRID}`}
                fill="none"
                stroke="#D8D4CF"
                strokeWidth={0.4}
                opacity={0.55}
              />
            </pattern>
          </defs>
          <rect width={W} height={H} fill={snapEnabled ? 'url(#snapGrid)' : '#F7F6F4'} />

          {graph.edges.map((e) => {
            const a = positions[e.source]
            const b = positions[e.target]
            if (!a || !b) return null
            const midX = (a.x + b.x) / 2
            const midY = (a.y + b.y) / 2
            const ek = `${e.source}-${e.target}`
            const on = hoverEdge === ek
            return (
              <g key={ek}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#9A9590"
                  strokeWidth={on ? 2.2 : 1.2}
                  strokeOpacity={0.55 + (on ? 0.25 : 0)}
                  className="pointer-events-none"
                />
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="transparent"
                  strokeWidth={14}
                  className="cursor-pointer"
                  onPointerEnter={() => setHoverEdge(ek)}
                  onPointerLeave={() => setHoverEdge((h) => (h === ek ? null : h))}
                />
                {on && (
                  <g>
                    <rect
                      x={midX - 52}
                      y={midY - 20}
                      width={104}
                      height={36}
                      rx={3}
                      fill="#111110"
                      fillOpacity={0.88}
                    />
                    <text x={midX} y={midY - 4} textAnchor="middle" fill="#FFFFFF" fontSize={9}>
                      같은 메모 {e.weight}회
                    </text>
                    <text x={midX} y={midY + 10} textAnchor="middle" fill="#D8D4CF" fontSize={7}>
                      {e.memoTitles[0] ?? ''}
                      {e.memoTitles.length > 1 ? ' 외' : ''}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {graph.nodes.map((n) => {
            const p = positions[n.id]
            if (!p) return null
            const meta = mentionKindMeta(n.kind)
            return (
              <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
                <circle
                  r={NODE_R + 8}
                  fill="transparent"
                  className="cursor-grab touch-none active:cursor-grabbing"
                  onPointerDown={(e) => onPointerDownNode(e, n.id)}
                />
                <circle
                  r={NODE_R}
                  fill="#FFFFFF"
                  stroke={meta.color}
                  strokeWidth={2.5}
                  className="pointer-events-none"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={meta.color}
                  fontSize={10}
                  fontWeight={600}
                  className="pointer-events-none"
                  style={{ fontFamily: 'Syne, system-ui, sans-serif' }}
                >
                  {n.label.length > 5 ? `${n.label.slice(0, 4)}…` : n.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <p className="text-[10px] leading-relaxed text-ab-sub">
        노드 {graph.nodes.length}개 · 연결 {graph.edges.length}개 · 메모에 같이 나온 횟수가 많을수록 가까이 붙도록 자동
        정렬합니다.
      </p>
    </div>
  )
}
