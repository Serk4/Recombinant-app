export type MapName = 'DC' | 'WoNY' | 'Brooklyn'
export type CoordinateType = 'menu' | 'map'

export interface Coordinate {
	id: string
	x: number
	y: number
	notes?: string
	photoBase64?: string
	createdAt: number
	updatedAt: number
}

export interface CoordinateSet {
	id: string
	name: string
	map: MapName
	coordinateType: CoordinateType
	coordinates: Coordinate[]
	createdAt: number
	updatedAt: number
}

export const MAPS: MapName[] = ['DC', 'WoNY', 'Brooklyn']

export const COORDINATE_TYPES: { value: CoordinateType; label: string }[] = [
	{ value: 'menu', label: 'Menu Tab Coordinates' },
	{ value: 'map', label: 'Map Tab Coordinates' },
]
