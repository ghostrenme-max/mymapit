import type { QuestionAnswers } from '../stores/types'

export type QuestionKey = keyof QuestionAnswers

/** 마지막 항목: 질문 화면에서 입력 필드와 연동 */
export const GENRE_CUSTOM_LABEL = '직접 입력'

export const GENRE_OPTIONS: string[] = [
  '판타지',
  'SF / 사이버펑크',
  '현대 도시',
  '호러 / 공포',
  '무협 / 무사',
  '로맨스',
  '미스터리 · 추리',
  '일상 · 힐링',
  '스포츠 · 경쟁',
  '역사 · 시대극',
  '포스트 아포칼립스',
  '스팀펑크 · 디젤펑크',
  '코미디 · 시트콤',
  'SF 우주 오페라',
  '다크 판타지',
  '슬라이스 오브 라이프',
  '장르 혼합',
  GENRE_CUSTOM_LABEL,
]

export const MOOD_OPTIONS: string[] = [
  '다크 · 절망',
  '밝음 · 희망',
  '중립 · 회색지대',
  '몽환 · 신비',
  '서늘 · 불안',
  '따뜻 · 포근',
  '서정 · 감성',
  '웅장 · 서사',
  '거칠 · 리얼',
  '코믹 · 가벼움',
  '불협 · 아이러니',
  '고독 · 정적',
  '낭만 · 설렘',
  '긴장 · 스릴',
  '압도 · 숭고',
  '복합 · 입체',
]

export const PROTAGONIST_OPTIONS: string[] = [
  '정통 영웅',
  '안티히어로',
  '빌런 주인공',
  '군상극',
  '평범한 사람 (에브리맨)',
  '성장형 초심자',
  '멘토 · 현자형',
  '트릭스터 · 장난꾸러기',
  '냉정 · 분석형',
  '열정 · 이상주의자',
  '복수자',
  '생존자',
  '관찰자 · 서술 중심',
  '입장 모호 · 이중성',
  '로맨스 주도형',
  '약자 · 역전 성장',
  '코미디 릴리프',
  '집단 대표 (캡틴/리더)',
]

export const THEME_OPTIONS: string[] = [
  '복수 · 증오',
  '성장 · 각성',
  '사랑 · 비극',
  '생존 · 전쟁',
  '진실 · 비밀',
  '신뢰 · 배신',
  '가족 · 유대',
  '정체성 · 소속',
  '자유 · 속박',
  '권력 · 부패',
  '희생 · 구원',
  '운명 · 선택',
  '기억 · 망각',
  '시간 · 순환',
  '생명 · 죽음',
  '기술 · 인간성',
  '자연 · 문명',
  '꿈 · 현실',
  '예술 · 창작',
  '계급 · 불평등',
  '전통 · 변혁',
  '신화 · 민담',
]

/** 거시(거대) 스케일은 뒤쪽, 앞은 미시(좁은 무대) 위주 */
export const SCALE_OPTIONS: string[] = [
  '한 사람 · 내면 / 기억 한 조각',
  '단일 방 · 하룻밤 · 밀실',
  '가정 · 가구 · 가족 단위',
  '아파트 한 동 · 같은 층 / 계단',
  '건물 한 채 · 단일 매장',
  '골목 · 블록 · 동네 반경',
  '마을 · 소규모 공동체',
  '학교 / 직장 등 단일 기관',
  '단일 도시',
  '국가 / 왕국',
  '대륙 / 다중 세계',
  '우주 / 차원',
]

export const QUESTION_STEPS: {
  key: QuestionKey
  title: string
  options: string[]
}[] = [
  {
    key: 'genre',
    title: '어떤 장르의 세계를 펼칠까요?',
    options: GENRE_OPTIONS,
  },
  {
    key: 'mood',
    title: '전체 분위기는 어떤가요?',
    options: MOOD_OPTIONS,
  },
  {
    key: 'protagonist',
    title: '주인공의 성격 축은?',
    options: PROTAGONIST_OPTIONS,
  },
  {
    key: 'theme',
    title: '핵심 테마를 골라주세요',
    options: THEME_OPTIONS,
  },
  {
    key: 'scale',
    title: '이야기의 규모는?',
    options: SCALE_OPTIONS,
  },
]
