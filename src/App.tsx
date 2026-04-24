import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
	const [appliedTip, setAppliedTip] = useState<{
		statKey: string
		comboIndex: number
	} | null>(null)
	const [menuOpen, setMenuOpen] = useState(false)
	const { t, i18n } = useTranslation()

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
		setAppliedTip(null)
	}

	return (
		<div className='min-h-screen bg-gray-950 text-gray-100 font-sans'>
			{/* Header */}
			<header className='sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800'>
				<div className='max-w-2xl mx-auto px-4 py-3 flex items-center gap-3'>
					{/* Hamburger button */}
					<button
						onClick={() => setMenuOpen((o) => !o)}
						aria-label={t('menu.openMenu')}
						className={`flex-shrink-0 flex flex-col justify-center items-center w-9 h-9 rounded-lg border bg-gray-800 hover:bg-gray-700 transition-colors gap-1 ${menuOpen ? 'border-gray-700' : 'menu-pulse'}`}
					>
						<span
							className={`block w-5 h-0.5 bg-gray-300 rounded transition-transform origin-center ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}
						/>
						<span
							className={`block w-5 h-0.5 bg-gray-300 rounded transition-opacity ${menuOpen ? 'opacity-0' : ''}`}
						/>
						<span
							className={`block w-5 h-0.5 bg-gray-300 rounded transition-transform origin-center ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}
						/>
						<span className='text-[8px] text-gray-400 leading-none'>
							{t('menu.label')}
						</span>
					</button>

					{/* Centered title */}
					<div className='flex-1 text-center'>
						<h1 className='text-sm font-bold text-white leading-tight flex items-center justify-center gap-1.5'>
							<svg
								width='20'
								height='20'
								viewBox='0 0 20 20'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
								aria-hidden='true'
							>
								<circle
									cx='10'
									cy='10'
									r='9'
									stroke='#FF6200'
									strokeWidth='3.0'
								/>
							</svg>
							{t('appTitle')}
						</h1>
						<p className='text-[10px] text-gray-400 leading-tight'>
							Tom Clancy's The Division 2 · Rise Up Y8S1
						</p>
					</div>

					{/* Spacer to balance hamburger */}
					<div className='w-9 flex-shrink-0' />
				</div>

				{/* Dropdown menu */}
				{menuOpen && (
					<div className='max-w-2xl mx-auto px-4 pb-3'>
						<div className='bg-gray-900 border border-gray-700 rounded-xl p-3 flex flex-col gap-1'>
							<p className='text-[10px] text-gray-500 uppercase tracking-widest font-semibold px-2 mb-1'>
								{t('menu.view')}
							</p>
							<button
								onClick={() => {
									setActiveTab('build')
									setMenuOpen(false)
								}}
								className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
									activeTab === 'build'
										? 'bg-gray-700 text-white'
										: 'text-gray-400 hover:bg-gray-800 hover:text-white'
								}`}
							>
								<span>🔨</span> {t('menu.build')}
							</button>
							<button
								onClick={() => {
									setActiveTab('tips')
									setMenuOpen(false)
								}}
								className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
									activeTab === 'tips'
										? 'bg-gray-700 text-white'
										: 'text-gray-400 hover:bg-gray-800 hover:text-white'
								}`}
							>
								<span>💡</span> {t('menu.tips')}
							</button>

							<div className='border-t border-gray-700 my-2' />

							<p className='text-[10px] text-gray-500 uppercase tracking-widest font-semibold px-2 mb-1'>
								{t('menu.language')}
							</p>
							<button
								onClick={() => {
									i18n.changeLanguage('en')
									setMenuOpen(false)
								}}
								className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
									i18n.language === 'en'
										? 'bg-gray-700 text-white'
										: 'text-gray-400 hover:bg-gray-800 hover:text-white'
								}`}
							>
								<span className='fi fi-us rounded-sm' /> English
							</button>
							<button
								onClick={() => {
									i18n.changeLanguage('ja')
									setMenuOpen(false)
								}}
								className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
									i18n.language === 'ja'
										? 'bg-gray-700 text-white'
										: 'text-gray-400 hover:bg-gray-800 hover:text-white'
								}`}
							>
								<span className='fi fi-jp rounded-sm' /> 日本語
							</button>
						</div>
					</div>
				)}
			</header>

			<div className='max-w-2xl mx-auto px-4 pb-8'>
				{/* ── MODULE STACKS CARD ── */}
				{activeTab === 'build' && selected.length > 0 && (
					<section className='mt-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-4'>
						<h2 className='text-sm font-bold text-gray-300 mb-3 flex items-center gap-1.5'>
							<span>📊</span> {t('stats.moduleStacksHeading')}
						</h2>
						<StatsPanel stats={stats} />
					</section>
				)}

				{/* ── SELECTED SLOTS BAR ── */}
				<div className='sticky top-[57px] z-10 bg-gray-950/95 backdrop-blur pt-3 pb-2'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-xs text-gray-400 font-medium'>
							{t('selectedSlots.heading', {
								count: selected.length,
								max: MAX_SELECTED,
							})}
						</span>
						{selected.length > 0 && (
							<button
								onClick={clearAll}
								className='text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 border border-red-700/40 hover:border-red-600/60 transition-colors'
							>
								✕ {t('selectedSlots.clearAll')}
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
						{/* ── MODIFIER PICKER ── */}
						<section className='mt-4'>
							<div className='flex items-center justify-between mb-3'>
								<h2 className='text-sm font-bold text-gray-300 flex items-center gap-1.5'>
									<span>🎮</span> {t('modifierPicker.title')}
								</h2>
								{selected.length < MAX_SELECTED && (
									<span className='text-[11px] text-gray-500'>
										{t('selectedSlots.slotsRemaining', {
											count: MAX_SELECTED - selected.length,
										})}
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
									<span
										dangerouslySetInnerHTML={{ __html: t('synergy.hint') }}
									/>
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
							<span>💡</span> {t('tips.heading')}
						</h2>
						<TipsPanel
							tips={tips}
							selectedCount={selected.length}
							appliedTip={appliedTip}
							onApply={(mods, statKey, comboIndex) => {
								setSelected(mods)
								setAppliedTip({ statKey, comboIndex })
							}}
						/>
					</section>
				)}

				{/* Footer */}
				<footer className='mt-8 text-center text-[11px] text-gray-600 pb-4'>
					{t('footer.line1')}
					<br />
					{t('footer.line2')}
				</footer>
			</div>
		</div>
	)
}

export default App
