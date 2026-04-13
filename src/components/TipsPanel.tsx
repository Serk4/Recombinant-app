import { useState } from 'react'
import type { TipEntry } from '../utils/calculator'
import type { Modifier } from '../data/modifiers'
import { STAT_LABELS } from '../data/modifiers'
import type { StatKey } from '../data/modifiers'

interface TipsPanelProps {
	tips: TipEntry[]
	selectedCount: number
	appliedTip: { statKey: string; comboIndex: number } | null
	onApply: (modifiers: Modifier[], statKey: string, comboIndex: number) => void
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
	skillRepair: 'Utility',
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
	appliedTip,
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
						appliedComboIndex={
							appliedTip?.statKey === tip.statKey
								? appliedTip.comboIndex
								: null
						}
						onApply={(mods, comboIndex) =>
							onApply(mods, tip.statKey, comboIndex)
						}
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
	appliedComboIndex,
	onApply,
}: {
	tip: TipEntry
	rank: number
	appliedComboIndex: number | null
	selectedCount: number
	onApply: (modifiers: Modifier[], comboIndex: number) => void
}) {
	const [confirming, setConfirming] = useState<number | null>(null)

	function handleApplyClick(comboIndex: number) {
		if (selectedCount > 0) {
			setConfirming(comboIndex)
		} else {
			onApply(tip.allCombos[comboIndex], comboIndex)
		}
	}

	function handleConfirm(comboIndex: number) {
		onApply(tip.allCombos[comboIndex], comboIndex)
		setConfirming(null)
	}

	const categoryColors: Record<string, string> = {
		Offense: 'text-red-400',
		Defense: 'text-blue-400',
		Utility: 'text-yellow-400',
		Wildcard: 'text-green-400',
	}

	const tipCategory = STAT_CATEGORY[tip.statKey]
	const displayValue = Number.isInteger(tip.totalValue)
		? tip.totalValue.toFixed(0)
		: tip.totalValue.toFixed(1)
	const combos = tip.allCombos

	return (
		<div
			className={`border rounded-xl px-4 py-3 ${CARD_COLORS[tipCategory]}`}
		>
			{/* Header row: rank + stat + badge + value + applied check */}
			<div className='flex items-center gap-2 flex-wrap'>
				<span className='text-xs font-bold text-gray-500'>#{rank}</span>
				<span className='text-sm font-semibold text-white'>
					Best {STAT_LABELS[tip.statKey]}
				</span>
				<span
					className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${BADGE_COLORS[tipCategory]}`}
				>
					{tipCategory}
				</span>
				<span className='text-sm font-bold text-green-400'>
					+{displayValue}%
				</span>
				{appliedComboIndex !== null && (
					<span className='ml-auto flex items-center justify-center w-7 h-7 rounded-full bg-green-700/40 text-green-400 text-sm font-bold'>
						✓
					</span>
				)}
			</div>

			{/* Combo rows — one per tied best combination */}
			<div className='mt-2 space-y-2'>
				{combos.map((combo, comboIdx) => {
					const isApplied = appliedComboIndex === comboIdx
					return (
						<div
							key={comboIdx}
							className='flex items-center justify-between gap-3'
						>
							<div className='flex flex-wrap items-center gap-1.5'>
								{combo.map((m, idx) => (
									<span key={m.id} className='flex items-center gap-1'>
										{idx > 0 && (
											<span className='text-gray-600 text-xs'>→</span>
										)}
										<span
											className={`text-xs font-medium ${categoryColors[m.category]}`}
										>
											{m.name}
										</span>
									</span>
								))}
							</div>

							<div className='flex-shrink-0 flex items-center gap-1.5'>
								{isApplied ? (
									<span className='flex items-center justify-center w-9 h-9 rounded-full bg-green-700/40 text-green-400 text-base font-bold'>
										✓
									</span>
								) : confirming !== comboIdx ? (
									<button
										onClick={() => handleApplyClick(comboIdx)}
										aria-label='Apply tip'
										className='flex items-center justify-center w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold leading-none transition-all hover:scale-110 active:scale-95'
									>
										+
									</button>
								) : (
									<>
										<span className='text-[10px] text-yellow-400 whitespace-nowrap'>
											Replace?
										</span>
										<button
											onClick={() => handleConfirm(comboIdx)}
											aria-label='Confirm apply'
											className='flex items-center justify-center w-8 h-8 rounded-full bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-colors'
										>
											✓
										</button>
										<button
											onClick={() => setConfirming(null)}
											aria-label='Cancel apply'
											className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 text-white text-sm font-bold transition-colors'
										>
											✕
										</button>
									</>
								)}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
