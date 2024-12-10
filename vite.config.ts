import { defineConfig, loadEnv, UserConfig } from 'vite';
import path from 'path';
import { createVitePlugins } from './build/vite/plugins';
import { ImportMetaEnv } from './src/vite-env';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    console.warn('command ->', command);
    console.warn('mode ->', mode);

    const readEnv = loadEnv(mode, './env');
    // @ts-ignore force transform, not a bit problem for string variable
    const metaEvn: ImportMetaEnv = readEnv;
    console.warn('IMPORT_META_ENV -> ', metaEvn);
    // but matters other types

    // port
    let port = parseInt(metaEvn.VITE_PORT ?? '3000');
    if (isNaN(port)) port = 3000;
    console.log('port ->', port);

    const isBuild = command === 'build';
    const isProd = command === 'build' && mode === 'production';

    // console and debugger
    const drop_console = isProd || metaEvn.VITE_DROP_CONSOLE === 'true';
    const drop_debugger = isProd || metaEvn.VITE_DROP_DEBUGGER === 'true';

    let define: any = {};
    if (!isBuild) {
        define = {
            ...define,
            'process.env.NODE_ENV': JSON.stringify(mode),
            'process.env': process.env,
        };
    }

    const common: UserConfig = {
        publicDir: 'public',
        mode,
        define,
        plugins: [...createVitePlugins(metaEvn, isProd, isBuild)],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
            extensions: ['.js', '.ts', '.jsx', '.tsx'],
        },
        build: {
            target: 'es2020',
            minify: isProd ? 'terser' : false,
            terserOptions: isProd && {
                compress: {
                    drop_debugger,
                },
            },
        },
        esbuild: {},
        optimizeDeps: {
            esbuildOptions: {
                target: 'es2020',
            },
        },
        envDir: 'env',
        envPrefix: ['BUILD', 'CONNECT', 'ALCHEMY'],
        clearScreen: false,
    };

    if (!isProd) {
        return {
            ...common,
            server: {
                hmr: true,
                cors: true,
                host: '0.0.0.0',
                port,
            },
        };
    } else {
        return {
            ...common,
        };
    }
});
