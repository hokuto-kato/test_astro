import store from '~/js/managers/store'
import { onLoad } from '~/js/utils/event'
import eventBus from './eventBus'

const AMOUNT_OF_LOADING_ITEM: Record<string, number> = {
  pageTop: 48, // NOTE: max 50だが、テスト環境だと48なので意図的に減らしている
  pageWhyUse: 2,
  pageSmbService: 3,
  pageAbout: 3,
  pageCareers: 3, // NOTE: max 4だが、テスト環境だと3なので意図的に減らしている
  page404: 6,
}
// let AMOUNT_OF_LOADING_ITEM = Infinity

export type ListenerLoadProgress = (progress: number) => void
export type ListenerLoadDone = () => void

//
// 変数
//

const listenersLoadProgress = (window._GLOBAL_.listenersLoadProgress =
  window._GLOBAL_.listenersLoadProgress || [])

const listenersLoadDone = (window._GLOBAL_.listenersLoadDone =
  window._GLOBAL_.listenersLoadDone || [])

//
// main
//

export async function init() {
  if (_ENV_.enableEventPace) {
    /* Pace */
    const Pace = await import('pace-js')

    // Paceライブラリ
    Pace.on('progress', (progress: number) => {
      for (let i = 0; i < listenersLoadProgress.length; i = (i + 1) | 0) {
        listenersLoadProgress[i](progress)
      }
    })

    Pace.once('done', () => {
      emitLoadDone()
    })

    Pace.start()
  } else if (_ENV_.enableEventLoading) {
    if (!store.loadingCountList[store.pageId]) {
      store.view.classList.add('-show')
      emitLoadDone()
      return
    }

    detectStartLoading()
    eventBus.on('leave', () => {
      store.loadingCountList[store.pageId] = []
      store.isLoadStart[store.pageId] = false
    })
  } else {
    /* window.onloadのみ */
    onLoad(() => {
      emitLoadDone()
    })
  }
}

export function detectStartLoading() {
  const loadingCountList = store.loadingCountList[store.pageId]
  // console.log(
  //   'store.loadingCountList.length',
  //   store.pageId,
  //   AMOUNT_OF_LOADING_ITEM[store.pageId],
  //   loadingCountList.length,
  //   store.isLoadStart[store.pageId],
  // )
  if (
    !loadingCountList ||
    loadingCountList.length < AMOUNT_OF_LOADING_ITEM[store.pageId] ||
    store.isLoadStart[store.pageId]
  )
    return
  store.isLoadStart[store.pageId] = true

  const percentageOfEach = 100 / loadingCountList.length
  let realPercentage = 0
  Promise.all(
    loadingCountList.map((promise) => {
      promise?.then(() => {
        realPercentage += percentageOfEach
        const percentage = Math.round(realPercentage)
        for (let i = 0; i < listenersLoadProgress.length; i = (i + 1) | 0) {
          listenersLoadProgress[i](percentage)
        }
      })
      return promise
    }),
  ).then(() => {
    emitLoadDone()
  })

  store.view.classList.add('-show')
}

export function onLoadProgress(listener: ListenerLoadProgress) {
  listenersLoadProgress.push(listener)
}

export function offLoadProgress(listener: ListenerLoadProgress) {
  listenersLoadProgress.some((value, i) => {
    if (value === listener) {
      listenersLoadProgress.splice(i, 1)
      return true
    }
    return false
  })
}

export function onLoadDone(listener: ListenerLoadDone) {
  listenersLoadDone.push(listener)
}

export function offLoadDone(listener: ListenerLoadDone) {
  listenersLoadDone.some((value, i) => {
    if (value === listener) {
      listenersLoadDone.splice(i, 1)
      return true
    }
    return false
  })
}

function emitLoadDone() {
  store.isLoadDone[store.pageId] = true
  listenersLoadDone.forEach((listener) => {
    listener()
  })
}
