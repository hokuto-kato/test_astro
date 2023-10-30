import 'what-input'

import '~/js/core/first'
import initEvents from '~/js/core/event'
import '~js/managers/gsap'
import initPane from '~js/managers/pane'

import { emitResize } from '~/js/events/window'
import {
  setPageId,
  initEachPage,
  initAsynchronousTransition,
} from '~/js/events/page'
import eventBus from '~/js/events/eventBus'

import store from '~/js/managers/store'
import '~/js/managers/navigator'
import '~/js/managers/modal'
import {
  initPermanentComponents,
  setPermanentRoot,
} from '~/js/managers/components'

import { onLoad } from '~/js/utils/event'
import { isSpMatch } from '~/js/utils/media'
import MinimizeIntersecting from '~/js/utils/minimizeIntersecting'
import { getScrollBarWidth, setVariableSizeRate } from '~/js/utils/dom'

import type ScrollLenis from '~/js/scroll/ScrollLenis'
import type Highway from '~/js/vendors/highway/src/highway.js'

//
// main
//

export default function init({
  Scroll,
  transitions,
  onDoneInit,
}: {
  Scroll: typeof ScrollLenis
  transitions: Record<string, typeof Highway.Transition>
  onDoneInit?: () => void
}) {
  setVariableSizeRate()
  setScrollBarWidthCustomProperty()

  initEvents({ transitions })

  setPageId()

  const view = (store.view = document.querySelector('[data-router-view]')!)

  // view?.classList.add('-show')

  store.cIntersecting = new MinimizeIntersecting()

  // Typekit読み込み完了後
  // eventBus.once('activeTypekit', () => {
  //   store.isActiveTypekit = true
  // })

  // 100vhにしている要素
  const el100vh = document.querySelector('[data-100vh]')
  detect100vh()

  initPane()

  // 初期化
  function initMain() {
    setPermanentRoot()

    // 全ページ共通コンポーネント
    // new Lazy()
    store.cScroll = new Scroll(document.body)

    initPermanentComponents()

    // initInnerPermanentComponents()

    // 非同期遷移による書き換え対象内の汎用コンポーネント
    initEachPage(view, true)

    // 非同期遷移初期化
    if (_ENV_.enableEventAsynchronousTransition) {
      initAsynchronousTransition()
    }

    if (store.cScroll?.fireViewSelf) {
      store.cScroll?.fireViewSelf()
    }

    if (onDoneInit) {
      onDoneInit()
    }

    store.cScroll.onResize(() => {
      setVariableSizeRate()
      setScrollBarWidthCustomProperty()
      emitResize(true)
    })
    store.cScroll.onceResize(() => {
      // 初期表示後に正しいスクロール位置が再計算されるようにする
      store.cScroll.update()
      eventBus.emit('resizeFirst')
    })

    // 画像読み込み後に高さが変わる場合があるので強制リサイズする
    onLoad(() => {
      emitResize(true)
      store.cScroll.setResizeObserver()
      eventBus.emit('loaded')
    })

    // PC/SPの表示が切り替わったら、バグで崩れないようにリロードする
    isSpMatch(
      () => {
        location.reload()
      },
      () => {
        location.reload()
      },
    )
  }

  // 100vhにしている要素の高さが正常値になるまでinitを遅延させる（スマホ対策）
  function detect100vh() {
    if (!el100vh || (el100vh && el100vh.clientHeight > 0)) {
      initMain()
    } else {
      requestAnimationFrame(() => {
        detect100vh()
      })
    }
  }
}

function setScrollBarWidthCustomProperty() {
  document.documentElement.style.setProperty(
    '--scroll-bar-width',
    getScrollBarWidth() + 'px',
  )
}
