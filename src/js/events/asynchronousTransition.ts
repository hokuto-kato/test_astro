// import Highway from '@dogstudio/highway';
import Highway from '~/js/vendors/highway/src/highway'
import eventBus from '~/js/events/eventBus'
import store from '~/js/managers/store'

import { setPageId } from '~/js/events/page'
import { getPreloadImagePath } from '~/js/utils/dom'

//
// 定数
//

const CLASS_NAME_WAIT = 'sWait'
const CLASS_NAME_TRANSITION = 'sTransition'

//
// 変数
//

const listenersLeave = (window._GLOBAL_.listenersLeave =
  window._GLOBAL_.listenersLeave || [])
const listenersLeaveCompleted = (window._GLOBAL_.listenersLeaveCompleted =
  window._GLOBAL_.listenersLeaveCompleted || [])
const listenersEnter = (window._GLOBAL_.listenersEnter =
  window._GLOBAL_.listenersEnter || [])
const listenersEnterReady = (window._GLOBAL_.listenersEnterReady =
  window._GLOBAL_.listenersEnterReady || [])
const listenersEnterShow = (window._GLOBAL_.listenersEnterShow =
  window._GLOBAL_.listenersEnterShow || [])
const listenersEnterCompleted = (window._GLOBAL_.listenersEnterCompleted =
  window._GLOBAL_.listenersEnterCompleted || [])
const listenersLeaveCancelled = (window._GLOBAL_.listenersLeaveCancelled =
  window._GLOBAL_.listenersLeaveCancelled || [])
const listenersEnterCancelled = (window._GLOBAL_.listenersEnterCancelled =
  window._GLOBAL_.listenersEnterCancelled || [])

//
// state
//

const state = (window._GLOBAL_.pageState = window._GLOBAL_.pageState || {
  highway: null,
  documentTo: null,
  isDisable: !_ENV_.enableEventAsynchronousTransition,
  isEnter: false,
  stylesRemoveFrom: [],
})

//
// main
//

/**
 * 初期化
 */
export function init(transitions) {
  if (state.isDisable) return

  // ブラウザバックしたときに自動でスクロール位置が復元されるのを防ぐ
  window.history.scrollRestoration = 'manual'

  const highway = (state.highway = new Highway.Core({
    transitions,
  }))

  store.historyCount = highway.historyCount
  store.prevHistoryCount = highway.prevHistoryCount

  eventBus.emit('initializedAsynchronousTransition')
  store.isInitializedAsynchronousTransition = true

  highway.on(
    'NAVIGATE_OUT',
    ({ trigger, direction, historyCount, prevHistoryCount }) => {
      // 非同期遷移中、またはモーダル開いてるときに前へ戻るしたらリロード
      if (store.isTransitioning) {
        if (state.isEnter) {
          emitEnterCancelled()
        } else {
          emitLeaveCancelled()
        }

        end()

        // 遷移アニメーション中にブラウザ戻ったら、バグを防ぐためリロードする
        window.location.reload()
        return
      }

      // モーダル開いているときにブラウザ戻ったら、バグを防ぐためリロードする
      // if (store.isOpenModal && trigger === 'popstate') {
      //   window.location.reload()
      //   return
      // }

      store.isTransitioned = true

      store.isPopstate = trigger === 'popstate'
      store.popDirection = direction
      store.historyCount = historyCount
      store.prevHistoryCount = prevHistoryCount

      start(trigger)
    }
  )

  highway.on('NAVIGATE_IN', ({ to }) => {
    store.isLeave = false
    state.isEnter = true

    state.documentTo = to.page
    store.view = to.view

    setPageId(to.page)

    document.body.id = store.pageId

    emitEnter()
  })

  highway.on('NAVIGATE_END', ({ to }) => {
    initAsynchronousTransitionEachPage(to.page)

    emitEnterCompleted()

    end()
  })

  eventBus.on('addCursorWait', addCursorWait)
  eventBus.on('removeCursorWait', removeCursorWait)
}

