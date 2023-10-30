/* ----------------------------------------
  DOM 操作
---------------------------------------- */
import store from '~/js/managers/store'
import media from '~/js/utils/media'
import { isMobile } from '~/js/utils/navigator'
import { onLoadImage } from './event'

/**
 * NodeList を配列に変換する
 *
 * @private
 * @param {NodeList} nodeList NodeList
 * @return {Array} 配列
 */
function _toArray(nodeList) {
  return nodeList ? Array.prototype.slice.call(nodeList, 0) : []
}

/**
 * IE でも forEach や map が使える element の配列を取得する
 *
 * @param {string|NodeList|Element|Element[]} target - カンマで区切られたひとつ以上の CSS セレクタグループ文字列 (querySelectorAll の引数と同じ)
 * @param {Element} context - この element の中の要素だけを対象とする
 * @return {Element[]} `target` にマッチした element の配列
 */
export function getElements(target, context = document) {
  if (typeof target === 'string') {
    // セレクタ文字列
    const nodeList = context.querySelectorAll(target)
    return _toArray(nodeList)
  } else if (target.length >= 0) {
    if (target.map) {
      // array
      return target
    } else {
      // NodeList
      return _toArray(target)
    }
  } else {
    // Element
    return [target]
  }
}

/**
 * その要素がセレクタにマッチするかどうか
 *
 * @param {Element} el 要素
 * @param {string} selector セレクタ
 * @returns {boolean} マッチするかどうか
 */
export function isMatches(el, selector) {
  return el.matches ? el.matches(selector) : el.msMatchesSelector(selector)
}

/**
 * その要素および先祖要素がセレクタにマッチしていればマッチした要素を返す
 *
 * @param {Element} el 要素
 * @param {string} selector セレクタ
 * @returns {Element} マッチした要素（マッチしなければ null）
 */
export function matchesAncestor(el, selector) {
  if (isMatches(el, selector)) {
    return el
  } else {
    const parent = el.parentElement
    if (parent) {
      return matchesAncestor(parent, selector)
    } else {
      return null
    }
  }
}

const cacheLoadImage = (window._GLOBAL_.cacheLoadImage =
  window._GLOBAL_.cacheLoadImage || {})

/**
 * 画像を読み込む
 *
 * @export
 * @param {string|string[]} src 画像パスの文字列
 * @param {boolean} isCrossOrigin クロスドメインかどうか
 * @returns {Promise} 読み込んだ画像を img タグ（src引数が配列の場合は配列）として返す Promise
 */
export function loadImage(src, isCrossOrigin = false) {
  const isArray = typeof src === 'object' && src.constructor.name === 'Array'
  const promises = []
  ;(isArray ? src : [src]).forEach((srcString) => {
    const cache = cacheLoadImage[srcString]
    if (cache) {
      promises.push(Promise.resolve(cache))
      return
    }
    const img = document.createElement('img')
    if (isCrossOrigin) img.crossOrigin = 'anonymous'
    img.src = srcString
    const promiseLoad = onLoadImage(img)
    promiseLoad.then(() => {
      cacheLoadImage[srcString] = img
    })
    promises.push(promiseLoad)
  })
  return isArray ? Promise.all(promises) : promises[0]
}

/**
 * スクロール対象のルート要素を取得
 *
 * @export
 * @returns {Element} スクロール対象のルート要素
 */
export function getScrollingElement() {
  return document.scrollingElement || document.documentElement
}

/**
 * ブラウザのスクロールバーの幅を取得
 *
 * @export
 * @returns {number} ブラウザのスクロールバーの幅
 */
export function getScrollBarWidth() {
  return getSafeWindowWidth() - getScrollingElement().offsetWidth
}

/**
 * ページ一番上からの要素の縦位置
 *
 * @export
 * @param {Element} el 対象要素
 * @returns ページ一番上からの要素の縦位置
 */
export function getAbsoluteTop(el) {
  let top = 0
  let elCurrent = el
  do {
    top += elCurrent.offsetTop
    elCurrent = elCurrent.offsetParent
  } while (elCurrent)
  return top
}

/**
 * getComputedStyleの値を数値で取得
 *
 * @export
 * @param {Element} el 対象要素
 * @param {String} property CSSプロパティ名
 * @returns {number}
 */
export function getComputedStyle(el, property) {
  if (!el) {
    return {
      x: 0,
      y: 0,
      z: 0,
    }
  }

  return getComputedStyleNumber(
    document.defaultView.getComputedStyle(el, null),
    property,
  )
}

/**
 * getComputedStyleの値を数値に変換
 *
 * @export
 * @param {String} computedStyle getComputedStyleの値
 * @param {String} property CSSプロパティ名
 * @returns {number}
 */
