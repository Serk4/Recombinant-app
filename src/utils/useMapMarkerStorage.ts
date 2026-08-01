import { useState, useEffect, useCallback } from 'react'
import type { CoordinateSet } from '../data/mapMarkers'

const STORAGE_KEY = 'recombinant_map_markers'

export function useMapMarkerStorage() {
	const [coordinateSets, setCoordinateSets] = useState<CoordinateSet[]>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY)
			return stored ? JSON.parse(stored) : []
		} catch {
			return []
		}
	})

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(coordinateSets))
		} catch (error) {
			console.error('Failed to save map markers:', error)
		}
	}, [coordinateSets])

	const saveCoordinateSet = useCallback(
		(set: CoordinateSet) => {
			setCoordinateSets((prev) => {
				const existing = prev.findIndex((s) => s.id === set.id)
				if (existing !== -1) {
					const updated = [...prev]
					updated[existing] = set
					return updated
				}
				return [...prev, set]
			})
		},
		[]
	)

	const deleteCoordinateSet = useCallback((id: string) => {
		setCoordinateSets((prev) => prev.filter((s) => s.id !== id))
	}, [])

	const getNextSetName = useCallback(
		(baseName: string): string => {
			let counter = 1
			let name = `${baseName}-${counter}`
			while (coordinateSets.some((s) => s.name === name)) {
				counter++
				name = `${baseName}-${counter}`
			}
			return name
		},
		[coordinateSets]
	)

	return {
		coordinateSets,
		saveCoordinateSet,
		deleteCoordinateSet,
		getNextSetName,
	}
}
