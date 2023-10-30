import { gsap } from 'gsap'
import {
  onResize,
  offResize,
  onResetSize,
  offResetSize,
  onResizeAlways,
  offResizeAlways,
  onOrientationchange,
  offOrientationchange,
  emitResize,
  getWindowSize,
  type WindowSize,
  type ResizeNativeArg,
} from '~/js/events/window'
import {
  type ListenerMouseDocument,
  offMousedown,
  offMousemove,
  offMouseup,
  onMousedown,
  onMousemove,
  onMouseup,
} from '~/js/events/mouse'
import {
  addMouseenterListener,
  addMousemoveListener,
  addMouseleaveListener,
  removeMouseenterListener,
  removeMousemoveListener,
  removeMouseleaveListener,
  type ListenerMouse,
} from '~/js/utils/mouse'
import {
  onLoadProgress,
  offLoadProgress,
  onLoadDone,
  offLoadDone,
} from '~/js/events/load'
import { offScroll, onScroll } from '~/js/events/scroll'
import media from '~/js/utils/media'
import store from '~/js/managers/store'
import {
  addComponent,
  addPermanentComponent,
  initComponentsOnMutation,
} from '~/js/managers/components'
import eventBus, { type EventBusListener } from '~/js/events/eventBus'
import passive from '~/js/utils/passive'
import type {
  AddOptions,
  AddReturnObject,
} from '~/js/utils/minimizeIntersecting'
import type Lenis from '@studio-freight/lenis'
import type ScrollLenis from '~/js/scroll/ScrollLenis'
import type { ArgumentVirtualScroll } from '~/js/scroll/ScrollLenis'
import {
  Gesture,
  type GestureCallbackArgument,
  type GestureOptions,
} from '~js/utils/gesture'

export type ComponentOptions = {
  el?: HTMLElement | SVGElement
  context?: Element
  isAutoPlayTick?: boolean
  isDisableAutoPlayScroll?: boolean
  isDisableAutoResize?: boolean
  isPermanent?: boolean
  isManual?: boolean
  isManualInit?: boolean
  isPage?: boolean
  cacheValue?: string
  intersectOptions?: AddOptions['param']
  intersectOnce?: AddOptions['once']
  gestureOptions?: GestureOptions
}

class Component {
  static isPermanent: boolean
  static isLocal: boolean
  static isManual: boolean
  static isManualInit: boolean
  static isPage: boolean
  static isAutoPlayTick: boolean
  static isDisableAutoPlayScroll: boolean
  static isDisableAutoResize: boolean
  static componentName: string
  static selectorRoot: string
  static intersectOptions: AddOptions['param']
  static intersectOnce: AddOptions['once']
  static gestureOptions: GestureOptions
  el?: HTMLElement | SVGElement
  refs: Record<string, Element | Element[]> = {}
  isDisableAutoPlayScroll: boolean
  isDisableAutoResize: boolean
  isAutoPlayTick: boolean
  isPermanent: boolean
  cacheValue: string
  option: ComponentOptions
  isManual: boolean
  isManualInit: boolean
  isPage: boolean
  isPlayTick = false
  isPlayScroll = false
  isDestroyed = false
  listeners: Record<string, (args?: any) => void> = {}
  _intersectionObservers: AddReturnObject[] = []
  _pageId: string
  _onInit: () => void
  _destroy: (pageId: string) => void
  _destroyCompletely: (pageIdPrev: string) => void
  _onScrollNative: () => void
  _gesture: Gesture
  _initComponentsOnMutation: ReturnType<typeof initComponentsOnMutation>