export function getComputedStyleNumber(computedStyle, property) {
  return Number(computedStyle[property].replace('px', ''))
}

/**
 * getComputedStyleのtranslate値を数値に変換
 *
 * @export
 * @param {Element} el 対象要素
 */
export function getComputedTransform(el) {
  if (!el) {
    return {
      x: 0,
      y: 0,
      z: 0,
    }
  }

  const matrix = new window.WebKitCSSMatrix(
    document.defaultView.getComputedStyle(el, null).transform,
  )
  return {
    x: matrix.m41,
    y: matrix.m42,
    z: matrix.m43,
  }
}

/**
 * window.innerWidthの値を取得（Androidで稀に大きくなりすぎることがあるので、その場合はwindow.outerWidthの値を取得）
 *
 * @export
 * @returns {number}
 */
export function getSafeWindowWidth() {
  return isMobile
    ? Math.min(window.innerWidth, window.outerWidth)
    : window.innerWidth
}

/**
 * window.innerHeightの値を取得（Androidで稀に大きくなりすぎることがあるので、その場合はwindow.outerHeightの値を取得）
 *
 * @export
 * @returns {number}
 */
export function getSafeWindowHeight() {
  return isMobile
    ? Math.min(window.innerHeight, window.outerHeight)
    : window.innerHeight
}

export function waitSafeWindowWidth() {
  return new Promise((resolve) => {
    if (isMobile && window.innerWidth > window.outerWidth) {
      requestAnimationFrame(waitSafeWindowWidth)
    } else {
      resolve(true)
    }
  })
}

/**
 * デザイン幅を基準としたウィンドウ幅に対する可変サイズ取得
 *
 * @export
 * @param {number} size デザイン上のサイズ
 * @returns {number}
 */
export function getVariableSize(size = 1) {
  const width = media.isSp ? store.designWidthSp : store.designWidthPc
  const height = media.isSp ? store.designHeightSp : store.designHeightPc
  const safeSize = store.isHorizontalScroll
    ? getSafeWindowHeight()
    : getSafeWindowWidth()
  const baseDesignSize = store.isHorizontalScroll ? height : width
  return (size * safeSize) / baseDesignSize
}

export function setVariableSizeRate() {
  store.variableSizeRate = getVariableSize()
  document.documentElement.style.setProperty(
    '--variable-size-rate',
    `${store.variableSizeRate}`,
  )
}

export function getVariableSizeTb(size = 1) {
  return (
    (size * getSafeWindowWidth()) /
    (media.isSp
      ? store.designWidthSp
      : media.isTb
      ? store.breakpoint
      : store.designWidthPc)
  )
}

export function getVariableSizeTbPortrait(size = 1) {
  return (
    (size * getSafeWindowWidth()) /
    (media.isSp
      ? store.designWidthSp
      : media.isTbPortrait
      ? store.breakpoint
      : store.designWidthPc)
  )
}

/**
 * デザイン高さを基準としたウィンドウ高さに対する可変サイズ取得
 *
 * @export
 * @param {number} size デザイン上のサイズ
 * @returns {number}
 */
export function getVariableSizeHeight(size = 1) {
  return (
    (size * getSafeWindowHeight()) /
    (media.isSp ? store.designHeightSp : store.designHeightPc)
  )
}

/**
 * デザイン幅を基準としたウィンドウ幅に対する可変サイズ取得（rem単位）
 *
 * @export
 * @param {number} size デザイン上のサイズ
 * @returns {string}
 */
export function getVariableSizeRem(size = 1) {
  return `${size / 16}rem`
}

/**
 * matrix3dのtransform値を取得
 *
 * @export
 * @param {number} x X座標
 * @param {number} y Y座標
 * @param {number} [scale=1] scale
 * @returns {String}
 */
export function getTransformMatrix3d(x, y, scale = 1) {
  return `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,${x},${y},0,${1 / scale})`
}

export function getPreloadImagePath(context = document) {
  const preloadList = [
    ...context.querySelectorAll(
      `link[rel="preload"][as="image"]${
        media.isSp ? ':not([data-preload-pc])' : ':not([data-preload-sp])'
      }`,
    ),
  ]
  return preloadList.map((preload) => preload.href)
}

export function promisePreloadImage(context = document) {
  return loadImage(getPreloadImagePath(context))
}

export function cloneScript(element) {
  const script = document.createElement('script')
  const attrs = element.attributes
  for (let i = 0, len = attrs.length; i < len; i++) {
    const attr = attrs[i]
    script.setAttribute(attr.name, attr.value)
  }
  script.innerHTML = element.innerHTML
  return script
}
