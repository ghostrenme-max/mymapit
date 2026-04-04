import type { StoryNode } from '../../types/models'

const types: { key: 'all' | StoryNode['type']; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'act', label: 'Act' },
  { key: 'scene', label: 'Scene' },
  { key: 'event', label: 'Event' },
  { key: 'character', label: '캐릭터' },
]

type Props = {
  value: 'all' | StoryNode['type']
  onChange: (v: 'all' | StoryNode['type']) => void
}

export function StoryTypeChips({ value, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {types.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            value === t.key
              ? 'bg-m-text text-m-card'
              : 'bg-m-muted text-m-sub'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
