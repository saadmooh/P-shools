import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Settings, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const BottomNav: React.FC = () => {
  const { user } = useAuthStore();
  
  const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: `/${user?.role?.toLowerCase()}` },
    { label: 'Schedule', icon: Calendar, path: `/${user?.role?.toLowerCase()}/schedule` },
    { label: 'Documents', icon: FileText, path: `/${user?.role?.toLowerCase()}/documents` },
    { label: 'Profile', icon: User, path: `/${user?.role?.toLowerCase()}/profile` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-zinc-100 flex items-center justify-around px-2 z-10">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.label === 'Home'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
              isActive ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400'
            }`
          }
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;