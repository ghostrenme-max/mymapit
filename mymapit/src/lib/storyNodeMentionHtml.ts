import type { StoryNode } from '../stores/types'

function escAttr(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/** 에디터용 서사 노드 멘션 HTML (Act/Scene/Event 색은 CSS data-story-node-type) */
export function buildStoryNodeMentionHtml(
  node: Pick<StoryNode, 'id' | 'title' | 'type'>,
  mentionId: string,
): string {
  const safe = escAttr(node.title)
  const nt = node.type
  return `<span class="ab-mention" contenteditable="false" data-mention-id="${escAttr(mentionId)}" data-kind="storyNode" data-story-node-type="${nt}" data-target-id="${escAttr(node.id)}" data-target-name="${safe}">@${safe}</span>`
}
