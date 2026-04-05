import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CharacterTab } from '../components/artbook/CharacterTab'
import { StoryTab } from '../components/artbook/StoryTab'
import { WorldTab } from '../components/artbook/WorldTab'
import { TopBar } from '../components/common/TopBar'
import { SnapMapTab } from '../components/snap/SnapMapTab'
import { useUserStore } from '../stores/userStore'

const tabs = [
  { key: 'world', label: '세계관' },
  { key: 'character', label: '캐릭터' },
  { key: 'story', label: '서사' },
  { key: 'snap', label: '연결맵' },
] as const

type TabKey = (typeof tabs)[number]['key']

const TAB_KEYS = new Set<TabKey>(tabs.map((t) => t.key))

function tabFromSearch(raw: string | null): TabKey | null {
  if (raw && TAB_KEYS.has(raw as TabKey)) return raw as TabKey
  return null
}

export function ArtBookScreen() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<TabKey>(() => tabFromSearch(searchParams.get('tab')) ?? 'world')
  const setSidebar = useUserStore((s) => s.setSidebarOpen)

  useEffect(() => {
    const t = tabFromSearch(searchParams.get('tab'))
    if (t) setTab(t)
  }, [searchParams])

  const selectTab = (key: TabKey) => {
    setTab(key)
    setSearchParams({ tab: key }, { replace: true })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar title="아트북" onMenu={() => setSidebar(true)} />
      <div className="flex border-b border-ab-border bg-ab-card">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectTab(t.key)}
            className={`min-w-0 flex-1 py-2.5 text-center text-[10px] font-medium leading-tight sm:text-xs ${
              tab === t.key ? 'border-b-2 border-ab-text text-ab-text' : 'text-ab-sub'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'world' && <WorldTab />}
        {tab === 'character' && <CharacterTab />}
        {tab === 'story' && <StoryTab />}
        {tab === 'snap' && <SnapMapTab />}
      </div>
    </div>
  )
}
