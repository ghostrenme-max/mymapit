/** 서사 노드 감정 온도 태그 (단일 선택) */
export type StoryEmotionTag =
  | 'tension'
  | 'twist'
  | 'climax'
  | 'daily'
  | 'foreshadow'
  | 'conflict'
  | 'resolve'

export const STORY_EMOTION_TAG_ORDER: StoryEmotionTag[] = [
  'tension',
  'twist',
  'climax',
  'daily',
  'foreshadow',
  'conflict',
  'resolve',
]

export const STORY_EMOTION_TAG_META: Record<
  StoryEmotionTag,
  { label: string; color: string; curveHint: number }
> = {
  tension: { label: '긴장', color: '#E53E3E', curveHint: 18 },
  twist: { label: '반전', color: '#805AD5', curveHint: 14 },
  climax: { label: '감정절정', color: '#DD6B20', curveHint: 20 },
  daily: { label: '일상', color: '#38A169', curveHint: 6 },
  foreshadow: { label: '복선', color: '#3182CE', curveHint: 10 },
  conflict: { label: '충돌', color: '#E53E3E', curveHint: 17 },
  resolve: { label: '해소', color: '#2DD4BF', curveHint: 8 },
}

/** 관계 트리거 감정 축 */
export type TriggerEmotion = 'trust' | 'hate' | 'love' | 'fear' | 'admire' | 'neutral'

export const TRIGGER_EMOTION_ORDER: TriggerEmotion[] = [
  'trust',
  'hate',
  'love',
  'fear',
  'admire',
  'neutral',
]

export const TRIGGER_EMOTION_LABEL: Record<TriggerEmotion, string> = {
  trust: '신뢰',
  hate: '증오',
  love: '사랑',
  fear: '두려움',
  admire: '동경',
  neutral: '중립',
}
