import store from './store'
import { attachAllLinks } from '~/js/events/asynchronousTransition'

//
// state
//

const state = {
  components: [],
  componentsLocal: {},
  componentsPermanent: [],
  elsPermanent: null,
}

//
// main
//

export function addComponents(
  components,
  { priority = 0, isLocal = false } = {}
) {
  let currentComponents
  if (isLocal) {
    currentComponents = state.componentsLocal[store.pageId]
    if (!currentComponents) {
      currentComponents = state.componentsLocal[store.pageId] = []
    }
  } else {
    currentComponents = state.components
  }
  if (!currentComponents[priority]) {
    currentComponents[priority] = []
  }
  currentComponents[priority] = currentComponents[priority].concat(components)
}

export function addComponent(
  Component,
  { delay = 0, priority = 0, isLocal = false } = {}
) {
  let currentComponents
  if (isLocal) {
    currentComponents = state.componentsLocal[store.pageId]
    if (!currentComponents) {
      currentComponents = state.componentsLocal[store.pageId] = []
    }
  } else {
    currentComponents = state.components
  }
  if (!currentComponents[priority]) {
    currentComponents[priority] = []
  }
  currentComponents[priority].push(Component)

  if (delay) {
    setTimeout(() => {
      initComponent(Component)
    }, delay)
  } else {
    initComponent(Component)
  }
}

export function initComponents(context = document, isPermanent = false) {
  if (isPermanent) {
    state.components.forEach((list) => {
      list?.forEach((Class) => {
        Class.createAll(context, { isPermanent })
      })
    })
  } else {
    state.components.forEach((list) => {
      list?.forEach((Class) => {
        Class.createAll(context)
      })
    })
    state.componentsLocal[store.pageId]?.forEach((list) => {
      list?.forEach((Class) => {
        Class.createAll(context)
      })
    })
  }
}

export function initComponent(Component, isPermanent = false) {
  if (isPermanent) {
    state.elsPermanent.forEach((el) => {
      Component.createAll(el, { isPermanent: true })
    })
  } else {
    Component.createAll(store.view)

    state.elsPermanent.forEach((el) => {
      Component.createAll(el, { isPermanent: true })
    })
  }
}

// permanent component

export function addPermanentComponent(
  Component,
  { delay = 0, priority = 0 } = {}
) {
  if (!state.componentsPermanent[priority]) {
    state.componentsPermanent[priority] = []
  }
  state.componentsPermanent[priority].push(Component)

  if (delay) {
    setTimeout(() => {
      initComponent(Component, true)
    }, delay)
  } else {
    initComponent(Component, true)
  }
}

export function initPermanentComponents() {
  state.componentsPermanent.forEach((list) => {
    list?.forEach((Class) => {
      Class.createAll()
    })
  })
}

export function setPermanentRoot(selector = '[data-permanent]') {
  state.elsPermanent = document.querySelectorAll(selector)
}

/**
 * どのページでも常に存在する要素内の汎用コンポーネント処理
 */
export function initInnerPermanentComponents() {
  state.elsPermanent.forEach((el) => {
    initComponents(el, true)
  })
}

export function initComponentsOnMutation(el) {
  let allLinks
  const observer = new MutationObserver(async (mutationsList) => {
    if (mutationsList.some(({ target }) => target === el)) {
      initComponents(el)
      if (allLinks) {
        allLinks.detach()
      }
      allLinks = await attachAllLinks(el)
    }
  })
  observer.observe(el, { childList: true })

  return {
    destroy: () => {
      observer.disconnect()
      if (allLinks) {
        allLinks.detach()
      }
    },
  }
}

/**
 * ページ固有モーダルのHTMLを非同期遷移対象要素外へ移動
 */
export function moveElFixedLocal(context) {
  const elFixedLocal = context.querySelector('[data-fixed-local]')
  if (!elFixedLocal) return

  const elFixedLocalContainer = document.querySelector(
    '[data-fixed-local-container]'
  )
  elFixedLocalContainer.innerHTML = ''
  document
    .querySelector('[data-fixed-local-container]')
    .appendChild(elFixedLocal)
}
