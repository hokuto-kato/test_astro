import Component from '~/js/parentClass/Component'
import { getVariableSizeRem } from '~/js/utils/dom'

//
// main
//

export default class VariableImg extends Component {
  static selectorRoot = '[data-variable-img]'

  constructor(option) {
    super(option)

    const { el } = this
    el.style.width = getVariableSizeRem(el.width)
    el.style.height = getVariableSizeRem(el.height)
  }
}
