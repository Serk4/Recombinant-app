import type { Modifier, StatKey } from '../data/modifiers'
import { ALL_MODIFIERS } from '../data/modifiers'

export interface StatResult {
  category: SimCat
  stat: StatKey
  total: number
  finalStacks: number
  /** Which modifiers contribute to this stat */
  contributors: string[]
}

// ─── Stack simulation constants ──────────────────────────────────────────────

export type SimCat = 'Offense' | 'Defense' | 'Utility'

const SIM_CATS: SimCat[] = ['Offense', 'Defense', 'Utility']

/** Starting stack count for each category before any modifiers are applied */
const BASE_STACKS: Record<SimCat, number> = {
  Offense: 20,
  Defense: 20,
  Utility: 20,
}

/**
 * Stat value gained per stack for each category.
 * The key is the StatKey that can be contributed by that category
 * (default stat or via a Convert modifier).
 */
const STACK_RATES: Record<SimCat, Partial<Record<StatKey, number>>> = {
  Offense: { weaponHandling: 1, headshotDamage: 3, magazineSize: 1 },
  Defense: { totalArmor: 0.5, protectionFromElites: 1.125, hazardProtection: 2.25 },
  Utility: { skillDamage: 1, skillRepair: 1, statusEffects: 1 },
}

/** Default stat produced by each category when no Convert modifier is active */
const DEFAULT_CAT_STAT: Record<SimCat, StatKey> = {
  Offense: 'weaponHandling',
  Defense: 'totalArmor',
  Utility: 'skillDamage',
}

// ─── Order-aware stat calculation ────────────────────────────────────────────

/**
 * Simulate the passive modifier stack system in slot order and return the
 * combined stat values.  Because wildcard effects (Cascade, Converge, etc.)
 * act on the *current* stack state, the order in which modifiers are slotted
 * changes the outcome.
 */
export function calculateStats(selectedModifiers: Modifier[]): StatResult[] {
  if (selectedModifiers.length === 0) return []

  // Mutable simulation state
  const stacks: Record<SimCat, number> = { ...BASE_STACKS }
  const potency: Record<SimCat, number> = { Offense: 1, Defense: 1, Utility: 1 }
  /** Category whose stacks are disabled and contribute nothing to stats */
  const disabled: Record<SimCat, boolean> = { Offense: false, Defense: false, Utility: false }
  /** Override which stat a category's stacks produce (from Convert modifiers) */
  const convertStat: Partial<Record<SimCat, StatKey>> = {}
  /** Names of modifiers that actively influenced each category */
  const catContributors: Record<SimCat, string[]> = { Offense: [], Defense: [], Utility: [] }

  const addContributor = (cat: SimCat, name: string) => {
    if (!catContributors[cat].includes(name)) catContributors[cat].push(name)
  }

  /** Total stacks in a category (used by wildcard ordering comparisons) */
  const total = (cat: SimCat) => stacks[cat]

  for (const mod of selectedModifiers) {
    const modCat = (SIM_CATS as string[]).includes(mod.category)
      ? (mod.category as SimCat)
      : null

    // ── Step 1: apply stack changes in order ─────────────────────────────
    for (const change of mod.stackChanges) {
      if (!(SIM_CATS as string[]).includes(change.category)) continue
      const cat = change.category as SimCat
      stacks[cat] += change.amount
      if (change.amount > 0) addContributor(cat, mod.name)
    }

    // ── Step 2: apply this modifier's effect ─────────────────────────────
    switch (mod.effectType) {
      case 'none':
      case 'redistribute':
        // Stack changes already handled above; note the modifier as a contributor
        // for its own category so it appears in the "From:" line.
        if (modCat) addContributor(modCat, mod.name)
        break

      case 'compress':
        // Remaining stacks become 50% more potent.
        if (modCat) {
          potency[modCat] *= 1.5
          addContributor(modCat, mod.name)
        }
        break

      case 'convert':
        // Stacks now produce a different stat.
        if (modCat && mod.stats.length > 0) {
          convertStat[modCat] = mod.stats[0].stat
          addContributor(modCat, mod.name)
        }
        break

      case 'saturate':
        // All stacks in this category stop contributing to stats.
        // They still count for wildcard comparisons (total()).
        if (modCat) disabled[modCat] = true
        break

      case 'nullify': {
        // Reverses net changes on the *current* lowest category.
        // Fails silently when two or more categories share the minimum.
        const sorted = [...SIM_CATS].sort((a, b) => total(a) - total(b))
        if (total(sorted[0]) < total(sorted[1])) {
          const minCat = sorted[0]
          const delta = stacks[minCat] - BASE_STACKS[minCat]
          stacks[minCat] = Math.max(0, BASE_STACKS[minCat] - delta)
          addContributor(minCat, mod.name)
        }
        break
      }

      case 'cascade': {
        // Disables the highest category; gives ⌈highest / 2⌉ stacks to each other.
        // Fails silently when two or more categories share the maximum.
        const sorted = [...SIM_CATS].sort((a, b) => total(b) - total(a))
        if (total(sorted[0]) > total(sorted[1])) {
          const half = Math.ceil(stacks[sorted[0]] / 2)
          disabled[sorted[0]] = true
          stacks[sorted[1]] += half
          stacks[sorted[2]] += half
          addContributor(sorted[1], mod.name)
          addContributor(sorted[2], mod.name)
        }
        break
      }

      case 'converge': {
        // Lowest category = average of the other two; the other two drop to 0.
        // Fails silently when two or more categories share the minimum.
        const sorted = [...SIM_CATS].sort((a, b) => total(a) - total(b))
        if (total(sorted[0]) < total(sorted[1])) {
          const avg = Math.floor((stacks[sorted[1]] + stacks[sorted[2]]) / 2)
          stacks[sorted[0]] = avg
          stacks[sorted[1]] = 0
          stacks[sorted[2]] = 0
          addContributor(sorted[0], mod.name)
        }
        break
      }

      case 'equalize': {
        // All categories are set to the median stack value.
        const sorted = [...SIM_CATS].sort((a, b) => total(a) - total(b))
        const median = stacks[sorted[1]]
        for (const c of SIM_CATS) stacks[c] = median
        break
      }

      case 'pivot':
        // Quantitative amount is not well-defined; treated as a no-op.
        break

      case 'invert': {
        // Swap this category's stacks with the highest other category.
        // Fails silently when this category is already the highest, or when
        // the two other categories are tied for highest.
        if (!modCat) break
        const others = SIM_CATS.filter(c => c !== modCat)
        const maxOther = Math.max(stacks[others[0]], stacks[others[1]])
        // No-op if this category is already >= the max of the others
        if (stacks[modCat] >= maxOther) break
        // No-op if the two other categories are tied for highest
        if (stacks[others[0]] === stacks[others[1]]) break
        // Swap with the unique highest other category
        const highestOther = stacks[others[0]] > stacks[others[1]] ? others[0] : others[1]
        const tmp = stacks[modCat]
        stacks[modCat] = stacks[highestOther]
        stacks[highestOther] = tmp
        addContributor(modCat, mod.name)
        addContributor(highestOther, mod.name)
        break
      }
    }
  }

  // ── Compute final stats from the resulting stack state ───────────────────
  const results: StatResult[] = []

  for (const cat of SIM_CATS) {
    const effectiveStat = convertStat[cat] ?? DEFAULT_CAT_STAT[cat]
    const finalStacks = Math.max(0, stacks[cat])
    const value = disabled[cat] ? 0 : finalStacks * (STACK_RATES[cat][effectiveStat] ?? 0) * potency[cat]

    const contributors =
      disabled[cat]
        ? ['Saturated — no contribution']
        : catContributors[cat].length > 0
          ? catContributors[cat]
          : selectedModifiers.map((m) => m.name)

    results.push({ category: cat, stat: effectiveStat, total: value, finalStacks, contributors })
  }

  return results
}

