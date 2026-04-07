import type { StoryNode } from '../stores/types'

/** 분기에서 선택되지 않은 루트 아래 노드는 메인 스토리에서 흐리게 표시 */
export function nodeIsOnInactiveBranch(target: StoryNode, nodes: StoryNode[]): boolean {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  let cur: StoryNode | undefined = target
  while (cur) {
    const pid = cur.parentId
    if (!pid) break
    const parent = byId.get(pid)
    if (!parent) break
    if (parent.type === 'event' && parent.isBranch && parent.activeBranchId) {
      let chain: StoryNode | undefined = cur
      while (chain && chain.parentId !== parent.id) {
        chain = chain.parentId ? byId.get(chain.parentId) : undefined
      }
      if (chain && chain.parentId === parent.id && chain.id !== parent.activeBranchId) {
        return true
      }
    }
    cur = parent
  }
  return false
}
