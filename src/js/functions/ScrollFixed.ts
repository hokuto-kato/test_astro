import store from '~/js/managers/store'
import Component from '~/js/parentClass/Component'
import { getComputedTransform } from '~/js/utils/dom'

//
// パラメーター
//

//
// main
//

export default class ScrollFixed extends Component {
  static selectorRoot = '[data-scroll-fixed]'

  onInit() {
    this.cScroll = store.cScroll

    if (!this.isSmoothScroll) {
      this.el.style.position = 'fixed'
    }
  }

  onScroll(scrollY) {
    if (!this.isSmoothScroll) return
    if (!this.isResize || store.isOpenModal) return
    if (!(this.scrollYStart <= scrollY && scrollY <= this.scrollYEnd)) return

    this.el.style.transform = this.cScroll.isHorizontal
      ? `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,${scrollY - this.scrollYBase},0,0,1)`
      : `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,${scrollY - this.scrollYBase},0,1)`
  }

  onResize({ windowWidth, windowHeight }) {
    if (!this.isSmoothScroll) return
    if (store.isOpenModal) return
    this.isResize = true

    const yElTransitionContents = getComputedTransform(
      store.elTransitionContents
    ).y

    const rect = this.cScroll.el.getBoundingClientRect()
    this.scrollYBase =
      rect[this.cScroll.isHorizontal ? 'left' : 'top'] +
      this.scrollY -
      yElTransitionContents
    this.scrollYStart =
      this.scrollYBase - this.cScroll.isHorizontal ? windowWidth : windowHeight
    this.scrollYEnd =
      rect[this.cScroll.isHorizontal ? 'right' : 'bottom'] +
      this.scrollY -
      yElTransitionContents
  }
}
