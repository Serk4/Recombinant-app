import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Coordinate, CoordinateSet, MapName, CoordinateType } from '../data/mapMarkers'
import { MAPS, COORDINATE_TYPES } from '../data/mapMarkers'
import { useMapMarkerStorage } from '../utils/useMapMarkerStorage'
import { CoordinateForm } from './CoordinateForm'
import { CoordinateList } from './CoordinateList'

export function MapMarkerTab() {
	const { t } = useTranslation()
	const { coordinateSets, saveCoordinateSet, deleteCoordinateSet, getNextSetName } =
		useMapMarkerStorage()

	const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
	const [showNewSetForm, setShowNewSetForm] = useState(false)
	const [newSetName, setNewSetName] = useState('')
	const [newSetMap, setNewSetMap] = useState<MapName>('DC')
	const [newSetCoordinateType, setNewSetCoordinateType] = useState<CoordinateType>('menu')
	const [editingCoordinate, setEditingCoordinate] = useState<Coordinate | null>(null)
	const [showCoordForm, setShowCoordForm] = useState(false)
	const [editingSetName, setEditingSetName] = useState<string | null>(null)
	const [editingSetNameValue, setEditingSetNameValue] = useState('')

	const selectedSet = coordinateSets.find((s) => s.id === selectedSetId)

	const getTypeShortLabel = (type: CoordinateType) => {
		return type === 'menu' ? 'Menu Tab' : 'Map Tab'
	}

	const handleCreateSet = (e: React.FormEvent) => {
		e.preventDefault()
		if (!newSetName.trim()) {
			alert(t('mapMarker.validation.setNameRequired'))
			return
		}

		const newSet: CoordinateSet = {
			id: `set_${Date.now()}`,
			name: newSetName.trim(),
			map: newSetMap,
			coordinateType: newSetCoordinateType,
			coordinates: [],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		}

		saveCoordinateSet(newSet)
		setSelectedSetId(newSet.id)
		setNewSetName('')
		setNewSetMap('DC')
		setNewSetCoordinateType('menu')
		setShowNewSetForm(false)
	}

	const handleSaveCoordinate = (coordinate: Coordinate) => {
		if (!selectedSet) return

		const updated: CoordinateSet = {
			...selectedSet,
			coordinates: editingCoordinate
				? selectedSet.coordinates.map((c) =>
						c.id === editingCoordinate.id ? coordinate : c
					)
				: [...selectedSet.coordinates, coordinate],
			updatedAt: Date.now(),
		}

		saveCoordinateSet(updated)
		setEditingCoordinate(null)
		setShowCoordForm(false)
	}

	const handleDeleteCoordinate = (coordId: string) => {
		if (!selectedSet) return

		const updated: CoordinateSet = {
			...selectedSet,
			coordinates: selectedSet.coordinates.filter((c) => c.id !== coordId),
			updatedAt: Date.now(),
		}

		saveCoordinateSet(updated)
	}

	const handleDeleteSet = (id: string) => {
		if (confirm(t('mapMarker.confirmation.deleteSet'))) {
			deleteCoordinateSet(id)
			if (selectedSetId === id) {
				setSelectedSetId(null)
			}
		}
	}

	const handleRenameSet = (setId: string, newName: string) => {
		const set = coordinateSets.find((s) => s.id === setId)
		if (!set) return

		const updated: CoordinateSet = {
			...set,
			name: newName.trim(),
			updatedAt: Date.now(),
		}

		saveCoordinateSet(updated)
		setEditingSetName(null)
		setEditingSetNameValue('')
	}

	return (
		<div className='mt-4'>
			{/* New Set Form - always visible when creating */}
			{showNewSetForm && (
				<div className='mb-4 bg-gray-900 border border-gray-700 rounded-2xl p-4'>
					<form onSubmit={handleCreateSet} className='space-y-3'>
						<div>
							<label className='block text-sm font-semibold text-gray-300 mb-2'>
								{t('mapMarker.newSet.name')}
							</label>
							<input
								type='text'
								value={newSetName}
								onChange={(e) => setNewSetName(e.target.value)}
								placeholder={t('mapMarker.newSet.namePlaceholder')}
								className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-orange-500'
								autoFocus
							/>
						</div>
						<div>
							<label className='block text-sm font-semibold text-gray-300 mb-2'>
								{t('mapMarker.newSet.map')}
							</label>
							<select
								value={newSetMap}
								onChange={(e) => setNewSetMap(e.target.value as MapName)}
								className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-orange-500'
							>
								{MAPS.map((map) => (
									<option key={map} value={map}>
										{map}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className='block text-sm font-semibold text-gray-300 mb-2'>
								{t('mapMarker.newSet.coordinateType')}
							</label>
							<select
								value={newSetCoordinateType}
								onChange={(e) => setNewSetCoordinateType(e.target.value as CoordinateType)}
								className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-orange-500'
							>
								{COORDINATE_TYPES.map((type) => (
									<option key={type.value} value={type.value}>
										{type.label}
									</option>
								))}
							</select>
						</div>
						<div className='flex gap-2'>
							<button
								type='submit'
								className='flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors'
							>
								{t('mapMarker.button.create')}
							</button>
							<button
								type='button'
								onClick={() => setShowNewSetForm(false)}
								className='flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 text-sm font-semibold rounded-lg transition-colors'
							>
								{t('mapMarker.button.cancel')}
							</button>
						</div>
					</form>
				</div>
			)}
			{/* Sets List */}
			{coordinateSets.length === 0 && !showNewSetForm ? (
				<div className='bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center'>
					<p className='text-gray-400 text-sm mb-4'>
						{t('mapMarker.empty.noSets')}
					</p>
					<button
						onClick={() => setShowNewSetForm(true)}
						className='px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors'
					>
						{t('mapMarker.button.createSet')}
					</button>
				</div>
			) : coordinateSets.length > 0 ? (
				<>
					{/* Sets Selection */}
					<div className='mb-4'>
						<div className='flex items-center justify-between mb-3'>
							<h2 className='text-sm font-bold text-gray-300 flex items-center gap-1.5'>
								<span>📍</span> {t('mapMarker.sets.heading')}
							</h2>
							<button
								onClick={() => setShowNewSetForm(true)}
								className='px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors'
							>
								{t('mapMarker.button.newSet')}
							</button>
						</div>

						<div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
							{coordinateSets.map((set) => (
								<button
									key={set.id}
									onClick={() => setSelectedSetId(set.id)}
									className={`p-3 rounded-lg text-left border-2 transition-colors ${
										selectedSetId === set.id
											? 'bg-gray-700 border-orange-500'
											: 'bg-gray-800 border-gray-700 hover:border-gray-600'
									}`}
								>
									<div className='text-sm font-semibold text-gray-100'>
										{set.name}
									</div>
									<div className='text-xs text-gray-400 flex items-center justify-between mt-1'>
										<span>{set.map}</span>
										<span>{set.coordinates.length} coords</span>
									</div>
								</button>
							))}
						</div>
					</div>

				
					{/* Selected Set Details */}
					{selectedSet && (
						<div className='bg-gray-900/60 border border-gray-800 rounded-2xl p-4 space-y-4'>
							{/* Set Header */}
							<div className='flex items-center justify-between gap-3'>
								<div className='flex-1'>
									{editingSetName === selectedSet.id ? (
										<form
											onSubmit={(e) => {
												e.preventDefault()
												handleRenameSet(selectedSet.id, editingSetNameValue)
											}}
											className='flex gap-2'
										>
											<input
												type='text'
												value={editingSetNameValue}
												onChange={(e) => setEditingSetNameValue(e.target.value)}
												className='flex-1 px-3 py-1 bg-gray-800 border border-gray-600 rounded text-gray-100 text-sm focus:outline-none focus:border-orange-500'
												autoFocus
											/>
											<button
												type='submit'
												className='px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded transition-colors'
											>
												✓
											</button>
											<button
												type='button'
												onClick={() => setEditingSetName(null)}
												className='px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-100 text-sm font-semibold rounded transition-colors'
											>
												✕
											</button>
										</form>
									) : (
										<div>
											<h3 className='text-lg font-bold text-gray-100'>
												{selectedSet.name}
											</h3>
											<p className='text-xs text-gray-400'>
												{selectedSet.map} •{' '}
												{selectedSet.coordinates.length}{' '}
												{t('mapMarker.sets.coordinates')}
											</p>
										</div>
									)}
								</div>
								<button
									onClick={() => {
										setEditingSetName(selectedSet.id)
										setEditingSetNameValue(selectedSet.name)
									}}
									className='px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs font-semibold rounded transition-colors'
									title={t('mapMarker.button.rename')}
								>
									✎
								</button>
								<button
									onClick={() => handleDeleteSet(selectedSet.id)}
									className='px-2.5 py-1 bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 text-xs font-semibold rounded border border-red-700/40 transition-colors'
									title={t('mapMarker.button.delete')}
								>
									🗑️
								</button>
							</div>

							{/* Coordinates List */}
							<div>
								<div className='flex items-center justify-between mb-3'>
									<div className='flex items-center gap-2'>
										<h4 className='text-sm font-semibold text-gray-300'>
											{t('mapMarker.coordinates.heading')}
										</h4>
										<span className='text-xs font-semibold text-orange-400 bg-orange-900/30 px-2 py-1 rounded'>
											{getTypeShortLabel(selectedSet.coordinateType)}
										</span>
									</div>
									{!showCoordForm && (
										<button
											onClick={() => {
												setEditingCoordinate(null)
												setShowCoordForm(true)
											}}
											className='px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors'
										>
											{t('mapMarker.button.addCoord')}
										</button>
									)}
								</div>

								{showCoordForm && (
									<div className='mb-4'>
										<CoordinateForm
											onSave={handleSaveCoordinate}
											onCancel={() => {
												setShowCoordForm(false)
												setEditingCoordinate(null)
											}}
											coordinateType={selectedSet.coordinateType}
											initialCoordinate={editingCoordinate ?? undefined}
										/>
									</div>
								)}

								<CoordinateList
									coordinates={selectedSet.coordinates}
									coordinateType={selectedSet.coordinateType}
									onEdit={(coord) => {
										setEditingCoordinate(coord)
										setShowCoordForm(true)
									}}
									onDelete={handleDeleteCoordinate}
								/>
							</div>
						</div>
					)}
				</>
			) : null}
		</div>
	)
}
