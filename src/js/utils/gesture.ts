import passive from '~/js/utils/passive'
import { getClientPos } from '~/js/utils/event'
import { isSafari } from './navigator'

export type GestureCallbackArgument = {
  e: Event
  diff: {
    y: number
    x: number
  }
  direction: 'Down' | 'Up' | 'Left' | 'Right' | 'Escape'
  type: 'wheel' | 'drag' | 'swipe' | 'keyboard'
}

/**
 * マウスホイール操作を検知する
 */
export class Wheel {
  /**
   * @param  {Element} el 対象要素
   * @param  {GestureCallback} callback コールバック
   */
  constructor(el, callback, option = {}) {
    const { threshold = 0, reset } = option

    this.el = el
    this._callback = callback
    this._threshold = threshold
    this.reset = reset
    this._type = 'wheel'

    this._handler = this._onWheel.bind(this)
    this.el.addEventListener('wheel', this._handler, { passive: !isSafari })
  }

  _onWheel(e) {
    let direction
    const { deltaX, deltaY } = e
    if (Math.abs(deltaY) >= Math.abs(deltaX)) {
      // 上下方向
      if (deltaY > this._threshold) {
        direction = 'Down' // 下へ進む
      } else if (deltaY < -this._threshold) {
        direction = 'Up'
      } else if (this.reset) {
        this.reset(deltaY, this._type)
        return
      }
    } else {
      // 左右方向
      /* eslint-disable no-lonely-if */
      if (deltaX > this._threshold) {
        direction = 'Right'
      } else if (deltaX < -this._threshold) {
        direction = 'Left'
      } else if (this.reset) {
        this.reset(deltaX, this._type)
        return
      }
      /* eslint-enable no-lonely-if */
    }

    this._callback({
      e,
      diff: {
        y: deltaY,
        x: deltaX,
      },
      direction,
      type: this._type,
    })
  }

  /**
   * 監視をやめる
   */
  destroy() {
    this.el.removeEventListener('wheel', this._handler, passive)
  }
}

/**
 * ドラッグ操作を検知する
 */
export class Drag {
  /**
   * @param  {Element} el 対象要素
   * @param  {GestureCallback} callback コールバック
   * @param  {Object} [option={}] オプション
   * @param  {number} [option.threshold=120] ドラッグと判定する指の移動量
   * @param  {boolean} [option.isPreventDefault=false] イベントを preventDefault させるかどうか
   */
  constructor(el, callback, option = {}) {
    const {
      threshold = 120,
      isDetectOnStart = false,
      isPreventDefault = false,
      onStart,
      onUpdate,
      reset,
    } = option

    this.el = el
    this._callback = callback
    this._threshold = threshold
    this._isPreventDefault = isPreventDefault
    this._onStart = onStart
    this._onUpdate = isDetectOnStart ? callback : onUpdate
    this.reset = reset
    this._type = 'drag'
    this._isStart = false

    this._mousedownHandler = this._onMousedown.bind(this)
    this.el.addEventListener('mousedown', this._mousedownHandler, passive)

    this._mousemoveHandler = this._onMousemove.bind(this)
    this.el.addEventListener(
      'mousemove',
      this._mousemoveHandler,
      this._isPreventDefault ? false : passive,
    )

    this._mouseupHandler = this._onMouseup.bind(this)
    this.el.addEventListener('mouseup', this._mouseupHandler, passive)
  }

  _onMousedown(e) {
    this._isStart = true
    this._startPosition = getClientPos(e)
    if (this._onStart) this._onStart(this._startPosition, this._type)
  }

  _onMousemove(e) {
    if (!this._isStart) return

    if (this._isPreventDefault) e.preventDefault()

    if (this._onUpdate) {
      const position = getClientPos(e)
      const diffY = position.y - this._startPosition.y
      const diffX = position.x - this._startPosition.x

      let direction

      if (Math.abs(diffY) >= Math.abs(diffX)) {
        // 上下方向
        if (diffY < 0) {
          direction = 'Down' // 下へ進む（指を上に動かしたとき）
        } else if (diffY > 0) {
          direction = 'Up'
        }
      } else {
        // 左右方向
        /* eslint-disable no-lonely-if */
        if (diffX < 0) {
          direction = 'Right' // 右へ進む（指を左に動かしたとき）
        } else if (diffX > 0) {
          direction = 'Left'
        }
        /* eslint-enable no-lonely-if */
      }

      this._onUpdate({
        e,
        diff: {
          y: diffY,
          x: diffX,
        },
        direction,
        type: this._type,
      })
    }
  }