export async function detectInitializedAsynchronousTransition(
  callback: () => void
) {
  if (state.isDisable) return

  if (store.isInitializedAsynchronousTransition) {
    return callback()
  } else {
    return new Promise((resolve) => {
      eventBus.once('initializedAsynchronousTransition', () => {
        resolve(callback())
      })
    })
  }
}

/**
 * start
 */
function start(trigger) {
  store.isTransitioning = true
  store.isLoadedStyles = false
  store.isLeave = true

  // マウスポインターをローディング表示にする
  addCursorWait()

  emitLeave(trigger)

  destroy()

  document.documentElement.classList.add(CLASS_NAME_TRANSITION)
}

/**
 * end
 */
function end() {
  // マウスポインターのローディング表示解除
  removeCursorWait()

  requestAnimationFrame(() => {
    store.isTransitioning = false
    state.isEnter = false

    document.documentElement.classList.remove(CLASS_NAME_TRANSITION)
  })
}

/**
 * destroy
 */
export function destroy(pageId = store.pageId) {
  eventBus.emit('destroy', pageId)
}

/**
 * Component内のonDestroyを実行
 */
export function destroyCompletely(pageIdPrev = store.pageIdPrev) {
  eventBus.emit('destroyCompletely', pageIdPrev)
}

/**
 * 前のページのCSS削除
 */
export function removePrevStyle() {
  state.stylesRemoveFrom.forEach((style) => {
    if (!style) return
    style.remove()
  })
  state.stylesRemoveFrom = []
}

/**
 * ページ毎に非同期遷移の初期化をする
 * @param {Document} [context=document]
 * @param {Element} [el]
 */
export function initAsynchronousTransitionEachPage(context = document) {
  // 非同期遷移の場合にGAのページビューイベントを送信
  if (_ENV_.enableAutoSendGaView) {
    sendGaView(context.title)
  }
}

export async function attachAllLinks(context = document) {
  if (state.isDisable) return

  const callback = () => {
    return state.highway.attachAll(context)
  }
  return detectInitializedAsynchronousTransition(callback)
}

/**
 * 指定要素をHighwayリンクの対象にする
 * @param {Array|NodeList} elements
 */
export function attachLink(elements) {
  if (state.isDisable) return

  return state.highway.attach(elements)
}

/**
 * GAのページビューイベント送信
 */
export function sendGaView(title) {
  if (GA_ID && typeof gtag !== 'undefined') {
    gtag('config', GA_ID, {
      page_path: window.location.pathname,
      page_title: title,
      page_location: window.location.href,
    })
    // } else if (GTM_ID && window.dataLayer) {
    //   if (!store.isTransitioned) return
    //   dataLayer.push(
    //     {
    //       event: 'gtm.js',
    //       'gtm.start': new Date().getTime(),
    //     },
    //     {
    //       event: 'gtm.dom',
    //     },
    //     {
    //       event: 'gtm.load',
    //     }
    //   )
  }
}

/**
 * マウスポインターをウェイティング表示にする
 */
function addCursorWait() {
  document.documentElement.classList.add(CLASS_NAME_WAIT)
}

/**
 * マウスポインターのウェイティング表示を解除
 */
function removeCursorWait() {
  document.documentElement.classList.remove(CLASS_NAME_WAIT)
}

export function setScrollPosition() {
  if (store.isPopstate) {
    // ブラウザバックしたらスクロール位置を復元する
    return store.cScroll.scrollToPrevPagePosition()
  } else {
    // リンククリックでの遷移時はスクロール位置を一番上にする
    return store.cScroll.scrollToAnchor({ immediate: true })
  }
}

/**
 * ページ固有CSS置換
 */
