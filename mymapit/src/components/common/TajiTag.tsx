type Variant = 'black' | 'gray' | 'mid'

const styles: Record<Variant, string> = {
  black: 'border-ab-text bg-ab-text text-ab-card',
  gray: 'border-ab-border bg-ab-muted text-ab-text',
  mid: 'border-ab-sub bg-ab-card text-ab-sub',
}

type Props = {
  children: React.ReactNode
  variant?: Variant
}

/** 띠지 태그: padding 3px 10px, radius 2px */
export function TajiTag({ children, variant = 'gray' }: Props) {
  return (
    <span
      className={`inline-block rounded-[2px] border px-[10px] py-[3px] text-[11px] font-medium leading-tight ${styles[variant]}`}
    >
      {children}
    </span>
  )
}