  _onMouseup(e) {
    if (!this._isStart) return

    const endPosition = getClientPos(e)
    const diffY = endPosition.y - this._startPosition.y
    const diffX = endPosition.x - this._startPosition.x

    let direction

    if (Math.abs(diffY) >= Math.abs(diffX)) {
      // 上下方向
      if (diffY < -this._threshold) {
        direction = 'Down' // 下へ進む（指を上に動かしたとき）
      } else if (diffY > this._threshold) {
        direction = 'Up'
      } else if (this.reset) {
        this.reset(diffY, this._type)
        this._isStart = false
        return
      }
    } else {
      // 左右方向
      /* eslint-disable no-lonely-if */
      if (diffX < -this._threshold) {
        direction = 'Right' // 右へ進む（指を左に動かしたとき）
      } else if (diffX > this._threshold) {
        direction = 'Left'
      } else if (this.reset) {
        this.reset(diffX, this._type)
        this._isStart = false
        return
      }
      /* eslint-enable no-lonely-if */
    }

    this._callback({
      e,
      diff: {
        y: diffY,
        x: diffX,
      },
      direction,
      type: this._type,
    })

    this._isStart = false
  }

  /**
   * 監視をやめる
   */
  destroy() {
    this.el.removeEventListener('mousedown', this._mousedownHandler, passive)
    this.el.removeEventListener(
      'mousemove',
      this._mousemoveHandler,
      this._isPreventDefault ? false : passive,
    )
    this.el.removeEventListener('mouseup', this._mouseupHandler, passive)
  }
}

/**
 * スワイプ操作を検知する
 */
export class Swipe {
  /**
   * @param  {Element} el 対象要素
   * @param  {GestureCallback} callback コールバック
   * @param  {Object} [option={}] オプション
   * @param  {number} [option.threshold=50] スワイプと判定する指の移動量
   * @param  {boolean} [option.isPreventDefault=false] イベントを preventDefault させるかどうか
   */
  constructor(el, callback, option = {}) {
    const {
      threshold = 50,
      isDetectOnStart = false,
      isPreventDefault = false,
      onStart,
      onUpdate,
      reset,
    } = option
    this.el = el
    this._callback = callback
    this._threshold = threshold
    this._isPreventDefault = isPreventDefault
    this._onStart = onStart
    this._onUpdate = isDetectOnStart ? callback : onUpdate
    this.reset = reset
    this._type = 'swipe'
    this._isStart = false

    this._touchstartHandler = this._onTouchstart.bind(this)
    this.el.addEventListener('touchstart', this._touchstartHandler, passive)

    this._touchmoveHandler = this._onTouchmove.bind(this)
    this.el.addEventListener(
      'touchmove',
      this._touchmoveHandler,
      this._isPreventDefault ? false : passive,
    )

    this._touchendHandler = this._onTouchend.bind(this)
    this.el.addEventListener('touchend', this._touchendHandler, passive)
  }

  _onTouchstart(e) {
    this._isStart = true
    this._startPosition = getClientPos(e)
    if (this._onStart) this._onStart(this._startPosition, this._type)
  }

  _onTouchmove(e) {
    if (!this._isStart) return

    if (this._isPreventDefault) e.preventDefault()

    if (this._onUpdate) {
      const position = getClientPos(e)
      const diffY = position.y - this._startPosition.y
      const diffX = position.x - this._startPosition.x

      let direction

      if (Math.abs(diffY) >= Math.abs(diffX)) {
        // 上下方向
        if (diffY < 0) {
          direction = 'Down' // 下へ進む（指を上に動かしたとき）
        } else if (diffY > 0) {
          direction = 'Up'
        }
      } else {
        // 左右方向
        /* eslint-disable no-lonely-if */
        if (diffX < 0) {
          direction = 'Right' // 右へ進む（指を左に動かしたとき）
        } else if (diffX > 0) {
          direction = 'Left'
        }
        /* eslint-enable no-lonely-if */
      }

      this._onUpdate({
        e,
        diff: {
          y: diffY,
          x: diffX,
        },
        direction,
        type: this._type,
      })
    }
  }

  _onTouchend(e) {
    if (!this._isStart) return

    const endPosition = getClientPos(e)
    const diffY = endPosition.y - this._startPosition.y
    const diffX = endPosition.x - this._startPosition.x

    let direction

    if (Math.abs(diffY) >= Math.abs(diffX)) {
      // 上下方向
      if (diffY < -this._threshold) {
        direction = 'Down' // 下へ進む（指を上に動かしたとき）
      } else if (diffY > this._threshold) {
        direction = 'Up'
      } else if (this.reset) {
        this.reset(diffY, this._type)
        this._isStart = false
        return
      }
    } else {
      // 左右方向
      /* eslint-disable no-lonely-if */
      if (diffX < -this._threshold) {
        direction = 'Right' // 右へ進む（指を左に動かしたとき）
      } else if (diffX > this._threshold) {
        direction = 'Left'
      } else if (this.reset) {
        this.reset(diffX, this._type)
        this._isStart = false
        return
      }
      /* eslint-enable no-lonely-if */
    }

    this._callback({
      e,
      diff: {
        y: diffY,
        x: diffX,
      },
      direction,
      type: this._type,
    })

    this._isStart = false
  }

