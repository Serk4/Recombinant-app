import { useState, useMemo } from 'react'
import type { TipEntry } from '../utils/calculator'
import { rankModifiersByVersatility } from '../utils/calculator'
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

const STAT_SHORT: Record<StatKey, string> = {
	weaponHandling: 'WH',
	headshotDamage: 'HS Dmg',
	magazineSize: 'Mag',
	totalArmor: 'Armor',
	protectionFromElites: 'PFE',
	hazardProtection: 'Hazard',
	skillDamage: 'Skill Dmg',
	statusEffects: 'Status',
	skillRepair: 'Repair',
}

export function TipsPanel({
	tips,
	selectedCount,
	appliedTip,
	onApply,
}: TipsPanelProps) {
	const [expanded, setExpanded] = useState(false)
	const [activeFilter, setActiveFilter] = useState<TipCategory>('All')

	const priorityList = useMemo(() => rankModifiersByVersatility(tips), [tips])

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

			{/* Priority purchase ranking */}
			<PriorityRankCard priorityList={priorityList} />
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

// ─── Priority Purchase Ranking Card ─────────────────────────────────────────

import type { ModifierPriorityEntry } from '../utils/calculator'

const CAT_BADGE: Record<string, string> = {
	Offense: 'bg-red-600/20 text-red-300 border border-red-500/30',
	Defense: 'bg-blue-600/20 text-blue-300 border border-blue-500/30',
	Utility: 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30',
	Wildcard: 'bg-green-600/20 text-green-300 border border-green-500/30',
}

const COVERAGE_COLOR = [
	'text-gray-500',   // 0
	'text-gray-400',   // 1
	'text-blue-400',   // 2
	'text-yellow-400', // 3
	'text-orange-400', // 4
	'text-red-400',    // 5
	'text-red-300',    // 6
	'text-pink-400',   // 7
	'text-fuchsia-400',// 8
	'text-violet-400', // 9
]

function PriorityRankCard({
	priorityList,
}: {
	priorityList: ModifierPriorityEntry[]
}) {
	const [showAll, setShowAll] = useState(false)
	const visible = showAll ? priorityList : priorityList.slice(0, 10)

	return (
		<div className='border border-emerald-700/40 bg-emerald-900/10 rounded-xl px-4 py-3 space-y-3'>
			{/* Header */}
			<div>
				<h3 className='text-sm font-bold text-white flex items-center gap-1.5'>
					<span>🛒</span> Priority Purchase Ranking
				</h3>
				<p className='text-[11px] text-gray-400 mt-0.5'>
					Modifiers ranked by multi-purpose versatility — covers the most stat
					categories. Buy these first for the best bang per in-game currency.
				</p>
			</div>

			{/* Column header */}
			<div className='grid grid-cols-[1.5rem_1fr_auto] gap-x-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-1'>
				<span>#</span>
				<span>Modifier</span>
				<span>Covers</span>
			</div>

			{/* Rows */}
			<div className='space-y-1.5'>
				{visible.map((entry, idx) => {
					const coverageCount = entry.statsCovered.length
					const colorClass =
						COVERAGE_COLOR[Math.min(coverageCount, COVERAGE_COLOR.length - 1)]
					return (
						<div
							key={entry.modifier.id}
							className='grid grid-cols-[1.5rem_1fr_auto] gap-x-2 items-start rounded-lg px-1 py-1 hover:bg-white/5 transition-colors'
						>
							{/* Rank */}
							<span className='text-xs font-bold text-gray-500 pt-0.5'>
								{idx + 1}
							</span>

							{/* Name + category */}
							<div className='min-w-0'>
								<div className='flex items-center gap-1.5 flex-wrap'>
									<span className='text-[11px]'>{entry.modifier.icon}</span>
									<span className='text-xs font-semibold text-white'>
										{entry.modifier.name}
									</span>
									<span
										className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${CAT_BADGE[entry.modifier.category] ?? ''}`}
									>
										{entry.modifier.category}
									</span>
								</div>
								{/* Stat chips */}
								<div className='flex flex-wrap gap-1 mt-1'>
									{entry.statsCovered.map((sk) => (
										<span
											key={sk}
											className='text-[9px] px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-300'
										>
											{STAT_SHORT[sk]}
										</span>
									))}
								</div>
							</div>

							{/* Coverage badge */}
							<div className='flex flex-col items-center pt-0.5'>
								<span className={`text-base font-black leading-none ${colorClass}`}>
									{coverageCount}
								</span>
								<span className='text-[8px] text-gray-600 leading-none mt-0.5'>
									stats
								</span>
							</div>
						</div>
					)
				})}
			</div>

			{priorityList.length > 10 && (
				<button
					onClick={() => setShowAll((v) => !v)}
					className='w-full text-xs text-emerald-400 hover:text-emerald-300 py-1 transition-colors'
				>
					{showAll
						? '▲ Show top 10 only'
						: `▼ Show all ${priorityList.length} ranked modifiers`}
				</button>
			)}
		</div>
	)
}
