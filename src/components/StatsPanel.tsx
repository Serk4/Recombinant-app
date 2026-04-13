import type { CSSProperties } from 'react'
import type { StatResult } from '../utils/calculator'
import { STAT_LABELS } from '../data/modifiers'
import type { StatKey } from '../data/modifiers'

interface StatsPanelProps {
	stats: StatResult[]
}

const BASE_STACKS = 20

const STAT_RATE: Record<StatKey, number> = {
	weaponHandling: 1,
	headshotDamage: 3,
	magazineSize: 1,
	totalArmor: 0.5,
	protectionFromElites: 0.5,
	hazardProtection: 1,
	skillDamage: 1,
	statusEffects: 1,
	skillRepair: 1,
}

const styles = {
	panel: {
		background: '#0a0a0a',
		padding: '0.75rem',
		fontFamily: 'inherit',
	} as CSSProperties,
	warning: {
		fontSize: '0.625rem',
		color: '#6b7280',
		marginBottom: '0.875rem',
		lineHeight: '1.5',
	} as CSSProperties,
	warningIcon: {
		color: '#FF6200',
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
		color: '#FF6200',
		fontWeight: 700,
		fontSize: '0.6875rem',
		textTransform: 'uppercase',
		letterSpacing: '0.1em',
		marginBottom: '0.1875rem',
	} as CSSProperties,
	stacksLine: {
		color: '#9ca3af',
		fontWeight: 500,
		fontSize: '0.75rem',
		marginBottom: '0.125rem',
	} as CSSProperties,
	bonusLine: {
		display: 'flex',
		alignItems: 'baseline',
		gap: '0.375rem',
		marginBottom: '0.125rem',
	} as CSSProperties,
	bonusPct: {
		color: '#ffffff',
		fontWeight: 700,
		fontSize: '1.375rem',
		lineHeight: 1,
	} as CSSProperties,
	bonusPctZero: {
		color: '#4b5563',
		fontWeight: 700,
		fontSize: '1.375rem',
		lineHeight: 1,
	} as CSSProperties,
	effectLabel: {
		color: '#c2843a',
		fontWeight: 500,
		fontSize: '0.6875rem',
		fontVariant: 'small-caps',
	} as CSSProperties,
	rateLabel: {
		color: '#4b5563',
		fontSize: '0.5625rem',
		marginTop: '0.0625rem',
	} as CSSProperties,
	empty: {
		color: '#6b7280',
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

			{/* Category blocks */}
			<div style={styles.blocks}>
				{stats.map(({ category, stat, total, finalStacks }) => {
					const isZero = total <= 0
					const rate = STAT_RATE[stat]
					const totalStr = Number.isInteger(total)
						? total.toFixed(0)
						: total.toFixed(1)

					return (
						<div key={category} style={{ lineHeight: 1.3, opacity: isZero ? 0.45 : 1 }}>
							{/* Category title */}
							<div style={styles.categoryTitle}>{category}</div>

							{/* Stacks line */}
							<div style={styles.stacksLine}>
								{finalStacks} [{BASE_STACKS}] stacks
							</div>

							{/* Bonus percentage + stat label */}
							<div style={styles.bonusLine}>
								<span style={isZero ? styles.bonusPctZero : styles.bonusPct}>
									+{totalStr}%
								</span>
								<span style={styles.effectLabel}>{STAT_LABELS[stat]}</span>
							</div>

							{/* Per-stack rate */}
							{rate > 0 && (
								<div style={styles.rateLabel}>({rate}% per stack)</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
