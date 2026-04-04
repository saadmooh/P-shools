import { init, backButton, mainButton, viewport, themeParams, settingsButton, cloudStorage } from '@telegram-apps/sdk';

/**
 * Initializes the Telegram Mini App SDK.
 */
export const initTelegram = () => {
  try {
    init();
    
    // Initialize required components
    if (backButton.isSupported()) backButton.mount();
    if (mainButton.isSupported()) mainButton.mount();
    if (settingsButton.isSupported()) settingsButton.mount();
    if (viewport.isSupported()) viewport.mount();
    if (themeParams.isSupported()) themeParams.mount();
    if (cloudStorage.isSupported()) cloudStorage.mount();

    console.log('Telegram SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Telegram SDK:', error);
  }
};
