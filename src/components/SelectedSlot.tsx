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

const BADGE_COLORS: Record<string, string> = {
	Offense: 'bg-red-600/20 text-red-300 border border-red-500/30',
	Defense: 'bg-blue-600/20 text-blue-300 border border-blue-500/30',
	Utility: 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30',
	Wildcard: 'bg-green-600/20 text-green-300 border border-green-500/30',
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
			className={`flex-1 min-w-[80px] rounded-xl border-2 ${SLOT_COLORS[modifier.category]} px-1.5 py-1.5 flex flex-col gap-1`}
		>
			{/* Top row: slot number + remove */}
			<div className='flex items-center justify-between'>
				<span className='w-4 h-4 rounded-full bg-white text-gray-900 text-[10px] font-bold flex items-center justify-center shadow'>
					{index + 1}
				</span>
				<button
					onClick={onRemove}
					className='text-gray-400 hover:text-red-400 transition-colors text-xs leading-none p-0.5'
					title='Remove modifier'
				>
					✕
				</button>
			</div>

			{/* Name + badge */}
			<p className='text-[11px] font-semibold text-white leading-tight text-center'>
				{modifier.name}
			</p>
			<span
				className={`self-center text-[9px] px-1 py-0.5 rounded font-semibold ${BADGE_COLORS[modifier.category]}`}
			>
				{modifier.category}
			</span>

			{/* Reorder buttons */}
			{total > 1 && (
				<div className='flex gap-1 mt-0.5'>
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
		</div>
	)
}
