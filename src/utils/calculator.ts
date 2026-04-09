import type { Modifier, StatKey } from '../data/modifiers'
import { ALL_MODIFIERS } from '../data/modifiers'

export interface StatResult {
  stat: StatKey
  total: number
  /** Which modifiers contribute to this stat */
  contributors: string[]
}

/**
 * Given an ordered list of selected modifiers, compute the combined stat values.
 * A synergy bonus is applied when multiple selected modifiers share the same stat.
 */
export function calculateStats(selectedModifiers: Modifier[]): StatResult[] {
  if (selectedModifiers.length === 0) return []

  // Group contributions by stat key
  const statMap = new Map<StatKey, { total: number; contributors: string[] }>()

  // Count how many times each stat appears across all selected modifiers
  const statCounts = new Map<StatKey, number>()
  for (const mod of selectedModifiers) {
    for (const s of mod.stats) {
      statCounts.set(s.stat, (statCounts.get(s.stat) ?? 0) + 1)
    }
  }

  for (const mod of selectedModifiers) {
    for (const s of mod.stats) {
      const count = statCounts.get(s.stat) ?? 1
      // Apply synergy bonus for each additional modifier sharing this stat
      const synergyMultiplier = count - 1
      const value = s.baseValue + synergyMultiplier * s.synergyBonus

      const existing = statMap.get(s.stat)
      if (existing) {
        existing.total += value
        if (!existing.contributors.includes(mod.name)) {
          existing.contributors.push(mod.name)
        }
      } else {
        statMap.set(s.stat, { total: value, contributors: [mod.name] })
      }
    }
  }

  // Convert to sorted array (highest total first)
  return Array.from(statMap.entries())
    .map(([stat, { total, contributors }]) => ({ stat, total, contributors }))
    .sort((a, b) => b.total - a.total)
}

export interface TipEntry {
  label: string
  description: string
  modifiers: Modifier[]
  statKey: StatKey
  totalValue: number
}

/**
 * Generate best-combination tips for all stats across all possible
 * 1, 2, and 3-modifier combinations.
 */
export function generateTips(): TipEntry[] {
  const tips: TipEntry[] = []
  const n = ALL_MODIFIERS.length

  // Collect best combo per stat
  const bestPerStat = new Map<StatKey, { value: number; combo: Modifier[] }>()

  const evaluate = (combo: Modifier[]) => {
    const results = calculateStats(combo)
    for (const r of results) {
      const current = bestPerStat.get(r.stat)
      if (!current || r.total > current.value) {
        bestPerStat.set(r.stat, { value: r.total, combo })
      }
    }
  }

  // Single
  for (let i = 0; i < n; i++) {
    evaluate([ALL_MODIFIERS[i]])
  }
  // Pairs
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      evaluate([ALL_MODIFIERS[i], ALL_MODIFIERS[j]])
    }
  }
  // Triples
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        evaluate([ALL_MODIFIERS[i], ALL_MODIFIERS[j], ALL_MODIFIERS[k]])
      }
    }
  }

  for (const [statKey, { value, combo }] of bestPerStat.entries()) {
    const statLabel = combo
      .flatMap(m => m.stats)
      .find(s => s.stat === statKey)

    if (!statLabel) continue

    const names = combo.map(m => m.name).join(' + ')
    tips.push({
      label: `Best ${statKey} combo`,
      description: `Use ${names} for ${value}% total ${statKey} boost.`,
      modifiers: combo,
      statKey,
      totalValue: value,
    })
  }

  return tips.sort((a, b) => b.totalValue - a.totalValue)
}

/** Determine if a modifier is synergistic with the current selection */
export function hasSynergy(modifier: Modifier, selected: Modifier[]): boolean {
  return selected.some(
    s => s.synergyWith.includes(modifier.id) || modifier.synergyWith.includes(s.id)
  )
}