  /**
   * Creates an instance of Component.
   * @param {Object} [option={}]
   * @param {Element} [option.el] コンポーネントのルート要素
   * @param {Element} [option.context=document] querySelectorの対象要素
   * @param {boolean} [option.isAutoPlayTick=false] onTickを自動実行するか
   * @param {boolean} [option.isDisableAutoPlayScroll=false] onScrollの自動実行を無効にするか
   * @param {boolean} [option.isPermanent=false] 非同期遷移しても存在し続ける要素かどうか
   * @memberof Component
   */
  constructor(option: ComponentOptions = {}) {
    const constructor = this.constructor as Function & Component
    const { componentName } = constructor
    let { selectorRoot } = constructor

    const {
      el,
      context = document,
      isAutoPlayTick = constructor.isAutoPlayTick || false,
      isDisableAutoPlayScroll = constructor.isDisableAutoPlayScroll || false,
      isDisableAutoResize = constructor.isDisableAutoResize || false,
      isPermanent = constructor.isPermanent || false,
      isManual = constructor.isManual || false,
      isManualInit = constructor.isManualInit || false,
      isPage = constructor.isPage || false,
      cacheValue = componentName || selectorRoot || constructor.name,
    } = option
    this.isDisableAutoPlayScroll = isDisableAutoPlayScroll
    this.isDisableAutoResize = isDisableAutoResize
    this.isAutoPlayTick = isAutoPlayTick
    this.isPermanent = isPermanent
    this.isManual = isManual
    this.isManualInit = isManualInit
    this.isPage = isPage
    this.cacheValue = cacheValue
    this.option = option

    if (!el) {
      if (!selectorRoot && componentName) {
        selectorRoot = `.${componentName}, [data-el="${componentName}"]`
      }
      this.el = context.querySelector(selectorRoot)
    } else {
      this.el = el
    }
    const scopeClass = this.el?.classList.value
      ?.match(/astro-\w+/g)
      ?.slice(-1)[0]

    if (this.el) {
      this.isManual = 'manual' in this.el.dataset || this.isManual
    }

    if (this.el && (componentName || scopeClass)) {
      const prefix = componentName && `${componentName}-`
      this.el
        .querySelectorAll<HTMLElement | SVGElement>(
          `${
            scopeClass ? `.${scopeClass}[data-ref], ` : ''
          }[data-ref][class*="${prefix}"], [data-ref^="${prefix}"]`
        )
        .forEach((elRef) => {
          let key =
            elRef.dataset?.ref ||
            [...elRef.classList].find((key) => key.startsWith(prefix)) ||
            elRef.classList[0]
          key = key.replace(prefix, '')

          const variableRef = this.refs[key]
          if (!variableRef) {
            this.refs[key] = elRef
          } else if (Array.isArray(variableRef)) {
            variableRef.push(elRef)
          } else if (variableRef) {
            this.refs[key] = [variableRef, elRef]
          }
        })
    }

    if (this.onMount) {
      this.onMount()
    }

    if (this.onResizeFirst) {
      this.onResizeFirst = this.onResizeFirst.bind(this)
      eventBus.on('resizeFirst', this.onResizeFirst)
    }
    if (this.onResetSize) {
      this.onResetSize = this.onResetSize.bind(this)
      onResetSize(this.onResetSize, true)
    }
    if (this.onResizeNative) {
      this.onResizeNative = this.onResizeNative.bind(this)
      onResize(this.onResizeNative, true)
    }
    if (this.onResizeAlways) {
      this.onResizeAlways = this.onResizeAlways.bind(this)
      onResizeAlways(this.onResizeAlways, true)
    }

    if (this.onOrientationchange) {
      this.onOrientationchange = this.onOrientationchange.bind(this)
      onOrientationchange(this.onOrientationchange, true)
    }

    if (this.onTick) {
      this.onTick = this.onTick.bind(this)

      if (this.isAutoPlayTick) {
        requestAnimationFrame(() => {
          this.playTick()
        })
      }
    }

    if (this.el) {
      const cache = store.componentCache.get(this.el)
      if (cache) {
        cache.push(cacheValue)
      } else {
        store.componentCache.set(this.el, [cacheValue])
      }

      if (this.onClick) {
        this.onClick = this.onClick.bind(this)
        this.el.addEventListener('click', this.onClick)
      }

      if (this.onMouseenter) {
        this.onMouseenter = addMouseenterListener(
          this.el,
          this.onMouseenter.bind(this)
        )
      }
      if (this.onMousemove) {
        this.onMousemove = addMousemoveListener(
          this.el,
          this.onMousemove.bind(this)
        )
      }
      if (this.onMouseleave) {
        this.onMouseleave = addMouseleaveListener(
          this.el,
          this.onMouseleave.bind(this)
        )
      }

      if (this.onGesture) {
        this.onGesture = this.onGesture.bind(this)
        this._gesture = new Gesture(
          this.el,
          this.onGesture,
          this.option.gestureOptions || constructor.gestureOptions
        )
      }
    }

    if (this.onMousedownDocument) {
      this.onMousedownDocument = this.onMousedownDocument.bind(this)
      onMousedown(this.onMousedownDocument)
    }
    if (this.onMousemoveDocument) {
      this.onMousemoveDocument = this.onMousemoveDocument.bind(this)
      onMousemove(this.onMousemoveDocument)
    }
    if (this.onMouseupDocument) {
      this.onMouseupDocument = this.onMouseupDocument.bind(this)
      onMouseup(this.onMouseupDocument)
    }

    if (this.onBeforeResetModalStyle) {
      this.onBeforeResetModalStyle = this.onBeforeResetModalStyle.bind(this)
      eventBus.on('beforeResetModalStyle', this.onBeforeResetModalStyle)
    }
    if (this.onOpenModal) {
      this.onOpenModal = this.onOpenModal.bind(this)
      eventBus.on('openModal', this.onOpenModal)
    }
    if (this.onStartOpenModal) {
      this.onStartOpenModal = this.onStartOpenModal.bind(this)
      eventBus.on('startOpenModal', this.onStartOpenModal)
    }
    if (this.onCompleteOpenModal) {
      this.onCompleteOpenModal = this.onCompleteOpenModal.bind(this)
      eventBus.on('completeOpenModal', this.onCompleteOpenModal)
    }
    if (this.onCloseModal) {
      this.onCloseModal = this.onCloseModal.bind(this)
      eventBus.on('closeModal', this.onCloseModal)
    }
    if (this.onStartCloseModal) {
      this.onStartCloseModal = this.onStartCloseModal.bind(this)
      eventBus.on('startCloseModal', this.onStartCloseModal)
    }
    if (this.onCompleteCloseModal) {
      this.onCompleteCloseModal = this.onCompleteCloseModal.bind(this)
      eventBus.on('completeCloseModal', this.onCompleteCloseModal)
    }

    if (_ENV_.enableEventAsynchronousTransition) {
      if (this.onLeave) {
        this.onLeave = this.onLeave.bind(this)
        eventBus.on('leave', this.onLeave)
      }
      if (this.onLeaveCompleted) {
        this.onLeaveCompleted = this.onLeaveCompleted.bind(this)
        eventBus.on('leaveCompleted', this.onLeaveCompleted)
      }
      if (this.onEnter) {
        this.onEnter = this.onEnter.bind(this)
        eventBus.on('enter', this.onEnter)
      }
      if (this.onEnterReady) {
        this.onEnterReady = this.onEnterReady.bind(this)
        eventBus.on('enterReady', this.onEnterReady)
      }
      if (this.onEnterShow) {
        this.onEnterShow = this.onEnterShow.bind(this)
        eventBus.on('enterShow', this.onEnterShow)
      }
      if (this.onEnterCompleted) {
        this.onEnterCompleted = this.onEnterCompleted.bind(this)
        eventBus.on('enterCompleted', this.onEnterCompleted)
      }
      if (this.onLeaveCancelled) {
        this.onLeaveCancelled = this.onLeaveCancelled.bind(this)
        eventBus.on('leaveCancelled', this.onLeaveCancelled)
      }
      if (this.onEnterCancelled) {
        this.onEnterCancelled = this.onEnterCancelled.bind(this)
        eventBus.on('enterCancelled', this.onEnterCancelled)
      }
    }

    if (_ENV_.enableEventLoading || _ENV_.enableEventPace) {
      if (this.onLoadProgress) {
        this.onLoadProgress = this.onLoadProgress.bind(this)
        onLoadProgress(this.onLoadProgress)
      }
    }
    if (this.onLoadDone) {
      this.onLoadDone = this.onLoadDone.bind(this)
      onLoadDone(this.onLoadDone)
    }

    if (store.cScroll) {
      this.initScroll()
    } else {
      eventBus.once('initPageJs', () => {
        this.initScroll()
      })
    }

    this._onInit = () => {
      if (!this.isManual && this.onIntersect && this.el) {
        this.onIntersect = this.onIntersect.bind(this)
        this.addIntersectionObserver({
          el: this.el,
          callback: this.onIntersect,
          param: this.option.intersectOptions || constructor.intersectOptions,
          once: this.option.intersectOnce || constructor.intersectOnce,
        })
      }

      if (this.onInit) {
        this.onInit()
      }
    }

    if (!this.isPermanent) {
      this._destroy = (pageId) => {
        if (!this.isPage && this._pageId !== pageId) return
        this.destroySelf()
      }
      eventBus.on('destroy', this._destroy)

      this._destroyCompletely = (pageIdPrev) => {
        if (!this.isPage && this._pageId !== pageIdPrev) return
        this.destroyCompletely()
      }
      eventBus.on('destroyCompletely', this._destroyCompletely)
    }
  }

