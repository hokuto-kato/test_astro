// つける必要があるdata属性=====
// data-sort（ソート機能を実装する大元につける）
// data-sort-data（出力されたデータの親要素）
// data-sort-item（ソートする選択肢inputとlabelの親要素の一つひとつにつける）
// data-sort-item-input（ソートする選択肢inputの一つひとつにつける）
// data-sort-item-label-text（ソートする選択肢のlabelの一つひとつにつける）
// data-sort-article-list（記事、リストのアイテムの親要素につける。ページャーがある場合は値に'pager'を指定する）
// 以下、任意 =======
// data-sort-notfound（任意。1件も記事がない時のテキストがあればつける）
// data-sort-accordion（任意。選択肢を内包しているアコーディオンがあればつける）
// data-sort-result（任意。ソートする内容を出力したい時につける）

import Component from '~/js/parentClass/Component'
import { createApp, reactive } from 'petite-vue'
import { gsap } from 'gsap'
import merge from 'deepmerge'
import Pager from '~/js/functions/Pager'
import ViewMore from '~/js/functions/ViewMore'
import store from '~/js/managers/store'
import { wait } from '~/js/utils/time'
import { initComponents } from '~js/managers/components'

const param = {
  duration: 1,
}

class SortItem extends Component {
  static selectorRoot = '[data-sort-item]'
  input: HTMLInputElement | HTMLSelectElement
  id: string
  value: string
  name: string
  label: HTMLElement
  textElem: HTMLElement
  text: string | null
  onChangeHandler: () => void
  isSelectTag: boolean

  onInit() {
    this.input = this.el.querySelector('[data-sort-item-input]')
    this.isSelectTag = this.input.tagName === 'SELECT'

    this.id = this.input.id
    this.value = this.input.value
    this.name = this.input.name

    if (!this.isSelectTag) {
      this.label = this.el.querySelector('label[for="' + this.id + '"]')
      this.textElem =
        this.label.querySelector('[data-sort-item-label-text]') || this.label
      this.text = this.textElem.textContent
    } else {
      this.selectTagGetData()
    }

    // Event
    this.onChangeHandler = this.onChange.bind(this)
    this.input.addEventListener('change', this.onChangeHandler)

    if (this.value === 'all' && this.input.checked) {
      this.label.style.pointerEvents = 'none'
      this.input.style.pointerEvents = 'none'
    }
  }

  onChange() {
    // 値が変わったら発火
    if (!this.isSelectTag) {
      this.option.checkTarget({ group: this.name, value: this.value })
    }
    this.option.createData()

    if (this.value === 'all' && this.input.checked) {
      this.label.style.pointerEvents = 'none'
      this.input.style.pointerEvents = 'none'
    }
  }

  otherChange({ group, value }: { group: string; value: string }) {
    // selectタグは対象外
    if (this.isSelectTag) return
    // 引数のgroup違うgroupは対象外
    if (group !== this.name) return
    // 実際にクリックされた選択肢は対象外
    if (value === this.value) return

    if (this.value === 'all' && value !== 'all') {
      this.checkFalse()
    } else if (this.value !== 'all' && value === 'all') {
      this.checkFalse()
    }
  }

  check({ group, value }: { group: string; value: string }) {
    if (this.isSelectTag) {
      if (group !== this.name) return
      Array.prototype.some.call(this.input.options, (option, index) => {
        const bool = option.value === value
        if (bool) {
          this.input.options[index].selected = true
        }
        return bool
      })
    } else {
      if (group === this.name) {
        if (value === this.value) {
          this.checkTrue()
        }
        if (this.value === 'all') {
          this.checkFalse()
        }
      }
    }
  }

  checkTrue() {
    this.input.checked = true
    if (this.value === 'all') {
      this.label.style.pointerEvents = 'none'
      this.input.style.pointerEvents = 'none'
    }
  }

  checkFalse() {
    this.input.checked = false
    if (this.value === 'all') {
      this.label.style.pointerEvents = ''
      this.input.style.pointerEvents = ''
    }
  }

  selectTagGetData() {
    this.value = this.input.value
    this.text = this.input.options[this.input.selectedIndex].textContent
  }

  getStatus(container: Record<string, object[]>) {
    if (!container[this.name]) {
      container[this.name] = []
    }
    if (this.isSelectTag) {
      this.selectTagGetData()
      container[this.name].push({ value: this.value, text: this.text })
    } else {
      if (this.input.checked) {
        container[this.name].push({ value: this.value, text: this.text })
      }
    }
  }

