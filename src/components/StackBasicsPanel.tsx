/**
 * StackBasicsPanel – explains the Recombinant base-stack system so players
 * understand where the 20/20/20 default comes from before any passives.
 */

const MODULE_ROWS = [
  {
    module: 'Offense',
    color: 'text-red-300',
    defaultStat: 'Weapon Handling',
    rate: '1% / stack',
    bonus: '+20%',
  },
  {
    module: 'Defense',
    color: 'text-blue-300',
    defaultStat: 'Max Armor',
    rate: '0.5% / stack',
    bonus: '+10%',
  },
  {
    module: 'Utility',
    color: 'text-yellow-300',
    defaultStat: 'Skill Damage',
    rate: '1% / stack',
    bonus: '+20%',
  },
]

const ACTIVE_MODIFIERS = [
  { name: 'Blackout Pulse', icon: '⚡' },
  { name: 'Cloud Armor', icon: '☁️' },
  { name: 'Optimize / Overload', icon: '⚙️' },
]

export function StackBasicsPanel() {
  return (
    <div className='space-y-4'>
      {/* ── How stacks are built ── */}
      <div>
        <h3 className='text-xs font-bold text-gray-200 mb-2 flex items-center gap-1.5'>
          <span>🧱</span> How 20 Stacks per Module Works
        </h3>
        <p className='text-xs text-gray-400 leading-relaxed'>
          Every module starts with <span className='text-white font-semibold'>8 base stacks</span>.
          There are <span className='text-white font-semibold'>3 Active Modifiers</span>, each with{' '}
          <span className='text-white font-semibold'>4 levels</span>. Each level adds{' '}
          <span className='text-white font-semibold'>+1 stack to ALL three modules</span>:
        </p>

        {/* Active modifier list */}
        <div className='flex flex-wrap gap-2 mt-2'>
          {ACTIVE_MODIFIERS.map((a) => (
            <span
              key={a.name}
              className='text-[11px] bg-gray-700/60 text-gray-300 px-2 py-1 rounded-lg flex items-center gap-1'
            >
              <span>{a.icon}</span>
              <span>{a.name}</span>
            </span>
          ))}
        </div>

        {/* Stack math */}
        <div className='mt-3 bg-gray-800/50 border border-gray-700/40 rounded-xl p-3 text-xs text-gray-300 space-y-1'>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Base stacks (per module)</span>
            <span className='font-semibold'>8</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500'>3 actives × 4 levels × +1 stack</span>
            <span className='font-semibold text-green-400'>+12</span>
          </div>
          <div className='border-t border-gray-700 pt-1 flex justify-between'>
            <span className='font-bold text-white'>Total at max (per module)</span>
            <span className='font-bold text-white'>20</span>
          </div>
        </div>
      </div>

      {/* ── Default bonuses table ── */}
      <div>
        <h3 className='text-xs font-bold text-gray-200 mb-2 flex items-center gap-1.5'>
          <span>📊</span> Default Bonuses at 20 Stacks (no passives)
        </h3>
        <div className='overflow-hidden rounded-xl border border-gray-700/40'>
          <table className='w-full text-xs'>
            <thead>
              <tr className='bg-gray-800/60 text-gray-400'>
                <th className='text-left px-3 py-2 font-medium'>Module</th>
                <th className='text-left px-3 py-2 font-medium'>Default Stat</th>
                <th className='text-center px-3 py-2 font-medium'>Rate</th>
                <th className='text-right px-3 py-2 font-medium'>Max Bonus</th>
              </tr>
            </thead>
            <tbody>
              {MODULE_ROWS.map((row, i) => (
                <tr
                  key={row.module}
                  className={`border-t border-gray-700/40 ${i % 2 === 0 ? 'bg-gray-900/20' : ''}`}
                >
                  <td className={`px-3 py-2 font-semibold ${row.color}`}>{row.module}</td>
                  <td className='px-3 py-2 text-gray-300'>{row.defaultStat}</td>
                  <td className='px-3 py-2 text-center text-gray-400'>{row.rate}</td>
                  <td className='px-3 py-2 text-right font-bold text-green-400'>{row.bonus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className='text-[11px] text-gray-500 mt-2 leading-relaxed'>
          This <span className='text-gray-400 font-medium'>20 / 20 / 20</span> state is the
          baseline most players assume. Passive modifiers (below) then add, subtract, redistribute,
          convert, or multiply these stacks further.
        </p>
      </div>
    </div>
  )
}
