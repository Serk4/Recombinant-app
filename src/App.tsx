import { useState, useMemo } from 'react'
import {
	ALL_MODIFIERS,
	MODIFIERS_BY_CATEGORY,
	MAX_SELECTED,
} from './data/modifiers'
import type { Category, Modifier } from './data/modifiers'
import { calculateStats, generateTips } from './utils/calculator'
import { CategoryTabs } from './components/CategoryTabs'
import { ModifierCard } from './components/ModifierCard'
import { SelectedSlot } from './components/SelectedSlot'
import { StatsPanel } from './components/StatsPanel'
import { TipsPanel } from './components/TipsPanel'

type ActiveTab = 'build' | 'tips'

function App() {
	const [selected, setSelected] = useState<Modifier[]>([])
	const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All')
	const [activeTab, setActiveTab] = useState<ActiveTab>('build')
	const [appliedTipKey, setAppliedTipKey] = useState<string | null>(null)

	const filteredModifiers = useMemo(() => {
		if (categoryFilter === 'All') return ALL_MODIFIERS
		return MODIFIERS_BY_CATEGORY[categoryFilter]
	}, [categoryFilter])

	const stats = useMemo(() => calculateStats(selected), [selected])
	const tips = useMemo(() => generateTips(), [])

	function toggleModifier(mod: Modifier) {
		setSelected((prev) => {
			const idx = prev.findIndex((m) => m.id === mod.id)
			if (idx !== -1) {
				return prev.filter((m) => m.id !== mod.id)
			}
			if (prev.length >= MAX_SELECTED) return prev
			return [...prev, mod]
		})
	}

	function removeModifier(index: number) {
		setSelected((prev) => prev.filter((_, i) => i !== index))
	}

	function moveModifier(from: number, to: number) {
		setSelected((prev) => {
			const arr = [...prev]
			const [item] = arr.splice(from, 1)
			arr.splice(to, 0, item)
			return arr
		})
	}

	function clearAll() {
		setSelected([])
		setAppliedTipKey(null)
	}

	return (
		<div className='min-h-screen bg-gray-950 text-gray-100 font-sans'>
			{/* Header */}
			<header className='sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800'>
				<div className='max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3'>
					<div className='flex items-center gap-2 min-w-0'>
						<span className='text-xl'>⚗️</span>
						<div className='min-w-0'>
							<h1 className='text-sm font-bold text-white leading-tight truncate'>
								Recombinant
							</h1>
							<p className='text-[10px] text-gray-400 leading-tight'>
								Tom Clancy's The Division 2 · Rise Up Y8S1
							</p>
						</div>
					</div>

					{/* Tab switcher */}
					<div className='flex bg-gray-800 rounded-lg p-0.5 text-xs flex-shrink-0'>
						<button
							onClick={() => setActiveTab('build')}
							className={`px-3 py-1.5 rounded-md font-medium transition-all ${
								activeTab === 'build'
									? 'bg-gray-600 text-white'
									: 'text-gray-400 hover:text-white'
							}`}
						>
							🔨 Build
						</button>
						<button
							onClick={() => setActiveTab('tips')}
							className={`px-3 py-1.5 rounded-md font-medium transition-all ${
								activeTab === 'tips'
									? 'bg-gray-600 text-white'
									: 'text-gray-400 hover:text-white'
							}`}
						>
							💡 Tips
						</button>
					</div>
				</div>
			</header>

			<div className='max-w-2xl mx-auto px-4 pb-8'>
				{/* ── SELECTED SLOTS BAR ── */}
				<div className='sticky top-[57px] z-10 bg-gray-950/95 backdrop-blur pt-3 pb-2'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-xs text-gray-400 font-medium'>
							Selected Passive Modifiers ({selected.length}/{MAX_SELECTED})
						</span>
						{selected.length > 0 && (
							<button
								onClick={clearAll}
								className='text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 border border-red-700/40 hover:border-red-600/60 transition-colors'
							>
								✕ Clear all
							</button>
						)}
					</div>

					<div className='flex gap-2'>
						{Array.from({ length: MAX_SELECTED }).map((_, i) => (
							<SelectedSlot
								key={i}
								index={i}
								modifier={selected[i] ?? null}
								onRemove={() => removeModifier(i)}
								onMoveUp={() => moveModifier(i, i - 1)}
								onMoveDown={() => moveModifier(i, i + 1)}
								isFirst={i === 0}
								isLast={i === selected.length - 1}
								total={selected.length}
							/>
						))}
					</div>
				</div>

				{activeTab === 'build' ? (
					<>
						{/* ── STATS PANEL ── */}
						{selected.length > 0 && (
							<section className='mt-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-4'>
								<h2 className='text-sm font-bold text-gray-300 mb-3 flex items-center gap-1.5'>
									<span>📊</span> Combined Stats
								</h2>
								<StatsPanel stats={stats} />
							</section>
						)}

						{/* ── MODIFIER PICKER ── */}
						<section className='mt-4'>
							<div className='flex items-center justify-between mb-3'>
								<h2 className='text-sm font-bold text-gray-300 flex items-center gap-1.5'>
									<span>🎮</span> Choose Passive Modifiers
								</h2>
								{selected.length < MAX_SELECTED && (
									<span className='text-[11px] text-gray-500'>
										{MAX_SELECTED - selected.length} slot
										{MAX_SELECTED - selected.length !== 1 ? 's' : ''} remaining
									</span>
								)}
							</div>

							{/* Category filter tabs */}
							<div className='mb-3'>
								<CategoryTabs
									active={categoryFilter}
									onChange={setCategoryFilter}
								/>
							</div>

							{/* Synergy hint */}
							{selected.length > 0 && (
								<div className='mb-3 text-[11px] text-yellow-400/80 flex items-center gap-1.5 bg-yellow-900/10 border border-yellow-700/20 rounded-lg px-3 py-2'>
									<span>⚡</span>
									<span>
										Cards marked <strong>SYNERGY</strong> pair well with your
										current selection.
									</span>
								</div>
							)}

							<div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
								{filteredModifiers.map((mod) => (
									<ModifierCard
										key={mod.id}
										modifier={mod}
										selected={selected.some((s) => s.id === mod.id)}
										selectedModifiers={selected}
										selectionOrder={
											selected.findIndex((s) => s.id === mod.id) + 1 ||
											undefined
										}
										disabled={selected.length >= MAX_SELECTED}
										onClick={() => toggleModifier(mod)}
									/>
								))}
							</div>
						</section>
					</>
				) : (
					/* ── TIPS TAB ── */
					<section className='mt-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-4'>
						<h2 className='text-sm font-bold text-gray-300 mb-1 flex items-center gap-1.5'>
							<span>💡</span> Best Combinations Guide
						</h2>
						<TipsPanel
							tips={tips}
							selectedCount={selected.length}
							appliedTipKey={appliedTipKey}
							onApply={(mods, key) => { setSelected(mods); setAppliedTipKey(key) }}
						/>
					</section>
				)}

				{/* Footer */}
				<footer className='mt-8 text-center text-[11px] text-gray-600 pb-4'>
					Tom Clancy's The Division 2 — Rise Up Y8S1
					<br />
					Modifier values are approximate and for reference only.
				</footer>
			</div>
		</div>
	)
}

export default App