  initScroll() {
    if (this.onScrollNative) {
      this._onScrollNative = () => {
        this.onScrollNative!(window.scrollY)
      }
      window.addEventListener('scroll', this._onScrollNative, passive)
    }

    if (this.onScrollThrottle) {
      this.onScrollThrottle = this.onScrollThrottle.bind(this)
      onScroll(this.onScrollThrottle)
    }

    if (this.onScroll) {
      this.onScroll = this.onScroll.bind(this)

      if (!this.isDisableAutoPlayScroll) {
        requestAnimationFrame(() => {
          this.playScroll()
        })
      }
    }

    if (this.onVirtualScroll) {
      this.onVirtualScroll = this.onVirtualScroll.bind(this)
      store.cScroll.onVirtualScroll(this.onVirtualScroll)
    }

    if (this.onResize) {
      this.onResize = this.onResize.bind(this)
      store.cScroll.onResize(this.onResize)
    }
  }

  get isPc() {
    return !media.isSp
  }

  get isSp() {
    return media.isSp
  }

  get isTb() {
    return media.isTb
  }

  get isTbPortrait() {
    return media.isTbPortrait
  }

  get isPortrait() {
    return media.isPortrait
  }

  get scrollY() {
    return store.scrollY
  }

  get scrollYSmooth() {
    return store.scrollYSmooth
  }

