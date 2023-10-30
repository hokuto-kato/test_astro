export class Video {
  el: HTMLVideoElement
  thumbnailTime = 0
  _promise: Promise<void>
  isPlay = false
  isLoaded = false

  constructor(
    el: HTMLVideoElement | string,
    { thumbnailTime = 0, loop = false, isCrossOrigin = false } = {},
  ) {
    if (typeof el === 'string') {
      const video = document.createElement('video')
      if (isCrossOrigin) {
        video.crossOrigin = 'anonymous'
      }
      video.loop = loop
      video.muted = true
      video.src = el
      this.el = video
    } else {
      this.el = el
    }
    this.thumbnailTime = thumbnailTime

  }

  play() {
    if (this.isPlay) return
    this.isPlay = true
    return (this._promise = this.el.play().catch(() => {
      this.el.currentTime = this.thumbnailTime
    }))
  }

  pause() {
    if (!this.isPlay) return
    this.isPlay = false
    this._promise?.then(() => {
      if (this.isPlay) return
      this.el.pause()
    })
  }

  load(callback) {
    if (this.isLoaded) return
    this.isLoaded = true
    this.el.addEventListener('loadedmetadata', callback)
    this.el.load()
  }

  restart() {
    this.isPlay = false
    this.play()
  }

  getDuration(){
    return this.el.duration
  }
}
