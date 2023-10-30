/**
 * event の起きた点の、クライアント内での X, Y 座標を取得する
 * @param {Event} e - event object
 * @return {{x: number, y: number}}
 */
export function getClientPos(e) {
  const eObj = e.changedTouches ? e.changedTouches[0] : e

  return {
    x: eObj.clientX,
    y: eObj.clientY,
  }
}

/**
 * event の起きた点の、offset X, Y 座標を取得する
 * @param {Event} e - event object
 * @return {{x: number, y: number}}
 */
export function getOffsetPos(e) {
  const eObj = e.changedTouches ? e.changedTouches[0] : e

  return {
    x: eObj.offsetX,
    y: eObj.offsetY,
  }
}

/**
 * event の起きた点の、page X, Y 座標を取得する
 * @param {Event} e - event object
 * @return {{x: number, y: number}}
 */
export function getPagePos(e) {
  const eObj = e.changedTouches ? e.changedTouches[0] : e

  return {
    x: eObj.pageX,
    y: eObj.pageY,
  }
}

/**
 * throttle
 * コールバック発火を一定間隔で間引く（初回も発火する）
 * @param {Function} fn - コールバック
 * @param {number} [delay=200] - 間引く時間(ms)
 * @returns {Function} イベントハンドラーに登録する関数
 */
export function throttle(fn, delay = 200) {
  let timerId
  let lastExecTime = 0
  return function () {
    const elapsedTime = performance.now() - lastExecTime
    const execute = () => {
      fn.apply(this, arguments)
      lastExecTime = performance.now()
    }
    if (!timerId) {
      execute()
    }
    if (timerId) {
      clearTimeout(timerId)
    }
    if (elapsedTime > delay) {
      execute()
    } else {
      timerId = setTimeout(execute, delay)
    }
  }
}

/**
 * debounce
 * コールバックが指定時間内に何度発生しても最後の1回だけ実行する（初回は発火しない）
 * @param {Function} fn - コールバック
 * @param {number} [delay=200] - 間引く時間(ms)
 * @returns {Function} イベントハンドラーに登録する関数
 */
export function debounce(fn, delay = 200) {
  let timerId
  return function (...args: any[]) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * DOM 解析完了時のイベントハンドラ登録（既に完了している場合は即実行）
 *
 * @param {function} fn イベントハンドラ
 */
export function onReady(fn) {
  if (
    document.readyState === 'interactive' ||
    document.readyState === 'complete'
  ) {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

/**
 * 画像読み込み完了時のイベントハンドラ登録（既に完了している場合は即実行）
 *
 * @param {function} fn イベントハンドラ
 */
export function onLoad(fn) {
  if (document.readyState === 'complete') {
    fn()
  } else {
    window.addEventListener('load', fn)
  }
}

/**
 * 画像要素の読み込み完了時のイベントハンドラ登録（既に完了している場合は即実行）
 *
 * @param {HTMLImageElement} el 対象要素
 * @param {function} fn イベントハンドラ
 */
export function onLoadImage(el) {
  return new Promise((resolve) => {
    if (el.complete) {
      resolve(el)
    } else {
      el.addEventListener('load', () => {
        resolve(el)
      })
    }
  })
}

/**
 * メディア要素の読み込み完了時のイベントハンドラ登録（既に完了している場合は即実行）
 *
 * @param {HTMLMediaElement} el 対象要素
 * @param {function} fn イベントハンドラ
 */
export function onLoadMedia(el) {
  return new Promise((resolve) => {
    if (el.readyState === 4) {
      resolve({
        srcElement: el,
        target: el,
      })
    } else {
      el.addEventListener('loadeddata', resolve)
    }
  })
}
