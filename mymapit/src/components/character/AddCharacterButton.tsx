import { useCharacterStore } from '../../store/useCharacterStore'

type Props = {
  projectId: string
  onCreated?: (id: string) => void
}

export function AddCharacterButton({ projectId, onCreated }: Props) {
  const addCharacter = useCharacterStore((s) => s.addCharacter)

  return (
    <button
      type="button"
      onClick={() => {
        const c = addCharacter({
          projectId,
          name: '새 캐릭터',
          role: 'support',
          personality: '',
          ability: '',
          likes: '',
          dislikes: '',
          tags: [],
          colors: ['#2563EB'],
          imageUri: null,
          relations: [],
          storyNodeIds: [],
          keywordIds: [],
        })
        onCreated?.(c.id)
      }}
      className="rounded-full bg-m-text px-3 py-1.5 text-xs font-medium text-m-card"
    >
      + 캐릭터
    </button>
  )
}
