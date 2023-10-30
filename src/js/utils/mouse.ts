import whatInput from 'what-input'
import passive from '~/js/utils/passive'

export type ListenerMouse = EventListener

export function isTouch() {
  return whatInput.ask('intent') === 'touch'
}

export function addMouseenterListener(el: Element, fn: ListenerMouse) {
  const listener: EventListenerOrEventListenerObject = (ev) => {
    if (isTouch()) return
    fn(ev)
  }
  el.addEventListener('mouseenter', listener, passive)
  return listener
}

export function addMousemoveListener(el: Element, fn: ListenerMouse) {
  const listener: EventListenerOrEventListenerObject = (ev) => {
    if (isTouch()) return
    fn(ev)
  }
  el.addEventListener('mousemove', listener, passive)
  return listener
}

export function addMouseleaveListener(el: Element, fn: ListenerMouse) {
  const listener: EventListenerOrEventListenerObject = (ev) => {
    if (isTouch()) return
    fn(ev)
  }
  el.addEventListener('mouseleave', listener, passive)
  return listener
}

export function removeMouseenterListener(el: Element, listener: ListenerMouse) {
  el.removeEventListener('mouseenter', listener)
}

export function removeMousemoveListener(el: Element, listener: ListenerMouse) {
  el.removeEventListener('mousemove', listener)
}

export function removeMouseleaveListener(el: Element, listener: ListenerMouse) {
  el.removeEventListener('mouseleave', listener)
}
