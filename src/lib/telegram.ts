import { 
  init, 
  backButton, 
  mainButton, 
  viewport, 
  themeParams, 
  settingsButton, 
  cloudStorage,
  retrieveLaunchParams,
  isSSR
} from '@telegram-apps/sdk';

/**
 * Initializes the Telegram Mini App SDK safely.
 */
export const initTelegram = () => {
  if (isSSR()) return;

  try {
    // Check if we can actually retrieve launch parameters.
    // This avoids the loud LaunchParamsRetrieveError in the console.
    try {
      retrieveLaunchParams();
    } catch (e) {
      console.warn('Telegram launch parameters not found. Running in web mode.');
      return;
    }

    init();
    
    // Initialize required components if supported
    if (backButton.isSupported()) backButton.mount();
    if (mainButton.isSupported()) mainButton.mount();
    if (settingsButton.isSupported()) settingsButton.mount();
    if (viewport.isSupported()) {
      viewport.mount().catch(e => console.warn('Viewport mount failed:', e));
    }
    if (themeParams.isSupported()) themeParams.mount();
    if (cloudStorage.isSupported()) cloudStorage.mount();

    console.log('Telegram SDK initialized successfully');
  } catch (error) {
    // Final fallback to catch unexpected SDK errors
    console.error('Telegram SDK initialization failed:', error);
  }
};
