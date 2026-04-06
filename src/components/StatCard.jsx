export default function StatCard({ label, value, icon, trend }) {
  const isPositive = trend?.startsWith('↑')
  const isNegative = trend?.startsWith('↓')
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-border shadow-soft">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs font-bold ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-text">{value ?? '—'}</p>
      <p className="text-sm text-muted font-medium">{label}</p>
    </div>
  )
}