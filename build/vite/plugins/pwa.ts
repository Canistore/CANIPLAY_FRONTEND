import type { Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { ImportMetaEnv } from '../../../src/vite-env';

export function pwaPlugin(env: ImportMetaEnv) {
    const {
        VITE_PLUGIN_USE_PWA: shouldUsePwa,
        VITE_PLUGIN_GLOB_APP_TITLE: appTitle,
        VITE_PLUGIN_GLOB_APP_SHORT_NAME: shortName,
    } = env;

    if (shouldUsePwa) {
        // vite-plugin-pwa
        const pwaPlugin = VitePWA({
            manifest: {
                name: appTitle,
                short_name: shortName,
                icons: [],
            },
        });
        return pwaPlugin as unknown as Plugin[];
    }
    return [];
}
