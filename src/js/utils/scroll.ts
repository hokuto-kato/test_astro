import store from '~/js/managers/store'
import Component from '~/js/parentClass/Component'

/**
 * ブラウザやデバイスが対応しているイベントに合わせタッチスクロールもしくはマウススクロールを操作します
 */
const invalidation = (e) => {
  e.preventDefault()
}
const eventOpts = {
  passive: false,
}

// スクロールを禁止する
export function preventScroll() {
  window.addEventListener('touchmove', invalidation, eventOpts)
  window.addEventListener('wheel', invalidation, eventOpts)
}

// スクロール禁止を解除する
export function allowScroll() {
  window.removeEventListener('touchmove', invalidation, eventOpts)
  window.removeEventListener('wheel', invalidation, eventOpts)
}

export class ScrollLink extends Component {
  // option: {
  //   start,
  //   end,
  //   onStart,
  //   onEnd,
  //   onUpdate,
  //   onIntersect,
  // }

  _isStart = false

  onInit() {
    const {
      start = 0,
      end = 1,
      onStart,
      onEnd,
      onUpdate,
      onIntersect,
    } = this.option

    this._start = start
    this._end = end
    this._diff = end - start
    this._onStart = onStart
    this._onEnd = onEnd
    this._onUpdate = onUpdate
    this._onIntersect = onIntersect

    if (!this.el) {
      this.playScroll()
    }
  }

  onScroll({ scroll, direction }) {
    if (this._start <= scroll && scroll <= this._end) {
      if (!this._isStart) {
        this._isStart = true
        this._onStart && this._onStart(direction)
      }
      this._onUpdate &&
        this._onUpdate((scroll - this._start) / this._diff, direction)
    } else {
      if (this._isStart) {
        this._onUpdate &&
          this._onUpdate(
            Math.round((scroll - this._start) / this._diff),
            direction
          )
        this._onEnd && this._onEnd(direction)
        this._isStart = false
      }
    }
  }

  onIntersect({ isIntersecting }, scrollDirection) {
    if (isIntersecting) {
      this.playScroll()
    } else {
      this.pauseScroll()
    }
    this._onIntersect(isIntersecting, scrollDirection)
  }

  get start() {
    return this._start
  }

  set start(value) {
    this._start = value
    this._diff = this._end - this._start
  }

  get end() {
    return this._end
  }

  set end(value) {
    this._end = value
    this._diff = this._end - this._start
  }

  static create(option = {}) {
    const instance = new this({ ...option })
    if (!instance.isManual && instance.onInit) {
      const callback = () => {
        instance.onInit()
      }
      if (store.isTransitioned && !store.isLoadedStyles) {
        eventBus.once('loadedStyles', callback)
      } else {
        callback()
      }
    }
    return instance
  }
}
