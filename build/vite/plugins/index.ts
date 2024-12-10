import type { PluginOption } from 'vite';
import purgeIcons from 'vite-plugin-purge-icons';
import react from '@vitejs/plugin-react-swc';
import { ImportMetaEnv } from '../../../src/vite-env';
import { viteCompressionPlugin } from './compression';
import { viteHtmlPlugins } from './html';
import { imageminPlugin } from './imagemin';
import { legacyPlugin } from './legacy';
import { pwaPlugin } from './pwa';
import { svgIconsPlugin } from './svgIcons';
import { visualizerPlugin } from './visualizer';
import { viteYaml } from './yaml';

export const createVitePlugins = (metaEvn: ImportMetaEnv, isProd: boolean, isBuild: boolean) => {
    const {
        VITE_PLUGIN_LEGACY: legacy,
        VITE_PLUGIN_BUILD_COMPRESS_TYPE: compressType,
        VITE_PLUGIN_BUILD_COMPRESS_DELETE_ORIGIN_FILE: shouldBuildCompressDeleteFile,
        VITE_PLUGIN_USE_IMAGEMIN: shouldUseImagemin,
    } = metaEvn;

    const vitePlugins: (PluginOption | PluginOption[])[] = [];

    vitePlugins.push(react());
    vitePlugins.push(...viteHtmlPlugins(metaEvn, isProd, isBuild));
    vitePlugins.push(svgIconsPlugin(isProd));
    vitePlugins.push(...viteYaml());
    vitePlugins.push(purgeIcons({}));
    vitePlugins.push(...visualizerPlugin());

    if (isProd) {
        vitePlugins.push(
            viteCompressionPlugin(compressType, shouldBuildCompressDeleteFile === 'true'),
        );
        shouldUseImagemin === 'true' && vitePlugins.push(imageminPlugin());
        vitePlugins.push(...pwaPlugin(metaEvn));
    }

    return vitePlugins;
};
