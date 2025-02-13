import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

function toPath(dir: string) {
    // @ts-ignore
    return new URL(dir, import.meta.url);
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue()
    ],
    resolve: {
        alias: {
            '/@': toPath('./src'),
            '/!': toPath('./public')
        }
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5845',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    build: {
        rollupOptions: {
            output: {
                format: 'es',
                assetFileNames: `static/[ext]/[name]-[hash].[ext]`
            },
        },
    },
    worker: {
        format: 'es',
    }
})
