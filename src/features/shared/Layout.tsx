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
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 px-5 py-4 bg-white border-b border-zinc-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">EMS</p>
          <h1 className="text-lg font-semibold text-zinc-900">{title || t('common.welcome')}</h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white font-medium text-sm">
          ?
        </div>
      </header>

      <main className="flex-1 pb-32 p-5">
        {children}
      </main>

      <BottomNav />
    </div>
  );
};

export default Layout;