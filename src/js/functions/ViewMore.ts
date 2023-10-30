import Component from '~/js/parentClass/Component'
import { initComponents } from '~js/managers/components'

const DEFAULT_LIMIT_NUMBER = 10

export default class ViewMore extends Component {
  static selectorRoot = '[data-view-more]'
  static intersectOptions = {
    rootMargin: '0% 0% -30%',
  }
  pageCount = 0

  onInit() {
    this.limitNumber = Number(this.el.dataset.viewMore) || DEFAULT_LIMIT_NUMBER
    this.listData = this.option.store
  }

  showList(tmpArray, isImmediate) {
    this.listData.showData = tmpArray
    setTimeout(() => {
      initComponents(this.option.listContainer)
    }, 0)

    if (isImmediate) {
      this.listData.showData.forEach((el, i) => {
        el.isShow = true
      })
    } else {
      setTimeout(() => {
        this.listData.showData.forEach((el, i) => {
          gsap.delayedCall(
            0.1 * Math.max(i - this.limitNumber * (this.pageCount - 1), 0),
            () => {
              el.isShow = true
            },
          )
        })
      }, 100) // 1つ目の項目も正しくアニメーションするように遅延させる
    }
  }

  setMore() {
    if (this.listData.showData.length < this.listData.sortedData.length) {
      this.show()
    } else {
      this.hide()
    }
  }

  showNext(isImmediate) {
    this.pageCount++
    const tmpArray = this.listData.sortedData.slice(
      0,
      this.limitNumber * this.pageCount,
    )
    this.option.replaceAnimation(() => {
      this.showList(tmpArray, isImmediate)
      this.setMore()
    }, isImmediate)
  }

  showAll() {
    this.listData.showData = this.listData.sortedData
    this.hide()
    requestAnimationFrame(() => {
      const itemArray = this.option.listContainer.querySelectorAll('a[href]')
      const focusTarget = itemArray[this.limitNumber + 1]
      focusTarget.focus()
    })
  }

  async reset(isImmediate) {
    this.pageCount = 0
    this.showNext(isImmediate)
  }

  onClick() {
    this.showNext()
  }

  onIntersect({ isIntersecting }) {
    if (isIntersecting) {
      this.showNext()
    }
  }

  hide() {
    this.el.style.display = 'none'
  }

  show() {
    this.el.style.display = 'block'
  }
}
