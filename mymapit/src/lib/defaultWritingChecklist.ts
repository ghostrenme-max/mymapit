import type { MemoWritingCheckItem } from '../stores/types'

function id() {
  return `chk-${crypto.randomUUID()}`
}

/** 집필용 기본 체크 항목 (메모에 한 번에 넣기) */
export function createDefaultWritingChecklist(): MemoWritingCheckItem[] {
  return [
    { id: id(), label: '개요·챕터 구조 확정', done: false },
    { id: id(), label: '1차 초안 완료', done: false },
    { id: id(), label: '@ 연결·아트북 정리', done: false },
    { id: id(), label: '1차 퇴고', done: false },
    { id: id(), label: '맞춤법·호흡 점검', done: false },
  ]
}
