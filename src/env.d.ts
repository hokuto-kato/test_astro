/// <reference types="@astrojs/image/client" />
/// <reference types="vite-plugin-glsl/ext" />

/* astro.config.mjsのvite.defineで追加する独自変数の定義 */
declare const _ENV_: {
  rootDir: string
  rootDirAssets: string
  siteTitle: string
  ogImage: string
  ogImageWidth: number
  ogImageHeight: number
  GA_ID: string
  GTM_ID: string
  breakpoint: number
  enableMinify: boolean
  enablePolyfill: boolean
  enableWebP: boolean
  enableMinFontSize: boolean
  enableAutoSendGaView: boolean
  enableEventTick: boolean
  enableEventWindow: boolean
  enableEventScroll: boolean
  enableEventMouse: boolean
  enableSmoothScroll: boolean
  enableEventAsynchronousTransition: boolean
  enableEventLoading: boolean
  enableEventPace: boolean
  importLibraryThree: boolean
  importLibraryThreePostProcessing: boolean
  enableStats: boolean
  enablePane: boolean
  isShowPane: boolean
  isOpenPane: boolean
  baseUrl: string
  isCms: boolean
  isPhp: boolean
  idPerfectPixel: string
}
