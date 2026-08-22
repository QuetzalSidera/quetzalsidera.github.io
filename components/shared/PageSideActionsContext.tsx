'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

type PageSideActionsContextValue = {
  activePanel: string | null
  setActivePanel: Dispatch<SetStateAction<string | null>>
}

const PageSideActionsContext = createContext<PageSideActionsContextValue | null>(null)

export function PageSideActionsProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const value = useMemo(() => ({ activePanel, setActivePanel }), [activePanel])

  return (
    <PageSideActionsContext.Provider value={value}>
      {children}
    </PageSideActionsContext.Provider>
  )
}

export function usePageSidePanel(panelId: string) {
  const context = useContext(PageSideActionsContext)
  if (!context) {
    throw new Error('usePageSidePanel must be used inside PageSideActionsProvider')
  }

  const { activePanel, setActivePanel } = context

  return {
    isOpen: activePanel === panelId,
    openPanel: () => setActivePanel(panelId),
    closePanel: () =>
      setActivePanel((current) => (current === panelId ? null : current)),
    togglePanel: () =>
      setActivePanel((current) => (current === panelId ? null : panelId)),
  }
}
