// import Highway from '@dogstudio/highway';
import Highway from '~/js/vendors/highway/src/highway'
import eventBus from '~/js/events/eventBus'
import { initEachPage } from '~/js/events/page'
import {
  manageStyles,
  manageScripts,
  getPreloadImagePathToPage,
  emitEnterShow,
  emitLeaveCompleted,
  emitEnterReady,
  destroyCompletely,
  setScrollPosition,
  removePrevStyle,
} from '~/js/events/asynchronousTransition'
import store from '~/js/managers/store'

import { isMobile } from '~/js/utils/navigator'
import { resetStyleModal, setStyleModal } from '~/js/managers/modal'
import { loadImage } from '~/js/utils/dom'
import { wait } from '~/js/utils/time'

//
// state
//

const state = {
  isPullAddressBar: false,
}

//
// main
//

export default class TransitionImmediate extends Highway.Transition {
  async out({ from, done }) {
    from.classList.add('-show', '-out', '-immediate')

    destroyCompletely()

    state.isPullAddressBar =
      isMobile &&
      !store.isOpenModal &&
      window.innerHeight > store.windowHeightInitial

    if (state.isPullAddressBar) {
      // ページ遷移後にアドレスバーを表示させる
      setStyleModal()

      requestAnimationFrame(done)
    } else {
      done()
    }
  }

  in({ from, to, done }) {
    // 次のページの初期化
    new Promise((resolve) => {
      if (state.isPullAddressBar) {
        // ページ遷移後にアドレスバーを表示させる
        requestAnimationFrame(() => {
          resetStyleModal()
          resolve()
        })
      } else {
        resolve()
      }
    })

      .then(() => {
        // ページ固有JS追加後の処理
        const promisePage = new Promise((resolve) => {
          eventBus.once('initPageJs', resolve)
        })

        // ページ固有CSS置換
        const promiseManageStyles = manageStyles()

        // ページ固有JS置換
        const promiseManageScripts = manageScripts().then(() => {
          initEachPage(to)
        })

        // プリロード画像読み込み
        const promisePreloadImage = loadImage(getPreloadImagePathToPage())

        return Promise.all([
          // promisePage,
          promiseManageStyles,
          promiseManageScripts,
          promisePreloadImage,
        ])
      })

      // 次ページ表示
      .then(async () => {
        emitEnterReady()

        to.classList.remove('-out')
        to.classList.add('-show', '-in', '-immediate')

        await wait(0)

        // スクロール位置変更
        await setScrollPosition()

        emitEnterShow()

        emitLeaveCompleted()

        // 前ページ要素削除
        from.remove()
        removePrevStyle()

        to.classList.remove('-in')

        store.cScroll.update()
      })

      // in完了
      .then(done)
  }
}