export interface TipEntry {
  label: string
  description: string
  modifiers: Modifier[]
  statKey: StatKey
  totalValue: number
}

/** Return all permutations of an array (up to 3 elements in practice). */
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [[...arr]]
  const result: T[][] = []
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm])
    }
  }
  return result
}

/**
 * Generate best-combination tips for all stats across all possible
 * 1-, 2-, and 3-modifier combinations.  Every ordering of each combination
 * is evaluated so the tip reflects the optimal slot sequence.
 */
export function generateTips(): TipEntry[] {
  const tips: TipEntry[] = []
  const n = ALL_MODIFIERS.length

  // Collect best combo (and its ordering) per stat
  const bestPerStat = new Map<StatKey, { value: number; combo: Modifier[] }>()

  const evaluate = (combo: Modifier[]) => {
    for (const ordered of permutations(combo)) {
      const results = calculateStats(ordered)
      for (const r of results) {
        const current = bestPerStat.get(r.stat)
        if (!current || r.total > current.value) {
          bestPerStat.set(r.stat, { value: r.total, combo: ordered })
        }
      }
    }
  }

  // Singles (only one ordering)
  for (let i = 0; i < n; i++) {
    evaluate([ALL_MODIFIERS[i]])
  }
  // Pairs (2 orderings each)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      evaluate([ALL_MODIFIERS[i], ALL_MODIFIERS[j]])
    }
  }
  // Triples (6 orderings each)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        evaluate([ALL_MODIFIERS[i], ALL_MODIFIERS[j], ALL_MODIFIERS[k]])
      }
    }
  }

  for (const [statKey, { value, combo }] of bestPerStat.entries()) {
    const names = combo.map((m) => m.name).join(' → ')
    tips.push({
      label: `Best ${statKey} combo`,
      description: `Slot ${names} for +${value.toFixed(1)}% ${statKey}.`,
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
