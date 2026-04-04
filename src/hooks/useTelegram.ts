import { useMemo } from 'react';
import { 
  useSignal, 
  initData, 
  mainButton, 
  backButton, 
  themeParams, 
  viewport,
  cloudStorage,
  retrieveLaunchParams
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
      console.warn('Could not retrieve launch params via SDK:', e);
      return null;
    }
  }, []);

  // Legacy WebApp fallback (very reliable in desktop/mobile clients)
  const legacyWebAppUser = useMemo(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        console.log('--- FOUND USER VIA LEGACY WEBAPP API ---', tg.initDataUnsafe.user);
        const u = tg.initDataUnsafe.user;
        return {
          id: u.id,
          firstName: u.first_name, // Note: legacy uses snake_case
          lastName: u.last_name,
          username: u.username,
          languageCode: u.language_code,
          isPremium: u.is_premium,
          photoUrl: u.photo_url,
          allowsWriteToPm: u.allows_write_to_pm,
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }, []);

  // 1. Basic User Info
  const user = useMemo(() => {
    try {
      console.log('--- EXTRACTING USER ---');
      
      // Try Signal -> Try LaunchParams -> Try Legacy WebApp
      const u = initDataValue?.user || lp?.initData?.user || legacyWebAppUser;
      
      if (!u) {
        console.warn('No user object found across all detection methods');
        return null;
      }
      
      console.log('Successfully extracted user:', u);
      return {
        id: u.id,
        firstName: u.firstName || (u as any).first_name,
        lastName: u.lastName || (u as any).last_name,
        username: u.username,
        languageCode: u.languageCode || (u as any).language_code,
        isPremium: u.isPremium || (u as any).is_premium,
        photoUrl: u.photoUrl || (u as any).photo_url,
        allowsWriteToPm: u.allowsWriteToPm || (u as any).allows_write_to_pm,
      };
    } catch (e) {
      console.error('Error during user extraction:', e);
      return null;
    }
  }, [initDataValue, lp, legacyWebAppUser]);

  // 2. Session & Security Data
  const sessionData = useMemo(() => {
    try {
      const id = initDataValue || lp?.initData;
      return {
        initDataRaw: lp?.initDataRaw || (window as any).Telegram?.WebApp?.initData || '',
        hash: id?.hash || (window as any).Telegram?.WebApp?.initDataUnsafe?.hash || '',
        authDate: id?.authDate || new Date(),
        queryId: id?.queryId || (window as any).Telegram?.WebApp?.initDataUnsafe?.query_id || '',
        startParam: id?.startParam || (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param || '',
      };
    } catch (e) {
      return { initDataRaw: '', hash: '', authDate: new Date(), queryId: '', startParam: '' };
    }
  }, [initDataValue, lp]);

  // 3. Device & Environment Data
  const deviceData = useMemo(() => {
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    return {
      platform: tg?.platform || lp?.platform || 'unknown',
      version: tg?.version || lp?.version || '0.0',
      colorScheme: tg?.colorScheme || 'light',
      isExpanded: tg?.isExpanded || false,
      viewportHeight: viewportValue?.height || 0,
      viewportStableHeight: viewportValue?.stableHeight || 0,
    };
  }, [viewportValue, lp]);

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
    (window as any).Telegram?.WebApp?.showAlert(message);
  };

  const showConfirm = (message: string, callback: (ok: boolean) => void) => {
    (window as any).Telegram?.WebApp?.showConfirm(message, callback);
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
  };

  const requestPhone = (): Promise<{ phone: string } | null> => {
    return new Promise((resolve) => {
      if ((window as any).Telegram?.WebApp?.requestContact) {
        (window as any).Telegram.WebApp.requestContact((ok: boolean, response: any) => {
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

  const closeApp = () => (window as any).Telegram?.WebApp?.close();

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
