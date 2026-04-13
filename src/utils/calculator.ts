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
  Defense: { totalArmor: 0.5, protectionFromElites: 0.5, hazardProtection: 1 },
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
  /** Category whose stacks are locked and cannot be changed by subsequent modifiers */
  const locked: Record<SimCat, boolean> = { Offense: false, Defense: false, Utility: false }
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
      if (locked[cat]) continue
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

      case 'stabilize':
        // Lock this category's stacks at their current value.
        // All subsequent stack changes targeting this category are ignored.
        if (modCat) {
          locked[modCat] = true
          addContributor(modCat, mod.name)
        }
        break

      case 'nullify': {
        // Reverses net stack changes on the *current* lowest category.
        // Fails silently when two or more categories share the minimum or the category is locked.
        // Only stack counts are reversed; potency changes (e.g. from Compress) are not affected,
        // so Compress D followed by Nullify retains the 1.5× potency on 30 restored stacks
        // giving an effective 0.75%/stack PFE rate (0.5% base × 1.5 potency).
        const sorted = [...SIM_CATS].sort((a, b) => total(a) - total(b))
        if (total(sorted[0]) < total(sorted[1])) {
          const minCat = sorted[0]
          if (!locked[minCat]) {
            const delta = stacks[minCat] - BASE_STACKS[minCat]
            stacks[minCat] = Math.max(0, BASE_STACKS[minCat] - delta)
            addContributor(minCat, mod.name)
          }
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
          if (!locked[sorted[1]]) {
            stacks[sorted[1]] += half
            addContributor(sorted[1], mod.name)
          }
          if (!locked[sorted[2]]) {
            stacks[sorted[2]] += half
            addContributor(sorted[2], mod.name)
          }
        }
        break
      }

      case 'converge': {
        // Lowest category = average of the other two; the other two drop to 0.
        // Fails silently when two or more categories share the minimum.
        // Locked categories are not modified.
        const sorted = [...SIM_CATS].sort((a, b) => total(a) - total(b))
        if (total(sorted[0]) < total(sorted[1])) {
          const avg = Math.floor((stacks[sorted[1]] + stacks[sorted[2]]) / 2)
          if (!locked[sorted[0]]) {
            stacks[sorted[0]] = avg
            addContributor(sorted[0], mod.name)
          }
          if (!locked[sorted[1]]) stacks[sorted[1]] = 0
          if (!locked[sorted[2]]) stacks[sorted[2]] = 0
        }
        break
      }

      case 'equalize': {
        // All categories are set to the median stack value.
        // Locked categories are not modified.
        const sorted = [...SIM_CATS].sort((a, b) => total(a) - total(b))
        const median = stacks[sorted[1]]
        for (const c of SIM_CATS) {
          if (!locked[c]) stacks[c] = median
        }
        break
      }

      case 'pivot':
        // Quantitative amount is not well-defined; treated as a no-op.
        break

      case 'invert': {
        // Swap this category's stacks with the highest other category.
        // Fails silently when this category is already the highest, when
        // the two other categories are tied for highest, or when either
        // involved category is locked.
        if (!modCat) break
        const others = SIM_CATS.filter(c => c !== modCat)
        const maxOther = Math.max(stacks[others[0]], stacks[others[1]])
        // No-op if this category is already >= the max of the others
        if (stacks[modCat] >= maxOther) break
        // No-op if the two other categories are tied for highest
        if (stacks[others[0]] === stacks[others[1]]) break
        // Identify the unique highest other category
        const highestOther = stacks[others[0]] > stacks[others[1]] ? others[0] : others[1]
        // No-op if either involved category is locked
        if (locked[modCat] || locked[highestOther]) break
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
  /** All unique modifier combinations that achieve the same best value, each in optimal slot order */
  allCombos: Modifier[][]
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
 * All unique combinations that tie for the best value are collected.
 */
export function generateTips(): TipEntry[] {
  const tips: TipEntry[] = []
  const n = ALL_MODIFIERS.length

  // Collect best combo (and all tied combos) per stat
  const bestPerStat = new Map<StatKey, { value: number; combos: Modifier[][] }>()

  const evaluate = (combo: Modifier[]) => {
    for (const ordered of permutations(combo)) {
      const results = calculateStats(ordered)
      for (const r of results) {
        const current = bestPerStat.get(r.stat)
        if (!current || r.total > current.value) {
          bestPerStat.set(r.stat, { value: r.total, combos: [ordered] })
        } else if (current && Math.abs(r.total - current.value) < 1e-9) {
          // Same best value — add this combo if its modifier set is not already stored
          const ids = ordered.map((m) => m.id).sort().join(',')
          const exists = current.combos.some(
            (c) => c.map((m) => m.id).sort().join(',') === ids,
          )
          if (!exists) current.combos.push(ordered)
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

  for (const [statKey, { value, combos }] of bestPerStat.entries()) {
    const names = combos[0].map((m) => m.name).join(' → ')
    tips.push({
      label: `Best ${statKey} combo`,
      description: `Slot ${names} for +${value.toFixed(1)}% ${statKey}.`,
      modifiers: combos[0],
      allCombos: combos,
      statKey,
      totalValue: value,
    })
  }

  return tips.sort((a, b) => b.totalValue - a.totalValue)
}

/** A single entry in the priority-purchase ranking */
export interface ModifierPriorityEntry {
  modifier: Modifier
  /** The distinct stat keys for which this modifier appears in a best combo */
  statsCovered: StatKey[]
  /** Sum of best-combo tip values across all covered stats (used as tiebreaker) */
  totalValue: number
}

/**
 * Rank all modifiers by multi-purpose versatility.
 * A modifier scores higher the more distinct stats it appears in across the
 * best-combination tips.  Ties are broken by the accumulated tip value.
 * Returns at most 20 entries, already sorted best-first.
 */
export function rankModifiersByVersatility(tips: TipEntry[]): ModifierPriorityEntry[] {
  const modData = new Map<
    string,
    { modifier: Modifier; stats: Set<StatKey>; totalValue: number }
  >()

  for (const tip of tips) {
    // Count each modifier at most once per tip (regardless of how many combos it appears in)
    const seenInTip = new Set<string>()
    for (const combo of tip.allCombos) {
      for (const mod of combo) {
        if (seenInTip.has(mod.id)) continue
        seenInTip.add(mod.id)
        if (!modData.has(mod.id)) {
          modData.set(mod.id, { modifier: mod, stats: new Set(), totalValue: 0 })
        }
        const entry = modData.get(mod.id)!
        entry.stats.add(tip.statKey)
        entry.totalValue += tip.totalValue
      }
    }
  }

  return Array.from(modData.values())
    .map(({ modifier, stats, totalValue }) => ({
      modifier,
      statsCovered: Array.from(stats),
      totalValue,
    }))
    .sort((a, b) => {
      const diff = b.statsCovered.length - a.statsCovered.length
      if (diff !== 0) return diff
      return b.totalValue - a.totalValue
    })
    .slice(0, 20)
}

/** Determine if a modifier is synergistic with the current selection */
export function hasSynergy(modifier: Modifier, selected: Modifier[]): boolean {
  return selected.some(
    s => s.synergyWith.includes(modifier.id) || modifier.synergyWith.includes(s.id)
  )
}
