import type { StoryNode } from '../stores/types'

export const STORY_METRIC_MIN = 1
export const STORY_METRIC_MAX = 20

export function clampStoryMetric(v: number): number {
  if (!Number.isFinite(v)) return 10
  return Math.min(STORY_METRIC_MAX, Math.max(STORY_METRIC_MIN, Math.round(v)))
}

/** 표시·곡선용 긴장 (1~20) */
export function effectiveTension(n: Pick<StoryNode, 'tension'>): number {
  return clampStoryMetric(n.tension)
}

/** 이완: 미저장 시 기본 10 */
export function effectiveRelaxation(n: Pick<StoryNode, 'relaxation'>): number {
  if (n.relaxation != null) return clampStoryMetric(n.relaxation)
  return 10
}
