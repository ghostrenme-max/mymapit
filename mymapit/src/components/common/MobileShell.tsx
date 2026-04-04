import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function MobileShell({ children, className = '' }: Props) {
  return (
    <div
      className={`mx-auto flex min-h-0 w-full max-w-[390px] flex-1 flex-col bg-m-bg ${className}`}
    >
      {children}
    </div>
  )
}
