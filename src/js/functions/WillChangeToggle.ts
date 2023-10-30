import Component from '~/js/parentClass/Component'
import { isTouch } from '~/js/utils/mouse'

export default class WillChangeToggle extends Component {
  static selectorRoot = '[data-will-change]'

  onInit() {
    this.pcOnly = 'willChangePc' in this.el.dataset
    this.spOnly = 'willChangeSp' in this.el.dataset
    this.value = this.el.dataset.willChange
  }

  onIntersect({ isIntersecting }) {
    if (isTouch) return
    if (isIntersecting) {
      if (this.pcOnly && !this.isSp) {
        this.el.style.willChange = this.value
      }
      if (this.spOnly && this.isSp) {
        this.el.style.willChange = this.value
      }
      if (!this.pcOnly && !this.spOnly) {
        this.el.style.willChange = this.value
      }
    } else {
      this.el.style.willChange = ''
    }
  }
}
