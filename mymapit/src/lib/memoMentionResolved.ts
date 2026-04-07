import type { Character, Keyword, Mention, StoryNode, WorldObject } from '../stores/types'

/** 메모에 남은 @가 아트북에 실제 항목으로 존재하는지 */
export function isMentionResolvedInProject(
  projectId: string,
  mention: Mention,
  characters: Character[],
  worldObjects: WorldObject[],
  keywords: Keyword[],
  storyNodes: StoryNode[],
): boolean {
  switch (mention.kind) {
    case 'character':
      return characters.some((c) => c.id === mention.targetId && c.projectId === projectId)
    case 'event':
      return storyNodes.some(
        (n) => n.id === mention.targetId && n.projectId === projectId && n.type === 'event',
      )
    case 'term':
      return keywords.some((k) => k.id === mention.targetId && k.projectId === projectId)
    case 'world':
    case 'object':
    case 'place':
    case 'faction':
      return worldObjects.some((o) => o.id === mention.targetId && o.projectId === projectId)
    default:
      return false
  }
}
