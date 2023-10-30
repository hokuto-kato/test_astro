import Lenis from '@studio-freight/lenis'
// import Lenis from '~js/vendors/lenis/src'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import passive from '~/js/utils/passive'
import store from '~/js/managers/store'
import media from '~/js/utils/media'
import eventBus from '~/js/events/eventBus'
import { allowScroll, preventScroll } from '~/js/utils/scroll'
import { debounce } from '~/js/utils/event'
import { getWindowSize, type WindowSize } from '~/js/events/window'
import { getNavigationType, isMobile } from '~/js/utils/navigator'

type LenisScrollToOptions = {
  offset?: number
  immediate?: boolean
  lock?: boolean
  duration?: number
  easing?: (t: number) => number
  lerp?: number
  onComplete?: any
  force?: boolean
  programmatic?: boolean
}

export type MyScrollToOptions = LenisScrollToOptions & {
  disableOffset?: boolean
}

type ListenerResize = (windowSize: WindowSize) => void
type ListenerScroll = (lenis: Lenis) => void

export type ArgumentVirtualScroll = {
  type: 'wheel' | 'touch'
  deltaX: number
  deltaY: number
  event: MouseEvent | Event
}
export type ListenerVirtualScroll = (arg: ArgumentVirtualScroll) => void

//
// パラメーター
//

const param = {
  smoothWheel: _ENV_.enableSmoothScroll,
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
  wheelMultiplier: 1,
  touchMultiplier: 2,
  ease: [0.25, 0.0, 0.35, 1.0],
  durationScrollTo: 1,
}

//
// main
//

// GSAP 3のscrollToを有効化
gsap.registerPlugin(ScrollToPlugin)

export default class ScrollLenis {
  static isPermanent = true
  isPermanent = true
  el: HTMLElement
  _scroll: Lenis
  scrollYSmoothOwn = 0
  isHorizontal = false
  isSmooth = false
  _isMousemove = false
  _callbackScroll: Function
  listenersResizeSelf: ListenerResize[] = []
  listenersVirtualScroll: ListenerVirtualScroll[] = []
  _callbackListCall = []
  _isInitVirtualScroll = false
  _onTick: ScrollLenis['onTick']
  _onLeave: ScrollLenis['onLeave']
  _onDestroy: ScrollLenis['onDestroy']
  handleResize: (...args: any[]) => void

  constructor(el: HTMLElement = document.body) {
    const { smoothWheel, duration, easing, wheelMultiplier, touchMultiplier } =
      param

    this.el = el
    this.isPermanent = (this.constructor as Function & ScrollLenis).isPermanent
    this._onTick = this.onTick.bind(this)
    this._onLeave = this.onLeave.bind(this)
    this._onDestroy = this.onDestroy.bind(this)

    const orientation =
      (this.el.dataset.scrollDirection as 'vertical' | 'horizontal') ||
      'vertical'
    this.isHorizontal = orientation === 'horizontal'
    const gestureOrientation = this.isHorizontal ? 'both' : 'vertical'

    this._scroll =
      new Lenis({
        duration,
        easing,
        orientation, // vertical, horizontal
        gestureOrientation, // vertical, horizontal, both
        smoothWheel,
        wheelMultiplier,
        smoothTouch: false,
        touchMultiplier,
        infinite: false,
      }) || null

    this._updateIsSmooth()

    this._addEventListener()

    // 初期読み込み時に前回のスクロール位置復元
    if (_ENV_.enableEventAsynchronousTransition) {
      if (getNavigationType() !== 'default') {
        if (store.isInitializedAsynchronousTransition) {
          this.scrollToPrevPagePosition()
        } else {
          eventBus.once('initializedAsynchronousTransition', () => {
            this.scrollToPrevPagePosition()
          })
        }
      }
    }

    this.handleResize = debounce(() => {
      if (store.isOpenModal) return // モーダルを開いているときはリサイズ処理しない
      this.updateResize()
    })

    eventBus.emit('initCScroll')

    gsap.ticker.add(this._onTick)
  }

