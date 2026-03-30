// StatCard - summary stat display for dashboard
export default function StatCard({ label, value, icon, trend }) {
  const isPositive = trend?.startsWith('↑')
  const isNegative = trend?.startsWith('↓')
  
  return (
    <div className="stat-card bg-[#1e1e1e] rounded-xl p-4 border border-[#2a2a2a]">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs font-medium ${
            isPositive ? 'text-[#22c55e]' : isNegative ? 'text-[#ef4444]' : 'text-[#888888]'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#f0f0f0]">{value ?? '—'}</p>
      <p className="text-sm text-[#888888]">{label}</p>
    </div>
  )
}