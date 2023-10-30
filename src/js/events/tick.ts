export type ListenerTick = (
  time: number,
  deltaTime: number,
  frame: number,
  elapsed: number,
) => void

//
// 変数
//

const listenersTick = (window._GLOBAL_.listenersTick =
  window._GLOBAL_.listenersTick || [])

//
// main
//

export function init() {
  gsap.ticker.add((time, deltaTime, frame, elapsed) => {
    for (let i = 0; i < listenersTick.length; i++) {
      listenersTick[i](time, deltaTime, frame, elapsed)
    }
  })
}

export function onTick(listener: ListenerTick) {
  listenersTick.push(listener)
}

export function offTick(listener: ListenerTick) {
  listenersTick.some((value, i) => {
    if (value === listener) {
      listenersTick.splice(i, 1)
      return true
    }
    return false
  })
}
