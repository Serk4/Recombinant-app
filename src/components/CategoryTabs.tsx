import type { Category } from '../data/modifiers'

interface CategoryTabsProps {
  active: Category | 'All'
  onChange: (cat: Category | 'All') => void
}

const TABS: (Category | 'All')[] = ['All', 'Offense', 'Defense', 'Utility']

const TAB_COLORS: Record<string, string> = {
  All: 'from-slate-500 to-slate-600',
  Offense: 'from-red-600 to-orange-600',
  Defense: 'from-blue-600 to-cyan-600',
  Utility: 'from-purple-600 to-violet-600',
}

const TAB_ACTIVE: Record<string, string> = {
  All: 'ring-slate-400',
  Offense: 'ring-red-400',
  Defense: 'ring-blue-400',
  Utility: 'ring-purple-400',
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all
            bg-gradient-to-br ${TAB_COLORS[tab]} text-white
            ${active === tab ? `ring-2 ring-offset-2 ring-offset-gray-900 ${TAB_ACTIVE[tab]} scale-105` : 'opacity-70 hover:opacity-90'}
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
