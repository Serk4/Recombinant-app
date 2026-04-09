import { useState } from 'react'
import type { TipEntry } from '../utils/calculator'
import { STAT_LABELS } from '../data/modifiers'
import { StackBasicsPanel } from './StackBasicsPanel'

interface TipsPanelProps {
	tips: TipEntry[]
}

export function TipsPanel({ tips }: TipsPanelProps) {
	const [expanded, setExpanded] = useState(false)

	const visible = expanded ? tips : tips.slice(0, 6)

	return (
		<div className='space-y-4'>
			{/* Stack system explainer */}
			<section className='bg-gray-800/30 border border-gray-700/40 rounded-xl p-4'>
				<StackBasicsPanel />
			</section>

			{/* Combination tips */}
			<div>
				<h3 className='text-xs font-bold text-gray-200 mb-1 flex items-center gap-1.5'>
					<span>🏆</span> Best Combinations Guide
				</h3>
				<p className='text-xs text-gray-400 mb-3'>
					Best modifier combinations ranked by total stat value. The order shown
					is the optimal slot sequence — slot order affects the final values.
				</p>

				<div className='space-y-2'>
					{visible.map((tip, i) => (
						<TipCard key={tip.statKey} tip={tip} rank={i + 1} />
					))}
				</div>

				{tips.length > 6 && (
					<button
						onClick={() => setExpanded((e) => !e)}
						className='w-full text-xs text-green-400 hover:text-green-300 py-2 transition-colors'
					>
						{expanded ? '▲ Show less' : `▼ Show ${tips.length - 6} more tips`}
					</button>
				)}
			</div>
		</div>
	)
}

function TipCard({ tip, rank }: { tip: TipEntry; rank: number }) {
	const categoryColors: Record<string, string> = {
		Offense: 'text-red-400',
		Defense: 'text-blue-400',
		Utility: 'text-yellow-400',
		Wildcard: 'text-green-400',
	}

	return (
		<div className='bg-gray-800/40 border border-gray-700/40 rounded-xl p-3 space-y-2'>
			<div className='flex items-start gap-2'>
				<span className='text-xs font-bold text-gray-500 w-5 flex-shrink-0'>
					#{rank}
				</span>
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-1.5 flex-wrap'>
						<span className='text-xs font-semibold text-white'>
							Best {STAT_LABELS[tip.statKey]}
						</span>
						<span className='text-xs font-bold text-green-400'>
							+{tip.totalValue.toFixed(0)}%
						</span>
					</div>
					<div className='flex flex-wrap items-center gap-1 mt-1.5'>
						{tip.modifiers.map((m, idx) => (
							<span key={m.id} className='flex items-center gap-1'>
								{idx > 0 && (
									<span className='text-gray-600 text-[10px]'>→</span>
								)}
								<span
									className={`text-[11px] font-medium ${categoryColors[m.category]}`}
								>
									{m.icon} {m.name}
								</span>
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
