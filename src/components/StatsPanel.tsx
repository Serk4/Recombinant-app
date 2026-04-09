import type { StatResult } from '../utils/calculator'
import { STAT_LABELS } from '../data/modifiers'
import type { StatKey } from '../data/modifiers'

interface StatsPanelProps {
  stats: StatResult[]
}

const STAT_ICONS: Record<StatKey, string> = {
  weaponDamage: '🔫',
  headshotDamage: '🎯',
  critHitChance: '💥',
  critHitDamage: '☠️',
  armorDamage: '⚔️',
  statusEffects: '🔥',
  totalArmor: '🛡️',
  hazardProtection: '☢️',
  repairSkill: '🔧',
  outOfCombatRegen: '💚',
  skillDamage: '🔮',
  skillHaste: '⚡',
  skillDuration: '⏱️',
  ammoCapacity: '📦',
  explosiveDamage: '💣',
}

// Colour the bar based on value magnitude
function getBarColor(value: number): string {
  if (value >= 40) return 'from-green-500 to-emerald-400'
  if (value >= 25) return 'from-yellow-500 to-amber-400'
  return 'from-orange-500 to-red-400'
}

export function StatsPanel({ stats }: StatsPanelProps) {
  if (stats.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 text-sm">
        <span className="text-3xl block mb-2">📊</span>
        Select up to 3 modifiers to see combined stats
      </div>
    )
  }

  const maxVal = Math.max(...stats.map(s => s.total), 1)

  return (
    <div className="space-y-3">
      {stats.map(({ stat, total, contributors }) => (
        <div key={stat} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span>{STAT_ICONS[stat]}</span>
              <span className="font-medium">{STAT_LABELS[stat]}</span>
            </span>
            <span className="font-bold text-white">+{total.toFixed(0)}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getBarColor(total)} transition-all duration-500`}
              style={{ width: `${Math.min((total / maxVal) * 100, 100)}%` }}
            />
          </div>

          <p className="text-[10px] text-gray-500">
            From: {contributors.join(', ')}
          </p>
        </div>
      ))}
    </div>
  )
}
