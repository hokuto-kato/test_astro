export default function init({ transitions }) {
  import('~/js/events/load').then(({ init }) => init())
  if (_ENV_.enableEventTick) {
    import('~/js/events/tick').then(({ init }) => init())
  }
  if (_ENV_.enableEventWindow) {
    import('~/js/events/window').then(({ init }) => init())
  }
  if (_ENV_.enableEventScroll) {
    import('~/js/events/scroll').then(({ init }) => init())
  }
  if (_ENV_.enableEventMouse) {
    import('~/js/events/mouse').then(({ init }) => init())
  }
  if (_ENV_.enableEventAsynchronousTransition) {
    import('~/js/events/asynchronousTransition').then(({ init }) =>
      init(transitions)
    )
  }
}
