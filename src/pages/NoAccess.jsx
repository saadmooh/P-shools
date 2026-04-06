// NoAccess page - shown to users without store access
import { useDashboardStore } from '../store/dashboardStore'

export default function NoAccess() {
  const { user } = useDashboardStore()
  return (
    <div className="no-access-page min-h-screen flex items-center justify-center bg-[#0d0d0d]">
      <div className="no-access-card bg-[#1e1e1e] p-8 rounded-2xl text-center max-w-sm mx-4">
        <div className="lock-icon text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-[#f0f0f0] mb-2">لا تملك صلاحية الدخول</h2>
        <p className="text-[#888888] mb-2">حسابك ({user?.full_name}) غير مرتبط بهذا المتجر.</p>
        <p className="text-[#888888]">تواصل مع مالك المتجر لإضافتك.</p>
      </div>
    </div>
  )
}