  scrollTo(target: any = 0, options: MyScrollToOptions) {
    if (!this._scroll) return

    store.isScrollAnimating = true

    const {
      immediate = false,
      disableOffset = false,
      onComplete,
    } = options || {}
    options.offset = disableOffset ? 0 : this._getOffsetY()
    options.duration = immediate
      ? undefined
      : 'duration' in options
      ? options.duration
      : param.durationScrollTo
    options.easing = immediate
      ? undefined
      : 'easing' in options
      ? options.easing
      : param.easing

    return new Promise<void>((resolve) => {
      options.onComplete = () => {
        store.isScrollAnimating = false
        this.scrollYSmoothOwn = store.scrollY = this._scroll!.scroll
        // console.log('onComplete', onComplete)
        if (onComplete) {
          onComplete?.()
        }
        resolve()
      }

      this._scroll.scrollTo(target, options)
    })
  }

  scrollToId(id: string, option: MyScrollToOptions) {
    const target = id === 'top' ? 0 : `#${id}`
    return this.scrollTo(target, option)
  }

  scrollToImmediate(target: any, option: MyScrollToOptions = {}) {
    option.immediate = true
    return this.scrollTo(target, option)
  }

  scrollToAnchor(option: MyScrollToOptions) {
    if (location.hash) {
      const id = location.hash.slice(1, location.hash.length)
      const target = document.getElementById(id)
      return this.scrollTo(target || 0, option)
    } else {
      // スクロール位置をページ一番上にする
      return this.scrollTo(0, option)
    }
  }

  scrollToPrevPagePosition(option: { disableOffset?: boolean } = {}) {
    option.disableOffset = true
    return this.scrollToImmediate(this.getStorageScrollY(), option)
  }

  onAnimateScroll(listener: ListenerScroll) {
    this._scroll.on('scroll', listener)
    eventBus.on('updateScroll', listener)
  }

  offAnimateScroll(listener: ListenerScroll) {
    this._scroll.off('scroll', listener)
    eventBus.off('updateScroll', listener)
  }

  _initVirtualScroll() {
    if (this._isInitVirtualScroll) return
    this._isInitVirtualScroll = true

    this._scroll.virtualScroll.on('scroll', (arg: ArgumentVirtualScroll) => {
      for (let i = 0; i < this.listenersVirtualScroll.length; i = (i + 1) | 0) {
        this.listenersVirtualScroll[i](arg)
      }
    })
  }

  onVirtualScroll(listener: ListenerVirtualScroll) {
    if (!this._isInitVirtualScroll) {
      this._initVirtualScroll()
    }

    this.listenersVirtualScroll.push(listener)
  }

  onceVirtualScroll(listener: ListenerVirtualScroll) {
    const _listener: ListenerVirtualScroll = (arg) => {
      this.offVirtualScroll(_listener)
      listener(arg)
    }
    this.onVirtualScroll(_listener)
  }

  offVirtualScroll(listener: ListenerVirtualScroll) {
    this.listenersVirtualScroll.some((value, i) => {
      if (value === listener) {
        this.listenersVirtualScroll.splice(i, 1)
        return true
      }
      return false
    })
  }

  start() {
    if (!this._scroll) return

    this._scroll.start()
    allowScroll()
  }

  stop() {
    if (!this._scroll) return

    this._scroll.stop()
    preventScroll()
  }

  enable() {
    if (!this._scroll) return

    gsap.ticker.add(this._onTick)
    this.start()
  }

  disable() {
    if (!this._scroll) return

    this.stop()
    gsap.ticker.remove(this._onTick)
  }

  update() {
    if (!this._scroll) return

    this._scroll.emit()
    this.handleResize()
  }

  _updateIsSmooth() {
    if (!this._scroll) return

    this.isSmooth = this._scroll.isSmooth
    document.documentElement.classList[this.isSmooth ? 'remove' : 'add'](
      'sDisableSmoothScroll'
    )
  }