  onDestroy() {
    this.input.removeEventListener('change', this.onChangeHandler)
  }
}

class ArticleList extends Component {
  static selectorRoot = '[data-sort-article-list]'
  tl: GSAPTimeline | null
  notfoundText: HTMLElement | null
  scrollTarget: any
  pager: Pager | any
  store: { sortedData: []; showData: []; isFirst: boolean }
  vue: {}
  isPager: boolean
  viewMore: ViewMore | any
  scrollTargetFocus: HTMLElement
  isViewMore: boolean

  onInit() {
    this.tl = null

    // this.initComponentsOnMutation(this.el)

    // petit-vueのcreateApp =====
    const store = (this.store = reactive({
      sortedData: [],
      showData: [],
      isFirst: true,
      isNotFound: false,
    }))
    this.vue = createApp({
      store,
    }).mount(this.el)
    // ========================

    // 1件もない時の表示があったら処理する
    this.notfoundText = document.querySelector('[data-sort-notfound]')
    if (this.notfoundText) {
      this.notfoundText.style.display = 'none'
    }

    this.scrollTarget = document.querySelector(this.el.dataset.listScrollTo)
    if (this.scrollTarget) {
      this.scrollTargetFocus = this.scrollTarget.querySelector(
        'a, label, select, button, input[type=radio], input[type=checkbox]',
      )
    }

    // pagerありなら発火
    this.isPager = this.el.dataset.sortArticleList === 'pager'
    if (this.isPager) {
      this.pager = Pager.createAll(this.option.context, {
        store,
        listContainer: this.el,
        replaceAnimation: this.replaceAnimation.bind(this),
      })[0]
    }

    // viewmoreありなら発火
    this.isViewMore = this.el.dataset.sortArticleList === 'viewMore'
    if (this.isViewMore) {
      this.viewMore = ViewMore.createAll(this.option.context, {
        store,
        listContainer: this.el,
        replaceAnimation: this.replaceAnimation.bind(this),
      })[0]
    }

    this.isScroll = this.isPager
  }

  setStoreItem(data: []) {
    this.store.showData = data
    setTimeout(() => {
      initComponents(this.el)
    }, 0)
  }

  replaceAnimation(callback: () => void, isImmediate = false) {
    // リスト入替用アニメーション
    const tl = gsap.timeline()
    tl.add([
      this.isScroll &&
        !isImmediate &&
        (!this.store.isFirst || store.pageId === store.pageIdPrev) &&
        this.resetScroll(),
    ]).call(() => {
      if (this.store.isFirst) this.store.isFirst = false
      this.removeNotFound()
      this.store.isNotFound = this.store.sortedData.length === 0
      if (this.store.isNotFound) {
        this.setNotfound()
      } else {
        callback()
      }
    })
  }

  removeItems() {
    this.destroyAnimation()
    // リスト内のdomを全て削除
    if (!this.el.children.length) return
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild)
    }
  }

  async setList(resultData: [], isImmediate) {
    this.store.sortedData.forEach((el) => {
      el.isShow = false
    })

    if (!isImmediate) {
      // フェードアウトアニメーションの時間分遅延
      await wait(0.1)
    }

    this.store.sortedData = resultData
    if (this.pager) {
      this.pager.update({ isFirst: this.store.isFirst, isImmediate })
    } else if (this.viewMore) {
      this.viewMore.reset(isImmediate)
    } else {
      this.store.showData = resultData
      this.replaceAnimation(() => {
        this.store.showData = resultData
        setTimeout(() => {
          initComponents(this.el)
        }, 0)
      }, isImmediate)
    }

    if (!this.store.isFirst) {
      this.option.setURLParams()
    }
  }

  removeNotFound() {
    // 0件表示を解除
    if (!this.notfoundText) return
    this.notfoundText.classList.remove('-isShow')
  }

  setNotfound() {
    // 0件表示する
    if (!this.notfoundText) return
    this.notfoundText.classList.add('-isShow')
    this.emitResizeAll()
  }

  resetScroll() {
    return new Promise((resolve) => {
      this.scrollTo(this.scrollTarget || this.option.context, {
        duration: param.duration,
        onComplete: () => {
          if (this.scrollTargetFocus) this.scrollTargetFocus.focus()
          resolve()
        },
      })
    })
  }

  onDestroy() {
    this.vue.unmount()
  }
}

