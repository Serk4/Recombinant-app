import type { Modifier } from '../data/modifiers'

interface SelectedSlotProps {
	index: number
	modifier: Modifier | null
	onRemove: () => void
	onMoveUp: () => void
	onMoveDown: () => void
	isFirst: boolean
	isLast: boolean
	total: number
}

const SLOT_COLORS: Record<string, string> = {
	Offense: 'border-red-500/60 bg-red-900/20',
	Defense: 'border-blue-500/60 bg-blue-900/20',
	Utility: 'border-yellow-500/60 bg-yellow-900/20',
	Wildcard: 'border-green-500/60 bg-green-900/20',
}

export function SelectedSlot({
	index,
	modifier,
	onRemove,
	onMoveUp,
	onMoveDown,
	isFirst,
	isLast,
	total,
}: SelectedSlotProps) {
	if (!modifier) {
		return (
			<div className='flex-1 min-w-[90px] rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/20 flex flex-col items-center justify-center gap-1 py-4 px-2'>
				<span className='text-2xl opacity-30'>➕</span>
				<span className='text-xs text-gray-500'>Slot {index + 1}</span>
			</div>
		)
	}

	return (
		<div
			className={`flex-1 min-w-[90px] rounded-xl border-2 ${SLOT_COLORS[modifier.category]} p-2 flex flex-col gap-1.5`}
		>
			<div className='flex items-center justify-between gap-1'>
				<span className='text-xl'>{modifier.icon}</span>
				<button
					onClick={onRemove}
					className='text-gray-400 hover:text-red-400 transition-colors text-sm leading-none p-0.5'
					title='Remove modifier'
				>
					✕
				</button>
			</div>

			<p className='text-xs font-semibold text-white leading-tight line-clamp-2'>
				{modifier.name}
			</p>

			{/* Reorder buttons */}
			{total > 1 && (
				<div className='flex gap-1'>
					<button
						onClick={onMoveUp}
						disabled={isFirst}
						className='flex-1 text-[10px] py-0.5 rounded bg-gray-700 disabled:opacity-30 hover:bg-gray-600 transition-colors'
						title='Move left'
					>
						◀
					</button>
					<button
						onClick={onMoveDown}
						disabled={isLast}
						className='flex-1 text-[10px] py-0.5 rounded bg-gray-700 disabled:opacity-30 hover:bg-gray-600 transition-colors'
						title='Move right'
					>
						▶
					</button>
				</div>
			)}

			<span className='text-[9px] text-gray-500 text-center'>#{index + 1}</span>
		</div>
	)
}
