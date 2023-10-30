import Component from '~/js/parentClass/Component'
import store from '~/js/managers/store'

const SPEED = 60
const SPEED_SP = 30

export default class Marquee extends Component {
  static selectorRoot = '[data-marquee]:not([data-manual])'

  onInit() {
    if (this.isDestroyed) return

    const { el } = this
    const elModal = el.closest('[data-modal]')
    const {
      isDuplicate = true,
      isShort = false,
      isInModal = !!elModal,
      isStop = false,
      isStopSp = false,
      speed = SPEED,
      speedSp = SPEED_SP,
    } = el.dataset.marquee ? JSON.parse(el.dataset.marquee) : {}

    this._isInModal = isInModal
    if (this._isInModal) {
      this._modalId = elModal.id || elModal.dataset.modal
    }
    this.elWrapper = el.querySelector('[data-marquee-wrapper]')
    const elInner = (this.elInner = el.querySelector('[data-marquee-inner]'))
    this.elSingle = el.querySelector('[data-marquee-single]')
    this.isStop = isStop
    this.isStopSp = isStopSp
    this.speed = this.isSp ? speedSp : speed
    this.isManual = 'marqueeManual' in el.dataset

    if ((!this.isSp && this.isStop) || (this.isSp && this.isStopSp)) {
      this.pauseTick()
    } else {
      setTimeout(() => {
        this.setSize()
      }, 100)
    }

    if (isDuplicate) {
      this.elsClone = []
      {
        const clone = this.elSingle.cloneNode(true)
        elInner.append(clone)
        this.elsClone.push(clone)
      }
      {
        const clone = this.elSingle.cloneNode(true)
        elInner.append(clone)
        this.elsClone.push(clone)
      }
      if (isShort) {
        if (!this.isSp) {
          {
            const clone = this.elSingle.cloneNode(true)
            elInner.append(clone)
            this.elsClone.push(clone)
          }
          {
            const clone = this.elSingle.cloneNode(true)
            elInner.append(clone)
            this.elsClone.push(clone)
          }
          {
            const clone = this.elSingle.cloneNode(true)
            elInner.append(clone)
            this.elsClone.push(clone)
          }
          {
            const clone = this.elSingle.cloneNode(true)
            elInner.append(clone)
            this.elsClone.push(clone)
          }
          {
            const clone = this.elSingle.cloneNode(true)
            elInner.append(clone)
            this.elsClone.push(clone)
          }
        } else if (this.isSp) {
          {
            const clone = this.elSingle.cloneNode(true)
            elInner.append(clone)
            this.elsClone.push(clone)
          }
          {
            const clone = this.elSingle.cloneNode(true)
            elInner.append(clone)
            this.elsClone.push(clone)
          }
          {
            const clone = this.elSingle.cloneNode(true)
            elInner.append(clone)
            this.elsClone.push(clone)
          }
        }
      }
    }
  }

  setSize() {
    this._widthSingle =
      this.option.widthSingle || this.elSingle.getBoundingClientRect().width
  }

  onIntersect({ isIntersecting }) {
    if (this.isDestroyed) return
    if (this.isManual || this._isInModal) return
    if ((!this.isSp && this.isStop) || (this.isSp && this.isStopSp)) return

    if (isIntersecting) {
      this.play()
    } else {
      this.pause()
    }
  }

  play() {
    if (!this.elWrapper) return
    if (this._isPlay) return
    this._isPlay = true
    this.elWrapper.style.willChange = 'transform'
    this.playTick()
  }

  pause() {
    if (!this._isPlay) return
    this._isPlay = false
    this.pauseTick()
    if (this.elWrapper) {
      this.elWrapper.style.willChange = ''
    }
  }

  onTick(time) {
    this.elWrapper.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,-${
      (time * this.speed) % this._widthSingle
    },0,0,1)`
  }

  onStartOpenModal(id) {
    if ((!this.isSp && this.isStop) || (this.isSp && this.isStopSp)) return
    setTimeout(() => {
      this.setSize()
    }, 100)
    if (this._isInModal) {
      if (id === this._modalId) {
        this.play()
      }
      return
    }

    this._isPlayPrev = this._isPlay
    if (this._isPlayPrev) {
      this.pause()
    }
  }

  onStartCloseModal() {
    if ((!this.isSp && this.isStop) || (this.isSp && this.isStopSp)) return
    if (this._isPlayPrev) {
      this.play()
      this._isPlayPrev = false
    }
  }

  onCompleteCloseModal() {
    if ((!this.isSp && this.isStop) || (this.isSp && this.isStopSp)) return
    if (this._isInModal) {
      this.pause()
      return
    }
  }

  onDestroy() {
    this.pause()

    if (this.elsClone) {
      this.elsClone.forEach((el, i) => {
        el.remove()
      })
    }

    this._listener = null
  }
}
