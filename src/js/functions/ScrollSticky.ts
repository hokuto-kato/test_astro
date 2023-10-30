import store from '~/js/managers/store'
import Component from '~/js/parentClass/Component'
import { getComputedTransform } from '~/js/utils/dom'

//
// パラメーター
//

//
// main
//

export default class ScrollSticky extends Component {
  static selectorRoot = '[data-scroll-sticky]'

  onInit() {
    this.isDisable = false
    if (!this.isSmoothScroll) {
      this.el.style.position = 'sticky'
      this.isDisable = true
      return
    }

    this.elTarget = document.querySelector(this.el.dataset.scrollSticky)
  }

  onScroll(scrollY) {
    if (
      this.isDisable ||
      !this.isResize ||
      store.isOpenModal ||
      store.isTransitioning
    )
      return

    this.scroll(scrollY)
  }

  scroll(scrollY, isForce = false) {
    if (this.scrollYStart <= scrollY && scrollY <= this.scrollYEnd) {
      if (!this.isEnter) {
        this.isEnter = true
      }

      this.setTransform(scrollY)
    } else {
      if (this.isEnter || isForce) {
        this.isEnter = false

        // リセット
        this.setTransform(
          this.scrollYEnd < scrollY ? this.scrollYEnd : this.scrollYStart
        )
      }
    }
  }

  setTransform(scrollY) {
    this.el.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,${
      scrollY - this.scrollYStart
    },0,1)`
  }

  resize() {
    if (this.isDisable) return
    if (store.isOpenModal) return
    this.isResize = true

    const rect = this.elTarget.getBoundingClientRect()
    const offset =
      'scrollStickyOffset' in this.el.dataset
        ? Number(this.el.dataset.scrollStickyOffset)
        : 0
    const yElTransitionContents = getComputedTransform(
      store.elTransitionContents
    ).y
    this.scrollYStart = rect.top + this.scrollY - yElTransitionContents - offset
    this.scrollYEnd =
      rect.bottom +
      this.scrollY -
      yElTransitionContents -
      this.el.offsetHeight -
      offset

    this.scroll(this.scrollY, true)
  }

  onResize() {
    this.resize()
  }

  onResizeScroll() {
    requestAnimationFrame(() => {
      this.resize()
    })
  }
}