  /**
   * 監視をやめる
   */
  destroy() {
    this.el.removeEventListener('touchstart', this._touchstartHandler, passive)
    this.el.removeEventListener(
      'touchmove',
      this._touchmoveHandler,
      this._isPreventDefault ? false : passive,
    )
    this.el.removeEventListener('touchend', this._touchendHandler, passive)
  }
}

/**
 * キーボード操作を検知する
 */
export class Keyboard {
  /**
   * @param  {GestureCallback} callback コールバック
   */
  constructor(callback) {
    this._callback = callback
    this._type = 'keyboard'

    this._handlerKeydown = this._onKeydown.bind(this)
    document.addEventListener('keydown', this._handlerKeydown)

    this._handlerKeyup = this._onKeyup.bind(this)
    document.addEventListener('keyup', this._handlerKeyup)
  }

  _onKeydown(e) {
    const { key } = e
    if (this._downedKey && key !== this._downedKey) return
    this._downedKey = key

    let direction

    switch (key) {
      case 'ArrowDown':
      case 'PageDown':
      case 'Down': // for IE
        direction = 'Down'
        break
      case 'ArrowUp':
      case 'PageUp':
      case 'Up': // for IE
        direction = 'Up'
        break
      case 'ArrowLeft':
      case 'Left': // for IE
        direction = 'Left'
        break
      case 'ArrowRight':
      case 'Right': // for IE
        direction = 'Right'
        break
      case 'Escape':
      case 'Esc': // for IE
        direction = 'Escape'
        break
    }

    this._callback({
      e,
      diff: {
        y: 0,
        x: 0,
      },
      direction,
      type: this._type,
    })
  }

  _onKeyup({ key }) {
    this._downedKey = null
  }

  /**
   * 監視をやめる
   */
  destroy() {
    document.removeEventListener('keydown', this._handlerKeydown)
    document.removeEventListener('keyup', this._handlerKeyup)
  }
}

export type GestureOptions = {
  thresholdWheel: number
  thresholdDrag: number
  thresholdSwipe: number
  isDetectOnStart: boolean
  isPreventDefault: boolean
  onStart
  onUpdate
  reset
  disableWheel: boolean
  disableDrag: boolean
  disableSwipe: boolean
  disableKeyboard: boolean
}

/**
 * マウスホイール、ドラッグ、スワイプ、キーボードすべての操作を検知する
 *
 * @see {@link Wheel}
 * @see {@link Drag}
 * @see {@link Swipe}
 * @see {@link Keyboard}
 */
export class Gesture {
  /**
   * @param  {Element} el 対象要素
   * @param  {GestureCallback} callback コールバック
   * @param  {Object} [option={}] オプション
   */
  constructor(
    el: Element,
    callback: (arg: GestureCallbackArgument) => void,
    option = {},
  ) {
    const {
      thresholdWheel,
      thresholdDrag,
      thresholdSwipe,
      isDetectOnStart = false,
      isPreventDefault,
      onStart,
      onUpdate,
      reset,
      disableWheel = false,
      disableDrag = false,
      disableSwipe = false,
      disableKeyboard = false,
    } = option

    if (!disableWheel) {
      this.wheel = new Wheel(el, callback, {
        threshold: thresholdWheel,
        reset,
      })
    }
    if (!disableDrag) {
      this.drag = new Drag(el, callback, {
        threshold: thresholdDrag,
        isDetectOnStart,
        isPreventDefault,
        onStart,
        onUpdate,
        reset,
      })
    }
    if (!disableSwipe) {
      this.swipe = new Swipe(el, callback, {
        threshold: thresholdSwipe,
        isDetectOnStart,
        isPreventDefault,
        onStart,
        onUpdate,
        reset,
      })
    }
    if (!disableKeyboard) {
      this.keyboard = new Keyboard(callback)
    }
  }

  /**
   * 監視をやめる
   */
  destroy() {
    if (this.wheel) {
      this.wheel.destroy()
    }
    if (this.drag) {
      this.drag.destroy()
    }
    if (this.swipe) {
      this.swipe.destroy()
    }
    if (this.keyboard) {
      this.keyboard.destroy()
    }
  }
}

/**
 * @typedef {function} GestureCallback
 * @param {string} direction 操作方向 ('Down'|'Up'|'Left'|'Right')
 * @param {string} type ジェスチャーの種類 ('wheel'|'drag'|'swipe'|'keyboard')
 */
