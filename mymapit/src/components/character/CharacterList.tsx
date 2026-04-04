import { characterEmoji, ROLE_LABEL } from '../../store/useCharacterStore'
import type { Character } from '../../types/models'

type Props = {
  characters: Character[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function CharacterList({ characters, selectedId, onSelect }: Props) {
  return (
    <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {characters.map((c) => (
        <li key={c.id} className="shrink-0">
          <button
            type="button"
            onClick={() => onSelect(c.id)}
            className={`flex w-[100px] flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-colors ${
              selectedId === c.id
                ? 'border-m-red bg-m-red/10'
                : 'border-m-muted bg-m-card'
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {characterEmoji(c)}
            </span>
            <span className="line-clamp-2 text-xs font-semibold text-m-text">{c.name}</span>
            <span className="rounded-full bg-m-muted px-2 py-0.5 text-[10px] text-m-sub">
              {ROLE_LABEL[c.role]}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
