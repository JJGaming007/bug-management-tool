// src/components/ui/Tabs.tsx
'use client'

import { FC, ReactNode, useState, useRef, useEffect, KeyboardEvent } from 'react'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  children: ReactNode[]   // one pane per tab, in same order
}

export const Tabs: FC<TabsProps> = ({ tabs, children }) => {
  const [active, setActive] = useState(tabs[0].key)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  // Focus the newly active tab when it changes (for click or arrow nav)
  useEffect(() => {
    const idx = tabs.findIndex((t) => t.key === active)
    tabRefs.current[idx]?.focus()
  }, [active, tabs])

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (idx + 1) % tabs.length
      setActive(tabs[next].key)
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (idx - 1 + tabs.length) % tabs.length
      setActive(tabs[prev].key)
    }
  }

  return (
    <div className="w-full">
      {/* Tab list */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex border-b border-[var(--border)] mb-4"
      >
        {tabs.map((tab, idx) => {
          const isSelected = active === tab.key
          return (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.key}`}
              tabIndex={isSelected ? 0 : -1}
              ref={(el) => (tabRefs.current[idx] = el)}
              onClick={() => setActive(tab.key)}
              onKeyDown={(e) => onKeyDown(e, idx)}
              className={`
                px-4 py-2 -mb-px focus:outline-none
                ${
                  isSelected
                    ? 'border-b-2 border-[var(--accent)] text-[var(--text)] font-medium'
                    : 'text-[var(--subtext)] hover:text-[var(--text)]'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      {tabs.map((tab, idx) => {
        if (tab.key !== active) return null
        return (
          <div
            key={tab.key}
            role="tabpanel"
            id={`panel-${tab.key}`}
            aria-labelledby={`tab-${tab.key}`}
          >
            {children[idx]}
          </div>
        )
      })}
    </div>
  )
}
