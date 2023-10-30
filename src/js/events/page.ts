import eventBus from '~/js/events/eventBus'
import store from '~/js/managers/store'
import { initComponents, moveElFixedLocal } from '~/js/managers/components'

//
// main
//

const pageComponents = (window._GLOBAL_.pageComponents =
  window._GLOBAL_.pageComponents || {})

/**
 * 非同期遷移初期化
 */
export async function initAsynchronousTransition() {
  if (_ENV_.enableEventAsynchronousTransition) {
    ;(
      await import('~/js/events/asynchronousTransition')
    ).initAsynchronousTransitionEachPage()
  }
}

export function getPageId() {
  return store.pageId
}

export function registerPageComponent(PageComponent) {
  const pagePath = getPageId()
  if (!(pagePath in pageComponents)) {
    pageComponents[pagePath] = PageComponent
  }
}

/**
 * ページ毎にコンポーネントの初期化をする
 */
export function initEachPage(
  context: Document | Element | null = document,
  isFirstPage = false
) {
  initComponents(context)
  moveElFixedLocal(context)

  // ページ固有JS初期化
  const PageComponent = pageComponents[getPageId()]
  const initPageComponent = (PageComponent) => {
    new PageComponent()
    eventBus.emit('initPageJs')
    if (isFirstPage) {
      eventBus.emit('loadedStyles')
    }
  }
  if (PageComponent) {
    initPageComponent(PageComponent)
  } else {
    eventBus.once('readyPage', () => {
      initPageComponent(pageComponents[getPageId()])
    })
  }
}

/**
 * 現在のページIDを取得
 * @param {Document} [context=document]
 */
export function setPageId(context = document) {
  // 前ページのIDを保持
  store.pageIdPrev = sessionStorage.getItem('pageId') || ''

  // 次ページのIDを取得
  const pageId = (store.pageId = context.body.id)

  // 次ページのIDをセッションストレージに保持
  sessionStorage.setItem('pageId', pageId)
}
