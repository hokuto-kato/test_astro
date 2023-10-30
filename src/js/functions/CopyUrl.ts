import Component from '~/js/parentClass/Component'
import { copyUrl } from '~/js/utils/copy'

//
// main
//

export default class CopyUrl extends Component {
  static selectorRoot = '[data-copy-url]'
  isDisable = false

  onClick() {
    if (this.isDisable) return
    this.isDisable = true

    copyUrl()
    this.el.classList.add('-done')
    setTimeout(() => {
      this.el.classList.remove('-done')
      this.isDisable = false
    }, 1200)
  }
}
