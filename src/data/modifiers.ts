// Tom Clancy's The Division 2 – Rise Up (Y8S1) Passive Modifiers
// Values are based on in-game data for the Y8S1 season

export type StatKey =
  | 'weaponDamage'
  | 'headshotDamage'
  | 'critHitChance'
  | 'critHitDamage'
  | 'armorDamage'
  | 'statusEffects'
  | 'totalArmor'
  | 'hazardProtection'
  | 'repairSkill'
  | 'outOfCombatRegen'
  | 'skillDamage'
  | 'skillHaste'
  | 'skillDuration'
  | 'ammoCapacity'
  | 'explosiveDamage'

export const STAT_LABELS: Record<StatKey, string> = {
  weaponDamage: 'Weapon Damage',
  headshotDamage: 'Headshot Damage',
  critHitChance: 'Critical Hit Chance',
  critHitDamage: 'Critical Hit Damage',
  armorDamage: 'Armor Damage',
  statusEffects: 'Status Effects',
  totalArmor: 'Total Armor',
  hazardProtection: 'Hazard Protection',
  repairSkill: 'Repair Skill',
  outOfCombatRegen: 'Out-of-Combat Regen',
  skillDamage: 'Skill Damage',
  skillHaste: 'Skill Haste',
  skillDuration: 'Skill Duration',
  ammoCapacity: 'Ammo Capacity',
  explosiveDamage: 'Explosive Damage',
}

export type Category = 'Offense' | 'Defense' | 'Utility'

export interface ModifierStat {
  stat: StatKey
  /** Base value when this is the first modifier selected (percent, e.g. 10 = 10%) */
  baseValue: number
  /** Additional value gained per extra modifier also providing this stat */
  synergyBonus: number
}

export interface Modifier {
  id: string
  name: string
  category: Category
  description: string
  stats: ModifierStat[]
  /** IDs of modifiers that pair especially well with this one */
  synergyWith: string[]
  icon: string
}

// ─── OFFENSE ─────────────────────────────────────────────────────────────────

const OFFENSE_MODIFIERS: Modifier[] = [
  {
    id: 'headhunter',
    name: 'Headhunter',
    category: 'Offense',
    description: 'Enhances precision targeting, increasing headshot damage and critical hit chance.',
    stats: [
      { stat: 'headshotDamage', baseValue: 15, synergyBonus: 5 },
      { stat: 'critHitChance', baseValue: 8, synergyBonus: 3 },
    ],
    synergyWith: ['sharpshooter', 'reckless'],
    icon: '🎯',
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    category: 'Offense',
    description: 'Amplifies long-range weapon proficiency, boosting headshot and weapon damage.',
    stats: [
      { stat: 'headshotDamage', baseValue: 12, synergyBonus: 4 },
      { stat: 'weaponDamage', baseValue: 6, synergyBonus: 2 },
    ],
    synergyWith: ['headhunter', 'lethality'],
    icon: '🔭',
  },
  {
    id: 'reckless',
    name: 'Reckless',
    category: 'Offense',
    description: 'Pushes the offensive advantage by maximizing weapon and critical hit damage.',
    stats: [
      { stat: 'weaponDamage', baseValue: 10, synergyBonus: 4 },
      { stat: 'critHitDamage', baseValue: 12, synergyBonus: 4 },
    ],
    synergyWith: ['lethality', 'headhunter'],
    icon: '💥',
  },
  {
    id: 'lethality',
    name: 'Lethality',
    category: 'Offense',
    description: 'Increases all forms of weapon damage against armored targets.',
    stats: [
      { stat: 'weaponDamage', baseValue: 8, synergyBonus: 3 },
      { stat: 'armorDamage', baseValue: 14, synergyBonus: 5 },
    ],
    synergyWith: ['reckless', 'sharpshooter'],
    icon: '⚔️',
  },
  {
    id: 'demolitionist',
    name: 'Demolitionist',
    category: 'Offense',
    description: 'Enhances explosive and area-of-effect damage output.',
    stats: [
      { stat: 'explosiveDamage', baseValue: 18, synergyBonus: 6 },
      { stat: 'statusEffects', baseValue: 8, synergyBonus: 3 },
    ],
    synergyWith: ['incendiary', 'statusSpecialist'],
    icon: '💣',
  },
  {
    id: 'incendiary',
    name: 'Incendiary',
    category: 'Offense',
    description: 'Amplifies status effects and debuff potency on targets.',
    stats: [
      { stat: 'statusEffects', baseValue: 15, synergyBonus: 5 },
      { stat: 'critHitChance', baseValue: 5, synergyBonus: 2 },
    ],
    synergyWith: ['demolitionist', 'statusSpecialist'],
    icon: '🔥',
  },
]

// ─── DEFENSE ─────────────────────────────────────────────────────────────────

