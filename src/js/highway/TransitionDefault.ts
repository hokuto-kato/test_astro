// import Highway from '@dogstudio/highway';
import Highway from '~/js/vendors/highway/src/highway'
import gsapK from '~/js/utils/gsapK'
import eventBus from '~/js/events/eventBus'
import { initEachPage } from '~/js/events/page'
import {
  manageStyles,
  manageScripts,
  getPreloadImagePathToPage,
  emitEnterShow,
  emitLeaveCompleted,
  emitEnterReady,
  removePrevStyle,
  destroyCompletely,
  setScrollPosition,
} from '~/js/events/asynchronousTransition'
import store from '~/js/managers/store'

import { isMobile } from '~/js/utils/navigator'
import { resetStyleModal, setStyleModal } from '~/js/managers/modal'
import { loadImage } from '~/js/utils/dom'
import media from '~/js/utils/media'
import { wait } from '~/js/utils/time'

//
// パラメーター
//

const DURATION_FADE_HIDE = 0.1
const DURATION_FADE_HIDE_SP = 0.1
const EASE_FADE_HIDE = 'power2.in'

const DURATION_FADE_SHOW = 0.3
const DURATION_FADE_SHOW_SP = 0.3
const EASE_MOVE_SHOW = 'power2.out'

const DELAY_SHOW = 0

//
// state
//

const state = {
  isPullAddressBar: false,
}

//
// main
//

// let isMenu = false
let isPopBack = false

export default class TransitionDefault extends Highway.Transition {
  async out({ from, done }) {
    // isMenu = this.name === 'menu'

    if (isMobile) {
      from.classList.add('-show', '-out', '-immediate')

      destroyCompletely()
    } else {
      isPopBack = store.popDirection === 'back'

      gsap.set(from.parentElement, {
        height: from.offsetHeight,
      })

      // 前ページ非表示
      from.style.setProperty('--view-y', `${-store.scrollY}px`)

      const classList = ['-show', '-out']
      if (isPopBack) {
        classList.push('-back')
      }
      from.classList.remove('-in', '-back')
      from.classList.add(...classList)

      gsapK
        .to(from, [
          // 前ページフェードアウト
          {
            opacity: 0,
            duration: media.isSp ? DURATION_FADE_HIDE_SP : DURATION_FADE_HIDE,
            ease: EASE_FADE_HIDE,
          },
        ])
        .then(() => {
          destroyCompletely()
        })
    }

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
    new Promise<void>((resolve) => {
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
          // TODO: ここが遅い
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

        if (isMobile) {
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
        } else {
          to.style.setProperty(
            '--view-y',
            `${
              (((store.isPopstate ? store.cScroll.getStorageScrollY() : 0) +
                window.innerHeight * 0.5) /
                to.offsetHeight) *
              100
            }%`
          )

          const classList = ['-show', '-in']
          if (isPopBack) {
            classList.push('-back')
          }
          to.classList.remove('-out', '-back')
          to.classList.add(...classList)

          // スクロール位置変更
          await setScrollPosition()

          return gsapK.fromTo(
            to,
            {
              opacity: 0,
            },
            {
              opacity: 1,
              duration: media.isSp ? DURATION_FADE_SHOW_SP : DURATION_FADE_SHOW,
              ease: EASE_MOVE_SHOW,
              delay: DELAY_SHOW,
              onStart: () => {
                // 次ページ内要素のアニメーション開始
                emitEnterShow()
              },
              onComplete: () => {
                emitLeaveCompleted()

                // 前ページ要素削除
                from.remove()
                removePrevStyle()

                // 次ページ要素のスタイルリセット
                to.parentElement.style.height = ''
                to.classList.remove('-in', '-back')

                store.cScroll.update()

                gsap.set([to], {
                  clearProps: true,
                })
              },
            }
          )
        }
      })

      // in完了
      .then(done)
  }
}
