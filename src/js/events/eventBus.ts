export type EventBusListener = (...args: any[]) => void

export type EventBus = {
  _listeners: Record<string, EventBusListener[]>
  emit: (name: string, ...args: any[]) => void
  on: (name: string, listener: EventBusListener) => void
  once: (name: string, listener: EventBusListener) => void
  off: (name: string, listener: EventBusListener) => void
}

const eventBus: EventBus = (window._GLOBAL_.eventBus = window._GLOBAL_
  .eventBus || {
  _listeners: {},

  emit(name, ...args) {
    if (!this._listeners[name]) return
    const listenerCurrent = this._listeners[name].slice()
    for (let i = 0; i < listenerCurrent.length; i++) {
      listenerCurrent[i](...args)
    }
  },

  on(name, listener) {
    if (!this._listeners[name]) {
      this._listeners[name] = []
    }
    this._listeners[name].push(listener)
  },

  once(name, listener) {
    if (!this._listeners[name]) {
      this._listeners[name] = []
    }
    const listenerNew = (...args: any[]) => {
      this.off(name, listenerNew)
      listener(...args)
    }
    this._listeners[name].push(listenerNew)
  },

  off(name, listener) {
    const listenerCurrent = this._listeners[name]
    if (!listenerCurrent || listenerCurrent.length === 0) return

    listenerCurrent.some((value, i) => {
      if (value === listener) {
        listenerCurrent.splice(i, 1)
        return true
      }
      return false
    })
    if (listenerCurrent.length === 0) {
      delete this._listeners[name]
    }
  },
})

export default eventBus
