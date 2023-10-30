import { isMobile } from '~/js/utils/navigator'
import { debounce } from '~/js/utils/event'
import { emitScroll } from './scroll'
import store from '~/js/managers/store'
import media from '~/js/utils/media'
import {
  isIpad,
  isIosChrome,
  isIos,
  isAndroid,
  isSafari,
} from '~/js/utils/navigator'

export type WindowSize = { windowWidth: number; windowHeight: number }
export type ResizeNativeArg = WindowSize & { isForce?: boolean }
export type ListenerResize = (arg: ResizeNativeArg) => void
export type ListenerOrientationchange = (isHorizontal: boolean) => void

//
// 変数
//

const listenersResize = (window._GLOBAL_.listenersResize =
  window._GLOBAL_.listenersResize || [])

const listenersResizeAlways = (window._GLOBAL_.listenersResizeAlways =
  window._GLOBAL_.listenersResizeAlways || [])

const listenersResetSize = (window._GLOBAL_.listenersResetSize =
  window._GLOBAL_.listenersResetSize || [])

const listenersOrientationchange = (window._GLOBAL_.listenersOrientationchange =
  window._GLOBAL_.listenersOrientationchange || [])

//
// main
//

export function init() {
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      emitResize()
    })
  })

  window.addEventListener('orientationchange', () => {
    const isHorizontal = window.orientation !== 0
    for (let i = 0; i < listenersOrientationchange.length; i++) {
      listenersOrientationchange[i](isHorizontal)
    }
  })
}

export function onResize(listener: ListenerResize, isExecute = false) {
  if (isExecute) {
    requestAnimationFrame(() => {
      const windowSize = getWindowSize()
      listener({ ...windowSize, isForce: false })
    })
  }
  listenersResize.push(listener)
}

export function offResize(listener: ListenerResize) {
  listenersResize.some((value, i) => {
    if (value === listener) {
      listenersResize.splice(i, 1)
      return true
    }
    return false
  })
}

export function onResizeAlways(listener: ListenerResize, isExecute = false) {
  if (isExecute) {
    requestAnimationFrame(() => {
      const windowSize = getWindowSize()
      listener({ ...windowSize, isForce: false })
    })
  }
  listenersResizeAlways.push(listener)
}

export function offResizeAlways(listener: ListenerResize) {
  listenersResizeAlways.some((value, i) => {
    if (value === listener) {
      listenersResizeAlways.splice(i, 1)
      return true
    }
    return false
  })
}

export function onResetSize(listener: ListenerResize, isExecute = false) {
  if (isExecute) {
    requestAnimationFrame(() => {
      const windowSize = getWindowSize()
      listener({ ...windowSize, isForce: false })
    })
  }
  listenersResetSize.push(listener)
}

export function offResetSize(listener: ListenerResize) {
  listenersResetSize.some((value, i) => {
    if (value === listener) {
      listenersResetSize.splice(i, 1)
      return true
    }
    return false
  })
}

export function onOrientationchange(
  listener: ListenerOrientationchange,
  isExecute = false,
) {
  if (isExecute) {
    requestAnimationFrame(() => {
      const isHorizontal = window.orientation !== 0
      listener(isHorizontal)
    })
  }
  listenersOrientationchange.push(listener)
}

export function offOrientationchange(listener: ListenerOrientationchange) {
  listenersOrientationchange.some((value, i) => {
    if (value === listener) {
      listenersOrientationchange.splice(i, 1)
      return true
    }
    return false
  })
}

export const emitResize = debounce((isForce = false) => {
  const { windowWidth, windowHeight } = getWindowSize()
  const args = { windowWidth, windowHeight, isForce }

  getStatusBarHeight()
  // 必要に応じて有効にする
  // getVh()

  for (let i = 0; i < listenersResizeAlways.length; i++) {
    listenersResizeAlways[i](args)
  }

  // モバイル端末でアドレスバーの高低切り替わり時はリサイズ処理しない
  if (!isForce && isMobile && store.windowWidth === windowWidth) return
  store.windowWidth = windowWidth

  // 必要に応じて有効にする
  getVh()

  for (let i = 0; i < listenersResetSize.length; i++) {
    listenersResetSize[i](args)
  }
  for (let i = 0; i < listenersResize.length; i++) {
    listenersResize[i](args)
  }

  emitScroll()
}, 100)

export function getWindowSize() {
  const windowWidth = (store.windowWidth = window.innerWidth)
  const windowHeight = (store.windowHeight = window.innerHeight)
  return { windowWidth, windowHeight }
}

export function getStatusBarHeight() {
  let statusBarHeight = 0
  if (media.isSp) {
    if (isIosChrome) {
      statusBarHeight = 68
    } else if (isIos && isSafari) {
      const { width, height } = window.screen
      // デバイスの縦横比で2種類を出しわけ
      if (width / height > 0.5) {
        // iPhone SE,6,6s,7・8,8plus
        statusBarHeight = 42
      } else {
        // iPhone X,XS,11,11Pro,11ProMax,XR,12,13,12・13Pro,13ProMax
        statusBarHeight = 100
      }
    } else if (isAndroid) {
      statusBarHeight = 72
    } else {
      statusBarHeight = 100
    }
  } else if (isIpad && isSafari) {
    statusBarHeight = 39
  }
  store.statusBarHeight = statusBarHeight
  document.documentElement.style.setProperty('--sbh', statusBarHeight + 'px')
}

export function getVh() {
  let vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}
