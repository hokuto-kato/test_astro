import { Pane } from 'tweakpane'
import store from './store'
import { debounce } from '~js/utils/event'

export default function initPane() {
  if (_ENV_.enablePane) {
    const pane =
      store.pane ||
      (store.pane = new Pane({
        title: 'Control',
        expanded: _ENV_.isOpenPane,
      }))

    pane.hidden = !_ENV_.isShowPane
    if (store.isHiddenPane) {
      hidePane(true)
    }

    /* Control上でホイール＆タッチ操作してもページがスクロールしないようにする */
    const scrollerElement = pane.containerElem_.children[0]
    scrollerElement.addEventListener('wheel', (e) => {
      e.stopPropagation()
    })
    scrollerElement.addEventListener('touchmove', (e) => {
      e.stopPropagation()
    })

    // pane.on('change', this.render.bind(this))

    document.addEventListener('keydown', ({ key }) => {
      if (key === 'h') {
        if (store.isHiddenPane) {
          showPane()
        } else {
          hidePane()
        }
      }
    })

    pane
      .addButton({
        title: 'Refresh',
      })
      .on('click', () => {
        refreshPane()
      })

    // pane
    //   .addButton({
    //     title: 'Export',
    //   })
    //   .on('click', () => {
    //     console.log('Export:', pane.exportPreset())
    //   })
  }
}

export function showPane() {
  if (!store.isHiddenPane) return
  store.isHiddenPane = false
  if (store.pane?.element.parentElement)
    store.pane.element.parentElement.style.visibility = ''
}

export function hidePane(isForce = false) {
  if (!isForce && store.isHiddenPane) return
  store.isHiddenPane = true
  if (store.pane?.element.parentElement)
    store.pane.element.parentElement.style.visibility = 'hidden'
}

export const refreshPane = debounce(() => {
  store.pane.refresh()
})
