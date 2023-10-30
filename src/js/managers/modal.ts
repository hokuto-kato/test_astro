import { getScrollBarWidth } from '~/js/utils/dom'
import eventBus from '~/js/events/eventBus'
import store from '~/js/managers/store'

//
// state
//

const state = {
  id: '',
  modalOpened: null,
  targetFixedFull: null,
  scrollY: 0,
  overflowY: '',
  height: '',
  padding: 0,
}

//
// main
//

eventBus.on('openModal', open)
eventBus.on('closeModal', close)

export function open(id: string) {
  store.isOpenModal = true
  state.id = id
  eventBus.emit('beforeSetModalStyle', state.id)
  state.modalOpened = store.modals[state.id]
  setStyleModal()
  eventBus.emit('startOpenModal', state.id)
  state.modalOpened.open(() => {
    eventBus.emit('completeOpenModal', state.id)
  })
}

export function close(id, isNoAnimation = false) {
  if (!state.modalOpened) return

  eventBus.emit('beforeResetModalStyle', state.id)
  resetStyleModal()
  store.isOpenModal = false
  eventBus.emit('startCloseModal', state.id)
  state.modalOpened.close(() => {
    state.modalOpened = null
    eventBus.emit('completeCloseModal', state.id)
  }, isNoAnimation)
}

// ページスクロール無効化用スタイル設定
export function setStyleModal() {
  if (state.modalOpened) {
    state.modalOpened.el.scrollTo(0, 0)
  }

  state.targetFixedFull = document.querySelectorAll(
    'body, [data-fixed], .tp-dfwv'
  )
  state.padding = getScrollBarWidth()
  if (state.padding) {
    const stylePaddingRight = `${state.padding}px`
    state.targetFixedFull.forEach((el) => {
      el.style.paddingRight = stylePaddingRight
    })
  }

  state.scrollY = window.pageYOffset

  state.height = document.body.style.height

  state.overflowY = document.documentElement.style.overflowY
  document.documentElement.style.overflowY = 'hidden'

  const { style } = document.body
  style.position = 'fixed'
  style.top = `-${state.scrollY}px`
  style.width = '100%'
  style.height = '100%'
}

export function resetStyleModal() {
  document.documentElement.style.overflowY = state.overflowY

  const { style } = document.body
  style.position = ''
  style.top = ''
  style.width = ''
  style.height = state.height

  window.scrollTo(0, state.scrollY)

  if (state.padding) {
    state.targetFixedFull.forEach((el) => {
      el.style.paddingRight = ''
    })
  }
}