  onResize(listener: ListenerResize) {
    this.listenersResizeSelf.push(listener)
  }

  onceResize(listener: ListenerResize) {
    const _listener: ListenerResize = (windowSize) => {
      this.offResize(_listener)
      listener(windowSize)
    }
    this.onResize(_listener)
  }

  offResize(listener: ListenerResize) {
    this.listenersResizeSelf.some((value, i) => {
      if (value === listener) {
        this.listenersResizeSelf.splice(i, 1)
        return true
      }
      return false
    })
  }

  setResizeObserver() {
    const { el } = this
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === el) {
          this.handleResize()
        }
      }
    })
    resizeObserver.observe(el)
  }

  updateResize() {
    const windowSize = getWindowSize()
    for (let i = 0; i < this.listenersResizeSelf.length; i = (i + 1) | 0) {
      this.listenersResizeSelf[i](windowSize)
    }
    eventBus.emit('updateScroll', this._scroll)
  }

  _getOffsetY() {
    const elFixed = document.querySelector(
      `[data-anchor-offset="${media.isSp ? 'sp' : 'pc'}"]`
    )
    return elFixed ? -elFixed.getBoundingClientRect().bottom : 0
  }

  onMousemove() {
    this._isMousemove = true
  }

  onMouseleave() {
    this._isMousemove = false
  }

  _addEventListener() {
    this._callbackScroll = (data: Lenis) => {
      this.scrollYSmoothOwn = store.scrollY = data.scroll
      if (isMobile && this._isMousemove) {
        store.scrollDirection = data.direction as 0 | 1 | -1
      }

      // スムーススクロール無効時もパララックスが動くようにする (data-scroll-speed-native)
      // if (!this.isSmooth) {
      //   const keys = Object.keys(obj.currentElements);
      //   for (let i = 0; i < keys.length; i++) {
      //     const { el, progress } = obj.currentElements[keys[i]];
      //     if ('scrollSpeedNative' in el.dataset) {
      //       el.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,${-(
      //         progress *
      //         Number(el.dataset.scrollSpeedNative || el.dataset.scrollSpeed) *
      //         40
      //       )},0,1)`;
      //     }
      //   }
      // }
    }
    this._scroll!.on('scroll', this._callbackScroll)

    // 遷移前にスクロール位置を保存
    window.addEventListener('pagehide', () => {
      this.setStorageScrollY()
    })

    eventBus.on('leave', this._onLeave)
    if (!this.isPermanent) {
      eventBus.on('destroyCompletely', this._onDestroy)
    }

    // NOTE: IE等慣性スクロール無効かつ横スクロール時にマウスホイール縦操作でもスクロールできるようにする
    if (!this.isSmooth && this.isHorizontal) {
      this.el.addEventListener(
        'wheel',
        ({ deltaY }) => {
          this.el.scrollBy(deltaY, 0)
        },
        passive
      )
    }
  }

  setStorageScrollY(historyCount = store.historyCount) {
    const historyScrollPosition = JSON.parse(
      sessionStorage.getItem('historyScrollPosition') || '{}'
    )
    historyScrollPosition[historyCount] = this.scrollYSmoothOwn
    sessionStorage.setItem(
      'historyScrollPosition',
      JSON.stringify(historyScrollPosition)
    )
  }

  getStorageScrollY() {
    const historyScrollPosition = JSON.parse(
      sessionStorage.getItem('historyScrollPosition') || '{}'
    )
    return (
      Number(historyScrollPosition[store.historyCount]) || location.hash || 0
    )
  }

  get limit() {
    return this._scroll?.limit
  }

  checkScroll() {
    this._scroll!.scroll.checkScroll(true)
  }

  onTick(time: number) {
    this._scroll!.raf(time * 1000)
  }

  onLeave() {
    this.setStorageScrollY(store.prevHistoryCount)
  }

  onDestroy() {
    this._scroll!.off('scroll', this._callbackScroll)
    this._scroll!.destroy()
  }
}
