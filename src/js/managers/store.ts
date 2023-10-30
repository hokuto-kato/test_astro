import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type { Pane } from 'tweakpane'
import type ScrollLenis from '~/js/scroll/ScrollLenis'
import type MinimizeIntersecting from '~/js/utils/minimizeIntersecting'
import type Local from '~js/parentClass/Local'
import type { ComponentClass } from '~js/types/global'

export type Store = {
  designWidthPc: number
  designHeightPc: number
  // designWidthSp: number
  designWidthSp: number
  designHeightSp: number
  breakpoint: number
  baseWidthMinPc: number
  windowWidth: number
  windowHeight: number
  variableSizeRate: number
  pageId: string
  pageIdPrev: string
  cScroll: ScrollLenis
  cIntersecting: MinimizeIntersecting
  scrollY: number
  scrollDirection: 0 | 1 | -1
  scrollYSmooth: number
  scrollYNative: number
  windowHeightInitial: number
  statusBarHeight: number
  componentCache: Map<Element, string[]>
  modals: Record<string, any>
  isOpenModal: boolean
  view: HTMLElement | SVGElement
  isLoadStart: Record<string, boolean>
  isLoadDone: Record<string, boolean>
  isTransitioning: boolean
  isTransitioned: boolean
  isLoadedStyles: boolean
  isLeave: boolean
  isPopstate: boolean
  popDirection: 'back' | 'forward'
  isInitializedAsynchronousTransition: boolean
  historyCount: number
  prevHistoryCount: number
  isScrollAnimating: boolean
  elTransitionContents: Element | null
  isActiveTypekit: boolean
  isHorizontalScroll: boolean
  isDebug: boolean
  pane: Pane
  isHiddenPane: boolean
  gltfLoader: GLTFLoader
  loadingCountList: Record<string, (Promise<any> | null)[]>
  components:
    | Record<
        | 'topKv'
        | 'topIntro'
        | 'topService'
        | 'topAbout'
        | 'topNews'
        | 'topFooter',
        Local
      >
    | Record<string, ComponentClass>
}

const store: Store = (window._GLOBAL_.store = window._GLOBAL_.store || {
  designWidthPc: 1600,
  designHeightPc: 964,
  // designWidthSp: 750 / 2,
  designWidthSp: 414 / 2,
  designHeightSp: 1332 / 2,
  breakpoint: 768,
  baseWidthMinPc: 1200,
  windowWidth: 0,
  windowHeight: 0,
  variableSizeRate: 1,
  pageId: '',
  pageIdPrev: '',
  cScroll: null,
  cIntersecting: null,
  scrollY: 0, // 現在のスクロールの位置（スムーススクロール有効なときはスムーススクロールの位置、無効なときはブラウザネイティブのスクロール位置）
  scrollDirection: 0, // 現在のスクロールの向き（下：1, 上: -1）
  scrollYSmooth: 0, // 現在のスムーススクロールの位置
  scrollYNative: 0, // 現在のブラウザネイティブのスクロール位置
  windowHeightInitial: window.innerHeight,
  statusBarHeight: 0,
  componentCache: new Map(),
  modals: {},
  isOpenModal: false,
  view: null, // 現在のページの[data-router-view]要素
  isLoadStart: {
    pageTop: false,
    pageSmbService: false,
    pageAbout: false,
    pageCareers: false,
  },
  isLoadDone: {
    pageTop: false,
    pageSmbService: false,
    pageAbout: false,
    pageCareers: false,
  },
  isTransitioning: false, // 非同期遷移中かどうか
  isTransitioned: false, // 非同期遷移済みかどうか（初期表示じゃないかどうか）
  isLoadedStyles: false, // 非同期遷移後にCSSの読み込みがすべて完了した後かどうか
  isLeave: false, // 非同期遷移のページ離脱中かどうか
  isPopstate: false,
  popDirection: null,
  isInitializedAsynchronousTransition: false,
  historyCount: 0,
  prevHistoryCount: 0,
  isScrollAnimating: false, // スムーススクロールしているとき
  elTransitionContents: document.querySelector('[data-transition-contents]'),
  isActiveTypekit: false,
  isHorizontalScroll: false,
  isDebug: new URL(window.location.href).searchParams.has('debug'),
  pane: null,
  isHiddenPane: false,
  gltfLoader: null,
  loadingCountList: {
    pageTop: [],
    pageWhyUse: [],
    pageSmbService: [],
    pageAbout: [],
    pageCareers: [],
    page404: [],
  },
  components: {},
})

export default store
