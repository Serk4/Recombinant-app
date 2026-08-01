import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Coordinate, CoordinateType } from '../data/mapMarkers'

interface CoordinateFormProps {
	onSave: (coordinate: Coordinate) => void
	onCancel: () => void
	coordinateType: CoordinateType
	initialCoordinate?: Coordinate
}

export function CoordinateForm({
	onSave,
	onCancel,
	coordinateType,
	initialCoordinate,
}: CoordinateFormProps) {
	const { t } = useTranslation()
	const [x, setX] = useState(initialCoordinate?.x?.toString() || '')
	const [y, setY] = useState(initialCoordinate?.y?.toString() || '')
	const [notes, setNotes] = useState(initialCoordinate?.notes || '')
	const [photoBase64, setPhotoBase64] = useState(initialCoordinate?.photoBase64 || '')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (event) => {
				const base64 = event.target?.result as string
				setPhotoBase64(base64)
			}
			reader.readAsDataURL(file)
		}
	}

	const handleRemovePhoto = () => {
		setPhotoBase64('')
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const xNum = parseFloat(x)
		const yNum = parseFloat(y)

		if (isNaN(xNum) || isNaN(yNum)) {
			alert(t('mapMarker.validation.invalidCoordinates'))
			return
		}

		const coordinate: Coordinate = {
			id: initialCoordinate?.id || `coord_${Date.now()}`,
			x: xNum,
			y: yNum,
			notes: notes.trim() || undefined,
			photoBase64: photoBase64 || undefined,
			createdAt: initialCoordinate?.createdAt || Date.now(),
			updatedAt: Date.now(),
		}

		onSave(coordinate)
	}

	return (
		<form onSubmit={handleSubmit} className='bg-gray-900 border border-gray-700 rounded-2xl p-4 space-y-4'>
			<div className='grid grid-cols-2 gap-3'>
				<div>
					<label className='block text-sm font-semibold text-gray-300 mb-2'>
						{t('mapMarker.form.xCoord')}
					</label>
					<input
						type='number'
						value={x}
						onChange={(e) => setX(e.target.value)}
						placeholder='0.0'
						className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-orange-500'
						step='0.1'
					/>
				</div>
				<div>
					<label className='block text-sm font-semibold text-gray-300 mb-2'>
						{t('mapMarker.form.yCoord')}
					</label>
					<input
						type='number'
						value={y}
						onChange={(e) => setY(e.target.value)}
						placeholder='0.0'
						className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-orange-500'
						step='0.1'
					/>
				</div>
			</div>

			<div>
				<label className='block text-sm font-semibold text-gray-300 mb-2'>
					{t('mapMarker.form.notes')} ({t('mapMarker.form.optional')})
				</label>
				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder={t('mapMarker.form.notesPlaceholder')}
					className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-orange-500 resize-none'
					rows={2}
				/>
			</div>

			<div>
				<label className='block text-sm font-semibold text-gray-300 mb-2'>
					{t('mapMarker.form.photo')} ({t('mapMarker.form.optional')})
				</label>
				{photoBase64 && (
					<div className='mb-3'>
						<img
							src={photoBase64}
							alt='preview'
							className='w-full h-40 object-cover rounded-lg border border-gray-600'
						/>
						<button
							type='button'
							onClick={handleRemovePhoto}
							className='mt-2 w-full px-3 py-1 text-sm bg-red-900/30 hover:bg-red-800/50 text-red-400 border border-red-700/40 rounded-lg transition-colors'
						>
							{t('mapMarker.form.removePhoto')}
						</button>
					</div>
				)}
				<input
					type='file'
					ref={fileInputRef}
					accept='image/*'
					onChange={handlePhotoChange}
					className='w-full text-sm text-gray-400 file:px-3 file:py-2 file:rounded-lg file:bg-gray-700 file:border-0 file:text-sm file:font-medium file:cursor-pointer hover:file:bg-gray-600 transition-colors'
				/>
			</div>

			<div className='flex gap-2 pt-4'>
				<button
					type='submit'
					className='flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors'
				>
					{t('mapMarker.form.save')}
				</button>
				<button
					type='button'
					onClick={onCancel}
					className='flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 text-sm font-semibold rounded-lg transition-colors'
				>
					{t('mapMarker.form.cancel')}
				</button>
			</div>
		</form>
	)
}
