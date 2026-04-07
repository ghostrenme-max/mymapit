import type { MentionKind } from '../constants/mentionKinds'

/** 연결맵(Snap) 칩 전용 — 사양의 15% / 35% 투명도 */
export const SNAP_CHIP_THEME: Record<
  MentionKind,
  { color: string; bg: string; border: string; bgResult: string; borderResult: string }
> = {
  character: {
    color: '#C4614A',
    bg: 'rgba(196,97,74,0.15)',
    border: 'rgba(196,97,74,0.35)',
    bgResult: 'rgba(196,97,74,0.15)',
    borderResult: 'rgba(196,97,74,0.3)',
  },
  world: {
    color: '#2C4A6E',
    bg: 'rgba(44,74,110,0.15)',
    border: 'rgba(44,74,110,0.35)',
    bgResult: 'rgba(44,74,110,0.15)',
    borderResult: 'rgba(44,74,110,0.3)',
  },
  object: {
    color: '#6B7A3A',
    bg: 'rgba(107,122,58,0.15)',
    border: 'rgba(107,122,58,0.35)',
    bgResult: 'rgba(107,122,58,0.15)',
    borderResult: 'rgba(107,122,58,0.3)',
  },
  place: {
    color: '#4A6B7A',
    bg: 'rgba(74,107,122,0.15)',
    border: 'rgba(74,107,122,0.35)',
    bgResult: 'rgba(74,107,122,0.15)',
    borderResult: 'rgba(74,107,122,0.3)',
  },
  event: {
    color: '#7A2C3A',
    bg: 'rgba(122,44,58,0.15)',
    border: 'rgba(122,44,58,0.35)',
    bgResult: 'rgba(122,44,58,0.15)',
    borderResult: 'rgba(122,44,58,0.3)',
  },
  faction: {
    color: '#5C4A6B',
    bg: 'rgba(92,74,107,0.15)',
    border: 'rgba(92,74,107,0.35)',
    bgResult: 'rgba(92,74,107,0.15)',
    borderResult: 'rgba(92,74,107,0.3)',
  },
  term: {
    color: '#7A6B3A',
    bg: 'rgba(122,107,58,0.15)',
    border: 'rgba(122,107,58,0.35)',
    bgResult: 'rgba(122,107,58,0.15)',
    borderResult: 'rgba(122,107,58,0.3)',
  },
  storyNode: {
    color: '#805AD5',
    bg: 'rgba(128,90,213,0.15)',
    border: 'rgba(128,90,213,0.35)',
    bgResult: 'rgba(128,90,213,0.15)',
    borderResult: 'rgba(128,90,213,0.3)',
  },
}

export function snapChipTheme(kind: MentionKind) {
  return SNAP_CHIP_THEME[kind] ?? SNAP_CHIP_THEME.character
}