export default class Sort extends Component {
  static selectorRoot = '[data-sort]:not([data-sort-manual])'
  allDataList: []
  currentData: Record<string, object[]>
  articleListElem: HTMLElement[]
  articleList: ArticleList | any
  resultElems: HTMLElement[]
  form: HTMLElement
  sortItems: (SortItem | any)[]
  defaultParams: {}
  accordions: HTMLElement[]

  async onInit() {
    const {} = merge(this.option, JSON.parse(this.el.dataset.sort || '{}'))

    const dataElem: HTMLElement | null =
      this.el.querySelector('[data-sort-data]')
    this.allDataList = JSON.parse(dataElem?.textContent || '')

    this.currentData = {}

    // await wait(0.1)

    // ソート対象のinputを取得
    this.sortItems = SortItem.createAll(this.el, {
      createData: this.createData.bind(this),
      checkTarget: this.checkTarget.bind(this),
    })

    // ソート対象のリストを取得してLArticleListを発火、
    this.articleList = ArticleList.createAll(this.el, {
      allDataList: this.allDataList,
      context: this.el,
      setURLParams: this.setURLParams.bind(this),
    })[0]

    // 選択肢を内包しているアコーディオンがあればAccordionTriggerを取得
    this.accordions = this.el.querySelectorAll('[data-sort-accordion]')

    // アクセス時にURLについているパラメータをパース
    this.defaultParams = this.getURLParams()

    // アコーディオンがあったらついてるパラメータに合わせてアコーディオンを開く
    if (this.accordions) this.openAccordion()

    // パラメータに合わせて、選択肢をアクティブにする
    this.checkFromData(this.defaultParams)

    // 選択肢のアクティブ状態に合わせてソートしたデータを作成する
    this.createData(true)
  }

  createData(isImmediate = false) {
    const tmpData = {}
    this.sortItems.forEach((item) => item.getStatus(tmpData))
    this.currentData = tmpData

    this.sortExecute(isImmediate)
  }

  checkTarget({ group, value }: { group: string; value: string }) {
    this.sortItems.forEach((item) => item.otherChange({ group, value }))
  }

  sortExecute(isImmediate) {
    let sortResult = this.allDataList.concat()
    const { currentData } = this

    for (const key in currentData) {
      const targetGroup = currentData[key]
      // パラメータを書き換える
      if (targetGroup.length === 0 || targetGroup[0].value === 'all') {
        // all以外のすべての選択を解除したらallをアクティブにする
        if (targetGroup.length === 0) {
          this.sortItems.forEach((item) => {
            if (item.name === key && item.value === 'all') {
              item.checkTrue()
            }
          })
        }
        continue
      }
      sortResult = sortResult.filter((listItem) => {
        return targetGroup.some((dataItem) => {
          // 値が等価か、配列に含んでいればtrue
          return (
            dataItem.value === listItem[key] ||
            listItem[key].includes(dataItem.value)
          )
        })
      })
    }
    // this.setURLParams()
    this.articleList.setList(sortResult, isImmediate)
  }

  setURLParams() {
    const url = new URL(window.location.href)
    const { currentData } = this
    for (const key in currentData) {
      const group = currentData[key]
      const valueString = group.map((item) => item.value).join(',')
      if (group.length === 0 || group[0].value === 'all') {
        url.searchParams.delete(key)
      } else {
        url.searchParams.set(key, valueString)
      }
    }
    const decodeUrl = decodeURIComponent(url.href)
    window.history.pushState({}, '', decodeUrl)
  }

  getURLParams() {
    // URLを取得して、ソート用のデフォルト設定を取得
    const search = decodeURIComponent(location.search)

    const paramText = search.slice(1, search.length)
    const paramSplit = paramText.split('&')
    const params = {}

    if (paramSplit[0] !== '') {
      paramSplit.forEach((item) => {
        const tmpParam = item.split('=')
        const key = tmpParam[0]
        const value = tmpParam[1].split(',')

        params[key] = value.map((item) => {
          return { value: item }
        })
      })
    }
    return params
  }

  checkFromData(sortData: Record<string, []>) {
    for (const group in sortData) {
      sortData[group].forEach((dataItem: { value: string }) => {
        this.sortItems.forEach((item) =>
          item.check({ group, value: dataItem.value }),
        )
      })
    }
  }

  openAccordion() {
    const keyArray = Object.keys(this.defaultParams)
    this.accordions.forEach((acc) => {
      const targetGroup = acc.dataset.sortAccordion
      const isSorted = keyArray.some((key) => key === targetGroup)
      if (isSorted) setTimeout(() => acc.click(), 1000)
    })
  }

  onDestroy() {
    this.allDataList = []
  }
}
