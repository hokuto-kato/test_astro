import passive from '~/js/utils/passive'

export type ListenerMouseDocument = (clientX: number, clientY: number) => void

//
// 変数
//

const listenersMousedown = (window._GLOBAL_.listenersMousedown =
  window._GLOBAL_.listenersMousedown || [])
let lengthListenersMousedown

const listenersMousemove = (window._GLOBAL_.listenersMousemove =
  window._GLOBAL_.listenersMousemove || [])
let lengthListenersMousemove

const listenersMouseup = (window._GLOBAL_.listenersMouseup =
  window._GLOBAL_.listenersMouseup || [])
let lengthListenersMouseup

//
// main
//

export function init() {
  document.addEventListener(
    'mousedown',
    (e) => {
      const { clientX, clientY } = e
      lengthListenersMousedown = listenersMousedown.length
      for (let i = 0; i < lengthListenersMousedown; i++) {
        listenersMousedown[i](clientX, clientY)
      }
    },
    passive
  )
  document.addEventListener(
    'mousemove',
    (e) => {
      const { clientX, clientY } = e
      lengthListenersMousemove = listenersMousemove.length
      for (let i = 0; i < lengthListenersMousemove; i++) {
        listenersMousemove[i](clientX, clientY)
      }
    },
    passive
  )
  document.addEventListener(
    'mouseup',
    (e) => {
      const { clientX, clientY } = e
      lengthListenersMouseup = listenersMouseup.length
      for (let i = 0; i < lengthListenersMouseup; i++) {
        listenersMouseup[i](clientX, clientY)
      }
    },
    passive
  )
}

export function onMousedown(listener: ListenerMouseDocument) {
  listenersMousedown.push(listener)
}

export function offMousedown(listener: ListenerMouseDocument) {
  listenersMousedown.some((value, i) => {
    if (value === listener) {
      listenersMousedown.splice(i, 1)
      return true
    }
    return false
  })
}

export function onMousemove(listener: ListenerMouseDocument) {
  listenersMousemove.push(listener)
}

export function offMousemove(listener: ListenerMouseDocument) {
  listenersMousemove.some((value, i) => {
    if (value === listener) {
      listenersMousemove.splice(i, 1)
      return true
    }
    return false
  })
}

export function onMouseup(listener: ListenerMouseDocument) {
  listenersMouseup.push(listener)
}

export function offMouseup(listener: ListenerMouseDocument) {
  listenersMouseup.some((value, i) => {
    if (value === listener) {
      listenersMouseup.splice(i, 1)
      return true
    }
    return false
  })
}
