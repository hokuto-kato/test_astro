import passive from '~/js/utils/passive'
import { throttle } from '~/js/utils/event'

export type ListenerScroll = (scrollY: number) => void

//
// 変数
//

const listenersScroll = (window._GLOBAL_.listenersScroll =
  window._GLOBAL_.listenersScroll || [])
let lengthListenersScroll

//
// main
//

export function init() {
  window.addEventListener('scroll', emitScroll, passive)
}

export function onScroll(listener: ListenerScroll, isExecute = false) {
  if (isExecute) {
    setTimeout(() => {
      listener(window.scrollY)
    })
  }
  listenersScroll.push(listener)
}

export function offScroll(listener: ListenerScroll) {
  listenersScroll.some((value, i) => {
    if (value === listener) {
      listenersScroll.splice(i, 1)
      return true
    }
    return false
  })
}

export const emitScroll = throttle(() => {
  const { scrollY } = window

  lengthListenersScroll = listenersScroll.length
  for (let i = 0; i < lengthListenersScroll; i++) {
    listenersScroll[i](scrollY)
  }
}, 100)