  get scrollYNative() {
    return store.scrollYNative
  }

  emit(name: string, ...args: any[]) {
    eventBus.emit(name, ...args)
  }

  on(name: string, listener: EventBusListener) {
    this.listeners[name] = listener
    eventBus.on(name, listener)
  }

  once(name: string, listener: EventBusListener) {
    this.listeners[name] = listener
    eventBus.once(name, listener)
  }
  off(name: string, listener: EventBusListener) {
    eventBus.off(name, listener)
  }

  emitResize() {
    const resizeNativeArgs: ResizeNativeArg = getWindowSize()
    resizeNativeArgs.isForce = true
    this.onResetSize!(resizeNativeArgs)
    this.onResizeNative!(resizeNativeArgs)
    this.onResizeAlways!(resizeNativeArgs)
  }

  emitResizeAll() {
    // emitResize(true)
    store.cScroll.update()
  }

  emitSelfResize() {
    if (this.onResize) {
      this.onResize(getWindowSize())
    }
  }

  addIntersectionObserver({
    el,
    callback,
    param,
    once,
  }: {
    el: AddOptions['el']
    callback: (
      entry: IntersectionObserverEntry,
      direction: typeof store.scrollDirection
    ) => void
    param?: AddOptions['param']
    once?: AddOptions['once']
  }) {
    const _cIntersecting = store.cIntersecting.add({
      el,
      callback: (arg) => {
        callback(arg, store.scrollDirection)
      },
      param,
      once,
    })

    if (_cIntersecting) {
      this._intersectionObservers.push(_cIntersecting)
    }

    return _cIntersecting
  }

