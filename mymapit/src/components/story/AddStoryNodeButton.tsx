import { useStoryStore } from '../../store/useStoryStore'
import type { StoryNode } from '../../types/models'

type Props = {
  projectId: string
  defaultParentId: string | null
  defaultType?: StoryNode['type']
}

export function AddStoryNodeButton({
  projectId,
  defaultParentId,
  defaultType = 'event',
}: Props) {
  const addNode = useStoryStore((s) => s.addNode)

  return (
    <button
      type="button"
      onClick={() => {
        const title =
          defaultType === 'act'
            ? '새 막'
            : defaultType === 'scene'
              ? '새 씬'
              : defaultType === 'character'
                ? '캐릭터 노드'
                : '새 이벤트'
        addNode({
          projectId,
          type: defaultType,
          title,
          description: '설명을 입력하세요.',
          tension: 5,
          parentId: defaultParentId,
          characterIds: [],
        })
      }}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-m-sub/40 bg-m-muted/50 py-3 text-sm font-medium text-m-sub transition-colors hover:border-m-red/50 hover:text-m-red"
    >
      <span className="text-lg">+</span> 노드 추가
    </button>
  )
}
