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
 * Safely checks if a component is supported and mounts it.
 */
const safeMount = (comp: any) => {
  if (comp && typeof comp.isSupported === 'function' && comp.isSupported()) {
    try {
      if (typeof comp.mount === 'function') {
        comp.mount();
      }
    } catch (e) {
      console.warn('Failed to mount component:', e);
    }
  }
};

/**
 * Initializes the Telegram Mini App SDK safely.
 */
export const initTelegram = () => {
  if (typeof isSSR === 'function' && isSSR()) return;

  try {
    // Check if we can actually retrieve launch parameters.
    // This avoids the loud LaunchParamsRetrieveError in the console.
    try {
      if (typeof retrieveLaunchParams === 'function') {
        retrieveLaunchParams();
      } else {
        return; // SDK not loaded correctly
      }
    } catch (e) {
      console.warn('Telegram launch parameters not found. Running in web mode.');
      return;
    }

    if (typeof init === 'function') {
      init();
    } else {
      return;
    }
    
    // Initialize required components if supported
    safeMount(backButton);
    safeMount(mainButton);
    safeMount(settingsButton);
    safeMount(themeParams);
    safeMount(cloudStorage);

    // Viewport is special and returns a promise in some versions
    if (viewport && typeof viewport.isSupported === 'function' && viewport.isSupported()) {
      try {
        const mountResult = viewport.mount();
        if (mountResult instanceof Promise) {
          mountResult.catch(e => console.warn('Viewport mount promise failed:', e));
        }
      } catch (e) {
        console.warn('Viewport mount failed:', e);
      }
    }

    console.log('Telegram SDK initialized successfully');
  } catch (error) {
    // Final fallback to catch unexpected SDK errors
    console.error('Telegram SDK initialization failed:', error);
  }
};
