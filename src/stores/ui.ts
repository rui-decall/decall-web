import { atom } from 'nanostores'

export type TabKey = 'register' | 'call' | 'calendar'

export const $activeTab = atom<TabKey>('register')

export const setActiveTab = (tab: TabKey) => {
  $activeTab.set(tab)
} 