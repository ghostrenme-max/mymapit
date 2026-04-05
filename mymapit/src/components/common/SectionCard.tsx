import type { ReactNode } from 'react'

type Props = {
  title?: string
  children: ReactNode
  className?: string
}

/** 왼쪽 2px 검정 보더 섹션 카드 */
export function SectionCard({ title, children, className = '' }: Props) {
  return (
    <section
      className={`rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card p-3 shadow-sm ${className}`}
    >
      {title && (
        <h3 className="mb-2 font-title-italic text-base font-semibold text-ab-text">{title}</h3>
      )}
      {children}
    </section>
  )
}
