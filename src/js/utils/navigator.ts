//
// ブラウザ、OS判定
//

const _ua = navigator.userAgent
const _platform = navigator.platform

/**
 * window.performance.navigation.type の値<br>
 * リンクのクリックにより開始されたナビゲーション、ユーザーエージェントのアドレスバーへの URL 入力、フォーム送信、または下記の TYPE_RELOAD および TYPE_BACK_FORWARD の使用によるもの以外のスクリプト操作を通した初期化。
 * @see https://developer.mozilla.org/ja/docs/Web/API/PerformanceNavigation
 * @type {number}
 */
export const TYPE_NAVIGATE = 0
/**
 * window.performance.navigation.type の値<br>
 * 再読み込み
 * @see https://developer.mozilla.org/ja/docs/Web/API/PerformanceNavigation
 * @type {number}
 */
export const TYPE_RELOAD = 1
/**
 * window.performance.navigation.type の値<br>
 * 戻る・進む
 * @see https://developer.mozilla.org/ja/docs/Web/API/PerformanceNavigation
 * @type {number}
 */
export const TYPE_BACK_FORWARD = 2

/**
 * window.performance.navigation.typeの結果を英語名で取得
 * @return {'reload'|'backForward'|'default'}
 */
export function getNavigationType() {
  switch (window.performance.navigation.type) {
    case TYPE_RELOAD:
      return 'reload'
    case TYPE_BACK_FORWARD:
      return 'backForward'
    case TYPE_NAVIGATE:
    default:
      return 'default'
  }
}

/**
 * Edge かどうか
 * @type {boolean}
 */
export const isEdge = /Edg/.test(_ua)

/**
 * Chrome かどうか
 * @type {boolean}
 */
export const isChrome = /Chrome/.test(_ua)

/**
 * iOS Chrome かどうか
 * @type {boolean}
 */
export const isIosChrome = /CriOS/.test(_ua)

/**
 * Safari かどうか
 * @type {boolean}
 */
export const isSafari = !isEdge && !isChrome ? /Safari/.test(_ua) : false

/**
 * Windows かどうか
 * @type {boolean}
 */
export const isWindows = /Win/.test(_platform)

/**
 * iPad かどうか
 * @type {boolean}
 */
export const isIpad =
  /iPad/.test(_ua) || (/Macintosh/.test(_ua) && 'ontouchend' in document)

/**
 * iOS 端末かどうか
 * @see https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
 * @type {boolean}
 */
export const isIos = /iPhone|iPod/.test(_ua) || isIpad

/**
 * iOS メジャーバージョンを取得
 * @return {number} iOS のメジャーバージョン
 */
export function getIosVersion() {
  const appVersion = navigator.appVersion
  const match = appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/)

  if (!match) return null

  return parseInt(match[1], 10)
}

/**
 * Android 端末かどうか
 * @type {boolean}
 */
export const isAndroid = /Android/i.test(_ua)

/**
 * Android メジャーバージョンを取得
 * @return {?number} Android のメジャーバージョン
 */
export function getAndroidVersion() {
  const match = _ua.match(/Android\s([0-9.]*)/i)

  if (!match) return null

  return parseInt(match[1], 10)
}

/**
 * モバイル端末かどうか
 * @type {boolean}
 */
export const isMobile = isIos || isAndroid

/**
 * タッチデバイスかどうか
 * @type {boolean}
 */
export const isTouch =
  'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0

/**
 * タブレット端末かどうか
 * @type {boolean}
 */
export const isTablet = isIpad || (isAndroid && !_ua.match(/Android.+Mobile/))
