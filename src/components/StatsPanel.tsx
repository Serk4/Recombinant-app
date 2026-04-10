import type { StatResult, SimCat } from '../utils/calculator'
import { STAT_LABELS } from '../data/modifiers'
import type { StatKey } from '../data/modifiers'

interface StatsPanelProps {
	stats: StatResult[]
}

const STAT_ICONS: Record<StatKey, string> = {
	weaponHandling: '🔫',
	headshotDamage: '🎯',
	magazineSize: '🔋',
	totalArmor: '🛡️',
	protectionFromElites: '⭐',
	hazardProtection: '☢️',
	skillDamage: '🔮',
	statusEffects: '🔥',
	skillHaste: '⚡',
}

const CATEGORY_HEADER: Record<
	SimCat,
	{ color: string; border: string; icon: string }
> = {
	Offense: { color: 'text-red-400', border: 'border-red-500/30', icon: '⚔️' },
	Defense: { color: 'text-blue-400', border: 'border-blue-500/30', icon: '🛡️' },
	Utility: {
		color: 'text-yellow-400',
		border: 'border-yellow-500/30',
		icon: '🔧',
	},
}

const CATEGORY_BAR: Record<SimCat, string> = {
	Offense: 'from-red-400 to-red-700',
	Defense: 'from-blue-400 to-blue-700',
	Utility: 'from-yellow-300 to-amber-600',
}

export function StatsPanel({ stats }: StatsPanelProps) {
	if (stats.length === 0) {
		return (
			<div className='text-center text-gray-500 py-8 text-sm'>
				<span className='text-3xl block mb-2'>📊</span>
				Select up to 3 modifiers to see combined stats
			</div>
		)
	}

	const maxVal = Math.max(...stats.map((s) => s.total), 1)

	return (
		<div className='space-y-4'>
			{/* Baseline disclaimer */}
			<p className='text-[10px] text-gray-500 italic border border-gray-700/40 rounded-lg px-2.5 py-1.5'>
				⚠️ Calculations assume{' '}
				<span className='text-gray-400 font-semibold'>20 base stacks</span> per
				module (fully upgraded). Results will differ with lower-tier modules.
			</p>

			{stats.map(({ category, stat, total, finalStacks, contributors }) => {
				const hdr = CATEGORY_HEADER[category]
				const isZero = total <= 0
				return (
					<div
						key={category}
						className={`border-l-2 pl-3 ${hdr.border} ${isZero ? 'opacity-50' : ''}`}
					>
						{/* Category header */}
						<div
							className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center justify-between ${hdr.color}`}
						>
							<span className='flex items-center gap-1'>
								<span>{hdr.icon}</span>
								<span>{category}</span>
							</span>
							<span className='font-normal normal-case tracking-normal text-gray-400'>
								{finalStacks} stacks
							</span>
						</div>

						{/* Stat row */}
						<div className='space-y-1'>
							<div className='flex items-center justify-between text-xs'>
								<span className='flex items-center gap-1.5 text-gray-300'>
									<span>{STAT_ICONS[stat]}</span>
									<span className='font-medium'>{STAT_LABELS[stat]}</span>
								</span>
								<span
									className={`font-bold ${isZero ? 'text-gray-500' : 'text-white'}`}
								>
									+{total.toFixed(0)}%
								</span>
							</div>

							{/* Progress bar */}
							<div className='h-2 bg-gray-700 rounded-full overflow-hidden'>
								<div
									className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_BAR[category]} transition-all duration-500`}
									style={{ width: `${Math.min((total / maxVal) * 100, 100)}%` }}
								/>
							</div>

							<p className='text-[10px] text-gray-500'>
								{contributors.join(', ')}
							</p>
						</div>
					</div>
				)
			})}
		</div>
	)
}
