import { Platform } from 'react-native';
import 'text-encoding';
import 'whatwg-fetch';

if (Platform.OS !== 'web') {
  const setupPolyfills = async () => {
    try {
      // Import structured clone polyfill
      const structuredClone = await import('@ungap/structured-clone');
      
      if (!('structuredClone' in global)) {
        (global as any).structuredClone = structuredClone.default || structuredClone;
      }

      console.log('Polyfills setup completed');
    } catch (error) {
      console.warn('Failed to setup polyfills:', error);
    }
  };

  setupPolyfills();
}

export { };

