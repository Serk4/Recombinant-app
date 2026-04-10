import { useState } from 'react'
import type { TipEntry } from '../utils/calculator'
import type { Modifier } from '../data/modifiers'
import { STAT_LABELS } from '../data/modifiers'
import type { StatKey } from '../data/modifiers'

interface TipsPanelProps {
	tips: TipEntry[]
	selectedCount: number
	appliedTipKey: string | null
	onApply: (modifiers: Modifier[], key: string) => void
}

type TipCategory = 'All' | 'Offense' | 'Defense' | 'Utility'

const STAT_CATEGORY: Record<StatKey, TipCategory> = {
	weaponHandling: 'Offense',
	headshotDamage: 'Offense',
	magazineSize: 'Offense',
	totalArmor: 'Defense',
	protectionFromElites: 'Defense',
	hazardProtection: 'Defense',
	skillDamage: 'Utility',
	statusEffects: 'Utility',
	skillHaste: 'Utility',
}

const CARD_COLORS: Record<TipCategory, string> = {
	All: 'border-gray-700/40 bg-gray-800/40',
	Offense: 'border-red-500/40 bg-red-900/10',
	Defense: 'border-blue-500/40 bg-blue-900/10',
	Utility: 'border-yellow-500/40 bg-yellow-900/10',
}

const BADGE_COLORS: Record<TipCategory, string> = {
	All: '',
	Offense: 'bg-red-600/20 text-red-300 border border-red-500/30',
	Defense: 'bg-blue-600/20 text-blue-300 border border-blue-500/30',
	Utility: 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30',
}

const FILTER_TABS: TipCategory[] = ['All', 'Offense', 'Defense', 'Utility']

const TAB_COLORS: Record<TipCategory, string> = {
	All: 'from-slate-500 to-slate-600',
	Offense: 'from-red-600 to-orange-600',
	Defense: 'from-blue-600 to-cyan-600',
	Utility: 'from-yellow-500 to-amber-500',
}

const TAB_ACTIVE: Record<TipCategory, string> = {
	All: 'ring-slate-400',
	Offense: 'ring-red-400',
	Defense: 'ring-blue-400',
	Utility: 'ring-yellow-400',
}

export function TipsPanel({
	tips,
	selectedCount,
	appliedTipKey,
	onApply,
}: TipsPanelProps) {
	const [expanded, setExpanded] = useState(false)
	const [activeFilter, setActiveFilter] = useState<TipCategory>('All')

	const filtered =
		activeFilter === 'All'
			? tips
			: tips.filter((t) => STAT_CATEGORY[t.statKey] === activeFilter)

	const visible = expanded ? filtered : filtered.slice(0, 6)

	return (
		<div className='space-y-3'>
			<p className='text-xs text-gray-400'>
				Best modifier combinations ranked by total stat value. The order shown
				is the optimal slot sequence — slot order affects the final values.
			</p>

			{/* Category filter buttons */}
			<div className='flex gap-1.5 overflow-x-auto pb-1 px-0.5 pt-0.5 scrollbar-hide'>
				{FILTER_TABS.map((tab) => (
					<button
						key={tab}
						onClick={() => {
							setActiveFilter(tab)
							setExpanded(false)
						}}
						className={`
							flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
							bg-gradient-to-br ${TAB_COLORS[tab]} text-white
							${activeFilter === tab ? `ring-2 ring-inset ${TAB_ACTIVE[tab]} scale-105` : 'opacity-70 hover:opacity-90'}
						`}
					>
						{tab}
					</button>
				))}
			</div>

			{visible.length === 0 ? (
				<p className='text-xs text-gray-500 text-center py-4'>
					No tips for this category.
				</p>
			) : (
				visible.map((tip, i) => (
					<TipCard
						key={tip.statKey}
						tip={tip}
						rank={i + 1}
						selectedCount={selectedCount}
						applied={appliedTipKey === tip.statKey}
						onApply={(mods) => onApply(mods, tip.statKey)}
					/>
				))
			)}

			{filtered.length > 6 && (
				<button
					onClick={() => setExpanded((e) => !e)}
					className='w-full text-xs text-green-400 hover:text-green-300 py-2 transition-colors'
				>
					{expanded ? '▲ Show less' : `▼ Show ${filtered.length - 6} more tips`}
				</button>
			)}
		</div>
	)
}

function TipCard({
	tip,
	rank,
	selectedCount,
	applied,
	onApply,
}: {
	tip: TipEntry
	rank: number
	applied: boolean
	selectedCount: number
	onApply: (modifiers: Modifier[]) => void
}) {
	const [confirming, setConfirming] = useState(false)

	function handleApplyClick() {
		if (selectedCount > 0) {
			setConfirming(true)
		} else {
			onApply(tip.modifiers)
		}
	}

	function handleConfirm() {
		onApply(tip.modifiers)
		setConfirming(false)
	}

	const categoryColors: Record<string, string> = {
		Offense: 'text-red-400',
		Defense: 'text-blue-400',
		Utility: 'text-yellow-400',
		Wildcard: 'text-green-400',
	}

	const tipCategory = STAT_CATEGORY[tip.statKey]

	return (
		<div
			className={`border rounded-xl px-2.5 py-2 ${CARD_COLORS[tipCategory]}`}
		>
			{/* Header row: rank + stat + badge + value + apply */}
			<div className='flex items-center gap-1.5 flex-wrap'>
				<span className='text-[10px] font-bold text-gray-500'>#{rank}</span>
				<span className='text-[11px] font-semibold text-white'>
					Best {STAT_LABELS[tip.statKey]}
				</span>
				<span
					className={`text-[9px] px-1 py-0.5 rounded font-semibold ${BADGE_COLORS[tipCategory]}`}
				>
					{tipCategory}
				</span>
				<span className='text-[11px] font-bold text-green-400'>
					+{tip.totalValue.toFixed(0)}%
				</span>
				<div className='ml-auto'>
					{applied ? (
						<span className='text-[13px] text-green-400 font-bold'>✓</span>
					) : !confirming ? (
						<button
							onClick={handleApplyClick}
							className='text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors'
						>
							▶ Apply
						</button>
					) : (
						<div className='flex gap-1 items-center'>
							<span className='text-[9px] text-yellow-400'>Replace?</span>
							<button
								onClick={handleConfirm}
								className='text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-700 hover:bg-green-600 text-white transition-colors'
							>
								✓
							</button>
							<button
								onClick={() => setConfirming(false)}
								className='text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors'
							>
								✕
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Modifier chain */}
			<div className='flex flex-wrap items-center gap-1 mt-1'>
				{tip.modifiers.map((m, idx) => (
					<span key={m.id} className='flex items-center gap-1'>
						{idx > 0 && <span className='text-gray-600 text-[10px]'>→</span>}
						<span
							className={`text-[11px] font-medium ${categoryColors[m.category]}`}
						>
							{m.name}
						</span>
					</span>
				))}
			</div>
		</div>
	)
}
