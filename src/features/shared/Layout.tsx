import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegramAuth } from '../../hooks/useTelegramAuth';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { t } = useTranslation();
  const { isLoading, error, isAuthenticated } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-5 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 mb-4">
          <p className="font-semibold">{t('common.error')}</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 px-5 py-4 bg-white border-b border-zinc-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">EMS</p>
          <h1 className="text-lg font-semibold text-zinc-900">{title || t('common.welcome')}</h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white font-medium text-sm">
          {isAuthenticated ? '✓' : '?'}
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