  playTick() {
    if (!this.onTick || this.isPlayTick || this.isDestroyed) return
    this.isPlayTick = true
    gsap.ticker.add(this.onTick)
  }

  pauseTick() {
    if (!this.onTick || !this.isPlayTick) return
    this.isPlayTick = false
    gsap.ticker.remove(this.onTick)
  }

  playScroll() {
    if (!this.onScroll || this.isPlayScroll || this.isDestroyed) return
    this.isPlayScroll = true
    store.cScroll.onAnimateScroll(this.onScroll)
  }

  pauseScroll() {
    if (!this.onScroll || !this.isPlayScroll) return
    this.isPlayScroll = false
    store.cScroll.offAnimateScroll(this.onScroll)
  }

  scrollTo(...args: Parameters<ScrollLenis['scrollTo']>) {
    return store.cScroll.scrollTo(...args)
  }

  get isSmoothScroll() {
    return store.cScroll.isSmooth
  }

  initComponentsOnMutation(el = this.el) {
    this._initComponentsOnMutation = initComponentsOnMutation(el)
  }

  destroySelf() {
    this._onDestroy()

    eventBus.off('destroy', this._destroy)
    // this._destroy = undefined
  }

  _onDestroy() {
    this.isDestroyed = true

    if (this.onResizeFirst) {
      eventBus.off('resizeFirst', this.onResizeFirst)
      this.onResizeFirst = undefined
    }
    if (this.onResetSize) {
      offResetSize(this.onResetSize)
      this.onResetSize = undefined
    }
    if (this.onResizeNative) {
      offResize(this.onResizeNative)
      this.onResizeNative = undefined
    }
    if (this.onResizeAlways) {
      offResizeAlways(this.onResizeAlways)
      this.onResizeAlways = undefined
    }

    if (this.onOrientationchange) {
      offOrientationchange(this.onOrientationchange)
      this.onOrientationchange = undefined
    }

    if (this.onTick) {
      this.pauseTick()
      this.onTick = undefined
    }

    if (this.el) {
      store.componentCache.set(
        this.el,
        store.componentCache
          .get(this.el)!
          .filter((value) => value !== this.cacheValue)
      )

      if (this.onClick) {
        this.el.removeEventListener('click', this.onClick)
      }

      if (this.onMouseenter) {
        removeMouseenterListener(this.el, this.onMouseenter)
        this.onMouseenter = undefined
      }
      if (this.onMousemove) {
        removeMousemoveListener(this.el, this.onMousemove)
        this.onMousemove = undefined
      }
      if (this.onMouseleave) {
        removeMouseleaveListener(this.el, this.onMouseleave)
        this.onMouseleave = undefined
      }

      if (this._gesture) {
        this._gesture.destroy()
        this._gesture = undefined
        this.onGesture = undefined
      }
    }

    if (this.onMousedownDocument) {
      offMousedown(this.onMousedownDocument)
      this.onMousedownDocument = undefined
    }
    if (this.onMousemoveDocument) {
      offMousemove(this.onMousemoveDocument)
      this.onMousemoveDocument = undefined
    }
    if (this.onMouseupDocument) {
      offMouseup(this.onMouseupDocument)
      this.onMouseupDocument = undefined
    }

    if (this.onBeforeResetModalStyle) {
      eventBus.off('beforeResetModalStyle', this.onBeforeResetModalStyle)
      this.onBeforeResetModalStyle = undefined
    }
    if (this.onOpenModal) {
      eventBus.off('openModal', this.onOpenModal)
      this.onOpenModal = undefined
    }
    if (this.onStartOpenModal) {
      eventBus.off('startOpenModal', this.onStartOpenModal)
      this.onStartOpenModal = undefined
    }
    if (this.onCompleteOpenModal) {
      eventBus.off('completeOpenModal', this.onCompleteOpenModal)
      this.onCompleteOpenModal = undefined
    }
    if (this.onCloseModal) {
      eventBus.off('closeModal', this.onCloseModal)
      this.onCloseModal = undefined
    }
    if (this.onStartCloseModal) {
      eventBus.off('startCloseModal', this.onStartCloseModal)
      this.onStartCloseModal = undefined
    }
    if (this.onCompleteCloseModal) {
      eventBus.off('completeCloseModal', this.onCompleteCloseModal)
      this.onCompleteCloseModal = undefined
    }

    if (_ENV_.enableEventAsynchronousTransition) {
      if (this.onLeave) {
        eventBus.off('leave', this.onLeave)
        this.onLeave = undefined
      }
      if (this.onLeaveCompleted) {
        eventBus.off('leaveCompleted', this.onLeaveCompleted)
        this.onLeaveCompleted = undefined
      }
      if (this.onEnter) {
        eventBus.off('enter', this.onEnter)
        this.onEnter = undefined
      }
      if (this.onEnterReady) {
        eventBus.off('enterReady', this.onEnterReady)
        this.onEnterReady = undefined
      }
      if (this.onEnterShow) {
        eventBus.off('enterShow', this.onEnterShow)
        this.onEnterShow = undefined
      }
      if (this.onEnterCompleted) {
        eventBus.off('enterCompleted', this.onEnterCompleted)
        this.onEnterCompleted = undefined
      }
      if (this.onLeaveCancelled) {
        eventBus.off('leaveCancelled', this.onLeaveCancelled)
        this.onLeaveCancelled = undefined
      }
      if (this.onEnterCancelled) {
        eventBus.off('enterCancelled', this.onEnterCancelled)
        this.onEnterCancelled = undefined
      }
    }

    if (_ENV_.enableEventLoading || _ENV_.enableEventPace) {
      if (this.onLoadProgress) {
        offLoadProgress(this.onLoadProgress)
        this.onLoadProgress = undefined
      }
      if (this.onLoadDone) {
        offLoadDone(this.onLoadDone)
        this.onLoadDone = undefined
      }
    }

    if (this._onScrollNative) {
      window.removeEventListener('scroll', this._onScrollNative)
      // this._onScrollNative = undefined
    }
    if (this.onScrollThrottle) {
      offScroll(this.onScrollThrottle)
      this.onScrollThrottle = undefined
    }

    if (this.onScroll) {
      this.pauseScroll()
      this.onScroll = undefined
    }

    if (this.onVirtualScroll) {
      store.cScroll.offVirtualScroll(this.onVirtualScroll)
      this.onVirtualScroll = undefined
    }

    if (this.onResize) {
      store.cScroll.offResize(this.onResize)
      this.onResize = undefined
    }

    this._intersectionObservers.forEach((intersectionObserver) => {
      intersectionObserver.destroy()
    })
    this._intersectionObservers = []
    if (this.onIntersect) {
      this.onIntersect = undefined
    }

    if (this._initComponentsOnMutation) {
      this._initComponentsOnMutation.destroy()
      // this._initComponentsOnMutation = undefined
    }

    Object.keys(this.listeners).forEach((name) => {
      eventBus.off(name, this.listeners[name])
    })
  }

