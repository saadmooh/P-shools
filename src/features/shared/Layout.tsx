import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../hooks/useTelegram';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--tg-theme-bg-color)] selection:bg-blue-100">
      {/* Premium Header with Glassmorphism */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">EMS PORTAL</p>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title || t('common.welcome')}</h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 shadow-lg flex items-center justify-center text-white font-bold ring-4 ring-slate-50 transition-transform active:scale-90">
          ?
        </div>
      </header>

      {/* Main Content with Spacing */}
      <main className="flex-1 pb-24 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>

      {/* Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