export function manageStyles() {
  // Your main css file, used to prepend other styles
  const main = document.querySelector('#main-style')

  const selector =
    'head > :is(style:not([data-tp-style]), link[rel="stylesheet"], link[rel="preload"]):not([data-no-reload])' // NOTE: data-tp-style: Tweakpane

  const styleTagsFrom = document.querySelectorAll(selector)
  const styleListFrom = [...styleTagsFrom]

  const styleTagsTo = state.documentTo.querySelectorAll(selector)
  const styleListTo = [...styleTagsTo]

  // Compare Styles
  for (let i = 0; i < styleTagsFrom.length; i++) {
    const styleFrom = styleTagsFrom[i]

    for (let j = 0; j < styleTagsTo.length; j++) {
      const styleTo = styleTagsTo[j]

      if (styleFrom.outerHTML === styleTo.outerHTML) {
        // Clean Arrays
        styleListFrom[i] = null
        styleListTo[j] = null

        // Exit Loop
        break
      }
    }
  }

  // Remove Useless
  state.stylesRemoveFrom = styleListFrom.map(
    (style, i) => style && styleTagsFrom[i]
  )

  // Add Styles
  let promises = []

  for (const styleTo of styleListTo) {
    if (!styleTo) continue

    // Create Shadow Style
    const style = document.createElement(styleTo.tagName)

    // Loop Over Attributes
    for (let k = 0; k < styleTo.attributes.length; k++) {
      // Get Attribute
      const attr = styleTo.attributes[k]

      // Set Attribute
      style.setAttribute(attr.nodeName, attr.nodeValue)
    }

    // Style Tag
    if (styleTo.tagName === 'STYLE') {
      if (styleTo.innerHTML) {
        style.innerHTML = styleTo.innerHTML
      }
    }

    promises.push(
      new Promise((resolve) => {
        style.onload = () => {
          resolve()
        }
      })
    )

    const loc = styleTo.parentNode.tagName

    if (loc === 'HEAD') {
      document.head.insertBefore(style, main)
    }

    if (loc === 'BODY') {
      document.body.appendChild(style)
    }
  }

  return Promise.all(promises).then(() => {
    store.isLoadedStyles = true
    eventBus.emit('loadedStyles')
  })
}

/**
 * ページ固有JS置換
 */
export function manageScripts() {
  // Your main JS file, used to prepend other scripts
  const main = document.querySelector('#main-script')

  const selector = 'head > script:not([data-no-reload])'
  const scriptListTo = [...state.documentTo.querySelectorAll(selector)]
  const scriptListFrom = [...document.querySelectorAll(selector)]

  // Compare Scripts
  for (let i = 0; i < scriptListFrom.length; i++) {
    const scriptFrom = scriptListFrom[i]

    for (let j = 0; j < scriptListTo.length; j++) {
      const scriptTo = scriptListTo[j]

      if (scriptFrom.outerHTML === scriptTo.outerHTML) {
        // Create Shadow Script
        const script = document.createElement(scriptFrom.tagName)

        // Loop Over Attributes
        for (let k = 0; k < scriptFrom.attributes.length; k++) {
          // Get Attribute
          const attr = scriptFrom.attributes[k]

          // Set Attribute
          script.setAttribute(attr.nodeName, attr.nodeValue)
        }

        // Inline Script
        if (scriptFrom.innerHTML) {
          script.innerHTML = scriptFrom.innerHTML
        }

        // Replace
        scriptFrom.parentNode.replaceChild(script, scriptFrom)

        // Clean Arrays
        scriptListFrom.splice(i, 1)
        scriptListTo.splice(j, 1)

        // Exit Loop
        break
      }
    }
  }

  // Remove Useless
  for (const scriptFrom of scriptListFrom) {
    // Remove
    scriptFrom.parentNode.removeChild(scriptFrom)
  }

  // Add Scripts
  let promises = []

  for (const scriptTo of scriptListTo) {
    // Create Shadow Script
    const script = document.createElement(scriptTo.tagName)

    // Loop Over Attributes
    for (let k = 0; k < scriptTo.attributes.length; k++) {
      // Get Attribute
      const attr = scriptTo.attributes[k]

      // Set Attribute
      script.setAttribute(attr.nodeName, attr.nodeValue)
    }

    // Inline Script
    if (scriptTo.innerHTML) {
      script.innerHTML = scriptTo.innerHTML
    }

    // module
    const src = scriptTo.getAttribute('src')
    if (scriptTo.getAttribute('type') === 'module' && src) {
      import(src /* @vite-ignore */)
    }

    promises.push(
      new Promise((resolve) => {
        script.onload = () => {
          resolve()
        }
      })
    )

    const loc = scriptTo.parentNode.tagName

    if (loc === 'HEAD') {
      document.head.appendChild(script)
    }

    if (loc === 'BODY') {
      document.body.insertBefore(script, main)
    }
  }

  return Promise.all(promises).then(() => {
    store.isLoadedStyles = true
    eventBus.emit('loadedStyles')
  })
}

