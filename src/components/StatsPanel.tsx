import type { CSSProperties } from 'react'
import type { StatResult } from '../utils/calculator'
import { STAT_LABELS } from '../data/modifiers'

interface StatsPanelProps {
	stats: StatResult[]
}

const BASE_STACKS = 20
const ORANGE_ACCENT = '#FF6200'
const MUTED_TEXT = '#6b7280'

const styles = {
	panel: {
		background: '#0a0a0a',
		padding: '0.75rem',
		fontFamily: 'inherit',
	} as CSSProperties,
	warning: {
		fontSize: '0.625rem',
		color: MUTED_TEXT,
		marginBottom: '0.875rem',
		lineHeight: '1.5',
	} as CSSProperties,
	warningIcon: {
		color: ORANGE_ACCENT,
	} as CSSProperties,
	warningBold: {
		color: '#9ca3af',
		fontWeight: 600,
	} as CSSProperties,
	blocks: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.75rem',
	} as CSSProperties,
	categoryTitle: {
		color: ORANGE_ACCENT,
		fontWeight: 700,
		fontSize: '0.6875rem',
		textTransform: 'uppercase',
		letterSpacing: '0.1em',
		marginBottom: '0.1875rem',
	} as CSSProperties,
	infoRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '0.375rem',
		flexWrap: 'nowrap' as const,
	} as CSSProperties,
	stacksInline: {
		display: 'flex',
		alignItems: 'baseline',
		gap: '0.1875rem',
		minWidth: '3.5rem',
	} as CSSProperties,
	stackCurrent: {
		color: ORANGE_ACCENT,
		fontWeight: 800,
		fontSize: '1rem',
		lineHeight: 1,
	} as CSSProperties,
	stackBase: {
		color: '#9ca3af',
		fontWeight: 600,
		fontSize: '0.65rem',
	} as CSSProperties,
	bonusPct: {
		color: ORANGE_ACCENT,
		fontWeight: 700,
		fontSize: '0.7rem',
		lineHeight: 1,
		whiteSpace: 'nowrap' as const,
	} as CSSProperties,
	effectLabel: {
		color: '#ffffff',
		fontWeight: 500,
		fontSize: '0.7rem',
		fontVariant: 'small-caps',
		whiteSpace: 'nowrap' as const,
	} as CSSProperties,
	rateLabel: {
		color: '#cbd5e1',
		fontWeight: 600,
		fontSize: '0.65rem',
		letterSpacing: '0.01em',
		whiteSpace: 'nowrap' as const,
	} as CSSProperties,
	mutedBuff: {
		color: MUTED_TEXT,
	} as CSSProperties,
	empty: {
		color: MUTED_TEXT,
		textAlign: 'center',
		padding: '2rem 0',
		fontSize: '0.875rem',
	} as CSSProperties,
	emptyIcon: {
		fontSize: '1.875rem',
		display: 'block',
		marginBottom: '0.5rem',
	} as CSSProperties,
}

export function StatsPanel({ stats }: StatsPanelProps) {
	if (stats.length === 0) {
		return (
			<div style={styles.empty}>
				<span style={styles.emptyIcon}>📊</span>
				Select up to 3 modifiers to see combined stats
			</div>
		)
	}

	return (
		<div style={styles.panel}>
			{/* Warning header */}
			<p style={styles.warning}>
				<span style={styles.warningIcon}>⚠</span>{' '}
				Calculations assume{' '}
				<span style={styles.warningBold}>20 base stacks</span> per module
				(fully upgraded). Results will differ with lower-tier modules.
			</p>

			{/* Module rows */}
			<div style={styles.blocks}>
				{stats.map(({ category, stat, total, finalStacks, effectiveRate }) => {
					const isZero = total <= 0
					const rateStr = Number.isInteger(effectiveRate)
						? effectiveRate.toFixed(0)
						: effectiveRate.toFixed(2).replace(/\.?0+$/, '')
					const totalStr = Number.isInteger(total)
						? total.toFixed(0)
						: total.toFixed(1)

					return (
						<div key={category}>
							{/* Category title */}
							<div style={styles.categoryTitle}>{category}</div>

							{/* Single info row: stacks  +bonus% Label  (rate% per stack) */}
							<div style={styles.infoRow}>
								<span style={styles.stacksInline}>
									<span style={styles.stackCurrent}>{finalStacks}</span>
									<span style={styles.stackBase}>[{BASE_STACKS}]</span>
								</span>
								<span style={{ ...styles.bonusPct, ...(isZero ? styles.mutedBuff : {}) }}>
									+{totalStr}%
								</span>
								<span style={{ ...styles.effectLabel, ...(isZero ? styles.mutedBuff : {}) }}>
									{STAT_LABELS[stat]}
								</span>
								{effectiveRate > 0 && (
									<span style={{ ...styles.rateLabel, ...(isZero ? styles.mutedBuff : {}) }}>
										({rateStr}% per stack)
									</span>
								)}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
