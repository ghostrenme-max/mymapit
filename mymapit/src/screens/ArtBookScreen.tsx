import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CharacterTab } from '../components/artbook/CharacterTab'
import { StoryTab } from '../components/artbook/StoryTab'
import { WorldTab } from '../components/artbook/WorldTab'
import { TopBar } from '../components/common/TopBar'
import { SnapMapTab } from '../components/snap/SnapMapTab'
import { syncArtbookFromMemos } from '../lib/syncArtbookFromMemos'
import { useProjectStore } from '../stores/projectStore'
import { useUserStore } from '../stores/userStore'

const tabs = [
  { key: 'world', label: '세계관', color: '#2C4A6E', bg: 'rgba(44,74,110,0.1)' },
  { key: 'character', label: '캐릭터', color: '#C4614A', bg: 'rgba(196,97,74,0.1)' },
  { key: 'story', label: '서사', color: '#7A2C3A', bg: 'rgba(122,44,58,0.1)' },
  { key: 'snap', label: '연결맵', color: '#6B7A3A', bg: 'rgba(107,122,58,0.12)' },
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
  const pid = useProjectStore((s) => s.currentProjectId)

  useEffect(() => {
    if (pid) syncArtbookFromMemos(pid)
  }, [pid])

  useEffect(() => {
    const t = tabFromSearch(searchParams.get('tab'))
    if (t) setTab(t)
  }, [searchParams])

  const selectTab = (key: TabKey) => {
    setTab(key)
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.set('tab', key)
        if (key !== 'story') p.delete('node')
        return p
      },
      { replace: true },
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar title="아트북" onMenu={() => setSidebar(true)} />
      <div className="flex border-b border-ab-border bg-ab-card">
        {tabs.map((t) => {
          const on = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => selectTab(t.key)}
              className={`min-w-0 flex-1 py-2.5 text-center text-[10px] font-medium leading-tight transition-colors sm:text-xs ${
                on ? 'border-b-[3px] font-semibold' : 'border-b-[3px] border-transparent text-ab-sub'
              }`}
              style={
                on
                  ? { borderBottomColor: t.color, color: t.color, backgroundColor: t.bg }
                  : undefined
              }
            >
              {t.label}
            </button>
          )
        })}
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
