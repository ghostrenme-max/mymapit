import { useRef } from 'react'
import { ArtFrame } from './ArtFrame'

const MAX_FILE_MB = 6

type Props = {
  imageUri: string | null | undefined
  onImageChange: (uri: string | null) => void
  emptyHint: string
  pickLabel?: string
}

export function ConceptArtSlot({
  imageUri,
  onImageChange,
  emptyHint,
  pickLabel = '컨셉 아트 넣기',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uri = imageUri ?? null

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) {
      window.alert('이미지 파일만 선택할 수 있어요.')
      return
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      window.alert(`이미지는 ${MAX_FILE_MB}MB 이하로 선택해 주세요.`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const data = typeof reader.result === 'string' ? reader.result : null
      if (data) onImageChange(data)
    }
    reader.readAsDataURL(f)
  }

  return (
    <ArtFrame contentClassName={uri ? 'p-0' : 'p-4 pt-6'}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {uri ? (
        <div className="relative">
          <img
            src={uri}
            alt=""
            className="max-h-[min(240px,50vh)] w-full object-contain object-center bg-ab-muted/40"
          />
          <div className="flex flex-wrap gap-2 border-t border-ab-border bg-ab-card/95 px-3 py-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md border border-ab-border bg-ab-muted/50 px-3 py-1.5 text-[11px] font-medium text-ab-text active:bg-ab-muted"
            >
              바꾸기
            </button>
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="rounded-md border border-ab-border px-3 py-1.5 text-[11px] text-ab-sub active:bg-ab-muted/50"
            >
              삭제
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[148px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-ab-border bg-ab-input/60 py-4">
          <p className="max-w-[240px] text-center text-[11px] leading-snug text-ab-sub">{emptyHint}</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-ab-border border-l-2 border-l-ab-text bg-ab-card px-4 py-2 text-xs font-semibold text-ab-text shadow-sm active:bg-ab-muted/40"
          >
            {pickLabel}
          </button>
        </div>
      )}
    </ArtFrame>
  )
}
