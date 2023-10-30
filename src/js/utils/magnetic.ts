export class magneticHover{
  constructor(eventTarget, styleTarget, rateObj={tx:1,ty:1,rx:1,ry:1}){
    this.targetWindow = eventTarget === window
    this.eventTarget = eventTarget
    this.styleTarget = styleTarget
    this.rateObj = rateObj
    this.events = {}
    this.key = 0
    this.waitStop = false
    this.init()
  }

  addListener = function(target, type, listener, capture) {
    if(window.addEventListener) {
      target.addEventListener(type, listener, capture)
    }else if(window.attachEvent){
      target.attachEvent('on' + type, listener)
    }
    this.events[this.key] = {
      target: target,
      type: type,
      listener: listener,
      capture: capture
    }
    return this.key++
  }

  removeListener = function(key) {
    if(key in this.events) {
      let e = this.events[key]
      if(window.removeEventListener) {
        e.target.removeEventListener(e.type, e.listener, e.capture)
      }else if(window.detachEvent){
        e.target.detachEvent('on' + e.type, e.listener)
      }
    }
  }

  init(){
    // Track the mouse position
    this.mousepos = {x: 0, y: 0}
    this.renderedStyles = {
      tx: {previous: 0, current: 0, amt: 0.1},
      ty: {previous: 0, current: 0, amt: 0.1},
      rx: {previous: 0, current: 0, amt: 0.1},
      ry: {previous: 0, current: 0, amt: 0.1}
    }
    this.x = this.y = this.rx = this.ry = 0

    // init events
    this.setEvents()
  }

  lerp = (a, b, n) => (1 - n) * a + n * b

  getMousePos = e => {
    return {
      x : e.clientX,
      y : e.clientY
    }
  }

  distance = (x1,y1,x2,y2) => {
    return Math.hypot(x1 - x2, y1 - y2)
  }

  calculateSizePosition() {
    if(this.targetWindow){
      this.rect = {
        width: window.innerWidth,
        height: window.innerHeight,
        top: 0,
        left: 0
      }
    }else{
      this.rect = this.eventTarget.getBoundingClientRect()
    }
    this.distanceToTrigger = this.rect.width*0.5
  }

  setEvents(){
    if(this.targetWindow){
      this.enterHandle = this.addListener(window, 'mousemove', (event)=>{
        this.enter(event)
      }, {passive: false})
    }else{
      this.enterHandle = this.addListener(this.eventTarget, 'mouseenter', (event)=>{
        this.enter(event)
      }, {passive: true})
    }
  }

  destroy = function(){
    this.removeListener(this.moveHandle)
    this.moveHandle = undefined
    this.removeListener(this.outHandle)
    this.outHandle = undefined
    this.removeListener(this.enterHandle)
    this.enterHandle = undefined
    this.stop()
  }

  start(){
    this.rafId = requestAnimationFrame(()=>{
      this.start()
    })
    this.render()
  }

  stop(){
    cancelAnimationFrame(this.rafId)
    this.rafId = null
  }

  render() {
    // calculate the distance from the mouse to the center of the button
    if (this.waitStop){
      this.x = this.y = this.rx = this.ry = 0;
    }else{
      this.x = (this.mousepos.x - (this.rect.left + this.rect.width/2))*this.rateObj.tx
      this.y = (this.mousepos.y - (this.rect.top + this.rect.height/2))*this.rateObj.ty
      this.rx = -(this.mousepos.y - (this.rect.top + this.rect.height/2))*this.rateObj.rx
      this.ry = (this.mousepos.x - (this.rect.left + this.rect.width/2))*this.rateObj.ry
    }

    this.renderedStyles['tx'].current = this.x
    this.renderedStyles['ty'].current = this.y
    this.renderedStyles['rx'].current = this.rx
    this.renderedStyles['ry'].current = this.ry

    for (const key in this.renderedStyles ) {
      this.renderedStyles[key].previous = this.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].amt);

      if(this.waitStop && Math.abs(this.renderedStyles[key].current - this.renderedStyles[key].previous) < 0.05){
        this.stopBack()
      }
    }
    this.styleTarget.style.transform = `translate3d(${this.renderedStyles['tx'].previous}px, ${this.renderedStyles['ty'].previous}px, 0) rotateX(${this.renderedStyles['rx'].previous}deg) rotateY(${this.renderedStyles['ry'].previous}deg)`
  }

  stopBack(){
    for (const key in this.renderedStyles ) {
      this.renderedStyles[key].previous = this.renderedStyles[key].current
    }
    this.waitStop = false
    this.stop()
  }

  enter(event) {
    this.waitStop = false
    this.stop()

    this.mousepos = {x: 0, y: 0}
    this.renderedStyles = {
      tx: {previous: 0, current: 0, amt: 0.1},
      ty: {previous: 0, current: 0, amt: 0.1},
      rx: {previous: 0, current: 0, amt: 0.1},
      ry: {previous: 0, current: 0, amt: 0.1}
    }
    if(!this.targetWindow){
      this.eventTarget.classList.add('js_hover')
    }

    this.removeListener(this.enterHandle)
    this.enterHandle = undefined

    this.mousepos = this.getMousePos(event)
    this.moveHandle = this.addListener(window, 'mousemove', (event) => {
      this.mousepos = this.getMousePos(event)
    }, {passive: true})
    this.outHandle = this.addListener(this.eventTarget, 'mouseleave', (event)=>{
      this.leave()
    }, {passive: true})
    this.calculateSizePosition()
    this.start()
  }
  leave() {
    this.waitStop = true
    this.eventTarget.classList.remove('js_hover')

    this.removeListener(this.moveHandle)
    this.moveHandle = undefined
    this.removeListener(this.outHandle)
    this.outHandle = undefined
    this.enterHandle = this.addListener(this.eventTarget, 'mouseenter', (event)=>{
      this.enter(event)
    }, {passive: true})
  }
}
