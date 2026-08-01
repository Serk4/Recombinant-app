interface PhotoModalProps {
	photoBase64: string
	onClose: () => void
}

export function PhotoModal({ photoBase64, onClose }: PhotoModalProps) {
	return (
		<div
			className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'
			onClick={onClose}
		>
			<div
				className='bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] flex flex-col'
				onClick={(e) => e.stopPropagation()}
			>
				<img
					src={photoBase64}
					alt='full view'
					className='flex-1 object-contain w-full rounded-t-2xl'
				/>
				<button
					onClick={onClose}
					className='px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 text-sm font-semibold rounded-b-2xl transition-colors'
				>
					✕ Close
				</button>
			</div>
		</div>
	)
}
