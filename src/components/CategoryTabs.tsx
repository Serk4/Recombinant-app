import type { Category } from '../data/modifiers'

interface CategoryTabsProps {
	active: Category | 'All'
	onChange: (cat: Category | 'All') => void
}

const TABS: (Category | 'All')[] = [
	'All',
	'Offense',
	'Defense',
	'Utility',
	'Wildcard',
]

const TAB_COLORS: Record<string, string> = {
	All: 'from-slate-500 to-slate-600',
	Offense: 'from-red-600 to-orange-600',
	Defense: 'from-blue-600 to-cyan-600',
	Utility: 'from-yellow-500 to-amber-500',
	Wildcard: 'from-green-600 to-emerald-600',
}

const TAB_ACTIVE: Record<string, string> = {
	All: 'ring-slate-400',
	Offense: 'ring-red-400',
	Defense: 'ring-blue-400',
	Utility: 'ring-yellow-400',
	Wildcard: 'ring-green-400',
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
	return (
		<div className='flex gap-1.5 overflow-x-auto pb-1 px-0.5 pt-0.5 scrollbar-hide'>
			{TABS.map((tab) => (
				<button
					key={tab}
					onClick={() => onChange(tab)}
					className={`
            flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
            bg-gradient-to-br ${TAB_COLORS[tab]} text-white
            ${active === tab ? `ring-2 ring-inset ${TAB_ACTIVE[tab]} scale-105` : 'opacity-70 hover:opacity-90'}
          `}
				>
					{tab}
				</button>
			))}
		</div>
	)
}
