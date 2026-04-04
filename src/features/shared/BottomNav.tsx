import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Settings, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const BottomNav: React.FC = () => {
  const { user } = useAuthStore();
  
  // Base routes for all roles
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: `/${user?.role}` },
    { label: 'Schedule', icon: Calendar, path: `/${user?.role}/schedule` },
    { label: 'Documents', icon: FileText, path: `/${user?.role}/documents` },
    { label: 'Profile', icon: User, path: `/${user?.role}/profile` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--tg-theme-secondary-bg-color)] border-t border-[var(--tg-theme-hint-color)] flex items-center justify-around px-2 z-10">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-[var(--tg-theme-button-color)]' : 'text-[var(--tg-theme-hint-color)]'
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
