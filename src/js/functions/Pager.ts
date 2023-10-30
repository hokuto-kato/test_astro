import Component from '~/js/parentClass/Component'
import { createApp, reactive } from 'petite-vue'
import {
  getUrl,
  getUrlParam,
  deleteUrlParam,
  pushUrl,
  setUrlParam,
} from '~/js/utils/url'
import { pad2 } from '~/js/utils/string'
import media from '~/js/utils/media'
import { gsap } from 'gsap'
import { initComponents } from '~js/managers/components'

//
// state
//

const PER_PAGE = 8 // 1ページに表示する記事の数
const MAX_PAGER_PC = 5 // PCの常に表示するページャーの数
const MAX_PAGER_SP = 3 // SPの常に表示するページャーの数
const MAX_PAGER = media.isSp ? MAX_PAGER_SP : MAX_PAGER_PC
const CURRENT_CENTER = false // trueでcurrentが真ん中になる
const BEFORE_PAGER = CURRENT_CENTER ? Math.floor(MAX_PAGER / 2) : 0

const param = {
  duration: 0.6,
}

//
// methods
//
export default class Pager extends Component {
  static selectorRoot = '[data-pager]'

  onInit() {
    this.maxPager = this.isSp ? MAX_PAGER_SP : MAX_PAGER

    this.listStore = this.option.store

    this.elPager = this.el.querySelector('[data-pager-inner]') || this.el
    this.prev = this.elPager.querySelector('[data-pager-prev]')
    this.next = this.elPager.querySelector('[data-pager-next]')

    this.scrollTarget = document.querySelector(this.el.dataset.listScrollTo)
    if (this.scrollTarget) {
      this.scrollTargetFocus = this.scrollTarget.querySelector(
        'a, label, select, button, input[type=radio], input[type=checkbox]',
      )
    }

    this.targetList = document.querySelector(this.el.dataset.pagerTargetList)

    const pagerStore = (this.pagerStore = reactive({
      chunkData: [],
      numbers: [],
      maxNumber: {},
      minNumber: {},
      hasMoreNext: false,
      hasMorePrev: false,
      isFirst: false,
      isShowMax: false,
      isShowMoreNext: false,
      isShowMin: false,
      isShowMorePrev: false,
    }))

    this.vue = createApp({
      pagerStore,
      change: (page) => {
        this.changePage(page)
      },
      next: () => {
        this.changePage(this.page + 1)
      },
      prev: () => {
        this.changePage(this.page - 1)
      },
    })
      .directive('visible', ({ el, exp, get, effect }) => {
        effect(() => {
          el.style.visibility = get(exp) ? 'visible' : 'hidden'
        })
      })
      .mount(this.elPager)
  }

  chunk(arr, size) {
    return arr.reduce(
      (newarr, _, i) =>
        i % size ? newarr : [...newarr, arr.slice(i, i + size)],
      [],
    )
  }

  getPageFromParam() {
    this.url = getUrl()
    const param = getUrlParam(this.url, 'page')
    this.page = !param ? 1 : parseInt(param)
  }

  setParamToURL() {
    this.url = getUrl()
    if (this.page === 1) {
      deleteUrlParam(this.url, 'page')
    } else {
      setUrlParam(this.url, 'page', this.page)
    }
    pushUrl(this.url)
  }

  showList(pageNumber, isImmediate) {
    this.listStore.showData = this.pagerStore.chunkData[pageNumber - 1] || []
    setTimeout(() => {
      initComponents(this.option.listContainer)
    }, 0)

    if (isImmediate) {
      this.listStore.showData.forEach((el, i) => {
        el.isShow = true
      })
    } else {
      this.listStore.showData.forEach((el, i) => {
        el.isShow = false
      })
      setTimeout(() => {
        this.listStore.showData.forEach((el, i) => {
          gsap.delayedCall(0.1 * i, () => {
            el.isShow = true
          })
        })
      }, 200) // 1つ目の項目も正しくアニメーションするように遅延させる
    }
  }

  setPager() {
    // 1ページに収まるか、データがない場合はページャーを消す
    if (
      (this.page === 1 && this.pagerStore.chunkData.length === 1) ||
      this.pagerStore.chunkData.length === 0
    ) {
      this.hide()
      return
    } else {
      this.show()
    }

    // 以降、2ページ以上存在する場合 =======

    // 表示する番号のデータを作る
    const tmpArray = []
    const maxNumber = this.pagerStore.chunkData.length
    // 表示するページャーの番号の開始位置を設定
    const start = Math.max(
      Math.min(this.page - 1 - BEFORE_PAGER, maxNumber - MAX_PAGER),
      0,
    )

    for (let i = start; i < maxNumber; i++) {
      if (i === start + MAX_PAGER) {
        break
      }
      const pageNumber = i + 1
      tmpArray.push({
        pageNumber,
        text: pad2(pageNumber),
        isCurrent: pageNumber === this.page,
      })
    }

    // 最大ページ数を取得する & 最大ページのデータを作る
    this.pagerStore.maxNumber = {
      pageNumber: maxNumber,
      text: pad2(maxNumber),
    }
    // 最大ページを表示するか決める
    this.pagerStore.isShowMax =
      maxNumber !== tmpArray[tmpArray.length - 1].pageNumber
    this.pagerStore.isShowMoreNext =
      maxNumber - tmpArray[tmpArray.length - 1].pageNumber > 1

    // 最小ページを格納
    this.pagerStore.minNumber = {
      pageNumber: 1,
      text: '01',
    }
    // 最小ページを表示するか決める
    this.pagerStore.isShowMin = tmpArray[0].pageNumber - 1 > 0
    this.pagerStore.isShowMorePrev = tmpArray[0].pageNumber - 1 > 1

    // pagerを表示する
    this.pagerStore.numbers = tmpArray
  }

  judgeMore() {
    this.pagerStore.hasMorePrev = this.page !== 1
    this.pagerStore.hasMoreNext =
      this.page !== this.pagerStore.maxNumber.pageNumber
  }

  update({ isImmediate }) {
    this.pagerStore.chunkData = this.chunk(this.listStore.sortedData, PER_PAGE)

    if (this.listStore.isFirst) {
      // 初回ソート実行（初回アクセス）
      this.getPageFromParam()
      if (this.page > this.pagerStore.chunkData.length) {
        // 存在しないページにアクセスされた場合、1ページ目を表示
        this.changePage(1, false, isImmediate)
      } else {
        this.changePage(this.page, false, isImmediate)
      }
    } else {
      // 2回目以降ソート実行
      this.changePage(1, false, isImmediate)
    }
  }

  async changePage(pageNumber, isSetURL = true, isImmediate) {
    this.page = pageNumber
    this.option.replaceAnimation(
      () => this.showList(pageNumber, isImmediate),
      isImmediate,
    )
    this.setPager()
    this.judgeMore()
    if (isSetURL) this.setParamToURL()
  }

  show() {
    this.elPager.style.display = ''
  }

  hide() {
    this.elPager.style.display = 'none'
  }
}
