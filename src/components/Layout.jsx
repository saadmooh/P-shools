// Layout - Sidebar on desktop, Bottom Tab Bar on mobile
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore'
import {
  LayoutDashboard, QrCode, Package,
  Tag, Users, Bell, Settings
} from 'lucide-react'

const NAV = [
  { to: '/dashboard/overview',       label: 'الرئيسية',  icon: LayoutDashboard },
  { to: '/dashboard/qr',             label: 'QR',         icon: QrCode },
  { to: '/dashboard/products',       label: 'المنتجات',   icon: Package },
  { to: '/dashboard/offers',        label: 'العروض',      icon: Tag },
  { to: '/dashboard/customers',      label: 'الزبائن',    icon: Users },
  { to: '/dashboard/notifications',  label: 'إشعارات',    icon: Bell },
  { to: '/dashboard/settings',       label: 'الإعدادات',  icon: Settings },
]

export default function Layout() {
  const { store, user } = useDashboardStore()
  const navigate = useNavigate()

  return (
    <div className="layout flex min-h-screen bg-[#0d0d0d]">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#111111] fixed inset-y-0 left-0 border-r border-[#2a2a2a] z-40">
        {/* Store brand */}
        <div className="flex items-center gap-3 p-5 border-b border-[#2a2a2a]">
          {store.logo_url
            ? <img src={store.logo_url} alt={store.name} className="w-9 h-9 rounded-full object-cover" />
            : <div className="w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-bold text-lg">
                {store.name?.[0] ?? 'S'}
              </div>
          }
          <span className="text-[#f0f0f0] font-semibold text-sm truncate">{store.name}</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#D4AF3730] text-[#D4AF37]'
                    : 'text-[#888888] hover:text-[#f0f0f0] hover:bg-[#1e1e1e]'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-[#2a2a2a] flex items-center gap-3">
          {user?.photo_url
            ? <img src={user.photo_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
            : <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#888888] text-xs">
                {user?.full_name?.[0] ?? '?'}
              </div>
          }
          <div className="overflow-hidden">
            <p className="text-[#f0f0f0] text-xs font-medium truncate">{user?.full_name}</p>
            <p className="text-[#888888] text-xs truncate">@{user?.username ?? '—'}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Bottom Tab Bar — mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#2a2a2a] z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {NAV.slice(0, 5).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-3 px-2 flex-1 transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-[#888888]'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