const DEFENSE_MODIFIERS: Modifier[] = [
  {
    id: 'juggernaut',
    name: 'Juggernaut',
    category: 'Defense',
    description: 'Hardens the agent\'s armor plating for increased total armor.',
    stats: [
      { stat: 'totalArmor', baseValue: 15, synergyBonus: 5 },
      { stat: 'hazardProtection', baseValue: 6, synergyBonus: 2 },
    ],
    synergyWith: ['ironclad', 'hazardSuit'],
    icon: '🛡️',
  },
  {
    id: 'ironclad',
    name: 'Ironclad',
    category: 'Defense',
    description: 'Bolsters repair protocols and armor regeneration.',
    stats: [
      { stat: 'repairSkill', baseValue: 18, synergyBonus: 6 },
      { stat: 'totalArmor', baseValue: 8, synergyBonus: 3 },
    ],
    synergyWith: ['juggernaut', 'medic'],
    icon: '⚙️',
  },
  {
    id: 'hazardSuit',
    name: 'Hazard Suit',
    category: 'Defense',
    description: 'Provides superior protection against environmental and chemical hazards.',
    stats: [
      { stat: 'hazardProtection', baseValue: 20, synergyBonus: 7 },
      { stat: 'statusEffects', baseValue: 5, synergyBonus: 2 },
    ],
    synergyWith: ['juggernaut', 'resilience'],
    icon: '☢️',
  },
  {
    id: 'medic',
    name: 'Medic',
    category: 'Defense',
    description: 'Enhances out-of-combat healing and repair skill effectiveness.',
    stats: [
      { stat: 'outOfCombatRegen', baseValue: 20, synergyBonus: 7 },
      { stat: 'repairSkill', baseValue: 10, synergyBonus: 4 },
    ],
    synergyWith: ['ironclad', 'resilience'],
    icon: '🩺',
  },
  {
    id: 'resilience',
    name: 'Resilience',
    category: 'Defense',
    description: 'Improves hazard protection and out-of-combat recovery simultaneously.',
    stats: [
      { stat: 'hazardProtection', baseValue: 12, synergyBonus: 4 },
      { stat: 'outOfCombatRegen', baseValue: 10, synergyBonus: 3 },
    ],
    synergyWith: ['hazardSuit', 'medic'],
    icon: '💪',
  },
  {
    id: 'statusSpecialist',
    name: 'Status Specialist',
    category: 'Defense',
    description: 'Reduces the duration and potency of enemy-inflicted status effects.',
    stats: [
      { stat: 'hazardProtection', baseValue: 10, synergyBonus: 3 },
      { stat: 'totalArmor', baseValue: 10, synergyBonus: 3 },
    ],
    synergyWith: ['juggernaut', 'hazardSuit'],
    icon: '🧪',
  },
]

// ─── UTILITY ─────────────────────────────────────────────────────────────────

const UTILITY_MODIFIERS: Modifier[] = [
  {
    id: 'techWiz',
    name: 'Tech Wizard',
    category: 'Utility',
    description: 'Optimizes skill deployment speed and reduces skill cooldowns.',
    stats: [
      { stat: 'skillHaste', baseValue: 15, synergyBonus: 5 },
      { stat: 'skillDuration', baseValue: 10, synergyBonus: 3 },
    ],
    synergyWith: ['overclocked', 'combatMedic'],
    icon: '⚡',
  },
  {
    id: 'overclocked',
    name: 'Overclocked',
    category: 'Utility',
    description: 'Dramatically boosts skill damage and amplifies skill effectiveness.',
    stats: [
      { stat: 'skillDamage', baseValue: 18, synergyBonus: 6 },
      { stat: 'skillHaste', baseValue: 8, synergyBonus: 3 },
    ],
    synergyWith: ['techWiz', 'combatMedic'],
    icon: '🔋',
  },
  {
    id: 'combatMedic',
    name: 'Combat Medic',
    category: 'Utility',
    description: 'Improves skill duration and repair skill for sustained operations.',
    stats: [
      { stat: 'skillDuration', baseValue: 18, synergyBonus: 6 },
      { stat: 'repairSkill', baseValue: 8, synergyBonus: 3 },
    ],
    synergyWith: ['techWiz', 'overclocked'],
    icon: '🏥',
  },
  {
    id: 'quartermaster',
    name: 'Quartermaster',
    category: 'Utility',
    description: 'Increases ammunition reserves across all weapon types.',
    stats: [
      { stat: 'ammoCapacity', baseValue: 25, synergyBonus: 8 },
      { stat: 'weaponDamage', baseValue: 4, synergyBonus: 2 },
    ],
    synergyWith: ['tactician', 'overclocked'],
    icon: '📦',
  },
  {
    id: 'tactician',
    name: 'Tactician',
    category: 'Utility',
    description: 'Balances skill haste and ammo capacity for versatile combat readiness.',
    stats: [
      { stat: 'skillHaste', baseValue: 10, synergyBonus: 3 },
      { stat: 'ammoCapacity', baseValue: 15, synergyBonus: 5 },
    ],
    synergyWith: ['quartermaster', 'techWiz'],
    icon: '🗺️',
  },
  {
    id: 'engineerSpec',
    name: 'Engineer',
    category: 'Utility',
    description: 'Extends skill duration and increases skill damage for prolonged engagements.',
    stats: [
      { stat: 'skillDuration', baseValue: 12, synergyBonus: 4 },
      { stat: 'skillDamage', baseValue: 10, synergyBonus: 3 },
    ],
    synergyWith: ['overclocked', 'combatMedic'],
    icon: '🔧',
  },
]

export const ALL_MODIFIERS: Modifier[] = [
  ...OFFENSE_MODIFIERS,
  ...DEFENSE_MODIFIERS,
  ...UTILITY_MODIFIERS,
]

export const MODIFIERS_BY_CATEGORY: Record<Category, Modifier[]> = {
  Offense: OFFENSE_MODIFIERS,
  Defense: DEFENSE_MODIFIERS,
  Utility: UTILITY_MODIFIERS,
}

export const MAX_SELECTED = 3
