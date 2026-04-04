import { useMemo } from 'react';
import { 
  useSignal, 
  initData, 
  mainButton, 
  backButton, 
  themeParams, 
  viewport,
  cloudStorage
} from '@telegram-apps/sdk-react';

/**
 * Enhanced hook for Telegram Mini App data and interactions.
 */
export function useTelegram() {
  // Safe signal access
  const initDataValue = useSignal(initData.state);
  const themeParamsValue = useSignal(themeParams.state);
  const viewportValue = useSignal(viewport.state);

  // Fallback to launch params if signals are empty
  const lp = useMemo(() => {
    try {
      const params = retrieveLaunchParams();
      console.log('--- RETRIEVED LAUNCH PARAMS ---', params);
      return params;
    } catch (e) {
      console.warn('Could not retrieve launch params:', e);
      return null;
    }
  }, []);

  // 1. Basic User Info
  const user = useMemo(() => {
    try {
      console.log('--- EXTRACTING USER ---');
      const u = initDataValue?.user || lp?.initData?.user;
      
      if (!u) {
        console.warn('No user object found. Signals User:', initDataValue?.user);
        console.warn('LP InitData User:', lp?.initData?.user);
        return null;
      }
      
      console.log('Successfully extracted user:', u);
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        languageCode: u.languageCode,
        isPremium: u.isPremium,
        photoUrl: u.photoUrl,
        allowsWriteToPm: u.allowsWriteToPm,
      };
    } catch (e) {
      console.error('Error during user extraction:', e);
      return null;
    }
  }, [initDataValue, lp]);

  // 2. Session & Security Data
  const sessionData = useMemo(() => {
    try {
      const id = initDataValue || lp?.initData;
      return {
        initDataRaw: lp?.initDataRaw || '',
        hash: id?.hash || '',
        authDate: id?.authDate || new Date(),
        queryId: id?.queryId || '',
        startParam: id?.startParam || '',
      };
    } catch (e) {
      return { initDataRaw: '', hash: '', authDate: new Date(), queryId: '', startParam: '' };
    }
  }, [initDataValue, lp]);

  // 3. Device & Environment Data
  const deviceData = useMemo(() => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    return {
      platform: tg?.platform || 'unknown',
      version: tg?.version || '0.0',
      colorScheme: tg?.colorScheme || 'light',
      isExpanded: tg?.isExpanded || false,
      viewportHeight: viewportValue?.height || 0,
      viewportStableHeight: viewportValue?.stableHeight || 0,
    };
  }, [viewportValue]);

  // 4. Theme Data
  const themeData = useMemo(() => {
    try {
      const p = themeParamsValue;
      if (!p) return null;
      return {
        bgColor: p.bgColor,
        textColor: p.textColor,
        hintColor: p.hintColor,
        linkColor: p.linkColor,
        buttonColor: p.buttonColor,
        buttonTextColor: p.buttonTextColor,
        secondaryBgColor: p.secondaryBgColor,
        headerBgColor: p.headerBgColor,
        accentTextColor: p.accentTextColor,
        destructiveTextColor: p.destructiveTextColor,
      };
    } catch (e) {
      return null;
    }
  }, [themeParamsValue]);

  // 5. Actions & Utilities
  const showAlert = (message: string) => {
    window.Telegram?.WebApp?.showAlert(message);
  };

  const showConfirm = (message: string, callback: (ok: boolean) => void) => {
    window.Telegram?.WebApp?.showConfirm(message, callback);
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
  };

  const requestPhone = (): Promise<{ phone: string } | null> => {
    return new Promise((resolve) => {
      if (window.Telegram?.WebApp?.requestContact) {
        window.Telegram.WebApp.requestContact((ok: boolean, response: any) => {
          if (ok && response?.contact) {
            resolve({ phone: response.contact.phone_number });
          } else {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  };

  const closeApp = () => window.Telegram?.WebApp?.close();

  return {
    user,
    sessionData,
    deviceData,
    themeData,
    mainButton,
    backButton,
    cloudStorage,
    showAlert,
    showConfirm,
    hapticFeedback,
    requestPhone,
    closeApp,
  };
}
