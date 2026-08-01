import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Coordinate } from '../data/mapMarkers'
import { PhotoModal } from './PhotoModal'

interface CoordinateListProps {
	coordinates: Coordinate[]
	onEdit: (coordinate: Coordinate) => void
	onDelete: (id: string) => void
}

export function CoordinateList({ coordinates, onEdit, onDelete }: CoordinateListProps) {
	const { t } = useTranslation()
	const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

	if (coordinates.length === 0) {
		return (
			<div className='text-center py-8 text-gray-400'>
				<p className='text-sm'>{t('mapMarker.coordinateList.empty')}</p>
			</div>
		)
	}

	return (
		<>
			<div className='space-y-2 max-h-96 overflow-y-auto'>
				{coordinates.map((coord) => (
					<div
						key={coord.id}
						className='bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center gap-3'
					>
						<div className='flex-1 min-w-0'>
							<div className='flex items-center gap-2 flex-wrap'>
								<span className='text-xs text-gray-400'>
									({coord.x.toFixed(1)}, {coord.y.toFixed(1)})
								</span>
							</div>
							{coord.notes && (
								<p className='text-xs text-gray-300 mt-1 truncate'>
									{coord.notes}
								</p>
							)}
						</div>

						<div className='flex items-center gap-2 flex-shrink-0'>
							{coord.photoBase64 && (
								<button
									onClick={() => setSelectedPhoto(coord.photoBase64 ?? null)}
									className='px-2.5 py-1 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 hover:text-blue-300 text-xs font-semibold rounded border border-blue-700/40 transition-colors'
									title={t('mapMarker.coordinateList.viewPhoto')}
								>
									📷
								</button>
							)}
							<button
								onClick={() => onEdit(coord)}
								className='px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs font-semibold rounded transition-colors'
								title={t('mapMarker.coordinateList.edit')}
							>
								✎
							</button>
							<button
								onClick={() => onDelete(coord.id)}
								className='px-2.5 py-1 bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 text-xs font-semibold rounded border border-red-700/40 transition-colors'
								title={t('mapMarker.coordinateList.delete')}
							>
								✕
							</button>
						</div>
					</div>
				))}
			</div>

			{selectedPhoto && (
				<PhotoModal
					photoBase64={selectedPhoto}
					onClose={() => setSelectedPhoto(null)}
				/>
			)}
		</>
	)
}