  destroyCompletely() {
    if (this.onDestroy) {
      this.onDestroy()
      this.onDestroy = undefined
    }

    eventBus.off('destroyCompletely', this._destroyCompletely)
    // this._destroyCompletely = undefined

    this.el = undefined
  }

  destroy() {
    this.destroySelf()
    this.destroyCompletely()
  }

  static create(
    el: HTMLElement | SVGElement,
    option: ComponentOptions = {},
    name?: string
  ) {
    const cacheValue =
      name || this.componentName || this.selectorRoot || this.name
    if (store.componentCache.get(el)?.some((value) => value === cacheValue))
      return
    option.cacheValue = cacheValue

    const instance = new this({ el, ...option })
    instance._pageId = store.pageId
    if (!instance.isManualInit) {
      const callback = () => {
        instance._onInit()
        // if (!instance.isDisableAutoResize && instance.onResize) {
        //   instance.onResize(getWindowSize())
        // }
      }
      if (store.isTransitioned && !store.isLoadedStyles) {
        eventBus.once('loadedStyles', callback)
      } else {
        callback()
      }
    }
    return instance
  }

  static createAll(
    context = document,
    option: ComponentOptions & { selector?: string } = {}
  ) {
    if (!this.selectorRoot && this.componentName) {
      this.selectorRoot = `.${this.componentName}, [data-el="${this.componentName}"]`
    }
    const { selector = this.selectorRoot } = option

    return Array.prototype.map.call(context.querySelectorAll(selector), (el) =>
      this.create(el, option)
    )
  }

