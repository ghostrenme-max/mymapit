import type { StoryNode } from '../stores/types'

/** 신규·동기화 시 공통 기본값 */
export const emptyStoryNodeMeta = (): Pick<
  StoryNode,
  'emotionTag' | 'isBranch' | 'branchLabel' | 'activeBranchId' | 'linkedMemoIds'
> => ({
  emotionTag: null,
  isBranch: false,
  branchLabel: null,
  activeBranchId: null,
  linkedMemoIds: [],
})
