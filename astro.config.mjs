import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import sitemap from '@astrojs/sitemap'
import glsl from 'vite-plugin-glsl'

/*
 * パラメーター
 */

// パス
export const protocol = 'https'
export const domain = 'example.com' // 'example.com'
export const domainLocalPhpServer = '' // 'http://example.local/'
export const rootDir = './' // '/subdirectory/'
export const rootDirAssets = '' // '/assets-subdirectory/'

// title, meta
export const siteTitle = 'default title'
export const ogImage = 'ogp.png' // 'ogp.png'
export const ogImageWidth = 600 // 1200
export const ogImageHeight = 600 // 630

// アナリティクス
export const GA_ID = null // 'UA-111111111-1'
export const GTM_ID = null // 'GTM-AAAAAAA'

// ブレークポイント
export const breakpoint = 768

// 圧縮
export const enableMinify = true // CSS,JSを圧縮するかどうか
export const enableMinifyHtml = false // HTMLを圧縮するかどうか

// ポリフィル
export const enablePolyfill = false // ポリフィルを使うかどうか

// HTML
export const enableWebP = true // WebP変換を有効にするかどうか

// CSS
export const enableMinFontSize = false // 自動で最小フォントサイズを10pxに設定するコードを出力する

// アナリティクス
export const enableAutoSendGaView = false // 非同期遷移の場合にGAのページビューイベントを送信するかどうか

// イベント
export const enableEventWindow = true // グローバルの resize イベンドなどを有効にするかどうか
export const enableEventMouse = true // グローバルの mousemove イベンドなどを有効にするかどうか
export const enableEventTick = false // グローバルの requestAnimationFrame イベンドなどを有効にするかどうか
export const enableEventScroll = false // グローバルの scroll イベンドを有効にするかどうか

// アニメーション
export const enableSmoothScroll = true // スムーススクロールを有効にするかどうか
export const enableEventAsynchronousTransition = false // 非同期遷移を有効にするかどうか
export const enableEventLoading = false // 自前のローディングカウントを有効にするかどうか
export const enableEventPace = false // Paceライブラリを有効にするかどうか

// ライブラリ
export const importLibraryThree = false // three.js ライブラリを読み込むかどうか
export const importLibraryThreePostProcessing = false // three.js ライブラリのPost Processingを読み込むかどうか
export const enableStats = false // Stats を有効にするかどうか

// Tweakpane
export const enablePane = false // Tweakpane をブラウザ上に表示させるかどうか
export const isShowPane = false // Tweakpane をブラウザ上に表示させるかどうか
export const isOpenPane = false // Tweakpane を開いた状態にするかどうか

// PerfectPixel
export const idPerfectPixel = 'chromeperfectpixel-overlay-container'

// calc

// パス
export const baseUrl = domain ? `${protocol}://${domain}` : undefined
// 環境変数
export const isCms =
  (process.env.NODE_CMS ||
    loadEnv(import.meta.env.MODE, process.cwd(), '').NODE_CMS) === 'true'
export const isCache = process.env.NODE_CACHE === 'true'
export const isPhp = process.env.NODE_PHP === 'true'
export const isTinypng = process.env.NODE_TINYPNG === 'true'

/*
 * main
 */

function generateEnv(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      `_ENV_.${key}`,
      JSON.stringify(value),
    ])
  )
}

// https://astro.build/config
export default defineConfig({
  site: baseUrl,
  server: {
    host: true,
  },
  base: rootDir,
  outDir: `./dist`,
  integrations: [
    // sitemap(), // TODO: 完全版公開時は復活させる
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'assets/js/entry.[hash].js',
          chunkFileNames: 'assets/js/chunk.[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
              return 'assets/images/[name].[hash].[ext]'
            }
            if (/\.(mp4|webm)$/.test(name ?? '')) {
              return 'assets/movie/[name].[hash][ext]'
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/style.[hash].[ext]'
            }
            return 'assets/[name].[hash].[ext]'
          },
        },
      },
    },
    define: generateEnv({
      rootDir,
      rootDirAssets,
      siteTitle,
      ogImage,
      ogImageWidth,
      ogImageHeight,
      GA_ID,
      GTM_ID,
      breakpoint,
      enableMinify,
      enablePolyfill,
      enableWebP,
      enableMinFontSize,
      enableAutoSendGaView,
      enableEventTick,
      enableEventWindow,
      enableEventScroll,
      enableEventMouse,
      enableSmoothScroll,
      enableEventAsynchronousTransition,
      enableEventLoading,
      enableEventPace,
      importLibraryThree,
      importLibraryThreePostProcessing,
      enableStats,
      enablePane,
      isShowPane,
      isOpenPane,
      baseUrl,
      isCms,
      isPhp,
      idPerfectPixel,
    }),
    resolve: {
      alias: {
        '~css/': 'src/css/',
        '@css/': 'src/css/',
        '~img/': 'src/images/',
        '@img/': 'src/images/',
        'three/addons/': 'node_modules/three/examples/jsm/',
      },
    },
    optimizeDeps: { exclude: ['fsevents'] },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        sass: {
          // path to your sass variables
          additionalData: `
            $rootDirAssets: ''
            $rootDir: ''
          `,
        },
      },
    },
    plugins: [
      glsl({
        root: '/src/js/glsl/',
      }),
    ],
  },
  compressHTML: enableMinifyHtml,
})
