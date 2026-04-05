import type { GraphEdge } from './mentionGraph'

export type Point = { x: number; y: number }

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** 격자 스냅 (Snap 연결맵) */
export const SNAP_GRID = 12

export function snapToGrid(p: Point, grid = SNAP_GRID): Point {
  return {
    x: Math.round(p.x / grid) * grid,
    y: Math.round(p.y / grid) * grid,
  }
}

/**
 * 초기 좌표 init을 기반으로 힘 모델을 몇 스텝 돌립니다.
 * init에 없는 노드는 원형 배치로 채웁니다.
 */
export function runForceLayout(
  nodeIds: string[],
  edges: readonly Pick<GraphEdge, 'source' | 'target' | 'weight'>[],
  width: number,
  height: number,
  init: Record<string, Point>,
  iterations = 90,
): Record<string, Point> {
  const cx = width / 2
  const cy = height / 2
  const R = Math.min(width, height) * 0.32
  const pos: Record<string, Point> = {}

  const n = nodeIds.length
  nodeIds.forEach((id, i) => {
    if (init[id]) {
      pos[id] = { ...init[id] }
    } else {
      const angle = (2 * Math.PI * i) / Math.max(n, 1)
      pos[id] = {
        x: cx + Math.cos(angle) * R,
        y: cy + Math.sin(angle) * R,
      }
    }
  })

  const repulsion = 520
  const attBase = 0.022
  const margin = 36

  for (let iter = 0; iter < iterations; iter++) {
    const vel: Record<string, Point> = {}
    nodeIds.forEach((id) => {
      vel[id] = { x: 0, y: 0 }
    })

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodeIds[i]!
        const b = nodeIds[j]!
        let dx = pos[b].x - pos[a].x
        let dy = pos[b].y - pos[a].y
        let d = Math.hypot(dx, dy) || 0.01
        const f = repulsion / (d * d)
        dx /= d
        dy /= d
        vel[a].x -= f * dx
        vel[a].y -= f * dy
        vel[b].x += f * dx
        vel[b].y += f * dy
      }
    }

    for (const e of edges) {
      if (!pos[e.source] || !pos[e.target]) continue
      let dx = pos[e.target].x - pos[e.source].x
      let dy = pos[e.target].y - pos[e.source].y
      const d = Math.hypot(dx, dy) || 0.01
      const ideal = 72 + Math.min(e.weight, 6) * 14
      const f = attBase * (d - ideal) * Math.max(1, e.weight)
      dx /= d
      dy /= d
      vel[e.source].x += f * dx
      vel[e.source].y += f * dy
      vel[e.target].x -= f * dx
      vel[e.target].y -= f * dy
    }

    const pull = 0.012
    nodeIds.forEach((id) => {
      vel[id].x += (cx - pos[id].x) * pull
      vel[id].y += (cy - pos[id].y) * pull
      pos[id].x += vel[id].x
      pos[id].y += vel[id].y
      pos[id].x = clamp(pos[id].x, margin, width - margin)
      pos[id].y = clamp(pos[id].y, margin, height - margin)
    })
  }

  const out: Record<string, Point> = {}
  nodeIds.forEach((id) => {
    out[id] = snapToGrid(pos[id]!)
  })
  return out
}
