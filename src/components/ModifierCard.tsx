import { useTranslation } from 'react-i18next'
import type { Modifier } from '../data/modifiers'
import type { StackChange } from '../data/modifiers'
import { STAT_LABELS } from '../data/modifiers'
import { hasSynergy } from '../utils/calculator'

function StackBadge({ change }: { change: StackChange }) {
	const { t } = useTranslation()
	const color =
		change.category === 'Offense'
			? change.amount > 0
				? 'text-red-300'
				: 'text-red-500'
			: change.category === 'Defense'
				? change.amount > 0
					? 'text-blue-300'
					: 'text-blue-500'
				: change.amount > 0
					? 'text-yellow-300'
					: 'text-yellow-500'
	const prefix = change.amount > 0 ? '+' : ''
	return (
		<span className={`text-[11px] font-medium ${color}`}>
			{prefix}
			{change.amount}{' '}
			{t(`modifierPicker.categories.${change.category.toLowerCase()}`, {
				defaultValue: change.category,
			})}
		</span>
	)
}

interface ModifierCardProps {
	modifier: Modifier
	selected: boolean
	selectedModifiers: Modifier[]
	selectionOrder?: number
	disabled: boolean
	onClick: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
	Offense: 'border-red-500/40 bg-red-900/10',
	Defense: 'border-blue-500/40 bg-blue-900/10',
	Utility: 'border-yellow-500/40 bg-yellow-900/10',
	Wildcard: 'border-green-500/40 bg-green-900/10',
}

const CATEGORY_BADGE: Record<string, string> = {
	Offense: 'bg-red-600/20 text-red-300 border border-red-500/30',
	Defense: 'bg-blue-600/20 text-blue-300 border border-blue-500/30',
	Utility: 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30',
	Wildcard: 'bg-green-600/20 text-green-300 border border-green-500/30',
}

const SELECTED_RING: Record<string, string> = {
	Offense: 'ring-2 ring-inset ring-red-400 bg-red-900/30',
	Defense: 'ring-2 ring-inset ring-blue-400 bg-blue-900/30',
	Utility: 'ring-2 ring-inset ring-yellow-400 bg-yellow-900/30',
	Wildcard: 'ring-2 ring-inset ring-green-400 bg-green-900/30',
}

export function ModifierCard({
	modifier,
	selected,
	selectedModifiers,
	selectionOrder,
	disabled,
	onClick,
}: ModifierCardProps) {
	const { t } = useTranslation()
	const synergy = !selected && hasSynergy(modifier, selectedModifiers)

	return (
		<button
			onClick={onClick}
			disabled={disabled && !selected}
			className={`
        relative w-full text-left rounded-xl p-3 border transition-all duration-200
        ${
					selected
						? SELECTED_RING[modifier.category]
						: disabled
							? 'border-gray-700/30 bg-gray-800/20 opacity-40 cursor-not-allowed'
							: `${CATEGORY_COLORS[modifier.category]} hover:scale-[1.02] hover:brightness-110 cursor-pointer`
				}
        ${synergy && !selected ? 'ring-1 ring-yellow-400/60' : ''}
      `}
		>
			{/* Selection order badge */}
			{selected && selectionOrder !== undefined && (
				<span className='absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-gray-900 text-xs font-bold flex items-center justify-center shadow-lg'>
					{selectionOrder}
				</span>
			)}

			{/* Synergy badge */}
			{synergy && (
				<span className='absolute top-2 right-2 text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold'>
					{t('synergy.badge')}
				</span>
			)}

			<div className='flex items-start gap-2'>
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-2 flex-wrap'>
						<span className='font-semibold text-sm text-white leading-tight'>
							{t(`modifiers.${modifier.id}.name`, {
								defaultValue: modifier.name,
							})}
						</span>
						<span
							className={`text-[10px] px-1.5 py-0.5 rounded ${CATEGORY_BADGE[modifier.category]}`}
						>
							{t(
								`modifierPicker.categories.${modifier.category.toLowerCase()}`,
								{ defaultValue: modifier.category },
							)}
						</span>
					</div>
					<p className='text-xs text-gray-400 mt-1 leading-snug'>
						{t(`modifiers.${modifier.id}.description`, {
							defaultValue: modifier.description,
						})}
					</p>

					{/* Stack changes */}
					{modifier.stackChanges.length > 0 && (
						<div className='flex flex-wrap gap-x-2 gap-y-0.5 mt-2'>
							{modifier.stackChanges.map((sc, i) => (
								<StackBadge key={i} change={sc} />
							))}
						</div>
					)}

					{/* Effect description */}
					<p className='text-[10px] text-gray-500 mt-1 leading-snug italic'>
						{t(`modifiers.${modifier.id}.effectDescription`, {
							defaultValue: modifier.effectDescription,
						})}
					</p>

					{/* Stat previews (non-empty only) */}
					{modifier.stats.length > 0 && (
						<div className='flex flex-wrap gap-1 mt-2'>
							{modifier.stats.map((s) => (
								<span
									key={s.stat}
									className='text-[11px] bg-gray-700/60 text-gray-300 px-1.5 py-0.5 rounded'
								>
									+{s.baseValue}%{' '}
									{t(`statLabels.${s.stat}`, {
										defaultValue: STAT_LABELS[s.stat],
									})}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</button>
	)
}
