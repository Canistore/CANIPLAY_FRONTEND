/// <reference types="vite/client" />

declare module '*.yaml' {
    const value: Record<string, any>;
    export default value;
}
declare module '*.yml' {
    const value: Record<string, any>;
    export default value;
}

export type BuildMode = 'production' | 'development';

export interface ImportMetaEnv {
    VITE_PORT?: string;
    VITE_DROP_CONSOLE?: 'true' | 'false';
    VITE_DROP_DEBUGGER?: 'true' | 'false';

    VITE_PLUGIN_KEYWORDS: string;
    VITE_PLUGIN_AUTHOR: string;
    VITE_PLUGIN_DESCRIPTION: string;
    VITE_PLUGIN_ICON: string;
    VITE_PLUGIN_NO_SCRIPT_TITLE: string;
    VITE_PLUGIN_TITLE: string;
    VITE_PLUGIN_SHOW_DEBUG_SCRIPT: 'true' | 'false';
    VITE_PLUGIN_LEGACY?: 'true' | 'false';
    VITE_PLUGIN_BUILD_COMPRESS_TYPE?: 'gzip' | 'brotli' | 'none';
    VITE_PLUGIN_BUILD_COMPRESS_DELETE_ORIGIN_FILE?: string;
    VITE_PLUGIN_USE_IMAGEMIN?: 'true' | 'false';
    VITE_PLUGIN_USE_PWA?: 'true' | 'false';
    VITE_PLUGIN_GLOB_APP_TITLE?: string;
    VITE_PLUGIN_GLOB_APP_SHORT_NAME?: string;

    BUILD_MODE: BuildMode;
    CONNECT_HOST: string;
    CONNECT_DERIVATION_ORIGIN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
