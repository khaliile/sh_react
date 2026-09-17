import { lazy } from 'react';

/**
 * Wraps React.lazy to gracefully recover when dynamic chunk hashes change after a new build.
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      const isChunkError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Importing a module script failed');

      if (isChunkError) {
        const lastReload = sessionStorage.getItem('chunk_error_reload');
        const now = Date.now();
        // If not reloaded within the last 10 seconds, force reload once to get fresh assets
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem('chunk_error_reload', now.toString());
          window.location.reload();
          return new Promise(() => {}); // prevent throwing while reloading
        }
      }
      throw error;
    }
  });
}
