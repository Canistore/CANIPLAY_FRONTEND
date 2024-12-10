import type { Plugin } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export function legacyPlugin() {
    return legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }) as unknown as Plugin[];
}