export function getPreloadImagePathToPage() {
  return getPreloadImagePath(state.documentTo)
}

export function emitLeave(trigger) {
  eventBus.emit('leave', store.pageId, trigger)
  listenersLeave.forEach((listener) => {
    listener(store.pageId)
  })
}

export function emitLeaveCompleted() {
  eventBus.emit('leaveCompleted', store.pageId, store.pageIdPrev)
  listenersLeaveCompleted.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnter() {
  eventBus.emit('enter', store.pageId, store.pageIdPrev)
  listenersEnter.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnterReady() {
  eventBus.emit('enterReady', store.pageId, store.pageIdPrev)
  listenersEnterReady.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnterShow() {
  eventBus.emit('enterShow', store.pageId, store.pageIdPrev)
  listenersEnterShow.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnterCompleted() {
  eventBus.emit('enterCompleted', store.pageId, store.pageIdPrev)
  listenersEnterCompleted.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnterCancelled() {
  eventBus.emit('enterCancelled', store.pageId)
  listenersEnterCancelled.forEach((listener) => {
    listener(store.pageId)
  })
}

export function emitLeaveCancelled() {
  eventBus.emit('leaveCancelled', store.pageId)
  listenersLeaveCancelled.forEach((listener) => {
    listener(store.pageId)
  })
}

export function onLeave(listener) {
  listenersLeave.push(listener)
}

export function offLeave(listener) {
  listenersLeave.some((value, i) => {
    if (value === listener) {
      listenersLeave.splice(i, 1)
      return true
    }
    return false
  })
}

export function onLeaveCompleted(listener) {
  listenersLeaveCompleted.push(listener)
}

export function offLeaveCompleted(listener) {
  listenersLeaveCompleted.some((value, i) => {
    if (value === listener) {
      listenersLeaveCompleted.splice(i, 1)
      return true
    }
    return false
  })
}

export function onEnter(listener) {
  listenersEnter.push(listener)
}

export function offEnter(listener) {
  listenersEnter.some((value, i) => {
    if (value === listener) {
      listenersEnter.splice(i, 1)
      return true
    }
    return false
  })
}

export function onEnterCompleted(listener) {
  listenersEnterCompleted.push(listener)
}

export function offEnterCompleted(listener) {
  listenersEnterCompleted.some((value, i) => {
    if (value === listener) {
      listenersEnterCompleted.splice(i, 1)
      return true
    }
    return false
  })
}

export function onLeaveCancelled(listener) {
  listenersLeaveCancelled.push(listener)
}

export function offLeaveCancelled(listener) {
  listenersLeaveCancelled.some((value, i) => {
    if (value === listener) {
      listenersLeaveCancelled.splice(i, 1)
      return true
    }
    return false
  })
}

export function onEnterCancelled(listener) {
  listenersEnterCancelled.push(listener)
}

export function offEnterCancelled(listener) {
  listenersEnterCancelled.some((value, i) => {
    if (value === listener) {
      listenersEnterCancelled.splice(i, 1)
      return true
    }
    return false
  })
}
