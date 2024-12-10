import { BuildMode } from '@/vite-env';

export const getCommand = (): 'serve' | 'build' => (process?.env?.NODE_ENV ? 'serve' : 'build');

export const getBuildMode = (): BuildMode => {
    const mode = import.meta.env.BUILD_MODE;
    switch (mode) {
        case 'production':
        case 'development':
            return mode;
    }
    console.error(`Unknown mode: ${mode}. Parse backend mode failed.`);
    return 'production';
};

export const isDevMode = (): boolean => getBuildMode() !== 'production';

export const getConnectHost = (): string | undefined =>
    import.meta.env.CONNECT_HOST ? import.meta.env.CONNECT_HOST : undefined;

export const getConnectDerivationOrigin = (): string | undefined => {
    const mode = import.meta.env.BUILD_MODE;
    if (mode === 'production') {
        return undefined;
    }

    if (mode === 'development') {
        return undefined;
    }
};