  static register({
    delay,
    priority,
    isLocal,
  }: Parameters<typeof addComponent>[1] = {}) {
    if (this.isPermanent) {
      addPermanentComponent(this, { delay, priority })
    } else if (isLocal || this.isLocal) {
      addComponent(this, { delay, priority, isLocal: true })
    } else {
      addComponent(this, { delay, priority })
    }
  }
}

interface Component {
  onMount?(): void
  onInit?(): void
  onResize?(windowSize: WindowSize): void
  onResizeFirst?(): void
  onResetSize?(arg: ResizeNativeArg): void
  onResizeNative?(arg: ResizeNativeArg): void
  onResizeAlways?(arg: ResizeNativeArg): void
  onOrientationchange?(isHorizontal: boolean): void
  onTick?(time: number, deltaTime: number, frame: number, elapsed: number): void
  onClick?(...args: Parameters<EventListener>): void
  onMouseenter?(...args: Parameters<ListenerMouse>): void
  onMousemove?(...args: Parameters<ListenerMouse>): void
  onMouseleave?(...args: Parameters<ListenerMouse>): void
  onGesture?(arg: GestureCallbackArgument): void
  onMousedownDocument?(...args: Parameters<ListenerMouseDocument>): void
  onMousemoveDocument?(...args: Parameters<ListenerMouseDocument>): void
  onMouseupDocument?(...args: Parameters<ListenerMouseDocument>): void
  onBeforeResetModalStyle?(id: string): void
  onOpenModal?(id: string): void
  onStartOpenModal?(id: string): void
  onCompleteOpenModal?(id: string): void
  onCloseModal?(id: string): void
  onStartCloseModal?(id: string): void
  onCompleteCloseModal?(id: string): void
  onLeave?(pageId: string, trigger: Element | 'script' | 'popstate'): void
  onLeaveCompleted?(pageId: string, pageIdPrev: string): void
  onEnter?(pageId: string, pageIdPrev: string): void
  onEnterReady?(pageId: string, pageIdPrev: string): void
  onEnterShow?(pageId: string, pageIdPrev: string): void
  onEnterCompleted?(pageId: string, pageIdPrev: string): void
  onLeaveCancelled?(pageId: string): void
  onEnterCancelled?(pageId: string): void
  onLoadProgress?(progress: number): void
  onLoadDone?(): void
  onIntersect?(
    entry: IntersectionObserverEntry,
    direction: typeof store.scrollDirection
  ): void
  onScrollNative?(scrollY: number): void
  onScrollThrottle?(scrollY: number): void
  onScroll?(lenis: Lenis): void
  onVirtualScroll?(arg: ArgumentVirtualScroll): void
  onDestroy?(): void
}

export default Component
