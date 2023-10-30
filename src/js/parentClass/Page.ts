import Component, { type ComponentOptions } from '~/js/parentClass/Component'
import { registerPageComponent } from '~/js/events/page'
import eventBus from '~/js/events/eventBus'
import store from '~/js/managers/store'

export default class Page extends Component {
  static isPage = true

  /**
   *Creates an instance of Page.
   * @param {Object} [option={}]
   * @param {Element} [option.el=document.body]
   * @param {boolean} [option.isAutoPlayTick=false] tickを自動実行するか
   * @memberof Page
   */
  constructor(option: ComponentOptions = {}) {
    const { el = store.view || document.body } = option
    option.isManual = true

    super({ el, ...option })

    if (this.onInit) {
      if (store.isLoadedStyles) {
        this.onInit()
      } else {
        eventBus.once('loadedStyles', () => {
          this.onInit!()
        })
      }
    }
  }

  static register() {
    registerPageComponent(this)
    eventBus.emit('readyPage')
  }
}
