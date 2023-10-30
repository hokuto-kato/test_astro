/* type */
type MinimizeIntersectingCallback = (entry: IntersectionObserverEntry) => void

type Param = {
  root: IntersectionObserverInit['root']
  rootMargin: IntersectionObserverInit['rootMargin']
  threshold: number[]
}

type ObserverSet = {
  observer: IntersectionObserver
  param: Param
  listeners: Listener[]
}

type Listener = {
  el: HTMLElement | SVGElement
  name: string
  param: Param
  once: boolean
  callback: MinimizeIntersectingCallback
  observerSet?: ObserverSet
}

export type AddOptions = {
  el: HTMLElement | SVGElement | string | null
  callback: MinimizeIntersectingCallback
  param?: IntersectionObserverInit
  once?: boolean
}

export type AddReturnObject = {
  destroy: () => void
}

/* constant */
const DEFAULT_OPTION = {
  root: null,
  rootMargin: '0px 0px 0px 0px',
  threshold: [0],
}

const DEFAULT_SELECTOR = '[data-view]'

/* main */
export default class MinimizeIntersecting {
  options?: {
    targetSelector?: string
    defaultOption?: Param
  }
  targetSelector: string
  defaultOption: Param
  observerSets: ObserverSet[] = []
  id = 0

  constructor(options: MinimizeIntersecting['options'] = {}) {
    this.options = options
    this.targetSelector = options.targetSelector || DEFAULT_SELECTOR
    this.defaultOption = options.defaultOption || DEFAULT_OPTION
  }

  add({ el, callback, param = {}, once = false }: AddOptions) {
    const listener = this.getData({ el, callback, param, once })
    if (!listener) return

    this.setObserve(listener)

    return {
      destroy: () => {
        this.remove(listener)
      },
    }
  }

  remove(listener: Listener) {
    if (!listener) return

    const { observerSet: { observer, listeners } = {}, el } = listener
    observer?.unobserve(el)
    listeners?.splice(listeners.indexOf(listener), 1)
  }

  setObserve(listener: Listener) {
    const { root, rootMargin, threshold } = listener.param

    for (let i = 0; i < this.observerSets.length; i = (i + 1) | 0) {
      const observerSet = this.observerSets[i]
      const { param } = observerSet
      /* 既存のIntersectionObserverのオプションにマッチしたら、それにobserveする */
      if (
        root === param.root &&
        rootMargin === param.rootMargin &&
        threshold.every((item, j) => item === param.threshold[j])
      ) {
        const { observer, listeners } = observerSet
        observer.observe(listener.el)
        listener.observerSet = observerSet
        listeners.push(listener)
        return
      }
    }

    /* マッチするIntersectionObserverが見つからなかったら新規作成 */
    const listeners = [listener]
    const observer = new IntersectionObserver((entries, observer) => {
      this.checkView(entries, observer, listeners)
    }, listener.param)
    observer.observe(listener.el)
    const observerSet = {
      observer,
      param: listener.param,
      listeners,
    }
    listener.observerSet = observerSet
    this.observerSets.push(observerSet)
  }

  checkView(
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver,
    listeners: Listener[],
  ) {
    for (let i = 0; i < entries.length; i = (i + 1) | 0) {
      const entry = entries[i]
      for (let j = 0; j < listeners.length; j = (j + 1) | 0) {
        const listener = listeners[j]
        if (listener.el === entry.target) {
          listener.callback(entry)
          if (listener.once && entry.isIntersecting) {
            observer.unobserve(listener.el)
            listeners.splice(listeners.indexOf(listener), 1)
          }
        }
      }
    }
  }

  getData({
    el,
    callback,
    param,
    once,
  }: {
    el: HTMLElement | SVGElement | string | null
    callback: MinimizeIntersectingCallback
    param: IntersectionObserverInit
    once: boolean
  }): Listener | undefined {
    if (!el) return

    if (typeof el === 'string') {
      const selector = el
      el = document.querySelector<HTMLElement | SVGElement>(selector)
      if (!el) {
        console.error(
          `No matching element found for the given selector "${selector}".`,
        )
        return
      }
    }

    return {
      el,
      name: 'view' + this.id++,
      param: {
        root:
          (el.dataset.viewRoot &&
            document.querySelector(el.dataset.viewRoot)) ||
          param.root ||
          this.defaultOption.root,
        rootMargin:
          el.dataset.viewMargin ||
          param.rootMargin ||
          this.defaultOption.rootMargin,
        threshold: el.dataset.viewThreshold
          ? el.dataset.viewThreshold.split(',').map((s) => Number(s))
          : Array.isArray(param.threshold)
          ? param.threshold
          : param.threshold
          ? [param.threshold]
          : this.defaultOption.threshold,
      },
      once: 'viewOnce' in el.dataset || once,
      callback,
    }
  }
}
