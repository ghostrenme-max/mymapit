type Props = { message?: string }

export function AiAnalyzingOverlay({ message = 'AI가 텍스트를 분석하고 있어요…' }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-ab-card/75">
      <div className="flex flex-col items-center gap-3 rounded-sm border border-ab-border bg-ab-card px-5 py-4 shadow-md">
        <div
          className="h-10 w-10 animate-ab-spin rounded-full border-2 border-ab-muted border-t-ab-text"
          aria-hidden
        />
        <p className="text-center text-xs font-medium text-ab-text">{message}</p>
      </div>
    </div>
  )
}
